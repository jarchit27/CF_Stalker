require("dotenv").config();
const axios = require("axios");
const xml2js = require("xml2js");
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
app.use(cors());
const PORT = process.env.PORT || 4000;

/* ------------------------------------------------------------------
   Helpers
-------------------------------------------------------------------*/
let contestData = []; // in‑memory cache

function parseDateToUnix(str) {
  const dt = new Date(str.replace(/\(.*?\)/g, "").trim());
  return isNaN(dt) ? null : Math.floor(dt.getTime() / 1000);
}

function uniqBy(arr, fn) {
  return arr.filter((x, i) => arr.findIndex(y => fn(y) === fn(x)) === i);
}

/* ------------------------------------------------------------------
   1️⃣ Digitomize API (quick JSON source)
-------------------------------------------------------------------*/
async function fetchDigitomize() {
  try {
    const { data } = await axios.get("https://api.digitomize.com/contests", {
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json"
      }
    });

    let list = [];
    if (Array.isArray(data)) list = data;
    else if (Array.isArray(data.contests)) list = data.contests;
    else {
      for (const k in data) if (Array.isArray(data[k])) { list = data[k]; break; }
    }

    const now = Math.floor(Date.now() / 1000);
    return list
      .filter(c => (c.startTimeUnix || c.startTime || c.start_time) > now)
      .map(c => ({
        host: c.platform || c.host || "Digitomize",
        name: c.name || c.title,
        url: c.url || c.link || "https://digitomize.com/contests",
        startTimeUnix: c.startTimeUnix || c.startTime || c.start_time
      }));
  } catch (err) {
    console.error("Digitomize error:", err.message);
    return [];
  }
}

/* ------------------------------------------------------------------
   2️⃣ Codeforces blog ➜ GPT extractor (now *all* posts, no pre‑filter)
-------------------------------------------------------------------*/
async function fetchCodeforcesBlog() {
  // Grab RSS (direct or via proxy)
  const proxies = [
    url => url,
    url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    url => `https://corsproxy.io/?${url}`
  ];
  let rssXml = "";
  for (const p of proxies) {
    try {
      rssXml = await axios.get(p("https://codeforces.com/blog/rss"), { timeout: 15000 }).then(r => r.data);
      if (rssXml.trim().startsWith("<?xml")) break;
    } catch {}
  }
  if (!rssXml) return [];

  let feed;
  try { feed = await xml2js.parseStringPromise(rssXml, { strict: false }); }
  catch { return []; }

  let items = feed.rss?.channel[0]?.item || [];
  if (!Array.isArray(items)) items = [items];

  const contests = [];
  for (const it of items) {
    // Quick guard – skip posts that obviously have nothing to do with contests
    const t = it.title[0] || "";
    if (!/contest|round|cup|challenge|abc|arc|ahc|abc|arc/i.test(t)) continue;

    try {
      const html = await axios.get(it.link[0], { timeout: 10000 }).then(r => r.data);
      const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

      // —— GPT FUNCTION SCHEMA ——
      const fn = {
        name: "extractContestsByOrganizer",
        description: "Return arrays of contests run by CP platforms, colleges and companies.",
        parameters: {
          type: "object",
          properties: {
            platformContests: { type: "array", items: contestObj() },
            collegeContests:  { type: "array", items: contestObj() },
            companyContests:  { type: "array", items: contestObj() }
          },
          required: ["platformContests", "collegeContests", "companyContests"]
        }
      };
      function contestObj() {
        return {
          type: "object",
          properties: {
            name: { type: "string" },
            date: { type: "string" },
            url:  { type: "string" },
            organizer: { type: "string" }
          },
          required: ["name", "date"]
        };
      }

      const chat = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0613",
        messages: [
          {
            role: "system",
            content: "You read full blog posts and extract ALL contest announcements worldwide—grouped into platform, college, and company buckets."
          },
          { role: "user", content: `URL: ${it.link[0]}\n\n${plain}` }
        ],
        functions: [fn],
        function_call: { name: "extractContestsByOrganizer" }
      });

      const args = JSON.parse(chat.choices[0].message.function_call.arguments);
      for (const bucket of ["platformContests", "collegeContests", "companyContests"]) {
        for (const c of args[bucket] || []) {
          const ts = parseDateToUnix(c.date) || parseDateToUnix(it.pubDate?.[0] || "");
          if (!ts) continue;
          contests.push({
            host: c.organizer || bucket.replace("Contests", ""),
            name: c.name,
            url: c.url || it.link[0],
            startTimeUnix: ts
          });
        }
      }
    } catch (err) {
      console.error("GPT extraction error:", err.message);
    }
  }
  return contests;
}

/* ------------------------------------------------------------------
   3️⃣ Fallback (static placeholders)
-------------------------------------------------------------------*/
function fallbackContests() {
  const base = Math.floor(Date.now() / 1000) + 86400;
  return [
    { host: "Fallback", name: "Weekly Coding Contest", url: "#", startTimeUnix: base },
    { host: "Fallback", name: "Hackathon", url: "#", startTimeUnix: base + 86400 }
  ];
}

/* ------------------------------------------------------------------
   Refresher – combine & cache
-------------------------------------------------------------------*/
async function refresh() {
  const [digi, cfBlog] = await Promise.all([
    fetchDigitomize(),
    fetchCodeforcesBlog()
  ]);
  let combined = [...digi, ...cfBlog];
  if (combined.length === 0) combined = fallbackContests();
  combined = uniqBy(combined, x => `${x.name}|${x.startTimeUnix}`);
  combined.sort((a, b) => a.startTimeUnix - b.startTimeUnix);
  contestData = combined;
  console.log("✓ Cached", combined.length, "contests");
}

/* ------------------------------------------------------------------
   API Endpoints
-------------------------------------------------------------------*/
app.get("/api/contests", (_, res) => res.json(contestData));
app.get("/healthcheck", (_, res) => res.json({ status: "ok", contestsLoaded: contestData.length }));

/* ------------------------------------------------------------------
   Start server
-------------------------------------------------------------------*/
app.listen(PORT, async () => {
  console.log(`Contest aggregator running on http://localhost:${PORT}`);
  await refresh();
  setInterval(refresh, 600000); // refresh every 10 min
});
