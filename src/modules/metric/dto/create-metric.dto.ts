import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, Max, Min } from 'class-validator';

export class CreateMetricDto {
  @ApiProperty()
  @IsNumber()
  value: number;

  @ApiProperty({ default: '2025-03-29' })
  @IsDate()
  @Type(() => Date)
  recordedAt: Date;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(23)
  hour: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(59)
  minute: number;

  @ApiProperty({ default: 1 })
  @IsNumber()
  userId: number;

  @ApiProperty()
  @IsNumber()
  unitId: number;
}
