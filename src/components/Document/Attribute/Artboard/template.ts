/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import i18n from '@/i18n'
// @ts-ignore
const t = i18n.global.t;

export interface TL {
    name: string;
    width: number;
    height: number;
}

interface Template {
    title: string;
    children: TL[];
}

const slide = t('frame.slide');

export const templates: Template[] = [
    {
        title: t('frame.phone'),
        children: [
            {
                name: 'iPhone 14&15 Pro Max',
                width: 430,
                height: 932
            },
            {
                name: 'iPhone 14 plus',
                width: 428,
                height: 926
            },
            {
                name: 'iPhone 14&15 Pro',
                width: 393,
                height: 852
            },
            {
                name: 'iPhone 13&14',
                width: 390,
                height: 844
            },
            {
                name: 'iPhone 13 mini',
                width: 375,
                height: 812
            },
            {
                name: 'iPhone SE',
                width: 320,
                height: 568
            },
            {
                name: 'iPhone 8 Plus',
                width: 414,
                height: 736
            },
            {
                name: 'iPhone 8',
                width: 375,
                height: 667
            },
            {
                name: 'Android 1',
                width: 360,
                height: 640
            },
            {
                name: 'Android 2',
                width: 360,
                height: 800
            },
        ]
    },
    {
        title: t('frame.pad'),
        children: [
            {
                name: 'iPad 10.2”',
                width: 810,
                height: 1080
            },
            {
                name: 'iPad mini 8.3”',
                width: 744,
                height: 1133
            },
            {
                name: 'iPad Air 10.9”',
                width: 820,
                height: 1180
            },
            {
                name: 'iPad Pro 11”',
                width: 834,
                height: 1194
            },
            {
                name: 'iPad Pro 12.9”',
                width: 1024,
                height: 1366
            }
        ]
    },
    {
        title: t('frame.deskdop'),
        children: [
            {
                name: 'Desktop',
                width: 1440,
                height: 1024
            },
            {
                name: 'MacBook Air 13”',
                width: 1280,
                height: 832
            },
            {
                name: 'MacBook Pro 14”',
                width: 1512,
                height: 982
            },
            {
                name: 'MacBook Pro 16”',
                width: 1728,
                height: 1117
            },
            {
                name: 'iMac',
                width: 1280,
                height: 720
            }
        ]
    },
    {
        title: slide,
        children: [
            {
                name: slide + ' 16:9',
                width: 1920,
                height: 1080
            },
            {
                name: slide + ' 4:3',
                width: 1024,
                height: 768
            }
        ]
    },
    {
        title: t('frame.watch'),
        children: [
            {
                name: 'Apple Watch 40mm',
                width: 162,
                height: 197
            },
            {
                name: 'Apple Watch 41mm',
                width: 176,
                height: 215
            },
            {
                name: 'Apple Watch 44mm',
                width: 184,
                height: 224
            },
            {
                name: 'Apple Watch 45mm',
                width: 198,
                height: 242
            },
            {
                name: 'Apple Watch 49mm',
                width: 205,
                height: 251
            }
        ]
    },
    {
        title: t('frame.paper'),
        children: [
            {
                name: 'A2',
                width: 1191,
                height: 1684
            },
            {
                name: 'A3',
                width: 842,
                height: 1191
            },
            {
                name: 'A4',
                width: 595,
                height: 842
            },
            {
                name: 'A5',
                width: 420,
                height: 595
            },
            {
                name: 'A6',
                width: 291,
                height: 420
            }
        ]
    },
    {
        title: t('frame.social_media'),
        children: [
            {
                name: '公众号封面 2.35:1',
                width: 900,
                height: 383
            },
            {
                name: '视频号封面 3:4',
                width: 720,
                height: 960
            },
            {
                name: '微博焦点图 2.15:1',
                width: 560,
                height: 260
            },
            {
                name: '微博封面 16:5',
                width: 960,
                height: 300
            },
            {
                name: '微博横幅 16:9',
                width: 2560,
                height: 1440
            },
            {
                name: '小红书封面 3:4',
                width: 720,
                height: 960
            },
            {
                name: '抖音作品封面 3:4',
                width: 720,
                height: 960
            },
            {
                name: 'Bilibili作品封面 4:3',
                width: 960,
                height: 720
            },
            {
                name: 'YouTube 16:9',
                width: 1280,
                height: 720
            },
        ]
    }
]