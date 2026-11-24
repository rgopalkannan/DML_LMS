import { type Prisma } from '@prisma/client';

/** A Prisma client or a transaction-scoped client. Repositories accept either, so they work inside a Unit of Work transaction. */
export type Db = Prisma.TransactionClient;
