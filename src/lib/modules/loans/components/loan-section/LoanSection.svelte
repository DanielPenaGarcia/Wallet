<script lang="ts">
	import { untrack } from 'svelte';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { ActionButton } from '$lib/components/ui/action-button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Tabs from '$lib/components/ui/tabs';
	import LoanForm from '../loan-form/LoanForm.svelte';
	import LoanList from '../loan-list/LoanList.svelte';
	import type { LoanSectionProps } from './props';

	let { loans, cards, feedback = null }: LoanSectionProps = $props();
	let createOpen = $state(untrack(() => feedback?.action === 'create-loan' && Boolean(feedback.errors || feedback.message)));
	let borrowedLoans = $derived(loans.filter((loan) => loan.direction === 'borrowed'));
	let lentLoans = $derived(loans.filter((loan) => loan.direction === 'lent'));
</script>

{#if feedback?.success}<p class="mb-5 break-words rounded-md border border-secondary/20 bg-secondary/10 px-4 py-3 text-sm font-semibold text-secondary">{feedback.success}</p>{/if}

<section class="grid gap-5">
	<div class="flex flex-col gap-3 rounded-lg border border-outline bg-surface p-4 shadow-sm sm:p-5 md:flex-row md:items-center md:justify-between">
		<div class="min-w-0">
			<h2 class="text-lg font-bold text-on-surface">Préstamos</h2>
			<p class="mt-1 break-words text-sm text-on-surface-muted">Separa deuda por pagar y dinero por cobrar sin mezclarlo con ingresos o gastos.</p>
		</div>
		<ActionButton type="button" class="w-full md:w-auto" onclick={() => (createOpen = true)}><PlusIcon />Nuevo préstamo</ActionButton>
	</div>

	<Tabs.Root value="borrowed" class="grid gap-4">
		<Tabs.List class="grid h-auto w-full grid-cols-2 gap-2">
			<Tabs.Trigger value="borrowed">Por pagar</Tabs.Trigger>
			<Tabs.Trigger value="lent">Por cobrar</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="borrowed"><LoanList loans={borrowedLoans} /></Tabs.Content>
		<Tabs.Content value="lent"><LoanList loans={lentLoans} /></Tabs.Content>
	</Tabs.Root>
</section>

<Dialog.Root bind:open={createOpen}>
	<Dialog.Content class="max-h-[min(90vh,760px)] overflow-y-auto sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Nuevo préstamo</Dialog.Title>
			<Dialog.Description>Registra el principal real y el total contractual del préstamo.</Dialog.Description>
		</Dialog.Header>
		<LoanForm {cards} {feedback} onCancel={() => (createOpen = false)} />
	</Dialog.Content>
</Dialog.Root>
