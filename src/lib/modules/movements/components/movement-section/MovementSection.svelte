<script lang="ts">
	import { untrack } from 'svelte';
	import { browser } from '$app/environment';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { Movement, MovementType } from '../../types/movement.types';
	import BulkMovementForm from '../bulk-movement-form/BulkMovementForm.svelte';
	import DeleteMovementForm from '../delete-movement-form/DeleteMovementForm.svelte';
	import ExportMovementsForm from '../export-movements-form/ExportMovementsForm.svelte';
	import ExpenseMovementForm from '../expense-movement-form/ExpenseMovementForm.svelte';
	import IncomeMovementForm from '../income-movement-form/IncomeMovementForm.svelte';
	import MovementList from '../movement-list/MovementList.svelte';
	import MovementTypePicker from '../movement-type-picker/MovementTypePicker.svelte';
	import TransferMovementForm from '../transfer-movement-form/TransferMovementForm.svelte';
	import type { MovementSectionProps } from './props';

	let { movements, cards, expenses, categories, period, feedback = null }: MovementSectionProps = $props();
	let createOpen = $state(
		untrack(() => feedback?.action === 'create-movement' && Boolean(feedback.errors || feedback.message))
	);
	let bulkOpen = $state(
		untrack(() => feedback?.action === 'bulk-create-movements' && Boolean(feedback.message))
	);
	let exportOpen = $state(false);
	let selectedType = $state<MovementType | null>(
		untrack(() => (feedback?.action === 'create-movement' ? (feedback.values?.type ?? null) : null))
	);
	let editingMovement = $state<Movement | null>(
		untrack(() =>
			feedback?.action === 'update-movement'
				? (movements.find((movement) => movement.id === feedback.targetId) ?? null)
				: null
		)
	);
	let deletingMovement = $state<Movement | null>(
		untrack(() =>
			feedback?.action === 'delete-movement'
				? (movements.find((movement) => movement.id === feedback.targetId) ?? null)
				: null
		)
	);

	$effect(() => {
		if (!browser || feedback?.action !== 'bulk-create-movements' || !feedback.success) return;
		localStorage.removeItem('wallet:bulk-movements:v1');
		bulkOpen = false;
	});

	function openCreate() {
		selectedType = null;
		createOpen = true;
	}

	function openBulkCreate() {
		bulkOpen = true;
	}

	function openExport() {
		exportOpen = true;
	}

	function createDialogChanged(open: boolean) {
		createOpen = open;
		if (!open) selectedType = null;
	}
</script>

{#if feedback?.success}<p class="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{feedback.success}</p>{/if}

<MovementList {movements} {period} onCreate={openCreate} onBulkCreate={openBulkCreate} onExport={openExport} onEdit={(movement) => (editingMovement = movement)} onDelete={(movement) => (deletingMovement = movement)} />

<Dialog.Root open={createOpen} onOpenChange={createDialogChanged}>
	<Dialog.Content class="sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>{selectedType ? `Nuevo ${selectedType === 'expense' ? 'gasto' : selectedType === 'income' ? 'ingreso' : 'transferencia'}` : 'Nuevo movimiento'}</Dialog.Title>
			<Dialog.Description>{selectedType ? 'Completa los datos del movimiento.' : 'Selecciona el tipo de movimiento que deseas registrar.'}</Dialog.Description>
		</Dialog.Header>
		{#if selectedType === null}
			<MovementTypePicker onSelect={(type) => (selectedType = type)} />
		{:else if selectedType === 'expense'}
			<ExpenseMovementForm mode="create" {cards} {expenses} {categories} {feedback} onBack={() => (selectedType = null)} />
		{:else if selectedType === 'income'}
			<IncomeMovementForm mode="create" {cards} {feedback} onBack={() => (selectedType = null)} />
		{:else}
			<TransferMovementForm mode="create" {cards} {feedback} onBack={() => (selectedType = null)} />
		{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={bulkOpen}>
	<Dialog.Content class="sm:max-w-3xl">
		<Dialog.Header>
			<Dialog.Title>Registro masivo</Dialog.Title>
			<Dialog.Description>Captura varios movimientos del mismo tipo y regístralos juntos.</Dialog.Description>
		</Dialog.Header>
		<BulkMovementForm {cards} {expenses} {categories} {feedback} />
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={exportOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Exportar movimientos</Dialog.Title>
			<Dialog.Description>Elige un periodo para copiar los movimientos como JSON.</Dialog.Description>
		</Dialog.Header>
		<ExportMovementsForm {movements} />
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={editingMovement !== null} onOpenChange={(open) => { if (!open) editingMovement = null; }}>
	<Dialog.Content class="sm:max-w-2xl">
		<Dialog.Header><Dialog.Title>Editar movimiento</Dialog.Title><Dialog.Description>Actualiza los datos del {editingMovement?.type === 'expense' ? 'gasto' : editingMovement?.type === 'income' ? 'ingreso' : 'transferencia'}.</Dialog.Description></Dialog.Header>
		{#if editingMovement?.type === 'expense'}
			<ExpenseMovementForm mode="edit" movement={editingMovement} {cards} {expenses} {categories} {feedback} onCancel={() => (editingMovement = null)} />
		{:else if editingMovement?.type === 'income'}
			<IncomeMovementForm mode="edit" movement={editingMovement} {cards} {feedback} onCancel={() => (editingMovement = null)} />
		{:else if editingMovement?.type === 'transfer'}
			<TransferMovementForm mode="edit" movement={editingMovement} {cards} {feedback} onCancel={() => (editingMovement = null)} />
		{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={deletingMovement !== null} onOpenChange={(open) => { if (!open) deletingMovement = null; }}>
	<Dialog.Content>
		<Dialog.Header><Dialog.Title>Eliminar {deletingMovement?.title ?? 'movimiento'}</Dialog.Title><Dialog.Description>Confirma que deseas retirarlo de la lista.</Dialog.Description></Dialog.Header>
		{#if deletingMovement}<DeleteMovementForm movement={deletingMovement} {feedback} onCancel={() => (deletingMovement = null)} />{/if}
	</Dialog.Content>
</Dialog.Root>
