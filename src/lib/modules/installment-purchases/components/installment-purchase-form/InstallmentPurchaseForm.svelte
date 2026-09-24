<script lang="ts">
	import { untrack } from 'svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
	import {
		getInstallmentAmounts,
		getInstallmentCounts
	} from '../../utils/installment-purchase-calculations';
	import type { InstallmentPurchaseFormProps } from './props';

	let { mode, accountId, purchase, feedback = null, onCancel }: InstallmentPurchaseFormProps = $props();
	let expectedAction = $derived(
		mode === 'create' ? 'create-installment-purchase' : 'update-installment-purchase'
	);
	let matchingFeedback = $derived(
		feedback?.action === expectedAction && (mode === 'create' || feedback.targetId === purchase?.id)
			? feedback
			: null
	);
	let idPrefix = $derived(
		mode === 'create' ? 'create-installment-purchase' : `edit-installment-purchase-${purchase?.id ?? ''}`
	);
	let description = $state(untrack(() => matchingFeedback?.values?.description ?? purchase?.description ?? ''));
	let purchaseDate = $state(untrack(() => matchingFeedback?.values?.purchaseDate ?? purchase?.purchaseDate ?? ''));
	let originalAmount = $state(untrack(() => matchingFeedback?.values?.originalAmount ?? amountValue(purchase?.originalAmountCents)));
	let installmentAmount = $state(untrack(() => matchingFeedback?.values?.installmentAmount ?? amountValue(purchase?.installmentAmountCents)));
	let totalInstallments = $state(untrack(() => matchingFeedback?.values?.totalInstallments ?? String(purchase?.totalInstallments ?? 3)));
	let billedInstallments = $state(untrack(() => matchingFeedback?.values?.billedInstallments ?? String(purchase?.billedInstallments ?? 0)));
	let paidInstallments = $state(untrack(() => matchingFeedback?.values?.paidInstallments ?? String(purchase?.paidInstallments ?? 0)));
	let previewPurchase = $derived({
		originalAmountCents: toCents(originalAmount),
		installmentAmountCents: toCents(installmentAmount),
		totalInstallments: toInteger(totalInstallments),
		billedInstallments: toInteger(billedInstallments),
		paidInstallments: toInteger(paidInstallments)
	});
	let previewValid = $derived(
		previewPurchase.originalAmountCents > 0 &&
			previewPurchase.installmentAmountCents > 0 &&
			previewPurchase.totalInstallments > 0 &&
			previewPurchase.billedInstallments >= previewPurchase.paidInstallments &&
			previewPurchase.totalInstallments >= previewPurchase.billedInstallments
	);
	let previewAmounts = $derived(getInstallmentAmounts(previewPurchase));
	let previewCounts = $derived(getInstallmentCounts(previewPurchase));

	function fieldError(field: string) {
		return matchingFeedback?.errors?.[field]?.[0];
	}

	function amountValue(cents?: number) {
		return typeof cents === 'number' ? (cents / 100).toFixed(2) : '';
	}

	function toCents(value: string) {
		const amount = Number(value);
		return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
	}

	function toInteger(value: string) {
		const parsed = Number(value);
		return Number.isInteger(parsed) ? parsed : 0;
	}
</script>

<form method="POST" action={mode === 'create' ? '?/createInstallmentPurchase' : '?/updateInstallmentPurchase'} class="grid gap-4">
	<input type="hidden" name="accountId" value={accountId} />
	{#if mode === 'edit' && purchase}<input type="hidden" name="id" value={purchase.id} />{/if}

	<div class="grid gap-2">
		<Label for={`${idPrefix}-description`}>Descripción</Label>
		<Input
			id={`${idPrefix}-description`}
			name="description"
			required
			maxlength={160}
			bind:value={description}
			placeholder="Ej. Laptop"
			class="h-11 border-outline"
			aria-invalid={fieldError('description') ? 'true' : undefined}
		/>
		{#if fieldError('description')}<span class="text-xs text-destructive">{fieldError('description')}</span>{/if}
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<div class="grid gap-2">
			<Label for={`${idPrefix}-purchase-date`}>Fecha de compra</Label>
			<Input
				id={`${idPrefix}-purchase-date`}
				name="purchaseDate"
				required
				type="date"
				bind:value={purchaseDate}
				class="h-11 border-outline"
				aria-invalid={fieldError('purchaseDate') ? 'true' : undefined}
			/>
			{#if fieldError('purchaseDate')}<span class="text-xs text-destructive">{fieldError('purchaseDate')}</span>{/if}
		</div>

		<div class="grid gap-2">
			<Label for={`${idPrefix}-original-amount`}>Monto original</Label>
			<Input
				id={`${idPrefix}-original-amount`}
				name="originalAmount"
				required
				type="number"
				min="0.01"
				step="0.01"
				bind:value={originalAmount}
				placeholder="0.00"
				class="h-11 border-outline"
				aria-invalid={fieldError('originalAmount') ? 'true' : undefined}
			/>
			{#if fieldError('originalAmount')}<span class="text-xs text-destructive">{fieldError('originalAmount')}</span>{/if}
		</div>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<div class="grid gap-2">
			<Label for={`${idPrefix}-installment-amount`}>Mensualidad regular</Label>
			<Input
				id={`${idPrefix}-installment-amount`}
				name="installmentAmount"
				required
				type="number"
				min="0.01"
				step="0.01"
				bind:value={installmentAmount}
				placeholder="0.00"
				class="h-11 border-outline"
				aria-invalid={fieldError('installmentAmount') ? 'true' : undefined}
			/>
			{#if fieldError('installmentAmount')}<span class="text-xs text-destructive">{fieldError('installmentAmount')}</span>{/if}
		</div>

		<div class="grid gap-2">
			<Label for={`${idPrefix}-total-installments`}>Total de mensualidades</Label>
			<Input
				id={`${idPrefix}-total-installments`}
				name="totalInstallments"
				required
				type="number"
				min="1"
				step="1"
				bind:value={totalInstallments}
				class="h-11 border-outline"
				aria-invalid={fieldError('totalInstallments') ? 'true' : undefined}
			/>
			{#if fieldError('totalInstallments')}<span class="text-xs text-destructive">{fieldError('totalInstallments')}</span>{/if}
		</div>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<div class="grid gap-2">
			<Label for={`${idPrefix}-billed-installments`}>Mensualidades cortadas</Label>
			<Input
				id={`${idPrefix}-billed-installments`}
				name="billedInstallments"
				required
				type="number"
				min="0"
				step="1"
				bind:value={billedInstallments}
				class="h-11 border-outline"
				aria-invalid={fieldError('billedInstallments') ? 'true' : undefined}
			/>
			{#if fieldError('billedInstallments')}<span class="text-xs text-destructive">{fieldError('billedInstallments')}</span>{/if}
		</div>

		<div class="grid gap-2">
			<Label for={`${idPrefix}-paid-installments`}>Mensualidades pagadas</Label>
			<Input
				id={`${idPrefix}-paid-installments`}
				name="paidInstallments"
				required
				type="number"
				min="0"
				step="1"
				bind:value={paidInstallments}
				class="h-11 border-outline"
				aria-invalid={fieldError('paidInstallments') ? 'true' : undefined}
			/>
			{#if fieldError('paidInstallments')}<span class="text-xs text-destructive">{fieldError('paidInstallments')}</span>{/if}
		</div>
	</div>

	<div class="rounded-lg border border-outline bg-surface-subtle p-3">
		<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Previsualización</p>
		{#if previewValid}
			<div class="mt-3 grid gap-3 sm:grid-cols-3">
				<div>
					<p class="text-xs font-semibold text-on-surface-muted">Pendiente</p>
					<p class="mt-1 break-words text-sm font-bold text-on-surface">{formatCurrencyFromMinorUnits(previewAmounts.outstandingAmountCents, 'MXN')}</p>
				</div>
				<div>
					<p class="text-xs font-semibold text-on-surface-muted">Cortado sin pagar</p>
					<p class="mt-1 break-words text-sm font-bold text-on-surface">{formatCurrencyFromMinorUnits(previewAmounts.unpaidBilledAmountCents, 'MXN')}</p>
				</div>
				<div>
					<p class="text-xs font-semibold text-on-surface-muted">Siguiente mensualidad</p>
					<p class="mt-1 break-words text-sm font-bold text-on-surface">{formatCurrencyFromMinorUnits(previewAmounts.nextInstallmentAmountCents, 'MXN')}</p>
				</div>
			</div>
			<p class="mt-3 text-xs text-on-surface-muted">
				Quedan {previewCounts.remainingInstallments} de {previewPurchase.totalInstallments} mensualidades.
			</p>
		{:else}
			<p class="mt-2 text-sm text-on-surface-muted">Captura los datos de la compra para estimar el saldo pendiente.</p>
		{/if}
	</div>

	{#if matchingFeedback?.message}<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{matchingFeedback.message}</p>{/if}

	<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
		{#if onCancel}<ActionButton type="button" intent="secondary" class="w-full sm:w-auto" onclick={onCancel}>Cancelar</ActionButton>{/if}
		<ActionButton type="submit" class="w-full sm:w-auto">{mode === 'create' ? 'Registrar compra' : 'Guardar cambios'}</ActionButton>
	</div>
</form>
