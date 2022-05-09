import {
  MatrixAuth, MatrixClient, SimpleFsStorageProvider, AutojoinRoomsMixin,
  LogService, LogLevel,
  RichConsoleLogger,
} from "matrix-bot-sdk";
import { homeserverUrl, matrixBotPassword, matrixBotUsername } from './config'
import { parseMatrixUsernamePretty } from './utils';
import {handleRoomEvent} from './handlers';

LogService.setLogger(new RichConsoleLogger());

LogService.setLevel(LogLevel.DEBUG);

// Shows the Matrix sync loop details - not needed most of the time
// LogService.setLevel(LogLevel.TRACE);

// LogService.muteModule("Metrics");
LogService.trace = LogService.debug;

const storage = new SimpleFsStorageProvider("./data/bot.json");
let client: MatrixClient;


async function main() {
  const botUsernameWithoutDomain = parseMatrixUsernamePretty(matrixBotUsername);
  const authedClient = await (new MatrixAuth(homeserverUrl)).passwordLogin(botUsernameWithoutDomain, matrixBotPassword);
  client = new MatrixClient(authedClient.homeserverUrl, authedClient.accessToken, storage);

  // Automatically join rooms the bot is invited to
  AutojoinRoomsMixin.setupOnClient(client);

  client.on("room.failed_decryption", (roomId, event, error) => {
    // handle `m.room.encrypted` event that could not be decrypted
    LogService.error("index", `Failed decryption event!\n${{ roomId, event, error }}`);
  });

  client.on("room.join", (roomId: string, event: any) => {
    console.log({ event });
    LogService.info("index", `Bot joined room ${roomId}`);
    client.sendMessage(roomId, {
      "msgtype": "m.notice",
      "body": `👋 Hello, I'm the Who's In This Room Bot 😃\n
Each time a Signal user joins the chat I'll send a message saying how many people are in the chat on the Matrix side (as they can't see).
      
I'll also let them know when Matrix users join or leave.\n
For questions or feedback jump into #somewhere:somewhere.org.`,
    });
  });

  client.on("room.event",  await handleRoomEvent(client));

  LogService.info("index", "Starting bot...");
  await client.start()
  LogService.info("index", "Bot started!");
}

main();