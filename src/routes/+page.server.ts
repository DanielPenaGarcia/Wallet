import { dashboardService } from '$lib/server/dashboard/dashboard.service';

export async function load() {
	return {
		summary: await dashboardService.getSummary()
	};
}
