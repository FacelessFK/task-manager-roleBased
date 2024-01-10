import { Priority } from 'src/enums/priority.enum';
import { Users } from 'src/users/schema/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'tasks' })
export class Tasks extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  Priority: Priority;

  @Column({ nullable: true })
  filePath: string;

  @CreateDateColumn({ name: 'create_time', nullable: true })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', nullable: true })
  updateTime: Date | null;

  // exclude password from the response

  /*                                foreign key                                */

  //   @ManyToOne(() => Users, (user) => user.tasks)
  //   user: Tasks[];
  @ManyToOne(() => Users, (user) => user.tasks)
  user: Users;
}
