"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
const prisma_1 = require("./lib/prisma");
const app = (0, app_1.createApp)();
const server = app.listen(config_1.config.port, () => {
    console.log(`Global Link Express API running on port ${config_1.config.port}`);
    console.log(`Environment: ${config_1.config.nodeEnv}`);
});
async function shutdown() {
    console.log('Shutting down...');
    server.close();
    await (0, prisma_1.disconnectDb)();
    process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
//# sourceMappingURL=index.js.map