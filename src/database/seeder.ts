import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { MetricType } from 'src/modules/metric-type/metric-type.entity';
import { Unit } from 'src/modules/unit/unit.entity';
import { ApiConfigService } from 'src/shared/services/api-config.service';
import { initializeTransactionalContext } from 'typeorm-transactional';

async function seedDatabase() {
  initializeTransactionalContext();
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ApiConfigService);

  const dataSource = new DataSource(configService.postgresConfig as any);
  await dataSource.initialize();
  console.log('Database connected! Seeding data...');

  const metricTypeRepo = dataSource.getRepository(MetricType);
  const unitRepo = dataSource.getRepository(Unit);

  // Insert Metric Types
  const metricTypes = [
    { name: 'Distance', description: null },
    { name: 'Temperature', description: null },
  ];

  for (const type of metricTypes) {
    const exists = await metricTypeRepo.findOneBy({ name: type.name });
    if (!exists) {
      await metricTypeRepo.save(metricTypeRepo.create(type));
    }
  }

  // Get Metric Type IDs
  const distanceType = await metricTypeRepo.findOneBy({ name: 'Distance' });
  const temperatureType = await metricTypeRepo.findOneBy({
    name: 'Temperature',
  });

  if (!distanceType || !temperatureType) {
    throw new Error('Metric types not found!');
  }

  // Insert Units
  const units = [
    {
      name: 'Meter',
      symbol: 'm',
      conversionFactor: 1.0,
      isBaseUnit: true,
      metricType: distanceType,
    },
    {
      name: 'Centimeter',
      symbol: 'cm',
      conversionFactor: 0.01,
      isBaseUnit: false,
      metricType: distanceType,
    },
    {
      name: 'Inch',
      symbol: 'inch',
      conversionFactor: 0.0254,
      isBaseUnit: false,
      metricType: distanceType,
    },
    {
      name: 'Feet',
      symbol: 'feet',
      conversionFactor: 0.3048,
      isBaseUnit: false,
      metricType: distanceType,
    },
    {
      name: 'Yard',
      symbol: 'yard',
      conversionFactor: 0.9144,
      isBaseUnit: false,
      metricType: distanceType,
    },
    {
      name: 'Celsius',
      symbol: 'C',
      conversionFactor: 1.0,
      isBaseUnit: true,
      metricType: temperatureType,
    },
    {
      name: 'Fahrenheit',
      symbol: 'F',
      conversionFactor: 0.0,
      isBaseUnit: false,
      metricType: temperatureType,
    },
    {
      name: 'Kelvin',
      symbol: 'K',
      conversionFactor: 0.0,
      isBaseUnit: false,
      metricType: temperatureType,
    },
  ];

  for (const unit of units) {
    const exists = await unitRepo.findOneBy({ name: unit.name });
    if (!exists) {
      await unitRepo.save(unitRepo.create(unit));
    }
  }

  console.log('Database seeding complete!');
  await dataSource.destroy();
  await app.close();
}

seedDatabase().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});
