import {
  makeWASocket,
  useMultiFileAuthState,
  Browsers,
} from "@whiskeysockets/baileys";
import { createInterface } from "node:readline";
import pino from "pino";
import { Collection } from "@discordjs/collection";

// Interfaz para preguntas en consola
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Función para realizar preguntas
const question = (txt) => new Promise((resolve) => rl.question(txt, resolve));

async function connectToWhatsApp() {
  // Usamos el estado de autenticación en múltiples archivos
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  // Creamos la conexión con el socket de WhatsApp usando Baileys
  const socket = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }), // Configuración para desactivar los logs
    browser: Browsers.appropriate("chrome"), // Usa un navegador adecuado
  });

  socket.commands = new Collection();

  // Si no está registrado, pedimos el número y el código de emparejamiento
  if (!socket.authState.creds.registered) {
    const number = await question("Escribe tu número de WhatsApp: ");
    const formatNumber = number.replace(/[\s+\-()]/g, "");
    const code = await socket.requestPairingCode(formatNumber);
    console.log(`Tu código de conexión es: ${code}`);
  }

  // Configuración de comandos
  socket.commands.set("ping", async (m) => {
    await socket.sendMessage(m.key.remoteJid, { text: "Pong!" });
  });

  socket.commands.set("hola", async (m) => {
    await socket.sendMessage(m.key.remoteJid, { text: "¡Hola! ¿Cómo puedo ayudarte?" });
  });

  socket.commands.set("adios", async (m) => {
    await socket.sendMessage(m.key.remoteJid, { text: "¡Hasta luego!" });
  });

  // Escuchar mensajes entrantes y procesarlos
  socket.ev.on("messages.upsert", async ({ messages }) => {
    const message = messages[0];
    if (message.message && message.message.conversation) {
      const text = message.message.conversation.toLowerCase(); // Convertir a minúsculas
      const command = text.split(" ")[0];  // Extraer el primer "palabra" (comando)

      // Verificar si el comando existe en la colección de comandos
      if (socket.commands.has(command)) {
        await socket.commands.get(command)(message);
      }
    }
  });

  // Guardar las credenciales de autenticación al actualizar
  socket.ev.on("creds.update", saveCreds);
}

// Conectar el bot a WhatsApp
connectToWhatsApp().catch(console.error);
