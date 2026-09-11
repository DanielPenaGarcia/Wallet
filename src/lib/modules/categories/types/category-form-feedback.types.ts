export type CategoryFormFeedback = {
	action: 'create-category' | 'update-category' | 'delete-category';
	success?: string;
	message?: string;
	errors?: Record<string, string[]>;
	values?: {
		id?: string;
		name: string;
		color: string;
		parentId: string | null;
	};
};
