<script lang="ts">
	import CalendarClockIcon from '@lucide/svelte/icons/calendar-clock';
	import PiggyBankIcon from '@lucide/svelte/icons/piggy-bank';
	import WalletCardsIcon from '@lucide/svelte/icons/wallet-cards';
	import SectionHeading from '$lib/modules/navigation/components/section-heading/SectionHeading.svelte';

	let { data } = $props();
</script>

<svelte:head><title>Dashboard | Mi Cartera</title></svelte:head>

<div class="space-y-6">
	<section class="grid gap-3 md:grid-cols-3">
		<div class="rounded-md border border-slate-200 bg-white px-4 py-4 shadow-sm">
			<div class="flex items-center gap-3">
				<span class="grid size-9 place-items-center rounded-md bg-slate-100 text-slate-600">
					<PiggyBankIcon class="size-5" />
				</span>
				<div>
					<p class="text-xs font-bold tracking-wide text-slate-500 uppercase">Apartar ahora</p>
					<p class="mt-1 text-2xl font-bold text-slate-950">{data.summary.reserveTotalLabel}</p>
				</div>
			</div>
		</div>

		<div class="rounded-md border border-slate-200 bg-white px-4 py-4 shadow-sm">
			<div class="flex items-center gap-3">
				<span class="grid size-9 place-items-center rounded-md bg-slate-100 text-slate-600">
					<WalletCardsIcon class="size-5" />
				</span>
				<div>
					<p class="text-xs font-bold tracking-wide text-slate-500 uppercase">Disponible estimado</p>
					<p class="mt-1 text-2xl font-bold {data.summary.availableAfterReserve !== null && data.summary.availableAfterReserve < 0 ? 'text-red-700' : 'text-slate-950'}">
						{data.summary.availableAfterReserveLabel ?? 'Pendiente'}
					</p>
				</div>
			</div>
		</div>

		<div class="rounded-md border border-slate-200 bg-white px-4 py-4 shadow-sm">
			<div class="flex items-center gap-3">
				<span class="grid size-9 place-items-center rounded-md bg-slate-100 text-slate-600">
					<CalendarClockIcon class="size-5" />
				</span>
				<div class="min-w-0">
					<p class="text-xs font-bold tracking-wide text-slate-500 uppercase">Siguiente ingreso</p>
					<p class="mt-1 truncate text-lg font-bold text-slate-950">
						{data.summary.nextIncomeAmountLabel ?? 'Sin ingresos'}
					</p>
					<p class="truncate text-xs text-slate-500">
						{data.summary.nextIncomeDateLabel ?? 'Registra ingresos en Finanzas'}
					</p>
				</div>
			</div>
		</div>
	</section>

	<section class="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
		<div class="border-b border-slate-200 px-5 py-4">
			<h2 class="text-lg font-bold text-slate-900">Reservas por tarjeta de crédito</h2>
			<p class="mt-1 text-sm text-slate-500">
				El gasto de contado y el siguiente cobro MSI se dividen entre las quincenas antes del día límite de pago.
			</p>
		</div>

		{#if data.summary.creditCardReserves.length === 0}
			<div class="px-6 py-12 text-center">
				<p class="font-bold text-slate-700">No hay tarjetas de crédito con saldo por apartar</p>
				<p class="mt-1 text-sm text-slate-500">Cuando una tarjeta tenga contado o cobro MSI próximo, aparecerá aquí.</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full min-w-[920px] text-left text-sm">
					<thead class="border-b border-slate-200 bg-slate-50 text-xs font-bold tracking-wide text-slate-500 uppercase">
						<tr>
							<th class="px-5 py-3">Tarjeta</th>
							<th class="px-4 py-3 text-right">A cubrir</th>
							<th class="px-4 py-3 text-right">Contado</th>
							<th class="px-4 py-3 text-right">Próximo MSI</th>
							<th class="px-4 py-3">Límite</th>
							<th class="px-4 py-3 text-center">Quincenas</th>
							<th class="px-5 py-3 text-right">Apartar</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each data.summary.creditCardReserves as reserve (reserve.cardId)}
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

		{#if data.summary.semimonthlyReserves.length === 0}
			<div class="px-6 py-12 text-center">
				<p class="font-bold text-slate-700">No hay reservas pendientes para esta quincena</p>
				<p class="mt-1 text-sm text-slate-500">Los gastos pagados aparecen solo en la reserva mensual.</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full min-w-[760px] text-left text-sm">
					<thead class="border-b border-slate-200 bg-slate-50 text-xs font-bold tracking-wide text-slate-500 uppercase">
						<tr>
							<th class="px-5 py-3">Gasto</th>
							<th class="px-4 py-3">Categoría</th>
							<th class="px-4 py-3">Frecuencia</th>
							<th class="px-4 py-3 text-right">Monto</th>
							<th class="px-4 py-3">Límite</th>
							<th class="px-5 py-3 text-right">Apartar quincena</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each data.summary.semimonthlyReserves as reserve (reserve.expenseId)}
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

		{#if data.summary.reserves.length === 0}
			<div class="px-6 py-12 text-center">
				<p class="font-bold text-slate-700">Aún no hay gastos activos</p>
				<p class="mt-1 text-sm text-slate-500">Registra gastos en Finanzas para ver tu reserva mensual.</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full min-w-[860px] text-left text-sm">
					<thead class="border-b border-slate-200 bg-slate-50 text-xs font-bold tracking-wide text-slate-500 uppercase">
						<tr>
							<th class="px-5 py-3">Gasto</th>
							<th class="px-4 py-3">Categoría</th>
							<th class="px-4 py-3">Frecuencia</th>
							<th class="px-4 py-3">Límite</th>
							<th class="px-4 py-3">Estado</th>
							<th class="px-5 py-3 text-right">Reserva mensual</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each data.summary.reserves as reserve (reserve.expenseId)}
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
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
</div>
