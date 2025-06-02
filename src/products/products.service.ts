import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private repo: Repository<Product>,
  ) {}

  create(data: CreateProductDto) {
    const product = this.repo.create(data);
    return this.repo.save(product);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const product = await this.repo.findOneBy({ id });
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  async update(id: number, attrs: Partial<CreateProductDto>) {
    const product = await this.findOne(id);
    Object.assign(product, attrs);
    return this.repo.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    return this.repo.remove(product);
  }
}
