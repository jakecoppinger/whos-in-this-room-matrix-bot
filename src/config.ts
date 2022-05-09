import * as dotenv from 'dotenv';
// Support .env file
dotenv.config();

/**
 * Howto get access token:
 * https://webapps.stackexchange.com/questions/131056/how-to-get-an-access-token-for-element-riot-matrix
 */
export const accessToken = process.env.MATRIX_ACCESS_TOKEN as string;
export const homeserverUrl = process.env.MATRIX_HOMESERVER_URL as string;
/** The full username: eg @bot:server.com */
export const matrixBotUsername = process.env.MATRIX_BOT_USERNAME as string;
export const matrixBotPassword = process.env.MATRIX_BOT_PASSWORD as string;

if(accessToken === undefined) {
  console.error("MATRIX_ACCESS_TOKEN env variable is undefined");
  process.exit(1);
}
if(homeserverUrl === undefined) {
  console.error("MATRIX_HOMESERVER_URL env variable is undefined");
  process.exit(1);
}
if(matrixBotUsername === undefined) {
  console.error("MATRIX_BOT_USERNAME env variable is undefined");
  process.exit(1);
}
if(matrixBotPassword === undefined) {
  console.error("MATRIX_BOT_PASSWORD env variable is undefined");
  process.exit(1);
}
