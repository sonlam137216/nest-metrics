import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Unit } from './unit.entity';
import { Repository } from 'typeorm';
import { CreateUnitDto } from './dto/create-unit.dto';
import { MetricTypeService } from '../metric-type/metric-type.service';
import { MetricTypeNotFoundException } from 'src/exceptions/metric-type-not-found.exception';

@Injectable()
export class UnitService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    private readonly metricTypeService: MetricTypeService,
  ) {}

  async create(createUnitDto: CreateUnitDto): Promise<Unit> {
    const { conversionFactor, isBaseUnit, metricTypeId, name, symbol } =
      createUnitDto;

    // validate metricTypeId
    const metricType = await this.metricTypeService.findOneById(metricTypeId);

    if (!metricType) throw new MetricTypeNotFoundException();

    const newUnit = this.unitRepository.create({
      conversionFactor,
      isBaseUnit,
      metricType,
      name,
      symbol,
    });

    await this.unitRepository.save(newUnit);

    return newUnit;
  }

  async findAll(): Promise<Unit[]> {
    const units = await this.unitRepository.find();
    return units;
  }

  async findOneById(id: number): Promise<Unit | null> {
    return this.unitRepository.findOne({
      where: { id },
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
  }
}
