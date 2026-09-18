<script lang="ts">
	import Building2Icon from '@lucide/svelte/icons/building-2';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { ActionButton } from '$lib/components/ui/action-button';
	import type { BankListProps } from './props';

	let { banks, onCreate, onEdit, onDelete }: BankListProps = $props();
</script>

<section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
	<div class="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
		<div>
			<h2 class="text-lg font-bold text-slate-900">Bancos registrados</h2>
			<p class="mt-1 text-sm text-slate-500">Catálogo disponible para configurar cuentas bancarias.</p>
		</div>
		<ActionButton type="button" onclick={onCreate}><PlusIcon />Registrar</ActionButton>
	</div>
	{#if banks.length === 0}
		<div class="px-6 py-12 text-center">
			<Building2Icon class="mx-auto size-9 text-blue-700" />
			<p class="mt-3 font-bold text-slate-700">Aún no hay bancos</p>
			<p class="mt-1 text-sm text-slate-500">Cuando existan registros se mostrarán en esta sección.</p>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full min-w-[680px] text-left text-sm">
				<thead class="bg-slate-50 text-xs font-bold tracking-wide text-slate-500 uppercase">
					<tr>
						<th class="px-5 py-3">Banco</th>
						<th class="px-5 py-3">Alias</th>
						<th class="px-5 py-3">Color</th>
						<th class="px-5 py-3 text-right">Acciones</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each banks as bank (bank.id)}
						<tr>
							<td class="px-5 py-4">
								<div class="flex items-center gap-3">
									<span class="grid size-9 shrink-0 place-items-center rounded-full text-white" style={`background-color: ${bank.color}`}><Building2Icon class="size-5" /></span>
									<span class="font-bold text-slate-900">{bank.name}</span>
								</div>
							</td>
							<td class="px-5 py-4 text-slate-600">{bank.alias}</td>
							<td class="px-5 py-4">
								<div class="flex items-center gap-2 text-slate-600">
									<span class="size-5 rounded-full border border-slate-200" style={`background-color: ${bank.color}`}></span>
									<span class="font-mono text-xs">{bank.color}</span>
								</div>
							</td>
							<td class="px-5 py-4">
								<div class="flex justify-end gap-1">
									<ActionButton type="button" intent="icon" onclick={() => onEdit(bank)} aria-label={`Editar banco ${bank.name}`} title="Editar banco"><PencilIcon /></ActionButton>
									<ActionButton type="button" intent="icon-danger" onclick={() => onDelete(bank)} aria-label={`Eliminar banco ${bank.name}`} title="Eliminar banco"><Trash2Icon /></ActionButton>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>
