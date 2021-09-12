export interface SendMessagePayload {
  sender: string;
  receiver: string;
  message: string;
}

export interface GetMessageWithUserPayload {
  authUsername: string;
  otherUsername: string;
}
