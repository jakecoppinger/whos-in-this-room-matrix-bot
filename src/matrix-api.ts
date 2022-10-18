import {
   MatrixClient,
  LogService
} from "matrix-bot-sdk";

export async function getDisplayname(client: MatrixClient, matrix_username: string): Promise<string | undefined> {
  let displayname: string | undefined;
  try {
    displayname = (await client.getUserProfile(matrix_username)).displayname;
  } catch (e) {
    LogService.error("index", `Failed to retrieve displayname for user ${matrix_username}: ${e}`);
  }
  return displayname;
}

/**
 * Send a thread reply.
 * @param client Matrix client
 * @param param1 Object containing text, root_event_id and roomId. root_event_id is the event_id
 * of the message the thread "replying" to.
 */
 export async function sendThreadReply(client: MatrixClient, { text, root_event_id, roomId }: { text: string, root_event_id: string, roomId: string }): Promise<void> {
  const content = {
    body: text,
    msgtype: "m.text",
    "org.matrix.msc1767.text": text,
    "m.relates_to": {
      event_id: root_event_id,
      is_falling_back: true,
      "m.in_reply_to": {
        "event_id": root_event_id
      },
      rel_type: "m.thread"
    }
  }
  await client.sendEvent(roomId, "m.room.message", content);
}