<script lang="ts">
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import CircleIcon from '@lucide/svelte/icons/circle';
	import ReceiptTextIcon from '@lucide/svelte/icons/receipt-text';
	import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
	import { formatDateTime } from '$lib/shared/utils/format-date-time';
	import type { ExpenseHistoryProps } from './props';

	let { expense }: ExpenseHistoryProps = $props();

</script>

<ol class="max-h-96 space-y-3 overflow-y-auto pr-1">
	{#each expense.paymentHistory as payment (payment.id)}
		<li class="flex gap-3 rounded-lg border border-outline p-3">
			<span class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
				{#if payment.mode === 'card'}<CreditCardIcon class="size-4" />{:else}<ReceiptTextIcon class="size-4" />{/if}
			</span>
			<div class="min-w-0 flex-1">
				<p class="font-semibold text-on-surface">
					Pago registrado: {formatCurrencyFromMinorUnits(payment.amount, payment.currencyCode)}
				</p>
				<p class="mt-1 text-xs text-on-surface-muted">
					{payment.mode === 'card' && payment.cardAlias
						? `${payment.cardAlias} •••• ${payment.cardLastFourDigits ?? ''}`
						: 'Marcado como pagado'}
					· {formatDateTime(payment.paidAt)}
				</p>
				{#if payment.note}<p class="mt-2 text-sm text-on-surface-variant">{payment.note}</p>{/if}
			</div>
		</li>
	{/each}

	{#each expense.amountHistory as change (change.id)}
		<li class="flex gap-3 rounded-lg border border-outline p-3">
			<span class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full {change.direction === 'increase' ? 'bg-destructive/10 text-destructive' : change.direction === 'decrease' ? 'bg-secondary/10 text-secondary' : 'bg-surface-hover text-on-surface-variant'}">
				{#if change.direction === 'increase'}<ArrowUpIcon class="size-4" />{:else if change.direction === 'decrease'}<ArrowDownIcon class="size-4" />{:else}<CircleIcon class="size-3 fill-current" />{/if}
			</span>
			<div class="min-w-0 flex-1">
				<p class="font-semibold text-on-surface">
					{#if change.direction === 'initial'}Monto inicial: {formatCurrencyFromMinorUnits(change.newAmount, expense.currencyCode)}{:else}{formatCurrencyFromMinorUnits(change.previousAmount ?? 0, expense.currencyCode)} → {formatCurrencyFromMinorUnits(change.newAmount, expense.currencyCode)}{/if}
				</p>
			<p class="mt-1 text-xs text-on-surface-muted">{formatDateTime(change.changedAt)}</p>
			</div>
			{#if change.previousAmount !== null}
				<span class="text-sm font-bold {change.direction === 'increase' ? 'text-destructive' : 'text-secondary'}">{change.direction === 'increase' ? '+' : '−'}{formatCurrencyFromMinorUnits(Math.abs(change.newAmount - change.previousAmount), expense.currencyCode)}</span>
			{/if}
		</li>
	{/each}
</ol>
