require("dotenv").config();
const config = require("./config.json");
const mongoose = require("mongoose");

mongoose
  .connect(config.connectString, {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

const express  = require("express");
const cors     = require("cors");
const jwt      = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");

const User    = require("./models/user.model");
const Friend  = require("./models/friend.model");
const Problem = require("./models/problem.model");

const app  = express();
const PORT = process.env.PORT || 8000;

// ——— MIDDLEWARE ———
app.use(cors({ origin: "*" }));
app.use(express.json());

// ——— AUTH ROUTES ———
app.post("/create-account", async (req, res) => {
  const { fullname, codeforcesHandle, email, password } = req.body || {};
  if (!fullname)         return res.status(400).json({ error:true, message:"Full Name is required" });
  if (!codeforcesHandle) return res.status(400).json({ error:true, message:"Handle is required" });
  if (!email)            return res.status(400).json({ error:true, message:"Email is required" });
  if (!password)         return res.status(400).json({ error:true, message:"Password is required" });

  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ error:true, message:"User already exists" });

    const user = new User({ fullname, codeforcesHandle, email, password });
    await user.save();

    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "36000m",
    });
    res.json({ error:false, user, accessToken, message:"Registration Successful" });
  } catch (err) {
    console.error("Error in /create-account:", err);
    res.status(500).json({ error:true, message:err.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email)    return res.status(400).json({ error:true, message:"Email is required" });
  if (!password) return res.status(400).json({ error:true, message:"Password is required" });

  try {
    const userInfo = await User.findOne({ email });
    if (!userInfo)
      return res.status(404).json({ error:true, message:"User not found" });

    if (userInfo.password !== password)
      return res.status(401).json({ error:true, message:"Wrong Credentials" });

    const accessToken = jwt.sign({ user:userInfo }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "36000m",
    });
    res.json({ error:false, message:"Login Successful", email, accessToken });
  } catch (err) {
    console.error("Error in /login:", err);
    res.status(500).json({ error:true, message:err.message });
  }
});

app.get("/get-user", authenticateToken, async (req, res) => {
  const { user } = req.user;
  try {
    const isUser = await User.findById(user._id);
    if (!isUser) return res.status(404).end();
    res.json({
      user: {
        fullname: isUser.fullname,
        codeforcesHandle: isUser.codeforcesHandle,
        email: isUser.email,
        _id: isUser._id,
      },
    });
  } catch (err) {
    console.error("Error in /get-user:", err);
    res.status(500).json({ error:true, message:err.message });
  }
});

// ——— FRIEND ROUTES ———
app.post("/add-friend", authenticateToken, async (req, res) => {
  const { handle, name } = req.body || {};
  const { user } = req.user;
  if (!handle) return res.status(400).json({ error:true, message:"Handle is required" });
  if (!name)   return res.status(400).json({ error:true, message:"Friend name is required" });

  try {
    const friend = new Friend({ handle, name, userId: user._id });
    await friend.save();
    res.json({ error:false, friend, message:"Friend added successfully" });
  } catch (err) {
    // Handle duplicate (userId + handle) error
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error:true, message:"You’ve already added that friend handle" });
    }
    console.error("Error in /add-friend:", err);
    res.status(500).json({ error:true, message:err.message });
  }
});

app.put("/edit-friend/:friendId", authenticateToken, async (req, res) => {
  const { friendId } = req.params;
  const { handle, name } = req.body || {};
  const { user } = req.user;
  if (!handle && !name)
    return res.status(400).json({ error:true, message:"Nothing to update" });

  try {
    const friend = await Friend.findOne({ _id:friendId, userId:user._id });
    if (!friend)
      return res.status(404).json({ error:true, message:"Friend not found" });

    if (handle) friend.handle = handle;
    if (name)   friend.name = name;
    await friend.save();

    res.json({ error:false, friend, message:"Friend updated successfully" });
  } catch (err) {
    console.error("Error in /edit-friend:", err);
    res.status(500).json({ error:true, message:err.message });
  }
});

app.delete("/delete-friend/:friendId", authenticateToken, async (req, res) => {
  const { friendId } = req.params;
  const { user } = req.user;

  try {
    const friend = await Friend.findOne({ _id:friendId, userId:user._id });
    if (!friend)
      return res.status(404).json({ error:true, message:"Friend not found" });

    await Friend.deleteOne({ _id:friendId, userId:user._id });
    res.json({ error:false, message:"Friend deleted successfully" });
  } catch (err) {
    console.error("Error in /delete-friend:", err);
    res.status(500).json({ error:true, message:err.message });
  }
});

app.get("/get-all-friends", authenticateToken, async (req, res) => {
  const { user } = req.user;
  try {
    const friends = await Friend.find({ userId:user._id });
    res.json({ error:false, friends, message:"Fetched all friends" });
  } catch (err) {
    console.error("Error in /get-all-friends:", err);
    res.status(500).json({ error:true, message:err.message });
  }
});

// ——— PROBLEM ROUTES ———
app.post("/add-problem", authenticateToken, async (req, res) => {
  const { questionName, platform, difficulty, questionLink, notes, tags } = req.body || {};
  const { user } = req.user;
  if (!questionName)  return res.status(400).json({ error:true, message:"Question Name is required" });
  if (!platform)      return res.status(400).json({ error:true, message:"Platform is required" });
  if (!difficulty)    return res.status(400).json({ error:true, message:"Difficulty is required" });
  if (!questionLink)  return res.status(400).json({ error:true, message:"Question Link is required" });
  if (!notes)         return res.status(400).json({ error:true, message:"Notes are required" });

  try {
    const problem = new Problem({
      questionName,
      platform,
      difficulty,
      questionLink,
      notes,
      tags: tags || [],
      userId: user._id,
    });
    await problem.save();
    res.json({ error:false, problem, message:"Problem added successfully" });
  } catch (err) {
    console.error("Error in /add-problem:", err);
    res.status(500).json({ error:true, message:err.message });
  }
});

app.delete("/delete-problem/:problemId", authenticateToken, async (req, res) => {
  const { problemId } = req.params;
  const { user } = req.user;

  try {
    const problem = await Problem.findOne({ _id:problemId, userId:user._id });
    if (!problem)
      return res.status(404).json({ error:true, message:"Problem not found" });

    await Problem.deleteOne({ _id:problemId, userId:user._id });
    res.json({ error:false, message:"Problem deleted successfully" });
  } catch (err) {
    console.error("Error in /delete-problem:", err);
    res.status(500).json({ error:true, message:err.message });
  }
});

app.get("/get-all-problems", authenticateToken, async (req, res) => {
  const { user } = req.user;
  try {
    const problems = await Problem.find({ userId:user._id });
    res.json({ error:false, problems, message:"Fetched all problems" });
  } catch (err) {
    console.error("Error in /get-all-problems:", err);
    res.status(500).json({ error:true, message:err.message });
  }
});

// ——— START SERVER ———
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});

module.exports = app;
