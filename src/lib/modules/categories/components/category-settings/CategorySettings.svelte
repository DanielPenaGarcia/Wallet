<script lang="ts">
	import { untrack } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { Category } from '../../types/category.types';
	import CategoryList from '../category-list/CategoryList.svelte';
	import CreateCategoryForm from '../create-category-form/CreateCategoryForm.svelte';
	import DeleteCategoryForm from '../delete-category-form/DeleteCategoryForm.svelte';
	import EditCategoryForm from '../edit-category-form/EditCategoryForm.svelte';
	import type { CategorySettingsProps } from './props';

	let { categories, categoryTree, feedback = null }: CategorySettingsProps = $props();
	let selectedParent = $state<Category | null>(untrack(() =>
		feedback?.action === 'create-category'
			? (categories.find((category) => category.id === feedback.values?.parentId) ?? null)
			: null
	));
	let editingCategory = $state<Category | null>(untrack(() =>
		feedback?.action === 'update-category'
			? (categories.find((category) => category.id === feedback.values?.id) ?? null)
			: null
	));
	let deletingCategory = $state<Category | null>(untrack(() =>
		feedback?.action === 'delete-category'
			? (categories.find((category) => category.id === feedback.values?.id) ?? null)
			: null
	));
	let createOpen = $state(untrack(() => feedback?.action === 'create-category' && Boolean(feedback.errors || feedback.message)));
	let editOpen = $state(untrack(() => feedback?.action === 'update-category' && editingCategory !== null));
	let deleteOpen = $state(untrack(() => feedback?.action === 'delete-category' && deletingCategory !== null));

	function createRootCategory() {
		selectedParent = null;
		createOpen = true;
	}

	function createChildCategory(category: Category) {
		selectedParent = category;
		createOpen = true;
	}

	function editCategory(category: Category) {
		editingCategory = category;
		editOpen = true;
	}

	function confirmDeleteCategory(category: Category) {
		deletingCategory = category;
		deleteOpen = true;
	}
</script>

{#if feedback?.success}
	<p class="break-words rounded-md border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">{feedback.success}</p>
{/if}

<CategoryList
	categories={categoryTree}
	onCreateRoot={createRootCategory}
	onAddChild={createChildCategory}
	onEdit={editCategory}
	onDelete={confirmDeleteCategory}
/>

<Dialog.Root bind:open={createOpen}>
	<Dialog.Content class="max-h-[min(90vh,640px)] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>{selectedParent ? 'Nueva subcategoría' : 'Nueva categoría'}</Dialog.Title>
			<Dialog.Description>{selectedParent ? `Agrega una categoría dentro de ${selectedParent.name}.` : 'Agrega una categoría al nivel principal.'}</Dialog.Description>
		</Dialog.Header>
		<CreateCategoryForm parent={selectedParent} {feedback} onCancel={() => (createOpen = false)} />
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={editOpen}>
	<Dialog.Content class="max-h-[min(90vh,640px)] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Editar categoría</Dialog.Title>
			<Dialog.Description>Modifica su nombre o color sin alterar su posición en la jerarquía.</Dialog.Description>
		</Dialog.Header>
		{#if editingCategory}<EditCategoryForm category={editingCategory} {feedback} onCancel={() => (editOpen = false)} />{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content class="max-h-[min(90vh,640px)] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Eliminar {deletingCategory?.name ?? 'categoría'}</Dialog.Title>
			<Dialog.Description>Esta acción elimina la categoría del catálogo.</Dialog.Description>
		</Dialog.Header>
		{#if deletingCategory}<DeleteCategoryForm category={deletingCategory} {feedback} onCancel={() => (deleteOpen = false)} />{/if}
	</Dialog.Content>
</Dialog.Root>
