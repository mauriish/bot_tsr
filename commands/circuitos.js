const { listFiles, findSubfolder } = require('../utils/googleDrive');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const CAR_LIST = require('../utils/carlist.js');

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
    name: 'circuitos',
    description: 'Muestra circuitos disponibles o autos de un circuito',

    async execute(message, args, profileData) {

        if (!message.member.roles.cache.has(ROL_ID)) {
            return message.reply('❌ No tienes permisos para usar este comando.');
        }

        // !circuitos <circuito> → muestra los autos disponibles en ese circuito
        if (args[0]) {
            const circuitName = args[0].toLowerCase().trim();
            const loadingMsg = await message.reply(`🔍 Buscando setups en **${circuitName}**...`);

            let circuitFolder;
            try {
                circuitFolder = await findSubfolder(ROOT_FOLDER_ID, circuitName);
            } catch (error) {
                return loadingMsg.edit('❌ Error al conectar con Google Drive.');
            }

            if (!circuitFolder) {
                return loadingMsg.edit(
                    `❌ No existe el circuito \`${circuitName}\`.\n` +
                    `Usa \`!circuitos\` para ver los disponibles.`
                );
            }

            let files;
            try {
                files = await listFiles(circuitFolder.id);
            } catch (error) {
                return loadingMsg.edit('❌ Error al leer la carpeta del circuito.');
            }

            const autos = files.filter(f => f.name.endsWith('.rar'));

            if (!autos.length) {
                return loadingMsg.edit(`⏳ **${circuitFolder.name}** aún no tiene setups cargados.`);
            }

            const lista = autos.map(f => {
                const tag = f.name.replace('.rar', '');
                const car = CAR_LIST.find(c => c.tag === tag);
                return `• \`${tag}\` — ${car ? car.name : tag}`;
            }).join('\n');

            await loadingMsg.delete();
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`🚗 Autos disponibles en ${circuitFolder.name}`)
                        .setDescription(lista)
                        .setColor(0x346beb)
                        .setFooter({ text: `Usa !setup <tag>-${circuitFolder.name} para descargar` })
                ]
            });
        }

        // !circuitos → lista todos los circuitos con disponibilidad real
        const loadingMsg = await message.reply(`🔍 Consultando Drive...`);

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

        const folderContents = await Promise.all(
            folders.map(async folder => {
                try {
                    const files = await listFiles(folder.id);
                    const count = files.filter(f => f.name.endsWith('.rar')).length;
                    return { name: folder.name, count };
                } catch {
                    return { name: folder.name, count: 0 };
                }
            })
        );

        const items = folderContents.sort((a, b) => a.name.localeCompare(b.name));
        const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
        let currentPage = 0;

        function buildEmbed(page) {
            const chunk = items.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
            const lista = chunk.map(item =>
                item.count > 0
                    ? `✅ \`${item.name}\` — ${item.count} setup${item.count > 1 ? 's' : ''}`
                    : `⏳ \`${item.name}\` — sin setups`
            ).join('\n');

            return new EmbedBuilder()
                .setTitle('🏁 Circuitos disponibles')
                .setDescription(lista)
                .setColor(0x346beb)
                .setFooter({ text: `Página ${page + 1} de ${totalPages} • Usa !circuitos <circuito> para ver los autos` });
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