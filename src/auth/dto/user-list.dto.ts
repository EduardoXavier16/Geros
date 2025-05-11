import { ApiProperty } from '@nestjs/swagger';

export class UserListDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  isAdmin: boolean;

  @ApiProperty()
  phoneNumber: string;
}
