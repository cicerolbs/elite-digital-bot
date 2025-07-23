// Em: src/commands/trocar-pontos.js
const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const User = require('../models/User.js');
const Giveaway = require('../models/Giveaway.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trocar-pontos')
        .setDescription('Troca seus pontos por tickets para o sorteio ativo!')
        .addIntegerOption(option =>
            option.setName('tickets')
                .setDescription('O número de tickets que você deseja comprar.')
                .setRequired(true)
                .setMinValue(1)),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const ticketsToBuy = interaction.options.getInteger('tickets');
        const costPerEntry = config.giveawayConfig.pointsPerEntry;
        const totalCost = ticketsToBuy * costPerEntry;

        const activeGiveaway = await Giveaway.findOne({ guildId: interaction.guild.id, isActive: true });
        if (!activeGiveaway) {
            return interaction.editReply('Não há nenhum sorteio ativo no momento para comprar tickets.');
        }

        const user = await User.findOne({ userId: interaction.user.id });
        if (!user || user.points < totalCost) {
            return interaction.editReply(`Você não tem pontos suficientes! Você precisa de **${totalCost}** pontos, mas possui apenas **${Math.floor(user?.points || 0)}**.`);
        }

        // Subtrai os pontos do usuário
        user.points -= totalCost;
        await user.save();

        // Adiciona as entradas ao sorteio
        const userEntries = Array(ticketsToBuy).fill(interaction.user.id);
        activeGiveaway.entries.push(...userEntries);
        await activeGiveaway.save();

        await interaction.editReply(`✅ Você comprou **${ticketsToBuy}** ticket(s) para o sorteio do(a) **${activeGiveaway.prize}** por **${totalCost}** pontos! Boa sorte!`);
    },
};
