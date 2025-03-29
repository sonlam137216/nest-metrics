import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { HealthCheckerModule } from './modules/health-checker/health-checker.module';
import { UserModule } from './modules/user/user.module';
import { ApiConfigService } from './shared/services/api-config.service';
import { SharedModule } from './shared/shared.module';
import { MetricTypeModule } from './modules/metric-type/metric-type.module';
import { UnitModule } from './modules/unit/unit.module';
import { MetricModule } from './modules/metric/metric.module';

@Module({
  imports: [
    // ThrottlerModule.forRootAsync({
    //   imports: [SharedModule],
    //   useFactory: (configService: ApiConfigService) => ({
    //     throttlers: [configService.throttlerConfigs],
    //   }),
    //   inject: [ApiConfigService],
    // }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ApiConfigService) =>
        configService.postgresConfig,
      inject: [ApiConfigService],
      dataSourceFactory: (options) => {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return Promise.resolve(
          addTransactionalDataSource(new DataSource(options)),
        );
      },
    }),
    HealthCheckerModule,
    UserModule,
    MetricTypeModule,
    UnitModule,
    MetricModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
