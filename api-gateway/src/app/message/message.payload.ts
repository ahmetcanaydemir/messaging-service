import { ApiProperty } from '@nestjs/swagger';

export class SendMessagePayload {
  sender: string;

  @ApiProperty({
    example: 'yoda',
  })
  receiver: string;

  @ApiProperty({
    example: 'hello, how are u?',
  })
  message: string;
}

export interface GetMessageWithUserPayload {
  authUsername: string;
  otherUsername: string;
}

export class MessageResponse {
  @ApiProperty({
    example: '613a29143f3ee85b7b4ad9e1',
  })
  id: string;

  @ApiProperty({
    example: 'hello, how are u?',
  })
  message: string;

  @ApiProperty({
    example: 'gandalf',
  })
  sender: string;

  @ApiProperty({
    example: 'yoda',
  })
  receiver: string;

  @ApiProperty({
    example: '2021-09-09T16:48:22.208Z',
  })
  createdAt: string;
}
