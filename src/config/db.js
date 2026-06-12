import dotenv from "dotenv";
dotenv.config();
// import {PrismaClient} from "@prisma/client"
import { PrismaClient } from "../../generated/prisma/index.js";
import {PrismaPg} from "@prisma/adapter-pg"

export const Prisma = new PrismaClient({
    adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL
    }),
});