<script lang="ts" module>
	type WorkDayValue =
		| 'monday'
		| 'tuesday'
		| 'wednesday'
		| 'thursday'
		| 'friday'
		| 'saturday'
		| 'sunday';

	type TimeBlock = {
		id: number;
		startsAt: string;
		endsAt: string;
	};

	const dayOptions: { value: WorkDayValue; label: string; shortLabel: string }[] = [
		{ value: 'monday', label: 'Lunes', shortLabel: 'L' },
		{ value: 'tuesday', label: 'Martes', shortLabel: 'M' },
		{ value: 'wednesday', label: 'Miércoles', shortLabel: 'X' },
		{ value: 'thursday', label: 'Jueves', shortLabel: 'J' },
		{ value: 'friday', label: 'Viernes', shortLabel: 'V' },
		{ value: 'saturday', label: 'Sábado', shortLabel: 'S' },
		{ value: 'sunday', label: 'Domingo', shortLabel: 'D' }
	];

	const weekdayValues: WorkDayValue[] = [
		'monday',
		'tuesday',
		'wednesday',
		'thursday',
		'friday'
	];

	const defaultBlocks: TimeBlock[] = [
		{ id: 1, startsAt: '08:00', endsAt: '13:00' },
		{ id: 2, startsAt: '15:00', endsAt: '18:00' }
	];

	function listLabels(labels: string[]) {
		if (labels.length === 0) return '';
		if (labels.length === 1) return labels[0];
		return `${labels.slice(0, -1).join(', ')} y ${labels.at(-1)}`;
	}

	function parseTimePart(hour: string, minute = '00', period = '') {
		let parsedHour = Number(hour);
		const parsedMinute = Number(minute);
		const normalizedPeriod = period.toLowerCase();

		if (normalizedPeriod === 'pm' && parsedHour < 12) parsedHour += 12;
		if (normalizedPeriod === 'am' && parsedHour === 12) parsedHour = 0;
		if (Number.isNaN(parsedHour) || Number.isNaN(parsedMinute)) return null;
		if (parsedHour < 0 || parsedHour > 23 || parsedMinute < 0 || parsedMinute > 59) return null;

		return `${String(parsedHour).padStart(2, '0')}:${String(parsedMinute).padStart(2, '0')}`;
	}

	function parseTimeBlocks(value: string) {
		const blocks: TimeBlock[] = [];
		const timeRangePattern =
			/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*a\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/gi;
		let match: RegExpExecArray | null;

		while ((match = timeRangePattern.exec(value)) !== null) {
			const startsAt = parseTimePart(match[1], match[2] ?? '00', match[3] ?? '');
			const endsAt = parseTimePart(match[4], match[5] ?? '00', match[6] ?? '');
			if (startsAt && endsAt) blocks.push({ id: blocks.length + 1, startsAt, endsAt });
		}

		return blocks.length > 0 ? blocks : defaultBlocks;
	}

	function parseDays(value: string) {
		const normalizedValue = value.toLowerCase();
		if (normalizedValue.includes('lunes a viernes')) return weekdayValues;

		const days = dayOptions
			.filter((day) => normalizedValue.includes(day.label.toLowerCase()))
			.map((day) => day.value);

		return days.length > 0 ? days : weekdayValues;
	}

	function formatTimeLabel(value: string) {
		const [hour = '0', minute = '00'] = value.split(':');
		const parsedHour = Number(hour);
		const suffix = parsedHour >= 12 ? 'pm' : 'am';
		const displayHour = parsedHour % 12 === 0 ? 12 : parsedHour % 12;
		return `${displayHour}:${minute} ${suffix}`;
	}
</script>

<script lang="ts">
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { untrack } from 'svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Label } from '$lib/components/ui/label';
	import type { WorkScheduleFieldProps } from './props';

	let { idPrefix, value = null, error }: WorkScheduleFieldProps = $props();
	let selectedDays = $state<WorkDayValue[]>(untrack(() => parseDays(value ?? '')));
	let timeBlocks = $state<TimeBlock[]>(untrack(() => parseTimeBlocks(value ?? '')));
	let nextBlockId = $state(untrack(() => timeBlocks.length + 1));

	let scheduleValue = $derived.by(() => {
		const selectedDayLabels = dayOptions
			.filter((day) => selectedDays.includes(day.value))
			.map((day) => day.label);
		const validBlocks = timeBlocks.filter((block) => block.startsAt && block.endsAt);

		if (selectedDayLabels.length === 0 || validBlocks.length === 0) return '';

		return `${listLabels(selectedDayLabels)}, ${listLabels(
			validBlocks.map(
				(block) => `de ${formatTimeLabel(block.startsAt)} a ${formatTimeLabel(block.endsAt)}`
			)
		)}`;
	});

	function toggleDay(day: WorkDayValue) {
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
	<input type="hidden" name="schedule" value={scheduleValue} />

	<div class="grid gap-2">
		<span class="text-sm font-medium text-slate-900">Días</span>
		<div class="grid grid-cols-4 gap-2 sm:grid-cols-7">
			{#each dayOptions as day}
				<label
					class="flex h-12 cursor-pointer items-center justify-center rounded-md border text-sm font-bold transition {selectedDays.includes(day.value) ? 'border-blue-700 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}"
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

	<div class="grid gap-2">
		<div class="flex items-center justify-between gap-3">
			<span class="text-sm font-medium text-slate-900">Tramos</span>
			<ActionButton type="button" intent="secondary" onclick={addTimeBlock}>
				<PlusIcon />
				Agregar tramo
			</ActionButton>
		</div>

		<div class="grid gap-2">
			{#each timeBlocks as block, index (block.id)}
				<div class="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
					<div class="grid gap-1">
						<Label for={`${idPrefix}-schedule-${block.id}-start`}>Entrada {index + 1}</Label>
						<input
							id={`${idPrefix}-schedule-${block.id}-start`}
							type="time"
							required
							bind:value={block.startsAt}
							class="h-11 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
						/>
					</div>
					<div class="grid gap-1">
						<Label for={`${idPrefix}-schedule-${block.id}-end`}>Salida {index + 1}</Label>
						<input
							id={`${idPrefix}-schedule-${block.id}-end`}
							type="time"
							required
							bind:value={block.endsAt}
							class="h-11 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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

	<p class="rounded-md bg-slate-50 px-3 py-2 text-xs font-semibold leading-5 text-slate-600">
		{scheduleValue || 'Selecciona al menos un día y un tramo.'}
	</p>

	{#if error}<span class="text-xs text-red-700">{error}</span>{/if}
</div>
