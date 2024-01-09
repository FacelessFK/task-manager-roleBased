import { PasswordTransformer } from 'src/common/helper/password.transformer';
import { IsUnique } from 'src/common/validator/unique.validator';
import { UserRole } from 'src/enums/role.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @IsUnique()
  @Column()
  username: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({
    name: 'password',
    length: 255,
    // this is for the password encryption
    transformer: new PasswordTransformer(),
  })
  password: string;

  @Column({ default: UserRole.USER })
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
}
