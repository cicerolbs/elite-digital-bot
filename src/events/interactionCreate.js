// Em: src/events/interactionCreate.js

// MUDANÇA AQUI: Adicionamos MessageFlags
const { Events, MessageFlags } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Comando não encontrado: ${interaction.commandName}`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            // MUDANÇAS AQUI: Trocamos 'ephemeral: true' por 'flags'
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp({ content: 'Ocorreu um erro ao executar este comando!', flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: 'Ocorreu um erro ao executar este comando!', flags: MessageFlags.Ephemeral });
            }
        }
    },
};

