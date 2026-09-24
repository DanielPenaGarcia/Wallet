<script lang="ts">
	import { untrack } from 'svelte';
	import CategorySelectField from '$lib/modules/categories/components/category-select-field/CategorySelectField.svelte';
	import CardSelectField from '$lib/modules/cards/components/card-select-field/CardSelectField.svelte';
	import ExpenseAmountKindField from '$lib/modules/expenses/components/expense-amount-kind-field/ExpenseAmountKindField.svelte';
	import ExpenseFrequencyField from '$lib/modules/expenses/components/expense-frequency-field/ExpenseFrequencyField.svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import type { ExpenseAmountKind, ExpenseIntervalUnit } from '$lib/modules/expenses/types/expense.types';
	import {
		monthDayOptions,
		monthOptions,
		recurringExpenseFrequencyOptions,
		weekDayOptions
	} from '../../utils/recurring-expense-labels';
	import type { RecurringExpenseFrequency } from '../../types/recurring-expense.types';
	import type { RecurringExpenseFormProps } from './props';

	let { mode, expense, categories, paymentAccounts, feedback = null, onCancel }: RecurringExpenseFormProps = $props();
	let expectedAction = $derived(mode === 'create' ? 'create-recurring-expense' : 'update-recurring-expense');
	let matchingFeedback = $derived(
		feedback?.action === expectedAction && (mode === 'create' || feedback.targetId === expense?.id)
			? feedback
			: null
	);
	let idPrefix = $derived(mode === 'create' ? 'create-recurring-expense' : `edit-recurring-expense-${expense?.id ?? ''}`);
	let categoryId = $state(untrack(() => matchingFeedback?.values?.categoryId ?? expense?.categoryId ?? ''));
	let paymentAccountId = $state(untrack(() => matchingFeedback?.values?.paymentAccountId ?? expense?.paymentAccountId ?? ''));
	let amountKind = $state<ExpenseAmountKind>(untrack(() => matchingFeedback?.values?.amountKind ?? expense?.amountKind ?? 'fixed'));
	let frequency = $state<RecurringExpenseFrequency>(untrack(() => matchingFeedback?.values?.frequency ?? expense?.frequency ?? 'monthly'));
	let customIntervalCount = $state(untrack(() => matchingFeedback?.values?.customIntervalCount ?? String(expense?.customIntervalCount ?? '2')));
	let customIntervalUnit = $state<ExpenseIntervalUnit | ''>(untrack(() => matchingFeedback?.values?.customIntervalUnit ?? expense?.customIntervalUnit ?? 'months'));
	let weeklyDay = $state(untrack(() => weeklyDayValue()));
	let semimonthlySecondDay = $state(untrack(() => semimonthlySecondDayValue()));
	let monthlyDay = $state(untrack(() => monthlyDayValue()));
	let yearlyMonth = $state(untrack(() => yearlyMonthValue()));
	let yearlyDay = $state(untrack(() => yearlyDayValue()));
	let isActive = $state(untrack(() => matchingFeedback?.values?.isActive ?? expense?.isActive ?? true));

	function fieldError(field: string) {
		return matchingFeedback?.errors?.[field]?.[0];
	}

	function amountValue() {
		if (matchingFeedback?.values?.amount) return matchingFeedback.values.amount;
		if (!expense) return '';
		return String(expense.amountCents / 100);
	}

	function weeklyDayValue() {
		if (matchingFeedback?.values?.weeklyDay) return matchingFeedback.values.weeklyDay;
		return expense?.paymentSchedule.type === 'weekly' ? expense.paymentSchedule.weekday : 'monday';
	}

	function semimonthlyFirstDayValue() {
		if (matchingFeedback?.values?.semimonthlyFirstDay) return matchingFeedback.values.semimonthlyFirstDay;
		return expense?.paymentSchedule.type === 'semimonthly' ? String(expense.paymentSchedule.firstDay) : '15';
	}

	function semimonthlySecondDayValue() {
		if (matchingFeedback?.values?.semimonthlySecondDay) return matchingFeedback.values.semimonthlySecondDay;
		return expense?.paymentSchedule.type === 'semimonthly' ? String(expense.paymentSchedule.secondDay) : 'last';
	}

	function monthlyDayValue() {
		if (matchingFeedback?.values?.monthlyDay) return matchingFeedback.values.monthlyDay;
		return expense?.paymentSchedule.type === 'monthly' ? String(expense.paymentSchedule.day) : '1';
	}

	function yearlyMonthValue() {
		if (matchingFeedback?.values?.yearlyMonth) return matchingFeedback.values.yearlyMonth;
		return expense?.paymentSchedule.type === 'yearly' ? String(expense.paymentSchedule.month) : '1';
	}

	function yearlyDayValue() {
		if (matchingFeedback?.values?.yearlyDay) return matchingFeedback.values.yearlyDay;
		return expense?.paymentSchedule.type === 'yearly' ? String(expense.paymentSchedule.day) : '1';
	}
</script>

<form
	method="POST"
	action={mode === 'create' ? '?/createRecurringExpense' : '?/updateRecurringExpense'}
	class="grid gap-4"
>
	{#if mode === 'edit' && expense}<input type="hidden" name="id" value={expense.id} />{/if}

	<div class="grid gap-2">
		<Label for={`${idPrefix}-name`}>Nombre del gasto</Label>
		<Input
			id={`${idPrefix}-name`}
			name="name"
			required
			maxlength={100}
			value={matchingFeedback?.values?.name ?? expense?.name ?? ''}
			placeholder="Ej. Electricidad"
			class="h-11 border-outline"
			aria-invalid={fieldError('name') ? 'true' : undefined}
		/>
		{#if fieldError('name')}<span class="text-xs text-destructive">{fieldError('name')}</span>{/if}
	</div>

	<CategorySelectField
		id={`${idPrefix}-category`}
		name="categoryId"
		label="Categoría"
		{categories}
		bind:value={categoryId}
		required
		error={fieldError('categoryId')}
	/>

	<CardSelectField
		id={`${idPrefix}-payment-account`}
		name="paymentAccountId"
		label="Cuenta de pago esperada"
		cards={paymentAccounts}
		bind:value={paymentAccountId}
		required={false}
		emptyLabel="Sin cuenta asignada"
		placeholder="Selecciona débito o crédito"
		error={fieldError('paymentAccountId')}
	/>

	<div class="grid gap-4 sm:grid-cols-2">
		<div class="grid gap-2">
			<Label for={`${idPrefix}-amount`}>Monto</Label>
			<Input
				id={`${idPrefix}-amount`}
				name="amount"
				required
				type="number"
				min="0.01"
				step="0.01"
				value={amountValue()}
				placeholder="0.00"
				class="h-11 border-outline"
				aria-invalid={fieldError('amount') ? 'true' : undefined}
			/>
			{#if fieldError('amount')}<span class="text-xs text-destructive">{fieldError('amount')}</span>{/if}
		</div>

		<ExpenseAmountKindField id={`${idPrefix}-amount-kind`} bind:value={amountKind} error={fieldError('amountKind')} />
	</div>

	<div class="grid gap-4 sm:grid-cols-3">
		<ExpenseFrequencyField
			{idPrefix}
			bind:frequency={frequency}
			bind:customIntervalCount={customIntervalCount}
			bind:customIntervalUnit={customIntervalUnit}
			options={recurringExpenseFrequencyOptions}
			frequencyError={fieldError('frequency')}
			customIntervalCountError={fieldError('customIntervalCount')}
			customIntervalUnitError={fieldError('customIntervalUnit')}
		/>
	</div>

	{#if frequency === 'weekly'}
		<div class="grid gap-2">
			<Label for={`${idPrefix}-weekly-day`}>Día esperado de pago</Label>
			<Select.Root type="single" name="weeklyDay" required bind:value={weeklyDay} items={weekDayOptions}>
				<Select.Trigger id={`${idPrefix}-weekly-day`} class="h-11 w-full border-outline px-3">
					<span>{weekDayOptions.find((day) => day.value === weeklyDay)?.label ?? 'Lunes'}</span>
				</Select.Trigger>
				<Select.Content>
					{#each weekDayOptions as day}
						<Select.Item value={day.value} label={day.label}>{day.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	{:else if frequency === 'semimonthly'}
		<div class="grid gap-2">
			<Label>Pago quincenal</Label>
			<div class="grid grid-cols-2 gap-2">
				<Input name="semimonthlyFirstDay" type="number" min="1" max="31" value={semimonthlyFirstDayValue()} aria-label="Primer día de pago" class="h-11 border-outline" />
				<Select.Root type="single" name="semimonthlySecondDay" required bind:value={semimonthlySecondDay} items={monthDayOptions}>
					<Select.Trigger class="h-11 w-full border-outline px-3">
						<span>{monthDayOptions.find((day) => day.value === semimonthlySecondDay)?.label ?? semimonthlySecondDay}</span>
					</Select.Trigger>
					<Select.Content>
						{#each monthDayOptions as day}
							<Select.Item value={day.value} label={day.label}>{day.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>
	{:else if frequency === 'monthly'}
		<div class="grid gap-2">
			<Label for={`${idPrefix}-monthly-day`}>Día esperado de pago</Label>
			<Select.Root type="single" name="monthlyDay" required bind:value={monthlyDay} items={monthDayOptions}>
				<Select.Trigger id={`${idPrefix}-monthly-day`} class="h-11 w-full border-outline px-3">
					<span>{monthDayOptions.find((day) => day.value === monthlyDay)?.label ?? monthlyDay}</span>
				</Select.Trigger>
				<Select.Content>
					{#each monthDayOptions as day}
						<Select.Item value={day.value} label={day.label}>{day.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	{:else if frequency === 'yearly'}
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="grid gap-2">
				<Label for={`${idPrefix}-yearly-month`}>Mes esperado</Label>
				<Select.Root type="single" name="yearlyMonth" required bind:value={yearlyMonth} items={monthOptions}>
					<Select.Trigger id={`${idPrefix}-yearly-month`} class="h-11 w-full border-outline px-3">
						<span>{monthOptions.find((month) => month.value === yearlyMonth)?.label ?? 'Enero'}</span>
					</Select.Trigger>
					<Select.Content>
						{#each monthOptions as month}
							<Select.Item value={month.value} label={month.label}>{month.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="grid gap-2">
				<Label for={`${idPrefix}-yearly-day`}>Día esperado</Label>
				<Select.Root type="single" name="yearlyDay" required bind:value={yearlyDay} items={monthDayOptions}>
					<Select.Trigger id={`${idPrefix}-yearly-day`} class="h-11 w-full border-outline px-3">
						<span>{monthDayOptions.find((day) => day.value === yearlyDay)?.label ?? yearlyDay}</span>
					</Select.Trigger>
					<Select.Content>
						{#each monthDayOptions as day}
							<Select.Item value={day.value} label={day.label}>{day.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>
	{:else}
		<p class="flex h-11 items-center rounded-md border border-outline bg-surface px-3 text-sm text-on-surface-variant">
			{frequency === 'daily' ? 'Cada día' : 'La siguiente fecha se calcula desde la fecha base.'}
		</p>
	{/if}
	{#if fieldError('paymentSchedule')}<span class="text-xs text-destructive">{fieldError('paymentSchedule')}</span>{/if}

	<div class="grid gap-4 sm:grid-cols-2">
		<div class="grid gap-2">
			<Label for={`${idPrefix}-statement-day`}>Día de corte</Label>
			<Input
				id={`${idPrefix}-statement-day`}
				name="statementDay"
				type="number"
				min="1"
				max="31"
				value={matchingFeedback?.values?.statementDay ?? expense?.statementDay ?? ''}
				placeholder="Opcional"
				class="h-11 border-outline"
				aria-invalid={fieldError('statementDay') ? 'true' : undefined}
			/>
			{#if fieldError('statementDay')}<span class="text-xs text-destructive">{fieldError('statementDay')}</span>{/if}
		</div>
		<div class="grid gap-2">
			<Label for={`${idPrefix}-last-paid-at`}>Última fecha de pago</Label>
			<Input
				id={`${idPrefix}-last-paid-at`}
				name="lastPaidAt"
				type="date"
				value={matchingFeedback?.values?.lastPaidAt ?? expense?.lastPaidAt ?? ''}
				class="h-11 border-outline"
				aria-invalid={fieldError('lastPaidAt') ? 'true' : undefined}
			/>
			{#if fieldError('lastPaidAt')}<span class="text-xs text-destructive">{fieldError('lastPaidAt')}</span>{/if}
		</div>
	</div>

	<label class="flex w-fit cursor-pointer items-center">
		<input name="isActive" type="checkbox" bind:checked={isActive} class="sr-only" />
		<Badge
			variant={isActive ? 'default' : 'outline'}
			class="h-7 px-3 text-sm font-semibold {isActive ? '' : 'text-on-surface-variant'}"
		>
			{isActive ? 'Activo' : 'Inactivo'}
		</Badge>
	</label>

	{#if matchingFeedback?.message}<p class="break-words rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{matchingFeedback.message}</p>{/if}

	<div class="grid gap-2 sm:flex sm:justify-end">
		{#if onCancel}<ActionButton type="button" intent="secondary" class="w-full sm:w-auto" onclick={onCancel}>Cancelar</ActionButton>{/if}
		<ActionButton type="submit" class="w-full sm:w-auto">{mode === 'create' ? 'Registrar gasto' : 'Guardar cambios'}</ActionButton>
	</div>
</form>
