<script lang="ts">
	import { untrack } from 'svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { ColorInput } from '$lib/components/ui/color-input';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import type { CardKind } from '../../types/card.types';
	import type { CardFormProps } from './props';

	let { mode, banks, card, feedback = null, onCancel }: CardFormProps = $props();
	let expectedAction = $derived(mode === 'create' ? 'create-card' : 'update-card');
	let matchingFeedback = $derived(
		feedback?.action === expectedAction && (mode === 'create' || feedback.targetId === card?.id)
			? feedback
			: null
	);
	let idPrefix = $derived(mode === 'create' ? 'create-card' : `edit-card-${card?.id ?? ''}`);
	let isDefaultAccount = $derived(Boolean(card?.isDefault));
	let kind = $state<CardKind>(
		untrack(() => matchingFeedback?.values?.kind ?? card?.kind ?? 'credit')
	);
	let bankId = $state(untrack(() => matchingFeedback?.values?.bankId ?? card?.bankId ?? ''));
	let selectedBankName = $derived(banks.find((bank) => bank.id === bankId)?.name ?? 'Selecciona un banco');

	const cardTypes = [
		{ value: 'credit', label: 'Crédito' },
		{ value: 'debit', label: 'Débito' }
	];

	function fieldError(field: string) {
		return matchingFeedback?.errors?.[field]?.[0];
	}

	function keepOnlyFourDigits(event: Event) {
		const input = event.currentTarget;
		if (!(input instanceof HTMLInputElement)) return;
		input.value = input.value.replace(/\D/g, '').slice(0, 4);
	}
</script>

<form method="POST" action={mode === 'create' ? '?/createCard' : '?/updateCard'} class="grid gap-4 sm:grid-cols-2">
	{#if mode === 'edit' && card}<input type="hidden" name="id" value={card.id} />{/if}

	<div class="grid gap-2">
		<Label for={`${idPrefix}-kind`}>Tipo de cuenta</Label>
		{#if mode === 'create'}
			<Select.Root type="single" name="kind" required bind:value={kind} items={cardTypes}>
				<Select.Trigger id={`${idPrefix}-kind`} class="h-11 w-full border-slate-300 px-3"><span>{kind === 'credit' ? 'Crédito' : 'Débito'}</span></Select.Trigger>
				<Select.Content>
					{#each cardTypes as cardType}<Select.Item value={cardType.value} label={cardType.label}>{cardType.label}</Select.Item>{/each}
				</Select.Content>
			</Select.Root>
		{:else}
			<input type="hidden" name="kind" value={kind} />
			<Input id={`${idPrefix}-kind`} value={kind === 'credit' ? 'Crédito' : 'Débito'} disabled class="h-11 border-slate-300" />
		{/if}
	</div>

	<div class="grid gap-2">
		<Label for={`${idPrefix}-alias`}>Alias</Label>
		<Input id={`${idPrefix}-alias`} name="alias" required maxlength={60} value={matchingFeedback?.values?.alias ?? card?.alias ?? ''} placeholder="Ej. Compras del hogar" class="h-11 border-slate-300" aria-invalid={fieldError('alias') ? 'true' : undefined} />
		{#if fieldError('alias')}<span class="text-xs text-red-700">{fieldError('alias')}</span>{/if}
	</div>

	<div class="grid gap-2">
		<Label for={`${idPrefix}-bank`}>Banco</Label>
		<Select.Root type="single" name="bankId" required disabled={banks.length === 0} bind:value={bankId} items={banks.map((bank) => ({ value: bank.id, label: bank.name }))}>
			<Select.Trigger id={`${idPrefix}-bank`} class="h-11 w-full border-slate-300 px-3" aria-invalid={fieldError('bankId') ? 'true' : undefined}><span class="truncate">{selectedBankName}</span></Select.Trigger>
			<Select.Content>
				{#each banks as bank}<Select.Item value={bank.id} label={bank.name}>{bank.name}</Select.Item>{/each}
			</Select.Content>
		</Select.Root>
		{#if fieldError('bankId')}<span class="text-xs text-red-700">{fieldError('bankId')}</span>{/if}
	</div>

	<div class="grid gap-2">
		<Label for={`${idPrefix}-color`}>Color</Label>
		<ColorInput id={`${idPrefix}-color`} name="color" value={matchingFeedback?.values?.color ?? card?.color ?? '#2563eb'} fallback="#2563eb" error={fieldError('color')} />
	</div>

	<div class="grid gap-2">
		<Label for={`${idPrefix}-last-digits`}>Últimos cuatro dígitos</Label>
		<Input id={`${idPrefix}-last-digits`} name="lastFourDigits" required inputmode="numeric" minlength={4} maxlength={4} value={matchingFeedback?.values?.lastFourDigits ?? card?.lastFourDigits ?? ''} placeholder="1234" oninput={keepOnlyFourDigits} class="h-11 border-slate-300" aria-invalid={fieldError('lastFourDigits') ? 'true' : undefined} />
		{#if fieldError('lastFourDigits')}<span class="text-xs text-red-700">{fieldError('lastFourDigits')}</span>{/if}
	</div>

	<div class="grid gap-2">
		<Label for={`${idPrefix}-currency`}>Moneda</Label>
		<Input id={`${idPrefix}-currency`} name="currencyCode" required maxlength={3} value={matchingFeedback?.values?.currencyCode ?? card?.currencyCode ?? 'MXN'} class="h-11 border-slate-300 uppercase" aria-invalid={fieldError('currencyCode') ? 'true' : undefined} />
		{#if fieldError('currencyCode')}<span class="text-xs text-red-700">{fieldError('currencyCode')}</span>{/if}
	</div>

	<div class="grid gap-2">
		<Label for={`${idPrefix}-initial-balance`}>Saldo inicial</Label>
		<Input id={`${idPrefix}-initial-balance`} name="initialBalance" required type="number" min="0" step="0.01" value={matchingFeedback?.values?.initialBalance ?? (card ? (card.initialBalance / 100).toFixed(2) : '0.00')} class="h-11 border-slate-300" aria-invalid={fieldError('initialBalance') ? 'true' : undefined} />
		{#if fieldError('initialBalance')}<span class="text-xs text-red-700">{fieldError('initialBalance')}</span>{/if}
	</div>

	{#if kind === 'credit'}
		<div class="grid gap-2">
			<Label for={`${idPrefix}-credit-limit`}>Crédito máximo ofrecido</Label>
			<Input id={`${idPrefix}-credit-limit`} name="maximumOfferedCredit" required type="number" min="0" step="0.01" value={matchingFeedback?.values?.maximumOfferedCredit ?? (card ? ((card.maximumOfferedCredit ?? 0) / 100).toFixed(2) : '')} placeholder="0.00" class="h-11 border-slate-300" aria-invalid={fieldError('maximumOfferedCredit') ? 'true' : undefined} />
			{#if fieldError('maximumOfferedCredit')}<span class="text-xs text-red-700">{fieldError('maximumOfferedCredit')}</span>{/if}
		</div>
		<div class="grid gap-2">
			<Label for={`${idPrefix}-statement-day`}>Día de corte</Label>
			<Input id={`${idPrefix}-statement-day`} name="statementDay" required type="number" min="1" max="31" value={matchingFeedback?.values?.statementDay ?? card?.statementDay ?? ''} class="h-11 border-slate-300" aria-invalid={fieldError('statementDay') ? 'true' : undefined} />
			{#if fieldError('statementDay')}<span class="text-xs text-red-700">{fieldError('statementDay')}</span>{/if}
		</div>
		<div class="grid gap-2">
			<Label for={`${idPrefix}-payment-day`}>Día límite de pago</Label>
			<Input id={`${idPrefix}-payment-day`} name="paymentDueDay" required type="number" min="1" max="31" value={matchingFeedback?.values?.paymentDueDay ?? card?.paymentDueDay ?? ''} class="h-11 border-slate-300" aria-invalid={fieldError('paymentDueDay') ? 'true' : undefined} />
			{#if fieldError('paymentDueDay')}<span class="text-xs text-red-700">{fieldError('paymentDueDay')}</span>{/if}
		</div>
	{:else}
		<div class="grid gap-2">
			<Label for={`${idPrefix}-account`}>Referencia</Label>
			<Input id={`${idPrefix}-account`} name="accountId" required maxlength={80} value={matchingFeedback?.values?.accountId ?? card?.accountId ?? ''} placeholder="Ej. Cuenta principal" class="h-11 border-slate-300" aria-invalid={fieldError('accountId') ? 'true' : undefined} />
			{#if fieldError('accountId')}<span class="text-xs text-red-700">{fieldError('accountId')}</span>{/if}
		</div>
	{/if}

	<div class="sm:col-span-2">
		{#if matchingFeedback?.message}<p class="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{matchingFeedback.message}</p>{/if}
		{#if mode === 'create' && matchingFeedback?.success}<p class="mb-3 text-sm font-semibold text-emerald-700">{matchingFeedback.success}</p>{/if}
		<div class="flex justify-end gap-2">
			{#if onCancel}<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>{/if}
			<ActionButton type="submit" disabled={banks.length === 0 || isDefaultAccount}>{mode === 'create' ? 'Guardar cuenta' : 'Guardar cambios'}</ActionButton>
		</div>
	</div>
</form>
