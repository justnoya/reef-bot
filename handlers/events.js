const { readdirSync } = require("fs");
const path = require("path");
const ascii = require("ascii-table");

let table = new ascii("Events");
table.setHeading("Events", "Load status");

module.exports = (client) => {
  const eventsDir = path.join(__dirname, "..", "events");
  const files = readdirSync(eventsDir).filter(file => file.endsWith(".js"));

  for (const file of files) {
    try {
      const pull = require(path.join(eventsDir, file));

      if (pull.event && typeof pull.event !== "string") {
        table.addRow(file, "❌ -> Property event should be a string.");
        continue;
      }

      pull.event = pull.event || file.replace(".js", "");
      client.on(pull.event, pull.run.bind(null, client));
      table.addRow(file, "✅");
    } catch (err) {
      console.error(`[Events Handler] Failed to load ${file}:`, err);
      table.addRow(file, `❌ -> ${err.message}`);
    }
  }
};
