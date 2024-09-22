import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { ValidGenres, ValidRates } from '../enums';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  title: string;

  @Column('text')
  description: string;

  @Column('text')
  posterUrl: string;

  @Column({
    array: true,
    type: 'enum',
    enum: ValidGenres,
  })
  genres: string[];

  @Column({
    type: 'enum',
    enum: ValidRates,
    default: ValidRates.TBA,
  })
  rate: string;

  @Column('bool', {
    default: true,
  })
  isAvailable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User)
  createdBy: User;

  @ManyToOne(() => User)
  updatedBy?: User;

  @ManyToOne(() => User)
  deletedBy?: User;
}
