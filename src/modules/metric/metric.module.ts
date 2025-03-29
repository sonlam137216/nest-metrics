import { Module } from '@nestjs/common';
import { MetricController } from './metric.controller';
import { MetricService } from './metric.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Metric } from './metric.entity';
import { UnitModule } from '../unit/unit.module';
import { MetricTypeModule } from '../metric-type/metric-type.module';

@Module({
  imports: [TypeOrmModule.forFeature([Metric]), UnitModule, MetricTypeModule],
  controllers: [MetricController],
  providers: [MetricService],
  exports: [MetricService],
})
export class MetricModule {}
