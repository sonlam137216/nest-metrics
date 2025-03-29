import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MetricType } from './metric-type.entity';
import { Repository } from 'typeorm';
import { CreateMetricTypeDto } from './dto/create-metric-type.dto';

@Injectable()
export class MetricTypeService {
  constructor(
    @InjectRepository(MetricType)
    private metricTypeRepository: Repository<MetricType>,
  ) {}

  async create(createMetricTypeDto: CreateMetricTypeDto) {
    const { name, description } = createMetricTypeDto;

    const newMeTricType = this.metricTypeRepository.create({
      name,
      description,
    });

    await this.metricTypeRepository.save(newMeTricType);

    return newMeTricType;
  }

  async findOneById(id: number) {
    return this.metricTypeRepository.findOneBy({ id });
  }
}
