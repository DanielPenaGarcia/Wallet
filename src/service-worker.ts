/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { build, version } from '$service-worker';

const worker = globalThis as unknown as ServiceWorkerGlobalScope;
const cacheName = `wallet-assets-${version}`;
const staticAssets = [
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
	event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll([...assets])));
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
			fetch(event.request).catch(async () => {
				const fallback = await caches.match('/offline.html');
				return fallback ?? Response.error();
			})
		);
		return;
	}

	// Do not persist HTML, SvelteKit data requests, API responses or financial records.
	if (assets.has(url.pathname)) {
		event.respondWith(caches.match(url.pathname).then((response) => response ?? fetch(event.request)));
	}
});
