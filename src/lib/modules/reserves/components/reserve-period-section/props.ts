import type { DashboardSummary } from '$lib/modules/dashboard/types/dashboard-summary.types';

export type ReservePeriod = 'weekly' | 'semimonthly' | 'monthly';

export type ReservePeriodSectionProps = {
	summary: DashboardSummary;
	period: ReservePeriod;
};
