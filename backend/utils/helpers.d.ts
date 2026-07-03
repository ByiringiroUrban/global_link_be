import { Request, Response, NextFunction } from 'express';
export declare function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): (req: Request, res: Response, next: NextFunction) => void;
export declare function getPagination(query: {
    page?: string;
    limit?: string;
}): {
    page: number;
    limit: number;
    skip: number;
};
export declare function paginatedResponse<T>(data: T[], total: number, page: number, limit: number): {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};
export declare function assertFound<T>(value: T | null | undefined, message: string): T;
//# sourceMappingURL=helpers.d.ts.map