require("dotenv").config();
const fs = require("fs");
const { Client, GatewayIntentBits } = require("discord.js");

const DATA_FILE = "./src/data.json";

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    return { users: {}, events: [] };
  }

  const raw = fs.readFileSync(DATA_FILE, "utf8");

  try {
    const data = JSON.parse(raw);
    return {
      users: data.users || {},
      events: data.events || []
    };
  } catch (e) {
    return { users: {}, events: [] };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent 
  ]
});

client.once("clientReady", (client) => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  console.log("MESSAGE RECEIVED:", message.content);
  if (message.author.bot) return;

  // !settimezone command
  if (message.content.startsWith("!settimezone")) {
    const args = message.content.split(" ");
    const timezone = args[1];

    if (!timezone) {
      return message.reply("❌ Usage: !settimezone Africa/Tunis");
    }

    const validTimezones = Intl.supportedValuesOf("timeZone");

    if (!validTimezones.includes(timezone)) {
      return message.reply("❌ Invalid timezone. Example: Africa/Tunis");
    }

    const data = loadData();
    data.users[message.author.id] = timezone;
    saveData(data);

    return message.reply(`✅ Timezone set to **${timezone}**`);
  }
  // !mytimezone command 
  if (message.content === "!mytimezone") {
    const data = loadData();
    const tz = data.users[message.author.id];

    if (!tz) {
      return message.reply("❌ You haven't set a timezone yet.");
    }

    return message.reply(`🕒 Your timezone is **${tz}**`);
  }

  // !ping test
  if (message.content === "!ping") {
    return message.reply("pong 🏓");
  }
});

client.login(process.env.DISCORD_TOKEN);