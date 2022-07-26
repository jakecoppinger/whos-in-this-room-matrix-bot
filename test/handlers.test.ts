
import { MatrixInviteEvent, MatrixJoinEvent, MatrixLeaveEvent } from '../src/interfaces';
import { generateResponseForRoomEvent } from '../src/handlers';
import { matrixBotUsername } from "../src/config";

describe("#generateResponseForRoomEvent()", () => {
  test("when a Signal user joins the bot summarises the room", async () => {
    const event: MatrixInviteEvent = {
      "content": {
        avatar_url: '',
        displayname: "Displayname for A",
        "membership": "invite"
      },
      "origin_server_ts": 99999999999999999,
      "sender": "@signal_15135135:matrix.org",
      "state_key": "@signal_15135135:matrix.org",
      "type": "m.room.member",
      "event_id": ""
    };

    const output = await generateResponseForRoomEvent(event, [
      { displayname: 'B', matrixUsername: '@b:matrix.org' },
      { matrixUsername: '@c:matrix.org' },
      { matrixUsername: '@signal_315r13:matrix.org' }]);
    expect(output).toMatchInlineSnapshot(`
"👋 Hello, I'm a bot 😃
This chat is bridged between Signal & Matrix.

There are 3 people in this chat in total; 2 on Matrix and 1 on Signal. The Matrix users are B and c.

To learn more see matrix.org/bridges/ or ask your host."
`);
  });
  test("when a Matrix user leave the bot sends a message", async () => {
    const event: MatrixLeaveEvent = {
      "content": {
        "membership": "leave"
      },
      "origin_server_ts": 99999999999999999,
      "sender": "@a:matrix.org",
      "state_key": "@a:matrix.org",
      "type": "m.room.member",
      "unsigned": {
        "replaces_state": "",
        "prev_content": {
          "avatar_url": "",
          "displayname": "Displayname for A",
          "membership": "invite"
        },
        "prev_sender": "@a:matrix.org"
      },
      "event_id": ""
    }

    const output = await generateResponseForRoomEvent(event, [
      { matrixUsername: '@b:matrix.org' }, { matrixUsername: '@c:matrix.org' }]);
    expect(output).toMatchInlineSnapshot(`"Displayname for A has left the chat (now 2 people total)"`);
  });

  test("when a Matrix user is invited the bot sends a message", async () => {
    const event: MatrixInviteEvent = {
      "content": {
        avatar_url: '',
        displayname: "Displayname for A",
        "membership": "invite"
      },
      "origin_server_ts": 99999999999999999,
      "sender": "@a:matrix.org",
      "state_key": "@a:matrix.org",
      "type": "m.room.member",
      "event_id": ""
    };

    const output = await generateResponseForRoomEvent(event, [{ matrixUsername: '@b:matrix.org' },
    { matrixUsername: '@c:matrix.org' }]);
    expect(output).toMatchInlineSnapshot(`"Displayname for A invited to the chat (now 2 people total)"`);
  });

  test("when the bot is invited it doesn't announce it's own invite", async () => {
    const event: MatrixInviteEvent = {
      "content": {
        avatar_url: '',
        displayname: "Who's in this room bot",
        "membership": "invite"
      },
      "origin_server_ts": 99999999999999999,
      "sender": matrixBotUsername,
      "state_key": matrixBotUsername,
      "type": "m.room.member",
      "event_id": ""
    };

    const output = await generateResponseForRoomEvent(event, [{ matrixUsername: '@b:matrix.org' },
    { matrixUsername: '@c:matrix.org' }, {matrixUsername: matrixBotUsername}]);
    expect(output).toMatchInlineSnapshot(`null`);
  });

  test("when a Matrix user joins the bot doesn't send a message", async () => {
    const event: MatrixJoinEvent = {
      "content": {
        avatar_url: '',
        displayname: "Displayname for A",
        "membership": "join"
      },
      "origin_server_ts": 99999999999999999,
      "sender": "@a:matrix.org",
      "state_key": "@a:matrix.org",
      "type": "m.room.member",
      "event_id": ""
    };

    const output = await generateResponseForRoomEvent(event, [{ matrixUsername: '@b:matrix.org' },
    { matrixUsername: '@c:matrix.org' }]);
    expect(output).toMatchInlineSnapshot(`null`);
  });


  test("when a Signal user leaves the bot doesn't send a message", async () => {
    const event: MatrixLeaveEvent = {
      "content": {
        "membership": "leave"
      },
      "origin_server_ts": 99999999999999999,
      "sender": "@signal_265:matrix.org",
      "state_key": "@signal_265:matrix.org",
      "type": "m.room.member",
      "event_id": "",
      "unsigned": {
        "replaces_state": "$PNxvcGtohwVH34wCYTPQJi7m0hA1ERS8iDjJlcfGNG0",
        "prev_content": {
          "membership": "invite",
          "displayname": "Displayname of A (Signal)",
          "avatar_url": ""
        },
        "prev_sender": "@signal_265:matrix.org",
        "age": 183
      },
    };

    const output = await generateResponseForRoomEvent(event, [{ matrixUsername: '@b:matrix.org' }, { matrixUsername: '@c:matrix.org' }]);
    expect(output).toMatchInlineSnapshot(`null`);
  });

  test("no message is sent when an event is in the past", async () => {
    const event: MatrixInviteEvent = {
      "content": {
        avatar_url: '',
        displayname: "Displayname for A",
        "membership": "invite"
      },
      "origin_server_ts": 0,
      "sender": "@a:matrix.org",
      "state_key": "@a:matrix.org",
      "type": "m.room.member",
      "event_id": ""
    };

    const output = await generateResponseForRoomEvent(event, [{ matrixUsername: '@b:matrix.org' },
    { matrixUsername: '@c:matrix.org' }]);
    expect(output).toMatchInlineSnapshot(`null`);
  });


  test("when a Signal user is kicked the bot doesn't send a message", async () => {
    const event: MatrixLeaveEvent = {
      "type": "m.room.member",
      "sender": "@host:matrix.org",
      "content": {
        "membership": "leave"
      },
      "state_key": "@signal_9b6:matrix.org",
      "origin_server_ts": 99999999999999999999,
      "unsigned": {
        "replaces_state": "",
        "prev_content": {
          "membership": "invite",
          "displayname": "Displayname of 9b6 (Signal)"
        },
        "prev_sender": "@signal_9b6:matrix.org",
        "age": 129
      },
      "event_id": ""
    }
    const output = await generateResponseForRoomEvent(event, [{ matrixUsername: '@b:matrix.org' },
    { matrixUsername: '@c:matrix.org' }]);
    expect(output).toMatchInlineSnapshot(`null`);
  });
});

