import { configure, getQueriesForElement, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { expect } from 'chai';
import sinon from 'sinon';
import { IFrame } from 'testea';

mocha.timeout(2000);
mocha.slow(600);
configure({ asyncUtilTimeout: 2000 });

const url = 'http://localhost:8000/testing-library.html';

describe('TestingLibrary', () => {
  let iframe: IFrame;

  before(function () {
    iframe = this.iframe;
  });

  beforeEach('clear local storage', async () => {
    await navigate(url);
    await new Promise((r) => setTimeout(r, 0));
    iframe.clearLocalStorage();
  });

  const navigate = async (url: string) => {
    await iframe.navigate(url);
    return getQueriesForElement(iframe.body!);
  };

  it('should send a feedback', async () => {
    const { findByText, getByLabelText, getByText, getByRole, getByTestId } = await navigate(url);
    const alertStub = sinon.stub(iframe.contentWindow!, 'alert');

    await findByText('Send us your feedbacks');

    await userEvent.type(getByLabelText('Your name'), 'nilscox');
    await userEvent.type(getByLabelText('Your email'), 'nilscox@domain.tld');

    userEvent.click(within(getByText('Overall rating')).getByTestId('rating-4'));

    for (const n of [1, 2, 3, 4]) {
      expect(getByTestId(`rating-${n}`)).to.have.class('star-fill');
    }

    expect(getByTestId('rating-5')).not.to.have.class('star-fill');

    await userEvent.type(getByLabelText('Message'), 'Hello, the app is cool but I dont really like the UI.');
    await userEvent.click(getByRole('button', { name: 'Submit' }));

    expect(alertStub.called).to.be.true;
    expect(alertStub.firstCall.args).to.eql([
      "Thank you for your feedback, nilscox!\n\nYou rated our app 4/5, that's not too bad.\n\nHere is the message you sent:\n\nHello, the app is cool but I dont really like the UI.",
    ]);
  });

  it('should store the feedback form content to the local storage', async () => {
    const { findByText, getByLabelText, getByText, getByDisplayValue, getByTestId } = await navigate(url);

    await findByText('Send us your feedbacks');

    await userEvent.type(getByLabelText('Your name'), 'user');
    await userEvent.type(getByLabelText('Your email'), 'user@domain.tld');
    userEvent.click(within(getByText('Overall rating')).getByTestId('rating-2'));
    await userEvent.type(getByLabelText('Message'), 'message');

    const savedForm = iframe.getLocalStorageItem('form');
    const expectedForm = {
      name: 'user',
      email: 'user@domain.tld',
      rating: 2,
      message: 'message',
    };

    expect(savedForm).not.to.be.null;
    expect(JSON.parse(savedForm!)).to.deep.equal(expectedForm);

    await iframe.reload();

    getByDisplayValue(expectedForm.name);
    getByDisplayValue(expectedForm.email);
    getByDisplayValue(expectedForm.message);

    expect(getByTestId('rating-2')).to.have.class('star-fill');
    expect(getByTestId('rating-3')).not.to.have.class('star-fill');
  });
});
