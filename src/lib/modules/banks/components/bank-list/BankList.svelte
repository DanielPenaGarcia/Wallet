<script lang="ts">
	import Building2Icon from '@lucide/svelte/icons/building-2';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { ActionButton } from '$lib/components/ui/action-button';
	import type { BankListProps } from './props';

	let { banks, onCreate, onEdit, onDelete }: BankListProps = $props();
</script>

<section class="overflow-hidden rounded-lg border border-outline bg-surface shadow-sm">
	<div class="flex flex-col gap-3 border-b border-outline px-4 py-4 sm:px-5 md:flex-row md:items-center md:justify-between">
		<div class="min-w-0">
			<h2 class="text-lg font-bold text-on-surface">Bancos registrados</h2>
			<p class="mt-1 break-words text-sm text-on-surface-muted">Catálogo disponible para configurar cuentas bancarias.</p>
		</div>
		<ActionButton type="button" class="w-full md:w-auto" onclick={onCreate}><PlusIcon />Registrar</ActionButton>
	</div>
	{#if banks.length === 0}
		<div class="px-6 py-12 text-center">
			<Building2Icon class="mx-auto size-9 text-primary" />
			<p class="mt-3 font-bold text-on-surface-variant">Aún no hay bancos</p>
			<p class="mt-1 text-sm text-on-surface-muted">Cuando existan registros se mostrarán en esta sección.</p>
		</div>
	{:else}
		<div class="grid gap-3 p-4 md:hidden">
			{#each banks as bank (bank.id)}
				<article class="rounded-md bg-surface-subtle p-4">
					<div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
						<div class="flex min-w-0 items-center gap-3">
							<span class="grid size-10 shrink-0 place-items-center rounded-full text-on-primary" style={`background-color: ${bank.color}`}><Building2Icon class="size-5" /></span>
							<div class="min-w-0">
								<p class="break-words font-bold text-on-surface">{bank.name}</p>
								<p class="break-words text-sm text-on-surface-muted">{bank.alias}</p>
							</div>
						</div>
						<div class="flex items-center gap-2 text-on-surface-variant sm:justify-end">
							<span class="size-5 rounded-full border border-outline" style={`background-color: ${bank.color}`}></span>
							<span class="break-all font-mono text-xs">{bank.color}</span>
						</div>
					</div>
					<div class="mt-4 grid grid-cols-2 gap-2">
						<ActionButton type="button" variant="ghost" class="w-full" onclick={() => onEdit(bank)} aria-label={`Editar banco ${bank.name}`} title="Editar banco"><PencilIcon /></ActionButton>
						<ActionButton type="button" intent="danger" class="w-full" onclick={() => onDelete(bank)} aria-label={`Eliminar banco ${bank.name}`} title="Eliminar banco"><Trash2Icon /></ActionButton>
					</div>
				</article>
			{/each}
		</div>
		<div class="hidden overflow-x-auto md:block">
			<table class="w-full min-w-[680px] text-left text-sm">
				<thead class="bg-surface-subtle text-xs font-bold tracking-wide text-on-surface-muted uppercase">
					<tr>
						<th class="px-5 py-3">Banco</th>
						<th class="px-5 py-3">Alias</th>
						<th class="px-5 py-3">Color</th>
						<th class="px-5 py-3 text-right">Acciones</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-outline">
					{#each banks as bank (bank.id)}
						<tr>
							<td class="px-5 py-4">
								<div class="flex items-center gap-3">
									<span class="grid size-9 shrink-0 place-items-center rounded-full text-on-primary" style={`background-color: ${bank.color}`}><Building2Icon class="size-5" /></span>
									<span class="font-bold text-on-surface">{bank.name}</span>
								</div>
							</td>
							<td class="px-5 py-4 text-on-surface-variant">{bank.alias}</td>
							<td class="px-5 py-4">
								<div class="flex items-center gap-2 text-on-surface-variant">
									<span class="size-5 rounded-full border border-outline" style={`background-color: ${bank.color}`}></span>
									<span class="font-mono text-xs">{bank.color}</span>
								</div>
							</td>
							<td class="px-5 py-4">
								<div class="flex justify-end gap-1">
									<ActionButton type="button" variant="ghost" size="icon-sm" onclick={() => onEdit(bank)} aria-label={`Editar banco ${bank.name}`} title="Editar banco"><PencilIcon /></ActionButton>
									<ActionButton type="button" intent="danger" size="icon-sm" onclick={() => onDelete(bank)} aria-label={`Eliminar banco ${bank.name}`} title="Eliminar banco"><Trash2Icon /></ActionButton>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>
