<script lang="ts">
  import "../app.css";

  import { page } from "$app/state";

  import AppHeader from "$lib/modules/navigation/components/app-header/AppHeader.svelte";
  import AppMobileTabs from "$lib/modules/navigation/components/app-mobile-tabs/AppMobileTabs.svelte";
  import AppSidebar from "$lib/modules/navigation/components/app-sidebar/AppSidebar.svelte";

  import type { LayoutData } from "./$types";

  import {
    colorPaletteStorageKey,
    colorPaletteStyleElementId,
    toColorPaletteRootStyle,
  } from "$lib/shared/utils/color-palette";

  let {
    data,
    children,
  }: {
    data: LayoutData;
    children: import("svelte").Snippet;
  } = $props();

  let currentPath = $derived(page.url.pathname);

  let themeStyle = $derived(
    `<style id="${colorPaletteStyleElementId}">${toColorPaletteRootStyle(data.defaultColorPaletteCssVariables)}</style>`,
  );
  let themeInitializer = $derived(
    "<script>" + buildThemeInitializer(data.colorPaletteCssVariables) + "</" + "script>",
  );

  function safeJson(value: unknown) {
    return JSON.stringify(value).replaceAll("<", "\\u003c");
  }

  function buildThemeInitializer(colorPalettes: LayoutData["colorPaletteCssVariables"]) {
    return `
(() => {
  try {
    const storageKey = ${JSON.stringify(colorPaletteStorageKey)};
    const styleElementId = ${JSON.stringify(colorPaletteStyleElementId)};
    const palettes = ${safeJson(colorPalettes)};
    const selectedPaletteId = window.localStorage.getItem(storageKey);
    const selectedPalette = palettes.find((palette) => palette.id === selectedPaletteId);

    if (!selectedPalette) {
      if (selectedPaletteId) window.localStorage.removeItem(storageKey);
      return;
    }

    const styleElement = document.getElementById(styleElementId);
    if (styleElement) styleElement.textContent = 'html:root{' + selectedPalette.cssVariables + '}';
  } catch {
  }
})();
`;
  }
</script>

<svelte:head>
  {@html themeStyle}
  {@html themeInitializer}
</svelte:head>

<div class="min-h-screen bg-background text-on-background lg:flex">
  <AppSidebar {currentPath} />

  <div class="min-w-0 flex-1">
    <AppHeader {currentPath} />

    <main class="px-4 pt-6 pb-28 sm:px-6 lg:px-8 lg:pb-6">
      {@render children()}
    </main>
  </div>

  <AppMobileTabs {currentPath} />
</div>
