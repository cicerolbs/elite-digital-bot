// Em: src/commands/configurar-caixa.js
const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('configurar-caixa')
        .setDescription('[Admin] Altera o intervalo de horas para o drop da Caixa Misteriosa.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addIntegerOption(option =>
            option.setName('horas')
                .setDescription('O novo intervalo em horas entre cada caixa (ex: 1 para toda hora, 2 para cada 2 horas).')
                .setRequired(true)
                .setMinValue(1)),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(config.adminRoleId)) {
            return interaction.reply({ content: 'Você não tem permissão para usar este comando.', flags: MessageFlags.Ephemeral });
        }

        const newInterval = interaction.options.getInteger('horas');

        try {
            // Carrega o arquivo config.json para edição
            const configPath = path.join(__dirname, '..', '..', 'config.json');
            const configFile = fs.readFileSync(configPath, 'utf8');
            const configData = JSON.parse(configFile);

            // Altera o valor
            configData.mysteryBox.intervalHours = newInterval;

            // Salva o arquivo de volta no disco
            fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

            await interaction.reply({ 
                content: `✅ Intervalo da Caixa Misteriosa alterado para **${newInterval} hora(s)**.\n\n**IMPORTANTE:** Você precisa **reiniciar o bot** para que o novo agendamento entre em vigor. Use \`pm2 restart elite-bot\`.`,
                flags: MessageFlags.Ephemeral 
            });

        } catch (error) {
            console.error("Erro ao configurar a caixa:", error);
            await interaction.reply({ content: '❌ Ocorreu um erro ao tentar alterar a configuração.', flags: MessageFlags.Ephemeral });
        }
    },
};
