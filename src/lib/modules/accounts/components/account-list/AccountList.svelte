<script lang="ts">
	import LandmarkIcon from '@lucide/svelte/icons/landmark';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import SlidersHorizontalIcon from '@lucide/svelte/icons/sliders-horizontal';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import WalletIcon from '@lucide/svelte/icons/wallet';
	import { ActionButton } from '$lib/components/ui/action-button';
	import {
		formatAccountBalance,
		getAccountDisplayName,
		getAccountTypeLabel
	} from '../../utils/account-labels';
	import type { AccountListProps } from './props';

	let { accounts, onCreate, onEdit, onAdjustBalance, onDelete }: AccountListProps = $props();
</script>

<section class="overflow-hidden rounded-lg border border-outline bg-surface shadow-sm">
	<div class="flex flex-col gap-4 border-b border-outline px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-lg font-bold text-on-surface">Cuentas</h2>
			<p class="mt-1 text-sm text-on-surface-muted">Lugares donde existe dinero real disponible.</p>
		</div>
		<ActionButton type="button" onclick={onCreate}><PlusIcon />Nueva cuenta</ActionButton>
	</div>

	<div class="grid gap-4 p-4 lg:grid-cols-2">
		{#each accounts as account (account.id)}
			<article class="rounded-lg border border-outline bg-background p-4">
				<div class="flex items-start gap-3">
					<span class="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
						{#if account.type === 'personal'}<WalletIcon class="size-5" />{:else}<LandmarkIcon class="size-5" />{/if}
					</span>
					<div class="min-w-0 flex-1">
						<h3 class="truncate font-bold text-on-surface">{getAccountDisplayName(account)}</h3>
						<p class="mt-1 text-sm text-on-surface-muted">
							{getAccountTypeLabel(account.type)}{#if account.bank} · {account.bank.name}{/if}
						</p>
					</div>
					<div class="flex gap-1">
						<ActionButton type="button" variant="ghost" size="icon-sm" onclick={() => onEdit(account)} aria-label={`Editar ${getAccountDisplayName(account)}`} title="Editar"><PencilIcon /></ActionButton>
						<ActionButton type="button" variant="ghost" size="icon-sm" onclick={() => onAdjustBalance(account)} aria-label={`Ajustar saldo de ${getAccountDisplayName(account)}`} title="Ajustar saldo"><SlidersHorizontalIcon /></ActionButton>
						{#if account.type === 'debit'}
							<ActionButton type="button" intent="danger" size="icon-sm" onclick={() => onDelete(account)} aria-label={`Eliminar ${account.name}`} title="Eliminar"><Trash2Icon /></ActionButton>
						{/if}
					</div>
				</div>

				<div class="mt-5">
					<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Saldo</p>
					<p class="mt-1 text-2xl font-bold text-on-surface">{formatAccountBalance(account.balanceCents)}</p>
				</div>

				{#if account.adjustments.length > 0}
					<div class="mt-4 border-t border-outline pt-3">
						<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Últimos ajustes</p>
						<ul class="mt-2 grid gap-2">
							{#each account.adjustments.slice(0, 3) as adjustment (adjustment.id)}
								<li class="text-sm text-on-surface-variant">
									<span class="font-semibold {adjustment.differenceCents < 0 ? 'text-destructive' : 'text-primary'}">{formatAccountBalance(adjustment.differenceCents)}</span>
									<span> · {adjustment.reason}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</article>
		{/each}
	</div>
</section>
