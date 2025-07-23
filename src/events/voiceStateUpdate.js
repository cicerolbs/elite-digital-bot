const { Events } = require('discord.js');
const config = require('../../config.json');
const User = require('../models/User.js');

// Função para calcular os pontos e atualizar o DB
async function endVoiceSession(client, userId, session) {
    if (!session) return;

    const now = Date.now();
    const durationInMs = now - session.joinTime;

    const { studyChannelIds, socialChannelIds, pointsPerHour } = config.voiceConfig;
    let pointsRate = 0;

    if (studyChannelIds.includes(session.channelId)) {
        pointsRate = pointsPerHour.study;
    } else if (socialChannelIds.includes(session.channelId)) {
        pointsRate = pointsPerHour.social;
    }

    if (pointsRate > 0) {
        const pointsToAdd = (durationInMs / (1000 * 60 * 60)) * pointsRate;
        if (pointsToAdd > 0) {
            try {
                await User.findOneAndUpdate(
                    { userId: userId },
                    { $inc: { points: pointsToAdd } },
                    { upsert: true }
                );
                console.log(`[PONTOS/VOZ] Adicionado ${pointsToAdd.toFixed(2)} pontos para o usuário ${userId}.`);
            } catch (error) {
                console.error(`[PONTOS/VOZ] Erro ao adicionar pontos para ${userId}:`, error);
            }
        }
    }

    client.voiceSessions.delete(userId);
}

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState, client) {
        const userId = newState.id;
        const oldChannelId = oldState.channelId;
        const newChannelId = newState.channelId;
        const userSession = client.voiceSessions.get(userId);

        const isAfk = newState.serverDeaf || newState.serverMute;

        // CASO 1: Usuário entrou em uma call ou trocou de call
        if (newChannelId && newChannelId !== oldChannelId) {
            // Se já estava em uma sessão (trocou de call), encerra a sessão antiga primeiro
            if (userSession) {
                await endVoiceSession(client, userId, userSession);
            }
            // Se não está AFK, inicia uma nova sessão
            if (!isAfk) {
                const { studyChannelIds, socialChannelIds } = config.voiceConfig;
                if (studyChannelIds.includes(newChannelId) || socialChannelIds.includes(newChannelId)) {
                    client.voiceSessions.set(userId, { joinTime: Date.now(), channelId: newChannelId });
                }
            }
        }

        // CASO 2: Usuário ficou AFK (server mute/deafen)
        if (isAfk && userSession) {
            await endVoiceSession(client, userId, userSession);
        }

        // CASO 3: Usuário voltou de AFK (tirou o server mute/deafen) na mesma call
        if (!isAfk && newChannelId && !userSession) {
             const { studyChannelIds, socialChannelIds } = config.voiceConfig;
             if (studyChannelIds.includes(newChannelId) || socialChannelIds.includes(newChannelId)) {
                client.voiceSessions.set(userId, { joinTime: Date.now(), channelId: newChannelId });
             }
        }

        // CASO 4: Usuário saiu de uma call
        if (oldChannelId && !newChannelId) {
            if (userSession) {
                await endVoiceSession(client, userId, userSession);
            }
        }
    },
};
