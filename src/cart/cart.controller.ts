import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  add(@Body() dto: AddToCartDto) {
    return this.cartService.addToCart(dto);
  }

  @Get()
  getCart() {
    return this.cartService.getCart();
  }

  @Delete(':productId')
  remove(@Param('productId') id: string) {
    return this.cartService.removeItem(+id);
  }

  @Post('checkout')
  checkout() {
    return this.cartService.checkout();
  }
}
