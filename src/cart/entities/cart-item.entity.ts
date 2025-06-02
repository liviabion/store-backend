import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column()
  quantity: number;

  @Column()
  name: string;

  @Column('decimal')
  price: number;
}
