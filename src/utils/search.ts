/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

const skip_char = ['\n'];

/**
 * 获取高亮片段[] O(n*m) n：文本字符长度-关键字出现次数*m    m：关键字长度
 * @param src 文本字符
 * @param keywords 
 * @param acc 精确匹配
 * @returns [idx1, idx2][]
 */
export function get_words_index_selection_sequence(src: string, keywords: string, acc = true) {
  const result: [number, number][] = []
  if (keywords.length === 1) {
    for (let i = 0; i < src.length; i++) {
      const ss = acc ? src.charAt(i) : src.charAt(i).toLocaleLowerCase();
      keywords = acc ? keywords : keywords.toLocaleLowerCase();
      if (ss === keywords) result.push([i, i + 1]);
    }
  } else {
    for (let i = 0; i < src.length - keywords.length; i++) {
      const ss = acc ? src.charAt(i) : src.charAt(i).toLocaleLowerCase();
      keywords = acc ? keywords : keywords.toLocaleLowerCase();
      if (ss !== keywords.charAt(0)) continue;
      const j = match(src.slice(i), keywords, acc);
      if (j) {
        result.push([i, i + j]);
        i = i + j - 1;
      }
    }
  }
  return result;
}
/**
 * 可以跳过指定字符('\n'、'�')的两个字符串片段匹配
 * @param src_slice 字符串片段
 * @param keywords 
 * @param acc 精确匹配
 * @returns end
 */
function match(src_slice: string, keywords: string, acc = true) {
  const keywords_len = keywords.length;
  const src_slice_len = src_slice.length;
  let j = 1;
  for (let i = 1; i < keywords_len; i++) {
    while (j < src_slice_len) {
      const ss = acc ? src_slice.charAt(j) : src_slice.charAt(j).toLowerCase();
      if (ss === keywords.charAt(i)) {
        j++;
        break;
      }
      else if (ss === '\n' || ss === '�') j++;
      else return 0;
    }
  }
  return j;
}