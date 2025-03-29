import { AbstractEntity } from 'src/common/abstract-entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Unit } from '../unit/unit.entity';
import { Metric } from '../metric/metric.entity';

@Entity({ name: 'metric_types' })
export class MetricType extends AbstractEntity {
  @Column({ length: 50, unique: true })
  name: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @OneToMany(() => Unit, (unit) => unit.metricType)
  units: Unit[];

  @OneToMany(() => Metric, (metric) => metric.metricType)
  metrics: Metric[];
}
