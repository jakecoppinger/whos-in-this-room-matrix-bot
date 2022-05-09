import { MatrixClient } from "matrix-bot-sdk";
import { matrixBotUsername } from "./config";
import { MembershipType } from "./interfaces";
import { createIntroductionString, getNumPeople, isASignalUser } from "./utils";

export async function generateResponseForRoomEvent(event: any, allMembers: string[]): Promise<string | null> {
  if(event.sender === matrixBotUsername) {
    // Don't send notifications for our bot joining!
    return null;
  }
  if(Date.now() - event.origin_server_ts > 5000 ) {
    // Don't send notifications for events more than 4 seconds ago
    // Not great, but don't want to send for really old events.
    // We'd be better off ignoring events before our own join event but
    // I'd prefer not to have state. 
    return null;
  }
  const matrixSender: string = event.sender;

  if (event.type !== 'm.room.member') {
    return null;
  }
  const membershipEvent: MembershipType | undefined = event.content?.membership;

  const senderDisplayname: string | undefined = event.content?.displayname;
  /** This displayname is only stored for leave events */
  const displaynameOnLeave: string | undefined = event.unsigned?.prev_content?.displayname;
  /** Find any defined displayname if possible */
  const displayname: string | undefined = senderDisplayname ? senderDisplayname : displaynameOnLeave;
  const name = displayname ? `${displayname} (${matrixSender})` : matrixSender;

  // Send welcome notices for Signal users joining 
  if (isASignalUser(matrixSender) && membershipEvent === 'join') {
    return createIntroductionString(allMembers);
  }

  // Send notices for Matrix users joining or leaving
  if (!isASignalUser(matrixSender)) {
    if (membershipEvent === 'join') {
      const people = await getNumPeople(allMembers);
      return `${name} has joined the chat (now ${people} people total)`;
    } else if (membershipEvent === 'leave') {
      const people = await getNumPeople(allMembers);
      return `${name} has left the chat (now ${people} people total)`;
    }
  }
  return null;
}

export async function handleRoomEvent(client: MatrixClient) {
  return async (roomId: string, event: any) => {
    const allMembers = await client.getJoinedRoomMembers(roomId);
    const message = await generateResponseForRoomEvent(event, allMembers);
    console.log("room.event:");
    console.log(JSON.stringify(event, null, 2));
    if (message !== null) {
      client.sendMessage(roomId, {
        "msgtype": "m.notice",
        "body": message
      });
    }
  }
}