<script lang="ts">
	import { untrack } from 'svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import {
		getIncomePaymentFrequencyLabel,
		incomePaymentFrequencyOptions
	} from '../../utils/income-payment-frequency-options';
	import WorkScheduleField from '../work-schedule-field/WorkScheduleField.svelte';
	import type { EditJobIncomeFormProps } from './props';

	let { income, feedback = null, onCancel }: EditJobIncomeFormProps = $props();
	let editFeedback = $derived(feedback?.action === 'update-income' && feedback.targetId === income.id ? feedback : null);
	let amountType = $state<'gross' | 'net'>(untrack(() => feedback?.action === 'update-income' && feedback.targetId === income.id ? (feedback.values?.amountType ?? income.amountType) : income.amountType));
	let paymentFrequency = $state<'weekly' | 'semimonthly' | 'monthly'>(untrack(() => feedback?.action === 'update-income' && feedback.targetId === income.id ? (feedback.values?.paymentFrequency ?? income.paymentFrequency) : income.paymentFrequency));
	let hasSchedule = $state(untrack(() => feedback?.action === 'update-income' && feedback.targetId === income.id ? (feedback.values?.hasSchedule ?? false) : Boolean(income.schedule)));

	function fieldError(field: string) {
		return editFeedback?.errors?.[field]?.[0];
	}
</script>

<form method="POST" action="?/updateJobIncome" class="grid gap-4">
	<input type="hidden" name="id" value={income.id} />
	<div class="grid gap-2">
		<Label for="edit-income-job-name">Trabajo</Label>
		<Input id="edit-income-job-name" name="jobName" required maxlength={80} value={editFeedback?.values?.jobName ?? income.jobName} class="h-11 border-outline" aria-invalid={fieldError('jobName') ? 'true' : undefined} />
		{#if fieldError('jobName')}<span class="text-xs text-destructive">{fieldError('jobName')}</span>{/if}
	</div>
	<div class="grid gap-2">
		<Label for="edit-income-monthly-amount">Ganancia mensual</Label>
		<Input id="edit-income-monthly-amount" name="monthlyAmount" required type="number" min="0.01" step="0.01" value={editFeedback?.values?.monthlyAmount ?? (income.monthlyAmount / 100).toFixed(2)} class="h-11 border-outline" aria-invalid={fieldError('monthlyAmount') ? 'true' : undefined} />
		{#if fieldError('monthlyAmount')}<span class="text-xs text-destructive">{fieldError('monthlyAmount')}</span>{/if}
	</div>
	<div class="grid gap-2">
		<Label for="edit-income-frequency">Frecuencia de pago</Label>
		<Select.Root type="single" name="paymentFrequency" required bind:value={paymentFrequency} items={incomePaymentFrequencyOptions}>
			<Select.Trigger id="edit-income-frequency" class="h-11 w-full border-outline px-3"><span>{getIncomePaymentFrequencyLabel(paymentFrequency)}</span></Select.Trigger>
			<Select.Content>
				{#each incomePaymentFrequencyOptions as option}
					<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</div>
	<div class="grid gap-2">
		<Label for="edit-income-amount-type">Tipo de monto</Label>
		<Select.Root type="single" name="amountType" required bind:value={amountType} items={[{ value: 'gross', label: 'Bruto' }, { value: 'net', label: 'Neto' }]}>
			<Select.Trigger id="edit-income-amount-type" class="h-11 w-full border-outline px-3"><span>{amountType === 'gross' ? 'Bruto' : 'Neto'}</span></Select.Trigger>
			<Select.Content><Select.Item value="gross" label="Bruto">Bruto</Select.Item><Select.Item value="net" label="Neto">Neto</Select.Item></Select.Content>
		</Select.Root>
	</div>
	<div class="grid gap-2">
		<Label for="edit-income-currency">Moneda</Label>
		<Input id="edit-income-currency" name="currencyCode" required maxlength={3} value={editFeedback?.values?.currencyCode ?? income.currencyCode} class="h-11 border-outline uppercase" aria-invalid={fieldError('currencyCode') ? 'true' : undefined} />
		{#if fieldError('currencyCode')}<span class="text-xs text-destructive">{fieldError('currencyCode')}</span>{/if}
	</div>
	<label class="flex items-start gap-3 rounded-md border border-outline bg-surface-subtle px-3 py-3 text-sm text-on-surface-variant">
		<input name="hasSchedule" type="checkbox" bind:checked={hasSchedule} class="mt-0.5 size-4 rounded border-outline accent-primary" />
		<span>
			<span class="block font-semibold text-on-surface">Tiene horario</span>
			<span class="block text-xs leading-5 text-on-surface-muted">Activa esta opción si quieres guardar el horario de este ingreso.</span>
		</span>
	</label>
	{#if hasSchedule}
		<div class="grid gap-2">
			<span class="text-sm font-medium text-on-surface">Horario</span>
			<WorkScheduleField
				idPrefix="edit-income"
				value={editFeedback?.values?.schedule ?? income.schedule ?? ''}
				error={fieldError('schedule')}
			/>
		</div>
	{/if}
	{#if editFeedback?.message}<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{editFeedback.message}</p>{/if}
	<div class="flex justify-end gap-2">
		<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit">Guardar cambios</ActionButton>
	</div>
</form>
