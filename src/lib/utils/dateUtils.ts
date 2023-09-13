export function createDateFromStrings(date: string, time: string): number | null {
	const dates: string[] = date.split('-');
	if (time) {
		const times: string[] = time.split(':');
		if (dates.at(0) && dates.at(1) && dates.at(2) && times.at(0) && times.at(1)) {
			return new Date(dates.at(0), dates.at(1), dates.at(2), times.at(0), times.at(1)).getTime();
		}
	} else {
		if (dates.at(0) && dates.at(1) && dates.at(2)) {
			return new Date(dates.at(0), dates.at(1), dates.at(2)).getTime();
		}
	}
	return null;
}

export function numberToDate(nbr: number | undefined): Date | null {
	if (nbr) {
		return new Date(nbr);
	}
	return null;
}

export function dateToDateString(date: Date): string {
	if (date) {
		const offset = date.getTimezoneOffset();
		date = new Date(date.getTime() - offset * 60 * 1000);
		return date.toISOString().split('T')[0];
	}
	return '';
}

export function dateToTimeString(date: Date): string {
	if (date) {
		const offset = date.getTimezoneOffset();
		date = new Date(date.getTime() - offset * 60 * 1000);
		return date.toISOString().split('T')[1].replace(':00.000Z', '');
	}
	return '';
}

export function formateDateTime(date: Date | null): string {
	if (date) {
		return formateDate(date) + ' ' + formateTime(date);
	}
	return '';
}

export function formateDate(date: Date | null): string {
	if (date) {
		return date.toLocaleDateString();
	}
	return '';
}

export function formateTime(date: Date | null): string {
	if (date) {
		return date.toLocaleTimeString();
	}
	return '';
}
