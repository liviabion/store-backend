import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { Repository } from 'typeorm';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CartItem } from './entities/cart-item.entity';

const mockRepo = () => ({
  findOneBy: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  create: jest.fn(),
  remove: jest.fn(),
});

describe('CartService', () => {
  let service: CartService;
  let productRepo: jest.Mocked<Repository<Product>>;
  let cartRepo: jest.Mocked<Repository<CartItem>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(Product),
          useFactory: mockRepo,
        },
        {
          provide: getRepositoryToken(CartItem),
          useFactory: mockRepo,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    productRepo = module.get(getRepositoryToken(Product));
    cartRepo = module.get(getRepositoryToken(CartItem));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add a product to the cart', async () => {
    const dto: AddToCartDto = { productId: 1, quantity: 2 };

    productRepo.findOneBy.mockResolvedValue({
      id: 1,
      name: 'Test',
      price: 10,
      quantity: 10,
    } as Product);

    cartRepo.find.mockResolvedValue([]);

    const fakeCartItem: CartItem = {
      id: 1,
      productId: 1,
      name: 'Test',
      price: 10,
      quantity: 2,
    };

    cartRepo.create.mockReturnValue(fakeCartItem);
    cartRepo.save.mockResolvedValue(fakeCartItem);
    cartRepo.find.mockResolvedValue([fakeCartItem]);

    await service.addToCart(dto);
    const cart = await service.getCart();

    expect(productRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(cart.length).toBe(1);
    expect(cart[0].quantity).toBe(2);
  });

  it('should throw if product not found when adding to cart', async () => {
    productRepo.findOneBy.mockResolvedValue(null);

    await expect(service.addToCart({ productId: 99, quantity: 1 })).rejects.toThrow(NotFoundException);
  });

  it('should return cart contents', async () => {
    cartRepo.find.mockResolvedValue([{ id: 1, productId: 1, name: 'Test', price: 10, quantity: 1 } as CartItem]);

    const result = await service.getCart();

    expect(result.length).toBe(1);
    expect(result[0].productId).toBe(1);
  });

  it('should remove item from cart', async () => {
    const fakeItem: CartItem = {
      id: 1,
      productId: 1,
      name: 'Test',
      price: 10,
      quantity: 1,
    };

    cartRepo.findOneBy.mockResolvedValue(fakeItem);
    cartRepo.remove.mockResolvedValue(fakeItem);

    const result = await service.removeItem(1);

    expect(cartRepo.findOneBy).toHaveBeenCalledWith({ productId: 1 });
    expect(result).toEqual({ message: 'Removed from cart' });
  });

  it('should throw if removing non-existing item', async () => {
    cartRepo.findOneBy.mockResolvedValue(null);

    await expect(service.removeItem(123)).rejects.toThrow(NotFoundException);
  });

  it('should checkout and update stock', async () => {
    const product = { id: 1, name: 'Test', price: 10, quantity: 10 } as Product;
    const cartItem = { id: 1, productId: 1, name: 'Test', price: 10, quantity: 2 } as CartItem;

    cartRepo.find.mockResolvedValue([cartItem]);
    productRepo.findOneBy.mockResolvedValue(product);
    productRepo.save.mockResolvedValue(product);
    cartRepo.clear.mockResolvedValue(undefined);

    const result = await service.checkout();

    expect(productRepo.save).toHaveBeenCalled();
    expect(result.total).toBe(20);
    expect(result.items.length).toBe(1);
    expect(cartRepo.clear).toHaveBeenCalled();
  });

  it('should throw if product not found on checkout', async () => {
    const cartItem = { id: 1, productId: 1, name: 'Test', price: 10, quantity: 2 } as CartItem;

    cartRepo.find.mockResolvedValue([cartItem]);
    productRepo.findOneBy.mockResolvedValue(null);

    await expect(service.checkout()).rejects.toThrow(NotFoundException);
  });

  it('should throw if product stock is insufficient', async () => {
    const cartItem = { id: 1, productId: 1, name: 'Test', price: 10, quantity: 5 } as CartItem;
    const product = { id: 1, name: 'Test', price: 10, quantity: 2 } as Product;

    cartRepo.find.mockResolvedValue([cartItem]);
    productRepo.findOneBy.mockResolvedValue(product);

    await expect(service.checkout()).rejects.toThrow(BadRequestException);
  });
});
