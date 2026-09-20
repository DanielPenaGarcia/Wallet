<script lang="ts">
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import LandmarkIcon from '@lucide/svelte/icons/landmark';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import PowerIcon from '@lucide/svelte/icons/power';
	import SlidersHorizontalIcon from '@lucide/svelte/icons/sliders-horizontal';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import WalletIcon from '@lucide/svelte/icons/wallet';
	import { ActionButton } from '$lib/components/ui/action-button';
	import {
		formatAccountBalance,
		getCreditAvailableCents,
		getAccountDisplayName,
		getAccountTypeLabel
	} from '../../utils/account-labels';
	import type { AccountListProps } from './props';

	let { accounts, onCreate, onEdit, onAdjustBalance, onDelete }: AccountListProps = $props();

	function cardColor(account: AccountListProps['accounts'][number]) {
		return account.cardColor ?? account.bank?.color ?? '#123a63';
	}

	function cardDigits(account: AccountListProps['accounts'][number]) {
		return account.cardLastFourDigits ?? '••••';
	}

	function creditUsagePercent(account: AccountListProps['accounts'][number]) {
		if (!account.creditLimitCents || account.creditLimitCents <= 0) return 0;
		return Math.min(Math.round((account.balanceCents / account.creditLimitCents) * 100), 100);
	}
</script>

<section class="overflow-hidden rounded-lg border border-outline bg-surface shadow-sm">
	<div class="flex flex-col gap-4 border-b border-outline px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-lg font-bold text-on-surface">Cuentas</h2>
			<p class="mt-1 text-sm text-on-surface-muted">Lugares donde existe dinero real disponible.</p>
		</div>
		<ActionButton type="button" onclick={onCreate}><PlusIcon />Nueva cuenta</ActionButton>
	</div>

	<div class="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
		{#each accounts as account (account.id)}
			<article class="rounded-lg border border-outline bg-background p-3 shadow-xs">
				{#if account.type === 'debit'}
					<div
						class="rounded-md border border-outline bg-surface p-4 shadow-xs"
						style={`border-top: 4px solid ${cardColor(account)}`}
					>
						<div class="flex items-start justify-between gap-3">
							<div class="min-w-0">
								<p class="truncate text-xs font-bold text-on-surface-muted">{account.bank?.alias ?? 'Débito'}</p>
								<h3 class="mt-1 truncate text-base font-bold text-on-surface">{getAccountDisplayName(account)}</h3>
							</div>
							<span class="grid size-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
								<LandmarkIcon class="size-4" />
							</span>
						</div>

						<div class="mt-4 grid grid-cols-3 gap-3">
							<div>
								<p class="text-xs font-bold text-on-surface-muted">Saldo</p>
								<p class="mt-1 truncate text-sm font-bold text-on-surface">{formatAccountBalance(account.balanceCents)}</p>
							</div>
							<div>
								<p class="text-xs font-bold text-on-surface-muted">Tarjeta</p>
								<p class="mt-1 truncate font-mono text-sm font-bold tracking-[0.08em] text-on-surface">•••• {cardDigits(account)}</p>
							</div>
							<div>
								<p class="text-xs font-bold text-on-surface-muted">Tipo</p>
								<p class="mt-1 truncate text-sm font-bold text-on-surface">Débito</p>
							</div>
						</div>

						<div class="mt-4 rounded-md bg-surface-subtle px-2 py-1.5 text-xs font-semibold text-on-surface-variant">
							{account.bank?.name ?? 'Banco sin asignar'}
						</div>
					</div>
				{:else if account.type === 'credit'}
					<div
						class="rounded-md border border-outline bg-surface p-4 shadow-xs"
						style={`border-top: 4px solid ${cardColor(account)}`}
					>
						<div class="flex items-start justify-between gap-3">
							<div class="min-w-0">
								<p class="truncate text-xs font-bold text-on-surface-muted">{account.bank?.alias ?? 'Crédito'}</p>
								<h3 class="mt-1 truncate text-base font-bold text-on-surface">{getAccountDisplayName(account)}</h3>
							</div>
							<span class="grid size-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
								<CreditCardIcon class="size-4" />
							</span>
						</div>

						<div class="mt-4 grid grid-cols-3 gap-3">
							<div>
								<p class="text-xs font-bold text-on-surface-muted">Saldo</p>
								<p class="mt-1 truncate text-sm font-bold text-on-surface">{formatAccountBalance(account.balanceCents)}</p>
							</div>
							<div>
								<p class="text-xs font-bold text-on-surface-muted">Disponible</p>
								<p class="mt-1 truncate text-sm font-bold text-primary">{formatAccountBalance(getCreditAvailableCents(account))}</p>
							</div>
							<div>
								<p class="text-xs font-bold text-on-surface-muted">Límite</p>
								<p class="mt-1 truncate text-sm font-bold text-on-surface">{formatAccountBalance(account.creditLimitCents ?? 0)}</p>
							</div>
						</div>

						<div class="mt-4">
							<div class="flex items-center justify-between gap-3">
								<p class="text-xs font-bold text-on-surface-muted">Uso de crédito</p>
								<p class="text-xs font-bold text-on-surface-variant">{creditUsagePercent(account)}%</p>
							</div>
							<div class="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
								<div class="h-full rounded-full" style={`width: ${creditUsagePercent(account)}%; background-color: ${cardColor(account)}`}></div>
							</div>
						</div>

						<div class="mt-4 grid grid-cols-3 gap-2 text-xs">
							<p class="rounded-md bg-surface-subtle px-2 py-1.5 font-semibold text-on-surface-variant">Corte · Día {account.statementDay ?? '-'}</p>
							<p class="rounded-md bg-surface-subtle px-2 py-1.5 font-semibold text-on-surface-variant">Pago · Día {account.paymentDueDay ?? '-'}</p>
							<p class="rounded-md px-2 py-1.5 text-center font-bold {account.isActive ? 'bg-secondary text-on-secondary' : 'bg-surface-muted text-on-surface-muted'}">
								{account.isActive ? 'Activa' : 'Inactiva'}
							</p>
						</div>
					</div>
				{:else}
					<div class="rounded-md border border-outline bg-surface-subtle p-4">
						<div class="flex items-start justify-between gap-3">
							<div class="min-w-0">
								<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Efectivo</p>
								<h3 class="mt-1 truncate text-base font-bold text-on-surface">{getAccountDisplayName(account)}</h3>
							</div>
							<span class="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
								<WalletIcon class="size-5" />
							</span>
						</div>
						<div class="mt-5">
							<p class="text-xs font-bold text-on-surface-muted">Saldo disponible</p>
							<p class="mt-1 truncate text-xl font-bold text-on-surface">{formatAccountBalance(account.balanceCents)}</p>
						</div>
					</div>
				{/if}

				<div class="mt-3 flex items-center justify-between gap-3 px-1">
					<div class="min-w-0">
						<p class="truncate text-sm font-semibold text-on-surface">
							{getAccountTypeLabel(account.type)}{#if account.bank} · {account.bank.name}{/if}
						</p>
						{#if account.type === 'debit'}
							<p class="mt-0.5 text-xs text-on-surface-muted">Terminación {account.cardLastFourDigits ?? 'pendiente'}</p>
						{:else if account.type === 'credit'}
							<p class="mt-0.5 text-xs text-on-surface-muted">Disponible {formatAccountBalance(getCreditAvailableCents(account))}</p>
						{/if}
					</div>
					<div class="flex shrink-0 gap-1">
						<ActionButton type="button" variant="ghost" size="icon-sm" onclick={() => onEdit(account)} aria-label={`Editar ${getAccountDisplayName(account)}`} title="Editar"><PencilIcon /></ActionButton>
						{#if account.type !== 'credit'}
							<ActionButton type="button" variant="ghost" size="icon-sm" onclick={() => onAdjustBalance(account)} aria-label={`Ajustar saldo de ${getAccountDisplayName(account)}`} title="Ajustar saldo"><SlidersHorizontalIcon /></ActionButton>
						{/if}
						{#if account.type === 'credit'}
							<form method="POST" action="?/toggleCreditAccountActive">
								<input type="hidden" name="id" value={account.id} />
								<input type="hidden" name="isActive" value={String(!account.isActive)} />
								<ActionButton type="submit" variant="ghost" size="icon-sm" aria-label={`${account.isActive ? 'Desactivar' : 'Activar'} ${account.name}`} title={account.isActive ? 'Desactivar' : 'Activar'}><PowerIcon /></ActionButton>
							</form>
						{/if}
						{#if account.type !== 'personal'}
							<ActionButton type="button" intent="danger" size="icon-sm" onclick={() => onDelete(account)} aria-label={`Eliminar ${account.name}`} title="Eliminar"><Trash2Icon /></ActionButton>
						{/if}
					</div>
				</div>

				{#if account.adjustments.length > 0}
					<div class="mt-4 border-t border-outline px-1 pt-3">
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
