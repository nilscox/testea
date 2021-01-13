import { expect } from 'chai';
import { waitFor } from '@testing-library/dom';
import { IFrame } from '../../src/client';
import { navigate } from './utils/navigate';

describe('cookies', () => {
  let iframe: IFrame;

  before(function () {
    iframe = this.iframe;
  });

  it("should get a cookie's value", async () => {
    await navigate(iframe, 'http://localhost:8000/cookies.html');

    await waitFor(() => {
      expect(iframe.getCookie('question')).to.eql("What's my name?");
    });
  });

  it('should set a cookie', async () => {
    await navigate(iframe, 'http://localhost:8000/cookies.html');

    const expires = new Date();
    expires.setTime(expires.getTime() + 30 * 1000);

    iframe.setCookie('answer', 'Heisenberg', expires);

    const { getByText } = await navigate(iframe, 'http://localhost:8000/cookies.html');

    await waitFor(() => {
      expect(getByText('answer: Heisenberg')).to.be.visible;
    });
  });

  it('should clear all cookies', async () => {
    await navigate(iframe, 'http://localhost:8000/cookies.html');

    iframe.clearCookies();

    await waitFor(() => {
      expect(iframe.document?.cookie).to.be.empty;
    });
  });
});
