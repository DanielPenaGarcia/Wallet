<script lang="ts">
	import { untrack } from 'svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import type { IncomeFrequency, IncomeSource } from '../../types/recurring-income.types';
	import {
		getIncomeFrequencyLabel,
		getIncomeSourceLabel,
		incomeFrequencyOptions,
		incomeSourceOptions,
		workDayOptions
	} from '../../utils/recurring-income-labels';
	import RecurringWorkScheduleField from '../recurring-work-schedule-field/RecurringWorkScheduleField.svelte';
	import type { RecurringIncomeFormProps } from './props';

	let { mode, income, feedback = null, onCancel }: RecurringIncomeFormProps = $props();
	let expectedAction = $derived(mode === 'create' ? 'create-recurring-income' : 'update-recurring-income');
	let matchingFeedback = $derived(
		feedback?.action === expectedAction && (mode === 'create' || feedback.targetId === income?.id)
			? feedback
			: null
	);
	let source = $state<IncomeSource>(untrack(() => matchingFeedback?.values?.source ?? income?.source ?? 'work'));
	let frequency = $state<IncomeFrequency>(untrack(() => matchingFeedback?.values?.frequency ?? income?.frequency ?? 'semimonthly'));
	let isActive = $state(untrack(() => matchingFeedback?.values?.isActive ?? income?.isActive ?? true));
	let idPrefix = $derived(mode === 'create' ? 'create-recurring-income' : `edit-recurring-income-${income?.id ?? ''}`);
	let weeklyDay = $state(untrack(() => weeklyDayValue()));
	let semimonthlySecondDay = $state(untrack(() => semimonthlySecondDayValue()));
	let monthlyDay = $state(untrack(() => monthlyDayValue()));

	function fieldError(field: string) {
		return matchingFeedback?.errors?.[field]?.[0];
	}

	function amountValue() {
		if (matchingFeedback?.values?.expectedAmount) return matchingFeedback.values.expectedAmount;
		if (!income) return '';
		return String(income.expectedAmountCents / 100);
	}

	function weeklyDayValue() {
		if (matchingFeedback?.values?.weeklyDay) return matchingFeedback.values.weeklyDay;
		return income?.paymentSchedule.type === 'weekly' ? income.paymentSchedule.weekday : 'friday';
	}

	function semimonthlyFirstDayValue() {
		if (matchingFeedback?.values?.semimonthlyFirstDay) return matchingFeedback.values.semimonthlyFirstDay;
		return income?.paymentSchedule.type === 'semimonthly' ? String(income.paymentSchedule.firstDay) : '15';
	}

	function semimonthlySecondDayValue() {
		if (matchingFeedback?.values?.semimonthlySecondDay) return matchingFeedback.values.semimonthlySecondDay;
		return income?.paymentSchedule.type === 'semimonthly' ? String(income.paymentSchedule.secondDay) : 'last';
	}

	function monthlyDayValue() {
		if (matchingFeedback?.values?.monthlyDay) return matchingFeedback.values.monthlyDay;
		return income?.paymentSchedule.type === 'monthly' ? String(income.paymentSchedule.day) : '30';
	}
</script>

<form
	method="POST"
	action={mode === 'create' ? '?/createRecurringIncome' : '?/updateRecurringIncome'}
	class="grid gap-4"
>
	{#if mode === 'edit' && income}<input type="hidden" name="id" value={income.id} />{/if}

	<div class="grid gap-2">
		<Label for={`${idPrefix}-title`}>Nombre o título</Label>
		<Input
			id={`${idPrefix}-title`}
			name="title"
			required
			maxlength={100}
			value={matchingFeedback?.values?.title ?? income?.title ?? ''}
			placeholder="Ej. Trabajo Media Aérea"
			class="h-11 border-outline"
			aria-invalid={fieldError('title') ? 'true' : undefined}
		/>
		{#if fieldError('title')}<span class="text-xs text-destructive">{fieldError('title')}</span>{/if}
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<div class="grid gap-2">
			<Label for={`${idPrefix}-amount`}>Monto esperado</Label>
			<Input
				id={`${idPrefix}-amount`}
				name="expectedAmount"
				required
				type="number"
				min="0.01"
				step="0.01"
				value={amountValue()}
				placeholder="0.00"
				class="h-11 border-outline"
				aria-invalid={fieldError('expectedAmount') ? 'true' : undefined}
			/>
			{#if fieldError('expectedAmount')}<span class="text-xs text-destructive">{fieldError('expectedAmount')}</span>{/if}
		</div>

		<div class="grid gap-2">
			<Label for={`${idPrefix}-source`}>Fuente</Label>
			<Select.Root type="single" name="source" required bind:value={source} items={incomeSourceOptions}>
				<Select.Trigger id={`${idPrefix}-source`} class="h-11 w-full border-outline px-3">
					<span>{getIncomeSourceLabel(source)}</span>
				</Select.Trigger>
				<Select.Content>
					{#each incomeSourceOptions as option}
						<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			{#if fieldError('source')}<span class="text-xs text-destructive">{fieldError('source')}</span>{/if}
		</div>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<div class="grid gap-2">
			<Label for={`${idPrefix}-frequency`}>Frecuencia</Label>
			<Select.Root type="single" name="frequency" required bind:value={frequency} items={incomeFrequencyOptions}>
				<Select.Trigger id={`${idPrefix}-frequency`} class="h-11 w-full border-outline px-3">
					<span>{getIncomeFrequencyLabel(frequency)}</span>
				</Select.Trigger>
				<Select.Content>
					{#each incomeFrequencyOptions as option}
						<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			{#if fieldError('frequency')}<span class="text-xs text-destructive">{fieldError('frequency')}</span>{/if}
		</div>

		{#if frequency === 'weekly'}
			<div class="grid gap-2">
				<Label for={`${idPrefix}-weekly-day`}>Día de pago</Label>
				<Select.Root type="single" name="weeklyDay" required bind:value={weeklyDay} items={workDayOptions}>
					<Select.Trigger id={`${idPrefix}-weekly-day`} class="h-11 w-full border-outline px-3">
						<span>{workDayOptions.find((day) => day.value === weeklyDay)?.label ?? 'Viernes'}</span>
					</Select.Trigger>
					<Select.Content>
						{#each workDayOptions as day}
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
					<Select.Root type="single" name="semimonthlySecondDay" required bind:value={semimonthlySecondDay} items={[{ value: 'last', label: 'Último' }, { value: '30', label: '30' }, { value: '31', label: '31' }]}>
						<Select.Trigger class="h-11 w-full border-outline px-3">
							<span>{semimonthlySecondDay === 'last' ? 'Último' : semimonthlySecondDay}</span>
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="last" label="Último">Último día</Select.Item>
							<Select.Item value="30" label="30">30</Select.Item>
							<Select.Item value="31" label="31">31</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>
		{:else if frequency === 'monthly'}
			<div class="grid gap-2">
				<Label for={`${idPrefix}-monthly-day`}>Día de pago</Label>
				<Select.Root type="single" name="monthlyDay" required bind:value={monthlyDay} items={[{ value: 'last', label: 'Último día' }, ...Array.from({ length: 31 }, (_, index) => ({ value: String(index + 1), label: String(index + 1) }))]}>
					<Select.Trigger id={`${idPrefix}-monthly-day`} class="h-11 w-full border-outline px-3">
						<span>{monthlyDay === 'last' ? 'Último día' : monthlyDay}</span>
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="last" label="Último día">Último día</Select.Item>
						{#each Array.from({ length: 31 }, (_, index) => index + 1) as day}
							<Select.Item value={String(day)} label={String(day)}>{day}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		{:else}
			<div class="grid gap-2">
				<Label>Pago</Label>
				<p class="flex h-11 items-center rounded-md border border-outline bg-surface px-3 text-sm text-on-surface-variant">Cada día</p>
			</div>
		{/if}
	</div>
	{#if fieldError('paymentSchedule')}<span class="text-xs text-destructive">{fieldError('paymentSchedule')}</span>{/if}

	<label class="flex w-fit cursor-pointer items-center">
		<input name="isActive" type="checkbox" bind:checked={isActive} class="sr-only" />
		<Badge
			variant={isActive ? 'default' : 'outline'}
			class="h-7 px-3 text-sm font-semibold {isActive ? '' : 'text-on-surface-variant'}"
		>
			{isActive ? 'Activo' : 'Inactivo'}
		</Badge>
	</label>

	{#if source === 'work'}
		<div class="grid gap-2">
			<span class="text-sm font-medium text-on-surface">Horario de trabajo</span>
			<RecurringWorkScheduleField
				{idPrefix}
				value={matchingFeedback?.values?.parsedWorkSchedule ?? income?.workSchedule ?? null}
				error={fieldError('workSchedule')}
			/>
		</div>
	{/if}

	{#if matchingFeedback?.message}<p class="break-words rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{matchingFeedback.message}</p>{/if}

	<div class="grid gap-2 sm:flex sm:justify-end">
		{#if onCancel}<ActionButton type="button" intent="secondary" class="w-full sm:w-auto" onclick={onCancel}>Cancelar</ActionButton>{/if}
		<ActionButton type="submit" class="w-full sm:w-auto">{mode === 'create' ? 'Registrar ingreso' : 'Guardar cambios'}</ActionButton>
	</div>
</form>
