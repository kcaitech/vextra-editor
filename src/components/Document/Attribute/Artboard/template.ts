export interface TL {
    name: string;
    width: number;
    height: number;
}

interface Template {
    title: string;
    children: TL[];
}

export const templates: Template[] = [
    {
        title: '手机',
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
        title: '平板',
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
        title: '桌面',
        children: [
            {
                name: 'Desktop',
                width: 1440,
                height: 1024
            },
            {
                name: 'MacBook Air 13”',
                width: 744,
                height: 1133
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
        title: '幻灯片',
        children: [
            {
                name: '幻灯片 16:9',
                width: 1920,
                height: 1080
            },
            {
                name: '幻灯片 4:3',
                width: 1024,
                height: 768
            }
        ]
    },
    {
        title: '手表',
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
        title: '纸张',
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
        title: '社交媒体',
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