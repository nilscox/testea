import { expect } from 'chai';
import { IFrame } from 'testea';

const url = 'http://localhost:8000/local-storage.html';

describe('local storage', () => {
  let iframe: IFrame;

  before(function () {
    iframe = this.iframe;
  });

  it('should get an item from the local storage', async () => {
    await iframe.navigate(url);

    expect(iframe.getLocalStorageItem('question')).to.eql('Life, the universe & everything?');
  });

  it('should set an item to the local storage', async () => {
    await iframe.navigate(url);

    iframe.setLocalStorageItem('answer', 'forty-two');

    await iframe.navigate(url);

    const answer = iframe.document?.querySelector('#answer');
    expect(answer?.textContent).to.match(/answer: forty-two/);
  });

  it('should clear the local storage', async () => {
    await iframe.navigate(url);

    iframe.clearLocalStorage();

    expect(iframe.getLocalStorageItem('question')).to.be.null;
  });
});
