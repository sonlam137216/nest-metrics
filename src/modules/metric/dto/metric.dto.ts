import { ApiPropertyOptional } from '@nestjs/swagger';

export class MetricDto {
  @ApiPropertyOptional()
  value: number;

  @ApiPropertyOptional()
  recordedAt: Date;
}
