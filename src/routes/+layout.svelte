<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import { page } from '$app/stores';
	import { config } from '$lib/config';
	import ENV from '$lib/public';
	import storage from '$lib/storage';
	import modeobserver from '$lib/modeobserver';
	import MetaTag from '$lib/components/MetaTag.svelte';
	import '../app.css';

	const { title, description } = config;

	let { children } = $props();

	Object.keys(storage)
		.filter((k) => !!k && k != 'getValue' && k != 'clearStorage')
		.forEach((key) => {
			if (storage.getValue(storage[key])) setContext(key, storage[key]);
		});

	onMount(modeobserver);
</script>

<MetaTag {description} {title} />

{@render children()}
