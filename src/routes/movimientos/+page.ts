import { loadMovementsPage } from '$lib/local/finance-db';

export async function load({ url }) {
	return loadMovementsPage(url);
}
