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
	import type { CreateJobIncomeFormProps } from './props';

	let { feedback = null }: CreateJobIncomeFormProps = $props();
	let createFeedback = $derived(feedback?.action === 'create-income' ? feedback : null);
	let amountType = $state<'gross' | 'net'>(untrack(() => feedback?.action === 'create-income' ? (feedback.values?.amountType ?? 'net') : 'net'));
	let paymentFrequency = $state<'weekly' | 'semimonthly' | 'monthly'>(untrack(() => feedback?.action === 'create-income' ? (feedback.values?.paymentFrequency ?? 'semimonthly') : 'semimonthly'));
	let hasSchedule = $state(untrack(() => feedback?.action === 'create-income' ? (feedback.values?.hasSchedule ?? false) : false));

	function fieldError(field: string) {
		return createFeedback?.errors?.[field]?.[0];
	}
</script>

<form method="POST" action="?/createJobIncome" class="grid gap-4">
		<div class="grid gap-2">
			<Label for="income-job-name">Trabajo</Label>
			<Input id="income-job-name" name="jobName" required maxlength={80} value={createFeedback?.values?.jobName ?? ''} placeholder="Ej. Trabajo principal" class="h-11 border-slate-300" aria-invalid={fieldError('jobName') ? 'true' : undefined} />
			{#if fieldError('jobName')}<span class="text-xs text-red-700">{fieldError('jobName')}</span>{/if}
		</div>

		<div class="grid gap-2">
			<Label for="income-monthly-amount">Ganancia mensual</Label>
			<Input id="income-monthly-amount" name="monthlyAmount" required type="number" min="0.01" step="0.01" value={createFeedback?.values?.monthlyAmount ?? ''} placeholder="0.00" class="h-11 border-slate-300" aria-invalid={fieldError('monthlyAmount') ? 'true' : undefined} />
			{#if fieldError('monthlyAmount')}<span class="text-xs text-red-700">{fieldError('monthlyAmount')}</span>{/if}
		</div>

		<div class="grid gap-2">
			<Label for="income-frequency">Frecuencia de pago</Label>
			<Select.Root type="single" name="paymentFrequency" required bind:value={paymentFrequency} items={incomePaymentFrequencyOptions}>
				<Select.Trigger id="income-frequency" class="h-11 w-full border-slate-300 px-3"><span>{getIncomePaymentFrequencyLabel(paymentFrequency)}</span></Select.Trigger>
				<Select.Content>
					{#each incomePaymentFrequencyOptions as option}
						<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<div class="grid gap-2">
			<Label for="income-amount-type">Tipo de monto</Label>
			<Select.Root type="single" name="amountType" required bind:value={amountType} items={[{ value: 'gross', label: 'Bruto' }, { value: 'net', label: 'Neto' }]}>
				<Select.Trigger id="income-amount-type" class="h-11 w-full border-slate-300 px-3"><span>{amountType === 'gross' ? 'Bruto' : 'Neto'}</span></Select.Trigger>
				<Select.Content>
					<Select.Item value="gross" label="Bruto">Bruto</Select.Item>
					<Select.Item value="net" label="Neto">Neto</Select.Item>
				</Select.Content>
			</Select.Root>
			<p class="text-xs leading-5 text-slate-500">Bruto es antes de deducciones; neto es lo que realmente recibes.</p>
		</div>

		<div class="grid gap-2">
			<Label for="income-currency">Moneda</Label>
			<Input id="income-currency" name="currencyCode" required value={createFeedback?.values?.currencyCode ?? 'MXN'} maxlength={3} class="h-11 border-slate-300 uppercase" />
		</div>

		<label class="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
			<input name="hasSchedule" type="checkbox" bind:checked={hasSchedule} class="mt-0.5 size-4 rounded border-slate-300 accent-blue-700" />
			<span>
				<span class="block font-semibold text-slate-900">Tiene horario</span>
				<span class="block text-xs leading-5 text-slate-500">Activa esta opción si quieres guardar el horario de este ingreso.</span>
			</span>
		</label>

		{#if hasSchedule}
			<div class="grid gap-2">
				<span class="text-sm font-medium text-slate-900">Horario</span>
				<WorkScheduleField
					idPrefix="income"
					value={createFeedback?.values?.schedule ?? ''}
					error={fieldError('schedule')}
				/>
			</div>
		{/if}

		{#if createFeedback?.message}<p class="text-sm font-semibold text-red-700">{createFeedback.message}</p>{/if}
	<div class="flex justify-end gap-2">
		<ActionButton type="submit">Guardar ingreso</ActionButton>
	</div>
</form>
