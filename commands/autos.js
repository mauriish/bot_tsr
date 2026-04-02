const { listFiles, findSubfolder } = require('../utils/googleDrive');

const ROOT_FOLDER_ID = process.env.DRIVE_FOLDER_ID;
const ROL_ID = '1399813082406064299';

module.exports = {
    name: 'autos',
    description: 'Muestra los autos disponibles en un circuito',

    async execute(message, args, profileData) {

        if (!message.member.roles.cache.has(ROL_ID)) {
            return message.reply('❌ No tienes permisos para usar este comando.');
        }

        if (!args[0]) {
            return message.reply(
                `❌ Indica un circuito.\n` +
                `Ejemplo: \`!autos spa\`\n\n` +
                `Usa \`!circuitos\` para ver la lista completa.`
            );
        }

        const circuitName = args[0].toLowerCase().trim();

        let subfolder;
        try {
            subfolder = await findSubfolder(ROOT_FOLDER_ID, circuitName);
        } catch (error) {
            console.error('Error al buscar circuito:', error);
            return message.reply('❌ Error al conectar con Google Drive.');
        }

        if (!subfolder) {
            return message.reply(
                `❌ No se encontró el circuito \`${circuitName}\`.\n` +
                `Usa \`!circuitos\` para ver los disponibles.`
            );
        }

        let files;
        try {
            files = await listFiles(subfolder.id);
        } catch (error) {
            console.error('Error al listar autos:', error);
            return message.reply('❌ Error al leer la carpeta del circuito.');
        }

        const autos = files.filter(f => f.name.endsWith('.rar'));

        if (!autos.length) {
            return message.reply(`No hay setups disponibles en **${subfolder.name}**.`);
        }

        const lista = autos.map(f => `• \`${f.name.replace('.rar', '')}\``).join('\n');

        return message.reply(
            `🚗 **Autos disponibles en ${subfolder.name}:**\n${lista}\n\n` +
            `Usa \`!setup <auto>-${subfolder.name}\` para descargar.\n` +
            `Ejemplo: \`!setup ${autos[0].name.replace('.rar', '')}-${subfolder.name}\``
        );
    }
};