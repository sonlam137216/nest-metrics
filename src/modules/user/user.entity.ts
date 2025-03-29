import { AbstractEntity } from 'src/common/abstract-entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'users' })
export class User extends AbstractEntity {
  @Column({ nullable: true, type: 'varchar' })
  firstName!: string | null;

  @Column({ unique: true, nullable: true, type: 'varchar' })
  email!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  password!: string | null;

  // @OneToMany(() => Metric, (metric) => metric.user)
  // metrics: Metric[];
}
