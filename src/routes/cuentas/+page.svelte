<script lang="ts">
	import { untrack } from 'svelte';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { ActionButton } from '$lib/components/ui/action-button';
	import * as Dialog from '$lib/components/ui/dialog';
	import CardList from '$lib/modules/cards/components/card-list/CardList.svelte';
	import CardDetails from '$lib/modules/cards/components/card-details/CardDetails.svelte';
	import CreateCardForm from '$lib/modules/cards/components/create-card-form/CreateCardForm.svelte';
	import DeleteCardForm from '$lib/modules/cards/components/delete-card-form/DeleteCardForm.svelte';
	import EditCardForm from '$lib/modules/cards/components/edit-card-form/EditCardForm.svelte';
	import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';

	let { data, form } = $props();
	let createOpen = $state(untrack(() => form?.action === 'create-card' && Boolean(form.errors || form.message)));
	let viewingCard = $state<CardListItem | null>(
		untrack(() =>
			form?.action === 'pay-credit-installment' || form?.action === 'unpay-credit-installment'
				? data.cards.find((card) => card.id === form.targetId) ?? null
				: null
		)
	);
	let editingCard = $state<CardListItem | null>(
		untrack(() => form?.action === 'update-card' ? data.cards.find((card) => card.id === form.targetId) ?? null : null)
	);
	let deletingCard = $state<CardListItem | null>(
		untrack(() => form?.action === 'delete-card' ? data.cards.find((card) => card.id === form.targetId) ?? null : null)
	);
</script>

<svelte:head><title>Cuentas | Mi Cartera</title></svelte:head>

<div class="space-y-6">
	<div class="flex justify-end">
		<ActionButton type="button" onclick={() => (createOpen = true)}><PlusIcon />Nueva cuenta</ActionButton>
	</div>

	<CardList cards={data.cards} onViewDetails={(card) => (viewingCard = card)} onEdit={(card) => (editingCard = card)} onDelete={(card) => (deletingCard = card)} />

	<Dialog.Root bind:open={createOpen}>
		<Dialog.Content class="sm:max-w-2xl">
			<Dialog.Header>
				<Dialog.Title>Nueva cuenta</Dialog.Title>
				<Dialog.Description>Agrega los datos iniciales para comenzar a administrarla.</Dialog.Description>
			</Dialog.Header>
			{#if data.banks.length === 0}
				<p class="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Primero registra un banco desde Configuración para crear cuentas bancarias.</p>
			{/if}
			<CreateCardForm banks={data.banks} feedback={form} />
		</Dialog.Content>
	</Dialog.Root>

	<Dialog.Root open={viewingCard !== null} onOpenChange={(open) => { if (!open) viewingCard = null; }}>
		<Dialog.Content class="sm:max-w-3xl">
			<Dialog.Header>
				<Dialog.Title>Detalles de {viewingCard?.alias ?? 'cuenta'}</Dialog.Title>
				<Dialog.Description>Consulta saldos, reglas de pago y compras a meses sin intereses.</Dialog.Description>
			</Dialog.Header>
			{#if viewingCard}<CardDetails card={viewingCard} feedback={form} />{/if}
		</Dialog.Content>
	</Dialog.Root>

	<Dialog.Root open={editingCard !== null} onOpenChange={(open) => { if (!open) editingCard = null; }}>
		<Dialog.Content class="sm:max-w-2xl">
			<Dialog.Header>
				<Dialog.Title>Editar cuenta</Dialog.Title>
				<Dialog.Description>Actualiza los datos de identificación, saldo inicial y reglas de pago.</Dialog.Description>
			</Dialog.Header>
			{#if editingCard}<EditCardForm card={editingCard} banks={data.banks} feedback={form} onCancel={() => (editingCard = null)} />{/if}
		</Dialog.Content>
	</Dialog.Root>

	<Dialog.Root open={deletingCard !== null} onOpenChange={(open) => { if (!open) deletingCard = null; }}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Eliminar {deletingCard?.alias ?? 'cuenta'}</Dialog.Title>
				<Dialog.Description>Confirma que deseas retirar esta cuenta de la lista activa.</Dialog.Description>
			</Dialog.Header>
			{#if deletingCard}<DeleteCardForm card={deletingCard} feedback={form} onCancel={() => (deletingCard = null)} />{/if}
		</Dialog.Content>
	</Dialog.Root>
</div>
