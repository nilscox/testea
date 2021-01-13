import { expect } from 'chai';

describe('test', () => {
  it('should work', () => {
    expect(false).not.to.eql(true);
  });

  it('should fail', () => {
    expect(false).to.eql(6);
  });
});
