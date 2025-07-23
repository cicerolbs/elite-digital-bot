// deploy-commands.js (VERSÃO CORRIGIDA)

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');

const commands = [];
const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const clientId = '1397235254527525005'; // ⚠️ LEMBRE-SE DE COLOCAR SEU ID AQUI
const guildId = '1360673310475681852';  // ⚠️ LEMBRE-SE DE COLOCAR SEU ID AQUI

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    // --- AQUI ESTÁ A CORREÇÃO ---
    // Só adiciona o comando ao array se ele tiver a propriedade 'data'
    if (command.data) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[AVISO] O comando em ${filePath} está sem a propriedade 'data' e será ignorado.`);
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`Iniciando o registro de ${commands.length} comando(s) (/).`);

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('(/) comandos registrados com sucesso!');
    } catch (error) {
        console.error(error);
    }
})();
