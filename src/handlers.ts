import { MatrixClient} from "matrix-bot-sdk";
import { matrixBotUsername } from "./config";
import { AnyMatrixEvent, MembershipType, RoomMember } from "./interfaces";
import { generateOverview, getInvitedAndJoinedMembers, getNumPeople, isASignalUser } from "./utils";

/**
 * Generate a response for the bot to send into the group, if any.
 * @param event The Matrix event being processed
 * @param allMembers A list of all members present in the room
 * @returns String if it should say something, null otherwise
 */
export async function generateResponseForRoomEvent(event: AnyMatrixEvent, allMembers: RoomMember[]): Promise<string | null> {
  if (event.sender === matrixBotUsername) {
    // Don't send notifications for our bot joining!
    return null;
  }
  if (Date.now() - event.origin_server_ts > 5000) {
    // Don't send notifications for events more than 4 seconds ago
    // Not great, but don't want to send for really old events.
    // We'd be better off ignoring events before our own join event but
    // I'd prefer not to have state. 
    return null;
  }
  /** The Matrix username of the person who sent the event */
  const matrixSender: string = event.sender;

  if (event.type !== 'm.room.member') {
    // Don't say anything if the event has nothing to do with someone joining or leaving
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
    return generateOverview(allMembers);
  }

  if (membershipEvent === 'leave') {
    // The actual person leaving should be in the unsigned data
    // The sender may be the host (if they're kicking them)
    const personLeaving = event.unsigned?.prev_sender
      ? event.unsigned.prev_sender
      : event.sender;
    if (!isASignalUser(personLeaving)) {
      const people = await getNumPeople(allMembers);
      return `${name} has left the chat (now ${people} people total)`;
    }
  }

  // Send notices for Matrix users joining or leaving
  if (!isASignalUser(matrixSender)) {
    if (membershipEvent === 'join') {
      const people = await getNumPeople(allMembers) + 1; // The new person isn't in the current list!
      return `${name} has joined the chat (now ${people} people total)`;
    }
  }
  return null;
}

/**
 * Run when *any* room event is received. The bot only sends a message if needed.
 * @param client 
 * @returns Room event handler, which itself returnings nothing
 */
export async function handleRoomEvent(client: MatrixClient): Promise<(roomId: string, event: any) => Promise<void>> {
  return async (roomId: string, event: any) => {
    const members = await getInvitedAndJoinedMembers(client, roomId);
    const message = await generateResponseForRoomEvent(event, members);
    if (message !== null) {
      client.sendMessage(roomId, {
        "msgtype": "m.notice",
        "body": message
      });
    }
  }
}