const skip_char = ['\n'];

/**
 * 获取高亮片段[]
 * @param src 字符串
 * @param keywords 
 * @param acc 精确匹配
 * @returns [idx1, idx2][]
 */
export function get_words_index_selection_sequence(src: string, keywords: string, acc = true) {
  const result: [number, number][] = []
  if (keywords.length === 1) {
    for (let i = 0; i < src.length; i++) {
      if (src.charAt(i) === keywords) result.push([i, i + 1]);
    }
  } else {
    for (let i = 0; i < src.length - keywords.length; i++) {
      if (src.charAt(i) !== keywords.charAt(0)) continue;
      const j = match_str(src.slice(i), keywords, acc);
      if (j) result.push([i, i + j]);
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
function match_str(src_slice: string, keywords: string, acc = true) {
  const keywords_len = keywords.length;
  const src_slice_len = src_slice.length;
  let j = 1;
  for (let i = 1; i < keywords_len; i++) {
    let kw = keywords.charAt(i);
    kw = acc ? kw : kw.toLowerCase();
    while (j < src_slice_len) {
      let ss = src_slice.charAt(j);
      ss = acc ? ss : ss.toLowerCase();
      if (ss === kw) {
        j++;
        break;
      } else if (ss === '\n' || ss === '�') {
        j++;
      } else {
        return false;
      }
    }
  }
  return j;
}