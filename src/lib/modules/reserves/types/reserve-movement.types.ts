export const reserveMovementKinds = ['credit', 'semimonthly', 'monthly'] as const;

export type ReserveMovementKind = (typeof reserveMovementKinds)[number];
