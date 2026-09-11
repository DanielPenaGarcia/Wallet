import type { IsoDateTime } from '$lib/shared/types/date.types';

export type Bank = {
	id: string;
	name: string;
	shortName: string | null;
	countryCode: string;
	active: boolean;
	registeredAt: IsoDateTime;
	timeZone: string;
};
