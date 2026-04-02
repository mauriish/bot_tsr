const { listFiles, findSubfolder, downloadFile } = require('../utils/googleDrive');
const { AttachmentBuilder } = require('discord.js');
const fs = require('fs');

const ROOT_FOLDER_ID = process.env.DRIVE_FOLDER_ID;

module.exports = {
    name: 'setup',
    description: 'Descarga un setup desde Google Drive',

    async execute(message, args, profileData) {

        // !setup sin argumentos → muestra circuitos disponibles
        if (!args[0]) {
            let folders;
            try {
                const allFiles = await listFiles(ROOT_FOLDER_ID);
                folders = allFiles.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
            } catch (error) {
                console.error('Error al listar carpetas:', error);
                return message.reply('❌ No se pudo conectar con Google Drive.');
            }

            if (!folders.length) return message.reply('No hay circuitos disponibles.');

            const lista = folders.map(f => `• \`${f.name}\``).join('\n');
            return message.reply(
                `🏁 **Circuitos disponibles:**\n${lista}\n\n` +
                `Uso: \`!setup <auto>-<circuito>\`\n` +
                `Ejemplo: \`!setup porschegt3-spa\``
            );
        }

        // Separar auto y circuito
        const input = args[0].toLowerCase().trim();
        const separador = input.lastIndexOf('-');

        if (separador === -1) {
            return message.reply(
                `❌ Formato incorrecto.\n` +
                `Uso: \`!setup <auto>-<circuito>\`\n` +
                `Ejemplo: \`!setup porschegt3-spa\``
            );
        }

        const carName = input.substring(0, separador);       // ej: porschegt3
        const circuitName = input.substring(separador + 1);  // ej: spa
        const fileName = `${carName}.rar`;

        const loadingMsg = await message.reply(`🔍 Buscando \`${fileName}\` en **${circuitName}**...`);

        // Buscar la carpeta del circuito
        let subfolder;
        try {
            subfolder = await findSubfolder(ROOT_FOLDER_ID, circuitName);
        } catch (error) {
            console.error('Error al buscar carpeta:', error);
            return loadingMsg.edit('❌ Error al conectar con Google Drive.');
        }

        if (!subfolder) {
            // Mostrar circuitos disponibles como sugerencia
            const allFiles = await listFiles(ROOT_FOLDER_ID);
            const folders = allFiles.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
            const lista = folders.map(f => `• \`${f.name}\``).join('\n');

            return loadingMsg.edit(
                `❌ No se encontró el circuito \`${circuitName}\`.\n\n` +
                `🏁 **Circuitos disponibles:**\n${lista}`
            );
        }

        // Buscar el archivo del auto dentro de la carpeta del circuito
        let files;
        try {
            files = await listFiles(subfolder.id);
        } catch (error) {
            console.error('Error al listar archivos:', error);
            return loadingMsg.edit('❌ Error al leer la carpeta del circuito.');
        }

        const file =
            files.find(f => f.name.toLowerCase() === fileName) ||
            files.find(f => f.name.toLowerCase().includes(carName));

        if (!file) {
            const autos = files.filter(f => f.name.endsWith('.rar')).map(f => `• \`${f.name.replace('.rar', '')}\``).join('\n');
            return loadingMsg.edit(
                `❌ No hay setup de \`${carName}\` en **${subfolder.name}**.\n\n` +
                (autos ? `🚗 **Autos disponibles en ${subfolder.name}:**\n${autos}` : '')
            );
        }

        // Descargar y enviar
        await loadingMsg.edit(`⬇️ Descargando \`${file.name}\` (${subfolder.name})...`);

        let filePath;
        try {
            filePath = await downloadFile(file.id, file.name);
        } catch (error) {
            console.error('Error al descargar:', error);
            return loadingMsg.edit('❌ Error al descargar el archivo desde Drive.');
        }

        try {
            const sizeMB = fs.statSync(filePath).size / (1024 * 1024);

            if (sizeMB <= 8) {
                const attachment = new AttachmentBuilder(filePath, { name: file.name });
                await message.reply({ content: `✅ **${file.name}** — ${subfolder.name}`, files: [attachment] });
            } else {
                await message.reply(
                    `✅ **${file.name}** — ${subfolder.name} (${sizeMB.toFixed(1)}MB)\n` +
                    `📦 Archivo grande, descárgalo aquí:\n🔗 ${file.webViewLink}`
                );
            }
            await loadingMsg.delete();
        } catch (error) {
            console.error('Error al enviar:', error);
            await loadingMsg.edit('❌ Error al enviar el archivo.');
        } finally {
            if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
    }
};