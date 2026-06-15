require("dotenv").config();
const fs = require("fs");
const { Client, GatewayIntentBits } = require("discord.js");

const DATA_FILE = "./src/data.json";

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    return { users: {}, events: [] };
  }

  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));

  return {
    users: data.users || {},
    events: data.events || []
  };
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("clientReady", (client) => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // /ping
  if (interaction.commandName === "ping") {
    return interaction.reply("pong 🏓");
  }

  // /settimezone
  if (interaction.commandName === "settimezone") {
  const timezone = interaction.options.getString("timezone");

  console.log("TZ INPUT:", timezone);

  const validTimezones = Intl.supportedValuesOf("timeZone");

  if (!validTimezones.includes(timezone)) {
    return interaction.reply("❌ Invalid timezone (use e.g. Africa/Tunis)");
  }

  const data = loadData();

  if (!data.users) data.users = {};

  data.users[interaction.user.id] = timezone;

  saveData(data);

  return interaction.reply(`✅ Timezone set to **${timezone}**`);
}

  // /mytimezone
  if (interaction.commandName === "mytimezone") {
  const data = loadData();

  const tz = data.users?.[interaction.user.id];

  if (!tz) {
    return interaction.reply("❌ You haven't set a timezone yet.");
  }

  return interaction.reply(`🕒 Your timezone is **${tz}**`);
}

  // /events
  if (interaction.commandName === "events") {
    const data = loadData();

    const userTz = data.users[interaction.user.id];

    if (!userTz) {
      return interaction.reply(
        "❌ Set your timezone first using /settimezone"
      );
    }

    if (data.events.length === 0) {
      return interaction.reply("📭 No events yet.");
    }

    const formatted = data.events.map((event, i) => {
      const utcDate = new Date(event.utcTime);

      const localTime = new Intl.DateTimeFormat("en-US", {
        timeZone: userTz,
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(utcDate);

      return `${i + 1}. ${event.name} — ${localTime}`;
    });

    return interaction.reply(
      `📅 Events for **${userTz}**:\n${formatted.join("\n")}`
    );
  }
});

client.on("error", console.error);

client.on("warn", console.warn);

process.on("unhandledRejection", console.error);

client.login(process.env.DISCORD_TOKEN);