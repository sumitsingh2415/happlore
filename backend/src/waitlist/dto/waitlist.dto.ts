import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JoinWaitlistDto {
  @ApiProperty({ example: 'traveller@email.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'web' })
  @IsOptional()
  @IsString()
  source?: string;
}
