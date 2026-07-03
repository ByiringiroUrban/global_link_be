import { Prisma, Role } from '@prisma/client';
export declare function getAdminStats(): Promise<{
    totalUsers: number;
    totalSuppliers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number | Prisma.Decimal;
    lowStockItems: {
        product: {
            id: string;
            name: string;
            sku: string;
        } | undefined;
        id: string;
        quantity: number;
        lowStockThreshold: number;
        productId: string;
    }[];
    recentOrders: ({
        user: {
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        total: Prisma.Decimal;
        orderNumber: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        shipmentStatus: import(".prisma/client").$Enums.ShipmentStatus;
        subtotal: Prisma.Decimal;
        shippingCost: Prisma.Decimal;
        shippingAddress: string;
        trackingNumber: string | null;
        notes: string | null;
    })[];
}>;
export declare function getSupplierInventory(supplierUserId: string): Promise<{
    products: ({
        category: {
            id: string;
            name: string;
        } | null;
        inventory: {
            id: string;
            updatedAt: Date;
            productId: string;
            quantity: number;
            reservedQuantity: number;
            warehouseLocation: string | null;
            lowStockThreshold: number;
        } | null;
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        slug: string;
        price: Prisma.Decimal;
        sku: string;
        imageUrl: string | null;
        styleTags: string[];
        categoryId: string | null;
        supplierId: string;
    })[];
    recentOrderItems: ({
        product: {
            id: string;
            name: string;
            sku: string;
        };
        order: {
            id: string;
            createdAt: Date;
            user: {
                firstName: string;
                lastName: string;
            };
            orderNumber: string;
            status: import(".prisma/client").$Enums.OrderStatus;
        };
    } & {
        id: string;
        total: Prisma.Decimal;
        orderId: string;
        productId: string;
        quantity: number;
        unitPrice: Prisma.Decimal;
    })[];
}>;
export declare function getUserOrders(userId: string, page: number, limit: number, skip: number): Promise<{
    orders: ({
        items: ({
            product: {
                id: string;
                name: string;
                sku: string;
                imageUrl: string | null;
            };
        } & {
            id: string;
            total: Prisma.Decimal;
            orderId: string;
            productId: string;
            quantity: number;
            unitPrice: Prisma.Decimal;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        total: Prisma.Decimal;
        orderNumber: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        shipmentStatus: import(".prisma/client").$Enums.ShipmentStatus;
        subtotal: Prisma.Decimal;
        shippingCost: Prisma.Decimal;
        shippingAddress: string;
        trackingNumber: string | null;
        notes: string | null;
    })[];
    total: number;
}>;
export declare function listProducts(page: number, limit: number, skip: number, filters: {
    category?: string;
    search?: string;
    supplierId?: string;
}): Promise<{
    products: ({
        category: {
            id: string;
            name: string;
            slug: string;
        } | null;
        supplier: {
            id: string;
            companyName: string;
        };
        inventory: {
            quantity: number;
            warehouseLocation: string | null;
        } | null;
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        slug: string;
        price: Prisma.Decimal;
        sku: string;
        imageUrl: string | null;
        styleTags: string[];
        categoryId: string | null;
        supplierId: string;
    })[];
    total: number;
}>;
export declare function getProductById(id: string): Promise<{
    category: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        slug: string;
    } | null;
    supplier: {
        id: string;
        companyName: string;
        country: string | null;
    };
    inventory: {
        id: string;
        updatedAt: Date;
        productId: string;
        quantity: number;
        reservedQuantity: number;
        warehouseLocation: string | null;
        lowStockThreshold: number;
    } | null;
} & {
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    slug: string;
    price: Prisma.Decimal;
    sku: string;
    imageUrl: string | null;
    styleTags: string[];
    categoryId: string | null;
    supplierId: string;
}>;
export interface CreateProductInput {
    name: string;
    description?: string;
    price: number;
    sku: string;
    imageUrl?: string;
    styleTags?: string[];
    categoryId?: string;
    initialStock?: number;
    warehouseLocation?: string;
}
export declare function createProduct(supplierUserId: string, input: CreateProductInput): Promise<{
    category: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        slug: string;
    } | null;
    inventory: {
        id: string;
        updatedAt: Date;
        productId: string;
        quantity: number;
        reservedQuantity: number;
        warehouseLocation: string | null;
        lowStockThreshold: number;
    } | null;
} & {
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    slug: string;
    price: Prisma.Decimal;
    sku: string;
    imageUrl: string | null;
    styleTags: string[];
    categoryId: string | null;
    supplierId: string;
}>;
export declare function updateInventory(supplierUserId: string, productId: string, data: {
    quantity?: number;
    warehouseLocation?: string;
    lowStockThreshold?: number;
}): Promise<{
    id: string;
    updatedAt: Date;
    productId: string;
    quantity: number;
    reservedQuantity: number;
    warehouseLocation: string | null;
    lowStockThreshold: number;
}>;
export declare function addToCart(userId: string, productId: string, quantity: number): Promise<{
    product: {
        id: string;
        name: string;
        price: Prisma.Decimal;
        imageUrl: string | null;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    productId: string;
    quantity: number;
    cartId: string;
}>;
export declare function getCart(userId: string): Promise<({
    items: ({
        product: {
            id: string;
            name: string;
            price: Prisma.Decimal;
            sku: string;
            imageUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        quantity: number;
        cartId: string;
    })[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
}) | {
    id: null;
    items: never[];
}>;
export declare function createOrder(userId: string, shippingAddress: string, notes?: string): Promise<{
    items: ({
        product: {
            id: string;
            name: string;
            imageUrl: string | null;
        };
    } & {
        id: string;
        total: Prisma.Decimal;
        orderId: string;
        productId: string;
        quantity: number;
        unitPrice: Prisma.Decimal;
    })[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    total: Prisma.Decimal;
    orderNumber: string;
    status: import(".prisma/client").$Enums.OrderStatus;
    shipmentStatus: import(".prisma/client").$Enums.ShipmentStatus;
    subtotal: Prisma.Decimal;
    shippingCost: Prisma.Decimal;
    shippingAddress: string;
    trackingNumber: string | null;
    notes: string | null;
}>;
export declare function getOrderById(orderId: string, userId: string, role: Role): Promise<{
    user: {
        email: string;
        firstName: string;
        lastName: string;
    };
    items: ({
        product: {
            id: string;
            name: string;
            sku: string;
            imageUrl: string | null;
        };
    } & {
        id: string;
        total: Prisma.Decimal;
        orderId: string;
        productId: string;
        quantity: number;
        unitPrice: Prisma.Decimal;
    })[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    total: Prisma.Decimal;
    orderNumber: string;
    status: import(".prisma/client").$Enums.OrderStatus;
    shipmentStatus: import(".prisma/client").$Enums.ShipmentStatus;
    subtotal: Prisma.Decimal;
    shippingCost: Prisma.Decimal;
    shippingAddress: string;
    trackingNumber: string | null;
    notes: string | null;
}>;
//# sourceMappingURL=commerce.service.d.ts.map