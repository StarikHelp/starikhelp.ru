import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { getCookie, setCookie, deleteCookie } from '$lib/cookie';

const defaults: Record<string, string> = {
	expires: '',
	refreshToken: '',
	accessToken: '',
	user: null,
	uid: ''
};

const storage: Record<string, any> = { getValue: get };

Object.keys(defaults)
	.filter((k) => !!k)
	.forEach((key) => {
		let def = defaults[key];
		if (browser && localStorage) {
			const str = localStorage.getItem(key);
			if (str !== null) def = JSON.parse(str);
		}
		storage[key] = writable<string>(def);
		storage[key].subscribe((val) => {
			if (browser && localStorage) {
				if (['', null, undefined].includes(val)) {
					localStorage.removeItem(key);
				} else {
					localStorage.setItem(key, JSON.stringify(val));
				}
			}
		});
		if (browser && localStorage) {
			window.addEventListener(`${key}Storage`, () => {
				const str = localStorage.getItem(key);
				if (str === null) return;
				const val = JSON.parse(str);
				if (val !== get(storage[key])) storage[key].set(val);
			});
		}
	});

storage.clearStorage = () => {
	Object.keys(storage)
		.filter((k) => !!k && k != 'getValue' && k != 'clearStorage')
		.forEach((key) => {
			storage[key].set(null);
		});
};

export default storage;
