import { Test, TestingModule } from '@nestjs/testing';
import { UnitService } from './unit.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Unit } from './unit.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { MetricTypeService } from '../metric-type/metric-type.service';
import { MetricType } from '../metric-type/metric-type.entity';
import { MetricTypeNotFoundException } from 'src/exceptions/metric-type-not-found.exception';

describe('UnitService', () => {
  let service: UnitService;
  let repository: Repository<Unit>;
  let metricTypeService: MetricTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitService,
        {
          provide: getRepositoryToken(Unit),
          useClass: Repository, // Mock repository
        },
        {
          provide: MetricTypeService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UnitService>(UnitService);
    repository = module.get<Repository<Unit>>(getRepositoryToken(Unit));
    metricTypeService = module.get<MetricTypeService>(MetricTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
    expect(metricTypeService).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new unit', async () => {
      const createDto: CreateUnitDto = {
        name: 'Meter',
        symbol: 'm',
        conversionFactor: 1,
        isBaseUnit: true,
        metricTypeId: 1,
      };

      const metricType: MetricType = { id: 1, name: 'Length' } as MetricType;

      const createdUnit: Unit = {
        id: 1,
        ...createDto,
        metricType,
      } as unknown as Unit;

      jest
        .spyOn(metricTypeService, 'findOneById')
        .mockResolvedValue(metricType);
      jest.spyOn(repository, 'create').mockReturnValue(createdUnit);
      jest.spyOn(repository, 'save').mockResolvedValue(createdUnit);

      const result = await service.create(createDto);

      expect(metricTypeService.findOneById).toHaveBeenCalledWith(1);
      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        metricType,
      });
      expect(repository.save).toHaveBeenCalledWith(createdUnit);
      expect(result).toEqual(createdUnit);
    });

    it('should throw MetricTypeNotFoundException if metric type does not exist', async () => {
      jest.spyOn(metricTypeService, 'findOneById').mockResolvedValue(null);

      const createDto: CreateUnitDto = {
        name: 'Meter',
        symbol: 'm',
        conversionFactor: 1,
        isBaseUnit: true,
        metricTypeId: 999, // Non-existent metricTypeId
      };

      await expect(service.create(createDto)).rejects.toThrow(
        MetricTypeNotFoundException,
      );
      expect(metricTypeService.findOneById).toHaveBeenCalledWith(999);
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of units', async () => {
      const units: Unit[] = [
        { id: 1, name: 'Meter', symbol: 'm', conversionFactor: 1 } as Unit,
        {
          id: 2,
          name: 'Kilometer',
          symbol: 'km',
          conversionFactor: 1000,
        } as Unit,
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(units);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(units);
    });

    it('should return an empty array if no units exist', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOneById', () => {
    it('should return a unit by ID', async () => {
      const unit: Unit = {
        id: 1,
        name: 'Meter',
        symbol: 'm',
        conversionFactor: 1,
        metricType: { id: 1, name: 'Length' } as MetricType,
      } as Unit;

      jest.spyOn(repository, 'findOne').mockResolvedValue(unit);

      const result = await service.findOneById(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { metricType: true },
        select: {
          id: true,
          conversionFactor: true,
          name: true,
          metricType: {
            id: true,
            name: true,
          },
        },
      });
      expect(result).toEqual(unit);
    });

    it('should return null if no unit is found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.findOneById(999);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: { metricType: true },
        select: {
          id: true,
          conversionFactor: true,
          name: true,
          metricType: {
            id: true,
            name: true,
          },
        },
      });
      expect(result).toBeNull();
    });
  });
});
