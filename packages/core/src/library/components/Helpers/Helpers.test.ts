import { generateUniqueIdFromRecord } from '.';

describe('Core: Tests for the "Helper" component', () => {
  it('should see if "generateUniqueIdFromRecord" works as expected', () => {
    const idTree = { 0: 'test', 1: 'test', 2: 'test' };
    const result = generateUniqueIdFromRecord(idTree);
    expect(result).toBe('3');
  });
});
