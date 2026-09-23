<script lang="ts">
	import AlertTriangleIcon from '@lucide/svelte/icons/alert-triangle';
	import CalendarCheckIcon from '@lucide/svelte/icons/calendar-check';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import LandmarkIcon from '@lucide/svelte/icons/landmark';
	import PiggyBankIcon from '@lucide/svelte/icons/piggy-bank';
	import TargetIcon from '@lucide/svelte/icons/target';
	import WalletIcon from '@lucide/svelte/icons/wallet';
	import SectionHeading from '$lib/modules/navigation/components/section-heading/SectionHeading.svelte';
	import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
	import { formatIsoDate } from '$lib/shared/utils/format-iso-date';
	import type { PlanningObligation } from '../../types/next-income-planning.types';
	import PlanningAmountRow from '../planning-amount-row/PlanningAmountRow.svelte';
	import PlanningMetricCard from '../planning-metric-card/PlanningMetricCard.svelte';
	import type { PlanningViewProps } from './props';

	let { planning }: PlanningViewProps = $props();

	function money(amountCents: number) {
		return formatCurrencyFromMinorUnits(amountCents, planning.currencyCode);
	}

	function obligationAccount(obligation: PlanningObligation) {
		if (obligation.accountName) return obligation.accountName;
		if (obligation.kind === 'loan_payment') return 'Sin cuenta fija';
		return 'Sin cuenta asignada';
	}

	function obligationDetail(obligation: PlanningObligation) {
		return `Existente: ${money(obligation.coveredByExistingMoneyCents)} · Apartar: ${money(obligation.reservedFromNextIncomeCents)} · Falta: ${money(obligation.uncoveredAmountCents)}`;
	}
</script>

<div class="grid gap-6">
	<SectionHeading
		eyebrow="Planificación"
		title="Próximo ingreso"
		description="Distribución sugerida entre obligaciones, pagos de tarjetas y metas."
		accent="primary"
	/>

	{#if planning.alerts.length > 0}
		<section class="grid gap-3">
			{#each planning.alerts as alert}
				<div class="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
					<AlertTriangleIcon class="mt-0.5 size-4 shrink-0" />
					<p>{alert}</p>
				</div>
			{/each}
		</section>
	{/if}

	<section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
		<PlanningMetricCard
			label="Próximo ingreso"
			value={planning.nextIncome ? money(planning.nextIncome.amountCents) : money(0)}
			description={planning.nextIncome ? `${formatIsoDate(planning.nextIncome.date)} · ${planning.nextIncome.titles.join(', ')}` : 'Sin ingreso activo'}
		>
			{#snippet icon()}<CalendarCheckIcon class="size-5 text-primary" />{/snippet}
		</PlanningMetricCard>
		<PlanningMetricCard
			label="Debes apartar"
			value={money(planning.nextIncomeReservedForObligationsCents)}
			description={`${money(planning.existingMoneyUsedForObligationsCents)} ya cubierto con dinero existente`}
		>
			{#snippet icon()}<LandmarkIcon class="size-5 text-primary" />{/snippet}
		</PlanningMetricCard>
		<PlanningMetricCard
			label="Recomendado para metas"
			value={money(planning.recommendedGoalAllocationCents)}
			description={`${money(planning.nextIncomeAvailableForGoalsCents)} disponible después de apartar`}
		>
			{#snippet icon()}<TargetIcon class="size-5 text-primary" />{/snippet}
		</PlanningMetricCard>
		<PlanningMetricCard
			label="Te quedará libre"
			value={money(planning.remainingNextIncomeCents)}
			description={`${money(planning.uncoveredCashObligationsCents)} de obligaciones sin cubrir`}
		>
			{#snippet icon()}<PiggyBankIcon class="size-5 text-primary" />{/snippet}
		</PlanningMetricCard>
	</section>

	<section class="rounded-lg border border-outline bg-surface shadow-sm">
		<div class="border-b border-outline px-5 py-4">
			<h2 class="font-bold text-on-surface">Periodo planificado</h2>
			<p class="mt-1 text-sm text-on-surface-muted">
				{#if planning.period.startDate}
					{formatIsoDate(planning.period.startDate)} - {planning.period.endDate ? formatIsoDate(planning.period.endDate) : 'horizonte provisional'}
				{:else}
					Sin periodo disponible
				{/if}
			</p>
		</div>
		<div class="grid gap-5 p-5 xl:grid-cols-[1.2fr_0.8fr]">
			<div class="grid gap-3">
				<div class="rounded-md bg-surface-subtle p-4 text-sm text-on-surface-muted">
					Dinero real existente: <span class="font-bold text-on-surface">{money(planning.existingRealMoneyCents)}</span>
				</div>
				<p class="text-sm font-bold text-on-surface">Obligaciones que requieren dinero real</p>
				{#if planning.cashObligations.length > 0}
					{#each planning.cashObligations as obligation (obligation.id)}
						<PlanningAmountRow
							title={obligation.title}
							meta={`${formatIsoDate(obligation.date)} · ${obligationAccount(obligation)}`}
							amount={money(obligation.amountCents)}
							detail={obligationDetail(obligation)}
						/>
					{/each}
				{:else}
					<p class="rounded-md bg-surface-subtle p-4 text-sm text-on-surface-muted">Sin obligaciones de efectivo en el periodo.</p>
				{/if}
			</div>

			<div class="grid gap-3">
				<p class="text-sm font-bold text-on-surface">Pagos de tarjetas</p>
				{#if planning.statementPayments.length > 0}
					{#each planning.statementPayments as payment (payment.id)}
						<PlanningAmountRow
							title={payment.title}
							meta={`${formatIsoDate(payment.date)} · ${payment.accountName}`}
							amount={money(payment.amountCents)}
							detail={obligationDetail(payment)}
						/>
					{/each}
				{:else}
					<p class="rounded-md bg-surface-subtle p-4 text-sm text-on-surface-muted">Sin pagos de tarjeta exigibles en el periodo.</p>
				{/if}
			</div>
		</div>
	</section>

	{#if planning.unassignedRecurringExpenses.length > 0}
		<section class="rounded-lg border border-outline bg-surface shadow-sm">
			<div class="flex items-center gap-2 border-b border-outline px-5 py-4">
				<WalletIcon class="size-5 text-primary" />
				<h2 class="font-bold text-on-surface">Requieren cuenta de pago</h2>
			</div>
			<div class="grid gap-3 p-5">
				{#each planning.unassignedRecurringExpenses as expense (expense.id)}
					<PlanningAmountRow
						title={expense.title}
						meta={`${formatIsoDate(expense.date)} · ${obligationAccount(expense)}`}
						amount={money(expense.amountCents)}
						detail="No se incluye en Debes apartar hasta asignar cuenta"
					/>
				{/each}
			</div>
		</section>
	{/if}

	<section class="grid gap-6 xl:grid-cols-2">
		<div class="rounded-lg border border-outline bg-surface shadow-sm">
			<div class="flex items-center gap-2 border-b border-outline px-5 py-4">
				<CreditCardIcon class="size-5 text-primary" />
				<h2 class="font-bold text-on-surface">Consumo esperado con crédito</h2>
			</div>
			<div class="grid gap-3 p-5">
				{#if planning.creditConsumptions.length > 0}
					{#each planning.creditConsumptions as consumption (consumption.id)}
						<PlanningAmountRow
							title={consumption.title}
							meta={`${formatIsoDate(consumption.date)} · ${obligationAccount(consumption)}`}
							amount={money(consumption.amountCents)}
						/>
					{/each}
				{:else}
					<p class="text-sm text-on-surface-muted">Sin consumos recurrentes esperados con crédito.</p>
				{/if}
			</div>
		</div>

		<div class="rounded-lg border border-outline bg-surface shadow-sm">
			<div class="flex items-center gap-2 border-b border-outline px-5 py-4">
				<TargetIcon class="size-5 text-primary" />
				<h2 class="font-bold text-on-surface">Distribución hacia metas</h2>
			</div>
			<div class="grid gap-3 p-5">
				{#if planning.goalAllocations.length > 0}
					{#each planning.goalAllocations as goal (goal.goalId)}
						<div class="rounded-md bg-surface-subtle p-4">
							<div class="flex items-center justify-between gap-3">
								<p class="font-bold text-on-surface">{goal.name}</p>
								<p class="text-sm font-bold text-primary">{goal.distributionPercentage}%</p>
							</div>
							<p class="mt-2 text-lg font-bold text-on-surface">{money(goal.allocatedAmountCents)}</p>
							<p class="mt-1 text-xs text-on-surface-muted">Restante de meta: {money(goal.remainingAmountCents)}</p>
						</div>
					{/each}
				{:else}
					<p class="text-sm text-on-surface-muted">No hay metas activas con distribución.</p>
				{/if}
			</div>
		</div>
	</section>
</div>
