<script lang="ts">
	import { untrack } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { Account } from '../../types/account.types';
	import AccountForm from '../account-form/AccountForm.svelte';
	import AccountList from '../account-list/AccountList.svelte';
	import AdjustAccountBalanceForm from '../adjust-account-balance-form/AdjustAccountBalanceForm.svelte';
	import DeleteAccountForm from '../delete-account-form/DeleteAccountForm.svelte';
	import type { AccountSectionProps } from './props';

	let { accounts, banks, feedback = null }: AccountSectionProps = $props();
	let createOpen = $state(untrack(() => feedback?.action === 'create-account' && Boolean(feedback.errors || feedback.message)));
	let editingAccount = $state<Account | null>(untrack(() =>
		feedback?.action === 'update-account'
			? (accounts.find((account) => account.id === feedback.targetId) ?? null)
			: null
	));
	let adjustingAccount = $state<Account | null>(untrack(() =>
		feedback?.action === 'adjust-account-balance'
			? (accounts.find((account) => account.id === feedback.targetId) ?? null)
			: null
	));
	let deletingAccount = $state<Account | null>(untrack(() =>
		feedback?.action === 'delete-account'
			? (accounts.find((account) => account.id === feedback.targetId) ?? null)
			: null
	));
	let editOpen = $state(untrack(() => feedback?.action === 'update-account' && editingAccount !== null));
	let adjustOpen = $state(untrack(() => feedback?.action === 'adjust-account-balance' && adjustingAccount !== null));
	let deleteOpen = $state(untrack(() => feedback?.action === 'delete-account' && deletingAccount !== null));
</script>

{#if feedback?.success}
	<p class="mb-5 rounded-md border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">{feedback.success}</p>
{/if}
{#if feedback?.message && feedback.action === 'toggle-credit-account-active'}
	<p class="mb-5 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">{feedback.message}</p>
{/if}

<AccountList
	{accounts}
	onCreate={() => (createOpen = true)}
	onEdit={(account) => {
		editingAccount = account;
		editOpen = true;
	}}
	onAdjustBalance={(account) => {
		adjustingAccount = account;
		adjustOpen = true;
	}}
	onDelete={(account) => {
		deletingAccount = account;
		deleteOpen = true;
	}}
/>

<Dialog.Root bind:open={createOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Nueva cuenta</Dialog.Title>
			<Dialog.Description>Registra una cuenta de débito o una tarjeta de crédito asociada a un banco.</Dialog.Description>
		</Dialog.Header>
		<AccountForm mode="create" {banks} {feedback} onCancel={() => (createOpen = false)} />
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={editOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Editar cuenta</Dialog.Title>
			<Dialog.Description>Actualiza la configuración básica de la cuenta.</Dialog.Description>
		</Dialog.Header>
		{#if editingAccount}<AccountForm mode="edit" account={editingAccount} {banks} {feedback} onCancel={() => (editOpen = false)} />{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={adjustOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Ajustar saldo</Dialog.Title>
			<Dialog.Description>Corrige el saldo registrado sin editar la cuenta.</Dialog.Description>
		</Dialog.Header>
		{#if adjustingAccount}<AdjustAccountBalanceForm account={adjustingAccount} {feedback} onCancel={() => (adjustOpen = false)} />{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Eliminar cuenta</Dialog.Title>
			<Dialog.Description>Esta acción elimina la cuenta seleccionada.</Dialog.Description>
		</Dialog.Header>
		{#if deletingAccount}<DeleteAccountForm account={deletingAccount} {feedback} onCancel={() => (deleteOpen = false)} />{/if}
	</Dialog.Content>
</Dialog.Root>
