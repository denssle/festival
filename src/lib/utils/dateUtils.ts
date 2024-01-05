/**
 * Erzeugt eine Zeit in ms für einen Tag und eine Uhrzeit
 * @param date yyyy-MM-dd
 * @param time hh:mm
 */
export function getUTCFromString(date: string, time: string): number | null {
	if (date) {
		const dates: number[] = date.split('-').map((value) => Number(value));
		if (time) {
			const times: number[] = time.split(':').map((value) => Number(value));
			if (datesValid(dates) && times.at(0)) {
				return new Date(
					getNumber(dates, 0),
					getNumber(dates, 1) - 1,
					getNumber(dates, 2),
					getNumber(times, 0),
					getNumber(times, 1)
				).getTime();
			}
		} else {
			if (datesValid(dates)) {
				return new Date(
					getNumber(dates, 0),
					getNumber(dates, 1) - 1,
					getNumber(dates, 2),
					12
				).getTime();
			}
		}
	}
	return null;
}

export function getUTCNow(): number {
	const now = new Date;
	/*
	return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),
		now.getHours(), now.getMinutes());
	 */
	return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()).getTime();
}

function datesValid(dates: number[]): boolean {
	return Boolean(dates.at(0) && dates.at(1) && dates.at(2));
}

function getNumber(list: number[], index: number): number {
	const number: number | undefined = list.at(index);
	if (number) {
		return number;
	}
	return 0;
}

/**
 * Konvertiert eine Nummer in ein Date Objekt
 * @param utcMS Zeit in MS
 */
export function convertUTCToLocalDate(utcMS: number | undefined | null): Date | null {
	if (utcMS) {
		return new Date(utcMS);
	}
	return null;
}

export function dateToString(date: Date | null): string {
	if (date) {
		return date.toISOString().split('T')[0];
	}
	return '';
}

export function dateToTimeString(date: Date | null): string {
	if (date) {
		return addLeadingZero(date.getHours()) + ':' + addLeadingZero(date.getMinutes());
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

function addLeadingZero(nbr: number): string {
	if (nbr <= 9) {
		return '0' + nbr;
	}
	return String(nbr);
}