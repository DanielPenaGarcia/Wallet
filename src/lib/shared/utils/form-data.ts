export function formStringValue(value: FormDataEntryValue | undefined): string {
	return typeof value === 'string' ? value : '';
}
