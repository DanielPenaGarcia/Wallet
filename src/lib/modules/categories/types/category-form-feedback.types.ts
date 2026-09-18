export type CategoryFormFeedback = {
	action: 'create-category' | 'update-category' | 'delete-category';
	success?: string;
	message?: string;
	errors?: Record<string, string[]>;
	values?: {
		id?: string;
		name: string;
		color?: string | null;
		parentId: string | null;
		isEssential: boolean;
	};
};
