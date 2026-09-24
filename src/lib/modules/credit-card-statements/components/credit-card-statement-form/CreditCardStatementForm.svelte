<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { CreditCardStatementFormProps } from './props';

	let { mode, accountId, statement, defaultValues, feedback = null, onCancel }: CreditCardStatementFormProps = $props();
	let expectedAction = $derived(mode === 'create' ? 'create-credit-card-statement' : 'update-credit-card-statement');
	let matchingFeedback = $derived(
		feedback?.action === expectedAction && (mode === 'create' || feedback.targetId === statement?.id)
			? feedback
			: null
	);
	let values = $derived(matchingFeedback?.values);

	function fieldError(field: string) {
		return matchingFeedback?.errors?.[field]?.[0];
	}

	function amountValue(cents?: number) {
		return typeof cents === 'number' ? (cents / 100).toFixed(2) : '';
	}
</script>

<form method="POST" action={mode === 'create' ? '?/createCreditCardStatement' : '?/updateCreditCardStatement'} class="grid gap-4">
	<input type="hidden" name="accountId" value={accountId} />
	{#if mode === 'edit' && statement}<input type="hidden" name="id" value={statement.id} />{/if}

	<div class="grid gap-4 sm:grid-cols-2">
		<div class="grid gap-2">
			<Label for="statement-period-start">Inicio del periodo</Label>
			<Input
				id="statement-period-start"
				name="periodStartDate"
				required
				type="date"
				value={values?.periodStartDate ?? statement?.periodStartDate ?? defaultValues.periodStartDate}
				class="h-11 border-outline"
				aria-invalid={fieldError('periodStartDate') ? 'true' : undefined}
			/>
			{#if fieldError('periodStartDate')}<span class="text-xs text-destructive">{fieldError('periodStartDate')}</span>{/if}
		</div>

		<div class="grid gap-2">
			<Label for="statement-period-end">Fin del periodo</Label>
			<Input
				id="statement-period-end"
				name="periodEndDate"
				required
				type="date"
				value={values?.periodEndDate ?? statement?.periodEndDate ?? defaultValues.periodEndDate}
				class="h-11 border-outline"
				aria-invalid={fieldError('periodEndDate') ? 'true' : undefined}
			/>
			{#if fieldError('periodEndDate')}<span class="text-xs text-destructive">{fieldError('periodEndDate')}</span>{/if}
		</div>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<div class="grid gap-2">
			<Label for="statement-date">Fecha de corte</Label>
			<Input
				id="statement-date"
				name="statementDate"
				required
				type="date"
				value={values?.statementDate ?? statement?.statementDate ?? defaultValues.statementDate}
				class="h-11 border-outline"
				aria-invalid={fieldError('statementDate') ? 'true' : undefined}
			/>
			{#if fieldError('statementDate')}<span class="text-xs text-destructive">{fieldError('statementDate')}</span>{/if}
		</div>

		<div class="grid gap-2">
			<Label for="statement-payment-due">Fecha límite</Label>
			<Input
				id="statement-payment-due"
				name="paymentDueDate"
				required
				type="date"
				value={values?.paymentDueDate ?? statement?.paymentDueDate ?? defaultValues.paymentDueDate}
				class="h-11 border-outline"
				aria-invalid={fieldError('paymentDueDate') ? 'true' : undefined}
			/>
			{#if fieldError('paymentDueDate')}<span class="text-xs text-destructive">{fieldError('paymentDueDate')}</span>{/if}
		</div>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<div class="grid gap-2">
			<Label for="statement-balance">Saldo al corte</Label>
			<Input
				id="statement-balance"
				name="statementBalance"
				required
				type="number"
				min="0"
				step="0.01"
				value={values?.statementBalance ?? amountValue(statement?.statementBalanceCents)}
				placeholder="0.00"
				class="h-11 border-outline"
				aria-invalid={fieldError('statementBalance') ? 'true' : undefined}
			/>
			{#if fieldError('statementBalance')}<span class="text-xs text-destructive">{fieldError('statementBalance')}</span>{/if}
		</div>

		<div class="grid gap-2">
			<Label for="statement-paid">Pagado hasta ahora</Label>
			<Input
				id="statement-paid"
				name="paidAmount"
				required
				type="number"
				min="0"
				step="0.01"
				value={values?.paidAmount ?? (amountValue(statement?.paidAmountCents) || '0.00')}
				placeholder="0.00"
				class="h-11 border-outline"
				aria-invalid={fieldError('paidAmount') ? 'true' : undefined}
			/>
			{#if fieldError('paidAmount')}<span class="text-xs text-destructive">{fieldError('paidAmount')}</span>{/if}
		</div>
	</div>

	{#if matchingFeedback?.message}
		<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{matchingFeedback.message}</p>
	{/if}

	<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
		{#if onCancel}<ActionButton type="button" intent="secondary" class="w-full sm:w-auto" onclick={onCancel}>Cancelar</ActionButton>{/if}
		<ActionButton type="submit" class="w-full sm:w-auto">{mode === 'create' ? 'Guardar corte' : 'Guardar cambios'}</ActionButton>
	</div>
</form>
