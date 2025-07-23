// Em: src/commands/caixa.js

// MUDANÇA AQUI: Adicionamos MessageFlags
const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const User = require('../models/User.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('caixa')
        .setDescription('Tenta resgatar uma caixa misteriosa para ganhar pontos extras!'),

    async execute(interaction) {
        const client = interaction.client;

        if (!client.mysteryBoxStatus || !client.mysteryBoxStatus.active) {
            // MUDANÇA AQUI: Trocamos 'ephemeral: true' por 'flags'
            return interaction.reply({ content: 'Nenhuma caixa misteriosa está disponível no momento. Fique de olho no chat!', flags: MessageFlags.Ephemeral });
        }

        client.mysteryBoxStatus.active = false;

        const { min, max } = config.mysteryBox.reward;
        const pointsWon = Math.floor(Math.random() * (max - min + 1)) + min;

        try {
            await User.findOneAndUpdate(
                { userId: interaction.user.id },
                { $inc: { points: pointsWon } },
                { upsert: true }
            );

            await interaction.reply(`🎉 Parabéns, ${interaction.user}! Você resgatou a caixa misteriosa e ganhou **${pointsWon}** pontos!`);

        } catch (error) {
            console.error("Erro ao resgatar a caixa misteriosa:", error);
            // MUDANÇA AQUI: Trocamos 'ephemeral: true' por 'flags'
            await interaction.reply({ content: 'Ocorreu um erro ao processar seu prêmio. Tente novamente.', flags: MessageFlags.Ephemeral });
            client.mysteryBoxStatus.active = true; 
        }
    },
};
