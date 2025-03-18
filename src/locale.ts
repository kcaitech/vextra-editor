/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

function fixLocale(locale: string) {
    locale = locale.toLowerCase();
    if (locale.startsWith('zh')) return 'zh';
    return 'en';
}
/*
在css中使用
https://www.w3.org/International/questions/qa-css-lang.zh-hans.html
**/
export const locale = fixLocale(localStorage.getItem('locale') || navigator.language || 'en');
// export const locale = fixLocale('en');
