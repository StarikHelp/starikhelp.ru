<script lang="ts">
	import { Label, Input, Checkbox, A, Button, Card } from 'flowbite-svelte';
	import { onMount, getContext } from 'svelte';
	import { afterNavigate, invalidateAll, goto } from '$app/navigation';
	import { applyAction, deserialize } from '$app/forms';
	import { page } from '$app/stores';
	import { config } from '$lib/config';
	import { getCookie, setCookie, deleteCookie } from '$lib/cookie';
	import { getAction, postAction, parseQueryString, isDate } from '$lib/utils';
	import type { Email } from '$lib/utils';
	import storage from '$lib/storage';
	import ENV from '$lib/public';

	let title = 'Sign in to platform';
	let loginTitle = 'Login to your account';
	let mainClass = 'bg-gray-50 dark:bg-gray-900 w-full';
	let mainDivClass =
		'flex flex-col items-center justify-center px-6 pt-8 mx-auto md:h-screen pt:mt-0 dark:bg-gray-900';
	let siteLinkClass =
		'flex items-center justify-center mb-8 text-2xl font-semibold lg:mb-10 dark:text-white';
	let siteImgClass = 'mr-4 h-11';
	let cardH1Class = 'text-2xl font-bold text-gray-900 dark:text-white';

	let errorCode: number = $state(0);
	let errorMessage: string = $derived(errorCode === 403 ? 'Access Denied!' : (errorCode === 402 ? 'Session Expired!' : ''));
	let showError: boolean = $derived(errorCode > 399);

	async function handleSubmit(event: { currentTarget: EventTarget & HTMLFormElement }): Promise<void> {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const email: Email = formData.get('email');
		const password: string = formData.get('password');

		const response = await postAction('auth/signin', { email, password });
		if (ENV.DEV) console.log('POST auth/signin response:', response);

		if (response?.data) {
			const { data } = response;

			if (data?.user) {
				const { id, role, email, firstname } = data.user;
				storage.user.set({ id, role, email });
				setCookie('firstname', firstname, 3);
			}
			if (data?.refreshToken) {
				storage.refreshToken.set(data.refreshToken);
				setCookie('refreshToken', data.refreshToken, 3);
			}
			if (data?.accessToken) {
				storage.accessToken.set(data.accessToken);
				setCookie('accessToken', data.accessToken, 3);
			}
			if (ENV.DEV) console.log('login after submit storage.user:', storage.getValue(storage.user));

			errorCode = 0;
			// rerun all `load` functions, following the successful update
			await invalidateAll();
			await goto(`/dashboard/${config.initSect}`);
		} else if (response?.error?.status) {
			errorCode = Number(response?.error?.status);
		}
	}

	afterNavigate((navigation) => {
		document.getElementById('svelte')?.scrollTo({ top: 0 });
		const url: URL = new URL(navigation.to?.url?.href || '');
		const qs: Record<string, string> = parseQueryString(url, 'error');
		if ('error' in qs) errorCode = Number(qs.error);
		if (ENV.DEV) console.log('afterNavigate errorCode:', errorCode, 'showError:', showError);
	});
</script>

<main class={mainClass}>
	<div class={mainDivClass}>
		<!-- Card -->
		<Card class="w-full" size="md" border={false}>
			<h1 class={cardH1Class}>
				{title}
			</h1>
			{#if showError}
				<br />
				<div class="font-bold text-red-900 dark:text-red-400">
					{errorMessage}
				</div>
			{/if}
			<form method="POST" class="mt-8 space-y-6" onsubmit={handleSubmit}>
				<div>
					<Label for="email" class="mb-2 dark:text-white">Your email:</Label>
					<Input
						type="email"
						name="email"
						id="email"
						placeholder="name@company.com"
						required
						class="border outline-none dark:border-gray-600 dark:bg-gray-700"
					/>
				</div>
				<div>
					<Label for="password" class="mb-2 dark:text-white">Your password:</Label>
					<Input
						type="password"
						name="password"
						id="password"
						placeholder="••••••••"
						required
						class="border outline-none dark:border-gray-600 dark:bg-gray-700"
					/>
				</div>
				<Button type="submit" size="lg">{loginTitle}</Button>
			</form>
		</Card>
	</div>
</main>
