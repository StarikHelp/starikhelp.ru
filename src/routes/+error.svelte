<script lang="ts">
	import { page } from '$app/stores';
	import NotFound from '$lib/components/error/NotFound.svelte';
	import Maintenance from '$lib/components/error/Maintenance.svelte';
	import ServerError from '$lib/components/error/ServerError.svelte';
	import MetaTag from '$lib/components/MetaTag.svelte';
	import ENV from '$lib/public';
	import '../app.css';

	const { name, description = 'Not Found' } = NotFound;

	const status = +$page.status;
	if (ENV.DEV) console.log('error status:', status);

	const pages = {
		400: 'Something Has Gone Wrong',
		404: 'Page Not Found',
		500: 'Server Error'
	} as const;

	const components = {
		400: Maintenance,
		404: NotFound,
		500: ServerError
	} as const;

	type ErrorCode = keyof typeof pages;

	const index = Object.keys(components)
		.map((x) => +x)
		.reduce((p, c) => (p < status ? c : p)) as ErrorCode;
	if (ENV.DEV) console.log('error index:', index);
	const component = components[index];

	const title: string = `${index} - ${pages[index]}`;
</script>

<MetaTag {description} {title} />

<svelte:component this={component} />
