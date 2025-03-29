import { Module } from '@nestjs/common';
import { MetricTypeController } from './metric-type.controller';
import { MetricTypeService } from './metric-type.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricType } from './metric-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MetricType])],
  controllers: [MetricTypeController],
  providers: [MetricTypeService],
  exports: [MetricTypeService],
})
export class MetricTypeModule {}
