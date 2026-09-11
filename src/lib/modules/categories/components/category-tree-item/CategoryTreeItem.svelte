<script lang="ts">
	import CategoryTreeItem from './CategoryTreeItem.svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import type { CategoryTreeItemProps } from './props';

	let { category, depth = 0, onAddChild, onEdit, onDelete }: CategoryTreeItemProps = $props();
</script>

<li>
	<div class="flex min-h-12 items-center gap-3 border-b border-slate-100 px-3 py-2 last:border-b-0" style:padding-left={`${depth * 1.25 + 0.75}rem`}>
		<span class="size-3 shrink-0 rounded-full ring-2 ring-white shadow-sm" style:background-color={category.color}></span>
		<div class="min-w-0 flex-1">
			<p class="truncate font-semibold text-slate-800">{category.name}</p>
			{#if category.children.length > 0}<p class="text-xs text-slate-400">{category.children.length} {category.children.length === 1 ? 'subcategoría' : 'subcategorías'}</p>{/if}
		</div>
		<span class="font-mono text-xs text-slate-400">{category.color.toUpperCase()}</span>
		<ActionButton type="button" intent="icon-primary" onclick={() => onAddChild(category)} aria-label={`Crear subcategoría dentro de ${category.name}`} title="Agregar subcategoría"><PlusIcon /></ActionButton>
		<ActionButton type="button" intent="icon" onclick={() => onEdit(category)} aria-label={`Editar ${category.name}`} title="Editar categoría"><PencilIcon /></ActionButton>
		<ActionButton type="button" intent="icon-danger" onclick={() => onDelete(category)} aria-label={`Eliminar ${category.name}`} title="Eliminar categoría"><Trash2Icon /></ActionButton>
	</div>
	{#if category.children.length > 0}
		<ul>
			{#each category.children as child (child.id)}
				<CategoryTreeItem category={child} depth={depth + 1} {onAddChild} {onEdit} {onDelete} />
			{/each}
		</ul>
	{/if}
</li>
