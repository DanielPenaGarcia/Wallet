import { getNextIncomePayment } from '$lib/modules/incomes/utils/next-income-payment';
import { getJobIncomes } from '$lib/server/modules/incomes/income.service';

export async function load() {
	const incomes = await getJobIncomes();

	return {
		nextIncomePayment: getNextIncomePayment(incomes)
	};
}
