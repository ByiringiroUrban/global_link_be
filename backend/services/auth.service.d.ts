import { Role } from '@prisma/client';
export interface RegisterInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: Role;
    companyName?: string;
}
export declare function registerUser(input: RegisterInput): Promise<{
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    };
    token: string;
}>;
export declare function loginUser(email: string, password: string): Promise<{
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null;
    token: string;
}>;
export declare function logoutUser(sessionId: string): Promise<void>;
export declare function forgotPassword(email: string): Promise<{
    message: string;
}>;
export declare function resetPassword(token: string, newPassword: string): Promise<{
    message: string;
}>;
export declare function verifyEmail(token: string): Promise<{
    message: string;
}>;
export declare function getUserProfile(userId: string): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: import(".prisma/client").$Enums.Role;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    supplierProfile: {
        id: string;
        companyName: string;
        description: string | null;
        address: string | null;
        country: string | null;
    } | null;
}>;
export declare function updateUserProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
}): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: import(".prisma/client").$Enums.Role;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=auth.service.d.ts.map