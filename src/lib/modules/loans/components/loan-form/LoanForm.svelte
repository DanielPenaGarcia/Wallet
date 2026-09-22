<script lang="ts">
	import { untrack } from 'svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import CardSelectField from '$lib/modules/cards/components/card-select-field/CardSelectField.svelte';
	import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
	import { buildLoanInstallmentSchedule, getLoanFinancingCost } from '../../utils/loan-calculations';
	import type { LoanDirection } from '../../types/loan.types';
	import type { LoanFormProps } from './props';

	let { cards, feedback = null, onCancel }: LoanFormProps = $props();
	let matchingFeedback = $derived(feedback?.action === 'create-loan' ? feedback : null);
	let direction = $state<LoanDirection>(untrack(() => matchingFeedback?.values?.direction ?? 'borrowed'));
	let accountId = $state(untrack(() => matchingFeedback?.values?.accountId ?? ''));
	let principalAmount = $state(untrack(() => matchingFeedback?.values?.principalAmount ?? ''));
	let totalRepayment = $state(untrack(() => matchingFeedback?.values?.totalRepayment ?? ''));
	let installmentCount = $state(untrack(() => matchingFeedback?.values?.installmentCount ?? ''));
	let firstPaymentDate = $state(untrack(() => matchingFeedback?.values?.firstPaymentDate ?? ''));
	let currencyCode = $state(untrack(() => matchingFeedback?.values?.currencyCode ?? 'MXN'));
	let preview = $derived.by(() => {
		const principalAmountCents = amountCents(principalAmount);
		const totalRepaymentCents = amountCents(totalRepayment);
		const count = Number(installmentCount);
		if (
			!Number.isInteger(principalAmountCents) ||
			!Number.isInteger(totalRepaymentCents) ||
			!Number.isInteger(count) ||
			count < 1 ||
			!/^\d{4}-\d{2}-\d{2}$/.test(firstPaymentDate)
		) return null;

		const schedule = buildLoanInstallmentSchedule({
			totalRepaymentCents,
			installmentCount: count,
			firstPaymentDate
		});

		return {
			financingCostCents: getLoanFinancingCost({ principalAmountCents, totalRepaymentCents }),
			firstInstallmentCents: schedule[0]?.amountCents ?? 0,
			lastInstallmentCents: schedule[schedule.length - 1]?.amountCents ?? 0,
			totalRepaymentCents
		};
	});

	function fieldError(field: string) {
		return matchingFeedback?.errors?.[field]?.[0];
	}

	function amountCents(value: string) {
		const amount = Number(value);
		return Number.isFinite(amount) ? Math.round(amount * 100) : Number.NaN;
	}

	function money(amount: number) {
		return formatCurrencyFromMinorUnits(amount, currencyCode || 'MXN');
	}
</script>

<form method="POST" action="?/createLoan" class="grid gap-4 sm:grid-cols-2">
	<div class="grid gap-2">
		<Label for="loan-direction">Tipo</Label>
		<Select.Root
			type="single"
			name="direction"
			bind:value={direction}
			items={[
				{ value: 'borrowed', label: 'Por pagar' },
				{ value: 'lent', label: 'Por cobrar' }
			]}
		>
			<Select.Trigger id="loan-direction" class="h-11 w-full border-outline px-3">
				<span>{direction === 'borrowed' ? 'Por pagar' : 'Por cobrar'}</span>
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="borrowed" label="Por pagar">Por pagar</Select.Item>
				<Select.Item value="lent" label="Por cobrar">Por cobrar</Select.Item>
			</Select.Content>
		</Select.Root>
		{#if fieldError('direction')}<span class="text-xs text-destructive">{fieldError('direction')}</span>{/if}
	</div>
	<div class="grid gap-2">
		<Label for="loan-name">Nombre</Label>
		<Input id="loan-name" name="name" required maxlength={100} value={matchingFeedback?.values?.name ?? ''} class="h-11 border-outline" />
		{#if fieldError('name')}<span class="text-xs text-destructive">{fieldError('name')}</span>{/if}
	</div>
	<div class="grid gap-2">
		<Label for="loan-counterparty">Contraparte</Label>
		<Input id="loan-counterparty" name="counterpartyName" required maxlength={100} value={matchingFeedback?.values?.counterpartyName ?? ''} class="h-11 border-outline" />
		{#if fieldError('counterpartyName')}<span class="text-xs text-destructive">{fieldError('counterpartyName')}</span>{/if}
	</div>
	<div class="grid gap-2">
		<Label for="loan-currency">Moneda</Label>
		<Input id="loan-currency" name="currencyCode" required maxlength={3} bind:value={currencyCode} class="h-11 border-outline uppercase" />
		{#if fieldError('currencyCode')}<span class="text-xs text-destructive">{fieldError('currencyCode')}</span>{/if}
	</div>
	<div class="grid gap-2">
		<Label for="loan-principal">Principal</Label>
		<Input id="loan-principal" name="principalAmount" required type="number" min="0.01" step="0.01" bind:value={principalAmount} class="h-11 border-outline" />
		{#if fieldError('principalAmount')}<span class="text-xs text-destructive">{fieldError('principalAmount')}</span>{/if}
	</div>
	<div class="grid gap-2">
		<Label for="loan-total">Total contractual</Label>
		<Input id="loan-total" name="totalRepayment" required type="number" min="0.01" step="0.01" bind:value={totalRepayment} class="h-11 border-outline" />
		{#if fieldError('totalRepayment')}<span class="text-xs text-destructive">{fieldError('totalRepayment')}</span>{/if}
	</div>
	<div class="grid gap-2">
		<Label for="loan-installments">Cuotas</Label>
		<Input id="loan-installments" name="installmentCount" required type="number" min="1" step="1" bind:value={installmentCount} class="h-11 border-outline" />
		{#if fieldError('installmentCount')}<span class="text-xs text-destructive">{fieldError('installmentCount')}</span>{/if}
	</div>
	<div class="grid gap-2">
		<Label for="loan-first-payment">Primer pago/cobro</Label>
		<Input id="loan-first-payment" name="firstPaymentDate" required type="date" bind:value={firstPaymentDate} class="h-11 border-outline" />
		{#if fieldError('firstPaymentDate')}<span class="text-xs text-destructive">{fieldError('firstPaymentDate')}</span>{/if}
	</div>
	<div class="grid gap-2">
		<Label for="loan-occurred-at">Fecha de apertura</Label>
		<Input id="loan-occurred-at" name="occurredAt" required type="datetime-local" value={matchingFeedback?.values?.occurredAt ?? ''} class="h-11 border-outline" />
		{#if fieldError('occurredAt')}<span class="text-xs text-destructive">{fieldError('occurredAt')}</span>{/if}
	</div>
	<CardSelectField
		id="loan-account"
		name="accountId"
		label={direction === 'borrowed' ? 'Cuenta que recibió el dinero' : 'Cuenta que entregó el dinero'}
		{cards}
		bind:value={accountId}
		error={fieldError('accountId')}
	/>
	{#if preview}
		<div class="rounded-md border border-outline bg-surface-subtle p-3 text-sm sm:col-span-2">
			<p class="font-bold text-on-surface">Preview</p>
			<div class="mt-2 grid gap-2 sm:grid-cols-3">
				<p class="text-on-surface-muted">Costo financiero <span class="font-bold text-on-surface">{money(preview.financingCostCents)}</span></p>
				<p class="text-on-surface-muted">Total contractual <span class="font-bold text-on-surface">{money(preview.totalRepaymentCents)}</span></p>
				<p class="text-on-surface-muted">Cuota <span class="font-bold text-on-surface">{money(preview.firstInstallmentCents)}{preview.firstInstallmentCents !== preview.lastInstallmentCents ? ` / ${money(preview.lastInstallmentCents)}` : ''}</span></p>
			</div>
		</div>
	{/if}
	{#if matchingFeedback?.message}<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive sm:col-span-2">{matchingFeedback.message}</p>{/if}
	<div class="flex justify-end gap-2 sm:col-span-2">
		{#if onCancel}<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>{/if}
		<ActionButton type="submit" disabled={cards.length === 0}>Guardar préstamo</ActionButton>
	</div>
</form>
