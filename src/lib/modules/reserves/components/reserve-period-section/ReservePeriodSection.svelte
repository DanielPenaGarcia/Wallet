<script lang="ts">
	import WalletCardsIcon from '@lucide/svelte/icons/wallet-cards';
	import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
	import type { ReservePeriodSectionProps } from './props';

	type ReservePeriodRow = {
		id: string;
		name: string;
		detail: string;
		dueDateLabel: string;
		amount: number;
		amountLabel: string;
		reservedAmount: number;
		reservedAmountLabel: string;
		currencyCode: string;
		categoryColor?: string;
		type: 'credit' | 'expense';
	};

	let { summary, period }: ReservePeriodSectionProps = $props();
	let periodLabel = $derived(
		period === 'weekly' ? 'semana' : period === 'semimonthly' ? 'quincena' : 'mes'
	);
	let periodTitle = $derived(
		period === 'weekly'
			? 'Apartados por semana'
			: period === 'semimonthly'
				? 'Apartados por quincena'
				: 'Apartados por mes'
	);

	function creditAmount(reserve: (typeof summary.creditCardReserves)[number]) {
		if (period === 'weekly') return Math.ceil(reserve.reserveAmount / 2);
		if (period === 'monthly') return reserve.payableAmount;
		return reserve.reserveAmount;
	}

	function expenseAmount(reserve: (typeof summary.reserves)[number]) {
		if (period === 'weekly') return Math.ceil(reserve.monthlyReserveAmount / 4);
		if (period === 'monthly') return reserve.monthlyReserveAmount;
		return reserve.reserveAmount;
	}

	let creditRows = $derived(
		summary.creditCardReserves
			.map((reserve): ReservePeriodRow => {
				const amount = creditAmount(reserve);
				return {
					id: `credit-${reserve.cardId}`,
					name: reserve.alias,
					detail: `${reserve.bankName} · •••• ${reserve.lastFourDigits}`,
					dueDateLabel: reserve.nextDueDateLabel,
					amount,
					amountLabel: formatCurrencyFromMinorUnits(amount, reserve.currencyCode),
					reservedAmount: reserve.reservedAmount,
					reservedAmountLabel: reserve.reservedAmountLabel,
					currencyCode: reserve.currencyCode,
					type: 'credit'
				};
			})
			.filter((row) => row.amount > 0 || row.reservedAmount > 0)
	);
	let expenseRows = $derived(
		(period === 'monthly' ? summary.reserves : summary.semimonthlyReserves)
			.map((reserve): ReservePeriodRow => {
				const amount = expenseAmount(reserve);
				return {
					id: `expense-${reserve.expenseId}`,
					name: reserve.name,
					detail: `${reserve.categoryName} · ${reserve.frequencyLabel}`,
					dueDateLabel: reserve.nextDueDateLabel,
					amount,
					amountLabel: formatCurrencyFromMinorUnits(amount, reserve.currencyCode),
					reservedAmount: period === 'monthly' ? reserve.monthlyReservedAmount : reserve.reservedAmount,
					reservedAmountLabel:
						period === 'monthly' ? reserve.monthlyReservedAmountLabel : reserve.reservedAmountLabel,
					currencyCode: reserve.currencyCode,
					categoryColor: reserve.categoryColor,
					type: 'expense'
				};
			})
			.filter((row) => row.amount > 0 || row.reservedAmount > 0)
	);
	let rows = $derived([...creditRows, ...expenseRows].sort((left, right) => right.amount - left.amount));
</script>

<section class="overflow-hidden rounded-md border border-outline bg-surface shadow-sm">
	<div class="border-b border-outline px-5 py-4">
		<h2 class="text-lg font-bold text-on-surface">{periodTitle}</h2>
		<p class="mt-1 text-sm text-on-surface-muted">Vista consolidada de cuentas de crédito y gastos activos.</p>
	</div>

	{#if rows.length === 0}
		<div class="px-6 py-12 text-center">
			<p class="font-bold text-on-surface-variant">No hay apartados para esta vista</p>
			<p class="mt-1 text-sm text-on-surface-muted">Cuando haya importes pendientes aparecerán aquí.</p>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full min-w-[760px] text-left text-sm">
				<thead class="border-b border-outline bg-surface-subtle text-xs font-bold tracking-wide text-on-surface-muted uppercase">
					<tr>
						<th class="px-5 py-3">Apartado</th>
						<th class="px-4 py-3">Detalle</th>
						<th class="px-4 py-3">Límite</th>
						<th class="px-5 py-3 text-right">Por {periodLabel}</th>
						<th class="px-5 py-3 text-right">Apartado</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-outline">
					{#each rows as row (row.id)}
						<tr class="align-middle">
							<td class="px-5 py-4">
								<div class="flex items-center gap-3">
									{#if row.type === 'credit'}
										<span class="grid size-9 shrink-0 place-items-center rounded-md bg-primary-container text-primary">
											<WalletCardsIcon class="size-5" />
										</span>
									{:else}
										<span class="size-3 shrink-0 rounded-full ring-2 ring-surface shadow-sm" style:background-color={row.categoryColor}></span>
									{/if}
									<p class="truncate font-bold text-on-surface">{row.name}</p>
								</div>
							</td>
							<td class="px-4 py-4 text-on-surface-variant">{row.detail}</td>
							<td class="px-4 py-4 font-semibold text-on-surface-variant">{row.dueDateLabel}</td>
							<td class="px-5 py-4 text-right text-lg font-bold text-primary">{row.amountLabel}</td>
							<td class="px-5 py-4 text-right font-semibold text-on-surface-variant">{row.reservedAmountLabel}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>
