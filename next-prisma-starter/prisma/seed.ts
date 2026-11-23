import { faker } from '@faker-js/faker'
import { randomInt } from 'crypto';
import { Prisma } from '@prisma/client'
import { prisma } from '../src/utils/client'
import config from '../src/config/default'

/**
 *
 * @param length dummy data length
 * @returns created/failed response
 */
const feedSomeData = async (length: number) => {
	try {
		const createRandomUsers = (): Prisma.UserCreateManyInput => {
			return {
				name: faker.person.fullName(),
				email: faker.internet.email(),
				avatar: faker.image.avatar(),
				role: 'user',
			}
		}

		// create users
		await prisma.user.createMany({
			data: faker.helpers.multiple(createRandomUsers, { count: length }),
			skipDuplicates: true,
		})

		const users = await prisma.user.findMany({
			where: {
				role: 'user',
			},
			select: {
				id: true,
			},
		})

		if (users.length === 0) {
			console.log('🚀 ~ file: seed.ts ~ no users found, skipping posts.')
			return
		}

		const getRandomUserId = () => users[randomInt(0, users.length)].id

		const createRandomPosts = (): Prisma.PostCreateManyInput => {
			return {
				name: faker.lorem.slug(),
				image: faker.image.url(),
				user_id: getRandomUserId(),
			}
		}

		// create posts
		await prisma.post.createMany({
			data: faker.helpers.multiple(createRandomPosts, { count: length }),
			skipDuplicates: true,
		})

		console.log('🚀 ~ file: seed.ts ~ data feeded successfully.')
	} catch (error) {
		console.error('🚀 ~ file: seed.ts ~ feedSomeData ~ error:', error)
		process.exitCode = 1
	}
}

feedSomeData(config.dummyDataLength).finally(() => prisma.$disconnect())
