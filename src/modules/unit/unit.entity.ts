import { AbstractEntity } from 'src/common/abstract-entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { MetricType } from '../metric-type/metric-type.entity';
import { Metric } from '../metric/metric.entity';

@Entity({ name: 'units' })
export class Unit extends AbstractEntity {
  @Column({ length: 50, unique: true })
  name: string;

  @Column({ length: 10 })
  symbol: string;

  @ManyToOne(() => MetricType, (metricType) => metricType.units)
  @JoinColumn({ name: 'metric_type_id' })
  metricType: MetricType;

  @Column('decimal', { precision: 20, scale: 10 })
  conversionFactor: number;

  @Column({ default: false })
  isBaseUnit: boolean;

  @OneToMany(() => Metric, (metric) => metric.unit)
  metrics: Metric[];
}
