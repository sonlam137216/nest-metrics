import { Module } from '@nestjs/common';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unit } from './unit.entity';
import { MetricTypeModule } from '../metric-type/metric-type.module';

@Module({
  imports: [TypeOrmModule.forFeature([Unit]), MetricTypeModule],
  controllers: [UnitController],
  providers: [UnitService],
  exports: [UnitService],
})
export class UnitModule {}
