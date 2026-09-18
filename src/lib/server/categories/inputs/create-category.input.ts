export type CreateCategoryInput = {
	name: string;
	color: string | null;
	parentId: string | null;
	isEssential: boolean;
};
