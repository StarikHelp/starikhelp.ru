export const config = {
	name: 'starikhelp',
	version: '0.1.1',
	title: 'StarikHelp',
	description: 'starikhelp.ru',
	homepage: 'https://starikhelp.ru',
	repository: 'https://github.com/ADITserv/starikhelp',
	author: 'Denis Glebko',
};

export const imgDir = `/images`;

export const avatarPath = (src: string) => imgDir + '/users/' + src;

export const imagesPath = (src: string, ...subdirs: string[]) =>
	[imgDir, ...subdirs, src].filter(Boolean).join('/');
