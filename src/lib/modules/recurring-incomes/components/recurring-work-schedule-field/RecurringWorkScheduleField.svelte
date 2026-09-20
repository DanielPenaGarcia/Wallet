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
	let timeBlocks = $state<EditableBlock[]>(untrack(() => initialTimeBlocks(value)));
	let nextBlockId = $state(untrack(() => timeBlocks.length + 1));

	let scheduleValue = $derived(JSON.stringify(toWorkSchedule(timeBlocks, selectedDays)));

	function initialTimeBlocks(workSchedule: WorkSchedule | null) {
		const firstScheduledDay = workDayOptions.find((day) => (workSchedule?.[day.value]?.length ?? 0) > 0);
		const blocks = firstScheduledDay ? workSchedule?.[firstScheduledDay.value] : null;
		return (blocks?.length ? blocks : [{ startsAt: '09:00', endsAt: '17:00' }]).map((block, index) => ({
			id: index + 1,
			startsAt: block.startsAt,
			endsAt: block.endsAt
		}));
	}

	function toWorkSchedule(blocks: EditableBlock[], days: WorkDay[]) {
		const workSchedule: WorkSchedule = {};
		const validBlocks = blocks
			.filter((block) => block.startsAt && block.endsAt)
			.map((block) => ({ startsAt: block.startsAt, endsAt: block.endsAt }));

		if (validBlocks.length === 0) return workSchedule;

		for (const day of days) {
			workSchedule[day] = validBlocks;
		}

		return workSchedule;
	}

	function toggleDay(day: WorkDay) {
		selectedDays = selectedDays.includes(day)
			? selectedDays.filter((selectedDay) => selectedDay !== day)
			: [...selectedDays, day];
	}

	function addTimeBlock() {
		timeBlocks = [...timeBlocks, { id: nextBlockId, startsAt: '09:00', endsAt: '17:00' }];
		nextBlockId += 1;
	}

	function removeTimeBlock(id: number) {
		timeBlocks = timeBlocks.filter((block) => block.id !== id);
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

	<div class="grid gap-2 rounded-md border border-outline bg-surface-subtle p-3">
		<div class="flex items-center justify-between gap-3">
			<span class="text-sm font-bold text-on-surface">Tramos</span>
			<ActionButton type="button" intent="secondary" onclick={addTimeBlock}>
				<PlusIcon />
				Agregar tramo
			</ActionButton>
		</div>

		<div class="grid gap-2">
			{#each timeBlocks as block, index (block.id)}
				<div class="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
					<div class="grid gap-1">
						<Label for={`${idPrefix}-work-schedule-${block.id}-start`}>Entrada {index + 1}</Label>
						<input
							id={`${idPrefix}-work-schedule-${block.id}-start`}
							type="time"
							required
							bind:value={block.startsAt}
							class="h-11 w-full rounded-md border border-outline bg-surface px-2.5 text-sm text-on-surface shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/50"
						/>
					</div>
					<div class="grid gap-1">
						<Label for={`${idPrefix}-work-schedule-${block.id}-end`}>Salida {index + 1}</Label>
						<input
							id={`${idPrefix}-work-schedule-${block.id}-end`}
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
						onclick={() => removeTimeBlock(block.id)}
						disabled={timeBlocks.length === 1}
						aria-label={`Eliminar tramo ${index + 1}`}
						title="Eliminar tramo"
					>
						<Trash2Icon />
					</ActionButton>
				</div>
			{/each}
		</div>
	</div>

	{#if error}<span class="text-xs text-destructive">{error}</span>{/if}
</div>
