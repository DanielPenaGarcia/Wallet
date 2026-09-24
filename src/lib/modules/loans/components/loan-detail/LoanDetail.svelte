<script lang="ts">
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { untrack } from 'svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { InfoPopover } from '$lib/components/ui/info-popover';
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

	function metricLabel(label: string, title: string, description: string) {
		return { label, title, description };
	}
</script>

<div class="grid gap-6">
	<div class="grid gap-3 lg:grid-cols-[auto_1fr] lg:items-center">
		<Button href="/prestamos" variant="ghost" size="sm" class="w-full justify-start sm:w-fit"><ArrowLeftIcon />Volver</Button>
		{#if loan.status === 'active'}
			<div class="grid gap-2 sm:grid-cols-3 lg:justify-self-end">
				<div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1">
					<ActionButton type="button" intent="secondary" class="w-full" onclick={() => (editOpen = true)}><PencilIcon />Editar</ActionButton>
					<InfoPopover title="Editar préstamo" description="Permite cambiar términos permitidos. Si cambia el principal, también se ajusta el movimiento de apertura y el saldo de la cuenta." />
				</div>
				<div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1">
					<ActionButton type="button" intent="danger" class="w-full" onclick={() => (deleteOpen = true)}><Trash2Icon />Eliminar</ActionButton>
					<InfoPopover title="Eliminar préstamo" description="Revierte movimientos activos vinculados y elimina el registro solo si las cuentas pueden quedar en un estado válido." />
				</div>
				<form method="POST" action="?/cancelLoan">
					<input type="hidden" name="id" value={loan.id} />
					<div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1">
						<ActionButton type="submit" intent="danger" class="w-full">Cancelar préstamo</ActionButton>
						<InfoPopover title="Cancelar préstamo" description="Detiene el préstamo y conserva su historial. No revierte movimientos ni borra el registro." />
					</div>
				</form>
			</div>
		{/if}
	</div>

	{#if feedback?.success}<p class="break-words rounded-md border border-secondary/20 bg-secondary/10 px-4 py-3 text-sm font-semibold text-secondary">{feedback.success}</p>{/if}

	<section class="rounded-lg border border-outline bg-surface p-4 shadow-sm sm:p-5">
		<div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
			<div class="min-w-0">
				<div class="flex items-center gap-1.5">
					<p class="text-xs font-bold tracking-[0.12em] text-primary uppercase">{loan.direction === 'borrowed' ? 'Por pagar' : 'Por cobrar'}</p>
					<InfoPopover
						title={loan.direction === 'borrowed' ? 'Préstamo por pagar' : 'Préstamo por cobrar'}
						description={loan.direction === 'borrowed' ? 'Dinero que recibiste y debes devolver.' : 'Dinero que entregaste y esperas cobrar.'}
					/>
				</div>
				<h1 class="mt-1 break-words text-2xl font-bold text-on-surface">{loan.name}</h1>
				<p class="mt-1 break-words text-sm text-on-surface-muted">{loan.counterpartyName}</p>
			</div>
			<span class="w-fit rounded-full px-2.5 py-1 text-xs font-bold {loan.status === 'active' ? 'bg-primary-container text-primary' : 'bg-surface-muted text-on-surface-muted'}">{loan.status === 'active' ? 'Activo' : 'Cancelado'}</span>
		</div>
		<div class="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
			{#each [
				metricLabel('Principal', 'Principal', 'Dinero realmente recibido o entregado al abrir el préstamo.'),
				metricLabel('Total contractual', 'Total contractual', 'Monto total acordado a pagar o cobrar durante toda la vida del préstamo.'),
				metricLabel('Costo financiero', 'Costo financiero', 'Diferencia entre el total contractual y el principal.'),
				metricLabel('Pendiente', 'Saldo pendiente', 'Parte del total contractual que aún falta por pagar o cobrar.'),
				metricLabel('Pagado/cobrado', 'Total pagado/cobrado', 'Suma de pagos o cobros activos vinculados al préstamo.'),
				metricLabel('Cuotas', 'Número de cuotas', 'Cantidad de pagos o cobros mensuales usados para generar el calendario.'),
				metricLabel('Primer pago/cobro', 'Primer pago/cobro', 'Fecha inicial desde la que se construye el calendario mensual.'),
				metricLabel('Próximo pago/cobro', 'Próxima cuota', 'Siguiente cuota con saldo pendiente según el calendario actual.')
			] as item, index}
			<div class="rounded-md bg-surface-subtle p-3">
				<div class="flex items-center gap-1.5">
					<p class="text-xs font-bold text-on-surface-muted">{item.label}</p>
					<InfoPopover title={item.title} description={item.description} />
				</div>
				{#if index === 0}
				<p class="mt-1 break-words text-lg font-bold text-on-surface">{money(loan.principalAmountCents)}</p>
				{:else if index === 1}
				<p class="mt-1 break-words text-lg font-bold text-on-surface">{money(loan.totalRepaymentCents)}</p>
				{:else if index === 2}
				<p class="mt-1 break-words text-lg font-bold text-on-surface">{money(loan.financingCostCents)}</p>
				{:else if index === 3}
				<p class="mt-1 break-words text-lg font-bold text-primary">{money(loan.outstandingAmountCents)}</p>
				{:else if index === 4}
				<p class="mt-1 break-words text-lg font-bold text-on-surface">{money(loan.paidAmountCents)}</p>
				{:else if index === 5}
				<p class="mt-1 break-words text-lg font-bold text-on-surface">{loan.installmentCount}</p>
				{:else if index === 6}
				<p class="mt-1 break-words text-lg font-bold text-on-surface">{formatIsoDate(loan.firstPaymentDate)}</p>
				{:else}
				<p class="mt-1 break-words text-lg font-bold text-on-surface">{formatIsoDate(loan.nextInstallment?.dueDate ?? null)}</p>
				{/if}
			</div>
			{/each}
		</div>
		<div class="mt-6">
			<div class="flex items-center justify-between gap-3">
				<div class="flex items-center gap-1.5">
					<p class="text-xs font-bold text-on-surface-muted">Progreso</p>
					<InfoPopover title="Progreso" description="Porcentaje del total contractual cubierto por pagos o cobros activos." />
				</div>
				<p class="text-xs font-bold text-on-surface-variant">{loan.progressPercentage}%</p>
			</div>
			<div class="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
				<div class="h-full rounded-full bg-primary" style:width={`${loan.progressPercentage}%`}></div>
			</div>
		</div>
	</section>

	<section class="rounded-lg border border-outline bg-surface shadow-sm">
		<div class="border-b border-outline px-4 py-4 sm:px-5">
			<h2 class="font-bold text-on-surface">{loan.direction === 'borrowed' ? 'Registrar pago' : 'Registrar cobro'}</h2>
			<p class="mt-1 break-words text-sm text-on-surface-muted">El movimiento actualizará la cuenta seleccionada y reducirá el saldo pendiente.</p>
		</div>
		<div class="p-4 sm:p-5">
			<LoanSettlementForm {loan} {cards} {feedback} />
		</div>
	</section>

	<section class="overflow-hidden rounded-lg border border-outline bg-surface shadow-sm">
		<div class="border-b border-outline px-4 py-4 sm:px-5">
			<h2 class="font-bold text-on-surface">Calendario de cuotas</h2>
		</div>
		<div class="grid gap-3 p-4 md:hidden">
			{#each loan.installments as installment}
				<div class="rounded-md bg-surface-subtle p-4">
					<div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
						<div class="min-w-0">
							<p class="font-bold text-on-surface">Cuota #{installment.number}</p>
							<p class="mt-1 text-xs text-on-surface-muted">{formatIsoDate(installment.dueDate)}</p>
						</div>
						<span class="w-fit rounded-full px-2 py-1 text-xs font-bold {installment.status === 'paid' ? 'bg-secondary/10 text-secondary' : installment.status === 'partial' ? 'bg-primary-container text-primary' : 'bg-surface-muted text-on-surface-muted'}">
							{installment.status === 'paid' ? 'Pagada' : installment.status === 'partial' ? 'Parcial' : 'Pendiente'}
						</span>
					</div>
					<div class="mt-4 grid gap-3 sm:grid-cols-3">
						<div>
							<p class="text-xs font-bold text-on-surface-muted">Cuota</p>
							<p class="mt-1 break-words font-bold text-on-surface">{money(installment.amountCents)}</p>
						</div>
						<div>
							<p class="text-xs font-bold text-on-surface-muted">Cubierto</p>
							<p class="mt-1 break-words font-bold text-on-surface">{money(installment.coveredAmountCents)}</p>
						</div>
						<div>
							<p class="text-xs font-bold text-on-surface-muted">Restante</p>
							<p class="mt-1 break-words font-bold text-on-surface">{money(installment.remainingAmountCents)}</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
		<div class="hidden overflow-x-auto md:block">
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
		<div class="border-b border-outline px-4 py-4 sm:px-5">
			<h2 class="font-bold text-on-surface">Historial del préstamo</h2>
		</div>
		{#if movements.length === 0}
			<p class="p-4 text-sm text-on-surface-muted sm:p-5">No hay movimientos vinculados.</p>
		{:else}
			<ul class="divide-y divide-outline">
				{#each movements as movement (movement.id)}
					<li class="grid gap-2 px-4 py-4 sm:px-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
						<div class="min-w-0">
							<p class="font-bold text-on-surface">{movementLabel(movement.type)}</p>
							<p class="mt-1 break-words text-sm text-on-surface-muted">{movement.title} · {formatIsoDate(movement.occurredAt)}{movement.accountLabel ? ` · ${movement.accountLabel}` : ''}</p>
						</div>
						<p class="break-words font-bold text-on-surface md:text-right">{formatCurrencyFromMinorUnits(movement.amountCents, movement.currencyCode)}</p>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>

<Dialog.Root bind:open={editOpen}>
	<Dialog.Content class="max-h-[min(90vh,760px)] overflow-y-auto sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Editar préstamo</Dialog.Title>
			<Dialog.Description>Actualiza los términos del préstamo y su calendario.</Dialog.Description>
		</Dialog.Header>
		<LoanForm mode="edit" {loan} {cards} {feedback} onCancel={() => (editOpen = false)} />
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content class="max-h-[min(90vh,640px)] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Eliminar {loan.name}</Dialog.Title>
			<Dialog.Description>Esta acción revierte los movimientos activos vinculados antes de borrar el préstamo.</Dialog.Description>
		</Dialog.Header>
		<DeleteLoanForm {loan} {feedback} onCancel={() => (deleteOpen = false)} />
	</Dialog.Content>
</Dialog.Root>
