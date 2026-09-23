import { accountService } from '$lib/server/accounts/account.service';
import { creditCardStatementService } from '$lib/server/credit-card-statements/credit-card-statement.service';
import { financialGoalService } from '$lib/server/goals/financial-goal.service';
import { loanService } from '$lib/server/loans/loan.service';
import { financialPlanningService } from '$lib/server/planning/financial-planning.service';
import { recurringExpenseService } from '$lib/server/recurring-expenses/recurring-expense.service';
import { recurringIncomeService } from '$lib/server/recurring-incomes/recurring-income.service';

export async function load() {
	const [accounts, recurringIncomes, recurringExpenses, goals, loans] = await Promise.all([
		accountService.getAccounts(),
		recurringIncomeService.getRecurringIncomes(),
		recurringExpenseService.getRecurringExpenses(),
		financialGoalService.getFinancialGoals(),
		loanService.getLoans()
	]);
	const creditStatements = (await Promise.all(
		accounts
			.filter((account) => account.type === 'credit' && account.isActive)
			.map((account) => creditCardStatementService.getLatestStatement(account.id))
	)).filter((statement) => statement !== undefined);

	return {
		planning: financialPlanningService.planNextIncome({
			accounts,
			recurringIncomes,
			recurringExpenses,
			creditCardStatements: creditStatements,
			goals,
			loans
		})
	};
}
