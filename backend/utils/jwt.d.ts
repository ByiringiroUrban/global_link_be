import { Role } from '@prisma/client';
export interface JwtPayload {
    userId: string;
    email: string;
    role: Role;
    sessionId: string;
}
export declare function createSession(userId: string): Promise<{
    token: string;
    sessionId: string;
}>;
export declare function verifyToken(token: string): JwtPayload;
export declare function invalidateSession(sessionId: string): Promise<void>;
export declare function isSessionValid(sessionId: string): Promise<boolean>;
//# sourceMappingURL=jwt.d.ts.map