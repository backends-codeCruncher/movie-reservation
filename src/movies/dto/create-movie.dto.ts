import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  posterUrl: string;

  @IsArray()
  @IsString({ each: true })
  genres: string[];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  rate?: string;
}
