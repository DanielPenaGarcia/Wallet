<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { Movement } from '../../types/movement.types';
	import type { ExportMovementsFormProps } from './props';

	let { movements }: ExportMovementsFormProps = $props();
	let startDate = $state('');
	let endDate = $state('');
	let message = $state('');
	let messageKind = $state<'success' | 'error'>('success');
	let isCopying = $state(false);

	function movementDate(movement: Movement) {
		return movement.occurredAt.slice(0, 10);
	}

	function filteredMovements() {
		return movements.filter((movement) => {
			const occurredDate = movementDate(movement);
			return (!startDate || occurredDate >= startDate) && (!endDate || occurredDate <= endDate);
		});
	}

	function exportPayload(items: Movement[]) {
		return {
			exportedAt: new Date().toISOString(),
			period: {
				from: startDate || null,
				to: endDate || null
			},
			count: items.length,
			movements: items
		};
	}

	async function copyJson(event: SubmitEvent) {
		event.preventDefault();
		message = '';

		if (startDate && endDate && startDate > endDate) {
			messageKind = 'error';
			message = 'La fecha inicial debe ser anterior o igual a la fecha final.';
			return;
		}

		const items = filteredMovements();
		if (items.length === 0) {
			messageKind = 'error';
			message = 'No hay movimientos en ese periodo.';
			return;
		}

		isCopying = true;
		try {
			await navigator.clipboard.writeText(JSON.stringify(exportPayload(items), null, 2));
			messageKind = 'success';
			message = `${items.length} ${items.length === 1 ? 'movimiento copiado' : 'movimientos copiados'} al portapapeles.`;
		} catch {
			messageKind = 'error';
			message = 'No se pudo copiar al portapapeles.';
		} finally {
			isCopying = false;
		}
	}
</script>

<form class="grid gap-4 sm:grid-cols-2" onsubmit={copyJson}>
	<div class="grid gap-2">
		<Label for="export-movements-start">Desde</Label>
		<Input id="export-movements-start" bind:value={startDate} type="date" class="h-11 border-slate-300" />
	</div>
	<div class="grid gap-2">
		<Label for="export-movements-end">Hasta</Label>
		<Input id="export-movements-end" bind:value={endDate} type="date" class="h-11 border-slate-300" />
	</div>

	{#if message}
		<p class="rounded-md px-3 py-2 text-sm font-semibold {messageKind === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'} sm:col-span-2">{message}</p>
	{/if}

	<div class="flex justify-end sm:col-span-2">
		<ActionButton type="submit" disabled={isCopying || movements.length === 0}>{isCopying ? 'Copiando...' : 'Copiar JSON'}</ActionButton>
	</div>
</form>
