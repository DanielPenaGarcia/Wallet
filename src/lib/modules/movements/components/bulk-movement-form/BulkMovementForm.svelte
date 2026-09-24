<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
	import { getCategoryPath } from '$lib/modules/expenses/utils/category-path';
	import type { MovementClassificationKind, MovementPaymentMode, MovementType } from '../../types/movement.types';
	import MovementCardField from '../movement-card-field/MovementCardField.svelte';
	import MovementCommonFields from '../movement-common-fields/MovementCommonFields.svelte';
	import MovementExpenseFields from '../movement-expense-fields/MovementExpenseFields.svelte';
	import MovementTypePicker from '../movement-type-picker/MovementTypePicker.svelte';
	import type { BulkMovementDraft, BulkMovementFormProps } from './props';

	const storageKey = 'wallet:bulk-movements:v1';

	let { cards, expenses, categories, feedback = null }: BulkMovementFormProps = $props();
	let selectedType = $state<MovementType | null>(null);
	let drafts = $state<BulkMovementDraft[]>([]);
	let expandedDraftId = $state<string | null>(null);
	let draftKey = $state(0);
	let sourceCardId = $state('');
	let destinationCardId = $state('');
	let paymentMode = $state<MovementPaymentMode>('cash');
	let classificationKind = $state<MovementClassificationKind>('category');
	let classificationId = $state('');
	let currentMessage = $state('');
	let clearedAfterSuccess = $state(false);
	let restoredFromStorage = $state(false);
	let previousSourceCardId = '';
	let realCards = $derived(cards.filter((card) => card.kind !== 'credit'));
	let creditCards = $derived(cards.filter((card) => card.kind === 'credit'));
	let sourceCards = $derived(selectedType === 'credit_purchase' ? creditCards : realCards);
	let serializedDrafts = $derived(JSON.stringify(drafts.map(({ id: _id, ...draft }) => draft)));
	let needsBatchSourceCard = $derived(selectedType === 'expense' || selectedType === 'credit_purchase' || selectedType === 'transfer');

	$effect(() => {
		if (!browser || !restoredFromStorage) return;
		localStorage.setItem(storageKey, JSON.stringify({ selectedType, sourceCardId, drafts }));
	});

	$effect(() => {
		if (!restoredFromStorage || !needsBatchSourceCard || sourceCardId === previousSourceCardId) return;
		if (previousSourceCardId && drafts.length > 0) {
			drafts = drafts.map((draft) => ({ ...draft, sourceCardId }));
		}
		previousSourceCardId = sourceCardId;
	});

	$effect(() => {
		if (!browser || clearedAfterSuccess || feedback?.action !== 'bulk-create-movements' || !feedback.success) return;
		localStorage.removeItem(storageKey);
		drafts = [];
		selectedType = null;
		clearedAfterSuccess = true;
	});

	onMount(() => {
		const stored = localStorage.getItem(storageKey);
		if (stored) {
			try {
			const parsed = JSON.parse(stored) as { selectedType?: MovementType | null; sourceCardId?: string; drafts?: BulkMovementDraft[] };
			if (
				parsed.selectedType === 'expense' ||
				parsed.selectedType === 'credit_purchase' ||
				parsed.selectedType === 'income' ||
				parsed.selectedType === 'transfer'
			) {
				selectedType = parsed.selectedType;
			}
			if (typeof parsed.sourceCardId === 'string') sourceCardId = parsed.sourceCardId;
			if (Array.isArray(parsed.drafts)) drafts = parsed.drafts;
			} catch {
				localStorage.removeItem(storageKey);
			}
		}
		previousSourceCardId = sourceCardId;
		restoredFromStorage = true;
	});

	function resetCurrentForm() {
		destinationCardId = '';
		paymentMode = 'cash';
		classificationKind = 'category';
		classificationId = '';
		currentMessage = '';
		draftKey += 1;
	}

	function addDraft(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget;
		if (!(form instanceof HTMLFormElement) || !selectedType) return;
		if (!form.reportValidity()) return;
		if (needsBatchSourceCard && !sourceCardId) {
			currentMessage = 'Selecciona la cuenta origen del lote.';
			return;
		}
		const data = Object.fromEntries(new FormData(form));
		const draft: BulkMovementDraft = {
			id: crypto.randomUUID(),
			type: selectedType,
			title: String(data.title ?? ''),
			amount: String(data.amount ?? ''),
			occurredAt: String(data.occurredAt ?? ''),
			reason: String(data.reason ?? ''),
			sourceCardId: String(data.sourceCardId ?? ''),
			destinationCardId: String(data.destinationCardId ?? ''),
			paymentMode: data.paymentMode === 'installments' ? 'installments' : 'cash',
			installmentCount: String(data.installmentCount ?? ''),
			interestFree: data.interestFree === 'true' || data.interestFree === 'on',
			classificationKind: data.classificationKind === 'expense' ? 'expense' : 'category',
			classificationId: String(data.classificationId ?? '')
		};
		drafts = [draft, ...drafts];
		expandedDraftId = draft.id;
		resetCurrentForm();
	}

	function draftAmountLabel(draft: BulkMovementDraft) {
		const amount = Number(draft.amount);
		if (!Number.isFinite(amount)) return draft.amount || '0.00';
		const card =
			draft.type === 'income'
				? cards.find((item) => item.id === draft.destinationCardId)
				: cards.find((item) => item.id === draft.sourceCardId);
		return formatCurrencyFromMinorUnits(Math.round(amount * 100), card?.currencyCode ?? 'MXN');
	}

	function draftDetail(draft: BulkMovementDraft) {
		if (draft.type === 'income') return draft.reason || 'Ingreso';
		if (draft.type === 'transfer') return 'Transferencia entre cuentas';
		if (draft.type === 'credit_purchase') return `Compra crédito · ${expenseClassificationLabel(draft)}`;
		return expenseClassificationLabel(draft);
	}

	function expenseClassificationLabel(draft: BulkMovementDraft) {
		if (draft.classificationKind === 'expense') {
			return expenses.find((expense) => expense.id === draft.classificationId)?.name ?? 'Gasto registrado';
		}
		return getCategoryPath(categories.find((category) => category.id === draft.classificationId), categories);
	}

	function removeDraft(id: string) {
		drafts = drafts.filter((draft) => draft.id !== id);
		if (expandedDraftId === id) expandedDraftId = null;
	}

	function changeType(type: MovementType | null) {
		if (type !== selectedType) {
			drafts = [];
			expandedDraftId = null;
		}
		selectedType = type;
		sourceCardId = '';
		previousSourceCardId = '';
		resetCurrentForm();
	}
</script>

{#if selectedType === null}
	<MovementTypePicker
		allowedTypes={['expense', 'credit_purchase', 'income', 'transfer']}
		onSelect={(type) => changeType(type)}
	/>
{:else}
	<div class="grid gap-5">
		<div class="flex flex-col gap-3 rounded-md border border-outline bg-surface-subtle px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<p class="text-sm font-bold text-on-surface">{selectedType === 'expense' ? 'Gastos' : selectedType === 'credit_purchase' ? 'Compras crédito' : selectedType === 'income' ? 'Ingresos' : 'Transferencias'}</p>
				<p class="mt-1 text-xs text-on-surface-muted">{drafts.length} {drafts.length === 1 ? 'movimiento en el lote' : 'movimientos en el lote'}</p>
			</div>
			<ActionButton type="button" intent="secondary" onclick={() => changeType(null)}>Cambiar tipo</ActionButton>
		</div>

		{#if feedback?.action === 'bulk-create-movements' && feedback.message}
			<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{feedback.message}</p>
		{/if}

		{#if needsBatchSourceCard}
			<div class="rounded-md border border-outline bg-surface p-3">
				<MovementCardField
					id={`bulk-${selectedType}-batch-source`}
					name="sourceCardId"
					label={selectedType === 'credit_purchase' ? 'Tarjeta de crédito del lote' : 'Cuenta origen del lote'}
					cards={sourceCards}
					bind:value={sourceCardId}
				/>
			</div>
		{/if}

		{#if drafts.length > 0}
			<ol class="space-y-2">
				{#each drafts as draft (draft.id)}
					<li class="rounded-md border border-outline">
						<div class="flex items-center gap-2 px-3 py-2">
							<button type="button" class="grid size-8 place-items-center rounded-md text-on-surface-muted hover:bg-surface-hover" onclick={() => (expandedDraftId = expandedDraftId === draft.id ? null : draft.id)} aria-label="Alternar detalle">
								{#if expandedDraftId === draft.id}<ChevronDownIcon class="size-4" />{:else}<ChevronRightIcon class="size-4" />{/if}
							</button>
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-bold text-on-surface">{draft.title}</p>
								{#if expandedDraftId === draft.id}<p class="mt-1 text-xs text-on-surface-muted">{draftDetail(draft)} · {draft.occurredAt}</p>{/if}
							</div>
							<p class="text-sm font-bold text-on-surface">{draftAmountLabel(draft)}</p>
							<ActionButton type="button" intent="danger" size="icon-sm" onclick={() => removeDraft(draft.id)} aria-label={`Quitar ${draft.title}`} title="Quitar"><Trash2Icon /></ActionButton>
						</div>
					</li>
				{/each}
			</ol>
		{/if}

		{#key draftKey}
			<form method="dialog" class="grid gap-4 border-t border-outline pt-5 sm:grid-cols-2" onsubmit={addDraft}>
				<input type="hidden" name="type" value={selectedType} />
				<MovementCommonFields idPrefix={`bulk-${selectedType}-${draftKey}`} />

				{#if selectedType === 'expense' || selectedType === 'credit_purchase'}
					<MovementExpenseFields
						idPrefix={`bulk-${selectedType}-${draftKey}`}
						cards={sourceCards}
						{expenses}
						{categories}
						bind:sourceCardId
						bind:paymentMode
						bind:classificationKind
						bind:classificationId
						sourceCardField="hidden"
					/>
				{:else if selectedType === 'income'}
					<div class="grid gap-2 sm:col-span-2">
						<Label for={`bulk-income-reason-${draftKey}`}>Razón</Label>
						<Input id={`bulk-income-reason-${draftKey}`} name="reason" required maxlength={160} placeholder="Ej. Pago de nómina" class="h-11 border-outline" />
					</div>
					<MovementCardField id={`bulk-income-destination-${draftKey}`} name="destinationCardId" label="Cuenta de destino" {cards} bind:value={destinationCardId} />
				{:else}
					<input type="hidden" name="sourceCardId" value={sourceCardId} />
					<MovementCardField id={`bulk-transfer-destination-${draftKey}`} name="destinationCardId" label="Cuenta de destino" {cards} bind:value={destinationCardId} />
				{/if}

				{#if currentMessage}<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive sm:col-span-2">{currentMessage}</p>{/if}
				<div class="flex justify-end sm:col-span-2">
					<ActionButton type="submit">Agregar al lote</ActionButton>
				</div>
			</form>
		{/key}

		<form method="POST" action="?/bulkCreateMovements" class="flex justify-end gap-2 border-t border-outline pt-4">
			<input type="hidden" name="movements" value={serializedDrafts} />
			<ActionButton type="submit" disabled={drafts.length === 0}>Registrar lote</ActionButton>
		</form>
	</div>
{/if}
