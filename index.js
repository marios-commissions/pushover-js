const { Client, IntentsBitField } = require('discord.js');
const config = require('./config.json');


async function notify(message, priority) {
	console.log(`Notifying "${message}" with priority ${priority}.`);

	const url = new URL('https://api.pushover.net/1/messages.json');

	url.searchParams.set('token', config.api);
	url.searchParams.set('user', config.user);
	url.searchParams.set('message', message);
	url.searchParams.set('priority', priority);

	if (priority === '2') {
		url.searchParams.set('retry', '30');
		url.searchParams.set('expire', '600');
	}


	const res = await fetch(url, { method: 'POST' });

	console.log('Got response:', await res.text());
}

const client = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.MessageContent,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.DirectMessages,
	]
});

client.on('ready', () => {
	console.log(`Logged in as ${client.user.username}. Listening for messages in ${config.channels.join(', ')}.`);
});

client.on('messageCreate', (msg) => {
	if (!msg.content.includes('!') || !config.channels.includes(msg.channel.id)) {
		return;
	}

	const highPriority = msg.content.indexOf('!!');
	const lowPriority = msg.content.indexOf('!');

	if (!~highPriority && !~lowPriority) return;

	const text = msg.content.slice(~highPriority ? highPriority : lowPriority, msg.content.length);
	if (!text) return;

	const priority = text.startsWith('!!') ? 2 : 0;
	const message = text.slice(priority === 2 ? 2 : 1, text.length);
	if (!message) return;

	notify(message, priority);
});

client.login(config.token);