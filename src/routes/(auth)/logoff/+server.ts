import { redirect } from '@sveltejs/kit';
import type { RequestHandler, Response } from '@sveltejs/kit';
import type { Event } from '$lib/utils';
import { clearStorage } from '$lib/auth';

export const GET: RequestHandler = async (event: Event): Response => {
	await clearStorage(event);
	const next = (event.url.searchParams.get('next') || '').split('/').filter((f) => !!f)[0];
	throw redirect(307, `/${next}`);
};
