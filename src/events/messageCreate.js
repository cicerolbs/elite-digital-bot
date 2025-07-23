const { Events } = require('discord.js');
const config = require('../../config.json');
const User = require('../models/User.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (message.author.bot || message.channel.id !== config.generalChatId) {
            return;
        }

        const cooldownAmount = (config.messageCooldownSeconds || 30) * 1000;
        const now = Date.now();

        if (client.messageCooldowns.has(message.author.id)) {
            const expirationTime = client.messageCooldowns.get(message.author.id) + cooldownAmount;
            if (now < expirationTime) {
                if (!client.cooldownNotified.has(message.author.id)) {
                    try {
                        const timeLeft = ((expirationTime - now) / 1000).toFixed(0);
                        await message.author.send(`Você está em cooldown! Aguarde mais **${timeLeft} segundos** para ganhar pontos por mensagem novamente.`);
                        client.cooldownNotified.set(message.author.id, true);
                    } catch (dmError) {
                        console.log(`[AVISO] Não foi possível enviar DM de cooldown para ${message.author.tag}.`);
                    }
                }
                return;
            }
        }

        client.cooldownNotified.delete(message.author.id);
        client.messageCooldowns.set(message.author.id, now);

        try {
            await User.findOneAndUpdate(
                { userId: message.author.id },
                { $inc: { points: config.pointsPerMessage } },
                { upsert: true, new: true }
            );
        } catch (error) {
            console.error('[PONTOS/MENSAGEM] Erro ao adicionar pontos:', error);
        }
    },
};
