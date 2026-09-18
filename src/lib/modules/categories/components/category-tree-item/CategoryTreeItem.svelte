<script lang="ts">
  import CategoryTreeItem from "./CategoryTreeItem.svelte";
  import { ActionButton } from "$lib/components/ui/action-button";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import PencilIcon from "@lucide/svelte/icons/pencil";
  import Trash2Icon from "@lucide/svelte/icons/trash-2";
  import type { CategoryTreeItemProps } from "./props";

  let {
    category,
    depth = 0,
    expandedIds,
    searching = false,
    onToggleExpanded,
    onAddChild,
    onEdit,
    onDelete,
  }: CategoryTreeItemProps = $props();
  let isChild = $derived(category.parentId !== null);
  let hasChildren = $derived(category.children.length > 0);
  let isExpanded = $derived(searching || expandedIds.includes(category.id));
</script>

<li>
  <div
    class="flex min-h-12 items-center gap-3 border-b border-outline px-3 py-2 last:border-b-0"
    style:padding-left={`${depth * 1.25 + 0.75}rem`}
  >
    {#if hasChildren}
      <button
        type="button"
        class="grid size-8 shrink-0 place-items-center rounded-md text-on-surface-muted hover:bg-surface-hover hover:text-on-surface focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        onclick={() => onToggleExpanded(category.id)}
        aria-expanded={isExpanded}
        aria-label={isExpanded
          ? `Ocultar subcategorías de ${category.name}`
          : `Mostrar subcategorías de ${category.name}`}
        disabled={searching}
        title={isExpanded ? "Colapsar" : "Expandir"}
      >
        {#if isExpanded}<ChevronDownIcon
            class="size-4"
          />{:else}<ChevronRightIcon class="size-4" />{/if}
      </button>
    {:else}
      <span class="size-8 shrink-0"></span>
    {/if}
    {#if !isChild}<span
        class="size-3 shrink-0 rounded-full ring-2 ring-surface shadow-sm"
        style:background-color={category.color ?? "#64748b"}
      ></span>{/if}
    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-2">
        <p class="truncate font-semibold text-on-surface">{category.name}</p>
        {#if category.isEssential}<span
            class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary"
            >Esencial</span
          >{/if}
      </div>
      {#if category.children.length > 0}<p class="text-xs text-on-surface-muted">
          {category.children.length}
          {category.children.length === 1 ? "subcategoría" : "subcategorías"}
        </p>{/if}
    </div>
    {#if !isChild && category.color}<span
        class="font-mono text-xs text-on-surface-muted"
        >{category.color.toUpperCase()}</span
      >{/if}
    {#if !isChild}
      <ActionButton
        type="button"
        intent="primary"
        size="icon-sm"
        onclick={() => onAddChild(category)}
        aria-label={`Crear subcategoría dentro de ${category.name}`}
        title="Agregar subcategoría"><PlusIcon /></ActionButton
      >
    {/if}
    <ActionButton
      type="button"
      variant="ghost"
      size="icon-sm"
      onclick={() => onEdit(category)}
      aria-label={`Editar ${category.name}`}
      title="Editar categoría"><PencilIcon /></ActionButton
    >
    <ActionButton
      type="button"
      intent="danger"
      size="icon-sm"
      onclick={() => onDelete(category)}
      aria-label={`Eliminar ${category.name}`}
      title="Eliminar categoría"><Trash2Icon /></ActionButton
    >
  </div>
  {#if hasChildren && isExpanded}
    <ul>
      {#each category.children as child (child.id)}
        <CategoryTreeItem
          category={child}
          depth={depth + 1}
          {expandedIds}
          {searching}
          {onToggleExpanded}
          {onAddChild}
          {onEdit}
          {onDelete}
        />
      {/each}
    </ul>
  {/if}
</li>
