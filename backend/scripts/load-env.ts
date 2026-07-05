import path from 'path';
import dotenv from 'dotenv';

// Load env before Prisma CLI reads DATABASE_URL (works for migrate, generate, studio, etc.)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
