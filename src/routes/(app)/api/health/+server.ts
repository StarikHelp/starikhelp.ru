import { getAction } from '$lib/utils';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler, Response } from '@sveltejs/kit';
import type { Event } from '$lib/utils';
import ENV from '$lib/public';

export const GET: RequestHandler = async (event: Event): Response => {
	const resp = await getAction('health');
	if (resp?.statusCode) return json(resp);
	else throw error(500, 'Server Error');
};
