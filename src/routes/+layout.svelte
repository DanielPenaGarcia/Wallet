<script lang="ts">
  import "../app.css";
  import { page } from "$app/state";
  import AppHeader from "$lib/modules/navigation/components/app-header/AppHeader.svelte";
  import AppSidebar from "$lib/modules/navigation/components/app-sidebar/AppSidebar.svelte";
  import type { LayoutData } from "./$types";
  import { toThemeCssVariables } from "$lib/utils/theme.utils";

  let {
    data,
    children,
  }: { data: LayoutData; children: import("svelte").Snippet } = $props();
  let sidebarOpen = $state(false);
  let currentPath = $derived(page.url.pathname);

  const themeStyle = $derived(
    `<style>:root{${toThemeCssVariables(data.colorPalette)}}</style>`,
  );
</script>

<svelte:head>
  {@html themeStyle}
</svelte:head>

<div class="min-h-screen bg-background text-on-background lg:flex">
  <AppSidebar
    {currentPath}
    isOpen={sidebarOpen}
    onClose={() => (sidebarOpen = false)}
  />
  <div class="min-w-0 flex-1">
    <AppHeader {currentPath} onOpenSidebar={() => (sidebarOpen = true)} />
    <main class="px-4 py-6 sm:px-6 lg:px-8">
      {@render children()}
    </main>
  </div>
</div>
