
type CommonMatrixEventFields = {
  origin_server_ts: number,
  sender: string,
  event_id: string
}

export type MatrixEvent = CommonMatrixEventFields & {
  content: Object;
}
export type MessageEvent = CommonMatrixEventFields & {
  content: {
    body: string,
    msgtype: "m.text" | string
    "org.matrix.msc1767.text"?: string
  },
  "type": "m.room.message",
  unsigned: Object;
}

export type MatrixRedactionEvent = CommonMatrixEventFields & {
  type: 'm.room.redaction',
  content: {};
  redacts: string;
}

export type MatrixReactionEvent = CommonMatrixEventFields & {
  type: "m.reaction",
  content: {
    'm.relates_to'?: {
      event_id: string
      /** The emoji itself */
      key: string
    }
  }
}
export type MatrixJoinEvent = CommonMatrixEventFields & {
  type: "m.room.member",
  content: {
    membership: "join",
    displayname?: string,
    avatar_url: string | null
  }
  state_key?: string
  unsigned?: Object;
}

export type MatrixUsername = string;

export type MatrixInviteEvent = CommonMatrixEventFields & {
  content: {
    avatar_url: string | null,
    displayname: string,
    membership: "invite"
  },
  origin_server_ts: number,
  sender: MatrixUsername,
  state_key: MatrixUsername,
  type: "m.room.member",
  unsigned: {
  },
  event_id: string
}
export type MembershipType = 'leave' | 'invite' | 'join'
export type MatrixLeaveEvent = CommonMatrixEventFields & {
  content: {
    avatar_url?: string | null,
    displayname?: string,
    membership: "leave"
  },
  origin_server_ts: number,
  sender: string,
  state_key: string,
  type: "m.room.member",
  unsigned: {
    replaces_state: string,
    prev_content?: {
      avatar_url?: string,
      displayname?: string,
      membership?: MembershipType
    },
    prev_sender: string
    age?: number
  },
  event_id?: string
}