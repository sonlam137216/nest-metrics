import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional } from 'class-validator';

export class GetChartDataDto {
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

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  endDate: Date;
}
