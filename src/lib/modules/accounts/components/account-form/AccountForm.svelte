<script lang="ts">
	import { untrack } from 'svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
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
	let bankId = $state(untrack(() => matchingFeedback?.values?.bankId ?? account?.bankId ?? banks[0]?.id ?? ''));
	let selectedBankName = $derived(banks.find((bank) => bank.id === bankId)?.name ?? 'Selecciona un banco');
	let isPersonal = $derived(account?.type === 'personal');

	function fieldError(field: string) {
		return matchingFeedback?.errors?.[field]?.[0];
	}
</script>

<form method="POST" action={mode === 'create' ? '?/createAccount' : '?/updateAccount'} class="grid gap-4">
	{#if mode === 'edit' && account}<input type="hidden" name="id" value={account.id} />{/if}

	<div class="grid gap-2">
		<Label for={`${idPrefix}-name`}>Nombre</Label>
		<Input
			id={`${idPrefix}-name`}
			name="name"
			required
			maxlength={100}
			value={matchingFeedback?.values?.name ?? (account ? getAccountDisplayName(account) : '')}
			placeholder="Ej. BBVA Nómina"
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
	{/if}

	{#if mode === 'create'}
		<div class="grid gap-2">
			<Label for={`${idPrefix}-initial-balance`}>Saldo inicial</Label>
			<Input
				id={`${idPrefix}-initial-balance`}
				name="initialBalance"
				required
				type="number"
				min="0"
				step="0.01"
				value={matchingFeedback?.values?.initialBalance ?? '0.00'}
				class="h-11 border-outline"
				aria-invalid={fieldError('initialBalance') ? 'true' : undefined}
			/>
			{#if fieldError('initialBalance')}<span class="text-xs text-destructive">{fieldError('initialBalance')}</span>{/if}
		</div>
	{/if}

	{#if matchingFeedback?.message}<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{matchingFeedback.message}</p>{/if}

	<div class="flex justify-end gap-2">
		{#if onCancel}<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>{/if}
		<ActionButton type="submit" disabled={mode === 'create' && banks.length === 0}>{mode === 'create' ? 'Registrar cuenta' : 'Guardar cambios'}</ActionButton>
	</div>
</form>
