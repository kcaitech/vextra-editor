import { computed } from "vue";

export enum KeysType {
    tool,
    view,
    zoom,
    text,
    arrangement,
    layers,
    edit,
    shape,
    components,
}

type TypeTextMap = {
    [K in KeysType]: string;
};

class ShortcutsService {

    static typeTextMap: TypeTextMap = {
        [KeysType.tool]: '工具',
        [KeysType.view]: '视图',
        [KeysType.zoom]: '缩放',
        [KeysType.text]: '文本',
        [KeysType.arrangement]: '排列',
        [KeysType.layers]: '布局',
        [KeysType.edit]: '编辑',
        [KeysType.shape]: '形状',
        [KeysType.components]: '组件'
    };

    static tool = [
        {
            title: '',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
        {
            title: '',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
        {
            title: '',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
    ];
    static view = [
        {
            title: '',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
        {
            title: '测试标题',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
        {
            title: '',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
    ];
    static zoom = [
        {
            title: '',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
        {
            title: '',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
        {
            title: '',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
    ];
    static text = [
        {
            title: '',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
        {
            title: '测试标题',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
        {
            title: '',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
    ];
    static arrangement = [
        {
            title: '',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
        {
            title: '',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
        {
            title: '',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
    ];
    static layers = [
        {
            title: '',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
        {
            title: '测试标题',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
        {
            title: '',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
    ];
    static edit = [
        {
            title: '',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
        {
            title: '',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
        {
            title: '',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
    ];
    static shape = [
        {
            title: '',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
        {
            title: '测试标题',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
        {
            title: '',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
    ];
    static components = [
        {
            title: '',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
        {
            title: '',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
        {
            title: '',
            shortcutKey: [
                { name: '复制1', keys: 'Ctrl+C' },
                { name: '复制2', keys: 'Ctrl+C' },
            ],
        },
    ];

    static getShortcutsByType(type: number) {
        switch (type) {
            case 0:
                return this.tool;
            case 1:
                return this.view;
            case 2:
                return this.zoom;
            case 3:
                return this.text;
            case 4:
                return this.arrangement;
            case 5:
                return this.layers;
            case 6:
                return this.edit;
            case 7:
                return this.shape;
            case 8:
                return this.components;
            default:
                return [];
        }
    }
}

//返回命中的快捷键数据
export const selecttype = computed(() => {
    return (num: number) => {
        return ShortcutsService.getShortcutsByType(num);
    };
});

//返回标题
export const getTypeText = (num: KeysType) => ShortcutsService.typeTextMap[num]; 