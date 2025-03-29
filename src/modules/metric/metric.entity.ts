import { AbstractEntity } from 'src/common/abstract-entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { MetricType } from '../metric-type/metric-type.entity';
import { Unit } from '../unit/unit.entity';

@Entity({ name: 'metrics' })
@Index(['userId', 'metricType', 'recordedAt'])
// @Index(['user', 'metricType', 'recordedAt'], { order })
export class Metric extends AbstractEntity {
  @Column('decimal', { precision: 20, scale: 10 })
  value: number;

  @Column()
  recordedAt: Date;

  //   @ManyToOne(() => User, (user) => user.metrics)
  //   @JoinColumn({ name: 'user_id' })
  //   user: User;
  @Column()
  userId: number;

  @ManyToOne(() => MetricType, (metricType) => metricType.metrics)
  @JoinColumn({ name: 'metric_type_id' })
  metricType: MetricType;

  @ManyToOne(() => Unit, (unit) => unit.metrics)
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;
}
