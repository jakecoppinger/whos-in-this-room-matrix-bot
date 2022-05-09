
import { MatrixJoinEvent, MatrixLeaveEvent } from '../src/interfaces';
import { generateResponseForRoomEvent } from '../src/handlers';

describe("#generateResponseForRoomEvent()", () => {
  test("when a Signal user joins the bot summarises the room", async () => {
    const event: MatrixJoinEvent = {
      "content": {
        avatar_url: '',
        displayname: "Displayname for A",
        "membership": "join"
      },
      "origin_server_ts": 99999999999999999,
      "sender": "@signal_15135135:matrix.org",
      "state_key": "@signal_15135135:matrix.org",
      "type": "m.room.member",
      "event_id": ""
    };

    const output = await generateResponseForRoomEvent(event, ['@b:matrix.org', '@c:matrix.org, @signal_315r13:matrix.org']);
    expect(output).toMatchInlineSnapshot(`
"👋 Hello, I'm a bot 😃
This chat is bridged between Signal & Matrix.

There are 2 people in this chat in total; 1 on Matrix and 1 on Signal. The Matrix users are @b:matrix.org.

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
          "membership": "join"
        },
        "prev_sender": "@a:matrix.org"
      },
      "event_id": ""
    }

    const output = await generateResponseForRoomEvent(event, ['@b:matrix.org', '@c:matrix.org']);
    expect(output).toMatchInlineSnapshot(`"Displayname for A (@a:matrix.org) has left the chat (now 2 people total)"`);
  });
  test("when a Matrix user joins the bot sends a message", async () => {
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

    const output = await generateResponseForRoomEvent(event, ['@b:matrix.org', '@c:matrix.org']);
    expect(output).toMatchInlineSnapshot(`"Displayname for A (@a:matrix.org) has joined the chat (now 2 people total)"`);
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
          "membership": "join",
          "displayname": "Displayname of A (Signal)",
          "avatar_url": ""
        },
        "prev_sender": "@signal_265:matrix.org",
        "age": 183
      },
    };

    const output = await generateResponseForRoomEvent(event, ['@b:matrix.org', '@c:matrix.org']);
    expect(output).toMatchInlineSnapshot(`null`);
  });

  test("no message is sent when an event is in the past", async () => {
    const event: MatrixJoinEvent = {
      "content": {
        avatar_url: '',
        displayname: "Displayname for A",
        "membership": "join"
      },
      "origin_server_ts": 0,
      "sender": "@a:matrix.org",
      "state_key": "@a:matrix.org",
      "type": "m.room.member",
      "event_id": ""
    };

    const output = await generateResponseForRoomEvent(event, ['@b:matrix.org', '@c:matrix.org']);
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
          "membership": "join",
          "displayname": "Displayname of 9b6 (Signal)"
        },
        "prev_sender": "@signal_9b6:matrix.org",
        "age": 129
      },
      "event_id": ""
    }
    const output = await generateResponseForRoomEvent(event, ['@b:matrix.org', '@c:matrix.org']);
    expect(output).toMatchInlineSnapshot(`null`);
  });


});

