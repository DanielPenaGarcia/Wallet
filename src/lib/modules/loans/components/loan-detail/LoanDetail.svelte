<script lang="ts">
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { untrack } from 'svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
	import { formatIsoDate } from '$lib/shared/utils/format-iso-date';
	import DeleteLoanForm from '../delete-loan-form/DeleteLoanForm.svelte';
	import LoanForm from '../loan-form/LoanForm.svelte';
	import LoanSettlementForm from '../loan-settlement-form/LoanSettlementForm.svelte';
	import type { LoanDetailProps } from './props';

	let { loan, cards, movements, feedback = null }: LoanDetailProps = $props();
	let editOpen = $state(untrack(() =>
		feedback?.action === 'update-loan' &&
		feedback.targetId === loan.id &&
		Boolean(feedback.errors || feedback.message)
	));
	let deleteOpen = $state(untrack(() =>
		feedback?.action === 'delete-loan' &&
		feedback.targetId === loan.id &&
		Boolean(feedback.errors || feedback.message)
	));

	function money(amountCents: number) {
		return formatCurrencyFromMinorUnits(amountCents, loan.currencyCode);
	}

	function movementLabel(type: string) {
		if (type === 'loan_received') return 'Apertura recibida';
		if (type === 'loan_disbursement') return 'Apertura entregada';
		if (type === 'loan_payment') return 'Pago';
		if (type === 'loan_collection') return 'Cobro';
		return 'Movimiento';
	}
</script>

<div class="grid gap-6">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<Button href="/prestamos" variant="ghost" size="sm"><ArrowLeftIcon />Volver</Button>
		{#if loan.status === 'active'}
			<div class="flex flex-wrap justify-end gap-2">
				<ActionButton type="button" intent="secondary" onclick={() => (editOpen = true)}><PencilIcon />Editar</ActionButton>
				<ActionButton type="button" intent="danger" onclick={() => (deleteOpen = true)}><Trash2Icon />Eliminar</ActionButton>
				<form method="POST" action="?/cancelLoan">
					<input type="hidden" name="id" value={loan.id} />
					<ActionButton type="submit" intent="danger">Cancelar préstamo</ActionButton>
				</form>
			</div>
		{/if}
	</div>

	{#if feedback?.success}<p class="rounded-md border border-secondary/20 bg-secondary/10 px-4 py-3 text-sm font-semibold text-secondary">{feedback.success}</p>{/if}

	<section class="rounded-lg border border-outline bg-surface p-5 shadow-sm">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<p class="text-xs font-bold tracking-[0.12em] text-primary uppercase">{loan.direction === 'borrowed' ? 'Por pagar' : 'Por cobrar'}</p>
				<h1 class="mt-1 text-2xl font-bold text-on-surface">{loan.name}</h1>
				<p class="mt-1 text-sm text-on-surface-muted">{loan.counterpartyName}</p>
			</div>
			<span class="w-fit rounded-full px-2.5 py-1 text-xs font-bold {loan.status === 'active' ? 'bg-primary-container text-primary' : 'bg-surface-muted text-on-surface-muted'}">{loan.status === 'active' ? 'Activo' : 'Cancelado'}</span>
		</div>
		<div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			<div>
				<p class="text-xs font-bold text-on-surface-muted">Principal</p>
				<p class="mt-1 text-lg font-bold text-on-surface">{money(loan.principalAmountCents)}</p>
			</div>
			<div>
				<p class="text-xs font-bold text-on-surface-muted">Total contractual</p>
				<p class="mt-1 text-lg font-bold text-on-surface">{money(loan.totalRepaymentCents)}</p>
			</div>
			<div>
				<p class="text-xs font-bold text-on-surface-muted">Costo financiero</p>
				<p class="mt-1 text-lg font-bold text-on-surface">{money(loan.financingCostCents)}</p>
			</div>
			<div>
				<p class="text-xs font-bold text-on-surface-muted">Pendiente</p>
				<p class="mt-1 text-lg font-bold text-primary">{money(loan.outstandingAmountCents)}</p>
			</div>
			<div>
				<p class="text-xs font-bold text-on-surface-muted">Pagado/cobrado</p>
				<p class="mt-1 text-lg font-bold text-on-surface">{money(loan.paidAmountCents)}</p>
			</div>
			<div>
				<p class="text-xs font-bold text-on-surface-muted">Cuotas</p>
				<p class="mt-1 text-lg font-bold text-on-surface">{loan.installmentCount}</p>
			</div>
			<div>
				<p class="text-xs font-bold text-on-surface-muted">Primer pago/cobro</p>
				<p class="mt-1 text-lg font-bold text-on-surface">{formatIsoDate(loan.firstPaymentDate)}</p>
			</div>
			<div>
				<p class="text-xs font-bold text-on-surface-muted">Próximo pago/cobro</p>
				<p class="mt-1 text-lg font-bold text-on-surface">{formatIsoDate(loan.nextInstallment?.dueDate ?? null)}</p>
			</div>
		</div>
		<div class="mt-6">
			<div class="flex items-center justify-between gap-3">
				<p class="text-xs font-bold text-on-surface-muted">Progreso</p>
				<p class="text-xs font-bold text-on-surface-variant">{loan.progressPercentage}%</p>
			</div>
			<div class="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
				<div class="h-full rounded-full bg-primary" style:width={`${loan.progressPercentage}%`}></div>
			</div>
		</div>
	</section>

	<section class="rounded-lg border border-outline bg-surface shadow-sm">
		<div class="border-b border-outline px-5 py-4">
			<h2 class="font-bold text-on-surface">{loan.direction === 'borrowed' ? 'Registrar pago' : 'Registrar cobro'}</h2>
			<p class="mt-1 text-sm text-on-surface-muted">El movimiento actualizará la cuenta seleccionada y reducirá el saldo pendiente.</p>
		</div>
		<div class="p-5">
			<LoanSettlementForm {loan} {cards} {feedback} />
		</div>
	</section>

	<section class="overflow-hidden rounded-lg border border-outline bg-surface shadow-sm">
		<div class="border-b border-outline px-5 py-4">
			<h2 class="font-bold text-on-surface">Calendario de cuotas</h2>
		</div>
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-outline text-sm">
				<thead class="bg-surface-subtle text-left text-xs font-bold tracking-wide text-on-surface-muted uppercase">
					<tr>
						<th class="px-5 py-3">#</th>
						<th class="px-5 py-3">Fecha</th>
						<th class="px-5 py-3 text-right">Cuota</th>
						<th class="px-5 py-3 text-right">Cubierto</th>
						<th class="px-5 py-3 text-right">Restante</th>
						<th class="px-5 py-3">Estado</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-outline">
					{#each loan.installments as installment}
						<tr>
							<td class="px-5 py-3 font-bold text-on-surface">{installment.number}</td>
							<td class="px-5 py-3 text-on-surface-variant">{formatIsoDate(installment.dueDate)}</td>
							<td class="px-5 py-3 text-right font-semibold text-on-surface">{money(installment.amountCents)}</td>
							<td class="px-5 py-3 text-right text-on-surface-variant">{money(installment.coveredAmountCents)}</td>
							<td class="px-5 py-3 text-right text-on-surface-variant">{money(installment.remainingAmountCents)}</td>
							<td class="px-5 py-3">
								<span class="rounded-full px-2 py-1 text-xs font-bold {installment.status === 'paid' ? 'bg-secondary/10 text-secondary' : installment.status === 'partial' ? 'bg-primary-container text-primary' : 'bg-surface-muted text-on-surface-muted'}">
									{installment.status === 'paid' ? 'Pagada' : installment.status === 'partial' ? 'Parcial' : 'Pendiente'}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section class="overflow-hidden rounded-lg border border-outline bg-surface shadow-sm">
		<div class="border-b border-outline px-5 py-4">
			<h2 class="font-bold text-on-surface">Historial del préstamo</h2>
		</div>
		{#if movements.length === 0}
			<p class="p-5 text-sm text-on-surface-muted">No hay movimientos vinculados.</p>
		{:else}
			<ul class="divide-y divide-outline">
				{#each movements as movement (movement.id)}
					<li class="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
						<div class="min-w-0">
							<p class="font-bold text-on-surface">{movementLabel(movement.type)}</p>
							<p class="mt-1 truncate text-sm text-on-surface-muted">{movement.title} · {formatIsoDate(movement.occurredAt)}{movement.accountLabel ? ` · ${movement.accountLabel}` : ''}</p>
						</div>
						<p class="font-bold text-on-surface">{formatCurrencyFromMinorUnits(movement.amountCents, movement.currencyCode)}</p>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>

<Dialog.Root bind:open={editOpen}>
	<Dialog.Content class="sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Editar préstamo</Dialog.Title>
			<Dialog.Description>Actualiza los términos del préstamo y su calendario.</Dialog.Description>
		</Dialog.Header>
		<LoanForm mode="edit" {loan} {cards} {feedback} onCancel={() => (editOpen = false)} />
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Eliminar {loan.name}</Dialog.Title>
			<Dialog.Description>Esta acción revierte los movimientos activos vinculados antes de borrar el préstamo.</Dialog.Description>
		</Dialog.Header>
		<DeleteLoanForm {loan} {feedback} onCancel={() => (deleteOpen = false)} />
	</Dialog.Content>
</Dialog.Root>
