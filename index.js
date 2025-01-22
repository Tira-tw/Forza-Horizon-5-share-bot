const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

// 初始化 Discord 客戶端
const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

// 資料儲存（本地 JSON 文件）
const dataPath = './data.json';
let database = { users: [], tunings: [], auctions: [] };

if (fs.existsSync(dataPath)) {
    try {
        database = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (error) {
        console.error('讀取資料庫失敗，初始化為空。', error);
        saveDatabase();
    }
}

function saveDatabase() {
    fs.writeFileSync(dataPath, JSON.stringify(database, null, 2));
}

// 特定頻道 ID
const tuningChannelId = process.env.TUNING_CHANNEL_ID;
const auctionChannelId = process.env.AUCTION_CHANNEL_ID;
const logChannelId = process.env.LOG_CHANNEL_ID; // 新增的頻道 ID
const roleId = process.env.ROLE_ID; // 新增的身份組 ID

// Slash 指令註冊
const commands = [
    {
        name: 'register',
        description: '註冊玩家資料',
        options: [
            { name: 'username', type: 3, description: '你的名字', required: true },
            { name: 'avatar_url', type: 3, description: '頭像圖片 URL', required: true },
            { name: 'banner_url', type: 3, description: '封面圖片 URL', required: true },
            { name: 'bio', type: 3, description: '自我介紹', required: true },
            { name: 'discord-id', type: 3, description: 'Discord ID', required: true },
        ],
    },
    {
        name: 'search_player',
        description: '搜尋註冊玩家資料',
        options: [
            { name: 'username', type: 3, description: '玩家名稱', required: true },
        ],
    },
    {
        name: 'share_tuning',
        description: '分享調校代碼',
        options: [
            { name: 'car_name', type: 3, description: '車名', required: true },
            { name: 'share_code', type: 3, description: '調校分享代碼', required: true },
            { name: 'creator', type: 3, description: '創建者名稱', required: true },
        ],
    },
    {
        name: 'auction',
        description: '發布拍賣車輛',
        options: [
            { name: 'car_name', type: 3, description: '車名', required: true },
            { name: 'starting_bid', type: 10, description: '起標價', required: true },
            { name: 'buyout_price', type: 10, description: '直購價', required: true },
            { name: 'auction_time', type: 3, description: '拍賣時間', required: true },
            { name: 'xbox_username', type: 3, description: 'Xbox 玩家名字', required: true },
        ],
    },
    {
        name: 'auction_list',
        description: '查看所有拍賣車輛',
    },
];

// 註冊指令
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('正在註冊指令...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );
        console.log('指令註冊成功！');
    } catch (error) {
        console.error('指令註冊失敗：', error);
    }
})();

// 機器人事件
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'register') {
        const username = options.getString('username');
        const avatarUrl = options.getString('avatar_url');
        const bannerUrl = options.getString('banner_url');
        const bio = options.getString('bio');
        const discordId = options.getString('discord-id');

        if (database.users.find((user) => user.userId === interaction.user.id)) {
            return interaction.reply('你已經註冊過了！');
        }

        database.users.push({
            userId: interaction.user.id,
            username,
            avatarUrl,
            bannerUrl,
            bio,
            discordId,
            registeredAt: new Date().toISOString(),
        });

        saveDatabase();

        // 添加身份組
        try {
            await interaction.member.roles.add(roleId);
        } catch (error) {
            console.error('添加身份組失敗：', error);
            return interaction.reply('註冊成功，但添加身份組時出現錯誤。');
        }

        // 發送註冊訊息至特定頻道
        const logChannel = client.channels.cache.get(logChannelId);
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setTitle('用戶註冊通知')
                .setDescription(`用戶 <@${interaction.user.id}> 已成功註冊！`)
                .addFields(
                    { name: '名字', value: username },
                    { name: '註冊時間', value: new Date().toLocaleString() }
                )
                .setColor(0x00ff00)
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
        }

        interaction.reply('註冊成功！');
    }

    if (commandName === 'search_player') {
        const username = options.getString('username');
        const user = database.users.find((u) => u.username === username);
        if (!user) return interaction.reply('找不到該玩家！');

        const embed = new EmbedBuilder()
            .setTitle('玩家資訊')
            .setThumbnail(user.avatarUrl)
            .setImage(user.bannerUrl)
            .addFields(
                { name: '名字', value: user.username },
                { name: '自我介紹', value: user.bio },
                { name: 'discord-id', value: `<@${user.userId}>` }
            );

        interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'share_tuning') {
        const carName = options.getString('car_name');
        const shareCode = options.getString('share_code');
        const creator = options.getString('creator');

        database.tunings.push({ carName, shareCode, creator });
        saveDatabase();

        const channel = client.channels.cache.get(tuningChannelId);
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle('新調校分享')
                .addFields(
                    { name: '車名', value: carName },
                    { name: '分享代碼', value: shareCode },
                    { name: '建立者', value: creator }
                );

            channel.send({ embeds: [embed] });
        }

        interaction.reply('成功分享調校！');
    }

    if (commandName === 'auction') {
        const carName = options.getString('car_name');
        const startingBid = options.getNumber('starting_bid');
        const buyoutPrice = options.getNumber('buyout_price');
        const auctionTime = options.getString('auction_time');
        const xboxUsername = options.getString('xbox_username');

        database.auctions.push({
            carName,
            startingBid,
            buyoutPrice,
            auctionTime,
            xboxUsername,
            userId: interaction.user.id,
        });

        saveDatabase();

        const channel = client.channels.cache.get(auctionChannelId);
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle('新拍賣資訊')
                .addFields(
                    { name: '車名', value: carName },
                    { name: '起標價', value: startingBid.toString(), inline: true },
                    { name: '直購價', value: buyoutPrice.toString(), inline: true },
                    { name: '拍賣時間', value: auctionTime },
                    { name: 'Xbox 名稱', value: xboxUsername }
                )
                .setColor(0xFFD700)
                .setTimestamp();

            channel.send({ embeds: [embed] });
        }

        interaction.reply('拍賣資訊已成功發布！');
    }

    if (commandName === 'auction_list') {
        if (database.auctions.length === 0) {
            return interaction.reply('目前沒有任何拍賣資訊！');
        }

        const embed = new EmbedBuilder()
            .setTitle('拍賣車輛列表')
            .setColor(0x1E90FF);

        database.auctions.forEach((auction, index) => {
            embed.addFields({
                name: `拍賣 ${index + 1}`,
                value: `**車名：** ${auction.carName}\n**起標價：** ${auction.startingBid}\n**直購價：** ${auction.buyoutPrice}\n**拍賣時間：** ${auction.auctionTime}\n**Xbox 名稱：** ${auction.xboxUsername}`,
                inline: false
            });
        });

        interaction.reply({ embeds: [embed] });
    }
});

// 機器人登入
client.once('ready', () => {
    console.log(`已登入為 ${client.user.tag}`);
});

client.login(process.env.TOKEN);

