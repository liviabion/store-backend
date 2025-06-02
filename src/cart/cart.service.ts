import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CartItem } from './entities/cart-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CartService {
  private cart: CartItem[] = [];

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async addToCart(data: AddToCartDto) {
    const product = await this.productRepo.findOneBy({ id: data.productId });
    if (!product) throw new NotFoundException('Product not found');

    const existing = this.cart.find(item => item.productId === data.productId);
    if (existing) {
      existing.quantity += data.quantity;
    } else {
      this.cart.push({
        productId: product.id,
        name: product.name,
        quantity: data.quantity,
        price: product.price,
      });
    }

    return { message: 'Added to cart', cart: this.cart };
  }

  getCart() {
    return this.cart;
  }

  removeItem(productId: number) {
    const index = this.cart.findIndex(i => i.productId === productId);
    if (index === -1) throw new NotFoundException('Item not found in cart');
    this.cart.splice(index, 1);
    return { message: 'Removed from cart' };
  }

  async checkout() {
    for (const item of this.cart) {
      const product = await this.productRepo.findOneBy({ id: item.productId });
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
      if (product.quantity < item.quantity)
        throw new BadRequestException(`Insufficient stock for ${product.name}`);

      product.quantity -= item.quantity;
      await this.productRepo.save(product);
    }

    const summary = [...this.cart];
    this.cart = [];

    return {
      message: 'Purchase completed successfully',
      total: summary.reduce((acc, item) => acc + item.quantity * item.price, 0),
      items: summary,
    };
  }
}
