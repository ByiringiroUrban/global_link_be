"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.generateToken = generateToken;
exports.buildResetPasswordLink = buildResetPasswordLink;
exports.buildVerifyEmailLink = buildVerifyEmailLink;
const uuid_1 = require("uuid");
const config_1 = require("../config");
async function sendEmail(to, subject, html) {
    if (config_1.config.isDev) {
        console.log('\n--- EMAIL (dev mode) ---');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(html);
        console.log('--- END EMAIL ---\n');
        return;
    }
    const nodemailer = await Promise.resolve().then(() => __importStar(require('nodemailer')));
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@globallink.com',
        to,
        subject,
        html,
    });
}
function generateToken() {
    return (0, uuid_1.v4)();
}
function buildResetPasswordLink(token) {
    return `${config_1.config.frontendUrl}/reset-password?token=${token}`;
}
function buildVerifyEmailLink(token) {
    return `${config_1.config.frontendUrl}/verify-email?token=${token}`;
}
//# sourceMappingURL=email.js.map