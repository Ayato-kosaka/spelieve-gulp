import fetch, { RequestInfo } from 'node-fetch';

import { dataInterface } from './dataInterface';

export const getData = async (): Promise<dataInterface> => {
	const response = await fetch(process.env.PG_DATA_ENDPOINT as RequestInfo );
	return await response.json() as dataInterface;
};