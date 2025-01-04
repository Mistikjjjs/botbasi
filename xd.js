const makeWASocket = require("@whiskeysockets/baileys").default;
const { Boom } = require('@hapi/boom');
const NodeCache = require("node-cache");
const readline = require("readline");
const PhoneNumber = require('awesome-phonenumber');
const cfonts = require('cfonts');
const pino = require('pino');
const chalk = require('chalk');

// Variables Configurables
let phoneNumber = "32460220392"; // cambiar número
const prefixo = "/"; // Cambiar Prefijo Aquí
const wm = "Juls Modders"; // Cambiar creador
const botname = "Anita-v6"; // Cambiar nombre del bot
const numerodono = "+32460247707"; // cambiar número
const themeemoji = "🥰"; // cambiar emoji

// Dependencias adicionales
const {
    default: JulsBotIncConnect,
    getAggregateVotesInPollMessage,
    delay,
    PHONENUMBER_MCC,
    makeCacheableSignalKeyStore,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    makeInMemoryStore,
    jidDecode,
    proto
} = require("@whiskeysockets/baileys");

// Configuración de la Consola
const store = makeInMemoryStore({
    logger: pino().child({ level: 'silent', stream: 'store' })
});

const banner = cfonts.render('Anita Bot | 6.0', {
    font: 'tiny',
    align: 'center',
    background: 'transparent',
    letterSpacing: 1,
    lineHeight: 1,
    space: true,
    maxLength: '0',
    gradient: ['blue', 'yellow'],
    independentGradient: true,
    transitionGradient: true,
    env: 'node',
});

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));
const color = (text, color) => (!color ? chalk.yellow(text) : chalk.keyword(color)(text));

// Funciones Utilitarias
function getGroupAdmins(participants) {
    let admins = [];
    for (let i of participants) {
        if (i.admin === 'admin') admins.push(i.id);
        if (i.admin === 'superadmin') admins.push(i.id);
    }
    return admins;
}

// Inicio del Bot
async function startProo() {
    // Variables de Sesión y Autenticación
    const { version, isLatest } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const msgRetryCounterCache = new NodeCache();

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !phoneNumber || process.argv.includes("--pairing-code"),
        mobile: process.argv.includes("--mobile"),
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' }))
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        getMessage: async msg => {
            let jid = jidDecode(msg.remoteJid);
            return await store.loadMessage(jid, msg.id)?.message || '';
        },
        msgRetryCounterCache,
        defaultQueryTimeoutMs: undefined
    });

    store.bind(sock.ev);

    // Bloque Ofuscado
    function _0x4cf1(_0x398f11, _0x5d887d) {
        const _0x2c06f3 = _0x2c06();
        return _0x4cf1 = function (_0x4cf186, _0x177a47) {
            _0x4cf186 = _0x4cf186 - 0x1ea;
            let _0x2038cd = _0x2c06f3[_0x4cf186];
            return _0x2038cd;
        }, _0x4cf1(_0x398f11, _0x5d887d);
    }
    const _0x13243b = _0x4cf1;
    (function (_0x2a5c55, _0x1c7ac7) {
        const _0x126f84 = _0x4cf1, _0x27717d = _0x2a5c55();
        while (!![]) {
            try {
                const _0x4e0ca7 = parseInt(_0x126f84(0x1f8)) / 0x1 + parseInt(_0x126f84(0x1ff)) / 0x2 * (parseInt(_0x126f84(0x204)) / 0x3) + parseInt(_0x126f84(0x1fe)) / 0x4 * (parseInt(_0x126f84(0x1f4)) / 0x5) + -parseInt(_0x126f84(0x1fb)) / 0x6 + -parseInt(_0x126f84(0x1ea)) / 0x7 + -parseInt(_0x126f84(0x1ef)) / 0x8 + -parseInt(_0x126f84(0x1f6)) / 0x9;
                if (_0x4e0ca7 === _0x1c7ac7) break;
                else _0x27717d['push'](_0x27717d['shift']());
            } catch (_0x31bd4b) {
                _0x27717d['push'](_0x27717d['shift']());
            }
        }
    }(_0x2c06, 0xd66b7));

    function _0x2c06() {
        const _0x1bbd11 = ['1637373LZnyZs', 'Cannot\x20use\x20pairing\x20code\x20with\x20mobile\x20api', 'some', 'redBright', 'child', 'bgBlack', 'match', 'Your\x20Pairing\x20Code\x20:\x20', '1250522JShAKL', 'requestPairingCode', 'startsWith', 'white', 'Chrome', '9897888veqNgu', 'silent', 'Start\x20with\x20country\x20code\x20of\x20your\x20WhatsApp\x20Number,\x20Example\x20:\x20+32460220392', 'loadMessage', 'join', '3095530dIuEjy', 'replace', '985968qabeqv', 'black', '1465506gzUlAn', 'remoteJid', 'creds', '1360236TOTwHA', 'keys', 'greenBright', '4gBEQlq', '2csqFkw', 'bgGreen', 'registered', 'fatal', 'Please\x20type\x20your\x20WhatsApp\x20number\x20ðŸ˜\x0aFor\x20example:\x20+32460220392\x20:\x20'];
        _0x2c06 = function () { return _0x1bbd11; };
        return _0x2c06();
    }

    // Eventos de Conexión
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        try {
            if (connection === 'close') {
                let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                switch (reason) {
                    case DisconnectReason.badSession:
                        console.log('Bad Session File, Please Delete Session and Scan Again');
                        startProo();
                        break;
                    case DisconnectReason.connectionClosed:
                        console.log('Connection closed, reconnecting...');
                        startProo();
                        break;
                    case DisconnectReason.connectionLost:
                        console.log('Connection Lost from Server, reconnecting...');
                        startProo();
                        break;
                    case DisconnectReason.connectionReplaced:
                        console.log('Connection Replaced, Please Close Current Session');
                        break;
                    case DisconnectReason.loggedOut:
                        console.log('Device Logged Out, Please Delete Session and Scan Again');
                        startProo();
                        break;
                    case DisconnectReason.restartRequired:
                        console.log('Restart Required, Restarting...');
                        startProo();
                        break;
                    case DisconnectReason.timedOut:
                        console.log('Connection TimedOut, Reconnecting...');
                        startProo();
                        break;
                    default:
                        sock.end(`Unknown DisconnectReason: ${reason}`);
                        break;
                }
            }

            if (update.connection === 'connecting') {
                console.log(color('\n🌿Connecting...', 'yellow'));
            }

            if (update.connection === 'open') {
                console.log(color(` `, 'magenta'));
                await delay(1999);
                console.log(banner.string);
                console.log(color('< ================================================== >', 'cyan'));
                console.log(color(`${themeemoji} Suscribete: https://youtube.com/@guedelinnovation?si=VBPQxp1udNZim9tV`, 'magenta'));
                console.log(color('< ================================================== >', 'cyan'));
                console.log(color(`${themeemoji} Creador Oficial: Juls Modders`, 'magenta'));
            }
        } catch (err) {
            console.log('Error in Connection.update ' + err);
            startProo();
        }
    });

    // Guardar Credenciales
    sock.ev.on('creds.update', saveCreds);

    // Manejo de Mensajes
    sock.ev.on('messages.upsert', async (m) => {
        try {
            const info = m.messages[0];
            if (!info.message) return;
            if (info.key && info.key.remoteJid === "status@broadcast") return;

            const type = Object.keys(info.message)[0];
            const body = type === 'conversation' ? info.message.conversation : '';
            const isCmd = body.startsWith(prefixo);
            const comando = isCmd ? body.slice(1).split(/ +/).shift().toLowerCase() : null;

            switch (comando) {
                case 'prueba':
                    sock.sendMessage(info.key.remoteJid, { text: "Prueba activa" });
                    break;
                case 'bot':
                    sock.sendMessage(info.key.remoteJid, { text: "Hola soy un bot" });
                    break;
                default:
                    break;
            }
        } catch (e) {
            console.log('Error : %s', color(e, 'yellow'));
        }
    });
}

// Ejecutar el bot
startProo();