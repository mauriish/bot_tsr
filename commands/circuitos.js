const { listFiles } = require('../utils/googleDrive');

const ROOT_FOLDER_ID = process.env.DRIVE_FOLDER_ID;
const ROL_ID = '1399813082406064299';

module.exports = {
    name: 'circuitos',
    description: 'Muestra los circuitos disponibles',

    async execute(message, args, profileData) {

        if (!message.member.roles.cache.has(ROL_ID)) {
            return message.reply('❌ No tienes permisos para usar este comando.');
        }

        let files;
        try {
            files = await listFiles(ROOT_FOLDER_ID);
        } catch (error) {
            console.error('Error al listar circuitos:', error);
            return message.reply('❌ No se pudo conectar con Google Drive.');
        }

        const folders = files.filter(f => f.mimeType === 'application/vnd.google-apps.folder');

        if (!folders.length) return message.reply('No hay circuitos disponibles.');

        const lista = folders.map(f => `• \`${f.name}\``).join('\n');

        return message.reply(
            `🏁 **Circuitos disponibles:**\n${lista}\n\n` +
            `Usa \`!autos <circuito>\` para ver los autos de cada pista.`
        );
    }
};