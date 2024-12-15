<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import { config } from '$lib/config';

	export let description: string = config.description;
	export let title: string = config.name;
</script>

<MetaTags {title} {description} />
