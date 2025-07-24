import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __dirname = fileURLToPath(new URL('.', import.meta.url));

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  console.log(`Loading command file: ${file}`);
  const command = await import(filePath);
  console.log(`Command loaded:`, command);
  if (!command.default || !command.default.data) {
    console.error(`Command file ${file} does not have proper default export with data property`);
    continue;
  }
  client.commands.set(command.default.data.name, command.default);
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = await import(filePath);
  if (event.default.once) {
    client.once(event.default.name, (...args) => event.default.execute(...args, client));
  } else {
    client.on(event.default.name, (...args) => event.default.execute(...args, client));
  }
}

if (!process.env.DISCORD_TOKEN) {
  console.error('Error: DISCORD_TOKEN is not defined in the environment variables.');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

const GUILD_ID = process.env.GUILD_ID; // Add your guild ID to the .env file

async function registerCommands() {
  const commands = client.commands.map(command => command.data.toJSON());
  try {
    console.log('Clearing all existing commands...');
    
    // Clear global commands
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: [] }
    );
    console.log('Cleared global commands');

    // Clear guild commands
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, GUILD_ID),
      { body: [] }
    );
    console.log('Cleared guild commands');

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Registering new commands...');
    console.log('Commands to register:', commands.map(cmd => cmd.name));

    // Register guild commands only (faster and avoids global duplicates)
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, GUILD_ID),
      { body: commands }
    );

    console.log('Successfully registered commands for guild.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

client.once('ready', async () => {
  console.log(`Bot is online as ${client.user.tag}`);
  await registerCommands();
});

client.login(process.env.DISCORD_TOKEN);
