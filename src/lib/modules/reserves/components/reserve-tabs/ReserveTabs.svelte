<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import ReserveBasicsSection from '../reserve-basics-section/ReserveBasicsSection.svelte';
	import ReservePeriodSection from '../reserve-period-section/ReservePeriodSection.svelte';
	import type { ReserveTabsProps } from './props';

	let { summary, debitCards, feedback = null }: ReserveTabsProps = $props();
</script>

{#if feedback?.success}
	<p class="rounded-md border border-secondary/20 bg-secondary/10 px-4 py-3 text-sm font-semibold text-secondary">{feedback.success}</p>
{/if}

<Tabs.Root value="basic" class="gap-5">
	<Tabs.List class="grid w-full grid-cols-1 gap-2 rounded-lg border border-outline bg-surface p-1.5 shadow-sm group-data-horizontal/tabs:h-14 sm:w-fit sm:min-w-48">
		<Tabs.Trigger value="basic" class="h-8 px-4 py-3 font-bold">Básicos</Tabs.Trigger>
	</Tabs.List>

	<Tabs.Content value="basic">
		<Tabs.Root value="detail" class="gap-5">
			<Tabs.List class="grid w-full grid-cols-2 gap-2 rounded-lg border border-outline bg-surface p-1.5 shadow-sm group-data-horizontal/tabs:h-auto sm:w-fit sm:min-w-xl sm:grid-cols-4">
				<Tabs.Trigger value="detail" class="h-8 px-4 py-3 font-bold">Detalle</Tabs.Trigger>
				<Tabs.Trigger value="weekly" class="h-8 px-4 py-3 font-bold">Semana</Tabs.Trigger>
				<Tabs.Trigger value="semimonthly" class="h-8 px-4 py-3 font-bold">Quincena</Tabs.Trigger>
				<Tabs.Trigger value="monthly" class="h-8 px-4 py-3 font-bold">Mes</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="detail">
				<ReserveBasicsSection {summary} {debitCards} {feedback} />
			</Tabs.Content>

			<Tabs.Content value="weekly">
				<ReservePeriodSection {summary} period="weekly" />
			</Tabs.Content>

			<Tabs.Content value="semimonthly">
				<ReservePeriodSection {summary} period="semimonthly" />
			</Tabs.Content>

			<Tabs.Content value="monthly">
				<ReservePeriodSection {summary} period="monthly" />
			</Tabs.Content>
		</Tabs.Root>
	</Tabs.Content>
</Tabs.Root>
