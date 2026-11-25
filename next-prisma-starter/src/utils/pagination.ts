export const DEFAULT_TAKE = 20
export const MAX_TAKE = 100

type Query = Record<string, string | string[] | undefined>

export type Pagination = { take: number; skip: number }

/**
 * Reads `take` and `skip` from a query string. `take` defaults to 20 and may not
 * exceed 100; `skip` defaults to 0. Anything that is not a plain non-negative
 * integer is rejected rather than silently clamped, so a client learns its
 * request was wrong.
 */
export const parsePagination = (
	query: Query
): { ok: true; value: Pagination } | { ok: false; message: string } => {
	const read = (key: 'take' | 'skip', fallback: number) => {
		const raw = query[key]
		if (raw === undefined) return fallback
		if (typeof raw !== 'string' || !/^\d{1,9}$/.test(raw)) return null
		return Number(raw)
	}

	const take = read('take', DEFAULT_TAKE)
	const skip = read('skip', 0)

	if (take === null || skip === null) {
		return { ok: false, message: '`take` and `skip` must be non-negative integers' }
	}
	if (take < 1 || take > MAX_TAKE) {
		return { ok: false, message: `\`take\` must be between 1 and ${MAX_TAKE}` }
	}
	return { ok: true, value: { take, skip } }
}
