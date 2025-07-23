// Em: src/commands/remover-pontos.js

const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const User = require('../models/User.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remover-pontos')
        .setDescription('[Admin] Remove pontos de um usuário específico.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('O usuário que perderá os pontos.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('quantidade')
                .setDescription('A quantidade de pontos a ser removida.')
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
        const pointsToRemove = interaction.options.getInteger('quantidade');

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            // Primeiro, encontramos o usuário no banco de dados.
            let user = await User.findOne({ userId: targetUser.id });

            // Se o usuário não for encontrado ou já tiver 0 pontos, não há o que remover.
            if (!user || user.points === 0) {
                return interaction.editReply(`O usuário ${targetUser.username} não possui pontos para remover.`);
            }

            // Subtrai os pontos e garante que o saldo não fique negativo
            user.points = Math.max(0, user.points - pointsToRemove);

            // Salva a alteração
            await user.save();

            await interaction.editReply(`✅ **${pointsToRemove}** pontos foram removidos com sucesso de ${targetUser.username}. Novo saldo: **${Math.floor(user.points)}** pontos.`);

        } catch (error) {
            console.error("Erro ao remover pontos:", error);
            await interaction.editReply('❌ Ocorreu um erro ao tentar remover os pontos.');
        }
    },
};
