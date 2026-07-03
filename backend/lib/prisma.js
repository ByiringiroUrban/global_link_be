"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.disconnectDb = disconnectDb;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
async function disconnectDb() {
    await exports.prisma.$disconnect();
}
//# sourceMappingURL=prisma.js.map