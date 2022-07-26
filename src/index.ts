import {
  MatrixAuth, MatrixClient, SimpleFsStorageProvider, AutojoinRoomsMixin,
  LogService, LogLevel,
  RichConsoleLogger,
} from "matrix-bot-sdk";
import { homeserverUrl, matrixBotPassword, matrixBotUsername } from './config'
import { generateUserCounts, getInvitedAndJoinedMembers, parseMatrixUsernamePretty } from './utils';
import { handleRoomEvent } from './handlers';

LogService.setLogger(new RichConsoleLogger());

// Shows the Matrix sync loop details - not needed most of the time
// LogService.setLevel(LogLevel.DEBUG);

LogService.setLevel(LogLevel.INFO);

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

  client.on("room.join", async (roomId: string, _event: any) => {
    LogService.info("index", `Bot joined room ${roomId}`);

    const members = await getInvitedAndJoinedMembers(client, roomId);
    client.sendMessage(roomId, {
      "msgtype": "m.notice",
      "body": `👋 Hello, I'm the Who's In This Room Bot 😃\n
Each time a Signal user joins the chat I'll send a message saying how many people are in the chat on the Matrix side (as they can't see). I'll also let them know when Matrix users join or leave.\n
Currently, ${generateUserCounts(members, 'there')}
For questions or feedback jump into #whos-in-this-room-bot-discussion:jakecopp.chat or see github.com/jakecoppinger/whos-in-this-room-matrix-bot`,
    });
  });

  client.on("room.event", await handleRoomEvent(client));

  LogService.info("index", "Starting bot...");
  await client.start()
  LogService.info("index", "Bot started!");
}

main();