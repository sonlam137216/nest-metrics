import { ApiPropertyOptional } from '@nestjs/swagger';
// import { AbstractDto } from 'src/common/dto/abstract.dto';

export class UnitDto {
  @ApiPropertyOptional()
  id: number;

  @ApiPropertyOptional()
  name: string;

  @ApiPropertyOptional()
  symbol: string;

  @ApiPropertyOptional()
  conversionFactor: number;

  @ApiPropertyOptional()
  isBaseUnit: boolean;
}
