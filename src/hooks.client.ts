import type { HandleClientError } from '@sveltejs/kit';
import { uuid } from '$lib/utils';

export const handleError: HandleClientError = async ({ event, error, status, message }): Error => {
	const errorId = uuid();
	return {
		error,
		status,
		message,
		errorId
	};
};
