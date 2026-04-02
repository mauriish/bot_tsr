const { listFiles, findSubfolder } = require('../utils/googleDrive');
const { EmbedBuilder } = require('discord.js');
const CAR_LIST = require('../utils/carlist.js');

const ROOT_FOLDER_ID = process.env.DRIVE_FOLDER_ID;
const ROL_ID = '1399813082406064299';

module.exports = {
    name: 'find',
    description: 'Muestra en qué circuitos hay setup para un auto',

    async execute(message, args, profileData) {

        if (!message.member.roles.cache.has(ROL_ID)) {
            return message.reply('❌ No tienes permisos para usar este comando.');
        }

        if (!args[0]) {
            return message.reply(
                `❌ Indica el tag del auto.\n` +
                `Ejemplo: \`!find porschegt3\`\n\n` +
                `Usa \`!help\` para ver la lista de tags.`
            );
        }

        const tag = args[0].toLowerCase().trim();
        const car = CAR_LIST.find(c => c.tag === tag);

        if (!car) {
            return message.reply(
                `❌ Tag \`${tag}\` no reconocido.\n` +
                `Usa \`!help\` para ver la lista de tags disponibles.`
            );
        }

        const loadingMsg = await message.reply(`🔍 Buscando circuitos con setup de **${car.name}**...`);

        // Obtener todas las carpetas de circuitos
        let driveItems;
        try {
            driveItems = await listFiles(ROOT_FOLDER_ID);
        } catch (error) {
            return loadingMsg.edit('❌ Error al conectar con Google Drive.');
        }

        const folders = driveItems.filter(f => f.mimeType === 'application/vnd.google-apps.folder');

        if (!folders.length) {
            return loadingMsg.edit('No hay circuitos disponibles.');
        }

        // Busca el archivo del auto en cada carpeta de circuito
        const resultados = await Promise.all(
            folders.map(async folder => {
                try {
                    const files = await listFiles(folder.id);
                    const file = files.find(f =>
                        f.name.toLowerCase() === `${tag}.rar` ||
                        f.name.toLowerCase().includes(tag)
                    );
                    if (file) {
                        const fecha = new Date(file.createdTime).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        });
                        return { circuito: folder.name, fecha };
                    }
                    return null;
                } catch {
                    return null;
                }
            })
        );

        const encontrados = resultados.filter(r => r !== null);

        if (!encontrados.length) {
            await loadingMsg.delete();
            return message.reply(`⏳ No hay setups cargados para **${car.name}** en ningún circuito.`);
        }

        const lista = encontrados
            .sort((a, b) => a.circuito.localeCompare(b.circuito))
            .map(r => `• \`${r.circuito}\` — subido el ${r.fecha}`)
            .join('\n');

        await loadingMsg.delete();
        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`🔍 ${car.name}`)
                    .setDescription(`Setups disponibles en:\n\n${lista}`)
                    .setColor(0x346beb)
                    .setFooter({ text: `Usa !setup ${tag}-<circuito> para descargar` })
            ]
        });
    }
};  