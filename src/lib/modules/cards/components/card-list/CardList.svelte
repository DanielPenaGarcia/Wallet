<script lang="ts">
	import EyeIcon from '@lucide/svelte/icons/eye';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
	import type { CardListProps } from './props';

	let { cards, onViewDetails, onEdit, onDelete }: CardListProps = $props();

</script>

{#if cards.length === 0}
	<div class="rounded-lg border-2 border-dashed border-outline bg-surface px-6 py-12 text-center">
		<p class="text-lg font-bold text-on-surface">Todavía no hay cuentas</p>
		<p class="mt-2 text-sm text-on-surface-muted">Tu cuenta Personal aparecerá automáticamente para registrar efectivo.</p>
	</div>
{:else}
	<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
		{#each cards as card}
			<article class="overflow-hidden rounded-lg border border-outline bg-surface shadow-sm">
				<div class="h-2" style:background-color={card.color}></div>
				<div class="p-5">
					<div class="flex items-start justify-between gap-3">
						<div>
							<h3 class="font-bold text-on-surface">{card.alias}</h3>
							<p class="mt-1 text-sm text-on-surface-muted">{card.isDefault ? 'Efectivo' : `${card.bankName} · •••• ${card.lastFourDigits}`}</p>
						</div>
						<div class="flex items-center gap-1">
							<span class="rounded-full px-2.5 py-1 text-xs font-bold {card.kind === 'credit' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}">
								{card.kind === 'credit' ? 'Crédito' : 'Débito'}
							</span>
							{#if onViewDetails}<ActionButton type="button" variant="ghost" size="icon-sm" onclick={() => onViewDetails(card)} aria-label={`Ver detalles de ${card.alias}`} title="Ver detalles"><EyeIcon /></ActionButton>{/if}
							{#if onEdit && !card.isDefault}<ActionButton type="button" variant="ghost" size="icon-sm" onclick={() => onEdit(card)} aria-label={`Editar cuenta ${card.alias}`} title="Editar cuenta"><PencilIcon /></ActionButton>{/if}
							{#if onDelete && !card.isDefault}<ActionButton type="button" intent="danger" size="icon-sm" onclick={() => onDelete(card)} aria-label={`Eliminar cuenta ${card.alias}`} title="Eliminar cuenta"><Trash2Icon /></ActionButton>{/if}
						</div>
					</div>
					<div class="mt-6 border-t border-outline pt-4">
						<p class="text-xs font-semibold tracking-wide text-on-surface-muted uppercase">{card.kind === 'credit' ? 'Saldo utilizado' : 'Saldo disponible'}</p>
						<p class="mt-1 text-2xl font-bold text-on-surface">{formatCurrencyFromMinorUnits(card.currentBalance, card.currencyCode)}</p>
					</div>
				</div>
			</article>
		{/each}
	</div>
{/if}
