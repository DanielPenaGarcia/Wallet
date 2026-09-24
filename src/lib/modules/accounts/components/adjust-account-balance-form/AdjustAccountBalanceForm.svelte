<script lang="ts">
	import { untrack } from 'svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { formatAccountBalance } from '../../utils/account-labels';
	import type { AdjustAccountBalanceFormProps } from './props';

	let { account, feedback = null, onCancel }: AdjustAccountBalanceFormProps = $props();
	let adjustFeedback = $derived(
		feedback?.action === 'adjust-account-balance' && feedback.targetId === account.id ? feedback : null
	);
	let newBalance = $state(untrack(() => adjustFeedback?.values?.newBalance ?? (account.balanceCents / 100).toFixed(2)));
	let differenceCents = $derived(Math.round((Number(newBalance) || 0) * 100) - account.balanceCents);

	function fieldError(field: string) {
		return adjustFeedback?.errors?.[field]?.[0];
	}
</script>

<form method="POST" action="?/adjustAccountBalance" class="grid gap-4">
	<input type="hidden" name="id" value={account.id} />
	<div class="rounded-md border border-outline bg-background px-3 py-2">
		<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Saldo actual</p>
		<p class="mt-1 text-lg font-bold text-on-surface">{formatAccountBalance(account.balanceCents)}</p>
	</div>

	<div class="grid gap-2">
		<Label for={`adjust-account-${account.id}-new-balance`}>Nuevo saldo</Label>
		<Input
			id={`adjust-account-${account.id}-new-balance`}
			name="newBalance"
			required
			type="number"
			min="0"
			step="0.01"
			bind:value={newBalance}
			class="h-11 border-outline"
			aria-invalid={fieldError('newBalance') ? 'true' : undefined}
		/>
		{#if fieldError('newBalance')}<span class="text-xs text-destructive">{fieldError('newBalance')}</span>{/if}
	</div>

	<div class="rounded-md bg-surface-subtle px-3 py-2">
		<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Diferencia</p>
		<p class="mt-1 font-bold {differenceCents < 0 ? 'text-destructive' : 'text-primary'}">{formatAccountBalance(differenceCents)}</p>
	</div>

	<div class="grid gap-2">
		<Label for={`adjust-account-${account.id}-reason`}>Motivo</Label>
		<Input
			id={`adjust-account-${account.id}-reason`}
			name="reason"
			required
			maxlength={200}
			value={adjustFeedback?.values?.reason ?? ''}
			placeholder="Ej. Corrección de saldo"
			class="h-11 border-outline"
			aria-invalid={fieldError('reason') ? 'true' : undefined}
		/>
		{#if fieldError('reason')}<span class="text-xs text-destructive">{fieldError('reason')}</span>{/if}
	</div>

	{#if adjustFeedback?.message}<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{adjustFeedback.message}</p>{/if}

	<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
		<ActionButton type="button" intent="secondary" class="w-full sm:w-auto" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit" class="w-full sm:w-auto">Ajustar saldo</ActionButton>
	</div>
</form>
