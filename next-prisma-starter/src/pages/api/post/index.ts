import { NextApiHandler } from 'next'

import { prisma } from '@/utils/client'
import { parsePagination } from '@/utils/pagination'

// Public and unauthenticated, like /api/user: paginated, and `take` is capped.
const postApiHandler: NextApiHandler = async (req, res) => {
	try {
		if (req.method === 'GET') {
			const page = parsePagination(req.query)
			if (!page.ok) {
				return res.status(400).json({ success: false, message: page.message })
			}
			const { take, skip } = page.value

			const [posts, total] = await Promise.all([
				prisma.post.findMany({
					orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
					take,
					skip,
				}),
				prisma.post.count(),
			])

			return res.status(200).json({
				success: true,
				message: `Showing ${posts.length} of ${total} posts`,
				data: posts,
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

export default postApiHandler
