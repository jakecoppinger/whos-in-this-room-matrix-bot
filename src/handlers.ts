import { MatrixClient, LogService } from "matrix-bot-sdk";
import { matrixBotUsername } from "./config";
import { AnyMatrixEvent, MembershipType, RoomMember } from "./interfaces";
import { sendThreadReply } from "./matrix-api";
import { generateOverview, getInvitedAndJoinedMembers, getNumPeople, isASignalUser } from "./utils";

/**
 * Generate a response for the bot to send into the group, if any.
 * @param event The Matrix event being processed
 * @param allMembers A list of all members present in the room
 * @returns String if it should say something, null otherwise
 */
export async function generateResponseForRoomEvent(event: AnyMatrixEvent, allMembers: RoomMember[]): Promise<string[] | null> {
  if (Date.now() - event.origin_server_ts > 5000) {
    // Don't send notifications for events more than 4 seconds ago
    // Not great, but don't want to send for really old events.
    // We'd be better off ignoring events before our own join event but
    // I'd prefer not to have state. 
    return null;
  }

  if (event.type !== 'm.room.member') {
    // Don't say anything if the event has nothing to do with someone joining or leaving
    return null;
  }

  /** The Matrix username of the person who got invited */
  const invitedMatrixUser: string | undefined = event.state_key;
  if (invitedMatrixUser === undefined) {
    LogService.error("handlers", `No state key existed in invite event, not sending anything`);
    return null;
  }

  if (invitedMatrixUser === matrixBotUsername) {
    // Don't send notifications for our bot joining!
    return null;
  }

  const membershipEvent: MembershipType | undefined = event.content?.membership;

  const senderDisplayname: string | undefined = event.content?.displayname;

  /** This displayname is only stored for leave events */
  const displaynameOnLeave: string | undefined = event.unsigned?.prev_content?.displayname;

  /** Find any defined displayname if possible */
  const displayname: string | undefined = senderDisplayname ? senderDisplayname : displaynameOnLeave;
  const name = displayname ? displayname : invitedMatrixUser;

  // Send welcome notices for Signal users joining 
  if (isASignalUser(invitedMatrixUser) && membershipEvent === 'invite') {
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
      return [`${name} has left the chat (now ${people} people total)`];
    }
  }

  // Send notices for Matrix users joining
  if (!isASignalUser(invitedMatrixUser)) {
    // Doesn't handle users who aren't invited but join the room via a link.
    if (membershipEvent === 'invite') {
      const people = await getNumPeople(allMembers);
      return [`${name} invited to the chat (now ${people} people total)`];
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
    const message: string[] | null = await generateResponseForRoomEvent(event, members);
    if (message !== null && message.length > 0 && message.length <= 2) {
      const firstMessageId: string = await client.sendNotice(roomId, message[0]);
      if (message.length === 2) {
        await sendThreadReply(client, {
          roomId, root_event_id: firstMessageId,
          text: message[1]
        });
      }
    }
    await client.sendReadReceipt(roomId, event.event_id);
  }
}