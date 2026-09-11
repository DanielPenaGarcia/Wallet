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
	<div class="rounded-lg border-2 border-dashed border-slate-300 bg-white px-6 py-12 text-center">
		<p class="text-lg font-bold text-slate-800">Todavía no hay cuentas</p>
		<p class="mt-2 text-sm text-slate-500">Tu cuenta Personal aparecerá automáticamente para registrar efectivo.</p>
	</div>
{:else}
	<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
		{#each cards as card}
			<article class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
				<div class="h-2" style:background-color={card.color}></div>
				<div class="p-5">
					<div class="flex items-start justify-between gap-3">
						<div>
							<h3 class="font-bold text-slate-900">{card.alias}</h3>
							<p class="mt-1 text-sm text-slate-500">{card.isDefault ? 'Efectivo' : `${card.bankName} · •••• ${card.lastFourDigits}`}</p>
						</div>
						<div class="flex items-center gap-1">
							<span class="rounded-full px-2.5 py-1 text-xs font-bold {card.kind === 'credit' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}">
								{card.kind === 'credit' ? 'Crédito' : 'Débito'}
							</span>
							{#if onViewDetails}<ActionButton type="button" intent="icon" onclick={() => onViewDetails(card)} aria-label={`Ver detalles de ${card.alias}`} title="Ver detalles"><EyeIcon /></ActionButton>{/if}
							{#if onEdit && !card.isDefault}<ActionButton type="button" intent="icon" onclick={() => onEdit(card)} aria-label={`Editar cuenta ${card.alias}`} title="Editar cuenta"><PencilIcon /></ActionButton>{/if}
							{#if onDelete && !card.isDefault}<ActionButton type="button" intent="icon-danger" onclick={() => onDelete(card)} aria-label={`Eliminar cuenta ${card.alias}`} title="Eliminar cuenta"><Trash2Icon /></ActionButton>{/if}
						</div>
					</div>
					<div class="mt-6 border-t border-slate-100 pt-4">
						<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">{card.kind === 'credit' ? 'Saldo utilizado' : 'Saldo disponible'}</p>
						<p class="mt-1 text-2xl font-bold text-slate-900">{formatCurrencyFromMinorUnits(card.currentBalance, card.currencyCode)}</p>
					</div>
				</div>
			</article>
		{/each}
	</div>
{/if}
