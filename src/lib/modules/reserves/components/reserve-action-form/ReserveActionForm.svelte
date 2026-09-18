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
				<p class="rounded-md border border-outline bg-surface-subtle px-4 py-3 text-sm text-on-surface-variant">
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

				<div class="grid gap-3 rounded-md border border-outline bg-surface-subtle p-3">
					<div class="grid gap-2 sm:grid-cols-2">
						<div class="rounded-md bg-surface p-3 ring-1 ring-outline">
							<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Disponible actual</p>
							<p class="mt-1 text-lg font-bold text-on-surface">{selectedAvailableLabel ?? 'Selecciona una cuenta'}</p>
						</div>
						<div class="rounded-md bg-surface p-3 ring-1 ring-outline">
							<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Después de apartar</p>
							<p class="mt-1 text-lg font-bold {selectedBalanceAfterReserve !== null && selectedBalanceAfterReserve < 0 ? 'text-destructive' : 'text-on-surface'}">
								{selectedBalanceAfterReserveLabel ?? 'Selecciona una cuenta'}
							</p>
						</div>
					</div>
					{#if wouldOverdraw}
						<p class="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
							Selecciona una cuenta con saldo suficiente para apartar.
						</p>
					{/if}

					<div>
						<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Disponible por cuenta</p>
						<ul class="mt-2 divide-y divide-outline rounded-md bg-surface ring-1 ring-outline">
							{#each eligibleDebitCards as card (card.id)}
								<li class="flex items-center justify-between gap-3 px-3 py-2 text-sm">
									<span class="min-w-0 truncate font-semibold text-on-surface-variant">{cardLabel(card)}</span>
									<span class="shrink-0 font-bold text-on-surface">{formatCurrencyFromMinorUnits(card.currentBalance, card.currencyCode)}</span>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			{:else}
				<p class="rounded-md border border-tertiary/20 bg-tertiary/10 px-4 py-3 text-sm text-tertiary">
					No hay cuentas de débito en {currencyCode} disponibles para apartar.
				</p>
			{/if}

			{#if currentFeedback?.message}
				<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{currentFeedback.message}</p>
			{/if}

			<Dialog.Footer>
				<ActionButton type="button" intent="secondary" onclick={() => (open = false)}>Cancelar</ActionButton>
				<ActionButton type="submit" disabled={!canSubmit}>Confirmar apartado</ActionButton>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
