import type { CreateJobIncomeInput } from './create-job-income.input';

export type UpdateJobIncomeInput = CreateJobIncomeInput & {
	id: string;
};
