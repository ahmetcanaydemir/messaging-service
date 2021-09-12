export interface RegisterUserPayload {
  username: string;
  password: string;
}

export interface GetUserPayload {
  username: string;
}

export interface BlockUserPayload {
  authUsername: string;
  blockUsername: string;
}
