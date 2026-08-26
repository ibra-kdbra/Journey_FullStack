import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

import client from '../config/default'

const { isProduction } = client

declare global {
	var prisma: PrismaClient | undefined
}

/**
 * Prisma 7 no longer reads the connection string from schema.prisma; the client
 * is handed a driver adapter, which is what opens the connection.
 */
const createClient = () =>
	new PrismaClient({
		adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
	})

export const prisma = global.prisma || createClient()

const connectDatabase = async () => {
	try {
		await prisma.$connect()
		console.log('🚀 ~ database connected.')
	} catch (error: any) {
		console.log(
			'🚀 ~ file: client.ts:14 ~ connectDatabase ~ error:',
			isProduction ? error.message : error.stack
		)
		process.exit(1)
	} finally {
		await prisma.$disconnect()
		console.log('🚀 ~ database disconnected.')
	}
}

export default connectDatabase
