export type ChangeResult = 'Success' | 'Not authorized' | 'Data Missing' | 'Already in Group' | 'Failure';

export function getHTTPCodeForChangeResult(result: ChangeResult): 200 | 403 | 422 | 409 | 500 {
	switch (result) {
		case 'Success':
			return 200;
		case 'Not authorized':
			return 403;
		case 'Data Missing':
			return 422;
		case 'Already in Group':
			return 409;
		case 'Failure':
			return 500;
	}
}
