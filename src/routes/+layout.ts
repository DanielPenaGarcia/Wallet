import { loadLayoutData } from '$lib/local/finance-db';

export const ssr = false;
export const prerender = true;
export const trailingSlash = 'always';

export const load = loadLayoutData;
