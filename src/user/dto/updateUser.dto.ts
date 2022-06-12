import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  readonly username: string;

  @IsNotEmpty()
  readonly image: string;

  @IsNotEmpty()
  readonly bio: string;
}
