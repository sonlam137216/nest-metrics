import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { CreateMetricTypeDto } from './dto/create-metric-type.dto';
import { MetricTypeDto } from './dto/metric-type.dto';
import { MetricTypeService } from './metric-type.service';

@Controller('metric-types')
@ApiTags('Metric Types')
export class MetricTypeController {
  constructor(private readonly metricTypeService: MetricTypeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: MetricTypeDto })
  async create(@Body() createMetricTypeDto: CreateMetricTypeDto) {
    const newMeTricType =
      await this.metricTypeService.create(createMetricTypeDto);

    return newMeTricType;
  }
}
