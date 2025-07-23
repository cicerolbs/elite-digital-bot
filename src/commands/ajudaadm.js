// Em: src/commands/ajudaadm.js (VERSÃO CORRIGIDA)

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ajudaadm')
        .setDescription('[Admin] Mostra os comandos de administração do bot.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(config.adminRoleId)) {
            return interaction.reply({ 
                content: 'Você não tem permissão para usar este comando.', 
                flags: MessageFlags.Ephemeral 
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#FF4500') // Laranja avermelhado
            .setTitle('🛠️ Comandos de Administração - PontosElite')
            .setDescription('Lista de comandos disponíveis para a moderação. Use com sabedoria!')
            .addFields(
                { name: '`/adicionar-pontos <usuario> <quantidade>`', value: 'Adiciona pontos a um membro.' },
                { name: '`/remover-pontos <usuario> <quantidade>`', value: 'Remove pontos de um membro.' },
                { name: '`/definir-pontos <usuario> <valor>`', value: 'Define o saldo de pontos de um membro para um valor exato.' },
                { name: '\u200B', value: '\u200B' }, // Linha em branco para separar
                { name: '`/configurar-caixa <horas>`', value: 'Altera o intervalo (em horas) para o drop da Caixa.' },
                { name: '`/sorteio iniciar <premio> <duracao>`', value: 'Inicia um novo sorteio (duração em minutos).' },
                { name: '`/sorteio sortear`', value: 'Encerra o sorteio ativo e anuncia o vencedor.' }
            )
            .setFooter({ text: 'Acesso restrito à administração.' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};
