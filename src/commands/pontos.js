// Em: src/commands/pontos.js

// MUDANÇA AQUI: Adicionamos MessageFlags
const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const User = require('../models/User.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pontos')
        .setDescription('Mostra quantos pontos você acumulou.'),

    async execute(interaction) {
        try {
            // MUDANÇA AQUI: Trocamos 'ephemeral: true' por 'flags'
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            let user = await User.findOne({ userId: interaction.user.id });

            if (!user) {
                user = new User({
                    userId: interaction.user.id,
                });
                await user.save();
                console.log(`[BANCO DE DADOS] Novo usuário criado: ${interaction.user.tag}`);
            }

            await interaction.editReply(`Olá, ${interaction.user.username}! Você possui **${Math.floor(user.points)}** pontos.`);

        } catch (error) {
            console.error('Erro ao executar o comando /pontos:', error);
            await interaction.editReply('Ocorreu um erro ao consultar seus pontos. Tente novamente mais tarde.');
        }
    },
};
