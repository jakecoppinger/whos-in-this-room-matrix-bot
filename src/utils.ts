import { MatrixClient, Membership, MembershipEvent } from "matrix-bot-sdk";
import { RoomMember } from "./interfaces";

function getDisplayname(event: MembershipEvent): string | undefined {
  return event.content.displayname;
}

export function membershipEventToRoomMember(m: MembershipEvent): RoomMember {
  const memberStatus = m.content.membership === 'invite' || m.content.membership === 'join' ? m.content.membership : null;
  return {
    matrixUsername:
      m.sender, displayname: m.content.displayname, memberStatus
  }
}

/**
 * Get list of invited and joined room members
 * @param client 
 * @param roomId 
 * @returns 
 */
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
 * Returns the displayname if it exists (which it should). Otherwise returns the matrix username,
 * with the domain stripped and @ symbol removed.
 * @param m Room member object
 * @returns Formatted string
 */
export function usernameOrMatrixName(m: RoomMember): string {
  return m.displayname !== undefined && m.displayname !== ''
    ? m.displayname
    : m.matrixUsername.split(':')[0].replace('@','')
}

/**
 * Join strings by commads, but put an `and` before the last item. If only one item just returns that.
 * @param input 
 * @returns 
 */
export function joinWithCommandAndAnd(input: string[]): string {
  if(input.length == 1) {
    return input[0]
  }
  const last = input.pop();
  const result = input.join(', ') + ' and ' + last;
  return result;
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

  const matrixNames = justMatrixMembers
    .map(usernameOrMatrixName)

  const theMatrixUsersText =
    `The Matrix ${ justMatrixMembers.length === 1 ? `user is` : `users are`} ${joinWithCommandAndAnd(matrixNames)}`

  return `${prefix} are ${numHumans} people in this chat in total; ${numMatrixmembers - numMatrixBots} on Matrix and ${numSignalMembers
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