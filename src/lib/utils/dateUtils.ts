/**
 * Erzeugt eine Zeit in ms für einen Tag und eine Uhrzeit
 * @param date yyyy-MM-dd
 * @param time hh:mm
 */
export function createDateFromStrings(date: string, time: string): number | null {
	if (date) {
		const dates: number[] = date.split('-').map((value) => Number(value));
		if (time) {
			const times: number[] = time.split(':').map((value) => Number(value));
			if (dates.at(0) && dates.at(1) && dates.at(2) && times.at(0)) {
				return new Date(
					getNumber(dates, 0),
					getNumber(dates, 1),
					getNumber(dates, 2),
					times.at(0),
					times.at(1)
				).getTime();
			}
		} else {
			if (dates.at(0) && dates.at(1) && dates.at(2)) {
				return new Date(getNumber(dates, 0), getNumber(dates, 1), getNumber(dates, 2)).getTime();
			}
		}
	}
	return null;
}

function getNumber(list: number[], index: number): number {
	const number = list.at(index);
	if (number) {
		return number;
	}
	return 0;
}

/**
 * Konvertiert eine Nummer in ein Date Objekt
 * @param nbr Zeit in MS
 */
export function numberToDate(nbr: number | undefined | null): Date | null {
	if (nbr) {
		return new Date(nbr);
	}
	return null;
}

export function dateToDateString(date: Date | null): string {
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
