/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

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
