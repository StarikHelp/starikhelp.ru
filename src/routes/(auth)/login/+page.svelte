<script lang="ts">
	import { page } from '$app/stores';
	import Login from '$lib/components/Login.svelte';
	import MetaTag from '$lib/components/MetaTag.svelte';

	const path: string = $page.url.pathname;
	const description: string = 'Sign in - Admin Dashboard';
	const metaTitle: string = 'Admin Dashboard - Sign in';
	const subtitle: string = 'Sign in';
</script>

<MetaTag {path} {description} title={metaTitle} {subtitle} />

<Login />
