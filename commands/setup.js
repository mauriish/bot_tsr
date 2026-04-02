const { listFiles, findSubfolder, downloadFile } = require('../utils/googleDrive');
const { AttachmentBuilder } = require('discord.js');
const fs = require('fs');

const ROOT_FOLDER_ID = process.env.DRIVE_FOLDER_ID;
const ROL_ID = '1399813082406064299';

module.exports = {
    name: 'setup',
    description: 'Descarga un setup desde Google Drive',

    async execute(message, args, profileData) {

        if (!message.member.roles.cache.has(ROL_ID)) {
            return message.reply('❌ No tienes permisos para usar este comando.');
        }

        if (!args[0]) {
            return message.reply(
                `❌ Formato incorrecto.\n` +
                `Uso: \`!setup <tag>-<circuito>\`\n` +
                `Ejemplo: \`!setup porschegt3-spa\`\n\n` +
                `Usa \`!autos\` para ver los disponibles.`
            );
        }

        const input = args[0].toLowerCase().trim();
        const separador = input.lastIndexOf('-');

        if (separador === -1) {
            return message.reply(
                `❌ Formato incorrecto.\n` +
                `Uso: \`!setup <tag>-<circuito>\`\n` +
                `Ejemplo: \`!setup porschegt3-spa\``
            );
        }

        const carTag = input.substring(0, separador);      // ej: porschegt3
        const circuitName = input.substring(separador + 1); // ej: spa
        const fileName = `${circuitName}.rar`;              // ej: spa.rar

        const loadingMsg = await message.reply(`🔍 Buscando \`${carTag}\` en **${circuitName}**...`);

        // Busca la carpeta del AUTO
        let carFolder;
        try {
            carFolder = await findSubfolder(ROOT_FOLDER_ID, carTag);
        } catch (error) {
            return loadingMsg.edit('❌ Error al conectar con Google Drive.');
        }

        if (!carFolder) {
            return loadingMsg.edit(
                `❌ No hay setups para \`${carTag}\`.\n` +
                `Usa \`!autos\` para ver los disponibles.`
            );
        }

        // Busca el archivo del CIRCUITO dentro de la carpeta del auto
        let files;
        try {
            files = await listFiles(carFolder.id);
        } catch (error) {
            return loadingMsg.edit('❌ Error al leer la carpeta del auto.');
        }

        const file =
            files.find(f => f.name.toLowerCase() === fileName) ||
            files.find(f => f.name.toLowerCase().includes(circuitName));

        if (!file) {
            const circuitos = files
                .filter(f => f.name.endsWith('.rar'))
                .map(f => `• \`${f.name.replace('.rar', '')}\``)
                .join('\n');

            return loadingMsg.edit(
                `❌ No hay setup de \`${carTag}\` en **${circuitName}**.\n\n` +
                (circuitos ? `🏁 **Circuitos disponibles:**\n${circuitos}` : '')
            );
        }

        await loadingMsg.edit(`⬇️ Descargando \`${carTag}\` — ${circuitName}...`);

        let filePath;
        try {
            filePath = await downloadFile(file.id, file.name);
        } catch (error) {
            return loadingMsg.edit('❌ Error al descargar el archivo desde Drive.');
        }

        try {
            const sizeMB = fs.statSync(filePath).size / (1024 * 1024);

            if (sizeMB <= 8) {
                const attachment = new AttachmentBuilder(filePath, { name: file.name });
                await message.reply({ content: `✅ **Auto: __${carTag}__** PARA __${circuitName}__`, files: [attachment] });
            } else {
                await message.reply(
                    `✅ **__${carTag}__** PARA __${circuitName}__ (${sizeMB.toFixed(1)}MB)\n` +
                    `📦 Archivo grande, descárgalo aquí:\n🔗 ${file.webViewLink}`
                );
            }
            await loadingMsg.delete();
        } catch (error) {
            await loadingMsg.edit('❌ Error al enviar el archivo.');
        } finally {
            if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
    }
};