import type { Token, UserToken, UserRole, Locals, Event } from '$lib/utils';
import { redirectPage, isDate, verifyToken } from '$lib/utils';
import { deleteCookie } from '$lib/cookie';
import { browser } from '$app/environment';
import { invalidateAll, goto } from '$app/navigation';
import storage from '$lib/storage';
import ENV from '$lib/public';

export const isAdmin = (role: UserRole): boolean => ['ADMIN', 'SUPER'].includes(role);

export const isSuper = (role: UserRole): boolean => ['SUPER'].includes(role);

export const clearStorage = async (event: Event): Promise<void> => {
	const { locals, cookies }: { locals: Locals; cookies: any } = event;
	if (cookies.get('refreshToken')) await cookies.delete('refreshToken', { path: '/' });
	if (cookies.get('accessToken')) await cookies.delete('accessToken', { path: '/' });
	if (cookies.get('firstname')) await cookies.delete('firstname', { path: '/' });
	storage.clearStorage();
};

export const clearUserData = (): void => {
	deleteCookie('refreshToken', { path: '/' });
	deleteCookie('accessToken', { path: '/' });
	deleteCookie('firstname', { path: '/' });
	storage.clearStorage();
};

export const checkAdminRoles = async (
	redirectTo: string = '/login',
	toDashboard: boolean = false
): Promise<void> => {
	if (browser) {
		const { getValue, expires, accessToken, refreshToken, user, uid } = storage;
		const data = {
			expires: getValue(expires), // (isDate(data.expires))
			accessToken: getValue(accessToken),
			refreshToken: getValue(refreshToken),
			user: getValue(user),
			uid: getValue(uid)
		};

		const userToken: UserToken = !!data.accessToken
			? (await verifyToken(data.accessToken))?.user
			: null;
		if (ENV.DEV) console.log('checkAdminRoles() userToken:', userToken);

		const admin: boolean = isAdmin(userToken?.role);
		if (ENV.DEV) console.log('checkAdminRoles() isAdmin:', admin, 'toDashboard:', toDashboard);

		if (!admin) clearUserData();

		const role: UserRole = getValue(user)?.role || null;
		if (ENV.DEV) console.log('checkAdminRoles() role:', role);

		if (toDashboard) {
			if (admin && role && userToken && userToken.role === role) {
				await goto(redirectTo);
			} else {
				await goto('/logout');
			}
		} else {
			if (!admin || !role || !data.refreshToken || !userToken || userToken.role !== role) {
				await goto(redirectTo);
			}
		}
	}
};
