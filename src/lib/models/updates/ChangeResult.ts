export type ChangeResult = 'Success' | 'Not authorized' | 'Data Missing';

export function getHTTPCodeForChangeResult(result: ChangeResult): 200 | 403 | 422 {
	switch (result) {
		case 'Success':
			return 200;
		case 'Not authorized':
			return 403;
		case 'Data Missing':
			return 422;
	}
}
