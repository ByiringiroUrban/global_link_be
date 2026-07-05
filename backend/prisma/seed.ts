import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await hashPassword('Admin123!');
  await prisma.user.upsert({
    where: { email: 'admin@globallink.com' },
    update: {},
    create: {
      email: 'admin@globallink.com',
      passwordHash: adminPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: Role.ADMIN,
      isEmailVerified: true,
      cart: { create: {} },
    },
  });

  const supplierPassword = await hashPassword('Supplier123!');
  const supplier = await prisma.user.upsert({
    where: { email: 'supplier@globallink.com' },
    update: {},
    create: {
      email: 'supplier@globallink.com',
      passwordHash: supplierPassword,
      firstName: 'Global',
      lastName: 'Supplier',
      role: Role.SUPPLIER,
      isEmailVerified: true,
      supplierProfile: {
        create: {
          companyName: 'Global Fashion Co.',
          description: 'Premium global fashion supplier',
          country: 'US',
        },
      },
      cart: { create: {} },
    },
    include: { supplierProfile: true },
  });

  const userPassword = await hashPassword('User123!');
  await prisma.user.upsert({
    where: { email: 'user@globallink.com' },
    update: {},
    create: {
      email: 'user@globallink.com',
      passwordHash: userPassword,
      firstName: 'John',
      lastName: 'Customer',
      role: Role.USER,
      isEmailVerified: true,
      cart: { create: {} },
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'clothing' },
      update: {},
      create: { name: 'Clothing', slug: 'clothing', description: 'Apparel and wearables' },
    }),
    prisma.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: { name: 'Accessories', slug: 'accessories', description: 'Bags, belts, and more' },
    }),
    prisma.category.upsert({
      where: { slug: 'footwear' },
      update: {},
      create: { name: 'Footwear', slug: 'footwear', description: 'Shoes and boots' },
    }),
  ]);

  const supplierProfile = supplier.supplierProfile!;
  const sampleProducts = [
    {
      name: 'Classic White Linen Shirt',
      slug: 'classic-white-linen-shirt',
      description: 'Breathable linen shirt perfect for warm climates',
      price: 49.99,
      sku: 'GL-SHT-001',
      styleTags: ['casual', 'minimal', 'summer', 'linen'],
      categoryId: categories[0].id,
      stock: 120,
      location: 'WH-A-01',
    },
    {
      name: 'Slim Fit Dark Denim Jeans',
      slug: 'slim-fit-dark-denim-jeans',
      description: 'Premium stretch denim with modern slim fit',
      price: 79.99,
      sku: 'GL-JNS-001',
      styleTags: ['casual', 'denim', 'streetwear'],
      categoryId: categories[0].id,
      stock: 85,
      location: 'WH-A-02',
    },
    {
      name: 'Leather Crossbody Bag',
      slug: 'leather-crossbody-bag',
      description: 'Handcrafted genuine leather crossbody bag',
      price: 129.99,
      sku: 'GL-BAG-001',
      styleTags: ['luxury', 'leather', 'accessories'],
      categoryId: categories[1].id,
      stock: 45,
      location: 'WH-B-01',
    },
    {
      name: 'Urban Running Sneakers',
      slug: 'urban-running-sneakers',
      description: 'Lightweight sneakers for city and sport',
      price: 99.99,
      sku: 'GL-SNK-001',
      styleTags: ['sport', 'streetwear', 'comfort'],
      categoryId: categories[2].id,
      stock: 60,
      location: 'WH-C-01',
    },
    {
      name: 'Wool Blend Overcoat',
      slug: 'wool-blend-overcoat',
      description: 'Elegant overcoat for cold weather styling',
      price: 249.99,
      sku: 'GL-COT-001',
      styleTags: ['formal', 'winter', 'luxury', 'wool'],
      categoryId: categories[0].id,
      stock: 30,
      location: 'WH-A-03',
    },
  ];

  for (const p of sampleProducts) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        sku: p.sku,
        styleTags: p.styleTags,
        categoryId: p.categoryId,
        supplierId: supplierProfile.id,
        inventory: {
          create: {
            quantity: p.stock,
            warehouseLocation: p.location,
            lowStockThreshold: 15,
          },
        },
      },
    });
  }

  console.log('Seed completed:');
  console.log('  Admin:    admin@globallink.com / Admin123!');
  console.log('  Supplier: supplier@globallink.com / Supplier123!');
  console.log('  User:     user@globallink.com / User123!');
  console.log(`  Created ${sampleProducts.length} sample products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
