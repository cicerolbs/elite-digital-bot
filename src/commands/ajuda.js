// Em: src/commands/ajuda.js

const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ajuda')
        .setDescription('Mostra todos os comandos disponíveis e o que eles fazem.'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#00BFFF') // Azul-celeste
            .setTitle('🤖 Central de Ajuda do PontosElite')
            .setDescription('Aqui está uma lista de tudo que eu posso fazer! Use os comandos no chat para interagir comigo.')
            .addFields(
                { name: '`/pontos`', value: 'Mostra seu saldo atual de pontos.' },
                { name: '`/rank`', value: 'Exibe o ranking dos 10 membros com mais pontos no servidor.' },
                { name: '`/caixa`', value: 'Tenta resgatar uma Caixa Misteriosa quando ela aparece no chat.' },
                { name: '`/trocar-pontos <tickets>`', value: `Converte seus pontos em tickets para o sorteio ativo. (Custo: ${config.giveawayConfig.pointsPerEntry} pontos por ticket)` },
                { name: '`/ajuda`', value: 'Mostra esta mensagem de ajuda que você está vendo agora.' }
            )
            .setFooter({ text: 'Bot de Pontos da Elite Digital' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};
