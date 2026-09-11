<script lang="ts">
	import ArrowDownLeftIcon from '@lucide/svelte/icons/arrow-down-left';
	import ArrowLeftRightIcon from '@lucide/svelte/icons/arrow-left-right';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import ListChecksIcon from '@lucide/svelte/icons/list-checks';
	import ListPlusIcon from '@lucide/svelte/icons/list-plus';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import SearchIcon from '@lucide/svelte/icons/search';
	import XIcon from '@lucide/svelte/icons/x';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { untrack } from 'svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import CategorySelectField from '$lib/modules/categories/components/category-select-field/CategorySelectField.svelte';
	import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
	import { formatDateTime } from '$lib/shared/utils/format-date-time';
	import type { Movement } from '../../types/movement.types';
	import type { MovementListProps } from './props';

	const allFilterValue = 'all';

	let {
		movements,
		cards,
		categories,
		filters,
		onCreate,
		onBulkCreate,
		onExport,
		onEdit,
		onDelete
	}: MovementListProps = $props();
	let selectingMovements = $state(false);
	let selectedMovementIds = $state<string[]>([]);
	let categoryFilterValue = $state(untrack(() => filters.categoryId || allFilterValue));
	let selectedCount = $derived(selectedMovementIds.length);
	let selectedCardLabel = $derived(
		filters.cardId
			? (cards.find((card) => card.id === filters.cardId)?.alias ?? 'Cuenta seleccionada')
			: 'Todas las cuentas'
	);
	let hasActiveFilters = $derived(
		Boolean(filters.startDate || filters.endDate || filters.cardId || filters.categoryId)
	);

	function cardLabel(alias: string | null, lastFourDigits: string | null) {
		return alias && lastFourDigits ? `${alias} •••• ${lastFourDigits}` : 'Cuenta no disponible';
	}

	function detail(movement: Movement) {
		if (movement.type === 'income') {
			return `${movement.reason ?? 'Ingreso'} · A ${cardLabel(movement.destinationCardAlias, movement.destinationCardLastFourDigits)}`;
		}
		if (movement.type === 'transfer') {
			return `${cardLabel(movement.sourceCardAlias, movement.sourceCardLastFourDigits)} → ${cardLabel(movement.destinationCardAlias, movement.destinationCardLastFourDigits)}`;
		}
		return `${movement.classificationName ?? 'Sin clasificación'} · ${cardLabel(movement.sourceCardAlias, movement.sourceCardLastFourDigits)}`;
	}

	function toggleSelectionMode() {
		selectingMovements = !selectingMovements;
		selectedMovementIds = [];
	}

	function toggleMovement(id: string, checked: boolean) {
		selectedMovementIds = checked
			? Array.from(new Set([...selectedMovementIds, id]))
			: selectedMovementIds.filter((selectedId) => selectedId !== id);
	}

	function toggleAllMovements(checked: boolean) {
		selectedMovementIds = checked ? movements.map((movement) => movement.id) : [];
	}
</script>

<section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
	<div class="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-lg font-bold text-slate-900">Lista de movimientos</h2>
			<p class="mt-1 text-sm text-slate-500">Gastos, ingresos y transferencias ordenados por fecha.</p>
		</div>
		<div class="flex flex-wrap gap-2">
			<ActionButton type="button" intent="secondary" onclick={onExport}><DownloadIcon />Exportar</ActionButton>
			<ActionButton type="button" intent="secondary" onclick={onBulkCreate}><ListPlusIcon />Registro masivo</ActionButton>
			<ActionButton type="button" intent="secondary" onclick={toggleSelectionMode}><ListChecksIcon />{selectingMovements ? 'Cancelar selección' : 'Seleccionar movimientos'}</ActionButton>
			<ActionButton type="button" onclick={onCreate}><PlusIcon />Nuevo movimiento</ActionButton>
		</div>
	</div>
	<form method="GET" class="grid gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4">
		<div>
			<p class="text-sm font-bold text-slate-900">Filtros</p>
			<p class="mt-1 text-xs text-slate-500">Consulta por periodo, cuenta o categoría.</p>
		</div>
		<div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
			<div class="grid gap-2">
				<Label for="movement-period-start">Fecha inicio</Label>
				<Input id="movement-period-start" name="startDate" type="date" value={filters.startDate} class="h-11 border-slate-300 bg-white" />
			</div>
			<div class="grid gap-2">
				<Label for="movement-period-end">Fecha fin</Label>
				<Input id="movement-period-end" name="endDate" type="date" value={filters.endDate} class="h-11 border-slate-300 bg-white" />
			</div>
			<div class="grid gap-2">
				<Label for="movement-card-filter">Cuenta</Label>
				<Select.Root type="single" name="cardId" value={filters.cardId || allFilterValue} items={[{ value: allFilterValue, label: 'Todas las cuentas' }, ...cards.map((card) => ({ value: card.id, label: card.isDefault ? `${card.alias} · Efectivo` : `${card.alias} •••• ${card.lastFourDigits}` }))]}>
					<Select.Trigger id="movement-card-filter" class="h-11 w-full border-slate-300 bg-white px-3">
						<span class="truncate">{selectedCardLabel}</span>
					</Select.Trigger>
					<Select.Content>
						<Select.Item value={allFilterValue} label="Todas las cuentas">Todas las cuentas</Select.Item>
						{#each cards as card (card.id)}
							<Select.Item value={card.id} label={card.isDefault ? `${card.alias} · Efectivo` : `${card.alias} •••• ${card.lastFourDigits}`}>{card.isDefault ? `${card.alias} · Efectivo` : `${card.alias} •••• ${card.lastFourDigits}`}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<CategorySelectField
				id="movement-category-filter"
				name="categoryId"
				label="Categoría"
				{categories}
				allowAll
				allValue={allFilterValue}
				allLabel="Todas las categorías"
				bind:value={categoryFilterValue}
			/>
		</div>
		<div class="flex flex-wrap gap-2">
			<ActionButton type="submit" intent="secondary"><SearchIcon />Consultar</ActionButton>
			{#if hasActiveFilters}
				<ActionButton type="button" intent="secondary" onclick={() => (window.location.href = '/movimientos')}><XIcon />Limpiar</ActionButton>
			{/if}
		</div>
	</form>
	{#if movements.length === 0}
		<div class="px-6 py-12 text-center">
			<p class="font-bold text-slate-700">Aún no hay movimientos</p>
			<p class="mt-1 text-sm text-slate-500">Registra un gasto, ingreso o transferencia para comenzar.</p>
		</div>
	{:else}
		<form method="POST" action="?/bulkDeleteMovements">
			{#if selectingMovements}
				<div class="flex flex-col gap-3 border-b border-slate-200 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
					<label class="flex items-center gap-2 text-sm font-semibold text-slate-700">
						<input
							type="checkbox"
							class="size-4 rounded border-slate-300"
							checked={selectedCount === movements.length}
							indeterminate={selectedCount > 0 && selectedCount < movements.length}
							onchange={(event) => toggleAllMovements(event.currentTarget.checked)}
						/>
						Seleccionar todos
					</label>
					<ActionButton type="submit" intent="danger" disabled={selectedCount === 0}><Trash2Icon />Eliminar {selectedCount > 0 ? selectedCount : ''}</ActionButton>
				</div>
			{/if}
			<ul class="divide-y divide-slate-100">
				{#each movements as movement (movement.id)}
					<li class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
						{#if selectingMovements}
							<input
								type="checkbox"
								name="ids"
								value={movement.id}
								checked={selectedMovementIds.includes(movement.id)}
								onchange={(event) => toggleMovement(movement.id, event.currentTarget.checked)}
								aria-label={`Seleccionar movimiento ${movement.title}`}
								class="size-4 rounded border-slate-300"
							/>
						{/if}
						<span class="grid size-9 shrink-0 place-items-center rounded-full {movement.type === 'expense' ? 'bg-red-50 text-red-700' : movement.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}">
							{#if movement.type === 'expense'}<ArrowUpRightIcon class="size-5" />{:else if movement.type === 'income'}<ArrowDownLeftIcon class="size-5" />{:else}<ArrowLeftRightIcon class="size-5" />{/if}
						</span>
						<div class="min-w-0 flex-1">
							<p class="font-bold text-slate-900">{movement.title}</p>
							<p class="mt-1 truncate text-sm text-slate-500">{detail(movement)}</p>
							{#if movement.type === 'expense' && movement.paymentMode === 'installments'}
								<p class="mt-1 text-xs font-semibold text-slate-500">{movement.installmentCount} meses{movement.interestFree ? ' sin intereses' : ''}</p>
							{/if}
						</div>
						<div class="sm:text-right">
							<p class="text-lg font-bold {movement.type === 'expense' ? 'text-red-700' : movement.type === 'income' ? 'text-emerald-700' : 'text-blue-800'}">
								{movement.type === 'expense' ? '−' : movement.type === 'income' ? '+' : ''}{formatCurrencyFromMinorUnits(movement.amount, movement.currencyCode)}
							</p>
							<p class="text-xs text-slate-500">{formatDateTime(movement.occurredAt)}</p>
						</div>
						<div class="flex items-center gap-1 sm:ml-2">
							<ActionButton type="button" intent="icon" onclick={() => onEdit(movement)} aria-label={`Editar movimiento ${movement.title}`} title="Editar movimiento"><PencilIcon /></ActionButton>
							<ActionButton type="button" intent="icon-danger" onclick={() => onDelete(movement)} aria-label={`Eliminar movimiento ${movement.title}`} title="Eliminar movimiento"><Trash2Icon /></ActionButton>
						</div>
					</li>
				{/each}
			</ul>
		</form>
	{/if}
</section>
