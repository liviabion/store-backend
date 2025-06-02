import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [Product],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Product]),
    ProductsModule,
    CartModule,
  ],
})
export class AppModule {}
