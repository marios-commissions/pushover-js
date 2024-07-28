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
	if (priority === 2) {
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

	const highPriority = msg.content.startsWith('!!');
	const lowPriority = msg.content.startsWith('!');

	if (!highPriority && !lowPriority) return;

	const text = msg.content.slice(highPriority ? 2 : 1, msg.content.length);
	if (!text) return;

	notify(text, highPriority ? 2 : 0);
});

client.login(config.token);
