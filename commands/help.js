const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const PAGES = [
    {
        title: "🏁 Comandos de Setups",
        fields: [
            {
                name: "**🏁 Comandos de Setups** *(requiere rol de piloto)*",
                value:
                    "**!circuitos** — Muestra todos los circuitos disponibles\n" +
                    "**!circuitos <circuito>** — Muestra los autos disponibles en ese circuito\n" +
                    "**!setup <tag>-<circuito>** — Descarga el setup de un auto\n\n" +
                    "Ejemplo: `!setup porschegt3-spa`\n",
                inline: false
            }
        ]
    },
    {
        title: "🚗 Tags — Porsche Cup / Hypercars / GT3",
        fields: [
            {
                name: "**🏆 Porsche Cup**",
                value: "`pcup` — Porsche 911 Cup",
                inline: false
            },
            {
                name: "**🚀 Hypercars**",
                value:
                    "`bmwhy` — BMW M Hybrid V8\n" +
                    "`cadihy` — Cadillac GTP Hypercar\n" +
                    "`acuhy` — Acura ARX-06 GTP\n" +
                    "`963hy` — Porsche 963 GTP\n" +
                    "`499hy` — Ferrari 499P\n",
                inline: false
            },
            {
                name: "**🏎️ GT3**",
                value:
                    "`m4gt3` — BMW M4 GT3\n" +
                    "`lambogt3` — Lamborghini Huracán GT3 EVO2\n" +
                    "`mercgt3` — Mercedes-AMG GT3\n" +
                    "`porschegt3` — Porsche 911 GT3 R\n" +
                    "`ferrarigt3` — Ferrari 296 GT3\n" +
                    "`corvgt3` — Corvette Z06 GT3\n" +
                    "`mustgt3` — Ford Mustang GT3\n" +
                    "`mclarengt3` — McLaren 720S GT3\n" +
                    "`acuragt3` — Acura NSX GT3 EVO22\n" +
                    "`astongt3` — Aston Martin Vantage GT3\n",
                inline: false
            }
        ]
    },
    {
        title: "🚗 Tags — GT4 / LMP2 / LMP3 / Indycar",
        fields: [
            {
                name: "**🏎️ GT4**",
                value:
                    "`porschegt4` — Porsche 718 Cayman GT4\n" +
                    "`mclarengt4` — McLaren 570S GT4\n" +
                    "`mercedesgt4` — Mercedes-AMG GT4\n" +
                    "`bmwgt4` — BMW M4 GT4\n" +
                    "`fordgt4` — Ford Mustang GT4\n" +
                    "`amgt4` — Aston Martin Vantage GT4\n",
                inline: false
            },
            {
                name: "**⚡ LMP2 / LMP3**",
                value:
                    "`lmp2` — ORECA 07 LMP2\n" +
                    "`lmp3` — Ligier JS P320 LMP3\n",
                inline: false
            },
            {
                name: "**🏁 Indycar**",
                value: "`indy` — Dallara IR-18 Indycar",
                inline: false
            }
        ]
    },
    {
        title: "🚗 Tags — NASCAR / Fórmulas / Otros",
        fields: [
            {
                name: "**🇺🇸 NASCAR**",
                value:
                    "`ncup` — NASCAR Cup Series\n" +
                    "`ntrucks` — NASCAR Camping World Truck\n" +
                    "`oriley` — O'Reilly Auto Parts 300 (ARCA)\n",
                inline: false
            },
            {
                name: "**🏎️ Fórmulas**",
                value:
                    "`f1` — Formula 1\n" +
                    "`f3` — Dallara F3\n" +
                    "`sf23` — Super Formula SF23\n" +
                    "`sfl` — Super Formula Lights\n",
                inline: false
            },
            {
                name: "**🚗 Otros**",
                value: "`mx5` — Mazda MX-5 Cup\n",
                inline: false
            }
        ]
    },
    {
        title: "🚗 Tags — NEC",
        fields: [
            {
                name: "**🏆 NEC**",
                value:
                    "`m4gt3` — BMW M4 GT3\n" +
                    "`lambogt3` — Lamborghini Huracán GT3 EVO2\n" +
                    "`mercgt3` — Mercedes-AMG GT3\n" +
                    "`porschegt3` — Porsche 911 GT3 R\n" +
                    "`ferrarigt3` — Ferrari 296 GT3\n" +
                    "`mustgt3` — Ford Mustang GT3\n" +
                    "`astongt3` — Aston Martin Vantage GT3\n" +
                    "`pcup` — Porsche 911 Cup\n" +
                    "`porschegt4` — Porsche 718 Cayman GT4\n" +
                    "`amgt4` — Aston Martin Vantage GT4\n" +
                    "`mercedesgt4` — Mercedes-AMG GT4\n" +
                    "`bmwgt4` — BMW M4 GT4\n" +
                    "`hyutcr` — Hyundai Elantra N TCR\n" +
                    "`hontcr` — Honda Civic Type R TCR\n" +
                    "`audtcr` — Audi RS3 LMS TCR\n" +
                    "`bm2m2` — BMW M2 CS Racing\n",
                inline: false
            }
        ]
    }
];

function buildEmbed(page) {
    return new EmbedBuilder()
        .setTitle(`**Comandos del Bot TSR** — ${PAGES[page].title}`)
        .setColor(0x346beb)
        .addFields(PAGES[page].fields)
        .setFooter({ text: `Página ${page + 1} de ${PAGES.length}` })
        .setTimestamp();
}

function buildRow(page, disabled = false) {
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
            .setDisabled(disabled || page === PAGES.length - 1)
    );
}

module.exports = {
    name: "help",
    aliases: ["comandos", "ayuda"],
    description: "Muestra todos los comandos disponibles",

    async execute(message, args) {
        let currentPage = 0;

        const reply = await message.channel.send({
            embeds: [buildEmbed(currentPage)],
            components: [buildRow(currentPage)]
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
                components: [buildRow(currentPage)]
            });
        });

        collector.on('end', async () => {
            await reply.edit({
                components: [buildRow(currentPage, true)]
            }).catch(() => {});
        });
    }
};