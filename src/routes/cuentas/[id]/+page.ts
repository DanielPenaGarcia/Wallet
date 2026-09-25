import { loadAccountDetailPage } from '$lib/local/finance-db';

export const prerender = false;

export async function load({ params }) {
	return loadAccountDetailPage(params.id);
}
