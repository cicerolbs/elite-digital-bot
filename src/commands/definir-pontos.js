// Em: src/commands/definir-pontos.js

const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const User = require('../models/User.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('definir-pontos')
        .setDescription('[Admin] Define um valor exato de pontos para um usuário.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('O usuário que terá os pontos definidos.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('valor')
                .setDescription('O valor exato de pontos que o usuário terá.')
                .setRequired(true)
                .setMinValue(0)), // Impede a definição de pontos negativos

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(config.adminRoleId)) {
            return interaction.reply({ 
                content: 'Você não tem permissão para usar este comando.', 
                flags: MessageFlags.Ephemeral 
            });
        }

        const targetUser = interaction.options.getUser('usuario');
        const pointsToSet = interaction.options.getInteger('valor');

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            // Encontra o usuário no DB ou cria um novo, e define o valor de pontos.
            // A ausência do operador '$inc' significa que estamos definindo o valor diretamente.
            const updatedUser = await User.findOneAndUpdate(
                { userId: targetUser.id },
                { points: pointsToSet },
                { upsert: true, new: true }
            );

            await interaction.editReply(`✅ O saldo de pontos de ${targetUser.username} foi definido para **${Math.floor(updatedUser.points)}**.`);

        } catch (error) {
            console.error("Erro ao definir pontos:", error);
            await interaction.editReply('❌ Ocorreu um erro ao tentar definir os pontos.');
        }
    },
};
