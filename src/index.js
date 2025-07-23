// src/index.js (VERSÃO DE PRODUÇÃO FINAL)

// --- SEÇÃO 1: IMPORTAÇÕES ---
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cron = require('cron');
const { Client, GatewayIntentBits, Collection, Events, EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const User = require('./models/User.js');

// --- SEÇÃO 2: CONEXÃO COM O BANCO DE DADOS ---
(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('[BANCO DE DADOS] Conectado ao MongoDB com sucesso!');
    } catch (error) {
        console.error('[BANCO DE DADOS] Erro ao conectar ao MongoDB:', error);
    }
})();

// --- SEÇÃO 3: CONFIGURAÇÃO DO CLIENTE E COLEÇÕES ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
client.messageCooldowns = new Collection();
client.cooldownNotified = new Collection();
client.voiceSessions = new Collection();
client.mysteryBoxStatus = { active: false };

// --- SEÇÃO 4: CARREGAMENTO DE COMANDOS ---
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[AVISO] O comando em ${filePath} está incorreto.`);
    }
}

// --- SEÇÃO 5: CARREGAMENTO DE EVENTOS ---
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// --- SEÇÃO 6: LOGIN DO BOT ---
client.login(process.env.DISCORD_TOKEN);

// --- SEÇÃO 7: SISTEMA DE CAIXA MISTERIOSA ---
if (config.mysteryBox.enabled) {
    // A sintaxe do pacote `cron` utiliza seis campos (segundo, minuto, hora...).
    // O formato anterior utilizava o intervalo em minutos por engano, causando
    // execuções a cada minuto. Agora definimos o intervalo no campo de horas,
    // mantendo as execuções somente entre 14h e 22h.
    const cronString = `0 0 14-22/${config.mysteryBox.intervalHours || 1} * * *`;

    const scheduledMessage = new cron.CronJob(cronString, async () => {
        if (client.mysteryBoxStatus.active) {
            console.log('[CAIXA MISTERIOSA] Drop pulado pois já existe uma caixa ativa.');
            return;
        }

        const channel = client.channels.cache.get(config.mysteryBox.channelId);
        if (!channel) {
            return console.log('[CAIXA MISTERIOSA] Canal para drop da caixa não encontrado.');
        }

        client.mysteryBoxStatus.active = true;

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎁 Uma Caixa Misteriosa Apareceu!')
            .setDescription('Seja o primeiro a usar o comando `/caixa` para resgatar e ganhar pontos extras!')
            .setTimestamp()
            .setFooter({ text: 'Esta caixa expira se não for pega logo!' });

        try {
            await channel.send({ embeds: [embed] });
            console.log('[CAIXA MISTERIOSA] Uma nova caixa foi dropada no canal.');
        } catch (error) {
            console.error('[CAIXA MISTERIOSA] Erro ao enviar a mensagem da caixa:', error);
            client.mysteryBoxStatus.active = false;
        }

    }, null, true, 'America/Sao_Paulo');

    scheduledMessage.start();
    console.log(`[CAIXA MISTERIOSA] Sistema de drop agendado. String do Cron: "${cronString}"`);
}
