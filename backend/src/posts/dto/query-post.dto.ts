import { IsNumberString, IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryPostDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsUUID()
  toolId?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsNumberString()
  seed?: string;

  @IsOptional()
  @IsNumberString()
  offset?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
