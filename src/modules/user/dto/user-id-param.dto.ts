import { IsNotEmpty, IsUUID } from 'class-validator';

export class UserIdParamDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
