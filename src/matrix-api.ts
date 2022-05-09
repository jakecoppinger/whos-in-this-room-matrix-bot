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
