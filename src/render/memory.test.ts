import { align4bytes } from './memory';

describe('align4bytes', () => {
  test('should align length to multiple of 4', () => {
    expect(align4bytes(1)).toEqual(4);
    expect(align4bytes(2)).toEqual(4);
    expect(align4bytes(3)).toEqual(4);
    expect(align4bytes(4)).toEqual(4);
    expect(align4bytes(5)).toEqual(8);
    expect(align4bytes(6)).toEqual(8);
    expect(align4bytes(7)).toEqual(8);
    expect(align4bytes(8)).toEqual(8);
  });
});
