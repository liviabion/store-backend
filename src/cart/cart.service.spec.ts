import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { Repository } from 'typeorm';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockProductRepo = () => ({
  findOneBy: jest.fn(),
  save: jest.fn(),
});

describe('CartService', () => {
  let service: CartService;
  let productRepo: jest.Mocked<Repository<Product>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(Product),
          useFactory: mockProductRepo,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    productRepo = module.get(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add a product to the cart', async () => {
    const dto: AddToCartDto = { productId: 1, quantity: 2 };
    productRepo.findOneBy.mockResolvedValue({ id: 1, name: 'Test', price: 10, quantity: 10 } as Product);

    const result = await service.addToCart(dto);

    expect(productRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result.cart.length).toBe(1);
    expect(result.cart[0].quantity).toBe(2);
  });

  it('should throw if product not found when adding to cart', async () => {
    productRepo.findOneBy.mockResolvedValue(null);

    await expect(service.addToCart({ productId: 99, quantity: 1 })).rejects.toThrow(NotFoundException);
  });

  it('should return cart contents', async () => {
    productRepo.findOneBy.mockResolvedValue({ id: 1, name: 'Test', price: 10, quantity: 10 } as Product);
    await service.addToCart({ productId: 1, quantity: 1 });

    const result = service.getCart();

    expect(result.length).toBe(1);
    expect(result[0].productId).toBe(1);
  });

  it('should remove item from cart', async () => {
    productRepo.findOneBy.mockResolvedValue({ id: 1, name: 'Test', price: 10, quantity: 10 } as Product);
    await service.addToCart({ productId: 1, quantity: 1 });

    const result = service.removeItem(1);

    expect(result).toEqual({ message: 'Removed from cart' });
    expect(service.getCart().length).toBe(0);
  });

  it('should throw if removing non-existing item', () => {
    expect(() => service.removeItem(123)).toThrow(NotFoundException);
  });

  it('should checkout and update stock', async () => {
    const product = { id: 1, name: 'Test', price: 10, quantity: 10 } as Product;
    productRepo.findOneBy.mockResolvedValue(product);
    productRepo.save.mockResolvedValue(product);

    await service.addToCart({ productId: 1, quantity: 2 });

    const result = await service.checkout();

    expect(productRepo.save).toHaveBeenCalled();
    expect(result.total).toBe(20);
    expect(result.items.length).toBe(1);
    expect(service.getCart().length).toBe(0);
  });

  it('should throw if product not found on checkout', async () => {
    (service as any).cart.push({ productId: 1, quantity: 1 });

    productRepo.findOneBy.mockResolvedValue(null);

    await expect(service.checkout()).rejects.toThrow(NotFoundException);
  });

  it('should throw if product stock is insufficient', async () => {
    const product = { id: 1, name: 'Test', price: 10, quantity: 1 } as Product;
    productRepo.findOneBy.mockResolvedValue(product);

    await service.addToCart({ productId: 1, quantity: 2 });

    await expect(service.checkout()).rejects.toThrow(BadRequestException);
  });
});
