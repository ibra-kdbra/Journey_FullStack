import { NextApiHandler } from 'next'

import { prisma } from '@/utils/client'
import { parsePagination } from '@/utils/pagination'

/**
 * NOTE: this starter has no authentication. The endpoint is public, so it returns
 * only fields that are safe to show anyone (no email, no role) and is paginated.
 * Before returning anything more, put real auth in front of it.
 */
const userApiHandler: NextApiHandler = async (req, res) => {
	try {
		if (req.method === 'GET') {
			const page = parsePagination(req.query)
			if (!page.ok) {
				return res.status(400).json({ success: false, message: page.message })
			}
			const { take, skip } = page.value

			const [users, total] = await Promise.all([
				prisma.user.findMany({
					select: { id: true, name: true, avatar: true, createdAt: true },
					orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
					take,
					skip,
				}),
				prisma.user.count(),
			])

			return res.status(200).json({
				success: true,
				message: `Showing ${users.length} of ${total} users`,
				data: users,
				pagination: { take, skip, total },
			})
		}

		return res.status(405).json({
			success: false,
			message: 'Method not allowed',
		})
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
		})
	}
}

export default userApiHandler
