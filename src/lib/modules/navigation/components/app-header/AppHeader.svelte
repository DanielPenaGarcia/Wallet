<script lang="ts">
	import CalendarDaysIcon from '@lucide/svelte/icons/calendar-days';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import type { AppHeaderProps } from './props';

	let { currentPath, nextIncomePayment, onOpenSidebar }: AppHeaderProps = $props();

	const pageLabels = [
		{ href: '/dashboard', label: 'Dashboard' },
		{ href: '/tarjetas', label: 'Tarjetas' },
		{ href: '/movimientos', label: 'Movimientos' },
		{ href: '/finanzas', label: 'Finanzas' },
		{ href: '/configuracion', label: 'Configuración' }
	] as const;

	let pageTitle = $derived(
		pageLabels.find((item) => currentPath === item.href || currentPath.startsWith(`${item.href}/`))
			?.label ?? 'Mi Cartera'
	);
</script>

<header class="sticky top-0 z-20 flex h-20 items-center border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
	<div class="flex min-w-0 items-center gap-3">
		<button
			type="button"
			class="grid size-10 shrink-0 place-items-center rounded-md border border-slate-300 text-slate-700 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none lg:hidden"
			onclick={onOpenSidebar}
			aria-label="Abrir menú principal"
		>
			<MenuIcon class="size-5" />
		</button>

		<div class="min-w-0">
			<p class="truncate text-sm font-semibold text-slate-500">Mi Cartera</p>
			<h1 class="truncate text-lg font-bold text-slate-950">{pageTitle}</h1>
		</div>
	</div>

	<div class="ml-auto flex min-w-0 justify-end pl-4">
		<div class="flex min-w-0 items-center gap-3 text-slate-700">
			<span class="grid size-9 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600">
				<CalendarDaysIcon class="size-5" />
			</span>
			<div class="min-w-0 text-right">
				<p class="truncate text-xs font-bold tracking-wide text-slate-500 uppercase">
					Siguiente pago
				</p>
				{#if nextIncomePayment}
					<p class="truncate text-sm font-bold text-slate-950">
						{nextIncomePayment.amountLabel} · {nextIncomePayment.dateLabel}
					</p>
					<p class="truncate text-xs text-slate-500">
						{nextIncomePayment.cadenceLabel}
						{#if nextIncomePayment.incomeCount > 1}
							· {nextIncomePayment.incomeCount} ingresos
						{/if}
					</p>
				{:else}
					<p class="truncate text-sm font-bold text-slate-950">Sin ingresos activos</p>
					<p class="truncate text-xs text-slate-500">Registra uno en Finanzas</p>
				{/if}
			</div>
		</div>
	</div>
</header>
