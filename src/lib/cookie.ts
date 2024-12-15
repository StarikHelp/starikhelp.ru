import { browser } from '$app/environment';

// GET COOKIE
export const getCookie = (name: string): string => {
	if (browser) {
		let cookieName: string = name + '=';
		let decodedCookie = decodeURIComponent(document.cookie);
		let ca: string[] = decodedCookie.split(';');
		for (let i = 0; i < ca.length; i++) {
			let c: string = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(cookieName) == 0) {
				return c.substring(cookieName.length, c.length);
			}
		}
	}
	return '';
};

// SET COOKIE
export const setCookie = (
	name: string,
	value: string,
	exphours: number = 24,
	secure: boolean = true,
	path: string = '/'
): void => {
	if (browser) {
		const d: Date = new Date();
		d.setTime(d.getTime() + exphours * 60 * 60 * 1000);
		let cookie: string = `${name}=${value};expires=${d.toUTCString()};path=${path}`;
		if (secure) {
			document.cookie = `${cookie};secure`;
		} else {
			document.cookie = cookie;
		}
	}
};

// DELETE COOKIE
export const deleteCookie = (name: string, path: string = '/'): void => {
	if (browser) {
		document.cookie = `${name}=;path=${path}; Max-Age=-99999999;`;
	}
};
