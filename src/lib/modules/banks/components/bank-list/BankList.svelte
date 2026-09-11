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
			<p class="mt-1 text-sm text-slate-500">Catálogo disponible para relacionar cuentas bancarias.</p>
		</div>
		<ActionButton type="button" intent="icon-primary" onclick={onCreate} aria-label="Agregar banco" title="Agregar banco"><PlusIcon /></ActionButton>
	</div>
	{#if banks.length === 0}
		<div class="px-6 py-12 text-center">
			<Building2Icon class="mx-auto size-9 text-blue-700" />
			<p class="mt-3 font-bold text-slate-700">Aún no hay bancos</p>
			<p class="mt-1 text-sm text-slate-500">Registra el primero antes de crear una cuenta bancaria.</p>
		</div>
	{:else}
		<ul class="divide-y divide-slate-100">
			{#each banks as bank (bank.id)}
				<li class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
					<span class="grid size-9 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700"><Building2Icon class="size-5" /></span>
					<div class="min-w-0 flex-1">
						<p class="font-bold text-slate-900">{bank.name}{bank.shortName ? ` (${bank.shortName})` : ''}</p>
						<p class="mt-1 text-sm text-slate-500">{bank.countryCode} · {bank.timeZone}</p>
					</div>
					<div class="flex items-center gap-1">
						<ActionButton type="button" intent="icon" onclick={() => onEdit(bank)} aria-label={`Editar banco ${bank.name}`} title="Editar banco"><PencilIcon /></ActionButton>
						<ActionButton type="button" intent="icon-danger" onclick={() => onDelete(bank)} aria-label={`Eliminar banco ${bank.name}`} title="Eliminar banco"><Trash2Icon /></ActionButton>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>
