// Em: src/commands/rank.js

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/User.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Mostra o ranking dos 10 membros com mais pontos.'),

    async execute(interaction) {
        await interaction.deferReply();

        const rankedUsers = await User.find().sort({ points: -1 }).limit(10);

        if (rankedUsers.length === 0) {
            return interaction.editReply('Ainda não há um ranking para ser exibido. Interaja no chat para começar!');
        }

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🏆 Ranking de Pontos - Elite Digital')
            .setTimestamp()
            .setFooter({ text: 'Continue interagindo para subir no rank!' });

        // --- LÓGICA DA TABELA (AJUSTE FINAL) ---
        const rankStrings = [];
        const memberStrings = [];
        const pointsStrings = [];

        for (let i = 0; i < rankedUsers.length; i++) {
            const dbUser = rankedUsers[i];
            const member = await interaction.guild.members.fetch(dbUser.userId).catch(() => null);

            // Coluna 1: Posição (com medalhas ou número em negrito)
            rankStrings.push(getRankDisplay(i));

            // Coluna 2: Membro
            memberStrings.push(member ? member.displayName.substring(0, 20) : 'Membro não encontrado');

            // Coluna 3: Pontos
            pointsStrings.push(`**${Math.floor(dbUser.points)}**`);
        }

        embed.addFields(
            { name: 'Pos.', value: rankStrings.join('\n'), inline: true },
            { name: 'Membro', value: memberStrings.join('\n'), inline: true },
            { name: 'Pontos', value: pointsStrings.join('\n'), inline: true }
        );

        await interaction.editReply({ embeds: [embed] });
    },
};

// Função auxiliar APRIMORADA para a posição
function getRankDisplay(index) {
    const i = index + 1;
    if (i === 1) return '🥇';
    if (i === 2) return '🥈';
    if (i === 3) return '🥉';
    return `**${i}**`; // Apenas o número em negrito para os outros
}
