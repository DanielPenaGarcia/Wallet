import type { IsoDateTime } from '$lib/shared/types/date.types';

export type CategoryColor = `#${string}`;

export type Category = {
	id: string;
	name: string;
	color: CategoryColor;
	parentId: string | null;
	active: boolean;
	registeredAt: IsoDateTime;
	updatedAt: IsoDateTime;
	deletedAt: IsoDateTime | null;
};

export type CategoryNode = Category & {
	children: CategoryNode[];
};
