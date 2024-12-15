import axios from 'axios';
import short from 'short-uuid';
import { json, redirect } from '@sveltejs/kit';
import type { LoadEvent, ServerLoadEvent, RequestHandler, Response } from '@sveltejs/kit';
import type { LayoutLoad, LayoutServerLoad, PageLoad, PageServerLoad } from './$types';
import { invalidateAll, replaceState, goto } from '$app/navigation';
import { browser } from '$app/environment';
import { getCookie, setCookie } from '$lib/cookie';
import storage from '$lib/storage';
import ENV from '$lib/public';

export type ID = string;
export type ISODate = Date | string;
export type Email = string;
export type Token = string;
export type UserRole = 'USER' | 'ADMIN' | 'SUPER' | null;
export type UUID = string | short.UUID;

export type Event = LoadEvent | ServerLoadEvent;
export type Layout = LayoutLoad | LayoutServerLoad;
export type Data = LayoutData | LayoutServerData;
export type Page = PageLoad | PageServerLoad;

export type UserToken = {
	id: ID;
	role: UserRole;
	email: Email;
	iat?: number;
	exp?: number;
};

export interface ListData {
	shown: number;
	offset: number;
	limit: number;
	list?: object[];
}

export interface ListResult {
	statusCode: number;
	success: boolean;
	message: string;
	data?: ListData;
}

export interface SplitEmail {
	address: string;
	domains: string[];
	root: string;
}

export interface Paging {
	page: number;
	from: number;
	to?: number;
}

export const updateUrl = async (url: URL): Promise<void> => {
	if (url && browser) {
		url.searchParams.set('network', `${Math.random()}`);
		replaceState(url, {});
		await invalidateAll();
	}
};

export const redirectPage = (event: Event, uri: string = '/') => {
	const { pathname, search } = event.url;
	const redirectTo = `${pathname}${search}`;
	const urlSearchParams = new URLSearchParams();
	urlSearchParams.set('next', redirectTo);
	const searchParams = urlSearchParams.toString();
	return redirect(307, `${uri}?${searchParams}`);
};

export const parseQueryString = (url: URL, getParam?: string): Record<string, string> => {
	const { search } = url;
	const result: Record<string, string> = {};
	const blocks: string[] = !!search
		? search
				.trim()
				.split('?')
				.filter((f) => !!f)
				.join('')
				.split('&')
				.filter((f) => !!f)
		: [];
	if (blocks?.length < 1) return result;
	if (getParam) {
		const found: string = blocks.find((f) => f.startsWith(getParam));
		if (!!found) result[getParam] = found.split('=').reverse()[0];
	} else {
		blocks.forEach((b) => {
			const params: string[] = b.split('=');
			const param: string = params?.length > 0 ? params[0] : null;
			if (!!param && params?.length > 1) result[param] = params[1];
		});
	}
	return result;
};

export const getPaging = (url: URL, shown: number = 0, limit: number = 50): Paging => {
	const qs: Record<string, string> = parseQueryString(url);
	const page: number = 'page' in qs ? Number(qs.page) : 1;
	const from: number = (page - 1) * limit;
	const to: number = shown > 0 ? (shown < limit ? from + shown : page * limit) - 1 : null;
	return {
		page,
		from,
		to
	};
};

export const splitEmail = (email: string): SplitEmail => {
	const [address, domain] = email.toLowerCase().split('@');
	const domains = domain.split('.');
	const root = domains.pop();
	return {
		address,
		domains,
		root
	};
};

export const uuid = () => short.uuid();

export const errorHandler = ({ error, event }) => {
	const errorResult = {
		status: event.route.id ? event.locals.status || 400 : 404,
		message: error.toString(),
		errorId: uuid() // crypto.randomUUID(),
	};
	event.locals.status = errorResult.status;
	return errorResult;
};

const axiosAction = (ax, action, path, params?, form?) =>
	form ? ax[action](path, form, params || {}) : ax[action](path, params || {});

export const axiosData = async (
	ax: any,
	path: string,
	params?: Record<string, any>,
	form?: Record<string, any>,
	method?: string,
	cb?: Function
): Record<string, any> => {
	try {
		const action: string = `${form ? 'post' : method || 'get'}`.toLowerCase();
		if (cb) {
			axiosAction(ax, action, path, params, form).then((resp) => cb(resp?.data));
		} else {
			return (await axiosAction(ax, action, path, params, form))?.data;
		}
	} catch (error) {
		if (ENV.DEV) console.error('Error:', error.code, error.message);
		return { error };
	}
};

const createHeaders = (token: Token): Record<string, string> => {
	return !!token ? { Authorization: `Bearer ${token}` } : null;
};

const createAxios = (baseURL: string, token: Token) => {
	const headers: Record<string, string> = createHeaders(token);
	return axios.create({ baseURL, headers });
};

export const postAction = async (
	path: string,
	data: Record<string, any>,
	accessToken?: Token,
	refreshToken?: Token
): Record<string, any> => {
	try {
		const baseURL = `${ENV.PUBLIC_API_BASEURI}/${ENV.PUBLIC_API_VERSION}`;
		let axiosAuth = createAxios(baseURL, accessToken);
		let result = await axiosData(axiosAuth, path, {}, data);
		let status: number = Number(result?.error?.status || result?.error?.response?.status || '200');
		if (result?.error && status > 399 && status < 410 && !!refreshToken) {
			const { user, token }: { user: UserToken; token: Token } = await getToken(refreshToken);
			if (!!token) {
				axiosAuth = createAxios(baseURL, token);
				result = await axiosData(axiosAuth, path, {}, data);
				if (result && !result.error && result.data) {
					result.data['accessToken'] = token;
					storage.accessToken.set(token);
					setCookie('accessToken', token, 3);
				}
			}
		}
		return result;
	} catch (e) {
		if (ENV.DEV) console.error(e);
	}
};

export const getAction = async (
	path: string,
	accessToken?: Token,
	refreshToken?: Token
): Record<string, any> => {
	try {
		const baseURL =
			path === 'health'
				? ENV.PUBLIC_API_BASEURI
				: `${ENV.PUBLIC_API_BASEURI}/${ENV.PUBLIC_API_VERSION}`;
		let axiosAuth = createAxios(baseURL, accessToken);
		let result = await axiosData(axiosAuth, path);
		let status: number = Number(result?.error?.status || result?.error?.response?.status || '200');
		if (result?.error && status > 399 && status < 410 && !!refreshToken) {
			const { user, token }: { user: UserToken; token: Token } = await getToken(refreshToken);
			if (!!token) {
				axiosAuth = createAxios(baseURL, token);
				result = await axiosData(axiosAuth, path);
				if (result && !result.error && result.data) {
					result.data['accessToken'] = token;
					storage.accessToken.set(token);
					setCookie('accessToken', token, 3);
				}
			}
		}
		return result;
	} catch (e) {
		if (ENV.DEV) console.error(e);
	}
};

export const deleteAction = async (
	path: string,
	accessToken?: Token,
	refreshToken?: Token
): Record<string, any> => {
	try {
		const method: string = 'delete';
		const baseURL = `${ENV.PUBLIC_API_BASEURI}/${ENV.PUBLIC_API_VERSION}`;
		let axiosAuth = createAxios(baseURL, accessToken);
		let result = await axiosData(axiosAuth, path, null, null, method);
		let status: number = Number(result?.error?.status || result?.error?.response?.status || '200');
		if (result?.error && status > 399 && status < 410 && !!refreshToken) {
			const { user, token }: { user: UserToken; token: Token } = await getToken(refreshToken);
			if (!!token) {
				axiosAuth = createAxios(baseURL, token);
				result = await axiosData(axiosAuth, path, null, null, method);
				if (result && !result.error && result.data) {
					result.data['accessToken'] = token;
					storage.accessToken.set(token);
					setCookie('accessToken', token, 3);
				}
			}
		}
		return result;
	} catch (e) {
		if (ENV.DEV) console.error(e);
	}
};

export const getToken = async (
	token: Token,
	type: string = 'Access'
): Promise<{ user: UserToken; token: Token }> => {
	const resp = await postAction('auth/token', { token, type });
	return resp?.data as { user: UserToken; token: Token };
};

export const verifyToken = async (token: Token): Promise<{ user: UserToken }> => {
	const resp = await postAction('auth/token', { token, type: 'Access', action: 'verify' });
	return resp?.data as { user: UserToken };
};

export const parseCookieHeader = (header: string): Record<string, string> => {
	const cookies = {};
	if (!!!header) return cookies;
	const arr = header.split(',').map((ck) => {
		const cookie = ck.trim().split(';')[0].split('=');
		cookies[cookie[0]] = cookie[1];
		return {
			[cookie[0]]: cookie[1]
		};
	});
	return cookies;
};

export const returnJson = (
	data: Record<string, any>,
	status: number = 200,
	message: string = 'OK'
): Response => json({ status, message, data });

export const isNumeric = (n: string): boolean => !isNaN(parseFloat(n)) && isFinite(Number(n));

export const isDate = (d: any): boolean => d instanceof Date && !Number.isNaN(d.getTime());

export const removeFromArray = (arr: Array<any>, item: any): Array<any> => {
	if (arr.length < 1 || arr.indexOf(item) < 0) return arr;
	return arr.splice(arr.indexOf(item), 1);
};

export const validateEmail = (email: string): RegExpMatchArray | null =>
	String(email)
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@']+(\.[^<>()[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);

export const validatePassword = (password: string): RegExpMatchArray | null =>
	String(password).match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/);

export const getRandomString = (len = 12): string =>
	Math.random()
		.toString(36)
		.slice(-1 * len);

export const getRandomInt = (min: number, max: number): number => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getExt = (file?: File): string =>
	((file.type ? file.type.split('/') : (file.name || '1.dat').split('.')) as Array)
		.reverse()[0]
		.toLowerCase();

export const base64toFile = (
	base64Data: string,
	type: string = undefined,
	sliceSize: number = 1024
): File => {
	try {
		const base64Parts: string[] = base64Data.split(';base64,');
		if (!type) type = base64Parts[0].split(':').reverse()[0].toLowerCase();
		var byteCharacters = atob(base64Parts[1]);
		var bytesLength = byteCharacters.length;
		var slicesCount = Math.ceil(bytesLength / sliceSize);
		var byteArrays = new Array(slicesCount);
		for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
			var begin = sliceIndex * sliceSize;
			var end = Math.min(begin + sliceSize, bytesLength);
			var bytes = new Array(end - begin);
			for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
				bytes[i] = byteCharacters[offset].charCodeAt(0);
			}
			byteArrays[sliceIndex] = new Uint8Array(bytes);
		}
		return new File([new Blob(byteArrays, { type })], type.split('/').join('.'), { type });
	} catch (err) {
		console.error('base64toBlob error:', err);
	}
};

/**
 * JSON.parse() catching errors
 *
 * @param {String} data
 * @param {Object} json
 *
 */
export const parseJson = (data: string, obj?: object | undefined) => {
	try {
		obj = JSON.parse(data);
	} catch (e) {
		//console.error(e);
	}
	return obj;
};
