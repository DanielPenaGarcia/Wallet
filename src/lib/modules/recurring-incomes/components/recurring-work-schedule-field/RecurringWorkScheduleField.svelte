<script lang="ts">
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { untrack } from 'svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Label } from '$lib/components/ui/label';
	import type { TimeBlock, WorkDay, WorkSchedule } from '../../types/recurring-income.types';
	import { workDayOptions } from '../../utils/recurring-income-labels';
	import type { RecurringWorkScheduleFieldProps } from './props';

	type EditableBlock = TimeBlock & {
		id: number;
	};

	let { idPrefix, value = null, error }: RecurringWorkScheduleFieldProps = $props();
	let selectedDays = $state<WorkDay[]>(untrack(() => workDayOptions
		.filter((day) => (value?.[day.value]?.length ?? 0) > 0)
		.map((day) => day.value)));
	let schedule = $state<Record<WorkDay, EditableBlock[]>>(untrack(() => initialSchedule(value)));
	let nextBlockId = $state(untrack(() => maxBlockId(schedule) + 1));

	let scheduleValue = $derived(JSON.stringify(toWorkSchedule(schedule, selectedDays)));

	function initialSchedule(workSchedule: WorkSchedule | null) {
		return Object.fromEntries(workDayOptions.map((day) => {
			const blocks = workSchedule?.[day.value] ?? [{ startsAt: '09:00', endsAt: '17:00' }];
			return [
				day.value,
				blocks.map((block, index) => ({
					id: index + 1,
					startsAt: block.startsAt,
					endsAt: block.endsAt
				}))
			];
		})) as Record<WorkDay, EditableBlock[]>;
	}

	function maxBlockId(currentSchedule: Record<WorkDay, EditableBlock[]>) {
		return Math.max(0, ...Object.values(currentSchedule).flat().map((block) => block.id));
	}

	function toWorkSchedule(currentSchedule: Record<WorkDay, EditableBlock[]>, days: WorkDay[]) {
		const workSchedule: WorkSchedule = {};
		for (const day of days) {
			const blocks = currentSchedule[day]
				.filter((block) => block.startsAt && block.endsAt)
				.map((block) => ({ startsAt: block.startsAt, endsAt: block.endsAt }));
			if (blocks.length > 0) workSchedule[day] = blocks;
		}
		return workSchedule;
	}

	function toggleDay(day: WorkDay) {
		selectedDays = selectedDays.includes(day)
			? selectedDays.filter((selectedDay) => selectedDay !== day)
			: [...selectedDays, day];
	}

	function addTimeBlock(day: WorkDay) {
		schedule[day] = [...schedule[day], { id: nextBlockId, startsAt: '09:00', endsAt: '17:00' }];
		nextBlockId += 1;
	}

	function removeTimeBlock(day: WorkDay, id: number) {
		schedule[day] = schedule[day].filter((block) => block.id !== id);
	}
</script>

<div class="grid gap-3" aria-invalid={error ? 'true' : undefined}>
	<input type="hidden" name="workSchedule" value={scheduleValue} />

	<div class="grid gap-2">
		<span class="text-sm font-medium text-on-surface">Días laborales</span>
		<div class="grid grid-cols-4 gap-2 sm:grid-cols-7">
			{#each workDayOptions as day}
				<label
					class="flex h-12 cursor-pointer items-center justify-center rounded-md border text-sm font-bold transition {selectedDays.includes(day.value) ? 'border-primary bg-primary/10 text-primary' : 'border-outline bg-surface text-on-surface-variant hover:border-outline'}"
					title={day.label}
				>
					<input
						type="checkbox"
						checked={selectedDays.includes(day.value)}
						class="sr-only"
						aria-label={day.label}
						onchange={() => toggleDay(day.value)}
					/>
					<span aria-hidden="true">{day.shortLabel}</span>
				</label>
			{/each}
		</div>
	</div>

	{#each workDayOptions.filter((day) => selectedDays.includes(day.value)) as day (day.value)}
		<div class="grid gap-2 rounded-md border border-outline bg-surface-subtle p-3">
			<div class="flex items-center justify-between gap-3">
				<span class="text-sm font-bold text-on-surface">{day.label}</span>
				<ActionButton type="button" intent="secondary" onclick={() => addTimeBlock(day.value)}>
					<PlusIcon />
					Tramo
				</ActionButton>
			</div>

			<div class="grid gap-2">
				{#each schedule[day.value] as block, index (block.id)}
					<div class="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
						<div class="grid gap-1">
							<Label for={`${idPrefix}-${day.value}-${block.id}-start`}>Entrada {index + 1}</Label>
							<input
								id={`${idPrefix}-${day.value}-${block.id}-start`}
								type="time"
								required
								bind:value={block.startsAt}
								class="h-11 w-full rounded-md border border-outline bg-surface px-2.5 text-sm text-on-surface shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/50"
							/>
						</div>
						<div class="grid gap-1">
							<Label for={`${idPrefix}-${day.value}-${block.id}-end`}>Salida {index + 1}</Label>
							<input
								id={`${idPrefix}-${day.value}-${block.id}-end`}
								type="time"
								required
								bind:value={block.endsAt}
								class="h-11 w-full rounded-md border border-outline bg-surface px-2.5 text-sm text-on-surface shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/50"
							/>
						</div>
						<ActionButton
							type="button"
							intent="danger"
							size="icon-sm"
							onclick={() => removeTimeBlock(day.value, block.id)}
							disabled={schedule[day.value].length === 1}
							aria-label={`Eliminar tramo ${index + 1} de ${day.label}`}
							title="Eliminar tramo"
						>
							<Trash2Icon />
						</ActionButton>
					</div>
				{/each}
			</div>
		</div>
	{/each}

	{#if error}<span class="text-xs text-destructive">{error}</span>{/if}
</div>
