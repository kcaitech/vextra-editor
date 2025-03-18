/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import moment from 'moment';
import 'moment/locale/zh-cn';
//将本地的语言格式映射为moment中的语言格式
export const mapDateLang = new Map([
    ['zh', 'zh-cn'],
    ['en', 'en']
])

export const formatPast = (date: string, t: Function) => {
    const lang = localStorage.getItem('zh') || 'zh'
    moment.locale(mapDateLang.get(lang) || 'zh-cn');
    let countTime;
    let time = new Date().getTime();
    let afferentTime = new Date(date).getTime();
    time = Number.parseInt(`${time - afferentTime}`);
    if (time < 10000) {
        // 10秒内
        return t(`date.just_now`); // 刚刚
    } else if (time < 60000) {
        // 超过10秒少于1分钟内
        countTime = Math.floor(time / 1000);
        return `${countTime}${t('date.s')}`; // **秒前
    } else if (time < 3600000) {
        // 超过1分钟少于1小时
        return moment(date).fromNow(); // **分钟前
    } else if (time < 172800000) {
        // 超过1小时少于48小时
        countTime = Math.floor(time / 3600000);
        if (countTime <= 12) {
            return moment(date).fromNow(); // **小时前
        }
        return moment().calendar(); // 今天、昨天
    } else {
        // 超过四十八小时
        countTime = Math.floor(time / 86400000);
        //大于等于365天
        if (countTime >= 365) {
            return moment().format('LL'); // **年**月**日
        }
        //大于等于7天
        if (countTime >= 7) {
            return moment(time).format('MMM Do, h:mm'); // **月**日
        }
        return moment(date).fromNow(); // **天前
    }
}
