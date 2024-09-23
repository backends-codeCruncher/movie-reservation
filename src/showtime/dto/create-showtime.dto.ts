import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateShowtimeDto {
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  capacity?: number;
}
