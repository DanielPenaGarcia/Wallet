export type MovementFormActionsProps = {
	mode: 'create' | 'edit';
	submitLabel: string;
	disabled?: boolean;
	onBack?: () => void;
	onCancel?: () => void;
};
