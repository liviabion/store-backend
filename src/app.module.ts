import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';
import { CartModule } from './cart/cart.module';
import { CartItem } from './cart/entities/cart-item.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [Product, CartItem],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Product]),
    ProductsModule,
    CartModule,
  ],
})
export class AppModule {}
