// commands/crearcarpetas.js
const { google } = require('googleapis');
const CAR_LIST = require('../utils/carlist');

const ROOT_FOLDER_ID = process.env.DRIVE_FOLDER_ID;

const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

async function listFolders() {
    const response = await drive.files.list({
        q: `'${ROOT_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id, name)',
    });
    return response.data.files;
}

async function createFolder(name) {
    const response = await drive.files.create({
        requestBody: {
            name: name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [ROOT_FOLDER_ID],
        },
        fields: 'id, name',
    });
    return response.data;
}

module.exports = {
    name: 'crearcarpetas',
    description: 'Crea las carpetas de todos los autos en Drive',

    async execute(message, args, profileData) {

        // Solo administradores
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('❌ No tienes permisos para usar este comando.');
        }

        const loadingMsg = await message.reply('🔍 Consultando carpetas existentes en Drive...');

        // Obtener carpetas que ya existen
        let existingFolders;
        try {
            existingFolders = await listFolders();
        } catch (error) {
            console.error('Error al listar carpetas:', error);
            return loadingMsg.edit('❌ Error al conectar con Google Drive.');
        }

        const existingNames = new Set(existingFolders.map(f => f.name.toLowerCase()));

        // Filtrar los tags que aún no tienen carpeta
        const faltantes = CAR_LIST.filter(car => !existingNames.has(car.tag));

        if (!faltantes.length) {
            return loadingMsg.edit('✅ Todas las carpetas ya existen en Drive.');
        }

        await loadingMsg.edit(`⚙️ Creando ${faltantes.length} carpetas...`);

        const creadas = [];
        const errores = [];

        for (const car of faltantes) {
            try {
                await createFolder(car.tag);
                creadas.push(car.tag);
            } catch (error) {
                console.error(`Error al crear carpeta ${car.tag}:`, error);
                errores.push(car.tag);
            }
        }

        const resumen =
            (creadas.length ? `✅ **Carpetas creadas (${creadas.length}):**\n${creadas.map(t => `• \`${t}\``).join('\n')}\n\n` : '') +
            (errores.length ? `❌ **Errores (${errores.length}):**\n${errores.map(t => `• \`${t}\``).join('\n')}` : '');

        return loadingMsg.edit(resumen);
    }
};