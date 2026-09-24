import type { Component } from 'svelte';

import CalendarCheckIcon from '@lucide/svelte/icons/calendar-check';
import HandCoinsIcon from '@lucide/svelte/icons/hand-coins';
import HomeIcon from '@lucide/svelte/icons/house';
import LandmarkIcon from '@lucide/svelte/icons/landmark';
import ListIcon from '@lucide/svelte/icons/list';
import RepeatIcon from '@lucide/svelte/icons/repeat';
import SettingsIcon from '@lucide/svelte/icons/settings';
import TargetIcon from '@lucide/svelte/icons/target';

export type NavigationItem = {
	href: string;
	label: string;
	mobileLabel: string;
	mobilePlacement: 'primary' | 'more';
	sidebarLabel: string;
	title: string;
	icon: Component<{ class?: string }>;
	isActive: (currentPath: string) => boolean;
};

export const navigationItems: NavigationItem[] = [
	{
		href: '/',
		label: 'Inicio',
		mobileLabel: 'Inicio',
		mobilePlacement: 'primary',
		sidebarLabel: 'Dashboard',
		title: 'Inicio',
		icon: HomeIcon,
		isActive: (currentPath) => currentPath === '/'
	},
	{
		href: '/recurrentes',
		label: 'Recurrentes',
		mobileLabel: 'Recurrentes',
		mobilePlacement: 'more',
		sidebarLabel: 'Recurrentes',
		title: 'Recurrentes',
		icon: RepeatIcon,
		isActive: (currentPath) => currentPath.startsWith('/recurrentes')
	},
	{
		href: '/movimientos',
		label: 'Movimientos',
		mobileLabel: 'Movs.',
		mobilePlacement: 'primary',
		sidebarLabel: 'Movimientos',
		title: 'Movimientos',
		icon: ListIcon,
		isActive: (currentPath) => currentPath.startsWith('/movimientos')
	},
	{
		href: '/planificacion',
		label: 'Plan',
		mobileLabel: 'Plan',
		mobilePlacement: 'primary',
		sidebarLabel: 'Planificación',
		title: 'Planificación',
		icon: CalendarCheckIcon,
		isActive: (currentPath) => currentPath.startsWith('/planificacion')
	},
	{
		href: '/prestamos',
		label: 'Préstamos',
		mobileLabel: 'Préstamos',
		mobilePlacement: 'more',
		sidebarLabel: 'Préstamos',
		title: 'Préstamos',
		icon: HandCoinsIcon,
		isActive: (currentPath) => currentPath.startsWith('/prestamos')
	},
	{
		href: '/metas',
		label: 'Metas',
		mobileLabel: 'Metas',
		mobilePlacement: 'more',
		sidebarLabel: 'Metas',
		title: 'Metas',
		icon: TargetIcon,
		isActive: (currentPath) => currentPath.startsWith('/metas')
	},
	{
		href: '/cuentas',
		label: 'Cuentas',
		mobileLabel: 'Cuentas',
		mobilePlacement: 'primary',
		sidebarLabel: 'Cuentas',
		title: 'Cuentas',
		icon: LandmarkIcon,
		isActive: (currentPath) => currentPath.startsWith('/cuentas')
	},
	{
		href: '/settings',
		label: 'Settings',
		mobileLabel: 'Settings',
		mobilePlacement: 'more',
		sidebarLabel: 'Settings',
		title: 'Settings',
		icon: SettingsIcon,
		isActive: (currentPath) => currentPath.startsWith('/settings')
	}
];

export function getActiveNavigationItem(currentPath: string) {
	return navigationItems.find((item) => item.isActive(currentPath));
}

export function getMobilePrimaryNavigationItems() {
	return navigationItems.filter((item) => item.mobilePlacement === 'primary');
}

export function getMobileMoreNavigationItems() {
	return navigationItems.filter((item) => item.mobilePlacement === 'more');
}
