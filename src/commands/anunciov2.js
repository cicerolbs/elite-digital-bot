// Em: src/commands/anunciov2.js

const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder, ChannelType } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anunciov2')
        .setDescription('[Admin] Envia um anúncio formatado em um canal específico.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('O canal para onde o anúncio será enviado.')
                .addChannelTypes(ChannelType.GuildText) // Garante que só canais de texto possam ser selecionados
                .setRequired(true))
        .addStringOption(option =>
            option.setName('titulo')
                .setDescription('O título do seu anúncio.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('mensagem')
                .setDescription('A mensagem principal do anúncio. Use "\\n" para criar uma nova linha.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('imagem')
                .setDescription('URL da imagem a ser exibida no anúncio (opcional).'))
        .addStringOption(option =>
            option.setName('cor')
                .setDescription('Cor do embed em código HEX (ex: #FF5733) (opcional).')),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(config.adminRoleId)) {
            return interaction.reply({ content: 'Você não tem permissão para usar este comando.', flags: MessageFlags.Ephemeral });
        }

        const targetChannel = interaction.options.getChannel('canal');
        const titulo = interaction.options.getString('titulo');
        let mensagem = interaction.options.getString('mensagem');
        const imagem = interaction.options.getString('imagem');
        const cor = interaction.options.getString('cor');

        // TRUQUE IMPORTANTE: Substitui a string "\\n" por uma quebra de linha real
        mensagem = mensagem.replace(/\\n/g, '\n');

        const embed = new EmbedBuilder()
            .setTitle(titulo)
            .setDescription(mensagem)
            .setColor(cor || '#0099FF') // Cor padrão azul se nenhuma for fornecida
            .setTimestamp()
            .setFooter({ text: `Anúncio feito por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

        if (imagem) {
            embed.setImage(imagem);
        }

        try {
            await targetChannel.send({ content: '@everyone', embeds: [embed] });
            await interaction.reply({ content: `✅ Anúncio enviado com sucesso para o canal ${targetChannel}!`, flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error("Erro ao enviar anúncio:", error);
            await interaction.reply({ content: '❌ Ocorreu um erro ao tentar enviar o anúncio. Verifique se tenho permissões para falar no canal selecionado.', flags: MessageFlags.Ephemeral });
        }
    },
};
