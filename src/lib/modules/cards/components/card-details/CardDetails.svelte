<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import Undo2Icon from '@lucide/svelte/icons/undo-2';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
	import { formatDateTime } from '$lib/shared/utils/format-date-time';
	import type { CardDetailsProps } from './props';

	let { card, feedback = null }: CardDetailsProps = $props();
	let installmentFeedback = $derived(
		(feedback?.action === 'pay-credit-installment' ||
			feedback?.action === 'unpay-credit-installment') &&
			feedback.targetId === card.id
			? feedback
			: null
	);

	function paidInstallmentCount(purchase: (typeof card.interestFreeInstallmentPurchases)[number]) {
		return purchase.installments.filter((installment) => installment.paid).length;
	}

	function hasLaterPaidInstallment(
		purchase: (typeof card.interestFreeInstallmentPurchases)[number],
		installmentNumber: number
	) {
		return purchase.installments.some(
			(installment) => installment.paid && installment.installmentNumber > installmentNumber
		);
	}
</script>

<div class="grid gap-5">
	<section class="grid gap-3 rounded-md border border-slate-200 p-4">
		<div class="flex items-start justify-between gap-3">
			<div>
				<p class="text-sm font-bold text-slate-900">{card.alias}</p>
				<p class="mt-1 text-sm text-slate-500">{card.bankName} · •••• {card.lastFourDigits}</p>
			</div>
			<span class="rounded-full px-2.5 py-1 text-xs font-bold {card.kind === 'credit' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}">{card.kind === 'credit' ? 'Crédito' : 'Débito'}</span>
		</div>
		<div class="grid gap-3 sm:grid-cols-2">
			<div>
				<p class="text-xs font-semibold text-slate-500 uppercase">{card.kind === 'credit' ? 'Saldo utilizado' : 'Saldo disponible'}</p>
				<p class="mt-1 text-xl font-bold text-slate-900">{formatCurrencyFromMinorUnits(card.currentBalance, card.currencyCode)}</p>
			</div>
			{#if card.cashExpenseAmount !== null}
				<div>
					<p class="text-xs font-semibold text-slate-500 uppercase">Gasto de contado</p>
					<p class="mt-1 font-bold text-slate-900">{formatCurrencyFromMinorUnits(card.cashExpenseAmount, card.currencyCode)}</p>
				</div>
			{/if}
			{#if card.interestFreeOutstandingAmount !== null}
				<div>
					<p class="text-xs font-semibold text-slate-500 uppercase">Resto MSI</p>
					<p class="mt-1 font-bold text-slate-900">{formatCurrencyFromMinorUnits(card.interestFreeOutstandingAmount, card.currencyCode)}</p>
				</div>
			{/if}
			{#if card.maximumOfferedCredit !== null}
				<div>
					<p class="text-xs font-semibold text-slate-500 uppercase">Línea de crédito</p>
					<p class="mt-1 font-bold text-slate-900">{formatCurrencyFromMinorUnits(card.maximumOfferedCredit, card.currencyCode)}</p>
				</div>
			{/if}
			{#if card.statementDay !== null && card.paymentDueDay !== null}
				<div>
					<p class="text-xs font-semibold text-slate-500 uppercase">Reglas de pago</p>
					<p class="mt-1 font-bold text-slate-900">Corte día {card.statementDay} · límite día {card.paymentDueDay}</p>
				</div>
			{/if}
		</div>
	</section>

	{#if card.kind === 'credit'}
		<section class="grid gap-3 rounded-md border border-slate-200 p-4">
			<div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<p class="text-sm font-bold text-slate-900">Meses sin intereses pendientes</p>
					<p class="mt-1 text-xs text-slate-500">Mensualidades no pagadas que se suman al saldo utilizado.</p>
				</div>
				<strong class="text-sm text-slate-900">
					{formatCurrencyFromMinorUnits(
						card.interestFreeInstallmentPurchases.reduce((total, purchase) => total + purchase.unpaidAmount, 0),
						card.currencyCode
					)}
				</strong>
			</div>

			{#if installmentFeedback?.success}<p class="rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">{installmentFeedback.success}</p>{/if}
			{#if installmentFeedback?.message}<p class="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{installmentFeedback.message}</p>{/if}

				{#if card.interestFreeInstallmentPurchases.length === 0}
				<p class="rounded-md border border-slate-200 px-4 py-6 text-center text-sm font-semibold text-slate-500">No hay compras MSI registradas con esta tarjeta.</p>
			{:else}
				<div class="grid gap-3">
					{#each card.interestFreeInstallmentPurchases as purchase (purchase.id)}
						<div class="rounded-md border border-slate-200 p-3">
							<div class="flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-start sm:justify-between">
								<div class="min-w-0">
									<p class="truncate text-sm font-bold text-slate-900">{purchase.description}</p>
									<p class="mt-1 text-xs text-slate-500">
										{purchase.purchasedOn} · {paidInstallmentCount(purchase)}/{purchase.totalInstallments} pagadas
									</p>
								</div>
								<div class="sm:text-right">
									<p class="text-sm font-bold text-slate-900">{formatCurrencyFromMinorUnits(purchase.unpaidAmount, card.currencyCode)}</p>
									<p class="mt-1 text-xs text-slate-500">Pendiente de {formatCurrencyFromMinorUnits(purchase.originalAmount, card.currencyCode)}</p>
								</div>
							</div>
							<div class="mt-3 grid gap-2">
								{#each purchase.installments as installment (`${installment.movementId}-${installment.installmentNumber}`)}
									{@const blockedUnpay = installment.paid && hasLaterPaidInstallment(purchase, installment.installmentNumber)}
									<form method="POST" action={installment.paid ? '?/unpayCreditInstallment' : '?/payCreditInstallment'} class="flex flex-col gap-2 rounded-md bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
										<input type="hidden" name="cardId" value={card.id} />
										<input type="hidden" name="movementId" value={installment.movementId} />
										<input type="hidden" name="installmentNumber" value={installment.installmentNumber} />
										<div>
											<div class="flex flex-wrap items-center gap-2">
												<p class="text-sm font-semibold text-slate-900">Mensualidad {installment.installmentNumber}/{installment.totalInstallments}</p>
												<span class="rounded-full px-2 py-0.5 text-xs font-bold {installment.paid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
													{installment.paid ? 'Pagada' : 'Pendiente'}
												</span>
											</div>
											<p class="mt-1 text-xs text-slate-500">
												{formatCurrencyFromMinorUnits(installment.amount, card.currencyCode)}
												{#if installment.paidAt} · pagada {formatDateTime(installment.paidAt)}{/if}
											</p>
										</div>
										{#if installment.paid}
											<ActionButton type="submit" intent="secondary" disabled={blockedUnpay} title={blockedUnpay ? 'Primero desmarca las mensualidades posteriores pagadas.' : 'Desmarcar mensualidad'}>
												<Undo2Icon />Desmarcar
											</ActionButton>
										{:else}
											<ActionButton type="submit" intent="secondary"><CheckIcon />Marcar pagada</ActionButton>
										{/if}
									</form>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>
	{/if}
</div>
