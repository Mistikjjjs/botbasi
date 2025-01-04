import {
  makeWASocket,
  useMultiFileAuthState,
  Browsers,
} from "@whiskeysockets/baileys";
import { createInterface } from "node:readline";
import { path } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import pino from "pino";
import { Collection } from "@discordjs/collection";
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";

// Configuración de ffmpeg
ffmpeg.setFfmpegPath(path);

// Interfaz para preguntas en consola
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Función para realizar preguntas
const question = (txt) => new Promise((resolve) => rl.question(txt, resolve));

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const socket = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    browser: Browsers.appropriate("chrome"),
  });

  socket.commands = new Collection();

  // Si no está registrado, pedir número de teléfono y código de emparejamiento
  if (!socket.authState.creds.registered) {
    const number = await question("Escribe tu número de WhatsApp: ");
    const formatNumber = number.replace(/[\s+\-()]/g, "");
    const code = await socket.requestPairingCode(formatNumber);
    console.log(`Tu código de conexión es: ${code}`);
  }

  // Cargar los controladores
  const directory = await readdir(resolve("src", "handlers"));
  for (const file of directory) {
    (await import(`./handlers/${file}`)).default(socket);
  }

  // Manejadores de eventos
  socket.ev.on("creds.update", saveCreds);

  // Configurar comandos
  socket.commands.set("ping", async (m) => {
    await socket.sendMessage(m.key.remoteJid, { text: "Pong!" });
  });

  socket.commands.set("hola", async (m) => {
    await socket.sendMessage(m.key.remoteJid, { text: "¡Hola! ¿Cómo puedo ayudarte?" });
  });

  socket.commands.set("adios", async (m) => {
    await socket.sendMessage(m.key.remoteJid, { text: "¡Hasta luego!" });
  });

  // Escuchar mensajes entrantes
  socket.ev.on("messages.upsert", async ({ messages }) => {
    const message = messages[0];
    if (message.message && message.message.conversation) {
      const text = message.message.conversation;
      const command = text.toLowerCase().split(" ")[0];  // Convertir a minúsculas para no diferenciar mayúsculas/minúsculas
      if (socket.commands.has(command)) {
        await socket.commands.get(command)(message);
      }
    }
  });
}

// Conectar el bot a WhatsApp
connectToWhatsApp().catch(console.error);

// Manejo de excepciones global
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);
process.on("uncaughtExceptionMonitor", console.error);
