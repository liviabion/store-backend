import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CartItem } from './entities/cart-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async addToCart(data: AddToCartDto) {
    const product = await this.productRepo.findOneBy({ id: data.productId });
    if (!product) throw new NotFoundException('Product not found');

    let item = await this.cartRepo.findOneBy({ productId: data.productId });

    if (item) {
      item.quantity += data.quantity;
    } else {
      item = this.cartRepo.create({
        productId: product.id,
        name: product.name,
        quantity: data.quantity,
        price: product.price,
      });
    }

    await this.cartRepo.save(item);
    const cart = await this.cartRepo.find();
    return { message: 'Added to cart', cart };
  }

  async getCart() {
    return await this.cartRepo.find();
  }

  async removeItem(productId: number) {
    const item = await this.cartRepo.findOneBy({ productId });
    if (!item) throw new NotFoundException('Item not found in cart');

    await this.cartRepo.remove(item);
    return { message: 'Removed from cart' };
  }

  async checkout() {
    const cart = await this.cartRepo.find();

    for (const item of cart) {
      const product = await this.productRepo.findOneBy({ id: item.productId });
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
      if (product.quantity < item.quantity)
        throw new BadRequestException(`Insufficient stock for ${product.name}`);

      product.quantity -= item.quantity;
      await this.productRepo.save(product);
    }

    const total = cart.reduce((acc, item) => acc + item.quantity * item.price, 0);
    await this.cartRepo.clear();

    return {
      message: 'Purchase completed successfully',
      total,
      items: cart,
    };
  }
}
