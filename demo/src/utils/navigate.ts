import { getQueriesForElement } from '@testing-library/dom';
import { IFrame } from '../../../src/client';

export const navigate = async (iframe: IFrame, url: string) => {
  await iframe.navigate(url);

  if (iframe.body === undefined) {
    throw new Error('Cannot get queries for iframe: body is undefined');
  }

  return getQueriesForElement(iframe.body);
};
