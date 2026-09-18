<script lang="ts" module>
	import type { ButtonProps, ButtonVariant } from '$lib/components/ui/button';

	export type ActionButtonIntent =
		| 'primary'
		| 'secondary'
		| 'danger';

	export type ActionButtonProps = Omit<ButtonProps, 'href'> & {
		intent?: ActionButtonIntent;
	};

	const variants: Record<ActionButtonIntent, ButtonVariant> = {
		primary: 'default',
		secondary: 'outline',
		danger: 'destructive'
	};
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	let {
		intent = 'primary',
		variant,
		size = 'default',
		...restProps
	}: ActionButtonProps = $props();
</script>

<Button
	variant={variant ?? variants[intent]}
	{size}
	{...restProps}
/>
