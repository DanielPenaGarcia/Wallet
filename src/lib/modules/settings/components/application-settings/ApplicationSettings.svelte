<script lang="ts">
	import { browser } from '$app/environment';
	import { untrack } from 'svelte';
	import { Input } from '$lib/components/ui/input';
	import { ActionButton } from '$lib/components/ui/action-button';
	import * as Select from '$lib/components/ui/select';
	import { Label } from '$lib/components/ui/label';
	import {
		buildColorPaletteCssVariables,
		buildColorPaletteTokens,
		colorPaletteStorageKey,
		colorPaletteStyleElementId,
		toColorPaletteCssVariables,
		toColorPaletteRootStyle
	} from '$lib/shared/utils/color-palette';
	import {
		defaultApplicationProfile,
		dispatchApplicationProfileChanged,
		readApplicationProfile,
		writeApplicationProfile
	} from '$lib/shared/utils/application-profile';
	import type { ColorPaletteRole } from '$lib/modules/color-palettes/types/color-palette.types';
	import type { ApplicationSettingsProps } from './props';

	const paletteRoles: ColorPaletteRole[] = ['primary', 'secondary', 'tertiary', 'background', 'surface'];

	let { colorPalettes, selectedColorPaletteId, feedback = null }: ApplicationSettingsProps = $props();
	let applicationProfile = $state(untrack(() => browser ? readApplicationProfile(localStorage) : defaultApplicationProfile));
	let restoredApplicationProfile = $state(false);
	let selectedPaletteId = $state(untrack(() => {
		const initialPaletteId = selectedColorPaletteId ?? colorPalettes[0]?.id ?? '';
		return browser ? localStorage.getItem(colorPaletteStorageKey) ?? initialPaletteId : initialPaletteId;
	}));
	let restoredStoredPalette = $state(false);
	let selectedPalette = $derived(colorPalettes.find((palette) => palette.id === selectedPaletteId) ?? colorPalettes[0] ?? null);
	let selectedTokens = $derived(selectedPalette ? buildColorPaletteTokens(selectedPalette) : null);

	$effect(() => {
		if (!browser || restoredApplicationProfile) return;
		applicationProfile = readApplicationProfile(localStorage);
		restoredApplicationProfile = true;
	});

	$effect(() => {
		if (!browser || !restoredApplicationProfile) return;
		writeApplicationProfile(localStorage, applicationProfile);
		dispatchApplicationProfileChanged(applicationProfile);
	});

	$effect(() => {
		if (!browser || restoredStoredPalette) return;

		const storedPaletteId = localStorage.getItem(colorPaletteStorageKey);
		if (storedPaletteId && colorPalettes.some((palette) => palette.id === storedPaletteId)) {
			selectedPaletteId = storedPaletteId;
		} else if (storedPaletteId) {
			localStorage.removeItem(colorPaletteStorageKey);
		}

		restoredStoredPalette = true;
	});

	$effect(() => {
		if (selectedPaletteId && colorPalettes.some((palette) => palette.id === selectedPaletteId)) return;
		selectedPaletteId = selectedColorPaletteId ?? colorPalettes[0]?.id ?? '';
	});

	$effect(() => {
		if (!browser || !restoredStoredPalette || !selectedPalette) return;
		localStorage.setItem(colorPaletteStorageKey, selectedPalette.id);

		const styleElement = document.getElementById(colorPaletteStyleElementId);
		if (!styleElement) return;
		styleElement.textContent = toColorPaletteRootStyle(
			toColorPaletteCssVariables(buildColorPaletteCssVariables(selectedPalette))
		);
	});

	function previewColors(role: ColorPaletteRole) {
		if (!selectedTokens) return null;

		return {
			base: selectedTokens[role],
			foreground: selectedTokens[`on-${role}`],
			hover: selectedTokens[`${role}-hover`],
			pressed: selectedTokens[`${role}-pressed`]
		};
	}
</script>

<section class="grid gap-5 rounded-lg border border-outline bg-surface px-4 py-4 shadow-sm sm:px-5">
	<div class="min-w-0">
		<h2 class="text-lg font-bold text-on-surface">Aplicación</h2>
		<p class="mt-1 break-words text-sm text-on-surface-muted">Configuración general de la aplicación.</p>
	</div>

	<div class="grid gap-2 sm:max-w-sm">
		<Label for="application-color-palette">Paleta de colores</Label>
		<Select.Root
			type="single"
			bind:value={selectedPaletteId}
			items={colorPalettes.map((palette) => ({ value: palette.id, label: palette.name }))}
			disabled={colorPalettes.length === 0}
		>
			<Select.Trigger id="application-color-palette" class="h-11 w-full border-outline bg-surface px-3">
				<span class="truncate">{selectedPalette?.name ?? 'Sin paletas disponibles'}</span>
			</Select.Trigger>
			<Select.Content>
				{#each colorPalettes as palette (palette.id)}
					<Select.Item value={palette.id} label={palette.name}>
						<span class="flex items-center gap-2">
							<span class="flex overflow-hidden rounded-full border border-outline">
								<span class="size-3" style:background-color={palette.primary}></span>
								<span class="size-3" style:background-color={palette.secondary}></span>
								<span class="size-3" style:background-color={palette.tertiary}></span>
							</span>
							<span>{palette.name}</span>
						</span>
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<div class="grid gap-2">
			<Label for="application-first-names">Nombres</Label>
			<Input
				id="application-first-names"
				bind:value={applicationProfile.firstNames}
				placeholder="Ej. Daniel Armando"
				class="h-11 border-outline bg-surface"
			/>
		</div>

		<div class="grid gap-2">
			<Label for="application-last-names">Apellidos</Label>
			<Input
				id="application-last-names"
				bind:value={applicationProfile.lastNames}
				placeholder="Ej. Ramírez López"
				class="h-11 border-outline bg-surface"
			/>
		</div>
	</div>

	{#if selectedPalette && selectedTokens}
		<div class="grid gap-3 rounded-md border border-outline bg-surface-subtle p-4">
			<p class="text-sm font-bold text-on-surface">Vista previa</p>
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
				{#each paletteRoles as role}
					{@const preview = previewColors(role)}
					<div class="overflow-hidden rounded-md border border-outline bg-surface">
						<div class="grid h-16 place-items-center px-2 text-center text-xs font-bold" style={`background-color: ${preview?.base}; color: ${preview?.foreground}`}>
							{role}
						</div>
						<div class="grid grid-cols-2">
							<span class="h-5" style:background-color={preview?.hover}></span>
							<span class="h-5" style:background-color={preview?.pressed}></span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</section>

<section class="grid gap-5 rounded-lg border border-outline bg-surface px-4 py-4 shadow-sm sm:px-5">
	<div class="min-w-0">
		<h2 class="text-lg font-bold text-on-surface">Datos locales</h2>
		<p class="mt-1 break-words text-sm text-on-surface-muted">Respaldo y restauración de la información guardada en este dispositivo.</p>
	</div>

	{#if feedback?.action === 'exportLocalBackup' || feedback?.action === 'restoreLocalBackup'}
		{#if feedback.success}
			<p class="rounded-md border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">{feedback.success}</p>
		{:else if feedback.message}
			<p class="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">{feedback.message}</p>
		{/if}
	{/if}

	<div class="grid gap-3 md:grid-cols-2">
		<form method="POST" action="?/exportLocalBackup" class="grid gap-3 rounded-md border border-outline bg-surface-subtle p-4">
			<p class="text-sm font-bold text-on-surface">Exportar respaldo</p>
			<p class="text-sm text-on-surface-muted">Descarga un archivo JSON versionado con cuentas, movimientos, recurrentes, metas, préstamos y catálogos.</p>
			<ActionButton type="submit" class="w-full sm:w-fit">Descargar respaldo</ActionButton>
		</form>

		<form method="POST" action="?/restoreLocalBackup" enctype="multipart/form-data" class="grid gap-3 rounded-md border border-outline bg-surface-subtle p-4">
			<p class="text-sm font-bold text-on-surface">Restaurar respaldo</p>
			<p class="text-sm text-on-surface-muted">Reemplaza la base local de este dispositivo con el contenido del archivo seleccionado.</p>
			<Input name="backup" type="file" accept="application/json,.json" class="border-outline bg-surface" />
			<ActionButton type="submit" intent="secondary" class="w-full sm:w-fit">Restaurar archivo</ActionButton>
		</form>
	</div>
</section>
