const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const express = require('express');
const cors = require('cors');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences
    ]
});

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURARE ROLURI ȘI CANALE ARCTIC
const CONFIG = {
    ROLE_ACCEPTED: "1479382686287270021",       // ID Rol Acceptat Staff
    ROLE_DENIED: "1480953818387578890",         // ID Rol Respins Staff
    CHANNEL_STAFF_APPLY: "1534320731205144606", // Canal Aplicatii Staff
    CHANNEL_UNBAN: "1534320787765596291"          // Canal Unban / Unblacklist
};

// Middleware pentru a verifica dacă botul este pregătit
const ensureBotReady = (req, res, next) => {
    if (!client.isReady()) {
        return res.status(503).json({ error: "Botul Discord nu este încă pregătit/conectat." });
    }
    next();
};

// -------------------------------------------------------------
// 📊 ENDPOINT STATISTICI LIVE PENTRU WEBSITE
// -------------------------------------------------------------
app.get('/api/stats', ensureBotReady, async (req, res) => {
    try {
        const guild = client.guilds.cache.first();
        if (!guild) {
            return res.status(200).json({ total: 0, online: 0, boosts: 0 });
        }

        const members = await guild.members.fetch().catch(() => guild.members.cache);
        
        const total = guild.memberCount || 0;
        const online = members.filter(m => m.presence && m.presence.status !== 'offline').size || 0;
        const boosts = guild.premiumSubscriptionCount || 0;

        res.status(200).json({ total, online, boosts });
    } catch (error) {
        console.error("Eroare la preluarea statisticilor:", error);
        res.status(200).json({ total: 0, online: 0, boosts: 0 });
    }
});

// -------------------------------------------------------------
// 📝 ENDPOINT STAFF APPLY (CU ROLURI SI DM)
// -------------------------------------------------------------
app.post('/api/apply', ensureBotReady, async (req, res) => {
    try {
        const data = req.body;
        const channel = await client.channels.fetch(CONFIG.CHANNEL_STAFF_APPLY).catch(() => null);
        if (!channel) return res.status(500).json({ error: "Canalul staff nu a fost găsit" });

        const embed = new EmbedBuilder()
            .setTitle("📝 APLICAȚIE NOUĂ STAFF — ARCTIC COMMUNITY")
            .setDescription(`Aplicație trimisă de utilizatorul: <@${data.discordId}> (\`${data.discordId}\`)`)
            .setColor(0x00b2ff)
            .addFields(
                { name: "👤 1. Vârstă / 2. An Naștere", value: `${data.q1 || 'N/A'} ani / Anul ${data.q2 || 'N/A'}`, inline: true },
                { name: "⏳ 3. Vechime Server", value: `${data.q3 || 'N/A'}`, inline: true },
                { name: "💼 4. Experiență Staff", value: `${data.q4 || 'N/A'}` },
                { name: "🕒 5. Activitate Zilnică", value: `${data.q5 || 'N/A'}`, inline: true },
                { name: "🎙️ 6. Canal Activ", value: `${data.q6 || 'N/A'}`, inline: true },
                { name: "📖 7. Citit Regulament", value: `${data.q7 || 'N/A'}`, inline: true },
                { name: "😡 8. Temperament", value: `${data.q8 || 'N/A'}`, inline: true },
                { name: "⚠️ 9. Sancțiuni Anterioare", value: `${data.q9 || 'N/A'}`, inline: true },
                { name: "🤝 10. Conștient Indulgență", value: `${data.q10 || 'N/A'}` },
                { name: "👑 11. Respect Membri", value: `${data.q11 || 'N/A'}` },
                { name: "📝 12. Descriere Personală", value: `${data.q12 || 'N/A'}` }
            )
            .setFooter({ text: "ARCTIC Apply System • " + new Date().toLocaleString('ro-RO') });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`staff_acc_direct_${data.discordId}`).setLabel('Acceptă').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`staff_acc_reason_${data.discordId}`).setLabel('Acceptă cu Motiv').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`staff_den_direct_${data.discordId}`).setLabel('Respinge').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`staff_den_reason_${data.discordId}`).setLabel('Respinge cu Motiv').setStyle(ButtonStyle.Danger)
        );

        await channel.send({ content: `🔔 **Aplicație staff nouă de la:** <@${data.discordId}>`, embeds: [embed], components: [row] });
        res.status(200).json({ status: "success" });
    } catch (error) {
        console.error("Eroare la primirea aplicatiei:", error);
        res.status(500).json({ error: "Eroare internă pe server" });
    }
});

// -------------------------------------------------------------
// 🔓 ENDPOINT UNBAN
// -------------------------------------------------------------
app.post('/api/unban', ensureBotReady, async (req, res) => {
    try {
        const data = req.body;
        const channel = await client.channels.fetch(CONFIG.CHANNEL_UNBAN).catch(() => null);
        if (!channel) return res.status(500).json({ error: "Canalul unban nu a fost găsit" });

        const embed = new EmbedBuilder()
            .setTitle("🔓 CERERE NOUĂ DE UNBAN")
            .setDescription(`Cerere trimisă de utilizatorul: <@${data.discordId}> (\`${data.discordId}\`)`)
            .setColor(0x00b2ff)
            .addFields(
                { name: "1. Username Discord", value: data.q1 || "Nespecificat" },
                { name: "2. Cauză Ban", value: data.q2 || "Nespecificat" },
                { name: "3. Banat de către", value: data.q3 || "Nespecificat" },
                { name: "4. Precizări / Dovezi", value: data.q4 || "Niciuna" }
            )
            .setFooter({ text: "ARCTIC Unban System • " + new Date().toLocaleString('ro-RO') });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`unban_acc_${data.discordId}`).setLabel('Acceptă Unban').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`unban_den_${data.discordId}`).setLabel('Respinge Unban').setStyle(ButtonStyle.Danger)
        );

        await channel.send({ content: `🔔 **Cerere nouă de Unban de la:** <@${data.discordId}>`, embeds: [embed], components: [row] });
        res.status(200).json({ status: "success" });
    } catch (error) {
        console.error("Eroare la trimiterea unban-ului:", error);
        res.status(500).json({ error: "Eroare internă pe server" });
    }
});

// -------------------------------------------------------------
// 🛡️ ENDPOINT UNBLACKLIST
// -------------------------------------------------------------
app.post('/api/unblacklist', ensureBotReady, async (req, res) => {
    try {
        const data = req.body;
        const channel = await client.channels.fetch(CONFIG.CHANNEL_UNBAN).catch(() => null);
        if (!channel) return res.status(500).json({ error: "Canalul unban nu a fost găsit" });

        const embed = new EmbedBuilder()
            .setTitle("🛡️ CERERE NOUĂ DE UNBLACKLIST")
            .setDescription(`Cerere trimisă de utilizatorul: <@${data.discordId}> (\`${data.discordId}\`)`)
            .setColor(0xffaa00)
            .addFields(
                { name: "Nume Discord", value: data.q1 || "Nespecificat", inline: true },
                { name: "ID Discord", value: data.q2 || "Nespecificat", inline: true },
                { name: "Tip Blacklist", value: data.q3 || "Nespecificat", inline: true },
                { name: "Acordat de", value: data.q4 || "Nespecificat", inline: true },
                { name: "Motiv Blacklist", value: data.q5 || "Nespecificat" },
                { name: "Data Primirii", value: data.q6 || "Nespecificat", inline: true },
                { name: "De ce merită Unblacklist", value: data.q7 || "Nespecificat" },
                { name: "Își asumă greșeala", value: data.q8 || "Nespecificat", inline: true },
                { name: "Schimbare Comportament", value: data.q9 || "Nespecificat" },
                { name: "Dovezi", value: data.q10 || "Niciuna" },
                { name: "Alte Informații", value: data.q11 || "Niciuna" }
            )
            .setFooter({ text: "ARCTIC Unblacklist System • " + new Date().toLocaleString('ro-RO') });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`unbl_acc_${data.discordId}`).setLabel('Acceptă Unbl').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`unbl_den_${data.discordId}`).setLabel('Respinge Unbl').setStyle(ButtonStyle.Danger)
        );

        await channel.send({ content: `🔔 **Cerere nouă de Unblacklist de la:** <@${data.discordId}>`, embeds: [embed], components: [row] });
        res.status(200).json({ status: "success" });
    } catch (error) {
        console.error("Eroare la trimiterea unblacklist-ului:", error);
        res.status(500).json({ error: "Eroare internă pe server" });
    }
});

// -------------------------------------------------------------
// 🎮 GESTIONARE INTERACȚIUNI DISCORD
// -------------------------------------------------------------
client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        const parts = interaction.customId.split('_');
        const system = parts[0];

        if (system === 'unban' || system === 'unbl') {
            const action = parts[1];
            const targetId = parts[2];
            const member = await interaction.guild.members.fetch(targetId).catch(() => null);

            const statusText = action === 'acc' ? "✅ Cererea a fost **ACCEPTATĂ**" : "❌ Cererea a fost **RESPINSĂ**";
            const embedColor = action === 'acc' ? 0x00ff88 : 0xff0000;

            if (member) {
                const titleMsg = system === 'unban' ? "Unban" : "Unblacklist";
                const dmText = action === 'acc' 
                    ? `🎉 Felicitări! Cererea ta de **${titleMsg}** pe **ARCTIC** a fost **ACCEPTATĂ**!` 
                    : `❌ Ne pare rău, dar cererea ta de **${titleMsg}** pe **ARCTIC** a fost **RESPINSĂ**.`;
                member.send(dmText).catch(() => {});
            }

            const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                .setColor(embedColor)
                .addFields({ name: "📋 Status", value: `${statusText} de către <@${interaction.user.id}>` });

            await interaction.update({ embeds: [updatedEmbed], components: [] });
            return;
        }

        if (system === 'staff') {
            const action = parts[1];
            const type = parts[2];
            const targetId = parts[3];
            const member = await interaction.guild.members.fetch(targetId).catch(() => null);

            if (!member) {
                return interaction.reply({ content: "❌ Utilizatorul nu mai este pe server!", ephemeral: true });
            }

            if (action === 'acc' && type === 'direct') {
                await member.roles.add(CONFIG.ROLE_ACCEPTED).catch(() => {});
                await member.roles.remove(CONFIG.ROLE_DENIED).catch(() => {});
                
                const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                    .setColor(0x00ff88)
                    .addFields({ name: "✅ Status Evaluare", value: `Acceptat de <@${interaction.user.id}>` });

                await interaction.update({ embeds: [updatedEmbed], components: [] });
                member.send("🎉 Felicitări! Aplicația ta de Staff pe **ARCTIC** a fost **ACCEPTATĂ**! Cand ai timp sa faci un ticket pe server-ul de Applys ca sa dai testele.").catch(() => {});
            }

            if (action === 'den' && type === 'direct') {
                await member.roles.add(CONFIG.ROLE_DENIED).catch(() => {});
                await member.roles.remove(CONFIG.ROLE_ACCEPTED).catch(() => {});

                const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                    .setColor(0xff0000)
                    .addFields({ name: "❌ Status Evaluare", value: `Respins de <@${interaction.user.id}>` });

                await interaction.update({ embeds: [updatedEmbed], components: [] });
                member.send("❌ Ne pare rău, dar aplicația ta de Staff pe **ARCTIC** a fost **RESPINSĂ**.").catch(() => {});
            }

            if (type === 'reason') {
                const modal = new ModalBuilder()
                    .setCustomId(`staff_modal_${action}_${targetId}`)
                    .setTitle(action === 'acc' ? 'Motiv Acceptare Staff' : 'Motiv Respingere Staff');

                const reasonInput = new TextInputBuilder()
                    .setCustomId('reason_text')
                    .setLabel('Introdu motivul:')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
                await interaction.showModal(modal);
            }
        }
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('staff_modal_')) {
        const parts = interaction.customId.split('_');
        const action = parts[2];
        const targetId = parts[3];
        const reason = interaction.fields.getTextInputValue('reason_text');
        const member = await interaction.guild.members.fetch(targetId).catch(() => null);

        if (action === 'acc') {
            if (member) {
                await member.roles.add(CONFIG.ROLE_ACCEPTED).catch(() => {});
                await member.roles.remove(CONFIG.ROLE_DENIED).catch(() => {});
                member.send(`🎉 Aplicația ta de Staff pe **ARCTIC** a fost **ACCEPTATĂ**!\n**Motiv:** ${reason}`).catch(() => {});
            }
            const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                .setColor(0x00ff88)
                .addFields({ name: "✅ Status Evaluare", value: `Acceptat de <@${interaction.user.id}>\n**Motiv:** ${reason}` });
            await interaction.update({ embeds: [updatedEmbed], components: [] });
        } else {
            if (member) {
                await member.roles.add(CONFIG.ROLE_DENIED).catch(() => {});
                await member.roles.remove(CONFIG.ROLE_ACCEPTED).catch(() => {});
                member.send(`❌ Aplicația ta de Staff pe **ARCTIC** a fost **RESPINSĂ**.\n**Motiv:** ${reason}`).catch(() => {});
            }
            const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                .setColor(0xff0000)
                .addFields({ name: "❌ Status Evaluare", value: `Respins de <@${interaction.user.id}>\n**Motiv:** ${reason}` });
            await interaction.update({ embeds: [updatedEmbed], components: [] });
        }
    }
});

client.once('ready', () => {
    console.log(`[BOT] Conectat cu succes ca ${client.user.tag}`);
});

// Pornire API și conectare Bot
app.listen(3000, () => console.log('[API] Serverul Express rulează pe portul 3000'));

// ⚠️ Notă de securitate: Schimbă token-ul expus cu unul nou din Discord Developer Portal!
client.login('TOKEN_UL_TAU');