import { expect } from 'chai';
import { waitFor } from '@testing-library/dom';
import { IFrame } from '../../src/client';
import { navigate } from './utils/navigate';

describe('local storage', () => {
  let iframe: IFrame;

  before(function () {
    iframe = this.iframe;
  });

  it('should get an item from the local storage', async () => {
    await navigate(iframe, 'http://localhost:8000/local-storage.html');

    await waitFor(() => {
      expect(iframe.getLocalStorageItem('question')).to.eql('Life, the universe & everything?');
    });
  });

  it('should set an item to the local storage', async () => {
    await navigate(iframe, 'http://localhost:8000/local-storage.html');

    iframe.setLocalStorageItem('answer', 'forty-two');

    const { getByText } = await navigate(iframe, 'http://localhost:8000/local-storage.html');

    await waitFor(() => {
      expect(getByText('answer: forty-two')).to.be.visible;
    });
  });

  it('should clear the local storage', async () => {
    await navigate(iframe, 'http://localhost:8000/local-storage.html');

    iframe.clearLocalStorage();

    await waitFor(() => {
      expect(iframe.getLocalStorageItem('question')).to.be.null;
    });
  });
});
