const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);

    // Manejar mensajes entrantes
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const sender = msg.key.remoteJid;
        const messageType = Object.keys(msg.message)[0];
        const messageContent = msg.message.conversation || msg.message[messageType].caption || '';

        console.log('Mensaje recibido de:', sender);
        console.log('Tipo de mensaje:', messageType);
        console.log('Contenido del mensaje:', messageContent);

        // Manejar comando /hola
        if (messageContent.toLowerCase() === '/hola') {
            const response = 'Hola, ¿cómo estás?';
            await sock.sendMessage(sender, { text: response });
        }
    });

    // Manejar desconexiones
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom) ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut : false;
            console.log('Conexión cerrada, intentando reconectar...', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('Conectado exitosamente a WhatsApp');
        }
    });
}

connectToWhatsApp().catch(err => {
    console.error('Error al conectar a WhatsApp:', err);
});
