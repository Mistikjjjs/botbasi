const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const token = '7878507254:AAGZ4i6ZPAnQKqBH4qAO2n-XCMU6Dl5E-Us';
const bot = new TelegramBot(token, {polling: true});

// Comando /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '¡Hola! Soy tu bot de Telegram. Usa /tiktok <URL> para descargar videos de TikTok.');
});

// Comando /tiktok
bot.onText(/\/tiktok (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const url = match[1];

    try {
        const response = await axios.get(`https://darkcore-api.onrender.com/api/tiktok?url=${url}`);
        const data = response.data.result;

        if (response.data.success) {
            // Descargar el video
            const videoPath = path.resolve(__dirname, 'video.mp4');
            const videoWriter = fs.createWriteStream(videoPath);
            const videoResponse = await axios({
                url: data.mp4,
                method: 'GET',
                responseType: 'stream'
            });
            videoResponse.data.pipe(videoWriter);
            await new Promise((resolve, reject) => {
                videoWriter.on('finish', resolve);
                videoWriter.on('error', reject);
            });

            // Descargar el audio
            const audioPath = path.resolve(__dirname, 'audio.mp3');
            const audioWriter = fs.createWriteStream(audioPath);
            const audioResponse = await axios({
                url: data.mp3,
                method: 'GET',
                responseType: 'stream'
            });
            audioResponse.data.pipe(audioWriter);
            await new Promise((resolve, reject) => {
                audioWriter.on('finish', resolve);
                audioWriter.on('error', reject);
            });

            // Enviar el video y el audio
            await bot.sendVideo(chatId, videoPath, {caption: `📹 *Título:* ${data.titulo}\n👤 *Autor:* ${data.author}`, parse_mode: 'Markdown'});
            await bot.sendAudio(chatId, audioPath);

            // Eliminar los archivos locales
            fs.unlinkSync(videoPath);
            fs.unlinkSync(audioPath);
        } else {
            bot.sendMessage(chatId, 'No se pudo descargar el video. Por favor, verifica la URL e inténtalo de nuevo.');
        }
    } catch (error) {
        bot.sendMessage(chatId, 'Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.');
    }
});

// Manejar otros mensajes
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (!msg.text.startsWith('/')) {
        bot.sendMessage(chatId, 'Comando no reconocido. Usa /tiktok <URL> para descargar videos de TikTok.');
    }
});
