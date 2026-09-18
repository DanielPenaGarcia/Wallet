<script lang="ts">
  import * as Tabs from "$lib/components/ui/tabs";
  import BankSettings from "$lib/modules/banks/components/bank-settings/BankSettings.svelte";
  import CategorySettings from "$lib/modules/categories/components/category-settings/CategorySettings.svelte";
  import ApplicationSettings from "$lib/modules/settings/components/application-settings/ApplicationSettings.svelte";
  import type { BankFormFeedback } from "$lib/modules/banks/types/bank-form-feedback.types";
  import type { CategoryFormFeedback } from "$lib/modules/categories/types/category-form-feedback.types";
  import type { SettingsTabsProps } from "./props";

  let {
    banks,
    categories,
    categoryTree,
    colorPalettes,
    selectedColorPaletteId,
    feedback = null,
  }: SettingsTabsProps = $props();
  let isCategoryAction = $derived(
    feedback?.action?.endsWith("-category") ?? false,
  );
</script>

<Tabs.Root
  value={isCategoryAction ? "categories" : "application"}
  class="gap-5"
>
  <Tabs.List
    class="grid w-full grid-cols-3 gap-2 rounded-lg border border-outline bg-surface p-1.5 shadow-sm group-data-horizontal/tabs:h-14 sm:w-fit sm:min-w-lg"
  >
    <Tabs.Trigger value="application" class="h-8 px-4 py-3 font-bold"
      >Aplicación</Tabs.Trigger
    >
    <Tabs.Trigger value="banks" class="h-8 px-4 py-3 font-bold"
      >Bancos</Tabs.Trigger
    >
    <Tabs.Trigger value="categories" class="h-8 px-4 py-3 font-bold"
      >Categorías</Tabs.Trigger
    >
  </Tabs.List>
  <Tabs.Content value="application">
    <ApplicationSettings {colorPalettes} {selectedColorPaletteId} />
  </Tabs.Content>
  <Tabs.Content value="banks">
    <BankSettings
      {banks}
      feedback={isCategoryAction ? null : (feedback as BankFormFeedback | null)}
    />
  </Tabs.Content>
  <Tabs.Content value="categories">
    <CategorySettings
      {categories}
      {categoryTree}
      feedback={isCategoryAction ? (feedback as CategoryFormFeedback) : null}
    />
  </Tabs.Content>
</Tabs.Root>
