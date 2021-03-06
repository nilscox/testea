import { IFrame } from 'testea';

describe('screenshot', () => {
  let iframe: IFrame;

  before(function () {
    iframe = this.iframe;
  });

  it('should take a screenshot', async () => {
    await iframe.navigate('http://localhost:8000');

    iframe.takeScreenshot('test/screenshot.png');
  });
});
