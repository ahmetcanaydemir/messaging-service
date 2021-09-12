import { ApiProperty } from '@nestjs/swagger';

export class LoginRegisterPayload {
  @ApiProperty({ example: 'gandalf' })
  username: string;

  @ApiProperty({ example: '123' })
  password: string;
}

export interface GetUserPayload {
  username: string;
}

export interface BlockUserPayload {
  authUsername: string;
  blockUsername: string;
}
