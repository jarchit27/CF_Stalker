import { useEffect, useState } from "react";

export default function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:4000/api/contests");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setContests(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="p-6 text-lg">Loading contests…</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;
  if (!contests.length)
    return <p className="p-6">No upcoming contests found.</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Upcoming Contests</h1>
        <a
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Home
        </a>
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left text-red-600">Platform</th>
              <th className="px-3 py-2 text-left text-blue-600">Name</th>
              <th className="px-3 py-2 text-left text-green-600">Start (IST)</th>
              <th className="px-3 py-2 text-left text-blue-600">Link</th>
            </tr>
          </thead>
          <tbody>
            {contests.map((c, i) => {
              const date = new Date((c.startTimeUnix || 0) * 1000);
              const formatted = date.toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZoneName: 'short'
              });
              return (
                <tr
                  key={i}
                  className={`border-t ${
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-gray-100`}
                >
                  <td className="px-3 py-2 whitespace-nowrap">{c.host}</td>
                  <td className="px-3 py-2">{c.name}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{formatted}</td>
                  <td className="px-3 py-2">
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-green-600 hover:underline"
                    >
                      Go&nbsp;
                      <span className="ml-1">↗</span>
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
