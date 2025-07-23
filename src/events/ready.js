const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`---\nBot ${client.user.tag} está online!\n---`);
        client.user.setActivity('a Elite Digital', { type: 3 }); // Watching
    },
};
