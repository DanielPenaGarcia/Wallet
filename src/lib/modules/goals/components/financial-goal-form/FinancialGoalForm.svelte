<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { FinancialGoalFormProps } from './props';

	let { mode, goal, feedback = null, onCancel }: FinancialGoalFormProps = $props();
	let expectedAction = $derived(mode === 'create' ? 'create-goal' : 'update-goal');
	let matchingFeedback = $derived(
		feedback?.action === expectedAction && (mode === 'create' || feedback.targetId === goal?.id)
			? feedback
			: null
	);
	let fieldPrefix = $derived(mode === 'create' ? 'create-goal' : `edit-goal-${goal?.id ?? ''}`);

	function fieldError(field: string) {
		return matchingFeedback?.errors?.[field]?.[0];
	}
</script>

<form
	method="POST"
	action={mode === 'create' ? '?/createFinancialGoal' : '?/updateFinancialGoal'}
	class="grid gap-4"
>
	{#if mode === 'edit' && goal}<input type="hidden" name="id" value={goal.id} />{/if}

	<div class="grid gap-2">
		<Label for={`${fieldPrefix}-name`}>Objetivo</Label>
		<Input
			id={`${fieldPrefix}-name`}
			name="name"
			required
			maxlength={80}
			value={matchingFeedback?.values?.name ?? goal?.name ?? ''}
			placeholder="Ej. Comprar un carro"
			class="h-11 border-slate-300"
			aria-invalid={fieldError('name') ? 'true' : undefined}
		/>
		{#if fieldError('name')}<span class="text-xs text-red-700">{fieldError('name')}</span>{/if}
	</div>

	<div class="grid gap-2 sm:grid-cols-2 sm:gap-4">
		<div class="grid gap-2">
			<Label for={`${fieldPrefix}-target-amount`}>Precio total</Label>
			<Input
				id={`${fieldPrefix}-target-amount`}
				name="targetAmount"
				required
				type="number"
				min="0.01"
				step="0.01"
				value={matchingFeedback?.values?.targetAmount ?? (goal ? (goal.targetAmount / 100).toFixed(2) : '')}
				placeholder="0.00"
				class="h-11 border-slate-300"
				aria-invalid={fieldError('targetAmount') ? 'true' : undefined}
			/>
			{#if fieldError('targetAmount')}<span class="text-xs text-red-700">{fieldError('targetAmount')}</span>{/if}
		</div>

		<div class="grid gap-2">
			<Label for={`${fieldPrefix}-currency`}>Moneda</Label>
			<Input
				id={`${fieldPrefix}-currency`}
				name="currencyCode"
				required
				maxlength={3}
				value={matchingFeedback?.values?.currencyCode ?? goal?.currencyCode ?? 'MXN'}
				class="h-11 border-slate-300 uppercase"
				aria-invalid={fieldError('currencyCode') ? 'true' : undefined}
			/>
			{#if fieldError('currencyCode')}<span class="text-xs text-red-700">{fieldError('currencyCode')}</span>{/if}
		</div>
	</div>

	<div class="grid gap-2">
		<Label for={`${fieldPrefix}-allocation`}>Porcentaje de ingresos</Label>
		<div class="relative">
			<Input
				id={`${fieldPrefix}-allocation`}
				name="allocationPercentage"
				required
				type="number"
				min="1"
				max="100"
				step="1"
				value={matchingFeedback?.values?.allocationPercentage ?? goal?.allocationPercentage ?? ''}
				placeholder="10"
				class="h-11 border-slate-300 pr-10"
				aria-invalid={fieldError('allocationPercentage') ? 'true' : undefined}
			/>
			<span class="pointer-events-none absolute inset-y-0 right-3 flex items-center font-semibold text-slate-500">%</span>
		</div>
		{#if fieldError('allocationPercentage')}<span class="text-xs text-red-700">{fieldError('allocationPercentage')}</span>{/if}
		<p class="text-xs leading-5 text-slate-500">Este porcentaje se reservará de cada ingreso para alcanzar el objetivo.</p>
	</div>

	{#if matchingFeedback?.message}
		<p class="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{matchingFeedback.message}</p>
	{/if}

	<div class="flex justify-end gap-2">
		{#if mode === 'edit' && onCancel}
			<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>
		{/if}
		<ActionButton type="submit">{mode === 'create' ? 'Guardar objetivo' : 'Guardar cambios'}</ActionButton>
	</div>
</form>
