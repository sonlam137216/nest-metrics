import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Metric } from './metric.entity';
import { Between, Repository } from 'typeorm';
import { CreateMetricDto } from './dto/create-metric.dto';
import { UnitService } from '../unit/unit.service';
import { UnitNotFoundException } from 'src/exceptions/unit-not-found.exception';
import { MetricTypeService } from '../metric-type/metric-type.service';
import { MetricTypeNotFoundException } from 'src/exceptions/metric-type-not-found.exception';
import { Unit } from '../unit/unit.entity';
import { EMetricType, ETemperature } from 'src/constants/metric-type';
import { FindAllByTypeDto } from './dto/find-all-by-type.dto';
import { GetChartDataDto } from './dto/get-chart-data.dto';

@Injectable()
export class MetricService {
  constructor(
    @InjectRepository(Metric)
    private metricRepository: Repository<Metric>,
    private readonly unitService: UnitService,
    private readonly metricTypeService: MetricTypeService,
  ) {}

  async create(createMetricDto: CreateMetricDto) {
    const { recordedAt, hour, minute, unitId, userId, value } = createMetricDto;

    // validate unit
    const unit = await this.unitService.findOneById(unitId);

    if (!unit) throw new UnitNotFoundException();

    const recordedAtDate = new Date(recordedAt);
    recordedAtDate.setHours(hour, minute, 0, 0);

    const newMetric = this.metricRepository.create({
      value,
      recordedAt: recordedAtDate,
      userId,
      unit,
      metricType: unit.metricType,
    });

    await this.metricRepository.save(newMetric);
    return newMetric;
  }

  /**
   * Get all metrics by type with optional unit conversion
   */
  async findAllByType(findAllByTypeDto: FindAllByTypeDto) {
    const { metricTypeId, userId, targetUnitId } = findAllByTypeDto;

    const metrics = await this.findMetrics(userId, metricTypeId);

    // If target unit specified, convert values
    if (targetUnitId) {
      const targetUnit = await this.unitService.findOneById(targetUnitId);
      if (!targetUnit) throw new UnitNotFoundException();

      return metrics.map((metric) => ({
        ...metric,
        originalValue: metric.value,
        originalUnit: metric.unit,
        value: this.convertValue(metric.value, metric.unit, targetUnit),
        unit: targetUnit,
      }));
    }

    return metrics;
  }

  public async findMetrics(
    userId: number,
    metricTypeId: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const adjustedEndDate = endDate ? new Date(endDate) : undefined;
    if (adjustedEndDate) {
      adjustedEndDate.setHours(23, 59, 59, 999);
    }

    const metrics = await this.metricRepository.find({
      where: {
        userId,
        metricType: { id: metricTypeId },
        ...(startDate && endDate
          ? { recordedAt: Between(startDate, adjustedEndDate) }
          : {}),
      },
      relations: {
        unit: {
          metricType: true,
        },
      },
      select: {
        unit: {
          id: true,
          name: true,
          conversionFactor: true,
          metricType: {
            id: true,
            name: true,
          },
        },
      },
      order: { recordedAt: 'DESC' },
    });

    return metrics;
  }

  async getChartData(getChartDataDto: GetChartDataDto) {
    // Calculate date range
    const { metricTypeId, endDate, startDate, userId, targetUnitId } =
      getChartDataDto;

    // Verify metric type exists
    const metricType = await this.metricTypeService.findOneById(metricTypeId);
    if (!metricType) throw new MetricTypeNotFoundException();

    // Get target unit if specified
    let targetUnit = null;
    if (targetUnitId) {
      targetUnit = await this.unitService.findOneById(targetUnitId);
      if (!targetUnit) throw new UnitNotFoundException();
    }

    // Query to get all metrics in the date range
    const metrics = await this.findMetrics(
      userId,
      metricTypeId,
      startDate,
      endDate,
    );

    // Process metrics to get latest per day
    const latestPerDay = this.getLatestMetricPerDay(metrics);

    // Convert values if target unit is specified
    if (targetUnit) {
      return latestPerDay.map((metric) => ({
        ...metric,
        originalValue: metric.value,
        originalUnit: metric.unit,
        value: this.convertValue(metric.value, metric.unit, targetUnit),
        unit: targetUnit,
      }));
    }

    return latestPerDay;
  }

  public getLatestMetricPerDay(metrics: Metric[]) {
    const latestMetricsByDay = new Map();

    metrics.forEach((metric) => {
      const day = new Date(metric.recordedAt).toISOString().split('T')[0]; // Get YYYY-MM-DD

      if (
        !latestMetricsByDay.has(day) ||
        new Date(metric.recordedAt) >
          new Date(latestMetricsByDay.get(day).recordedAt)
      ) {
        latestMetricsByDay.set(day, metric);
      }
    });

    return Array.from(latestMetricsByDay.values()).sort(
      (a, b) =>
        new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
    );
  }

  public convertValue(value: number, fromUnit: Unit, toUnit: Unit): number {
    if (fromUnit.metricType.id !== toUnit.metricType.id) {
      throw new Error('Cannot convert between different metric types');
    }

    const metricTypeName = fromUnit.metricType.name;

    switch (metricTypeName) {
      case EMetricType.DISTANCE:
        return this.convertDistance(value, fromUnit, toUnit);
      case EMetricType.TEMPERATURE:
        return this.convertTemperature(value, fromUnit, toUnit);
      default:
        throw new Error(
          `Conversion not implemented for metric type: ${metricTypeName}`,
        );
    }
  }

  private convertDistance(value: number, fromUnit: Unit, toUnit: Unit): number {
    // Convert to base unit first, then to target unit
    const valueInBaseUnit = value * fromUnit.conversionFactor;
    return valueInBaseUnit / toUnit.conversionFactor;
  }

  private convertTemperature(
    value: number,
    fromUnit: Unit,
    toUnit: Unit,
  ): number {
    // Convert to Celsius as the base unit
    const valueInCelsius = this.toCelsius(value, fromUnit.name);

    // Convert from Celsius to the target unit
    return this.fromCelsius(valueInCelsius, toUnit.name);
  }

  private toCelsius(value: number, fromUnit: string): number {
    switch (fromUnit) {
      case ETemperature.CELSIUS:
        return value;
      case ETemperature.FAHRENHEIT:
        return ((value - 32) * 5) / 9;
      case ETemperature.KELVIN:
        return value - 273.15;
      default:
        throw new Error(`Unsupported temperature unit: ${fromUnit}`);
    }
  }

  private fromCelsius(value: number, toUnit: string): number {
    switch (toUnit) {
      case ETemperature.CELSIUS:
        return value;
      case ETemperature.FAHRENHEIT:
        return (value * 9) / 5 + 32;
      case ETemperature.KELVIN:
        return value + 273.15;
      default:
        throw new Error(`Unsupported temperature unit: ${toUnit}`);
    }
  }
}
