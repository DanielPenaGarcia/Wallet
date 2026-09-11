<script lang="ts">
	import { untrack } from 'svelte';
	import WalletCardsIcon from '@lucide/svelte/icons/wallet-cards';
	import { ActionButton } from '$lib/components/ui/action-button';
	import * as Dialog from '$lib/components/ui/dialog';
	import CardSelectField from '$lib/modules/cards/components/card-select-field/CardSelectField.svelte';
	import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
	import type { ReserveActionFormProps } from './props';

	let {
		reserveKind,
		targetId,
		targetName,
		amount,
		amountLabel,
		currencyCode,
		debitCards,
		feedback = null
	}: ReserveActionFormProps = $props();

	let eligibleDebitCards = $derived(debitCards.filter((card) => card.currencyCode === currencyCode));
	let currentFeedback = $derived(
		feedback?.action === 'create-reserve-movement' &&
		feedback.targetId === targetId &&
		feedback.reserveKind === reserveKind
			? feedback
			: null
	);
	let open = $state(untrack(() => Boolean(currentFeedback?.message || currentFeedback?.errors)));
	let sourceCardId = $state(
		untrack(() => currentFeedback?.values?.sourceCardId ?? eligibleDebitCards[0]?.id ?? '')
	);
	let canReserve = $derived(eligibleDebitCards.length > 0);
	let hasPendingAmount = $derived(amount > 0);
	let selectedSourceCard = $derived(
		eligibleDebitCards.find((card) => card.id === sourceCardId) ?? null
	);
	let selectedAvailableLabel = $derived(
		selectedSourceCard
			? formatCurrencyFromMinorUnits(selectedSourceCard.currentBalance, selectedSourceCard.currencyCode)
			: null
	);
	let selectedBalanceAfterReserve = $derived(
		selectedSourceCard ? selectedSourceCard.currentBalance - amount : null
	);
	let selectedBalanceAfterReserveLabel = $derived(
		selectedSourceCard && selectedBalanceAfterReserve !== null
			? formatCurrencyFromMinorUnits(selectedBalanceAfterReserve, selectedSourceCard.currencyCode)
			: null
	);
	let wouldOverdraw = $derived(
		selectedBalanceAfterReserve !== null && selectedBalanceAfterReserve < 0
	);
	let canSubmit = $derived(canReserve && hasPendingAmount && !wouldOverdraw);

	function sourceError() {
		return currentFeedback?.errors?.sourceCardId?.[0];
	}

	function cardLabel(card: (typeof eligibleDebitCards)[number]) {
		const identifier = card.isDefault ? 'Efectivo' : `•••• ${card.lastFourDigits}`;
		return `${card.alias} · ${identifier}`;
	}
</script>

<ActionButton type="button" intent="secondary" disabled={!hasPendingAmount} onclick={() => (open = true)}>
	<WalletCardsIcon />Apartar
</ActionButton>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Apartar {amountLabel}</Dialog.Title>
			<Dialog.Description>{targetName}</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/createReserveMovement" class="grid gap-4">
			<input type="hidden" name="reserveKind" value={reserveKind} />
			<input type="hidden" name="targetId" value={targetId} />

			{#if !hasPendingAmount}
				<p class="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
					Este apartado ya está cubierto.
				</p>
			{:else if canReserve}
				<CardSelectField
					id={`reserve-source-${reserveKind}-${targetId}`}
					name="sourceCardId"
					label="Fuente"
					cards={eligibleDebitCards}
					bind:value={sourceCardId}
					error={sourceError()}
				/>

				<div class="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
					<div class="grid gap-2 sm:grid-cols-2">
						<div class="rounded-md bg-white p-3 ring-1 ring-slate-200">
							<p class="text-xs font-bold tracking-wide text-slate-500 uppercase">Disponible actual</p>
							<p class="mt-1 text-lg font-bold text-slate-900">{selectedAvailableLabel ?? 'Selecciona una cuenta'}</p>
						</div>
						<div class="rounded-md bg-white p-3 ring-1 ring-slate-200">
							<p class="text-xs font-bold tracking-wide text-slate-500 uppercase">Después de apartar</p>
							<p class="mt-1 text-lg font-bold {selectedBalanceAfterReserve !== null && selectedBalanceAfterReserve < 0 ? 'text-red-700' : 'text-slate-900'}">
								{selectedBalanceAfterReserveLabel ?? 'Selecciona una cuenta'}
							</p>
						</div>
					</div>
					{#if wouldOverdraw}
						<p class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
							Selecciona una cuenta con saldo suficiente para apartar.
						</p>
					{/if}

					<div>
						<p class="text-xs font-bold tracking-wide text-slate-500 uppercase">Disponible por cuenta</p>
						<ul class="mt-2 divide-y divide-slate-100 rounded-md bg-white ring-1 ring-slate-200">
							{#each eligibleDebitCards as card (card.id)}
								<li class="flex items-center justify-between gap-3 px-3 py-2 text-sm">
									<span class="min-w-0 truncate font-semibold text-slate-700">{cardLabel(card)}</span>
									<span class="shrink-0 font-bold text-slate-900">{formatCurrencyFromMinorUnits(card.currentBalance, card.currencyCode)}</span>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			{:else}
				<p class="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
					No hay cuentas de débito en {currencyCode} disponibles para apartar.
				</p>
			{/if}

			{#if currentFeedback?.message}
				<p class="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{currentFeedback.message}</p>
			{/if}

			<Dialog.Footer>
				<ActionButton type="button" intent="secondary" onclick={() => (open = false)}>Cancelar</ActionButton>
				<ActionButton type="submit" disabled={!canSubmit}>Confirmar apartado</ActionButton>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
