"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = require("./config");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const supplier_routes_1 = __importDefault(require("./routes/supplier.routes"));
const products_routes_1 = __importDefault(require("./routes/products.routes"));
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const orders_routes_1 = __importDefault(require("./routes/orders.routes"));
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: config_1.config.frontendUrl,
        credentials: true,
    }));
    app.use((0, morgan_1.default)(config_1.config.isDev ? 'dev' : 'combined'));
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', service: 'global-link-express-api' });
    });
    app.use('/api/auth', auth_routes_1.default);
    app.use('/api/user', user_routes_1.default);
    app.use('/api/admin', admin_routes_1.default);
    app.use('/api/supplier', supplier_routes_1.default);
    app.use('/api/products', products_routes_1.default);
    app.use('/api/inventory', inventory_routes_1.default);
    app.use('/api/cart', cart_routes_1.default);
    app.use('/api/orders', orders_routes_1.default);
    app.use(errorHandler_1.notFoundHandler);
    app.use(errorHandler_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map