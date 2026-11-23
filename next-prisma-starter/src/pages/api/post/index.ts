import { NextApiHandler } from 'next'

import { prisma } from '@/utils/client'

const postApiHandler: NextApiHandler = async (req, res) => {
	try {
		if (req.method === 'GET') {
			const posts = await prisma.post.findMany({
				orderBy: {
					createdAt: 'desc',
				},
			})

			return res.status(200).json({
				success: true,
				message: `Total ${posts.length} posts found`,
				data: posts,
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
