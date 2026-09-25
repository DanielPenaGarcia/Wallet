/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { build, version } from '$service-worker';

const worker = globalThis as unknown as ServiceWorkerGlobalScope;
const cacheName = `wallet-assets-${version}`;
const appShell = '/index.html';
const staticAssets = [
	appShell,
	'/manifest.webmanifest',
	'/offline.html',
	'/icons/icon.svg',
	'/icons/icon-192.png',
	'/icons/icon-512.png',
	'/icons/icon-maskable-512.png',
	'/icons/apple-touch-icon.png'
];
const assets = new Set([...build, ...staticAssets]);

worker.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(cacheName);
			// Keep the previous worker active if any part of the offline app is unavailable.
			await cache.addAll([...assets]);
			await worker.skipWaiting();
		})()
	);
});

worker.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) {
				if (key.startsWith('wallet-assets-') && key !== cacheName) await caches.delete(key);
			}
			await worker.clients.claim();
		})()
	);
});

worker.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);
	if (url.origin !== worker.location.origin) return;

	if (event.request.mode === 'navigate') {
		event.respondWith(
			(async () => {
				// Financial data is local. Prefer the cached client shell even when an
				// unavailable origin responds with an HTTP error instead of rejecting.
				const shell = await caches.match(appShell);
				if (shell) return shell;

				try {
					const response = await fetch(event.request);
					if (response.ok) return response;
					return (await caches.match('/offline.html')) ?? response;
				} catch {
					return (await caches.match('/offline.html')) ?? Response.error();
				}
			})()
		);
		return;
	}

	// Do not persist HTML, SvelteKit data requests, API responses or financial records.
	if (assets.has(url.pathname)) {
		event.respondWith(caches.match(url.pathname).then((response) => response ?? fetch(event.request)));
	}
});
