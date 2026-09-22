<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export type InfoPopoverProps = {
		title: string;
		description: string;
		label?: string;
		children?: Snippet;
	};
</script>

<script lang="ts">
	import CircleHelpIcon from '@lucide/svelte/icons/circle-help';
	import { Popover } from 'bits-ui';

	let {
		title,
		description,
		label,
		children
	}: InfoPopoverProps = $props();

	let triggerLabel = $derived(label ?? `Más información sobre ${title}`);
</script>

<Popover.Root>
	<Popover.Trigger
		type="button"
		class="inline-grid size-5 shrink-0 place-items-center rounded-full text-on-surface-muted transition-colors hover:bg-surface-hover hover:text-on-surface focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none"
		aria-label={triggerLabel}
		title={triggerLabel}
	>
		<CircleHelpIcon class="size-3.5" />
	</Popover.Trigger>
	<Popover.Portal>
		<Popover.Content
			sideOffset={8}
			collisionPadding={16}
			class="z-50 w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-outline bg-surface p-4 text-sm text-on-surface shadow-lg outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
		>
			<p class="font-bold text-on-surface">{title}</p>
			<p class="mt-2 leading-5 text-on-surface-muted">{description}</p>
			{#if children}
				<div class="mt-3 border-t border-outline pt-3 text-xs leading-5 text-on-surface-muted">
					{@render children()}
				</div>
			{/if}
			<Popover.Arrow class="fill-surface stroke-outline" />
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>
