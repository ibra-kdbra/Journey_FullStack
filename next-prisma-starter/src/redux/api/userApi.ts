import {
	createApi,
	BaseQueryFn,
	fetchBaseQuery,
	FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
	// No Authorization header: the API routes do not check one (see README, "API access").
	baseUrl: '/api',
})

const userApi = createApi({
	baseQuery,
	endpoints: (build) => ({
		getUsers: build.query<any, void>({
			query: () => '/user',
			transformResponse: (res: any) => res.data,
		}),
	}),
})

export const { useGetUsersQuery, useLazyGetUsersQuery } = userApi

export default userApi
