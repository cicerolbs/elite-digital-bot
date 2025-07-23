// Em: src/commands/sortear.js (VERSÃO CORRIGIDA)

const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require('discord.js');
const Giveaway = require('../models/Giveaway.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sorteio')
        .setDescription('[Admin] Comandos para gerenciar sorteios.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand.setName('iniciar')
                .setDescription('Inicia um novo sorteio.')
                .addStringOption(option => option.setName('premio').setDescription('O que será sorteado.').setRequired(true))
                .addIntegerOption(option => option.setName('duracao').setDescription('Duração do sorteio em minutos.').setRequired(true).setMinValue(1)))
        .addSubcommand(subcommand =>
            subcommand.setName('sortear')
                .setDescription('Encerra o sorteio atual e sorteia um vencedor.')),

    async execute(interaction) {
        // Acessamos o client através da interação
        const client = interaction.client;

        if (!interaction.member.roles.cache.has(config.adminRoleId)) {
            return interaction.reply({ content: 'Você não tem permissão para usar este comando.', flags: MessageFlags.Ephemeral });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'iniciar') {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const prize = interaction.options.getString('premio');
            const durationInMinutes = interaction.options.getInteger('duracao');
            const endTime = new Date(Date.now() + durationInMinutes * 60000);

            const activeGiveaway = await Giveaway.findOne({ guildId: interaction.guild.id, isActive: true });
            if (activeGiveaway) {
                return interaction.editReply('Já existe um sorteio ativo! Use `/sorteio sortear` para finalizá-lo primeiro.');
            }

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('🎉 NOVO SORTEIO INICIADO! 🎉')
                .setDescription(`**Prêmio:** ${prize}`)
                .addFields(
                    { name: 'Como Participar?', value: `Use o comando \`/trocar-pontos <tickets>\` para comprar seus tickets!` },
                    { name: 'Custo', value: `\`${config.giveawayConfig.pointsPerEntry}\` pontos por ticket.` },
                    { name: 'Sorteio termina em:', value: `<t:${Math.floor(endTime.getTime() / 1000)}:R>` }
                )
                .setFooter({ text: 'Quanto mais tickets, mais chances! Boa sorte a todos!' });

            const giveawayChannel = client.channels.cache.get(config.generalChatId);
            if (!giveawayChannel) {
                return interaction.editReply('Canal de sorteios não encontrado. Verifique o `generalChatId` no config.');
            }

            const giveawayMessage = await giveawayChannel.send({ embeds: [embed] });

            await Giveaway.create({
                guildId: interaction.guild.id,
                messageId: giveawayMessage.id,
                channelId: giveawayChannel.id,
                prize: prize,
                endTime: endTime,
                isActive: true,
            });

            await interaction.editReply(`✅ Sorteio para **${prize}** iniciado com sucesso no canal ${giveawayChannel}!`);

        } else if (subcommand === 'sortear') {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const giveaway = await Giveaway.findOne({ guildId: interaction.guild.id, isActive: true });
            if (!giveaway) {
                return interaction.editReply({ content: 'Nenhum sorteio ativo para finalizar.', flags: MessageFlags.Ephemeral });
            }

            const entries = giveaway.entries;
            if (entries.length === 0) {
                await Giveaway.updateOne({ _id: giveaway._id }, { isActive: false });
                const giveawayChannel = client.channels.cache.get(giveaway.channelId);
                const originalMessage = await giveawayChannel.messages.fetch(giveaway.messageId).catch(() => null);

                const endedEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('SORTEIO FINALIZADO')
                    .setDescription(`**Prêmio:** ${giveaway.prize}\n\nO sorteio foi finalizado sem nenhum participante.`)
                    .setTimestamp();

                if (originalMessage) await originalMessage.edit({ embeds: [endedEmbed], components: [] });
                return interaction.editReply('Sorteio finalizado. Não houve participantes.');
            }

            const winnerId = entries[Math.floor(Math.random() * entries.length)];
            giveaway.winnerId = winnerId;
            giveaway.isActive = false;
            await giveaway.save();

            const giveawayChannel = client.channels.cache.get(giveaway.channelId);
            const originalMessage = await giveawayChannel.messages.fetch(giveaway.messageId).catch(() => null);

            const endedEmbed = new EmbedBuilder()
                .setColor('Gold')
                .setTitle('🎉 SORTEIO FINALIZADO! 🎉')
                .setDescription(`**Prêmio:** ${giveaway.prize}\n\nO grande vencedor é... <@${winnerId}>! Parabéns!`)
                .setTimestamp();

            if (originalMessage) await originalMessage.edit({ embeds: [endedEmbed], components: [] });
            await giveawayChannel.send(`Parabéns <@${winnerId}>! Você ganhou o sorteio de **${giveaway.prize}**!`);
            await interaction.editReply(`Sorteio finalizado! O vencedor foi <@${winnerId}>.`);
        }
    },
};
