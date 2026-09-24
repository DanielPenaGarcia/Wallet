<script lang="ts">
	import { untrack } from 'svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import CardSelectField from '$lib/modules/cards/components/card-select-field/CardSelectField.svelte';
	import type { LoanSettlementFormProps } from './props';

	let { loan, cards, feedback = null }: LoanSettlementFormProps = $props();
	let actionName = $derived(loan.direction === 'borrowed' ? 'registerPayment' : 'registerCollection');
	let feedbackAction = $derived(loan.direction === 'borrowed' ? 'register-payment' : 'register-collection');
	let matchingFeedback = $derived(feedback?.action === feedbackAction ? feedback : null);
	let accountId = $state(untrack(() => matchingFeedback?.values?.accountId ?? ''));

	function fieldError(field: string) {
		return matchingFeedback?.errors?.[field]?.[0];
	}
</script>

<form method="POST" action={`?/${actionName}`} class="grid gap-4 sm:grid-cols-2">
	<input type="hidden" name="id" value={loan.id} />
	<CardSelectField
		id="loan-settlement-account"
		name="accountId"
		label={loan.direction === 'borrowed' ? 'Cuenta origen' : 'Cuenta destino'}
		{cards}
		bind:value={accountId}
		error={fieldError('accountId')}
	/>
	<div class="grid gap-2">
		<Label for="loan-settlement-amount">Monto</Label>
		<Input id="loan-settlement-amount" name="amount" required type="number" min="0.01" step="0.01" value={matchingFeedback?.values?.amount ?? ''} class="h-11 border-outline" />
		{#if fieldError('amount')}<span class="text-xs text-destructive">{fieldError('amount')}</span>{/if}
	</div>
	<div class="grid gap-2">
		<Label for="loan-settlement-occurred-at">Fecha efectiva</Label>
		<Input id="loan-settlement-occurred-at" name="occurredAt" required type="datetime-local" value={matchingFeedback?.values?.occurredAt ?? ''} class="h-11 border-outline" />
		{#if fieldError('occurredAt')}<span class="text-xs text-destructive">{fieldError('occurredAt')}</span>{/if}
	</div>
	<div class="grid gap-2 sm:col-span-2">
		<Label for="loan-settlement-description">Nota</Label>
		<Input id="loan-settlement-description" name="description" maxlength={500} value={matchingFeedback?.values?.description ?? ''} class="h-11 border-outline" />
	</div>
	{#if matchingFeedback?.message}<p class="break-words rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive sm:col-span-2">{matchingFeedback.message}</p>{/if}
	<div class="grid sm:col-span-2 sm:flex sm:justify-end">
		<ActionButton type="submit" class="w-full sm:w-auto" disabled={cards.length === 0 || loan.outstandingAmountCents === 0}>
			{loan.direction === 'borrowed' ? 'Registrar pago' : 'Registrar cobro'}
		</ActionButton>
	</div>
</form>
