/**
 * MongoDB Index Definitions for XEVYRA Platform
 * Strictly enforces 3-character collection prefix naming convention
 */
export interface IndexDefinition {
    collection: string;
    spec: Record<string, 1 | -1 | 'text'>;
    options?: {
        unique?: boolean;
        sparse?: boolean;
        expireAfterSeconds?: number;
        name?: string;
    };
}
export declare const MONGO_INDEXES: IndexDefinition[];
//# sourceMappingURL=mongo-indexes.d.ts.map