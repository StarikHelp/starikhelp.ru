// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			error: any;
			status: number;
			message: string;
			errorId: string;
		}
		// interface Locals {}
		interface PageData {
			// can add any properties here, return it from your root layout
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
