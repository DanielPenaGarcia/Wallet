<script lang="ts">
	import ReceiptTextIcon from '@lucide/svelte/icons/receipt-text';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import * as Tabs from '$lib/components/ui/tabs';
	import RecurringIncomeSection from '$lib/modules/recurring-incomes/components/recurring-income-section/RecurringIncomeSection.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let defaultTab = $derived(form?.action?.endsWith('recurring-income') ? 'income' : 'expenses');
</script>

<section class="grid gap-6">
	<div>
		<p class="text-sm font-semibold text-primary">Recurrentes</p>
		<h2 class="mt-1 text-2xl font-bold text-on-background">Recurrentes</h2>
		<p class="mt-2 text-sm text-on-surface-muted">Organiza movimientos periódicos de gastos e ingresos.</p>
	</div>

	<Tabs.Root value={defaultTab} class="gap-5">
		<Tabs.List
			class="grid w-full grid-cols-2 gap-2 rounded-lg border border-outline bg-surface p-1.5 shadow-sm group-data-horizontal/tabs:h-14 sm:w-fit sm:min-w-80"
		>
			<Tabs.Trigger value="expenses" class="h-8 px-4 py-3 font-bold">
				<ReceiptTextIcon class="size-4" />
				Gastos
			</Tabs.Trigger>
			<Tabs.Trigger value="income" class="h-8 px-4 py-3 font-bold">
				<TrendingUpIcon class="size-4" />
				Ingresos
			</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="expenses">
			<section class="overflow-hidden rounded-lg border border-outline bg-surface shadow-sm">
				<div class="border-b border-outline px-5 py-4">
					<h3 class="text-base font-bold text-on-surface">Gastos recurrentes</h3>
					<p class="mt-1 text-sm text-on-surface-muted">Pagos periódicos registrados para seguimiento.</p>
				</div>
				<div class="grid min-h-64 place-items-center px-6 py-12 text-center">
					<div class="max-w-sm">
						<span class="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
							<ReceiptTextIcon class="size-6" />
						</span>
						<p class="mt-4 text-sm font-semibold text-on-surface">Sin gastos recurrentes</p>
						<p class="mt-1 text-sm text-on-surface-muted">Los gastos periódicos aparecerán aquí.</p>
					</div>
				</div>
			</section>
		</Tabs.Content>

		<Tabs.Content value="income">
			<RecurringIncomeSection incomes={data.recurringIncomes} feedback={form ?? null} />
		</Tabs.Content>
	</Tabs.Root>
</section>
