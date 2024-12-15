import { error, json } from '@sveltejs/kit';
import type { RequestHandler, Response } from '@sveltejs/kit';
import type { Event, Token } from '$lib/utils';
import { returnJson, getToken, verifyToken } from '$lib/utils';

const postHandler: RequestHandler = async (event: Event): Response => {
	try {
		const { url, route, cookies, request } = event;
		const data = await request.json();
		const { token } = data;
		if (token) {
			const data: { user: UserToken; token: Token } = await getToken(token);
			return returnJson({ refreshToken: token, accessToken: data?.token, user: data?.user });
		}
		throw error(400, 'Wrong Credentials');
	} catch (e) {
		console.error(e);
		throw error(500, e?.message || 'Server Error');
	}
};

const getHandler: RequestHandler = async (event: Event): Response => {
	try {
		const { url, route, cookies } = event;
		const token = url.searchParams.get('token');
		if (token) {
			const data: { user: UserToken; token: Token } = await getToken(token);
			return returnJson({ refreshToken: token, accessToken: data?.token, user: data?.user });
		}
		throw error(400, 'Wrong Credentials');
	} catch (e) {
		console.error(e);
		throw error(500, e?.message || 'Server Error');
	}
};

export const GET: RequestHandler = (event: Event): Response => getHandler(event);

export const POST: RequestHandler = (event: Event): Response => postHandler(event);

export const PUT: RequestHandler = (event: Event): Response => postHandler(event);
