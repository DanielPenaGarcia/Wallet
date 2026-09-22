<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { Button } from '$lib/components/ui/button';
	import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
	import { formatIsoDate } from '$lib/shared/utils/format-iso-date';
	import type { LoanListProps } from './props';

	let { loans }: LoanListProps = $props();

	function statusLabel(outstandingAmountCents: number) {
		return outstandingAmountCents === 0 ? 'Liquidado' : 'Activo';
	}
</script>

{#if loans.length === 0}
	<div class="rounded-lg border border-outline bg-surface px-6 py-10 text-center shadow-sm">
		<p class="font-bold text-on-surface-variant">Sin préstamos registrados</p>
		<p class="mt-1 text-sm text-on-surface-muted">Registra un préstamo para ver su calendario y movimientos asociados.</p>
	</div>
{:else}
	<div class="grid gap-4 lg:grid-cols-2">
		{#each loans as loan (loan.id)}
			<article class="rounded-lg border border-outline bg-surface p-5 shadow-sm">
				<div class="flex items-start justify-between gap-4">
					<div class="min-w-0">
						<p class="text-xs font-bold tracking-[0.12em] text-primary uppercase">{loan.direction === 'borrowed' ? 'Por pagar' : 'Por cobrar'}</p>
						<h3 class="mt-1 truncate text-lg font-bold text-on-surface">{loan.name}</h3>
						<p class="mt-1 truncate text-sm text-on-surface-muted">{loan.counterpartyName}</p>
					</div>
					<span class="rounded-full px-2.5 py-1 text-xs font-bold {loan.outstandingAmountCents === 0 ? 'bg-secondary/10 text-secondary' : 'bg-primary-container text-primary'}">{statusLabel(loan.outstandingAmountCents)}</span>
				</div>
				<div class="mt-5 grid grid-cols-2 gap-3">
					<div>
						<p class="text-xs font-bold text-on-surface-muted">Principal</p>
						<p class="mt-1 font-bold text-on-surface">{formatCurrencyFromMinorUnits(loan.principalAmountCents, loan.currencyCode)}</p>
					</div>
					<div>
						<p class="text-xs font-bold text-on-surface-muted">Total contractual</p>
						<p class="mt-1 font-bold text-on-surface">{formatCurrencyFromMinorUnits(loan.totalRepaymentCents, loan.currencyCode)}</p>
					</div>
					<div>
						<p class="text-xs font-bold text-on-surface-muted">Pendiente</p>
						<p class="mt-1 font-bold text-on-surface">{formatCurrencyFromMinorUnits(loan.outstandingAmountCents, loan.currencyCode)}</p>
					</div>
					<div>
						<p class="text-xs font-bold text-on-surface-muted">Próxima fecha</p>
						<p class="mt-1 font-bold text-on-surface">{formatIsoDate(loan.nextInstallment?.dueDate ?? null)}</p>
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
				<div class="mt-5 flex justify-end">
					<Button href={`/prestamos/${loan.id}`} variant="outline" size="sm">
						Ver detalle
						<ArrowRightIcon />
					</Button>
				</div>
			</article>
		{/each}
	</div>
{/if}
