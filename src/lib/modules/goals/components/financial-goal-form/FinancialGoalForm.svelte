<script lang="ts">
	import { untrack } from 'svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import type { GoalPriority, GoalStatus, GoalType } from '../../types/financial-goal.types';
	import {
		formatEstimatedCompletionDate,
		formatEstimatedPeriods,
		formatGoalAmount,
		goalPriorityOptions,
		goalStatusOptions,
		goalTypeOptions,
		getGoalPriorityLabel,
		getGoalStatusLabel,
		getGoalTypeLabel
	} from '../../utils/financial-goal-labels';
	import { projectGoalCompletion } from '../../utils/goal-projection';
	import type { FinancialGoalFormProps } from './props';

	let {
		mode,
		goal,
		availableDistributionPercentage,
		planningPeriods,
		feedback = null,
		onCancel
	}: FinancialGoalFormProps = $props();
	let expectedAction = $derived(mode === 'create' ? 'create-goal' : 'update-goal');
	let matchingFeedback = $derived(
		feedback?.action === expectedAction && (mode === 'create' || feedback.targetId === goal?.id)
			? feedback
			: null
	);
	let fieldPrefix = $derived(mode === 'create' ? 'create-goal' : `edit-goal-${goal?.id ?? ''}`);
	let type = $state<GoalType>(untrack(() => matchingFeedback?.values?.type ?? goal?.type ?? 'savings'));
	let priority = $state<GoalPriority>(untrack(() => matchingFeedback?.values?.priority ?? goal?.priority ?? 'medium'));
	let status = $state<GoalStatus>(untrack(() => matchingFeedback?.values?.status ?? goal?.status ?? 'active'));
	let targetAmount = $state(untrack(() => amountValue('targetAmount')));
	let currentAmount = $state(untrack(() => amountValue('currentAmount')));
	let distributionPercentage = $state(untrack(() => distributionValue()));
	let currencyCode = $state(untrack(() => matchingFeedback?.values?.currencyCode ?? goal?.currencyCode ?? 'MXN'));
	let distributionMin = $derived(status === 'active' ? 1 : 0);
	let distributionMax = $derived(status === 'active' ? availableDistributionPercentage : 100);
	let previewGoal = $derived({
		id: goal?.id ?? 'preview-goal',
		targetAmountCents: amountToCents(targetAmount),
		currentAmountCents: amountToCents(currentAmount),
		distributionPercentage: Number(distributionPercentage),
		status
	});
	let previewProjection = $derived(projectGoalCompletion(previewGoal, planningPeriods, Number(distributionPercentage)));

	function fieldError(field: string) {
		return matchingFeedback?.errors?.[field]?.[0];
	}

	function amountValue(field: 'targetAmount' | 'currentAmount') {
		if (matchingFeedback?.values?.[field]) return matchingFeedback.values[field];
		if (!goal) return field === 'currentAmount' ? '0.00' : '';
		const cents = field === 'targetAmount' ? goal.targetAmountCents : goal.currentAmountCents;
		return (cents / 100).toFixed(2);
	}

	function distributionValue() {
		if (matchingFeedback?.values?.distributionPercentage) return matchingFeedback.values.distributionPercentage;
		if (goal) return String(goal.distributionPercentage);
		return availableDistributionPercentage > 0 ? '1' : '0';
	}

	function amountToCents(value: string) {
		const amount = Number(value);
		return Number.isFinite(amount) ? Math.max(0, Math.round(amount * 100)) : 0;
	}
</script>

<form
	method="POST"
	action={mode === 'create' ? '?/createFinancialGoal' : '?/updateFinancialGoal'}
	class="grid gap-4"
>
	{#if mode === 'edit' && goal}<input type="hidden" name="id" value={goal.id} />{/if}

	<div class="grid gap-2">
		<Label for={`${fieldPrefix}-name`}>Nombre</Label>
		<Input
			id={`${fieldPrefix}-name`}
			name="name"
			required
			maxlength={100}
			value={matchingFeedback?.values?.name ?? goal?.name ?? ''}
			placeholder="Ej. Comprar una computadora"
			class="h-11 border-outline"
			aria-invalid={fieldError('name') ? 'true' : undefined}
		/>
		{#if fieldError('name')}<span class="text-xs text-destructive">{fieldError('name')}</span>{/if}
	</div>

	<div class="grid gap-2 sm:grid-cols-2 sm:gap-4">
		<div class="grid gap-2">
			<Label for={`${fieldPrefix}-target-amount`}>Monto objetivo</Label>
			<Input
				id={`${fieldPrefix}-target-amount`}
				name="targetAmount"
				required
				type="number"
				min="0.01"
				step="0.01"
				bind:value={targetAmount}
				placeholder="0.00"
				class="h-11 border-outline"
				aria-invalid={fieldError('targetAmount') ? 'true' : undefined}
			/>
			{#if fieldError('targetAmount')}<span class="text-xs text-destructive">{fieldError('targetAmount')}</span>{/if}
		</div>

		<div class="grid gap-2">
			<Label for={`${fieldPrefix}-current-amount`}>Monto acumulado</Label>
			<Input
				id={`${fieldPrefix}-current-amount`}
				name="currentAmount"
				required
				type="number"
				min="0"
				step="0.01"
				bind:value={currentAmount}
				placeholder="0.00"
				class="h-11 border-outline"
				aria-invalid={fieldError('currentAmount') ? 'true' : undefined}
			/>
			{#if fieldError('currentAmount')}<span class="text-xs text-destructive">{fieldError('currentAmount')}</span>{/if}
		</div>
	</div>

	<div class="grid gap-2 sm:grid-cols-2 sm:gap-4">
		<div class="grid gap-2">
			<Label for={`${fieldPrefix}-currency`}>Moneda</Label>
			<Input
				id={`${fieldPrefix}-currency`}
				name="currencyCode"
				required
				maxlength={3}
				bind:value={currencyCode}
				class="h-11 border-outline uppercase"
				aria-invalid={fieldError('currencyCode') ? 'true' : undefined}
			/>
			{#if fieldError('currencyCode')}<span class="text-xs text-destructive">{fieldError('currencyCode')}</span>{/if}
		</div>

	</div>

	<div class="grid gap-2 sm:grid-cols-3 sm:gap-4">
		<div class="grid gap-2">
			<Label for={`${fieldPrefix}-type`}>Tipo</Label>
			<Select.Root type="single" name="type" required bind:value={type} items={goalTypeOptions}>
				<Select.Trigger id={`${fieldPrefix}-type`} class="h-11 w-full border-outline px-3">
					<span>{getGoalTypeLabel(type)}</span>
				</Select.Trigger>
				<Select.Content>
					{#each goalTypeOptions as option}
						<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			{#if fieldError('type')}<span class="text-xs text-destructive">{fieldError('type')}</span>{/if}
		</div>

		<div class="grid gap-2">
			<Label for={`${fieldPrefix}-priority`}>Prioridad</Label>
			<Select.Root type="single" name="priority" required bind:value={priority} items={goalPriorityOptions}>
				<Select.Trigger id={`${fieldPrefix}-priority`} class="h-11 w-full border-outline px-3">
					<span>{getGoalPriorityLabel(priority)}</span>
				</Select.Trigger>
				<Select.Content>
					{#each goalPriorityOptions as option}
						<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			{#if fieldError('priority')}<span class="text-xs text-destructive">{fieldError('priority')}</span>{/if}
		</div>

		<div class="grid gap-2">
			<Label for={`${fieldPrefix}-status`}>Estado</Label>
			<Select.Root type="single" name="status" required bind:value={status} items={goalStatusOptions}>
				<Select.Trigger id={`${fieldPrefix}-status`} class="h-11 w-full border-outline px-3">
					<span>{getGoalStatusLabel(status)}</span>
				</Select.Trigger>
				<Select.Content>
					{#each goalStatusOptions as option}
						<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			{#if fieldError('status')}<span class="text-xs text-destructive">{fieldError('status')}</span>{/if}
		</div>
	</div>

	<div class="grid gap-2">
		<Label for={`${fieldPrefix}-distribution`}>Distribución del dinero libre</Label>
		<div class="relative">
			<Input
				id={`${fieldPrefix}-distribution`}
				name="distributionPercentage"
				required
				type="number"
				min={distributionMin}
				max={distributionMax}
				step="1"
				bind:value={distributionPercentage}
				placeholder="10"
				class="h-11 border-outline pr-10"
				aria-invalid={fieldError('distributionPercentage') ? 'true' : undefined}
			/>
			<span class="pointer-events-none absolute inset-y-0 right-3 flex items-center font-semibold text-on-surface-muted">%</span>
		</div>
		{#if fieldError('distributionPercentage')}<span class="text-xs text-destructive">{fieldError('distributionPercentage')}</span>{/if}
		<p class="text-xs leading-5 text-on-surface-muted">
			{#if status === 'active'}
				Disponible: {availableDistributionPercentage}%. Este porcentaje se aplica sobre el dinero libre calculado por planificación.
			{:else}
				Esta meta no consume distribución mientras no esté activa.
			{/if}
		</p>
	</div>

	<section class="grid gap-3 rounded-lg border border-outline bg-background p-4 sm:grid-cols-3">
		<div class="grid gap-1 sm:block">
			<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Aportación próxima</p>
			<p class="break-words font-bold text-on-surface">{formatGoalAmount(previewProjection.estimatedNextContributionCents, currencyCode)}</p>
		</div>
		<div class="grid gap-1 border-t border-outline pt-2 sm:block sm:border-t-0 sm:pt-0">
			<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Tiempo estimado</p>
			<p class="break-words font-bold text-on-surface">{formatEstimatedPeriods(previewProjection.estimatedRemainingPeriods)}</p>
		</div>
		<div class="grid gap-1 border-t border-outline pt-2 sm:block sm:border-t-0 sm:pt-0">
			<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Finalización estimada</p>
			<p class="break-words font-bold text-on-surface">{formatEstimatedCompletionDate(previewProjection.estimatedCompletionDate)}</p>
		</div>
		{#if previewProjection.unavailableReason}
			<p class="break-words text-xs text-on-surface-muted sm:col-span-3">{previewProjection.unavailableReason}</p>
		{/if}
	</section>

	{#if matchingFeedback?.message}
		<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{matchingFeedback.message}</p>
	{/if}

	<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
		{#if onCancel}<ActionButton type="button" intent="secondary" class="w-full sm:w-auto" onclick={onCancel}>Cancelar</ActionButton>{/if}
		<ActionButton type="submit" class="w-full sm:w-auto">{mode === 'create' ? 'Guardar meta' : 'Guardar cambios'}</ActionButton>
	</div>
</form>
