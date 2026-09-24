<script lang="ts">
	import { untrack } from 'svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Badge } from '$lib/components/ui/badge';
	import { ColorInput } from '$lib/components/ui/color-input';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import type { AccountType } from '../../types/account.types';
	import { getAccountDisplayName } from '../../utils/account-labels';
	import type { AccountFormProps } from './props';

	let { mode, account, banks, feedback = null, onCancel }: AccountFormProps = $props();
	let expectedAction = $derived(mode === 'create' ? 'create-account' : 'update-account');
	let matchingFeedback = $derived(
		feedback?.action === expectedAction && (mode === 'create' || feedback.targetId === account?.id)
			? feedback
			: null
	);
	let idPrefix = $derived(mode === 'create' ? 'create-account' : `edit-account-${account?.id ?? ''}`);
	let accountType = $state<Extract<AccountType, 'debit' | 'credit'>>(
		untrack(() => (matchingFeedback?.values?.accountType as Extract<AccountType, 'debit' | 'credit'> | undefined) ?? (account?.type === 'credit' ? 'credit' : 'debit'))
	);
	let bankId = $state(untrack(() => matchingFeedback?.values?.bankId ?? account?.bankId ?? banks[0]?.id ?? ''));
	let isActive = $state(untrack(() => matchingFeedback?.values?.isActive ?? account?.isActive ?? true));
	let selectedBankName = $derived(banks.find((bank) => bank.id === bankId)?.name ?? 'Selecciona un banco');
	let isPersonal = $derived(account?.type === 'personal');
	let isDebit = $derived(!isPersonal && accountType === 'debit');
	let isCredit = $derived(!isPersonal && accountType === 'credit');
	let today = new Date().toISOString().slice(0, 10);
	let accountTypeItems = [
		{ value: 'debit', label: 'Débito' },
		{ value: 'credit', label: 'Crédito' }
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

<form method="POST" action={mode === 'create' ? '?/createAccount' : '?/updateAccount'} class="grid gap-4">
	{#if mode === 'edit' && account}<input type="hidden" name="id" value={account.id} />{/if}
	{#if mode === 'edit' && !isPersonal}<input type="hidden" name="accountType" value={accountType} />{/if}

	{#if mode === 'create'}
		<div class="grid gap-2">
			<Label for={`${idPrefix}-type`}>Tipo</Label>
			<Select.Root type="single" name="accountType" required bind:value={accountType} items={accountTypeItems}>
				<Select.Trigger id={`${idPrefix}-type`} class="h-11 w-full border-outline px-3" aria-invalid={fieldError('accountType') ? 'true' : undefined}>
					<span>{accountType === 'credit' ? 'Crédito' : 'Débito'}</span>
				</Select.Trigger>
				<Select.Content>
					{#each accountTypeItems as item}
						<Select.Item value={item.value} label={item.label}>{item.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			{#if fieldError('accountType')}<span class="text-xs text-destructive">{fieldError('accountType')}</span>{/if}
		</div>
	{/if}

	<div class="grid gap-2">
		<Label for={`${idPrefix}-name`}>Nombre</Label>
		<Input
			id={`${idPrefix}-name`}
			name="name"
			required
			maxlength={100}
			value={matchingFeedback?.values?.name ?? (account ? getAccountDisplayName(account) : '')}
			placeholder={isCredit ? 'Ej. BBVA Azul' : 'Ej. BBVA Nómina'}
			class="h-11 border-outline"
			aria-invalid={fieldError('name') ? 'true' : undefined}
		/>
		{#if fieldError('name')}<span class="text-xs text-destructive">{fieldError('name')}</span>{/if}
	</div>

	{#if !isPersonal}
		<div class="grid gap-2">
			<Label for={`${idPrefix}-bank`}>Banco</Label>
			<Select.Root type="single" name="bankId" required disabled={banks.length === 0} bind:value={bankId} items={banks.map((bank) => ({ value: bank.id, label: bank.name }))}>
				<Select.Trigger id={`${idPrefix}-bank`} class="h-11 w-full border-outline px-3" aria-invalid={fieldError('bankId') ? 'true' : undefined}>
					<span>{selectedBankName}</span>
				</Select.Trigger>
				<Select.Content>
					{#each banks as bank}
						<Select.Item value={bank.id} label={bank.name}>{bank.name}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			{#if fieldError('bankId')}<span class="text-xs text-destructive">{fieldError('bankId')}</span>{/if}
		</div>

		<div class="grid gap-2">
			<Label for={`${idPrefix}-last-digits`}>Últimos cuatro dígitos</Label>
			<Input
				id={`${idPrefix}-last-digits`}
				name="cardLastFourDigits"
				required={isDebit}
				inputmode="numeric"
				minlength={4}
				maxlength={4}
				value={matchingFeedback?.values?.cardLastFourDigits ?? account?.cardLastFourDigits ?? ''}
				placeholder="1234"
				oninput={keepOnlyFourDigits}
				class="h-11 border-outline"
				aria-invalid={fieldError('cardLastFourDigits') ? 'true' : undefined}
			/>
			{#if fieldError('cardLastFourDigits')}<span class="text-xs text-destructive">{fieldError('cardLastFourDigits')}</span>{/if}
		</div>

		<div class="grid gap-2">
			<Label for={`${idPrefix}-card-color`}>Color de tarjeta</Label>
			<ColorInput
				id={`${idPrefix}-card-color`}
				name="cardColor"
				value={matchingFeedback?.values?.cardColor ?? account?.cardColor ?? account?.bank?.color ?? '#123a63'}
				fallback="#123a63"
				error={fieldError('cardColor')}
			/>
		</div>
	{/if}

	{#if isCredit}
		<div class="grid gap-2">
			<Label for={`${idPrefix}-credit-limit`}>Límite de crédito</Label>
			<Input
				id={`${idPrefix}-credit-limit`}
				name="creditLimit"
				required
				type="number"
				min="0.01"
				step="0.01"
				value={matchingFeedback?.values?.creditLimit ?? (account?.creditLimitCents ? (account.creditLimitCents / 100).toFixed(2) : '')}
				placeholder="20000.00"
				class="h-11 border-outline"
				aria-invalid={fieldError('creditLimit') ? 'true' : undefined}
			/>
			{#if fieldError('creditLimit')}<span class="text-xs text-destructive">{fieldError('creditLimit')}</span>{/if}
		</div>
	{/if}

	{#if mode === 'create'}
		<div class="grid gap-2">
			<Label for={`${idPrefix}-initial-balance`}>{isCredit ? 'Saldo consumido' : 'Saldo inicial'}</Label>
			<Input
				id={`${idPrefix}-initial-balance`}
				name="initialBalance"
				required
				type="number"
				min="0"
				step="0.01"
				value={matchingFeedback?.values?.initialBalance ?? (isCredit && account ? (account.balanceCents / 100).toFixed(2) : '0.00')}
				class="h-11 border-outline"
				aria-invalid={fieldError('initialBalance') ? 'true' : undefined}
			/>
			{#if fieldError('initialBalance')}<span class="text-xs text-destructive">{fieldError('initialBalance')}</span>{/if}
		</div>
	{/if}

	{#if !isPersonal}
		<div class="grid gap-2">
			<Label for={`${idPrefix}-balance-as-of-date`}>Saldo conocido al</Label>
			<Input
				id={`${idPrefix}-balance-as-of-date`}
				name="balanceAsOfDate"
				required
				type="date"
				value={matchingFeedback?.values?.balanceAsOfDate ?? account?.balanceAsOfDate ?? today}
				class="h-11 border-outline"
				aria-invalid={fieldError('balanceAsOfDate') ? 'true' : undefined}
			/>
			{#if fieldError('balanceAsOfDate')}<span class="text-xs text-destructive">{fieldError('balanceAsOfDate')}</span>{/if}
		</div>
	{/if}

	{#if isCredit}
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="grid gap-2">
				<Label for={`${idPrefix}-statement-day`}>Día de corte</Label>
				<Input
					id={`${idPrefix}-statement-day`}
					name="statementDay"
					required
					type="number"
					min="1"
					max="31"
					value={matchingFeedback?.values?.statementDay ?? account?.statementDay ?? ''}
					class="h-11 border-outline"
					aria-invalid={fieldError('statementDay') ? 'true' : undefined}
				/>
				{#if fieldError('statementDay')}<span class="text-xs text-destructive">{fieldError('statementDay')}</span>{/if}
			</div>

			<div class="grid gap-2">
				<Label for={`${idPrefix}-payment-due-day`}>Día límite de pago</Label>
				<Input
					id={`${idPrefix}-payment-due-day`}
					name="paymentDueDay"
					required
					type="number"
					min="1"
					max="31"
					value={matchingFeedback?.values?.paymentDueDay ?? account?.paymentDueDay ?? ''}
					class="h-11 border-outline"
					aria-invalid={fieldError('paymentDueDay') ? 'true' : undefined}
				/>
				{#if fieldError('paymentDueDay')}<span class="text-xs text-destructive">{fieldError('paymentDueDay')}</span>{/if}
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
	{/if}

	{#if matchingFeedback?.message}<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{matchingFeedback.message}</p>{/if}

	<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
		{#if onCancel}<ActionButton type="button" intent="secondary" class="w-full sm:w-auto" onclick={onCancel}>Cancelar</ActionButton>{/if}
		<ActionButton type="submit" class="w-full sm:w-auto" disabled={mode === 'create' && banks.length === 0}>{mode === 'create' ? 'Registrar cuenta' : 'Guardar cambios'}</ActionButton>
	</div>
</form>
