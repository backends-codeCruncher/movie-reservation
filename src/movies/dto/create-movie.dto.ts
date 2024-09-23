import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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

  @IsNumber()
  @Type(() => Number)
  runtime: number;

  @IsArray()
  @IsString({ each: true })
  genres: string[];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  rate?: string;
}
