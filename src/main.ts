import { config } from "dotenv";
config()
import "reflect-metadata";
import { Intents, Interaction, Message } from "discord.js";
import { Client } from "discordx";
import { dirname, importx } from "@discordx/importer";
import express from 'express';

const app = express();
app.use(express.json());
const start = new Date();
app.get("/",(_req,res)=>{
  return res.json("Hello World!");
})
app.get("/staus",(_req,res)=>{
  return res.json("Ok");
})
//uptime
app.get("/uptime",(_req,res)=>{
  const uptime = new Date().getTime() - start.getTime();
  const utime = {
    days: Math.floor(uptime / (1000 * 60 * 60 * 24)),
    hours: Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((uptime % (1000 * 60)) / 1000)
  }
  return res.json(utime);
})

export const client = new Client({
  simpleCommand: {
    prefix: "!",
  },
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
  ],
  // If you only want to use global commands only, comment this line
  // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
});

client.once("ready", async () => {
  // make sure all guilds are in cache
  await client.guilds.fetch();

  // init all application commands
  await client.initApplicationCommands({
    guild: { log: true },
    global: { log: true },
  });

  // init permissions; enabled log to see changes
  await client.initApplicationPermissions(true);

  // uncomment this line to clear all guild commands,
  // useful when moving to global commands from guild commands
   await client.clearApplicationCommands(
     ...client.guilds.cache.map((g) => g.id)
   );

  console.log("Bot started");
});

client.on("interactionCreate", (interaction: Interaction) => {
  client.executeInteraction(interaction);
});

client.on("messageCreate", (message: Message) => {
  client.executeCommand(message);
});

async function run() {
  // with cjs
  // await importx(__dirname + "/{events,commands}/**/*.{ts,js}");
  // with ems
  await importx(
    dirname(import.meta.url) + "/{events,commands,api}/**/*.{ts,js}"
  );

  // let's start the bot
  if (!process.env.BOT_TOKEN) {
    throw Error("Could not find BOT_TOKEN in your environment");
  }

  await client.login(process.env.BOT_TOKEN); // provide your bot token
}

run();
app.listen(process.env.PORT||3000,()=>{
  console.log("Server started! on port ",process.env.PORT||3000);
});