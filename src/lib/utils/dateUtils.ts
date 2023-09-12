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
