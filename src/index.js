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

  if (message.content.startsWith("!event ")) {
  const args = message.content.split(" ");

  const name = args[1];
  const date = args[2];
  const time = args[3];

  if (!name || !date || !time) {
    return message.reply("❌ Usage: !event Name YYYY-MM-DD HH:MM");
  }

  const utcDate = new Date(`${date}T${time}:00Z`);

  if (isNaN(utcDate.getTime())) {
    return message.reply("❌ Invalid date/time format.");
  }

  const data = loadData();

  data.events.push({
    name,
    utcTime: utcDate.toISOString(),
    creator: message.author.id
  });

  saveData(data);

  return message.reply(
    `📅 Event **${name}** created for **${utcDate.toUTCString()}**`
  );
}

if (message.content === "!events") {
  const data = loadData();
  const userTz = data.users[message.author.id];

  if (!userTz) {
    return message.reply("❌ Set your timezone first using !settimezone");
  }

  if (data.events.length === 0) {
    return message.reply("📭 No events yet.");
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

    return `${i + 1}. **${event.name}** — ${localTime}`;
  });

  return message.reply(
    `📅 Events for **${userTz}**:\n` + formatted.join("\n")
  );
}

});

client.login(process.env.DISCORD_TOKEN);