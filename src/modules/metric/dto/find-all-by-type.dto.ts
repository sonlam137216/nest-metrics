import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class FindAllByTypeDto {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  userId: number;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  metricTypeId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  targetUnitId?: number;
}
