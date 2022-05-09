export function isASignalUser(userId: string): boolean {
  return userId.includes('@signal_')
}
export function isABot(userId: string): boolean {
  return userId.includes('bot')
}

export function generateUserCounts(members: string[]): string {
  const signalMembers = members.filter(isASignalUser);
  const bots = members.filter(isABot);

  const numMembers = members.length;
  const numSignalMembers: number = signalMembers.length;
  const numMatrixmembers = numMembers - numSignalMembers;
  const numMatrixBots = bots.length;
  const numHumans = numMembers - numMatrixBots;

  const matrixNameList: string[] = members.filter(member => !isABot(member) && !isASignalUser(member));
  const matrixNames: string = matrixNameList.join(', ');

  return `There are ${numHumans} people in this chat in total; ${numMatrixmembers - numMatrixBots} on Matrix
and ${numSignalMembers} on Signal. The Matrix users are ${matrixNames}.\n`

}

export function generateOverview(members: string[]): string {
  return `👋 Hello, I'm a bot 😃\nThis chat is bridged between Signal & Matrix.\n
${generateUserCounts(members)}
To learn more see matrix.org/bridges/ or ask your host.`;
}

/** How many real people in the room? */
export async function getNumPeople(members: string[]): Promise<number> {
  const bots = members.filter(isABot);
  return members.length - bots.length;
}


export function parseMatrixUsernamePretty(matrix_username: string): string {
  if (matrix_username.includes(":") === false || matrix_username.includes("@") === false) {
    return matrix_username;
  }
  const withoutUrl = matrix_username.split(':')[0];
  return withoutUrl.split('@')[1]
}