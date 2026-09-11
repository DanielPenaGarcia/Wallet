<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { BankFormProps } from './props';

	let { mode, bank, feedback = null, onCancel }: BankFormProps = $props();
	let expectedAction = $derived(mode === 'create' ? 'create-bank' : 'update-bank');
	let matchingFeedback = $derived(
		feedback?.action === expectedAction && (mode === 'create' || feedback.targetId === bank?.id)
			? feedback
			: null
	);
	let idPrefix = $derived(mode === 'create' ? 'create-bank' : `edit-bank-${bank?.id ?? ''}`);

	function fieldError(field: string) {
		return matchingFeedback?.errors?.[field]?.[0];
	}
</script>

<form method="POST" action={mode === 'create' ? '?/createBank' : '?/updateBank'} class="grid gap-4 sm:grid-cols-2">
	{#if mode === 'edit' && bank}<input type="hidden" name="id" value={bank.id} />{/if}
	<div class="grid gap-2 sm:col-span-2">
		<Label for={`${idPrefix}-name`}>Nombre del banco</Label>
		<Input id={`${idPrefix}-name`} name="name" required maxlength={100} value={matchingFeedback?.values?.name ?? bank?.name ?? ''} placeholder="Ej. Banco Nacional" class="h-11 border-slate-300" aria-invalid={fieldError('name') ? 'true' : undefined} aria-describedby={fieldError('name') ? `${idPrefix}-name-error` : undefined} />
		{#if fieldError('name')}<span id={`${idPrefix}-name-error`} class="text-xs text-red-700">{fieldError('name')}</span>{/if}
	</div>
	<div class="grid gap-2">
		<Label for={`${idPrefix}-short-name`}>Nombre corto <span class="font-normal text-slate-400">(opcional)</span></Label>
		<Input id={`${idPrefix}-short-name`} name="shortName" maxlength={30} value={matchingFeedback?.values?.shortName ?? bank?.shortName ?? ''} placeholder="Ej. BN" class="h-11 border-slate-300" aria-invalid={fieldError('shortName') ? 'true' : undefined} aria-describedby={fieldError('shortName') ? `${idPrefix}-short-name-error` : undefined} />
		{#if fieldError('shortName')}<span id={`${idPrefix}-short-name-error`} class="text-xs text-red-700">{fieldError('shortName')}</span>{/if}
	</div>
	<div class="grid gap-2">
		<Label for={`${idPrefix}-country-code`}>País</Label>
		<Input id={`${idPrefix}-country-code`} name="countryCode" required minlength={2} maxlength={2} value={matchingFeedback?.values?.countryCode ?? bank?.countryCode ?? 'MX'} class="h-11 border-slate-300 uppercase" aria-invalid={fieldError('countryCode') ? 'true' : undefined} aria-describedby={fieldError('countryCode') ? `${idPrefix}-country-code-error` : undefined} />
		{#if fieldError('countryCode')}<span id={`${idPrefix}-country-code-error`} class="text-xs text-red-700">{fieldError('countryCode')}</span>{/if}
	</div>
	<div class="grid gap-2 sm:col-span-2">
		<Label for={`${idPrefix}-time-zone`}>Zona horaria</Label>
		<Input id={`${idPrefix}-time-zone`} name="timeZone" required maxlength={80} value={matchingFeedback?.values?.timeZone ?? bank?.timeZone ?? 'America/Mexico_City'} class="h-11 border-slate-300" aria-invalid={fieldError('timeZone') ? 'true' : undefined} aria-describedby={fieldError('timeZone') ? `${idPrefix}-time-zone-error` : undefined} />
		{#if fieldError('timeZone')}<span id={`${idPrefix}-time-zone-error`} class="text-xs text-red-700">{fieldError('timeZone')}</span>{/if}
	</div>
	{#if matchingFeedback?.message}<p class="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 sm:col-span-2">{matchingFeedback.message}</p>{/if}
	<div class="flex justify-end gap-2 sm:col-span-2">
		{#if onCancel}<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>{/if}
		<ActionButton type="submit">{mode === 'create' ? 'Guardar banco' : 'Guardar cambios'}</ActionButton>
	</div>
</form>
