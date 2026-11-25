import { planService } from '#lib/services/index.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ depends }) => {
	depends('app:planes');
	return { planes: planService.listar({ per_page: 100 }).then(({ data }) => data) };
};
