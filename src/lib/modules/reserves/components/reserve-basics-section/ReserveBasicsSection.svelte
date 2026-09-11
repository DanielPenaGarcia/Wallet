<script lang="ts">
	import WalletCardsIcon from '@lucide/svelte/icons/wallet-cards';
	import ReserveActionForm from '../reserve-action-form/ReserveActionForm.svelte';
	import type { ReserveBasicsSectionProps } from './props';

	let { summary, debitCards, feedback = null }: ReserveBasicsSectionProps = $props();
	let showActions = $derived(debitCards !== undefined);
</script>

<div class="space-y-6">
	<section class="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
		<div class="border-b border-slate-200 px-5 py-4">
			<h2 class="text-lg font-bold text-slate-900">Reservas por cuenta de crédito</h2>
			<p class="mt-1 text-sm text-slate-500">
				El gasto de contado y el siguiente cobro MSI se dividen entre las quincenas antes del día límite de pago.
			</p>
		</div>

		{#if summary.creditCardReserves.length === 0}
			<div class="px-6 py-12 text-center">
				<p class="font-bold text-slate-700">No hay cuentas de crédito con saldo por apartar</p>
				<p class="mt-1 text-sm text-slate-500">Cuando una cuenta tenga contado o cobro MSI próximo, aparecerá aquí.</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full min-w-[1040px] text-left text-sm">
					<thead class="border-b border-slate-200 bg-slate-50 text-xs font-bold tracking-wide text-slate-500 uppercase">
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
					<tbody class="divide-y divide-slate-100">
						{#each summary.creditCardReserves as reserve (reserve.cardId)}
							<tr class="align-middle">
								<td class="px-5 py-4">
									<div class="flex items-center gap-3">
										<span class="grid size-9 shrink-0 place-items-center rounded-md bg-blue-50 text-blue-700">
											<WalletCardsIcon class="size-5" />
										</span>
										<div class="min-w-0">
											<p class="truncate font-bold text-slate-900">{reserve.alias}</p>
											<p class="mt-1 truncate text-xs text-slate-500">{reserve.bankName} · •••• {reserve.lastFourDigits}</p>
										</div>
									</div>
								</td>
								<td class="px-4 py-4 text-right font-semibold text-slate-800">{reserve.payableAmountLabel}</td>
								<td class="px-4 py-4 text-right text-slate-700">{reserve.cashExpenseAmountLabel}</td>
								<td class="px-4 py-4 text-right text-slate-700">{reserve.nextInterestFreeInstallmentsAmountLabel}</td>
								<td class="px-4 py-4 font-semibold text-slate-800">{reserve.nextDueDateLabel}</td>
								<td class="px-4 py-4 text-center font-semibold text-slate-800">{reserve.semimonthsUntilDue}</td>
								<td class="px-5 py-4 text-right text-lg font-bold text-blue-800">{reserve.reserveAmountLabel}</td>
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

	<section class="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
		<div class="border-b border-slate-200 px-5 py-4">
			<h2 class="text-lg font-bold text-slate-900">Reservas de la quincena</h2>
			<p class="mt-1 text-sm text-slate-500">
				Solo muestra gastos pendientes; cada reserva es la mitad del monto mensual.
			</p>
		</div>

		{#if summary.semimonthlyReserves.length === 0}
			<div class="px-6 py-12 text-center">
				<p class="font-bold text-slate-700">No hay reservas pendientes para esta quincena</p>
				<p class="mt-1 text-sm text-slate-500">Los gastos pagados aparecen solo en la reserva mensual.</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full min-w-[900px] text-left text-sm">
					<thead class="border-b border-slate-200 bg-slate-50 text-xs font-bold tracking-wide text-slate-500 uppercase">
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
					<tbody class="divide-y divide-slate-100">
						{#each summary.semimonthlyReserves as reserve (reserve.expenseId)}
							<tr class="align-middle">
								<td class="px-5 py-4">
									<div class="flex items-center gap-3">
										<span class="size-3 shrink-0 rounded-full ring-2 ring-white shadow-sm" style:background-color={reserve.categoryColor}></span>
										<p class="truncate font-bold text-slate-900">{reserve.name}</p>
									</div>
								</td>
								<td class="px-4 py-4 text-slate-700">{reserve.categoryName}</td>
								<td class="px-4 py-4 text-slate-700">{reserve.frequencyLabel}</td>
								<td class="px-4 py-4 text-right font-semibold text-slate-800">{reserve.amountLabel}</td>
								<td class="px-4 py-4 font-semibold text-slate-800">{reserve.nextDueDateLabel}</td>
								<td class="px-5 py-4 text-right text-lg font-bold text-blue-800">{reserve.reserveAmountLabel}</td>
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

	<section class="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
		<div class="border-b border-slate-200 px-5 py-4">
			<h2 class="text-lg font-bold text-slate-900">Reservas del mes</h2>
			<p class="mt-1 text-sm text-slate-500">
				Muestra el total mensual de cada gasto y si el ciclo actual está pendiente o pagado.
			</p>
		</div>

		{#if summary.reserves.length === 0}
			<div class="px-6 py-12 text-center">
				<p class="font-bold text-slate-700">Aún no hay gastos activos</p>
				<p class="mt-1 text-sm text-slate-500">Registra gastos en Finanzas para ver tu reserva mensual.</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full min-w-[1000px] text-left text-sm">
					<thead class="border-b border-slate-200 bg-slate-50 text-xs font-bold tracking-wide text-slate-500 uppercase">
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
					<tbody class="divide-y divide-slate-100">
						{#each summary.reserves as reserve (reserve.expenseId)}
							<tr class="align-middle">
								<td class="px-5 py-4">
									<div class="flex items-center gap-3">
										<span class="size-3 shrink-0 rounded-full ring-2 ring-white shadow-sm" style:background-color={reserve.categoryColor}></span>
										<p class="truncate font-bold text-slate-900">{reserve.name}</p>
									</div>
								</td>
								<td class="px-4 py-4 text-slate-700">{reserve.categoryName}</td>
								<td class="px-4 py-4 text-slate-700">{reserve.frequencyLabel}</td>
								<td class="px-4 py-4 font-semibold text-slate-800">{reserve.nextDueDateLabel}</td>
								<td class="px-4 py-4">
									<span class="rounded-full px-2.5 py-1 text-xs font-bold {reserve.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
										{reserve.statusLabel}
									</span>
								</td>
								<td class="px-5 py-4 text-right text-lg font-bold text-slate-900">{reserve.monthlyReserveAmountLabel}</td>
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
