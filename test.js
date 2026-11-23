// Manual smoke test for the events endpoint.
// Usage: PADABOT_API_KEY=<your key> node test.js
const apiKey = process.env.PADABOT_API_KEY
if (!apiKey) {
  console.error("PADABOT_API_KEY is not set. Export your Padabot API key and re-run.")
  process.exit(1)
}

fetch("https://padabot.netlify.app/api/v1/events", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    category: "bug",
    fields: {
      App: "Visage",
      Issue: "Post not caching properly",
      "Reported By": "Subhan",
    },
  }),
})
  .then(async (res) => console.log(res.status, await res.json()))
  .catch((err) => console.error(err))
