import { ApiPropertyOptional } from '@nestjs/swagger';

// import { AbstractDto } from 'src/common/dto/abstract.dto.js';

export class MetricTypeDto {
  @ApiPropertyOptional()
  name: string;

  @ApiPropertyOptional()
  description?: string;
}
