import { PasswordTransformer } from 'src/common/helper/password.transformer';

import { UserRole } from 'src/enums/role.enum';
import { Tasks } from 'src/tasks/schema/tasks.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  username: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({
    name: 'password',
    // this is for the password encryption
    transformer: new PasswordTransformer(),
  })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn({ name: 'create_time', nullable: true })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', nullable: true })
  updateTime: Date | null;

  @Column()
  refreshToken: string;
  // exclude password from the response
  toJSON() {
    const { password, refreshToken, ...self } = this;
    return self;
  }

  /*                                foreign key                                */

  @OneToMany(() => Tasks, (task) => task.user)
  @JoinTable()
  tasks: Tasks[];
}
