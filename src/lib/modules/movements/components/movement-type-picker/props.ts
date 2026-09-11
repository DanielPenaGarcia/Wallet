import type { MovementType } from '../../types/movement.types';

export type MovementTypePickerProps = {
	onSelect: (type: MovementType) => void;
};
