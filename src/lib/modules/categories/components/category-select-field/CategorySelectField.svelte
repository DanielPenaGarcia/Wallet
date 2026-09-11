<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { onMount } from 'svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { Category } from '$lib/modules/categories/types/category.types';
	import { getCategoryPath } from '$lib/modules/expenses/utils/category-path';
	import { cn } from '$lib/utils.js';

	type CategorySelectOption = {
		value: string;
		label: string;
	};

	type Props = {
		id: string;
		name: string;
		categories: Category[];
		value?: string;
		label?: string;
		error?: string;
		placeholder?: string;
		required?: boolean;
		allowAll?: boolean;
		allValue?: string;
		allLabel?: string;
		class?: string;
	};

	let {
		id,
		name,
		categories,
		value = $bindable(''),
		label,
		error,
		placeholder = 'Selecciona una categoría',
		required = false,
		allowAll = false,
		allValue = 'all',
		allLabel = 'Todas las categorías',
		class: className
	}: Props = $props();

	let isOpen = $state(false);
	let search = $state('');
	let container = $state<HTMLDivElement | null>(null);
	let listboxId = $derived(`${id}-listbox`);
	let searchId = $derived(`${id}-search`);
	let options = $derived.by<CategorySelectOption[]>(() => [
		...(allowAll ? [{ value: allValue, label: allLabel }] : []),
		...categories.map((category) => ({
			value: category.id,
			label: getCategoryPath(category, categories)
		}))
	]);
	let normalizedSearch = $derived(search.trim().toLocaleLowerCase('es-MX'));
	let filteredOptions = $derived(
		options.filter((option) =>
			normalizedSearch.length === 0
				? true
				: option.label.toLocaleLowerCase('es-MX').includes(normalizedSearch)
		)
	);
	let selectedLabel = $derived(
		options.find((option) => option.value === value)?.label ?? placeholder
	);

	onMount(() => {
		function handlePointerDown(event: PointerEvent) {
			if (!container?.contains(event.target as Node)) isOpen = false;
		}

		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'Escape') isOpen = false;
		}

		document.addEventListener('pointerdown', handlePointerDown);
		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown);
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	function selectOption(option: CategorySelectOption) {
		value = option.value;
		isOpen = false;
		search = '';
	}

	function handleSearchKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') event.preventDefault();
	}
</script>

<div class={cn('relative grid gap-2', className)} bind:this={container}>
	{#if label}<Label for={id}>{label}</Label>{/if}
	<input type="hidden" {name} {value} />
	<button
		type="button"
		{id}
		class={cn(
			'flex h-11 w-full items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-3 text-left text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
			error && 'border-red-600 focus-visible:border-red-600 focus-visible:ring-red-100'
		)}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
		aria-controls={listboxId}
		onclick={() => (isOpen = !isOpen)}
	>
		<span class="min-w-0 truncate">{selectedLabel}</span>
		<ChevronDownIcon class="size-4 shrink-0 text-slate-500" />
	</button>

	{#if isOpen}
		<div class="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
			<div class="border-b border-slate-100 p-2">
				<div class="relative">
					<SearchIcon class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
					<Input
						id={searchId}
						bind:value={search}
						placeholder="Buscar categoría"
						class="h-10 border-slate-300 bg-white pl-9"
						autocomplete="off"
						onkeydown={handleSearchKeydown}
					/>
				</div>
			</div>
			<div id={listboxId} role="listbox" class="overflow-y-auto p-1" style="max-height: min(20rem, calc(100vh - 8rem));">
				{#if filteredOptions.length === 0}
					<p class="px-3 py-2 text-sm text-slate-500">Sin resultados</p>
				{:else}
					{#each filteredOptions as option (option.value)}
						<button
							type="button"
							role="option"
							aria-selected={option.value === value}
							class={cn(
								'flex min-h-10 w-full items-center justify-between gap-2 rounded px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 focus:bg-slate-100 focus:outline-none',
								option.value === value && 'bg-blue-50 font-semibold text-blue-800'
							)}
							onclick={() => selectOption(option)}
						>
							<span class="min-w-0 truncate">{option.label}</span>
							{#if option.value === value}<CheckIcon class="size-4 shrink-0" />{/if}
						</button>
					{/each}
				{/if}
			</div>
		</div>
	{/if}

	{#if error}<span class="text-xs text-red-700">{error}</span>{/if}
</div>
