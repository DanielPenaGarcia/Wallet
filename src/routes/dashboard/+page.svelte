<script lang="ts">
	import CalendarClockIcon from '@lucide/svelte/icons/calendar-clock';
	import PiggyBankIcon from '@lucide/svelte/icons/piggy-bank';
	import WalletCardsIcon from '@lucide/svelte/icons/wallet-cards';
	import ReserveBasicsSection from '$lib/modules/reserves/components/reserve-basics-section/ReserveBasicsSection.svelte';

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
					<p class="mt-1 text-xs text-slate-500">Después de {data.summary.debitBalanceTotalLabel} en débito</p>
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

	<ReserveBasicsSection summary={data.summary} />
</div>
