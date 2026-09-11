import type { Movement } from '../../types/movement.types';
import type { MovementFormFeedback } from '../../types/movement-form-feedback.types';

export type DeleteMovementFormProps = {
	movement: Movement;
	feedback?: MovementFormFeedback | null;
	onCancel: () => void;
};
