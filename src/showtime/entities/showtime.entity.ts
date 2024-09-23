import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  Unique,
} from 'typeorm';
import { Movie } from '../../movies/entities/movie.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('showtimes')
@Unique(['startTime', 'movie'])
export class Showtime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('timestamp')
  startTime: Date;

  @Column('timestamp')
  endTime: Date;

  @Column('int', {
    default: 100,
  })
  capacity: number;

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

  @ManyToOne(() => Movie, (movie) => movie.id)
  movie: Movie;

  @ManyToOne(() => User)
  createdBy: User;

  @ManyToOne(() => User)
  updatedBy?: User;

  @ManyToOne(() => User)
  deletedBy?: User;
}
