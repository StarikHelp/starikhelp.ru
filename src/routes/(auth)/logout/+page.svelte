<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { clearUserData } from '$lib/auth';

	onMount(async () => {
		clearUserData();
		await goto('/');
	});
</script>
