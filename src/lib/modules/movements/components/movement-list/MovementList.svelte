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
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import HandCoinsIcon from '@lucide/svelte/icons/hand-coins';
	import SlidersHorizontalIcon from '@lucide/svelte/icons/sliders-horizontal';
	import { untrack } from 'svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import CategorySelectField from '$lib/modules/categories/components/category-select-field/CategorySelectField.svelte';
	import { formatCardListItemLabel } from '$lib/modules/cards/utils/card-list-item-label';
	import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
	import { formatDateTime } from '$lib/shared/utils/format-date-time';
	import type { Movement, MovementType } from '../../types/movement.types';
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
	let movementTypeFilterValue = $state(untrack(() => filters.type || allFilterValue));
	let selectedCount = $derived(selectedMovementIds.length);
	let selectedCard = $derived(cards.find((card) => card.id === filters.cardId));
	let selectedCardLabel = $derived(
		filters.cardId
			? (selectedCard ? formatCardListItemLabel(selectedCard) : 'Cuenta seleccionada')
			: 'Todas las cuentas'
	);
	let hasActiveFilters = $derived(
		Boolean(filters.startDate || filters.endDate || filters.cardId || filters.categoryId || filters.type)
	);
	let typeItems: Array<{ value: typeof allFilterValue | MovementType; label: string }> = [
		{ value: allFilterValue, label: 'Todos los tipos' },
		{ value: 'income', label: 'Ingresos' },
		{ value: 'expense', label: 'Gastos' },
		{ value: 'transfer', label: 'Transferencias' },
		{ value: 'credit_purchase', label: 'Compras crédito' },
		{ value: 'credit_card_payment', label: 'Pagos tarjeta' },
		{ value: 'adjustment', label: 'Ajustes' },
		{ value: 'loan_received', label: 'Préstamo recibido' },
		{ value: 'loan_disbursement', label: 'Préstamo entregado' },
		{ value: 'loan_payment', label: 'Pago préstamo' },
		{ value: 'loan_collection', label: 'Cobro préstamo' }
	];
	let selectedTypeLabel = $derived(typeItems.find((item) => item.value === movementTypeFilterValue)?.label ?? 'Todos los tipos');

	function cardLabel(alias: string | null, lastFourDigits: string | null) {
		return alias && lastFourDigits ? `${alias} •••• ${lastFourDigits}` : 'Cuenta no disponible';
	}

	function detail(movement: Movement) {
		if (movement.type === 'income') {
			return `${movement.reason ?? 'Ingreso'} · A ${cardLabel(movement.destinationCardAlias, movement.destinationCardLastFourDigits)}`;
		}
		if (movement.type === 'transfer' || movement.type === 'credit_card_payment') {
			return `${cardLabel(movement.sourceCardAlias, movement.sourceCardLastFourDigits)} → ${cardLabel(movement.destinationCardAlias, movement.destinationCardLastFourDigits)}`;
		}
		if (movement.type === 'adjustment') {
			const account = movement.sourceCardId
				? cardLabel(movement.sourceCardAlias, movement.sourceCardLastFourDigits)
				: cardLabel(movement.destinationCardAlias, movement.destinationCardLastFourDigits);
			return `${movement.reason ?? 'Ajuste'} · ${account}`;
		}
		if (movement.type === 'loan_received') {
			return `${movement.loanName ?? 'Préstamo'} · A ${cardLabel(movement.destinationCardAlias, movement.destinationCardLastFourDigits)}`;
		}
		if (movement.type === 'loan_disbursement') {
			return `${movement.loanName ?? 'Préstamo'} · Desde ${cardLabel(movement.sourceCardAlias, movement.sourceCardLastFourDigits)}`;
		}
		if (movement.type === 'loan_payment') {
			return `${movement.loanName ?? 'Préstamo'} · Pago desde ${cardLabel(movement.sourceCardAlias, movement.sourceCardLastFourDigits)}`;
		}
		if (movement.type === 'loan_collection') {
			return `${movement.loanName ?? 'Préstamo'} · Cobro a ${cardLabel(movement.destinationCardAlias, movement.destinationCardLastFourDigits)}`;
		}
		return `${movement.classificationName ?? 'Sin clasificación'} · ${cardLabel(movement.sourceCardAlias, movement.sourceCardLastFourDigits)}`;
	}

	function movementTone(type: MovementType) {
		if (type === 'expense' || type === 'credit_purchase' || type === 'loan_disbursement' || type === 'loan_payment') return 'expense';
		if (type === 'income' || type === 'loan_received' || type === 'loan_collection') return 'income';
		return 'neutral';
	}

	function amountPrefix(movement: Movement) {
		if (movement.type === 'expense' || movement.type === 'loan_disbursement' || movement.type === 'loan_payment') return '-';
		if (movement.type === 'income' || movement.type === 'loan_received' || movement.type === 'loan_collection') return '+';
		if (movement.type === 'adjustment') return movement.destinationCardId ? '+' : '-';
		return '';
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

<section class="overflow-hidden rounded-lg border border-outline bg-surface shadow-sm">
	<div class="flex flex-col gap-4 border-b border-outline px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-lg font-bold text-on-surface">Lista de movimientos</h2>
			<p class="mt-1 text-sm text-on-surface-muted">Movimientos ordenados por fecha financiera.</p>
		</div>
		<div class="flex flex-wrap gap-2">
			<ActionButton type="button" intent="secondary" onclick={onExport}><DownloadIcon />Exportar</ActionButton>
			<ActionButton type="button" intent="secondary" onclick={onBulkCreate}><ListPlusIcon />Registro masivo</ActionButton>
			<ActionButton type="button" intent="secondary" onclick={toggleSelectionMode}><ListChecksIcon />{selectingMovements ? 'Cancelar selección' : 'Seleccionar movimientos'}</ActionButton>
			<ActionButton type="button" onclick={onCreate}><PlusIcon />Nuevo movimiento</ActionButton>
		</div>
	</div>
	<form method="GET" class="grid gap-4 border-b border-outline bg-surface-subtle px-5 py-4">
		<div>
			<p class="text-sm font-bold text-on-surface">Filtros</p>
			<p class="mt-1 text-xs text-on-surface-muted">Consulta por periodo, cuenta o categoría.</p>
		</div>
		<div class="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
			<div class="grid gap-2">
				<Label for="movement-period-start">Fecha inicio</Label>
				<Input id="movement-period-start" name="startDate" type="date" value={filters.startDate} class="h-11 border-outline bg-surface" />
			</div>
			<div class="grid gap-2">
				<Label for="movement-period-end">Fecha fin</Label>
				<Input id="movement-period-end" name="endDate" type="date" value={filters.endDate} class="h-11 border-outline bg-surface" />
			</div>
			<div class="grid gap-2">
				<Label for="movement-card-filter">Cuenta</Label>
				<Select.Root type="single" name="cardId" value={filters.cardId || allFilterValue} items={[{ value: allFilterValue, label: 'Todas las cuentas' }, ...cards.map((card) => ({ value: card.id, label: formatCardListItemLabel(card) }))]}>
					<Select.Trigger id="movement-card-filter" class="h-11 w-full border-outline bg-surface px-3">
						<span class="truncate">{selectedCardLabel}</span>
					</Select.Trigger>
					<Select.Content>
						<Select.Item value={allFilterValue} label="Todas las cuentas">Todas las cuentas</Select.Item>
						{#each cards as card (card.id)}
							<Select.Item value={card.id} label={formatCardListItemLabel(card)}>{formatCardListItemLabel(card)}</Select.Item>
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
			<div class="grid gap-2">
				<Label for="movement-type-filter">Tipo</Label>
				<Select.Root type="single" name="type" bind:value={movementTypeFilterValue} items={typeItems}>
					<Select.Trigger id="movement-type-filter" class="h-11 w-full border-outline bg-surface px-3">
						<span class="truncate">{selectedTypeLabel}</span>
					</Select.Trigger>
					<Select.Content>
						{#each typeItems as item}
							<Select.Item value={item.value} label={item.label}>{item.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
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
			<p class="font-bold text-on-surface-variant">Aún no hay movimientos</p>
			<p class="mt-1 text-sm text-on-surface-muted">Registra una operación para comenzar.</p>
		</div>
	{:else}
		<form method="POST" action="?/bulkDeleteMovements">
			{#if selectingMovements}
				<div class="flex flex-col gap-3 border-b border-outline bg-surface px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
					<label class="flex items-center gap-2 text-sm font-semibold text-on-surface-variant">
						<input
							type="checkbox"
							class="size-4 rounded border-outline"
							checked={selectedCount === movements.length}
							indeterminate={selectedCount > 0 && selectedCount < movements.length}
							onchange={(event) => toggleAllMovements(event.currentTarget.checked)}
						/>
						Seleccionar todos
					</label>
					<ActionButton type="submit" intent="danger" disabled={selectedCount === 0}><Trash2Icon />Eliminar {selectedCount > 0 ? selectedCount : ''}</ActionButton>
				</div>
			{/if}
			<ul class="divide-y divide-outline">
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
								class="size-4 rounded border-outline"
							/>
						{/if}
						<span class="grid size-9 shrink-0 place-items-center rounded-full {movementTone(movement.type) === 'expense' ? 'bg-destructive/10 text-destructive' : movementTone(movement.type) === 'income' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}">
							{#if movement.type === 'expense'}<ArrowUpRightIcon class="size-5" />{:else if movement.type === 'income'}<ArrowDownLeftIcon class="size-5" />{:else if movement.type === 'credit_purchase' || movement.type === 'credit_card_payment'}<CreditCardIcon class="size-5" />{:else if movement.type === 'adjustment'}<SlidersHorizontalIcon class="size-5" />{:else if movement.type.startsWith('loan_')}<HandCoinsIcon class="size-5" />{:else}<ArrowLeftRightIcon class="size-5" />{/if}
						</span>
						<div class="min-w-0 flex-1">
							<p class="font-bold text-on-surface">{movement.title}</p>
							<p class="mt-1 truncate text-sm text-on-surface-muted">{detail(movement)}</p>
							{#if (movement.type === 'expense' || movement.type === 'credit_purchase') && movement.paymentMode === 'installments'}
								<p class="mt-1 text-xs font-semibold text-on-surface-muted">{movement.installmentCount} meses{movement.interestFree ? ' sin intereses' : ''}</p>
							{/if}
						</div>
						<div class="sm:text-right">
							<p class="text-lg font-bold {movementTone(movement.type) === 'expense' ? 'text-destructive' : movementTone(movement.type) === 'income' ? 'text-secondary' : 'text-primary'}">
								{amountPrefix(movement)}{formatCurrencyFromMinorUnits(movement.amount, movement.currencyCode)}
							</p>
							<p class="text-xs text-on-surface-muted">{formatDateTime(movement.occurredAt)}</p>
						</div>
						<div class="flex items-center gap-1 sm:ml-2">
							<ActionButton type="button" variant="ghost" size="icon-sm" onclick={() => onEdit(movement)} aria-label={`Editar movimiento ${movement.title}`} title="Editar movimiento"><PencilIcon /></ActionButton>
							<ActionButton type="button" intent="danger" size="icon-sm" onclick={() => onDelete(movement)} aria-label={`Eliminar movimiento ${movement.title}`} title="Eliminar movimiento"><Trash2Icon /></ActionButton>
						</div>
					</li>
				{/each}
			</ul>
		</form>
	{/if}
</section>
