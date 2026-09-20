<script lang="ts">
	import AlertTriangleIcon from '@lucide/svelte/icons/alert-triangle';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import CalendarDaysIcon from '@lucide/svelte/icons/calendar-days';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { untrack } from 'svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Tabs from '$lib/components/ui/tabs';
	import CreditCardStatementForm from '$lib/modules/credit-card-statements/components/credit-card-statement-form/CreditCardStatementForm.svelte';
	import type { CreditCardStatementFormFeedback } from '$lib/modules/credit-card-statements/types/credit-card-statement-form-feedback.types';
	import type { CreditCardStatement } from '$lib/modules/credit-card-statements/types/credit-card-statement.types';
	import DeleteInstallmentPurchaseForm from '$lib/modules/installment-purchases/components/delete-installment-purchase-form/DeleteInstallmentPurchaseForm.svelte';
	import InstallmentPurchaseForm from '$lib/modules/installment-purchases/components/installment-purchase-form/InstallmentPurchaseForm.svelte';
	import type { InstallmentPurchaseFormFeedback } from '$lib/modules/installment-purchases/types/installment-purchase-form-feedback.types';
	import type { InstallmentPurchase } from '$lib/modules/installment-purchases/types/installment-purchase.types';
	import {
		getInstallmentAmounts,
		getInstallmentCounts,
		summarizeInstallmentPurchases
	} from '$lib/modules/installment-purchases/utils/installment-purchase-calculations';
	import { formatIsoDate } from '$lib/shared/utils/format-iso-date';
	import { formatAccountBalance, getCreditAvailableCents } from '../../utils/account-labels';
	import type { CreditAccountDetailProps } from './props';

	let {
		account,
		purchases,
		latestStatement,
		statementHistory,
		projection,
		statementDraft,
		feedback = null
	}: CreditAccountDetailProps = $props();
	let createOpen = $state(untrack(() => feedback?.action === 'create-installment-purchase' && Boolean(feedback.errors || feedback.message)));
	let statementOpen = $state(untrack(() => feedback?.action === 'create-credit-card-statement' && Boolean(feedback.errors || feedback.message)));
	let installmentFeedback = $derived(isInstallmentFeedback(feedback) ? feedback : null);
	let createStatementFeedback = $derived(feedback?.action === 'create-credit-card-statement' && isStatementFeedback(feedback) ? feedback : null);
	let editStatementFeedback = $derived(feedback?.action === 'update-credit-card-statement' && isStatementFeedback(feedback) ? feedback : null);
	let editingStatement = $state<CreditCardStatement | null>(untrack(() =>
		feedback?.action === 'update-credit-card-statement'
			? (statementHistory.find((statement) => statement.id === feedback.targetId) ?? null)
			: null
	));
	let editingPurchase = $state<InstallmentPurchase | null>(untrack(() =>
		feedback?.action === 'update-installment-purchase'
			? (purchases.find((purchase) => purchase.id === feedback.targetId) ?? null)
			: null
	));
	let deletingPurchase = $state<InstallmentPurchase | null>(untrack(() =>
		feedback?.action === 'delete-installment-purchase'
			? (purchases.find((purchase) => purchase.id === feedback.targetId) ?? null)
			: null
	));
	let editOpen = $state(untrack(() => feedback?.action === 'update-installment-purchase' && editingPurchase !== null));
	let editStatementOpen = $state(untrack(() => feedback?.action === 'update-credit-card-statement' && editingStatement !== null));
	let deleteOpen = $state(untrack(() => feedback?.action === 'delete-installment-purchase' && deletingPurchase !== null));
	let cardColor = $derived(account.cardColor ?? account.bank?.color ?? '#123a63');
	let creditLimitCents = $derived(account.creditLimitCents ?? 0);
	let availableCreditCents = $derived(getCreditAvailableCents(account));
	let usagePercent = $derived(creditLimitCents > 0 ? Math.min(Math.round((account.balanceCents / creditLimitCents) * 100), 100) : 0);
	let purchaseSummary = $derived(summarizeInstallmentPurchases(purchases));
	let nonInstallmentBalanceCents = $derived(account.balanceCents - purchaseSummary.outstandingAmountCents);
	let outstandingExceedsBalance = $derived(purchaseSummary.outstandingAmountCents > account.balanceCents);
	let statementStatusLabel = $derived(statusLabel(projection.latestStatementStatus));

	function progressPercent(purchase: InstallmentPurchase) {
		if (purchase.totalInstallments <= 0) return 0;
		return Math.min(Math.round((purchase.paidInstallments / purchase.totalInstallments) * 100), 100);
	}

	function displayDate(date: string) {
		return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(`${date}T00:00:00`));
	}

	function shortDate(date: string) {
		return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(new Date(`${date}T00:00:00`));
	}

	function statusLabel(status: typeof projection.latestStatementStatus) {
		if (status === 'pending') return 'Pendiente';
		if (status === 'partial') return 'Pago parcial';
		if (status === 'paid') return 'Pagado';
		return 'Sin corte';
	}

	function isInstallmentFeedback(value: typeof feedback): value is InstallmentPurchaseFormFeedback {
		return Boolean(value && (
			value.action === 'create-installment-purchase' ||
			value.action === 'update-installment-purchase' ||
			value.action === 'delete-installment-purchase'
		));
	}

	function isStatementFeedback(value: typeof feedback): value is CreditCardStatementFormFeedback {
		return Boolean(value && (
			value.action === 'create-credit-card-statement' ||
			value.action === 'update-credit-card-statement'
		));
	}
</script>

{#if feedback?.success}
	<p class="rounded-md border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">{feedback.success}</p>
{/if}

<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
	<div>
		<Button href="/cuentas" variant="ghost" size="sm" class="mb-3 w-fit pl-1"><ArrowLeftIcon />Cuentas</Button>
		<p class="text-sm font-semibold text-primary">Tarjeta de crédito</p>
		<h2 class="mt-1 text-2xl font-bold text-on-background">{account.name}</h2>
		<p class="mt-2 text-sm text-on-surface-muted">{account.bank?.name ?? 'Banco sin asignar'} · {account.isActive ? 'Activa' : 'Inactiva'}</p>
	</div>
	<div class="flex flex-wrap gap-2">
		<ActionButton type="button" intent="secondary" onclick={() => (statementOpen = true)}>Registrar corte</ActionButton>
		<ActionButton type="button" onclick={() => (createOpen = true)}><PlusIcon />Registrar MSI</ActionButton>
	</div>
</div>

<Tabs.Root value="summary" class="gap-5">
	<Tabs.List variant="line" class="w-full justify-start overflow-x-auto">
		<Tabs.Trigger value="summary" class="h-8 px-4 py-3 font-bold">Resumen</Tabs.Trigger>
		<Tabs.Trigger value="installments" class="h-8 px-4 py-3 font-bold">Compras a MSI</Tabs.Trigger>
	</Tabs.List>

	<Tabs.Content value="summary" class="grid gap-5">
		<section class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
			<div class="rounded-lg border border-outline bg-surface p-5 shadow-sm">
				<div class="flex items-start justify-between gap-3">
					<div class="min-w-0">
						<p class="truncate text-xs font-bold text-on-surface-muted">{account.bank?.alias ?? 'Crédito'}</p>
						<h3 class="mt-1 truncate text-lg font-bold text-on-surface">{account.name}</h3>
						<p class="mt-1 font-mono text-sm font-bold tracking-[0.08em] text-on-surface-muted">•••• {account.cardLastFourDigits ?? '••••'}</p>
					</div>
					<span class="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
						<CreditCardIcon class="size-5" />
					</span>
				</div>

				<div class="mt-5 grid gap-4 sm:grid-cols-3">
					<div>
						<p class="text-xs font-bold text-on-surface-muted">Saldo consumido</p>
						<p class="mt-1 text-lg font-bold text-on-surface">{formatAccountBalance(account.balanceCents)}</p>
					</div>
					<div>
						<p class="text-xs font-bold text-on-surface-muted">Disponible</p>
						<p class="mt-1 text-lg font-bold text-primary">{formatAccountBalance(availableCreditCents)}</p>
					</div>
					<div>
						<p class="text-xs font-bold text-on-surface-muted">Límite</p>
						<p class="mt-1 text-lg font-bold text-on-surface">{formatAccountBalance(creditLimitCents)}</p>
					</div>
				</div>

				<div class="mt-5">
					<div class="flex items-center justify-between gap-3">
						<p class="text-xs font-bold text-on-surface-muted">Crédito consumido</p>
						<p class="text-xs font-bold text-on-surface-variant">{usagePercent}%</p>
					</div>
					<div class="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
						<div class="h-full rounded-full" style={`width: ${usagePercent}%; background-color: ${cardColor}`}></div>
					</div>
				</div>

				<div class="mt-5 grid gap-2 text-sm sm:grid-cols-2">
					<p class="rounded-md bg-surface-subtle px-3 py-2 font-semibold text-on-surface-variant">Corte · Día {account.statementDay ?? '-'}</p>
					<p class="rounded-md bg-surface-subtle px-3 py-2 font-semibold text-on-surface-variant">Pago · Día {account.paymentDueDay ?? '-'}</p>
				</div>
			</div>

			<div class="rounded-lg border border-outline bg-surface p-5 shadow-sm">
				<p class="text-sm font-bold text-on-surface">Composición MSI</p>
				<div class="mt-4 grid gap-3">
					<div class="flex items-center justify-between gap-3">
						<span class="text-sm text-on-surface-muted">Pendiente MSI</span>
						<span class="font-bold text-on-surface">{formatAccountBalance(purchaseSummary.outstandingAmountCents)}</span>
					</div>
					<div class="flex items-center justify-between gap-3">
						<span class="text-sm text-on-surface-muted">Cortado sin pagar</span>
						<span class="font-bold text-on-surface">{formatAccountBalance(purchaseSummary.unpaidBilledAmountCents)}</span>
					</div>
					<div class="flex items-center justify-between gap-3">
						<span class="text-sm text-on-surface-muted">Futuro</span>
						<span class="font-bold text-on-surface">{formatAccountBalance(purchaseSummary.futureAmountCents)}</span>
					</div>
					<div class="flex items-center justify-between gap-3 border-t border-outline pt-3">
						<span class="text-sm text-on-surface-muted">No explicado por MSI</span>
						<span class="font-bold {nonInstallmentBalanceCents < 0 ? 'text-destructive' : 'text-on-surface'}">{formatAccountBalance(nonInstallmentBalanceCents)}</span>
					</div>
				</div>
				{#if outstandingExceedsBalance}
					<p class="mt-4 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
						<AlertTriangleIcon class="mr-1 inline size-4" />El pendiente MSI supera el saldo consumido de la tarjeta.
					</p>
				{/if}
			</div>
		</section>

		<section class="grid gap-5 lg:grid-cols-2">
			<div class="rounded-lg border border-outline bg-surface p-5 shadow-sm">
				<div class="flex items-start justify-between gap-3">
					<div>
						<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Último corte</p>
						<p class="mt-1 text-sm text-on-surface-muted">
							{#if latestStatement}
								{shortDate(latestStatement.periodStartDate)} — {shortDate(latestStatement.periodEndDate)}
							{:else}
								{shortDate(projection.cycle.previousPeriodStart)} — {shortDate(projection.cycle.previousPeriodEnd)}
							{/if}
						</p>
					</div>
					{#if latestStatement}
						<ActionButton
							type="button"
							intent="secondary"
							size="sm"
							onclick={() => {
								editingStatement = latestStatement;
								editStatementOpen = true;
							}}
						><PencilIcon />Editar</ActionButton>
					{:else}
						<ActionButton type="button" intent="secondary" size="sm" onclick={() => (statementOpen = true)}>Registrar</ActionButton>
					{/if}
				</div>

				{#if latestStatement}
					<div class="mt-4 grid gap-3 sm:grid-cols-2">
						<div>
							<p class="text-xs font-bold text-on-surface-muted">Fecha de corte</p>
							<p class="mt-1 text-sm font-bold text-on-surface">{formatIsoDate(latestStatement.statementDate)}</p>
						</div>
						<div>
							<p class="text-xs font-bold text-on-surface-muted">Fecha límite</p>
							<p class="mt-1 text-sm font-bold text-on-surface">{formatIsoDate(latestStatement.paymentDueDate)}</p>
						</div>
						<div>
							<p class="text-xs font-bold text-on-surface-muted">Saldo al corte</p>
							<p class="mt-1 text-sm font-bold text-on-surface">{formatAccountBalance(latestStatement.statementBalanceCents)}</p>
						</div>
						<div>
							<p class="text-xs font-bold text-on-surface-muted">Pagado</p>
							<p class="mt-1 text-sm font-bold text-on-surface">{formatAccountBalance(latestStatement.paidAmountCents)}</p>
						</div>
						<div>
							<p class="text-xs font-bold text-on-surface-muted">Pendiente</p>
							<p class="mt-1 text-sm font-bold text-on-surface">{formatAccountBalance(projection.outstandingPreviousStatementCents)}</p>
						</div>
						<div>
							<p class="text-xs font-bold text-on-surface-muted">Estado</p>
							<p class="mt-1 text-sm font-bold text-on-surface">{statementStatusLabel}</p>
						</div>
					</div>
				{:else}
					<p class="mt-4 rounded-md border border-outline bg-background px-4 py-5 text-sm font-semibold text-on-surface-muted">
						Registra el último corte conocido para separar la deuda que ya cerró del consumo del periodo abierto.
					</p>
				{/if}
			</div>

			<div class="rounded-lg border border-outline bg-surface p-5 shadow-sm">
				<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Periodo actual</p>
				<p class="mt-1 text-sm text-on-surface-muted">{shortDate(projection.cycle.currentPeriodStart)} — {shortDate(projection.cycle.currentPeriodEnd)}</p>

				<div class="mt-4 grid gap-3">
					<div class="flex items-center justify-between gap-3">
						<span class="text-sm text-on-surface-muted">Consumo normal estimado</span>
						<span class="font-bold text-on-surface">{formatAccountBalance(projection.presentationUnbilledNonInstallmentCents)}</span>
					</div>
					<div class="flex items-center justify-between gap-3">
						<span class="text-sm text-on-surface-muted">Próximos MSI</span>
						<span class="font-bold text-on-surface">{formatAccountBalance(projection.nextInstallmentsCents)}</span>
					</div>
					<div class="flex items-center justify-between gap-3 border-t border-outline pt-3">
						<span class="text-sm text-on-surface-muted">Nuevo consumo estimado</span>
						<span class="font-bold text-on-surface">{formatAccountBalance(projection.estimatedNewStatementChargesCents)}</span>
					</div>
					<div class="flex items-center justify-between gap-3">
						<span class="text-sm text-on-surface-muted">Próximo corte</span>
						<span class="font-bold text-on-surface">{formatIsoDate(projection.cycle.nextStatementDate)}</span>
					</div>
					<div class="flex items-center justify-between gap-3 border-t border-outline pt-3">
						<span class="text-sm text-on-surface-muted">Corte anterior pendiente</span>
						<span class="font-bold text-on-surface">{formatAccountBalance(projection.outstandingPreviousStatementCents)}</span>
					</div>
					<div class="flex items-center justify-between gap-3">
						<span class="text-sm text-on-surface-muted">Proyección base total</span>
						<span class="font-bold text-on-surface">{formatAccountBalance(projection.estimatedNextStatementBaseCents)}</span>
					</div>
				</div>

				<p class="mt-4 text-xs leading-5 text-on-surface-muted">
					Proyección aproximada; no incluye intereses, comisiones, IVA, bonificaciones, ajustes bancarios ni cargos todavía no registrados.
				</p>
				{#if projection.hasBalanceCompositionInconsistency}
					<p class="mt-4 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
						<AlertTriangleIcon class="mr-1 inline size-4" />El corte pendiente y los MSI futuros superan el saldo consumido actual.
					</p>
				{/if}
			</div>
		</section>

		<section class="rounded-lg border border-outline bg-surface shadow-sm">
			<div class="flex flex-col gap-3 border-b border-outline px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h3 class="text-lg font-bold text-on-surface">Historial de cortes</h3>
					<p class="mt-1 text-sm text-on-surface-muted">{statementHistory.length} registros guardados</p>
				</div>
				<ActionButton type="button" intent="secondary" onclick={() => (statementOpen = true)}>Registrar corte</ActionButton>
			</div>

			{#if statementHistory.length === 0}
				<div class="p-5 text-sm text-on-surface-muted">No hay cortes registrados para esta tarjeta.</div>
			{:else}
				<div class="grid gap-3 p-4">
					{#each statementHistory as statement (statement.id)}
						<article class="rounded-lg border border-outline bg-background p-4">
							<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
								<div>
									<h4 class="text-base font-bold text-on-surface">{formatIsoDate(statement.statementDate)}</h4>
									<p class="mt-1 text-xs font-semibold text-on-surface-muted">
										{shortDate(statement.periodStartDate)} — {shortDate(statement.periodEndDate)} · límite {shortDate(statement.paymentDueDate)}
									</p>
								</div>
								<ActionButton
									type="button"
									variant="ghost"
									size="icon-sm"
									onclick={() => {
										editingStatement = statement;
										editStatementOpen = true;
									}}
									aria-label={`Editar corte ${formatIsoDate(statement.statementDate)}`}
									title="Editar corte"
								><PencilIcon /></ActionButton>
							</div>

							<div class="mt-4 grid gap-3 sm:grid-cols-2">
								<div>
									<p class="text-xs font-bold text-on-surface-muted">Saldo al corte</p>
									<p class="mt-1 text-sm font-bold text-on-surface">{formatAccountBalance(statement.statementBalanceCents)}</p>
								</div>
								<div>
									<p class="text-xs font-bold text-on-surface-muted">Pagado</p>
									<p class="mt-1 text-sm font-bold text-on-surface">{formatAccountBalance(statement.paidAmountCents)}</p>
								</div>
							</div>
						</article>
					{/each}
				</div>
			{/if}
		</section>
	</Tabs.Content>

	<Tabs.Content value="installments" class="grid gap-4">
		<section class="rounded-lg border border-outline bg-surface shadow-sm">
			<div class="flex flex-col gap-3 border-b border-outline px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h3 class="text-lg font-bold text-on-surface">Compras a MSI</h3>
					<p class="mt-1 text-sm text-on-surface-muted">{purchaseSummary.activePurchases} activas · {purchaseSummary.completedPurchases} completadas</p>
				</div>
				<ActionButton type="button" onclick={() => (createOpen = true)}><PlusIcon />Registrar compra</ActionButton>
			</div>

			{#if purchases.length === 0}
				<div class="p-5 text-sm text-on-surface-muted">No hay compras MSI registradas para esta tarjeta.</div>
			{:else}
				<div class="grid gap-3 p-4">
					{#each purchases as purchase (purchase.id)}
						{@const amounts = getInstallmentAmounts(purchase)}
						{@const counts = getInstallmentCounts(purchase)}
						<article class="rounded-lg border border-outline bg-background p-4">
							<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
								<div class="min-w-0">
									<h4 class="truncate text-base font-bold text-on-surface">{purchase.description}</h4>
									<p class="mt-1 flex items-center gap-1 text-xs font-semibold text-on-surface-muted">
										<CalendarDaysIcon class="size-3.5" />{displayDate(purchase.purchaseDate)}
									</p>
								</div>
								<div class="flex shrink-0 gap-1">
									<ActionButton
										type="button"
										variant="ghost"
										size="icon-sm"
										onclick={() => {
											editingPurchase = purchase;
											editOpen = true;
										}}
										aria-label={`Editar ${purchase.description}`}
										title="Editar"
									><PencilIcon /></ActionButton>
									<ActionButton
										type="button"
										intent="danger"
										size="icon-sm"
										onclick={() => {
											deletingPurchase = purchase;
											deleteOpen = true;
										}}
										aria-label={`Eliminar ${purchase.description}`}
										title="Eliminar"
									><Trash2Icon /></ActionButton>
								</div>
							</div>

							<div class="mt-4 grid gap-3 sm:grid-cols-4">
								<div>
									<p class="text-xs font-bold text-on-surface-muted">Original</p>
									<p class="mt-1 text-sm font-bold text-on-surface">{formatAccountBalance(purchase.originalAmountCents)}</p>
								</div>
								<div>
									<p class="text-xs font-bold text-on-surface-muted">Pendiente</p>
									<p class="mt-1 text-sm font-bold text-on-surface">{formatAccountBalance(amounts.outstandingAmountCents)}</p>
								</div>
								<div>
									<p class="text-xs font-bold text-on-surface-muted">Cortado sin pagar</p>
									<p class="mt-1 text-sm font-bold text-on-surface">{formatAccountBalance(amounts.unpaidBilledAmountCents)}</p>
								</div>
								<div>
									<p class="text-xs font-bold text-on-surface-muted">Siguiente</p>
									<p class="mt-1 text-sm font-bold text-on-surface">{formatAccountBalance(amounts.nextInstallmentAmountCents)}</p>
								</div>
							</div>

							<div class="mt-4">
								<div class="flex items-center justify-between gap-3">
									<p class="text-xs font-bold text-on-surface-muted">{purchase.paidInstallments}/{purchase.totalInstallments} pagadas</p>
									<p class="text-xs font-bold text-on-surface-variant">{counts.remainingInstallments} restantes</p>
								</div>
								<div class="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
									<div class="h-full rounded-full bg-primary" style={`width: ${progressPercent(purchase)}%`}></div>
								</div>
							</div>
						</article>
					{/each}
				</div>
			{/if}
		</section>
	</Tabs.Content>
</Tabs.Root>

<Dialog.Root bind:open={statementOpen}>
	<Dialog.Content class="sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Registrar último corte</Dialog.Title>
			<Dialog.Description>Guarda el corte informado por el banco sin modificar el saldo consumido de la tarjeta.</Dialog.Description>
		</Dialog.Header>
		<CreditCardStatementForm
			mode="create"
			accountId={account.id}
			defaultValues={statementDraft}
			feedback={createStatementFeedback}
			onCancel={() => (statementOpen = false)}
		/>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={editStatementOpen}>
	<Dialog.Content class="sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Editar corte</Dialog.Title>
			<Dialog.Description>Actualiza el registro histórico sin modificar el saldo consumido de la tarjeta.</Dialog.Description>
		</Dialog.Header>
		{#if editingStatement}
			<CreditCardStatementForm
				mode="edit"
				accountId={account.id}
				statement={editingStatement}
				defaultValues={statementDraft}
				feedback={editStatementFeedback}
				onCancel={() => (editStatementOpen = false)}
			/>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={createOpen}>
	<Dialog.Content class="sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Registrar compra MSI</Dialog.Title>
			<Dialog.Description>Registra una compra histórica sin modificar el saldo consumido de la tarjeta.</Dialog.Description>
		</Dialog.Header>
		<InstallmentPurchaseForm mode="create" accountId={account.id} feedback={installmentFeedback} onCancel={() => (createOpen = false)} />
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={editOpen}>
	<Dialog.Content class="sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Editar compra MSI</Dialog.Title>
			<Dialog.Description>Actualiza la composición histórica de esta compra.</Dialog.Description>
		</Dialog.Header>
		{#if editingPurchase}
			<InstallmentPurchaseForm mode="edit" accountId={account.id} purchase={editingPurchase} feedback={installmentFeedback} onCancel={() => (editOpen = false)} />
		{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Eliminar compra MSI</Dialog.Title>
			<Dialog.Description>La compra dejará de explicar la composición del saldo de la tarjeta.</Dialog.Description>
		</Dialog.Header>
		{#if deletingPurchase}
			<DeleteInstallmentPurchaseForm purchase={deletingPurchase} feedback={installmentFeedback} onCancel={() => (deleteOpen = false)} />
		{/if}
	</Dialog.Content>
</Dialog.Root>
