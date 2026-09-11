<script lang="ts">
	import { untrack } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { Bank } from '../../types/bank.types';
	import BankForm from '../bank-form/BankForm.svelte';
	import BankList from '../bank-list/BankList.svelte';
	import DeleteBankForm from '../delete-bank-form/DeleteBankForm.svelte';
	import type { BankSettingsProps } from './props';

	let { banks, feedback = null }: BankSettingsProps = $props();
	let createOpen = $state(
		untrack(() => feedback?.action === 'create-bank' && Boolean(feedback.errors || feedback.message))
	);
	let editingBank = $state<Bank | null>(
		untrack(() =>
			feedback?.action === 'update-bank'
				? (banks.find((bank) => bank.id === feedback.targetId) ?? null)
				: null
		)
	);
	let deletingBank = $state<Bank | null>(
		untrack(() =>
			feedback?.action === 'delete-bank'
				? (banks.find((bank) => bank.id === feedback.targetId) ?? null)
				: null
		)
	);
	let editOpen = $state(untrack(() => feedback?.action === 'update-bank' && editingBank !== null));
	let deleteOpen = $state(untrack(() => feedback?.action === 'delete-bank' && deletingBank !== null));
</script>

{#if feedback?.success}<p class="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{feedback.success}</p>{/if}

<BankList {banks} onCreate={() => (createOpen = true)} onEdit={(bank) => { editingBank = bank; editOpen = true; }} onDelete={(bank) => { deletingBank = bank; deleteOpen = true; }} />

<Dialog.Root bind:open={createOpen}>
	<Dialog.Content>
		<Dialog.Header><Dialog.Title>Nuevo banco</Dialog.Title><Dialog.Description>Agrega un banco al catálogo disponible para tarjetas.</Dialog.Description></Dialog.Header>
		<BankForm mode="create" {feedback} onCancel={() => (createOpen = false)} />
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={editOpen}>
	<Dialog.Content>
		<Dialog.Header><Dialog.Title>Editar banco</Dialog.Title><Dialog.Description>Actualiza su nombre, país o zona horaria.</Dialog.Description></Dialog.Header>
		{#if editingBank}<BankForm mode="edit" bank={editingBank} {feedback} onCancel={() => (editOpen = false)} />{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content>
		<Dialog.Header><Dialog.Title>Eliminar {deletingBank?.name ?? 'banco'}</Dialog.Title><Dialog.Description>Esta acción es lógica y conserva el registro.</Dialog.Description></Dialog.Header>
		{#if deletingBank}<DeleteBankForm bank={deletingBank} {feedback} onCancel={() => (deleteOpen = false)} />{/if}
	</Dialog.Content>
</Dialog.Root>
