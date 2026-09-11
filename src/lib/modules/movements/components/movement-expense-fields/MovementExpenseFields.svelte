<script lang="ts">
	import { untrack } from 'svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';
	import CategorySelectField from '$lib/modules/categories/components/category-select-field/CategorySelectField.svelte';
	import type { Category } from '$lib/modules/categories/types/category.types';
	import type { Expense } from '$lib/modules/expenses/types/expense.types';
	import type {
		MovementClassificationKind,
		MovementPaymentMode
	} from '../../types/movement.types';
	import MovementCardField from '../movement-card-field/MovementCardField.svelte';

	type Props = {
		idPrefix: string;
		cards: CardListItem[];
		expenses: Expense[];
		categories: Category[];
		sourceCardId: string;
		paymentMode: MovementPaymentMode;
		classificationKind: MovementClassificationKind;
		classificationId: string;
		errors?: Record<string, string[] | undefined>;
		installmentCountValue?: string | number | null;
		sourceCardField?: 'visible' | 'hidden';
	};

	let {
		idPrefix,
		cards,
		expenses,
		categories,
		sourceCardId = $bindable(''),
		paymentMode = $bindable<MovementPaymentMode>('cash'),
		classificationKind = $bindable<MovementClassificationKind>('category'),
		classificationId = $bindable(''),
		errors,
		installmentCountValue = '',
		sourceCardField = 'visible'
	}: Props = $props();
	let selectedSourceCard = $derived(cards.find((card) => card.id === sourceCardId));
	let canUseInterestFreeInstallments = $derived(selectedSourceCard?.kind === 'credit');
	let previousClassificationKind = untrack(() => classificationKind);
	let selectedClassification = $derived(
		expenses.find((expense) => expense.id === classificationId)?.name ?? 'Selecciona un gasto'
	);

	$effect(() => {
		if (classificationKind !== previousClassificationKind) {
			classificationId = '';
			previousClassificationKind = classificationKind;
		}
	});

	$effect(() => {
		if (!canUseInterestFreeInstallments && paymentMode === 'installments') paymentMode = 'cash';
	});

	function fieldError(field: string) {
		return errors?.[field]?.[0];
	}
</script>

{#if sourceCardField === 'visible'}
	<MovementCardField
		id={`${idPrefix}-source-card`}
		name="sourceCardId"
		label="Cuenta de origen"
		{cards}
		bind:value={sourceCardId}
		error={fieldError('sourceCardId')}
	/>
{:else}
	<input type="hidden" name="sourceCardId" value={sourceCardId} />
{/if}

{#if canUseInterestFreeInstallments}
	<div class="grid gap-2">
		<Label for={`${idPrefix}-payment-mode`}>Forma de pago</Label>
		<Select.Root type="single" name="paymentMode" required bind:value={paymentMode} items={[{ value: 'cash', label: 'Contado' }, { value: 'installments', label: 'Meses sin intereses' }]}>
			<Select.Trigger id={`${idPrefix}-payment-mode`} class="h-11 w-full border-slate-300 px-3"><span>{paymentMode === 'cash' ? 'Contado' : 'Meses sin intereses'}</span></Select.Trigger>
			<Select.Content><Select.Item value="cash" label="Contado">Contado</Select.Item><Select.Item value="installments" label="Meses sin intereses">Meses sin intereses</Select.Item></Select.Content>
		</Select.Root>
	</div>
{:else}
	<input type="hidden" name="paymentMode" value="cash" />
{/if}

{#if canUseInterestFreeInstallments && paymentMode === 'installments'}
	<div class="grid gap-2">
		<Label for={`${idPrefix}-installment-count`}>Cantidad de meses</Label>
		<Input id={`${idPrefix}-installment-count`} name="installmentCount" required type="number" min="2" max="120" step="1" value={installmentCountValue ?? ''} class="h-11 border-slate-300" aria-invalid={fieldError('installmentCount') ? 'true' : undefined} />
		{#if fieldError('installmentCount')}<span class="text-xs text-red-700">{fieldError('installmentCount')}</span>{/if}
	</div>
	<input type="hidden" name="interestFree" value="true" />
{/if}

<div class="grid gap-2">
	<Label for={`${idPrefix}-classification-kind`}>Clasificar como</Label>
	<Select.Root type="single" name="classificationKind" required bind:value={classificationKind} items={[{ value: 'expense', label: 'Gasto registrado' }, { value: 'category', label: 'Categoría' }]}>
		<Select.Trigger id={`${idPrefix}-classification-kind`} class="h-11 w-full border-slate-300 px-3"><span>{classificationKind === 'expense' ? 'Gasto registrado' : 'Categoría'}</span></Select.Trigger>
		<Select.Content><Select.Item value="expense" label="Gasto registrado">Gasto registrado</Select.Item><Select.Item value="category" label="Categoría">Categoría</Select.Item></Select.Content>
	</Select.Root>
</div>

{#if classificationKind === 'expense'}
	<div class="grid gap-2">
		<Label for={`${idPrefix}-classification-id`}>Gasto</Label>
		<Select.Root type="single" name="classificationId" required bind:value={classificationId} items={expenses.map((expense) => ({ value: expense.id, label: expense.name }))}>
			<Select.Trigger id={`${idPrefix}-classification-id`} class="h-11 w-full border-slate-300 px-3" aria-invalid={fieldError('classificationId') ? 'true' : undefined}><span class="truncate">{selectedClassification}</span></Select.Trigger>
			<Select.Content>
				{#each expenses as expense}<Select.Item value={expense.id} label={expense.name}>{expense.name}</Select.Item>{/each}
			</Select.Content>
		</Select.Root>
		{#if fieldError('classificationId')}<span class="text-xs text-red-700">{fieldError('classificationId')}</span>{/if}
	</div>
{:else}
	<CategorySelectField
		id={`${idPrefix}-classification-id`}
		name="classificationId"
		label="Categoría"
		{categories}
		required
		bind:value={classificationId}
		error={fieldError('classificationId')}
	/>
{/if}
