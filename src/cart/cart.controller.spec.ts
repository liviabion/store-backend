import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';

describe('CartController', () => {
  let controller: CartController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        CartService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOneBy: jest.fn(), // mock básico do repo de produtos
          },
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
