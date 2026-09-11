<script lang="ts">
	import PlusIcon from '@lucide/svelte/icons/plus';
	import CategoryTreeItem from '../category-tree-item/CategoryTreeItem.svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import type { CategoryListProps } from './props';

	let { categories, onCreateRoot, onAddChild, onEdit, onDelete }: CategoryListProps = $props();
</script>

<section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
	<div class="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
		<div>
			<h2 class="text-lg font-bold text-slate-900">Categorías existentes</h2>
			<p class="mt-1 text-sm text-slate-500">Usa el botón de cada categoría para agregarle un hijo.</p>
		</div>
		<ActionButton type="button" intent="icon-primary" onclick={onCreateRoot} aria-label="Crear categoría principal" title="Agregar categoría principal"><PlusIcon /></ActionButton>
	</div>
	{#if categories.length === 0}
		<div class="px-6 py-12 text-center">
			<p class="font-bold text-slate-700">Aún no hay categorías</p>
			<p class="mt-1 text-sm text-slate-500">Crea la primera para comenzar a clasificar movimientos.</p>
		</div>
	{:else}
		<ul>
			{#each categories as category (category.id)}
				<CategoryTreeItem {category} {onAddChild} {onEdit} {onDelete} />
			{/each}
		</ul>
	{/if}
</section>
