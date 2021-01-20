import { expect } from 'chai';

describe('test', () => {
  it('should work', () => {
    expect(false).not.to.eql(true);
  });

  it.skip('should fail', () => {
    expect(false).to.eql(6);
  });
});
