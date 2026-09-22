<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import LandmarkIcon from '@lucide/svelte/icons/landmark';
	import ListIcon from '@lucide/svelte/icons/list';
	import RepeatIcon from '@lucide/svelte/icons/repeat';
	import TargetIcon from '@lucide/svelte/icons/target';
	import WalletCardsIcon from '@lucide/svelte/icons/wallet-cards';
	import { InfoPopover } from '$lib/components/ui/info-popover';
	import SectionHeading from '$lib/modules/navigation/components/section-heading/SectionHeading.svelte';
	import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
	import { formatIsoDate } from '$lib/shared/utils/format-iso-date';
	import type { DashboardViewProps } from './props';

	let { summary }: DashboardViewProps = $props();

	const movementLabels = {
		income: 'Ingreso',
		expense: 'Gasto',
		transfer: 'Transferencia',
		credit_purchase: 'Compra credito',
		credit_card_payment: 'Pago tarjeta',
		adjustment: 'Ajuste'
	};

	function money(amountCents: number, currencyCode = summary.currencyCode) {
		return formatCurrencyFromMinorUnits(amountCents, currencyCode);
	}

	function movementTone(type: keyof typeof movementLabels) {
		if (type === 'income') return 'text-secondary';
		if (type === 'expense' || type === 'credit_purchase') return 'text-destructive';
		return 'text-on-surface-variant';
	}
</script>

<div class="grid gap-6">
	<SectionHeading
		eyebrow="Inicio"
		title="Dashboard"
		description="Resumen actual de dinero real, deuda, actividad reciente y proximos compromisos."
		accent="primary"
	/>

	<section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
		<div class="rounded-lg border border-outline bg-surface p-5 shadow-sm">
			<div class="flex items-start justify-between gap-3">
				<div>
					<p class="text-sm font-semibold text-on-surface-muted">Dinero disponible</p>
					<p class="mt-2 text-2xl font-bold text-on-surface">{money(summary.current.availableMoneyCents)}</p>
				</div>
				<LandmarkIcon class="size-5 text-primary" />
			</div>
			<p class="mt-3 text-xs text-on-surface-muted">{summary.current.realMoneyAccountCount} cuentas con dinero real</p>
		</div>

		<div class="rounded-lg border border-outline bg-surface p-5 shadow-sm">
			<div class="flex items-start justify-between gap-3">
				<div>
					<div class="flex items-center gap-1.5">
						<p class="text-sm font-semibold text-on-surface-muted">Credito consumido</p>
						<InfoPopover
							title="Credito consumido"
							description="Suma la deuda actual de tarjetas. No incluye credito disponible como dinero real."
						/>
					</div>
					<p class="mt-2 text-2xl font-bold text-on-surface">{money(summary.current.consumedCreditCents)}</p>
				</div>
				<CreditCardIcon class="size-5 text-primary" />
			</div>
			<p class="mt-3 text-xs text-on-surface-muted">{summary.current.creditAccountCount} tarjetas registradas</p>
		</div>

		<div class="rounded-lg border border-outline bg-surface p-5 shadow-sm">
			<p class="text-sm font-semibold text-on-surface-muted">Ingresos del mes</p>
			<p class="mt-2 text-2xl font-bold text-on-surface">{money(summary.monthlyActivity.incomeCents)}</p>
			<p class="mt-3 text-xs text-on-surface-muted">{formatIsoDate(summary.monthlyActivity.monthStartsOn)} - {formatIsoDate(summary.monthlyActivity.monthEndsOn)}</p>
		</div>

		<div class="rounded-lg border border-outline bg-surface p-5 shadow-sm">
			<div class="flex items-center gap-1.5">
				<p class="text-sm font-semibold text-on-surface-muted">Gasto del mes</p>
				<InfoPopover
					title="Gasto del mes"
					description="Incluye gastos pagados y compras con credito. Los pagos a tarjeta se muestran aparte para evitar doble conteo."
				/>
			</div>
			<p class="mt-2 text-2xl font-bold text-on-surface">{money(summary.monthlyActivity.paidExpenseCents + summary.monthlyActivity.creditPurchaseCents)}</p>
			<p class="mt-3 text-xs text-on-surface-muted">Pagos a tarjeta: {money(summary.monthlyActivity.creditCardPaymentCents)}</p>
		</div>
	</section>

	<section class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
		<div class="rounded-lg border border-outline bg-surface shadow-sm">
			<div class="flex items-center justify-between gap-3 border-b border-outline px-5 py-4">
				<div class="flex items-center gap-2">
					<RepeatIcon class="size-5 text-primary" />
					<h2 class="font-bold text-on-surface">Proximos recurrentes</h2>
				</div>
				<a class="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover" href="/recurrentes">
					Ver recurrentes
					<ArrowRightIcon class="size-4" />
				</a>
			</div>
			<div class="grid gap-4 p-5 lg:grid-cols-2">
				<div class="rounded-md bg-surface-subtle p-4">
					<p class="text-xs font-bold tracking-[0.12em] text-primary uppercase">Ingreso esperado</p>
					{#if summary.upcomingIncome}
						<p class="mt-2 font-bold text-on-surface">{summary.upcomingIncome.title}</p>
						<p class="mt-1 text-sm text-on-surface-muted">{formatIsoDate(summary.upcomingIncome.date)}</p>
						<p class="mt-3 text-xl font-bold text-on-surface">{money(summary.upcomingIncome.expectedAmountCents)}</p>
					{:else}
						<p class="mt-2 text-sm text-on-surface-muted">No hay ingresos activos configurados.</p>
					{/if}
				</div>
				<div class="grid gap-3">
					{#if summary.upcomingExpenses.length > 0}
						{#each summary.upcomingExpenses as expense (expense.id)}
							<div class="flex items-center justify-between gap-3 rounded-md bg-surface-subtle p-3">
								<div class="min-w-0">
									<div class="flex items-center gap-2">
										<span class="size-2.5 shrink-0 rounded-full" style:background-color={expense.categoryColor}></span>
										<p class="truncate text-sm font-bold text-on-surface">{expense.name}</p>
									</div>
									<p class="mt-1 truncate text-xs text-on-surface-muted">{expense.categoryName} · {formatIsoDate(expense.date)}</p>
								</div>
								<p class="shrink-0 text-sm font-bold text-on-surface">{money(expense.amountCents)}</p>
							</div>
						{/each}
					{:else}
						<p class="text-sm text-on-surface-muted">No hay gastos recurrentes activos.</p>
					{/if}
				</div>
			</div>
		</div>

		<div class="rounded-lg border border-outline bg-surface shadow-sm">
			<div class="flex items-center justify-between gap-3 border-b border-outline px-5 py-4">
				<div class="flex items-center gap-2">
					<ListIcon class="size-5 text-primary" />
					<h2 class="font-bold text-on-surface">Actividad reciente</h2>
				</div>
				<a class="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover" href="/movimientos">
					Ver movimientos
					<ArrowRightIcon class="size-4" />
				</a>
			</div>
			<div class="grid gap-3 p-5">
				{#if summary.recentMovements.length > 0}
					{#each summary.recentMovements as movement (movement.id)}
						<div class="flex items-center justify-between gap-3">
							<div class="min-w-0">
								<p class="truncate text-sm font-bold text-on-surface">{movement.title}</p>
								<p class="mt-1 text-xs text-on-surface-muted">
									{movementLabels[movement.type]} · {formatIsoDate(movement.occurredAt)}{movement.accountLabel ? ` · ${movement.accountLabel}` : ''}
								</p>
							</div>
							<p class="shrink-0 text-sm font-bold {movementTone(movement.type)}">{money(movement.amountCents, movement.currencyCode)}</p>
						</div>
					{/each}
				{:else}
					<p class="text-sm text-on-surface-muted">Todavia no hay movimientos registrados.</p>
				{/if}
			</div>
		</div>
	</section>

	<section class="grid gap-6 xl:grid-cols-2">
		<div class="rounded-lg border border-outline bg-surface shadow-sm">
			<div class="flex items-center justify-between gap-3 border-b border-outline px-5 py-4">
				<div class="flex items-center gap-2">
					<WalletCardsIcon class="size-5 text-primary" />
					<h2 class="font-bold text-on-surface">Tarjetas de credito</h2>
				</div>
				<a class="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover" href="/cuentas">
					Ver cuentas
					<ArrowRightIcon class="size-4" />
				</a>
			</div>
			<div class="grid gap-3 p-5">
				{#if summary.creditCards.length > 0}
					{#each summary.creditCards as card (card.accountId)}
						<a href={`/cuentas/${card.accountId}`} class="block rounded-md bg-surface-subtle p-4 transition hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">
							<div class="flex items-start justify-between gap-3">
								<div class="min-w-0">
									<p class="truncate font-bold text-on-surface">{card.name}</p>
									<p class="mt-1 truncate text-xs text-on-surface-muted">{card.bankName}{card.cardLastFourDigits ? ` · **** ${card.cardLastFourDigits}` : ''}</p>
								</div>
								<span class="rounded-full px-2 py-1 text-xs font-bold {card.isActive ? 'bg-primary-container text-primary' : 'bg-surface-pressed text-on-surface-muted'}">{card.isActive ? 'Activa' : 'Inactiva'}</span>
							</div>
							<div class="mt-4 grid gap-3 sm:grid-cols-2">
								<p class="text-sm text-on-surface-muted">Consumido <span class="font-bold text-on-surface">{money(card.consumedBalanceCents)}</span></p>
								<p class="text-sm text-on-surface-muted">Disponible <span class="font-bold text-on-surface">{money(card.availableCreditCents)}</span></p>
								<p class="text-sm text-on-surface-muted">Exigible <span class="font-bold text-on-surface">{money(card.statementOutstandingCents)}</span></p>
								<p class="text-sm text-on-surface-muted">Vence <span class="font-bold text-on-surface">{formatIsoDate(card.paymentDueDate)}</span></p>
							</div>
						</a>
					{/each}
				{:else}
					<p class="text-sm text-on-surface-muted">No hay tarjetas de credito registradas.</p>
				{/if}
			</div>
		</div>

		<div class="rounded-lg border border-outline bg-surface shadow-sm">
			<div class="flex items-center justify-between gap-3 border-b border-outline px-5 py-4">
				<div class="flex items-center gap-2">
					<TargetIcon class="size-5 text-primary" />
					<h2 class="font-bold text-on-surface">Metas activas</h2>
				</div>
				<a class="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover" href="/metas">
					Ver metas
					<ArrowRightIcon class="size-4" />
				</a>
			</div>
			<div class="grid gap-4 p-5">
				{#if summary.goals.length > 0}
					{#each summary.goals as goal (goal.id)}
						<div>
							<div class="flex items-center justify-between gap-3">
								<div class="min-w-0">
									<p class="truncate font-bold text-on-surface">{goal.name}</p>
									<p class="mt-1 text-xs text-on-surface-muted">Restante: {money(goal.remainingAmountCents)}</p>
								</div>
								<p class="shrink-0 text-sm font-bold text-on-surface">{goal.progressPercentage}%</p>
							</div>
							<div class="mt-3 h-2 overflow-hidden rounded-full bg-surface-pressed">
								<div class="h-full rounded-full bg-primary" style:width={`${goal.progressPercentage}%`}></div>
							</div>
							<p class="mt-2 text-xs text-on-surface-muted">
								{#if goal.estimatedNextContributionCents && goal.estimatedContributionDate}
									Proximo aporte estimado: {money(goal.estimatedNextContributionCents)} el {formatIsoDate(goal.estimatedContributionDate)}
								{:else}
									Sin aporte estimado disponible.
								{/if}
							</p>
						</div>
					{/each}
				{:else}
					<p class="text-sm text-on-surface-muted">No hay metas activas.</p>
				{/if}
			</div>
		</div>
	</section>
</div>
