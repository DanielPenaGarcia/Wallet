export type CategoryColor = `#${string}`;

export type Category = {
	id: string;
	name: string;
	color: CategoryColor | null;
	parentId: string | null;
	isEssential: boolean;
	createdAt: string;
	updatedAt: string;
};

export type CategoryNode = Category & {
	children: CategoryNode[];
};
