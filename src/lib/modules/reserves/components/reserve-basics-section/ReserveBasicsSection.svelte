<script lang="ts">
	import WalletCardsIcon from '@lucide/svelte/icons/wallet-cards';
	import ReserveActionForm from '../reserve-action-form/ReserveActionForm.svelte';
	import type { ReserveBasicsSectionProps } from './props';

	let { summary, debitCards, feedback = null }: ReserveBasicsSectionProps = $props();
	let showActions = $derived(debitCards !== undefined);
</script>

<div class="space-y-6">
	<section class="overflow-hidden rounded-md border border-outline bg-surface shadow-sm">
		<div class="border-b border-outline px-5 py-4">
			<h2 class="text-lg font-bold text-on-surface">Reservas por cuenta de crédito</h2>
			<p class="mt-1 text-sm text-on-surface-muted">
				El gasto de contado y el siguiente cobro MSI se dividen entre las quincenas antes del día límite de pago.
			</p>
		</div>

		{#if summary.creditCardReserves.length === 0}
			<div class="px-6 py-12 text-center">
				<p class="font-bold text-on-surface-variant">No hay cuentas de crédito con saldo por apartar</p>
				<p class="mt-1 text-sm text-on-surface-muted">Cuando una cuenta tenga contado o cobro MSI próximo, aparecerá aquí.</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full min-w-[1040px] text-left text-sm">
					<thead class="border-b border-outline bg-surface-subtle text-xs font-bold tracking-wide text-on-surface-muted uppercase">
						<tr>
							<th class="px-5 py-3">Cuenta</th>
							<th class="px-4 py-3 text-right">A cubrir</th>
							<th class="px-4 py-3 text-right">Contado</th>
							<th class="px-4 py-3 text-right">Próximo MSI</th>
							<th class="px-4 py-3">Límite</th>
							<th class="px-4 py-3 text-center">Quincenas</th>
							<th class="px-5 py-3 text-right">Apartar</th>
							{#if showActions}<th class="px-5 py-3 text-right">Acciones</th>{/if}
						</tr>
					</thead>
					<tbody class="divide-y divide-outline">
						{#each summary.creditCardReserves as reserve (reserve.cardId)}
							<tr class="align-middle">
								<td class="px-5 py-4">
									<div class="flex items-center gap-3">
										<span class="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
											<WalletCardsIcon class="size-5" />
										</span>
										<div class="min-w-0">
											<p class="truncate font-bold text-on-surface">{reserve.alias}</p>
											<p class="mt-1 truncate text-xs text-on-surface-muted">{reserve.bankName} · •••• {reserve.lastFourDigits}</p>
										</div>
									</div>
								</td>
								<td class="px-4 py-4 text-right font-semibold text-on-surface">{reserve.payableAmountLabel}</td>
								<td class="px-4 py-4 text-right text-on-surface-variant">{reserve.cashExpenseAmountLabel}</td>
								<td class="px-4 py-4 text-right text-on-surface-variant">{reserve.nextInterestFreeInstallmentsAmountLabel}</td>
								<td class="px-4 py-4 font-semibold text-on-surface">{reserve.nextDueDateLabel}</td>
								<td class="px-4 py-4 text-center font-semibold text-on-surface">{reserve.semimonthsUntilDue}</td>
								<td class="px-5 py-4 text-right text-lg font-bold text-primary">{reserve.reserveAmountLabel}</td>
								{#if showActions}
									<td class="px-5 py-4 text-right">
										<ReserveActionForm
											reserveKind="credit"
											targetId={reserve.cardId}
											targetName={reserve.alias}
											amount={reserve.reserveAmount}
											amountLabel={reserve.reserveAmountLabel}
											currencyCode={reserve.currencyCode}
											debitCards={debitCards ?? []}
											{feedback}
										/>
									</td>
								{/if}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>

	<section class="overflow-hidden rounded-md border border-outline bg-surface shadow-sm">
		<div class="border-b border-outline px-5 py-4">
			<h2 class="text-lg font-bold text-on-surface">Reservas de la quincena</h2>
			<p class="mt-1 text-sm text-on-surface-muted">
				Solo muestra gastos pendientes; cada reserva es la mitad del monto mensual.
			</p>
		</div>

		{#if summary.semimonthlyReserves.length === 0}
			<div class="px-6 py-12 text-center">
				<p class="font-bold text-on-surface-variant">No hay reservas pendientes para esta quincena</p>
				<p class="mt-1 text-sm text-on-surface-muted">Los gastos pagados aparecen solo en la reserva mensual.</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full min-w-[900px] text-left text-sm">
					<thead class="border-b border-outline bg-surface-subtle text-xs font-bold tracking-wide text-on-surface-muted uppercase">
						<tr>
							<th class="px-5 py-3">Gasto</th>
							<th class="px-4 py-3">Categoría</th>
							<th class="px-4 py-3">Frecuencia</th>
							<th class="px-4 py-3 text-right">Monto</th>
							<th class="px-4 py-3">Límite</th>
							<th class="px-5 py-3 text-right">Apartar quincena</th>
							{#if showActions}<th class="px-5 py-3 text-right">Acciones</th>{/if}
						</tr>
					</thead>
					<tbody class="divide-y divide-outline">
						{#each summary.semimonthlyReserves as reserve (reserve.expenseId)}
							<tr class="align-middle">
								<td class="px-5 py-4">
									<div class="flex items-center gap-3">
										<span class="size-3 shrink-0 rounded-full ring-2 ring-surface shadow-sm" style:background-color={reserve.categoryColor}></span>
										<p class="truncate font-bold text-on-surface">{reserve.name}</p>
									</div>
								</td>
								<td class="px-4 py-4 text-on-surface-variant">{reserve.categoryName}</td>
								<td class="px-4 py-4 text-on-surface-variant">{reserve.frequencyLabel}</td>
								<td class="px-4 py-4 text-right font-semibold text-on-surface">{reserve.amountLabel}</td>
								<td class="px-4 py-4 font-semibold text-on-surface">{reserve.nextDueDateLabel}</td>
								<td class="px-5 py-4 text-right text-lg font-bold text-primary">{reserve.reserveAmountLabel}</td>
								{#if showActions}
									<td class="px-5 py-4 text-right">
										<ReserveActionForm
											reserveKind="semimonthly"
											targetId={reserve.expenseId}
											targetName={reserve.name}
											amount={reserve.reserveAmount}
											amountLabel={reserve.reserveAmountLabel}
											currencyCode={reserve.currencyCode}
											debitCards={debitCards ?? []}
											{feedback}
										/>
									</td>
								{/if}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>

	<section class="overflow-hidden rounded-md border border-outline bg-surface shadow-sm">
		<div class="border-b border-outline px-5 py-4">
			<h2 class="text-lg font-bold text-on-surface">Reservas del mes</h2>
			<p class="mt-1 text-sm text-on-surface-muted">
				Muestra el total mensual de cada gasto y si el ciclo actual está pendiente o pagado.
			</p>
		</div>

		{#if summary.reserves.length === 0}
			<div class="px-6 py-12 text-center">
				<p class="font-bold text-on-surface-variant">Aún no hay gastos activos</p>
				<p class="mt-1 text-sm text-on-surface-muted">Registra gastos en Finanzas para ver tu reserva mensual.</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full min-w-[1000px] text-left text-sm">
					<thead class="border-b border-outline bg-surface-subtle text-xs font-bold tracking-wide text-on-surface-muted uppercase">
						<tr>
							<th class="px-5 py-3">Gasto</th>
							<th class="px-4 py-3">Categoría</th>
							<th class="px-4 py-3">Frecuencia</th>
							<th class="px-4 py-3">Límite</th>
							<th class="px-4 py-3">Estado</th>
							<th class="px-5 py-3 text-right">Reserva mensual</th>
							{#if showActions}<th class="px-5 py-3 text-right">Acciones</th>{/if}
						</tr>
					</thead>
					<tbody class="divide-y divide-outline">
						{#each summary.reserves as reserve (reserve.expenseId)}
							<tr class="align-middle">
								<td class="px-5 py-4">
									<div class="flex items-center gap-3">
										<span class="size-3 shrink-0 rounded-full ring-2 ring-surface shadow-sm" style:background-color={reserve.categoryColor}></span>
										<p class="truncate font-bold text-on-surface">{reserve.name}</p>
									</div>
								</td>
								<td class="px-4 py-4 text-on-surface-variant">{reserve.categoryName}</td>
								<td class="px-4 py-4 text-on-surface-variant">{reserve.frequencyLabel}</td>
								<td class="px-4 py-4 font-semibold text-on-surface">{reserve.nextDueDateLabel}</td>
								<td class="px-4 py-4">
									<span class="rounded-full px-2.5 py-1 text-xs font-bold {reserve.status === 'paid' ? 'bg-secondary/10 text-secondary' : 'bg-tertiary/10 text-tertiary'}">
										{reserve.statusLabel}
									</span>
								</td>
								<td class="px-5 py-4 text-right text-lg font-bold text-on-surface">{reserve.monthlyReserveAmountLabel}</td>
								{#if showActions}
									<td class="px-5 py-4 text-right">
										<ReserveActionForm
											reserveKind="monthly"
											targetId={reserve.expenseId}
											targetName={reserve.name}
											amount={reserve.monthlyReserveAmount}
											amountLabel={reserve.monthlyReserveAmountLabel}
											currencyCode={reserve.currencyCode}
											debitCards={debitCards ?? []}
											{feedback}
										/>
									</td>
								{/if}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
</div>
