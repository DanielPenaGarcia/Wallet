<script lang="ts">
	import { untrack } from 'svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { InfoPopover } from '$lib/components/ui/info-popover';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import CardSelectField from '$lib/modules/cards/components/card-select-field/CardSelectField.svelte';
	import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
	import { buildLoanInstallmentSchedule, getLoanFinancingCost } from '../../utils/loan-calculations';
	import type { LoanDirection } from '../../types/loan.types';
	import type { LoanFormProps } from './props';

	let { cards, feedback = null, mode = 'create', loan, onCancel }: LoanFormProps = $props();
	let matchingFeedback = $derived(
		feedback?.action === (mode === 'create' ? 'create-loan' : 'update-loan') &&
		(mode === 'create' || feedback.targetId === loan?.id)
			? feedback
			: null
	);
	let idPrefix = $derived(mode === 'create' ? 'loan' : `edit-loan-${loan?.id ?? ''}`);
	let direction = $state<LoanDirection>(untrack(() => matchingFeedback?.values?.direction ?? loan?.direction ?? 'borrowed'));
	let accountId = $state(untrack(() => matchingFeedback?.values?.accountId ?? ''));
	let principalAmount = $state(untrack(() => matchingFeedback?.values?.principalAmount ?? (loan ? (loan.principalAmountCents / 100).toFixed(2) : '')));
	let totalRepayment = $state(untrack(() => matchingFeedback?.values?.totalRepayment ?? (loan ? (loan.totalRepaymentCents / 100).toFixed(2) : '')));
	let installmentCount = $state(untrack(() => matchingFeedback?.values?.installmentCount ?? loan?.installmentCount.toString() ?? ''));
	let firstPaymentDate = $state(untrack(() => matchingFeedback?.values?.firstPaymentDate ?? loan?.firstPaymentDate ?? ''));
	let currencyCode = $state(untrack(() => matchingFeedback?.values?.currencyCode ?? loan?.currencyCode ?? 'MXN'));
	let hasSettlements = $derived(mode === 'edit' && (loan?.paidAmountCents ?? 0) > 0);
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

<form method="POST" action={mode === 'create' ? '?/createLoan' : '?/updateLoan'} class="grid gap-4 sm:grid-cols-2">
	{#if mode === 'edit' && loan}<input type="hidden" name="id" value={loan.id} />{/if}
	<div class="grid gap-2">
		<Label for={`${idPrefix}-direction`}>Tipo</Label>
		{#if mode === 'create'}
			<Select.Root
				type="single"
				name="direction"
				bind:value={direction}
				items={[
					{ value: 'borrowed', label: 'Por pagar' },
					{ value: 'lent', label: 'Por cobrar' }
				]}
			>
				<Select.Trigger id={`${idPrefix}-direction`} class="h-11 w-full border-outline px-3">
					<span>{direction === 'borrowed' ? 'Por pagar' : 'Por cobrar'}</span>
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="borrowed" label="Por pagar">Por pagar</Select.Item>
					<Select.Item value="lent" label="Por cobrar">Por cobrar</Select.Item>
				</Select.Content>
			</Select.Root>
		{:else}
			<Input id={`${idPrefix}-direction`} value={direction === 'borrowed' ? 'Por pagar' : 'Por cobrar'} disabled class="h-11 border-outline" />
		{/if}
		{#if fieldError('direction')}<span class="text-xs text-destructive">{fieldError('direction')}</span>{/if}
	</div>
	<div class="grid gap-2">
		<Label for={`${idPrefix}-name`}>Nombre</Label>
		<Input id={`${idPrefix}-name`} name="name" required maxlength={100} value={matchingFeedback?.values?.name ?? loan?.name ?? ''} class="h-11 border-outline" />
		{#if fieldError('name')}<span class="text-xs text-destructive">{fieldError('name')}</span>{/if}
	</div>
	<div class="grid gap-2">
		<Label for={`${idPrefix}-counterparty`}>Contraparte</Label>
		<Input id={`${idPrefix}-counterparty`} name="counterpartyName" required maxlength={100} value={matchingFeedback?.values?.counterpartyName ?? loan?.counterpartyName ?? ''} class="h-11 border-outline" />
		{#if fieldError('counterpartyName')}<span class="text-xs text-destructive">{fieldError('counterpartyName')}</span>{/if}
	</div>
	<div class="grid gap-2">
		<div class="flex items-center gap-1.5">
			<Label for={`${idPrefix}-currency`}>Moneda</Label>
			<InfoPopover title="Moneda" description="La moneda queda fija al crear el préstamo para no mezclar pagos o cobros de distintas monedas." />
		</div>
		{#if mode === 'edit'}
			<input type="hidden" name="currencyCode" value={currencyCode} />
			<Input id={`${idPrefix}-currency`} value={currencyCode} disabled class="h-11 border-outline uppercase" />
		{:else}
			<Input id={`${idPrefix}-currency`} name="currencyCode" required maxlength={3} bind:value={currencyCode} class="h-11 border-outline uppercase" />
		{/if}
		{#if fieldError('currencyCode')}<span class="text-xs text-destructive">{fieldError('currencyCode')}</span>{/if}
	</div>
	<div class="grid gap-2">
		<div class="flex items-center gap-1.5">
			<Label for={`${idPrefix}-principal`}>Principal</Label>
			<InfoPopover title="Principal" description="Es el dinero que realmente recibiste o entregaste al abrir el préstamo. Cambiarlo ajusta el movimiento de apertura." />
		</div>
		{#if hasSettlements}<input type="hidden" name="principalAmount" value={principalAmount} />{/if}
		<Input id={`${idPrefix}-principal`} name={hasSettlements ? undefined : 'principalAmount'} required type="number" min="0.01" step="0.01" bind:value={principalAmount} disabled={hasSettlements} class="h-11 border-outline" />
		{#if fieldError('principalAmount')}<span class="text-xs text-destructive">{fieldError('principalAmount')}</span>{/if}
	</div>
	<div class="grid gap-2">
		<div class="flex items-center gap-1.5">
			<Label for={`${idPrefix}-total`}>Total contractual</Label>
			<InfoPopover title="Total contractual" description="Es el total acordado a pagar o cobrar. Debe ser al menos igual al principal y no se reestructura después de pagos/cobros." />
		</div>
		{#if hasSettlements}<input type="hidden" name="totalRepayment" value={totalRepayment} />{/if}
		<Input id={`${idPrefix}-total`} name={hasSettlements ? undefined : 'totalRepayment'} required type="number" min="0.01" step="0.01" bind:value={totalRepayment} disabled={hasSettlements} class="h-11 border-outline" />
		{#if fieldError('totalRepayment')}<span class="text-xs text-destructive">{fieldError('totalRepayment')}</span>{/if}
	</div>
	<div class="grid gap-2">
		<div class="flex items-center gap-1.5">
			<Label for={`${idPrefix}-installments`}>Cuotas</Label>
			<InfoPopover title="Número de cuotas" description="Define cómo se reparte el total contractual en pagos o cobros mensuales. Se bloquea cuando ya hay historial." />
		</div>
		{#if hasSettlements}<input type="hidden" name="installmentCount" value={installmentCount} />{/if}
		<Input id={`${idPrefix}-installments`} name={hasSettlements ? undefined : 'installmentCount'} required type="number" min="1" step="1" bind:value={installmentCount} disabled={hasSettlements} class="h-11 border-outline" />
		{#if fieldError('installmentCount')}<span class="text-xs text-destructive">{fieldError('installmentCount')}</span>{/if}
	</div>
	<div class="grid gap-2">
		<div class="flex items-center gap-1.5">
			<Label for={`${idPrefix}-first-payment`}>Primer pago/cobro</Label>
			<InfoPopover title="Primer pago/cobro" description="Es la fecha desde la que se genera el calendario mensual. Cambiarla después de pagos/cobros reinterpretaría el historial." />
		</div>
		{#if hasSettlements}<input type="hidden" name="firstPaymentDate" value={firstPaymentDate} />{/if}
		<Input id={`${idPrefix}-first-payment`} name={hasSettlements ? undefined : 'firstPaymentDate'} required type="date" bind:value={firstPaymentDate} disabled={hasSettlements} class="h-11 border-outline" />
		{#if fieldError('firstPaymentDate')}<span class="text-xs text-destructive">{fieldError('firstPaymentDate')}</span>{/if}
	</div>
	{#if mode === 'create'}
		<div class="grid gap-2">
			<Label for={`${idPrefix}-occurred-at`}>Fecha de apertura</Label>
			<Input id={`${idPrefix}-occurred-at`} name="occurredAt" required type="datetime-local" value={matchingFeedback?.values?.occurredAt ?? ''} class="h-11 border-outline" />
			{#if fieldError('occurredAt')}<span class="text-xs text-destructive">{fieldError('occurredAt')}</span>{/if}
		</div>
		<CardSelectField
			id={`${idPrefix}-account`}
			name="accountId"
			label={direction === 'borrowed' ? 'Cuenta que recibió el dinero' : 'Cuenta que entregó el dinero'}
			{cards}
			bind:value={accountId}
			error={fieldError('accountId')}
		/>
	{/if}
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
	{#if hasSettlements}
		<p class="rounded-md bg-surface-subtle px-3 py-2 text-sm text-on-surface-muted sm:col-span-2">Ya existen pagos o cobros: solo puedes editar nombre y contraparte.</p>
	{/if}
	<div class="flex justify-end gap-2 sm:col-span-2">
		{#if onCancel}<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>{/if}
		<ActionButton type="submit" disabled={mode === 'create' && cards.length === 0}>{mode === 'create' ? 'Guardar préstamo' : 'Guardar cambios'}</ActionButton>
	</div>
</form>
