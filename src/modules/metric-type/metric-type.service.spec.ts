import { Test, TestingModule } from '@nestjs/testing';
import { MetricTypeService } from './metric-type.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MetricType } from './metric-type.entity';
import { CreateMetricTypeDto } from './dto/create-metric-type.dto';

describe('MetricTypeService', () => {
  let service: MetricTypeService;
  let repository: Repository<MetricType>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricTypeService,
        {
          provide: getRepositoryToken(MetricType),
          useClass: Repository, // Mock repository
        },
      ],
    }).compile();

    service = module.get<MetricTypeService>(MetricTypeService);
    repository = module.get<Repository<MetricType>>(
      getRepositoryToken(MetricType),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new metric type', async () => {
      const createDto: CreateMetricTypeDto = {
        name: 'Length',
        description: 'Measures distance',
      };

      const createdMetricType: MetricType = {
        id: 1,
        name: createDto.name,
        description: createDto.description,
      } as MetricType;

      jest.spyOn(repository, 'create').mockReturnValue(createdMetricType);
      jest.spyOn(repository, 'save').mockResolvedValue(createdMetricType);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(createdMetricType);
      expect(result).toEqual(createdMetricType);
    });
  });

  describe('findOneById', () => {
    it('should return a metric type by ID', async () => {
      const id = 1;
      const metricType: MetricType = {
        id,
        name: 'Weight',
        description: 'Measures mass',
      } as MetricType;

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(metricType);

      const result = await service.findOneById(id);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id });
      expect(result).toEqual(metricType);
    });

    it('should return null if no metric type is found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      const result = await service.findOneById(999);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 999 });
      expect(result).toBeNull();
    });
  });
});
