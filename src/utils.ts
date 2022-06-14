import { MatrixClient, Membership, MembershipEvent } from "matrix-bot-sdk";
import { RoomMember } from "./interfaces";

function getDisplayname(event: MembershipEvent): string | undefined {
  return event.content.displayname;
}

function membershipEventToRoomMember(m: MembershipEvent): RoomMember {
  const memberStatus = m.content.membership === 'invite' || m.content.membership === 'join' ? m.content.membership : null;
  return {
    matrixUsername:
    m.sender, displayname: m.content.displayname, memberStatus
  }
}

export async function getInvitedAndJoinedMembers(client: MatrixClient, roomId: string): Promise<RoomMember[]> {
  const membershipEvents: MembershipEvent[] = await client.getRoomMembers(roomId);
  const onlyInvitedJoined = membershipEvents.filter(e => e.content.membership === 'join' || e.content.membership === 'invite');

  return onlyInvitedJoined.map(membershipEventToRoomMember);
}

/**
 * Check if a Matrix username is a Signal user (mocked via the bridge)
 * @param userId 
 * @returns boolean
 */
export function isASignalUser(matrixUsername: string): boolean {
  return matrixUsername.includes('@signal_')
}

/**
 * Check if a Matrix username is a bot
 * @param userId 
 * @returns boolean
 */
export function isABot(matrixUsername: string): boolean {
  return matrixUsername.includes('bot')
}

/**
 * Format a username like `Person (@matrixname:matrix.org)` if they have a displayname,
 * otherwise return the matrix username.
 * @param m Room member object
 * @returns Formatted string
 */
function prettyDisplayUsername(m: RoomMember): string {
return m.displayname
      ? `${m.displayname} (${m.matrixUsername})`
      : m.matrixUsername;
}

/**
 * Returns string explaining who is in the chat.
 * @param members List of room members
 * @param prefix What to start the string with. Defaults to `There`.
 * @returns String explaining how many people in the chat, and on what platforms.
 */
export function generateUserCounts(members: RoomMember[], prefix: string = `There`): string {
  const signalMembers = members.filter(m => isASignalUser(m.matrixUsername));
  const bots = members.filter(m => isABot(m.matrixUsername));

  const numMembers = members.length;
  const numSignalMembers: number = signalMembers.length;
  const numMatrixmembers = numMembers - numSignalMembers;
  const numMatrixBots = bots.length;
  const numHumans = numMembers - numMatrixBots;

  /** Only *people* on Matrix, not bots or Signal user mocks. */
  const justMatrixMembers: RoomMember[] = members
    .filter(member => !isABot(member.matrixUsername) && !isASignalUser(member.matrixUsername));

  const matrixNames: string = justMatrixMembers
    .slice(0,-1)
    .map(prettyDisplayUsername).join(', ');
    
  const theMatrixUsersText = justMatrixMembers.length === 1
    ? `The Matrix user is ${prettyDisplayUsername(justMatrixMembers[0])}`
    : `The Matrix users are ${matrixNames} and ${prettyDisplayUsername(justMatrixMembers[justMatrixMembers.length-1])}`

  return `${prefix} are ${numHumans} people in this chat in total; ${
    numMatrixmembers - numMatrixBots} on Matrix and ${numSignalMembers
    } on Signal. ${theMatrixUsersText}.\n`;
}

/**
 * Generate the welcome text for when a new Signal user joins, and needs an overview of who is in
 * the chat.
 * @param members 
 * @returns Announcement string
 */
export function generateOverview(members: RoomMember[]): string {
  return `👋 Hello, I'm a bot 😃\nThis chat is bridged between Signal & Matrix.\n
${generateUserCounts(members)}
To learn more see matrix.org/bridges/ or ask your host.`;
}

/** How many real people in the room? */
export async function getNumPeople(members: RoomMember[]): Promise<number> {
  const bots = members.filter(m => isABot(m.matrixUsername));
  return members.length - bots.length;
}

export function parseMatrixUsernamePretty(matrix_username: string): string {
  if (matrix_username.includes(":") === false || matrix_username.includes("@") === false) {
    return matrix_username;
  }
  const withoutUrl = matrix_username.split(':')[0];
  return withoutUrl.split('@')[1]
}