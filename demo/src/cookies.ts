import { expect } from 'chai';
import { IFrame } from 'testea';

const url = 'http://localhost:8000/cookies.html';

describe('cookies', () => {
  let iframe: IFrame;

  before(function () {
    iframe = this.iframe;
  });

  it("should get a cookie's value", async () => {
    await iframe.navigate(url);

    expect(iframe.getCookie('question')).to.eql("What's my name?");
  });

  it('should set a cookie', async () => {
    await iframe.navigate(url);

    const expires = new Date();
    expires.setTime(expires.getTime() + 30 * 1000);

    iframe.setCookie('answer', 'Heisenberg', expires);

    await iframe.reload();

    const answer = iframe.document?.querySelector('#answer');
    expect(answer?.textContent).to.match(/answer: Heisenberg/);
  });

  it('should clear all cookies', async () => {
    await iframe.navigate(url);

    iframe.clearCookies();

    expect(iframe.document?.cookie).to.be.empty;
  });
});
