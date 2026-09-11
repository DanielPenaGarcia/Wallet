import { asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { jobIncomes } from '$lib/server/db/schema';
import type { CreateJobIncomeInput } from './inputs/create-job-income.input';
import type { UpdateJobIncomeInput } from './inputs/update-job-income.input';

export async function insertJobIncome(input: CreateJobIncomeInput) {
	const now = new Date().toISOString();
	await db.insert(jobIncomes).values({
		id: crypto.randomUUID(),
		...input,
		active: true,
		registeredAt: now,
		updatedAt: null,
		deletedAt: null
	});
}

export async function findActiveJobIncomeById(id: string) {
	return db.query.jobIncomes.findFirst({
		where: (income, { and, eq }) => and(eq(income.id, id), eq(income.active, true))
	});
}

export async function updateJobIncomeRecord(input: UpdateJobIncomeInput) {
	await db
		.update(jobIncomes)
		.set({
			jobName: input.jobName,
			monthlyAmount: input.monthlyAmount,
			amountType: input.amountType,
			paymentFrequency: input.paymentFrequency,
			schedule: input.schedule,
			currencyCode: input.currencyCode,
			updatedAt: new Date().toISOString()
		})
		.where(eq(jobIncomes.id, input.id));
}

export async function softDeleteJobIncomeRecord(id: string) {
	const deletedAt = new Date().toISOString();
	await db
		.update(jobIncomes)
		.set({ active: false, deletedAt, updatedAt: deletedAt })
		.where(eq(jobIncomes.id, id));
}

export async function listActiveJobIncomes() {
	return db
		.select()
		.from(jobIncomes)
		.where(eq(jobIncomes.active, true))
		.orderBy(asc(jobIncomes.jobName));
}
