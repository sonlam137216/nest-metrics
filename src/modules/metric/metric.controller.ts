import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { MetricService } from './metric.service';
import { FindAllByTypeDto } from './dto/find-all-by-type.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateMetricDto } from './dto/create-metric.dto';
import { GetChartDataDto } from './dto/get-chart-data.dto';

@Controller('metrics')
@ApiTags('Metrics')
export class MetricController {
  constructor(private readonly metricService: MetricService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ type: CreateMetricDto })
  async create(@Body() createMetricDto: CreateMetricDto) {
    const newMetric = await this.metricService.create(createMetricDto);

    return newMetric;
  }

  @Get('chart')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ type: [CreateMetricDto] })
  async getChartData(@Query() getChartDataDto: GetChartDataDto) {
    const result = await this.metricService.getChartData(getChartDataDto);

    return result;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ type: [CreateMetricDto] })
  async findAllByType(@Query() findAllByTypeDto: FindAllByTypeDto) {
    const result = await this.metricService.findAllByType(findAllByTypeDto);

    return result;
  }
}
