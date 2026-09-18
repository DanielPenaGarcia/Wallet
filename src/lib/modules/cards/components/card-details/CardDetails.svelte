<script lang="ts">
	import { untrack } from 'svelte';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import Undo2Icon from '@lucide/svelte/icons/undo-2';
	import { ActionButton } from '$lib/components/ui/action-button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { latestCreditCardStatementCycle } from '$lib/modules/cards/utils/credit-card-cycle';
	import {
		nextInterestFreeInstallmentsAmount,
		statementPayableAmount
	} from '$lib/modules/cards/utils/statement-payable-amount';
	import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
	import { formatDateTime } from '$lib/shared/utils/format-date-time';
	import { toIsoDate } from '$lib/shared/utils/local-date';
	import type { CardDetailsProps } from './props';

	let { card, feedback = null }: CardDetailsProps = $props();
	let expandedPurchaseIds = $state<string[]>([]);
	let statementFeedback = $derived(
		feedback?.action === 'register-card-statement' && feedback.targetId === card.id
			? feedback
			: null
	);
	let balanceAdjustmentFeedback = $derived(
		feedback?.action === 'adjust-card-balance' && feedback.targetId === card.id
			? feedback
			: null
	);
	let installmentFeedback = $derived(
		(feedback?.action === 'pay-credit-installment' ||
			feedback?.action === 'unpay-credit-installment') &&
			feedback.targetId === card.id
			? feedback
			: null
	);
	let statementOpen = $state(untrack(() => Boolean(statementFeedback?.message || statementFeedback?.errors)));
	let balanceAdjustmentOpen = $state(
		untrack(() => Boolean(balanceAdjustmentFeedback?.message || balanceAdjustmentFeedback?.errors))
	);
	let statementCycle = $derived(
		card.kind === 'credit' && card.statementDay !== null && card.paymentDueDay !== null
			? latestCreditCardStatementCycle(card.statementDay)
			: null
	);
	let statementDateLabel = $derived(
		statementCycle ? toIsoDate(statementCycle.statementDate) : null
	);
	let statementNextMsiAmount = $derived(nextInterestFreeInstallmentsAmount(card));
	let statementCalculatedAmount = $derived(statementPayableAmount(card));

	function fieldError(field: string) {
		return statementFeedback?.errors?.[field]?.[0];
	}

	function balanceAdjustmentFieldError(field: string) {
		return balanceAdjustmentFeedback?.errors?.[field]?.[0];
	}

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

	function isPurchaseExpanded(purchaseId: string) {
		return expandedPurchaseIds.includes(purchaseId);
	}

	function togglePurchase(purchaseId: string) {
		expandedPurchaseIds = isPurchaseExpanded(purchaseId)
			? expandedPurchaseIds.filter((id) => id !== purchaseId)
			: [...expandedPurchaseIds, purchaseId];
	}
</script>

<div class="grid gap-5">
	<section class="grid gap-3 rounded-md border border-outline p-4">
		<div class="flex items-start justify-between gap-3">
			<div>
				<p class="text-sm font-bold text-on-surface">{card.alias}</p>
				<p class="mt-1 text-sm text-on-surface-muted">{card.isDefault ? 'Efectivo' : `${card.bankName} · •••• ${card.lastFourDigits}`}</p>
			</div>
			<span class="rounded-full px-2.5 py-1 text-xs font-bold {card.kind === 'credit' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}">{card.kind === 'credit' ? 'Crédito' : 'Débito'}</span>
		</div>
		<div class="grid gap-3 sm:grid-cols-2">
			<div>
				<p class="text-xs font-semibold text-on-surface-muted uppercase">{card.kind === 'credit' ? 'Saldo utilizado' : 'Saldo disponible'}</p>
				<p class="mt-1 text-xl font-bold text-on-surface">{formatCurrencyFromMinorUnits(card.currentBalance, card.currencyCode)}</p>
			</div>
			{#if card.cashExpenseAmount !== null}
				<div>
					<p class="text-xs font-semibold text-on-surface-muted uppercase">Gasto de contado</p>
					<p class="mt-1 font-bold text-on-surface">{formatCurrencyFromMinorUnits(card.cashExpenseAmount, card.currencyCode)}</p>
				</div>
			{/if}
			{#if card.interestFreeOutstandingAmount !== null}
				<div>
					<p class="text-xs font-semibold text-on-surface-muted uppercase">Resto MSI</p>
					<p class="mt-1 font-bold text-on-surface">{formatCurrencyFromMinorUnits(card.interestFreeOutstandingAmount, card.currencyCode)}</p>
				</div>
			{/if}
			{#if card.maximumOfferedCredit !== null}
				<div>
					<p class="text-xs font-semibold text-on-surface-muted uppercase">Línea de crédito</p>
					<p class="mt-1 font-bold text-on-surface">{formatCurrencyFromMinorUnits(card.maximumOfferedCredit, card.currencyCode)}</p>
				</div>
			{/if}
			{#if card.statementDay !== null && card.paymentDueDay !== null}
				<div>
					<p class="text-xs font-semibold text-on-surface-muted uppercase">Reglas de pago</p>
					<p class="mt-1 font-bold text-on-surface">Corte día {card.statementDay} · límite día {card.paymentDueDay}</p>
				</div>
			{/if}
		</div>
		{#if card.kind === 'credit'}
			<div class="flex justify-end gap-2 border-t border-outline pt-3">
				<ActionButton type="button" intent="secondary" onclick={() => (balanceAdjustmentOpen = true)}>
					Ajuste
				</ActionButton>
				<ActionButton type="button" intent="secondary" onclick={() => (statementOpen = true)}>
					Registrar corte
				</ActionButton>
			</div>
		{/if}
		{#if card.kind === 'debit'}
			<div class="flex justify-end border-t border-outline pt-3">
				<ActionButton type="button" intent="secondary" onclick={() => (balanceAdjustmentOpen = true)}>
					Ajuste
				</ActionButton>
			</div>
		{/if}
	</section>

	<Dialog.Root bind:open={balanceAdjustmentOpen}>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Ajuste de saldo</Dialog.Title>
					<Dialog.Description>{card.alias}</Dialog.Description>
				</Dialog.Header>

				<form method="POST" action="?/adjustCardBalance" class="grid gap-4">
					<input type="hidden" name="cardId" value={card.id} />

					<div class="rounded-md border border-outline bg-surface-subtle px-4 py-3">
						<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">{card.kind === 'credit' ? 'Saldo utilizado calculado' : 'Saldo calculado'}</p>
						<p class="mt-1 text-lg font-bold text-on-surface">{formatCurrencyFromMinorUnits(card.currentBalance, card.currencyCode)}</p>
					</div>

					<div class="grid gap-2">
						<Label for={`balance-adjustment-amount-${card.id}`}>{card.kind === 'credit' ? 'Saldo utilizado real' : 'Saldo real de la cuenta'}</Label>
						<p class="text-xs leading-5 text-on-surface-muted">
							{card.kind === 'credit'
								? 'Si el saldo utilizado real es mayor se registrará un ajuste en contra; si es menor, un ajuste a favor.'
								: 'Si el saldo real es mayor se registrará un ajuste a favor; si es menor, un ajuste en contra.'}
						</p>
						<Input
							id={`balance-adjustment-amount-${card.id}`}
							name="balanceAmount"
							type="number"
							min="0"
							step="0.01"
							required
							value={balanceAdjustmentFeedback?.values?.balanceAmount ?? ''}
							placeholder="0.00"
							class="h-11 border-outline"
							aria-invalid={balanceAdjustmentFieldError('balanceAmount') ? 'true' : undefined}
						/>
						{#if balanceAdjustmentFieldError('balanceAmount')}<span class="text-xs text-destructive">{balanceAdjustmentFieldError('balanceAmount')}</span>{/if}
					</div>

					{#if balanceAdjustmentFeedback?.success}
						<p class="rounded-md bg-secondary/10 px-3 py-2 text-sm font-semibold text-secondary">{balanceAdjustmentFeedback.success}</p>
					{/if}
					{#if balanceAdjustmentFeedback?.message}
						<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{balanceAdjustmentFeedback.message}</p>
					{/if}

					<Dialog.Footer>
						<ActionButton type="button" intent="secondary" onclick={() => (balanceAdjustmentOpen = false)}>Cancelar</ActionButton>
						<ActionButton type="submit">Guardar ajuste</ActionButton>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>

	{#if card.kind === 'credit'}
		<Dialog.Root bind:open={statementOpen}>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Registrar corte</Dialog.Title>
					<Dialog.Description>{card.alias}</Dialog.Description>
				</Dialog.Header>

				<form method="POST" action="?/registerCardStatement" class="grid gap-4">
					<input type="hidden" name="cardId" value={card.id} />

					<div class="rounded-md border border-outline bg-surface-subtle px-4 py-3">
						<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Total calculado del corte</p>
						<p class="mt-1 text-sm text-on-surface-muted">
							Fecha de corte: {statementDateLabel ?? 'No disponible'}
						</p>
						<div class="mt-3 grid gap-2 text-sm">
							<div class="flex items-center justify-between gap-3">
								<span class="text-on-surface-muted">Contado</span>
								<strong class="text-on-surface">{formatCurrencyFromMinorUnits(card.cashExpenseAmount ?? 0, card.currencyCode)}</strong>
							</div>
							<div class="flex items-center justify-between gap-3">
								<span class="text-on-surface-muted">Próximo MSI</span>
								<strong class="text-on-surface">{formatCurrencyFromMinorUnits(statementNextMsiAmount, card.currencyCode)}</strong>
							</div>
						</div>
						<div class="mt-3 border-t border-outline pt-3">
							<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Total que te cobran</p>
							<p class="mt-1 text-lg font-bold text-on-surface">{formatCurrencyFromMinorUnits(statementCalculatedAmount, card.currencyCode)}</p>
						</div>
					</div>

					<div class="grid gap-2">
						<Label for={`statement-amount-${card.id}`}>Total oficial que cobra el corte</Label>
						<p class="text-xs leading-5 text-on-surface-muted">Incluye el gasto de contado y la mensualidad MSI que entra en este corte.</p>
						<Input
							id={`statement-amount-${card.id}`}
							name="statementAmount"
							type="number"
							min="0"
							step="0.01"
							required
							value={statementFeedback?.values?.statementAmount ?? ''}
							placeholder="0.00"
							class="h-11 border-outline"
							aria-invalid={fieldError('statementAmount') ? 'true' : undefined}
						/>
						{#if fieldError('statementAmount')}<span class="text-xs text-destructive">{fieldError('statementAmount')}</span>{/if}
					</div>

					{#if statementFeedback?.success}
						<p class="rounded-md bg-secondary/10 px-3 py-2 text-sm font-semibold text-secondary">{statementFeedback.success}</p>
					{/if}
					{#if statementFeedback?.message}
						<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{statementFeedback.message}</p>
					{/if}

					<Dialog.Footer>
						<ActionButton type="button" intent="secondary" onclick={() => (statementOpen = false)}>Cancelar</ActionButton>
						<ActionButton type="submit">Guardar corte</ActionButton>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>
	{/if}

	{#if card.kind === 'credit'}
		<section class="grid gap-3 rounded-md border border-outline p-4">
			<div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<p class="text-sm font-bold text-on-surface">Meses sin intereses pendientes</p>
					<p class="mt-1 text-xs text-on-surface-muted">Mensualidades no pagadas que se suman al saldo utilizado.</p>
				</div>
				<strong class="text-sm text-on-surface">
					{formatCurrencyFromMinorUnits(
						card.interestFreeInstallmentPurchases.reduce((total, purchase) => total + purchase.unpaidAmount, 0),
						card.currencyCode
					)}
				</strong>
			</div>

			{#if installmentFeedback?.success}<p class="rounded-md bg-secondary/10 px-3 py-2 text-sm font-semibold text-secondary">{installmentFeedback.success}</p>{/if}
			{#if installmentFeedback?.message}<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{installmentFeedback.message}</p>{/if}

				{#if card.interestFreeInstallmentPurchases.length === 0}
				<p class="rounded-md border border-outline px-4 py-6 text-center text-sm font-semibold text-on-surface-muted">No hay compras MSI registradas con esta cuenta.</p>
			{:else}
				<div class="grid gap-3">
					{#each card.interestFreeInstallmentPurchases as purchase (purchase.id)}
						{@const isExpanded = isPurchaseExpanded(purchase.id)}
						<div class="rounded-md border border-outline p-3">
							<div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
								<div class="flex min-w-0 gap-2">
									<button
										type="button"
										class="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md text-on-surface-muted hover:bg-surface-muted hover:text-on-surface"
										onclick={() => togglePurchase(purchase.id)}
										aria-expanded={isExpanded}
										aria-controls={`purchase-installments-${purchase.id}`}
										aria-label={isExpanded ? 'Ocultar mensualidades' : 'Mostrar mensualidades'}
									>
										{#if isExpanded}<ChevronDownIcon class="size-4" />{:else}<ChevronRightIcon class="size-4" />{/if}
									</button>
									<div class="min-w-0">
										<p class="truncate text-sm font-bold text-on-surface">{purchase.description}</p>
										<p class="mt-1 text-xs text-on-surface-muted">
											{purchase.purchasedOn} · {paidInstallmentCount(purchase)}/{purchase.totalInstallments} pagadas
										</p>
									</div>
								</div>
								<div class="flex items-center justify-between gap-3 sm:block sm:text-right">
									<button
										type="button"
										class="text-xs font-bold text-on-surface-muted hover:text-on-surface"
										onclick={() => togglePurchase(purchase.id)}
										aria-expanded={isExpanded}
										aria-controls={`purchase-installments-${purchase.id}`}
									>
										{isExpanded ? 'Ocultar pagos' : 'Ver pagos'}
									</button>
									<div class="sm:mt-1">
										<p class="text-sm font-bold text-on-surface">{formatCurrencyFromMinorUnits(purchase.unpaidAmount, card.currencyCode)}</p>
										<p class="mt-1 text-xs text-on-surface-muted">Pendiente de {formatCurrencyFromMinorUnits(purchase.originalAmount, card.currencyCode)}</p>
									</div>
								</div>
							</div>
							{#if isExpanded}
								<div id={`purchase-installments-${purchase.id}`} class="mt-3 grid gap-2 border-t border-outline pt-3">
									{#each purchase.installments as installment (`${installment.movementId}-${installment.installmentNumber}`)}
										{@const blockedUnpay = installment.paid && hasLaterPaidInstallment(purchase, installment.installmentNumber)}
										<form method="POST" action={installment.paid ? '?/unpayCreditInstallment' : '?/payCreditInstallment'} class="flex flex-col gap-2 rounded-md bg-surface-subtle p-3 sm:flex-row sm:items-center sm:justify-between">
											<input type="hidden" name="cardId" value={card.id} />
											<input type="hidden" name="movementId" value={installment.movementId} />
											<input type="hidden" name="installmentNumber" value={installment.installmentNumber} />
											<div>
												<div class="flex flex-wrap items-center gap-2">
													<p class="text-sm font-semibold text-on-surface">Mensualidad {installment.installmentNumber}/{installment.totalInstallments}</p>
													<span class="rounded-full px-2 py-0.5 text-xs font-bold {installment.paid ? 'bg-secondary/10 text-secondary' : 'bg-tertiary/10 text-tertiary'}">
														{installment.paid ? 'Pagada' : 'Pendiente'}
													</span>
												</div>
												<p class="mt-1 text-xs text-on-surface-muted">
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
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</section>
	{/if}
</div>
