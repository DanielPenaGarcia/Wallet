export type ApplicationProfile = {
	firstNames: string;
	lastNames: string;
};

export const applicationProfileStorageKey = 'wallet:application-profile';
export const applicationProfileChangedEvent = 'wallet:application-profile-changed';

export const defaultApplicationProfile = {
	firstNames: '',
	lastNames: ''
} satisfies ApplicationProfile;

function firstWord(value: string) {
	return value.trim().split(/\s+/).find(Boolean) ?? '';
}

function normalizeProfile(profile: Partial<ApplicationProfile> | null | undefined): ApplicationProfile {
	return {
		firstNames: typeof profile?.firstNames === 'string' ? profile.firstNames : '',
		lastNames: typeof profile?.lastNames === 'string' ? profile.lastNames : ''
	};
}

export function readApplicationProfile(storage: Storage): ApplicationProfile {
	const storedProfile = storage.getItem(applicationProfileStorageKey);
	if (!storedProfile) return defaultApplicationProfile;

	try {
		return normalizeProfile(JSON.parse(storedProfile));
	} catch {
		storage.removeItem(applicationProfileStorageKey);
		return defaultApplicationProfile;
	}
}

export function writeApplicationProfile(storage: Storage, profile: ApplicationProfile) {
	storage.setItem(applicationProfileStorageKey, JSON.stringify(normalizeProfile(profile)));
}

export function dispatchApplicationProfileChanged(profile: ApplicationProfile) {
	window.dispatchEvent(
		new CustomEvent<ApplicationProfile>(applicationProfileChangedEvent, { detail: normalizeProfile(profile) })
	);
}

export function shortApplicationProfileName(profile: ApplicationProfile, fallback = 'Mi cuenta') {
	const firstName = firstWord(profile.firstNames);
	const firstLastName = firstWord(profile.lastNames);
	const shortName = [firstName, firstLastName].filter(Boolean).join(' ');

	return shortName || fallback;
}

export function applicationProfileInitials(profile: ApplicationProfile, fallback = 'MC') {
	const firstName = firstWord(profile.firstNames);
	const firstLastName = firstWord(profile.lastNames);
	const initials = `${firstName.charAt(0)}${firstLastName.charAt(0)}`.toUpperCase();

	return initials || fallback;
}
