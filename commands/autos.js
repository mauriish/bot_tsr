const { listFiles, findSubfolder } = require('../utils/googleDrive');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const CAR_LIST = require('../utils/carList');

const ROOT_FOLDER_ID = process.env.DRIVE_FOLDER_ID;
const ROL_ID = '1399813082406064299';
const ITEMS_PER_PAGE = 10;

function buildRow(page, totalPages, disabled = false) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('◀ Anterior')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(disabled || page === 0),
        new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Siguiente ▶')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(disabled || page === totalPages - 1)
    );
}

module.exports = {
    name: 'autos',
    description: 'Muestra autos disponibles o circuitos de un auto',

    async execute(message, args, profileData) {

        if (!message.member.roles.cache.has(ROL_ID)) {
            return message.reply('❌ No tienes permisos para usar este comando.');
        }

        // !autos <tag> → muestra los circuitos de ese auto
        if (args[0]) {
            const tag = args[0].toLowerCase().trim();
            const car = CAR_LIST.find(c => c.tag === tag);

            if (!car) {
                return message.reply(
                    `❌ Tag \`${tag}\` no reconocido.\n` +
                    `Usa \`!autos\` para ver la lista completa.`
                );
            }

            const loadingMsg = await message.reply(`🔍 Buscando setups de **${car.name}**...`);

            let subfolder;
            try {
                subfolder = await findSubfolder(ROOT_FOLDER_ID, tag);
            } catch (error) {
                return loadingMsg.edit('❌ Error al conectar con Google Drive.');
            }

            if (!subfolder) {
                return loadingMsg.edit(
                    `⏳ **${car.name}** aún no tiene setups cargados.`
                );
            }

            let files;
            try {
                files = await listFiles(subfolder.id);
            } catch (error) {
                return loadingMsg.edit('❌ Error al leer la carpeta del auto.');
            }

            const circuitos = files.filter(f => f.name.endsWith('.rar'));

            if (!circuitos.length) {
                return loadingMsg.edit(`⏳ **${car.name}** aún no tiene setups cargados.`);
            }

            const lista = circuitos
                .map(f => `• \`${f.name.replace('.rar', '')}\``)
                .join('\n');

            await loadingMsg.delete();
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`🏁 Circuitos disponibles — ${car.name}`)
                        .setDescription(lista)
                        .setColor(0x346beb)
                        .setFooter({ text: `Usa !setup ${tag}-<circuito> para descargar` })
                ]
            });
        }

        // !autos → lista todos los autos con al menos un setup en Drive
        const loadingMsg = await message.reply(`🔍 Consultando Drive...`);

        let driveItems;
        try {
            driveItems = await listFiles(ROOT_FOLDER_ID);
        } catch (error) {
            return loadingMsg.edit('❌ Error al conectar con Google Drive.');
        }

        // Carpetas que existen en Drive
        const availableFolders = new Set(
            driveItems
                .filter(f => f.mimeType === 'application/vnd.google-apps.folder')
                .map(f => f.name.toLowerCase())
        );

        // Marca cada auto como disponible o no
        const items = CAR_LIST.map(car => ({
            ...car,
            available: availableFolders.has(car.tag)
        }));

        const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
        let currentPage = 0;

        function buildEmbed(page) {
            const chunk = items.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
            const lista = chunk.map(item =>
                item.available
                    ? `✅ \`${item.tag}\` — ${item.name}`
                    : `⏳ \`${item.tag}\` — ${item.name}`
            ).join('\n');

            return new EmbedBuilder()
                .setTitle('🚗 Setups disponibles')
                .setDescription(lista)
                .setColor(0x346beb)
                .setFooter({ text: `Página ${page + 1} de ${totalPages} • ✅ disponible  ⏳ próximamente` });
        }

        await loadingMsg.delete();

        if (totalPages === 1) {
            return message.reply({ embeds: [buildEmbed(0)] });
        }

        const reply = await message.reply({
            embeds: [buildEmbed(currentPage)],
            components: [buildRow(currentPage, totalPages)]
        });

        const collector = reply.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 60000
        });

        collector.on('collect', async interaction => {
            if (interaction.customId === 'next') currentPage++;
            if (interaction.customId === 'prev') currentPage--;

            await interaction.update({
                embeds: [buildEmbed(currentPage)],
                components: [buildRow(currentPage, totalPages)]
            });
        });

        collector.on('end', async () => {
            await reply.edit({
                components: [buildRow(currentPage, totalPages, true)]
            }).catch(() => {});
        });
    }
};