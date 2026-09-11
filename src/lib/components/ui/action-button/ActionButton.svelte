<script lang="ts" module>
	import type { ButtonProps, ButtonSize, ButtonVariant } from '$lib/components/ui/button';

	export type ActionButtonIntent =
		| 'primary'
		| 'secondary'
		| 'danger'
		| 'icon-primary'
		| 'icon'
		| 'icon-danger';

	export type ActionButtonProps = Omit<ButtonProps, 'variant' | 'size' | 'class' | 'href'> & {
		intent?: ActionButtonIntent;
	};

	const variants: Record<ActionButtonIntent, ButtonVariant> = {
		primary: 'default',
		secondary: 'outline',
		danger: 'destructive',
		'icon-primary': 'default',
		icon: 'ghost',
		'icon-danger': 'ghost'
	};

	const defaultSizes: Record<ActionButtonIntent, ButtonSize> = {
		primary: 'default',
		secondary: 'default',
		danger: 'default',
		'icon-primary': 'icon-sm',
		icon: 'icon-sm',
		'icon-danger': 'icon-sm'
	};

	const classes: Record<ActionButtonIntent, string> = {
		primary: 'bg-blue-700 font-bold text-white shadow-sm hover:bg-blue-800',
		secondary: 'font-bold',
		danger: 'font-bold',
		'icon-primary': 'bg-blue-700 font-bold text-white shadow-sm hover:bg-blue-800',
		icon: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
		'icon-danger': 'text-red-700 hover:bg-red-50 hover:text-red-800'
	};
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	let {
		intent = 'primary',
		...restProps
	}: ActionButtonProps = $props();
</script>

<Button
	variant={variants[intent]}
	size={defaultSizes[intent]}
	class={classes[intent]}
	{...restProps}
/>
