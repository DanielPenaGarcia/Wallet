import type { Movement } from '../../types/movement.types';

export type MovementListProps = {
	movements: Movement[];
	period: {
		startDate: string;
		endDate: string;
	};
	onCreate: () => void;
	onBulkCreate: () => void;
	onExport: () => void;
	onEdit: (movement: Movement) => void;
	onDelete: (movement: Movement) => void;
};
