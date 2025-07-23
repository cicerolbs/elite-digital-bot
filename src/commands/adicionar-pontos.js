// Em: src/commands/adicionar-pontos.js

const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const User = require('../models/User.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adicionar-pontos')
        .setDescription('[Admin] Adiciona pontos a um usuário específico.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('O usuário que receberá os pontos.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('quantidade')
                .setDescription('A quantidade de pontos a ser adicionada.')
                .setRequired(true)
                .setMinValue(1)),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(config.adminRoleId)) {
            return interaction.reply({ 
                content: 'Você não tem permissão para usar este comando.', 
                flags: MessageFlags.Ephemeral 
            });
        }

        const targetUser = interaction.options.getUser('usuario');
        const pointsToAdd = interaction.options.getInteger('quantidade');

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const updatedUser = await User.findOneAndUpdate(
                { userId: targetUser.id },
                { $inc: { points: pointsToAdd } },
                { upsert: true, new: true }
            );

            await interaction.editReply(`✅ **${pointsToAdd}** pontos foram adicionados com sucesso para ${targetUser.username}. Novo saldo: **${Math.floor(updatedUser.points)}** pontos.`);

        } catch (error) {
            console.error("Erro ao adicionar pontos:", error);
            await interaction.editReply('❌ Ocorreu um erro ao tentar adicionar os pontos.');
        }
    },
};
