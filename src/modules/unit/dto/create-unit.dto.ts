import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateUnitDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @Transform(({ value }) => value?.trim())
  symbol: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  metricTypeId: number;

  @ApiProperty()
  @IsNumber()
  conversionFactor: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isBaseUnit: boolean;
}
