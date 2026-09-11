import { getDashboardSummary } from '$lib/server/modules/dashboard/dashboard.service';

export async function load() {
	return {
		summary: await getDashboardSummary()
	};
}
