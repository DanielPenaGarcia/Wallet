<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { Button } from '$lib/components/ui/button';
	import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
	import { formatIsoDate } from '$lib/shared/utils/format-iso-date';
	import type { LoanListProps } from './props';

	let { loans }: LoanListProps = $props();

	function statusLabel(loan: LoanListProps['loans'][number]) {
		if (loan.status === 'cancelled') return 'Cancelado';
		return loan.outstandingAmountCents === 0 ? 'Liquidado' : 'Activo';
	}

	function statusClass(loan: LoanListProps['loans'][number]) {
		if (loan.status === 'cancelled') return 'bg-surface-muted text-on-surface-muted';
		return loan.outstandingAmountCents === 0 ? 'bg-secondary/10 text-secondary' : 'bg-primary-container text-primary';
	}
</script>

{#if loans.length === 0}
	<div class="rounded-lg border border-outline bg-surface px-4 py-10 text-center shadow-sm sm:px-6">
		<p class="font-bold text-on-surface-variant">Sin préstamos registrados</p>
		<p class="mt-1 text-sm text-on-surface-muted">Registra un préstamo para ver su calendario y movimientos asociados.</p>
	</div>
{:else}
	<div class="grid gap-4 lg:grid-cols-2">
		{#each loans as loan (loan.id)}
			<article class="rounded-lg border border-outline bg-surface p-4 shadow-sm sm:p-5">
				<div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
					<div class="min-w-0">
						<p class="text-xs font-bold tracking-[0.12em] text-primary uppercase">{loan.direction === 'borrowed' ? 'Por pagar' : 'Por cobrar'}</p>
						<h3 class="mt-1 break-words text-lg font-bold text-on-surface">{loan.name}</h3>
						<p class="mt-1 break-words text-sm text-on-surface-muted">{loan.counterpartyName}</p>
					</div>
					<span class="w-fit rounded-full px-2.5 py-1 text-xs font-bold {statusClass(loan)}">{statusLabel(loan)}</span>
				</div>
				<div class="mt-5 grid gap-3 sm:grid-cols-2">
					<div class="rounded-md bg-surface-subtle p-3">
						<p class="text-xs font-bold text-on-surface-muted">Principal</p>
						<p class="mt-1 break-words font-bold text-on-surface">{formatCurrencyFromMinorUnits(loan.principalAmountCents, loan.currencyCode)}</p>
					</div>
					<div class="rounded-md bg-surface-subtle p-3">
						<p class="text-xs font-bold text-on-surface-muted">Total contractual</p>
						<p class="mt-1 break-words font-bold text-on-surface">{formatCurrencyFromMinorUnits(loan.totalRepaymentCents, loan.currencyCode)}</p>
					</div>
					<div class="rounded-md bg-surface-subtle p-3">
						<p class="text-xs font-bold text-on-surface-muted">Pendiente</p>
						<p class="mt-1 break-words font-bold text-on-surface">{formatCurrencyFromMinorUnits(loan.outstandingAmountCents, loan.currencyCode)}</p>
					</div>
					<div class="rounded-md bg-surface-subtle p-3">
						<p class="text-xs font-bold text-on-surface-muted">Próxima fecha</p>
						<p class="mt-1 break-words font-bold text-on-surface">{formatIsoDate(loan.nextInstallment?.dueDate ?? null)}</p>
					</div>
				</div>
				<div class="mt-5">
					<div class="flex items-center justify-between gap-3">
						<p class="text-xs font-bold text-on-surface-muted">Progreso</p>
						<p class="text-xs font-bold text-on-surface-variant">{loan.progressPercentage}%</p>
					</div>
					<div class="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
						<div class="h-full rounded-full bg-primary" style:width={`${loan.progressPercentage}%`}></div>
					</div>
				</div>
				<div class="mt-5 grid sm:flex sm:justify-end">
					<Button href={`/prestamos/${loan.id}`} variant="outline" size="sm" class="w-full sm:w-auto">
						Ver detalle
						<ArrowRightIcon />
					</Button>
				</div>
			</article>
		{/each}
	</div>
{/if}
