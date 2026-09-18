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
	const essentialFilterStorageKey = 'wallet:category-settings:essential-only';

	let { categories, onCreateRoot, onAddChild, onEdit, onDelete }: CategoryListProps = $props();
	let search = $state('');
	let essentialOnly = $state(false);
	let restoredSearch = $state(false);
	let expandedIds = $state<string[]>([]);
	let normalizedSearch = $derived(search.trim().toLocaleLowerCase('es-MX'));
	let searching = $derived(normalizedSearch.length > 0 || essentialOnly);
	let visibleCategories = $derived.by(() => filterCategories(categories, normalizedSearch, essentialOnly));

	$effect(() => {
		if (!browser || !restoredSearch) return;
		if (search.trim()) sessionStorage.setItem(searchStorageKey, search);
		else sessionStorage.removeItem(searchStorageKey);
		if (essentialOnly) sessionStorage.setItem(essentialFilterStorageKey, 'true');
		else sessionStorage.removeItem(essentialFilterStorageKey);
	});

	onMount(() => {
		search = sessionStorage.getItem(searchStorageKey) ?? '';
		essentialOnly = sessionStorage.getItem(essentialFilterStorageKey) === 'true';
		restoredSearch = true;
	});

	function categoryMatches(category: CategoryNode, query: string, onlyEssential: boolean) {
		const matchesName = query.length === 0 || category.name.toLocaleLowerCase('es-MX').includes(query);
		const matchesEssential = !onlyEssential || category.isEssential;
		return matchesName && matchesEssential;
	}

	function filterCategories(items: CategoryNode[], query: string, onlyEssential: boolean): CategoryNode[] {
		if (!query && !onlyEssential) return items;

		return items.flatMap((category) => {
			const filteredChildren = filterCategories(category.children, query, onlyEssential);
			if (categoryMatches(category, query, onlyEssential)) {
				return [{ ...category, children: onlyEssential ? filteredChildren : category.children }];
			}
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

<div class="grid gap-4">
	<section class="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
		<div class="flex flex-col gap-4 lg:flex-row lg:items-end">
			<div class="grid gap-2 sm:w-80">
				<Label for="category-search">Buscar</Label>
				<div class="relative">
					<SearchIcon class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
					<Input id="category-search" bind:value={search} placeholder="Nombre de categoría" class="h-11 border-slate-300 bg-white pl-9" />
				</div>
			</div>
			<label class="flex h-11 items-center gap-2 text-sm font-semibold text-slate-700">
				<input
					type="checkbox"
					bind:checked={essentialOnly}
					class="size-4 rounded border-slate-300 accent-blue-700"
				/>
				<span>Es esencial</span>
			</label>
		</div>
	</section>

	<section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
		<div class="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h2 class="text-lg font-bold text-slate-900">Categorías existentes</h2>
				<p class="mt-1 text-sm text-slate-500">Usa el botón de cada categoría para agregarle un hijo.</p>
			</div>
			<ActionButton type="button" size="icon-sm" onclick={onCreateRoot} aria-label="Crear categoría principal" title="Agregar categoría principal"><PlusIcon /></ActionButton>
		</div>
		{#if categories.length === 0}
			<div class="px-6 py-12 text-center">
				<p class="font-bold text-slate-700">Aún no hay categorías</p>
				<p class="mt-1 text-sm text-slate-500">Crea la primera para comenzar a clasificar movimientos.</p>
			</div>
		{:else if visibleCategories.length === 0}
			<div class="px-6 py-12 text-center">
				<p class="font-bold text-slate-700">Sin resultados</p>
				<p class="mt-1 text-sm text-slate-500">Prueba con otro nombre de categoría o ajusta los filtros.</p>
			</div>
		{:else}
			<ul>
				{#each visibleCategories as category (category.id)}
					<CategoryTreeItem {category} {expandedIds} {searching} onToggleExpanded={toggleExpanded} {onAddChild} {onEdit} {onDelete} />
				{/each}
			</ul>
		{/if}
	</section>
</div>
