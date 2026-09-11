import type { JobIncome } from '$lib/modules/incomes/types/job-income.types';
import { toJobIncome } from './income.mapper';
import { JobIncomeNotFoundError } from './income.errors';
import {
	findActiveJobIncomeById,
	insertJobIncome,
	listActiveJobIncomes,
	softDeleteJobIncomeRecord,
	updateJobIncomeRecord
} from './income.repository';
import type { CreateJobIncomeInput } from './inputs/create-job-income.input';
import type { UpdateJobIncomeInput } from './inputs/update-job-income.input';

export async function getJobIncomes(): Promise<JobIncome[]> {
	return (await listActiveJobIncomes()).map(toJobIncome);
}

export async function createJobIncome(input: CreateJobIncomeInput): Promise<void> {
	await insertJobIncome(input);
}

export async function updateJobIncome(input: UpdateJobIncomeInput): Promise<void> {
	if (!(await findActiveJobIncomeById(input.id))) throw new JobIncomeNotFoundError();
	await updateJobIncomeRecord(input);
}

export async function deleteJobIncome(id: string): Promise<void> {
	if (!(await findActiveJobIncomeById(id))) throw new JobIncomeNotFoundError();
	await softDeleteJobIncomeRecord(id);
}
