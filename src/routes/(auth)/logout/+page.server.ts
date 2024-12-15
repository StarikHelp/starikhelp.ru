import { redirect } from '@sveltejs/kit';
import type { Event, Layout } from '$lib/utils';
import { clearStorage } from '$lib/auth';
import ENV from '$lib/private';

export const load: Layout = async (event: Event) => {
	await clearStorage(event);
	const next = (event.url.searchParams.get('next') || '').split('/').filter((f) => !!f)[0];
	if (ENV.DEV) console.log('logout next:', next);
	throw redirect(307, `/${next}`);
};
