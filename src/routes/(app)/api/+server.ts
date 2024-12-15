import { redirect } from '@sveltejs/kit';
import type { RequestHandler, Response } from '@sveltejs/kit';
import type { Event } from '$lib/utils';

export const GET: RequestHandler = async (event: Event): Response => {
	throw redirect(307, '/');
};
