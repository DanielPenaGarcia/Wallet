import type { DashboardSummary } from '$lib/modules/dashboard/types/dashboard-summary.types';
import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';
import type { ReserveMovementFeedback } from '../../types/reserve-movement-feedback.types';

export type ReserveBasicsSectionProps = {
	summary: DashboardSummary;
	debitCards?: CardListItem[];
	feedback?: ReserveMovementFeedback | null;
};
