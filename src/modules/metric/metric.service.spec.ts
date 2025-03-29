import { Test, TestingModule } from '@nestjs/testing';
import { MetricService } from './metric.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Metric } from './metric.entity';
import { UnitService } from '../unit/unit.service';
import { MetricTypeService } from '../metric-type/metric-type.service';
import { CreateMetricDto } from './dto/create-metric.dto';
import { UnitNotFoundException } from 'src/exceptions/unit-not-found.exception';
import { Unit } from '../unit/unit.entity';
import { MetricType } from '../metric-type/metric-type.entity';
import { FindAllByTypeDto } from './dto/find-all-by-type.dto';
import { GetChartDataDto } from './dto/get-chart-data.dto';
import { MetricTypeNotFoundException } from 'src/exceptions/metric-type-not-found.exception';

describe('MetricService', () => {
  let service: MetricService;
  let repository: Repository<Metric>;
  let unitService: UnitService;
  let metricTypeService: MetricTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricService,
        {
          provide: getRepositoryToken(Metric),
          useClass: Repository, // Mock repository
        },
        {
          provide: UnitService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
        {
          provide: MetricTypeService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MetricService>(MetricService);
    repository = module.get<Repository<Metric>>(getRepositoryToken(Metric));
    unitService = module.get<UnitService>(UnitService);
    metricTypeService = module.get<MetricTypeService>(MetricTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
    expect(unitService).toBeDefined();
    expect(metricTypeService).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a metric', async () => {
      const createDto: CreateMetricDto = {
        recordedAt: new Date(),
        hour: 10,
        minute: 30,
        unitId: 1,
        userId: 123,
        value: 50,
      };

      const unit: Unit = {
        id: 1,
        name: 'Kilogram',
        metricType: { id: 2, name: 'Mass' },
      } as Unit;

      const createdMetric: Metric = {
        id: 1,
        ...createDto,
        recordedAt: new Date('2025-03-29T10:30:00.000Z'),
        unit,
        metricType: unit.metricType,
      } as unknown as Metric;

      jest.spyOn(unitService, 'findOneById').mockResolvedValue(unit);
      jest.spyOn(repository, 'create').mockReturnValue(createdMetric);
      jest.spyOn(repository, 'save').mockResolvedValue(createdMetric);

      const result = await service.create(createDto);

      expect(unitService.findOneById).toHaveBeenCalledWith(1);
      expect(repository.create).toHaveBeenCalledWith({
        value: createDto.value,
        recordedAt: new Date('2025-03-29T10:30:00.000Z'),
        userId: createDto.userId,
        unit,
        metricType: unit.metricType,
      });
      expect(repository.save).toHaveBeenCalledWith(createdMetric);
      expect(result).toEqual(createdMetric);
    });

    it('should throw UnitNotFoundException if unit does not exist', async () => {
      jest.spyOn(unitService, 'findOneById').mockResolvedValue(null);

      const createDto: CreateMetricDto = {
        recordedAt: new Date(),
        hour: 10,
        minute: 30,
        unitId: 999,
        userId: 123,
        value: 50,
      };

      await expect(service.create(createDto)).rejects.toThrow(
        UnitNotFoundException,
      );
      expect(unitService.findOneById).toHaveBeenCalledWith(999);
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAllByType', () => {
    it('should return metrics without conversion', async () => {
      const findDto: FindAllByTypeDto = { metricTypeId: 1, userId: 123 };

      const metrics: Metric[] = [
        { id: 1, value: 100, unit: { id: 1, name: 'kg' } as Unit } as Metric,
      ];

      jest.spyOn(service, 'findMetrics').mockResolvedValue(metrics);

      const result = await service.findAllByType(findDto);

      expect(service.findMetrics).toHaveBeenCalledWith(123, 1);
      expect(result).toEqual(metrics);
    });

    it('should convert values when target unit is specified', async () => {
      const findDto: FindAllByTypeDto = {
        metricTypeId: 1,
        userId: 123,
        targetUnitId: 2,
      };

      const originalUnit: Unit = {
        id: 1,
        name: 'kg',
        conversionFactor: 1,
        metricType: { id: 1 },
      } as Unit;
      const targetUnit: Unit = {
        id: 2,
        name: 'g',
        conversionFactor: 1000,
        metricType: { id: 1 },
      } as Unit;

      const metrics: Metric[] = [
        { id: 1, value: 1, unit: originalUnit } as Metric,
      ];

      jest.spyOn(service, 'findMetrics').mockResolvedValue(metrics);
      jest.spyOn(unitService, 'findOneById').mockResolvedValue(targetUnit);
      jest.spyOn(service, 'convertValue').mockReturnValue(1000);

      const result = await service.findAllByType(findDto);

      expect(unitService.findOneById).toHaveBeenCalledWith(2);
      expect(result[0].value).toBe(1000);
      expect(result[0].unit).toEqual(targetUnit);
    });

    it('should throw UnitNotFoundException if target unit does not exist', async () => {
      const findDto: FindAllByTypeDto = {
        metricTypeId: 1,
        userId: 123,
        targetUnitId: 999,
      };

      jest.spyOn(service, 'findMetrics').mockResolvedValue([]);
      jest.spyOn(unitService, 'findOneById').mockResolvedValue(null);

      await expect(service.findAllByType(findDto)).rejects.toThrow(
        UnitNotFoundException,
      );
      expect(unitService.findOneById).toHaveBeenCalledWith(999);
    });
  });

  describe('getChartData', () => {
    it('should return latest metrics per day', async () => {
      const chartDto: GetChartDataDto = {
        metricTypeId: 1,
        userId: 123,
        startDate: new Date(),
        endDate: new Date(),
      };

      const metricType: MetricType = { id: 1, name: 'Mass' } as MetricType;

      const metrics: Metric[] = [
        {
          id: 1,
          value: 100,
          recordedAt: new Date('2025-03-29T08:00:00Z'),
        } as Metric,
        {
          id: 2,
          value: 110,
          recordedAt: new Date('2025-03-29T09:00:00Z'),
        } as Metric,
      ];

      jest
        .spyOn(metricTypeService, 'findOneById')
        .mockResolvedValue(metricType);
      jest.spyOn(service, 'findMetrics').mockResolvedValue(metrics);
      jest
        .spyOn(service, 'getLatestMetricPerDay')
        .mockReturnValue([metrics[1]]);

      const result = await service.getChartData(chartDto);

      expect(result).toEqual([metrics[1]]);
    });

    it('should throw MetricTypeNotFoundException if metric type does not exist', async () => {
      jest.spyOn(metricTypeService, 'findOneById').mockResolvedValue(null);

      const chartDto: GetChartDataDto = {
        metricTypeId: 999,
        userId: 123,
        startDate: new Date(),
        endDate: new Date(),
      };

      await expect(service.getChartData(chartDto)).rejects.toThrow(
        MetricTypeNotFoundException,
      );
      expect(metricTypeService.findOneById).toHaveBeenCalledWith(999);
    });
  });
});
