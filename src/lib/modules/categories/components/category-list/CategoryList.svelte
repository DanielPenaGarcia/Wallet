<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import SearchIcon from '@lucide/svelte/icons/search';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import CategoryTreeItem from '../category-tree-item/CategoryTreeItem.svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { CategoryNode } from '../../types/category.types';
	import type { CategoryListProps } from './props';

	const searchStorageKey = 'wallet:category-settings:search';

	let { categories, onCreateRoot, onAddChild, onEdit, onDelete }: CategoryListProps = $props();
	let search = $state('');
	let restoredSearch = $state(false);
	let expandedIds = $state<string[]>([]);
	let normalizedSearch = $derived(search.trim().toLocaleLowerCase('es-MX'));
	let searching = $derived(normalizedSearch.length > 0);
	let visibleCategories = $derived.by(() => filterCategories(categories, normalizedSearch));

	$effect(() => {
		if (!browser || !restoredSearch) return;
		if (search.trim()) sessionStorage.setItem(searchStorageKey, search);
		else sessionStorage.removeItem(searchStorageKey);
	});

	onMount(() => {
		search = sessionStorage.getItem(searchStorageKey) ?? '';
		restoredSearch = true;
	});

	function categoryMatches(category: CategoryNode, query: string) {
		return category.name.toLocaleLowerCase('es-MX').includes(query);
	}

	function filterCategories(items: CategoryNode[], query: string): CategoryNode[] {
		if (!query) return items;

		return items.flatMap((category) => {
			const filteredChildren = filterCategories(category.children, query);
			if (categoryMatches(category, query)) return [{ ...category }];
			if (filteredChildren.length > 0) return [{ ...category, children: filteredChildren }];
			return [];
		});
	}

	function toggleExpanded(categoryId: string) {
		expandedIds = expandedIds.includes(categoryId)
			? expandedIds.filter((id) => id !== categoryId)
			: [...expandedIds, categoryId];
	}
</script>

<section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
	<div class="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
		<div>
			<h2 class="text-lg font-bold text-slate-900">Categorías existentes</h2>
			<p class="mt-1 text-sm text-slate-500">Usa el botón de cada categoría para agregarle un hijo.</p>
		</div>
		<div class="flex flex-col gap-3 sm:flex-row sm:items-end">
			<div class="grid gap-2 sm:w-72">
				<Label for="category-search">Buscar</Label>
				<div class="relative">
					<SearchIcon class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
					<Input id="category-search" bind:value={search} placeholder="Nombre de categoría" class="h-11 border-slate-300 bg-white pl-9" />
				</div>
			</div>
			<ActionButton type="button" intent="icon-primary" onclick={onCreateRoot} aria-label="Crear categoría principal" title="Agregar categoría principal"><PlusIcon /></ActionButton>
		</div>
	</div>
	{#if categories.length === 0}
		<div class="px-6 py-12 text-center">
			<p class="font-bold text-slate-700">Aún no hay categorías</p>
			<p class="mt-1 text-sm text-slate-500">Crea la primera para comenzar a clasificar movimientos.</p>
		</div>
	{:else if visibleCategories.length === 0}
		<div class="px-6 py-12 text-center">
			<p class="font-bold text-slate-700">Sin resultados</p>
			<p class="mt-1 text-sm text-slate-500">Prueba con otro nombre de categoría.</p>
		</div>
	{:else}
		<ul>
			{#each visibleCategories as category (category.id)}
				<CategoryTreeItem {category} {expandedIds} {searching} onToggleExpanded={toggleExpanded} {onAddChild} {onEdit} {onDelete} />
			{/each}
		</ul>
	{/if}
</section>
