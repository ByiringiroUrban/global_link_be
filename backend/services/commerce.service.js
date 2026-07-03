"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminStats = getAdminStats;
exports.getSupplierInventory = getSupplierInventory;
exports.getUserOrders = getUserOrders;
exports.listProducts = listProducts;
exports.getProductById = getProductById;
exports.createProduct = createProduct;
exports.updateInventory = updateInventory;
exports.addToCart = addToCart;
exports.getCart = getCart;
exports.createOrder = createOrder;
exports.getOrderById = getOrderById;
const prisma_1 = require("../lib/prisma");
const apiError_1 = require("../utils/apiError");
const client_1 = require("@prisma/client");
function generateOrderNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `GL-${timestamp}-${random}`;
}
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
async function getAdminStats() {
    const [totalUsers, totalSuppliers, totalProducts, totalOrders, revenueResult, lowStockItems, recentOrders,] = await Promise.all([
        prisma_1.prisma.user.count({ where: { role: client_1.Role.USER } }),
        prisma_1.prisma.user.count({ where: { role: client_1.Role.SUPPLIER } }),
        prisma_1.prisma.product.count({ where: { isActive: true } }),
        prisma_1.prisma.order.count(),
        prisma_1.prisma.order.aggregate({
            where: { status: { not: client_1.OrderStatus.CANCELLED } },
            _sum: { total: true },
        }),
        prisma_1.prisma.$queryRaw `
      SELECT i.id, i.quantity, i."lowStockThreshold", i."productId"
      FROM inventory i
      WHERE i.quantity <= i."lowStockThreshold"
      LIMIT 10
    `.then(async (rows) => {
            const productIds = rows.map((r) => r.productId);
            const products = await prisma_1.prisma.product.findMany({
                where: { id: { in: productIds } },
                select: { id: true, name: true, sku: true },
            });
            const productMap = new Map(products.map((p) => [p.id, p]));
            return rows.map((row) => ({
                ...row,
                product: productMap.get(row.productId),
            }));
        }),
        prisma_1.prisma.order.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { firstName: true, lastName: true, email: true } },
            },
        }),
    ]);
    return {
        totalUsers,
        totalSuppliers,
        totalProducts,
        totalOrders,
        totalRevenue: revenueResult._sum.total || 0,
        lowStockItems,
        recentOrders,
    };
}
async function getSupplierInventory(supplierUserId) {
    const supplier = await prisma_1.prisma.supplierProfile.findUnique({
        where: { userId: supplierUserId },
    });
    if (!supplier) {
        throw apiError_1.ApiError.notFound('Supplier profile not found');
    }
    const products = await prisma_1.prisma.product.findMany({
        where: { supplierId: supplier.id },
        include: {
            inventory: true,
            category: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
    });
    const orderItems = await prisma_1.prisma.orderItem.findMany({
        where: {
            product: { supplierId: supplier.id },
            order: { status: { not: client_1.OrderStatus.CANCELLED } },
        },
        include: {
            order: {
                select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    createdAt: true,
                    user: { select: { firstName: true, lastName: true } },
                },
            },
            product: { select: { id: true, name: true, sku: true } },
        },
        orderBy: { order: { createdAt: 'desc' } },
        take: 50,
    });
    return { products, recentOrderItems: orderItems };
}
async function getUserOrders(userId, page, limit, skip) {
    const [orders, total] = await Promise.all([
        prisma_1.prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: { select: { id: true, name: true, imageUrl: true, sku: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma_1.prisma.order.count({ where: { userId } }),
    ]);
    return { orders, total };
}
async function listProducts(page, limit, skip, filters) {
    const where = { isActive: true };
    if (filters.category) {
        where.category = { slug: filters.category };
    }
    if (filters.search) {
        where.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
            { sku: { contains: filters.search, mode: 'insensitive' } },
        ];
    }
    if (filters.supplierId) {
        where.supplierId = filters.supplierId;
    }
    const [products, total] = await Promise.all([
        prisma_1.prisma.product.findMany({
            where,
            include: {
                category: { select: { id: true, name: true, slug: true } },
                inventory: { select: { quantity: true, warehouseLocation: true } },
                supplier: { select: { id: true, companyName: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma_1.prisma.product.count({ where }),
    ]);
    return { products, total };
}
async function getProductById(id) {
    const product = await prisma_1.prisma.product.findUnique({
        where: { id },
        include: {
            category: true,
            inventory: true,
            supplier: { select: { id: true, companyName: true, country: true } },
        },
    });
    if (!product || !product.isActive) {
        throw apiError_1.ApiError.notFound('Product not found');
    }
    return product;
}
async function createProduct(supplierUserId, input) {
    const supplier = await prisma_1.prisma.supplierProfile.findUnique({
        where: { userId: supplierUserId },
    });
    if (!supplier) {
        throw apiError_1.ApiError.notFound('Supplier profile not found');
    }
    const existingSku = await prisma_1.prisma.product.findUnique({ where: { sku: input.sku } });
    if (existingSku) {
        throw apiError_1.ApiError.conflict('SKU already exists');
    }
    const slug = `${slugify(input.name)}-${Date.now().toString(36)}`;
    return prisma_1.prisma.product.create({
        data: {
            name: input.name,
            slug,
            description: input.description,
            price: input.price,
            sku: input.sku,
            imageUrl: input.imageUrl,
            styleTags: input.styleTags || [],
            categoryId: input.categoryId,
            supplierId: supplier.id,
            inventory: {
                create: {
                    quantity: input.initialStock || 0,
                    warehouseLocation: input.warehouseLocation,
                },
            },
        },
        include: { inventory: true, category: true },
    });
}
async function updateInventory(supplierUserId, productId, data) {
    const supplier = await prisma_1.prisma.supplierProfile.findUnique({
        where: { userId: supplierUserId },
    });
    if (!supplier) {
        throw apiError_1.ApiError.notFound('Supplier profile not found');
    }
    const product = await prisma_1.prisma.product.findFirst({
        where: { id: productId, supplierId: supplier.id },
        include: { inventory: true },
    });
    if (!product) {
        throw apiError_1.ApiError.notFound('Product not found or not owned by supplier');
    }
    if (!product.inventory) {
        return prisma_1.prisma.inventory.create({
            data: {
                productId,
                quantity: data.quantity || 0,
                warehouseLocation: data.warehouseLocation,
                lowStockThreshold: data.lowStockThreshold || 10,
            },
        });
    }
    return prisma_1.prisma.inventory.update({
        where: { productId },
        data: {
            ...(data.quantity !== undefined && { quantity: data.quantity }),
            ...(data.warehouseLocation !== undefined && { warehouseLocation: data.warehouseLocation }),
            ...(data.lowStockThreshold !== undefined && { lowStockThreshold: data.lowStockThreshold }),
        },
    });
}
async function addToCart(userId, productId, quantity) {
    const product = await prisma_1.prisma.product.findUnique({
        where: { id: productId },
        include: { inventory: true },
    });
    if (!product || !product.isActive) {
        throw apiError_1.ApiError.notFound('Product not found');
    }
    const available = (product.inventory?.quantity || 0) - (product.inventory?.reservedQuantity || 0);
    if (available < quantity) {
        throw apiError_1.ApiError.badRequest('Insufficient stock');
    }
    let cart = await prisma_1.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
        cart = await prisma_1.prisma.cart.create({ data: { userId } });
    }
    const existingItem = await prisma_1.prisma.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId } },
    });
    if (existingItem) {
        const newQty = existingItem.quantity + quantity;
        if (available < newQty) {
            throw apiError_1.ApiError.badRequest('Insufficient stock');
        }
        return prisma_1.prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: newQty },
            include: { product: { select: { id: true, name: true, price: true, imageUrl: true } } },
        });
    }
    return prisma_1.prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
        include: { product: { select: { id: true, name: true, price: true, imageUrl: true } } },
    });
}
async function getCart(userId) {
    const cart = await prisma_1.prisma.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: {
                    product: {
                        select: { id: true, name: true, price: true, imageUrl: true, sku: true },
                    },
                },
            },
        },
    });
    return cart || { id: null, items: [] };
}
async function createOrder(userId, shippingAddress, notes) {
    const cart = await prisma_1.prisma.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: {
                    product: { include: { inventory: true } },
                },
            },
        },
    });
    if (!cart || cart.items.length === 0) {
        throw apiError_1.ApiError.badRequest('Cart is empty');
    }
    for (const item of cart.items) {
        const available = (item.product.inventory?.quantity || 0) - (item.product.inventory?.reservedQuantity || 0);
        if (available < item.quantity) {
            throw apiError_1.ApiError.badRequest(`Insufficient stock for ${item.product.name}`);
        }
    }
    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
    const shippingCost = subtotal >= 100 ? 0 : 9.99;
    const total = subtotal + shippingCost;
    const order = await prisma_1.prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
            data: {
                orderNumber: generateOrderNumber(),
                userId,
                subtotal,
                shippingCost,
                total,
                shippingAddress,
                notes,
                items: {
                    create: cart.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.product.price,
                        total: Number(item.product.price) * item.quantity,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        product: { select: { id: true, name: true, imageUrl: true } },
                    },
                },
            },
        });
        for (const item of cart.items) {
            await tx.inventory.update({
                where: { productId: item.productId },
                data: { quantity: { decrement: item.quantity } },
            });
        }
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        return newOrder;
    });
    return order;
}
async function getOrderById(orderId, userId, role) {
    const order = await prisma_1.prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    product: { select: { id: true, name: true, imageUrl: true, sku: true } },
                },
            },
            user: { select: { firstName: true, lastName: true, email: true } },
        },
    });
    if (!order) {
        throw apiError_1.ApiError.notFound('Order not found');
    }
    if (role === client_1.Role.USER && order.userId !== userId) {
        throw apiError_1.ApiError.forbidden('Access denied');
    }
    return order;
}
//# sourceMappingURL=commerce.service.js.map