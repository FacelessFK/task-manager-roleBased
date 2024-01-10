import { IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  id: number;
  @IsNotEmpty({ message: 'please add a username' })
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsOptional()
  avatar?: string;

  @IsNotEmpty({ message: 'please add a password' })
  @MinLength(4)
  @MaxLength(20)
  password: string;

  refreshToken?: string;
}
