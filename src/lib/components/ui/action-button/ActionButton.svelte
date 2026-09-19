<script lang="ts" module>
	import type { ButtonProps } from '$lib/components/ui/button';
	import type { ActionButtonIntent } from './styles';

	export type { ActionButtonIntent } from './styles';

	export type ActionButtonProps = Omit<ButtonProps, 'href'> & {
		intent?: ActionButtonIntent;
	};
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { actionButtonIntentVariants, actionButtonStyles } from './styles';

	let {
		intent = 'primary',
		variant,
		size = 'default',
		class: className,
		...restProps
	}: ActionButtonProps = $props();

	let styleClass = $derived(
		variant ? className : cn(actionButtonStyles({ intent }), className)
	);
</script>

<Button
	variant={variant ?? actionButtonIntentVariants[intent]}
	{size}
	class={styleClass}
	{...restProps}
/>
