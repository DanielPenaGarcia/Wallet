import { loadLoanDetailPage } from '$lib/local/finance-db';

export const prerender = false;

export async function load({ params }) {
	return loadLoanDetailPage(params.id);
}
