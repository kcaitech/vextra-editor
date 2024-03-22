import { computed } from "vue";

export enum KeysType {
    foundation,
    tool,
    view,
    zoom,
    text,
    vector,
    layer,
    cursor,
    edit,
    // arrangement,
    // components,
}

type TypeTextMap = {
    [K in KeysType]: string;
};

class ShortcutsService {

    static typeTextMap: TypeTextMap = {
        [KeysType.foundation]: '基础',
        [KeysType.tool]: '工具',
        [KeysType.view]: '视图',
        [KeysType.zoom]: '缩放',
        [KeysType.text]: '文本',
        [KeysType.vector]: '矢量',
        [KeysType.layer]: '图层',
        [KeysType.cursor]: '光标',
        [KeysType.edit]: '编辑',
        // [KeysType.arrangement]: '排列',
        // [KeysType.components]: '组件'
    };

    static foundation = [
        {
            title: '',
            shortcutKey: [
                { name: '显示/隐藏操作界面', keys: "Ctrl + \\" },
            ],
        },
        {
            title: '',
            shortcutKey: [
                { name: '平移画布', keys: 'Space + Drag' },
            ],
        },
        {
            title: '',
            shortcutKey: [
                { name: '评论', keys: 'C' },

            ],
        },
    ];
    static tool = [
        {
            title: '',
            shortcutKey: [
                { name: '选择', keys: 'V' },
                { name: '等比缩放', keys: 'K' },
                { name: '容器', keys: 'F' },
            ],
        },
        {
            title: '',
            shortcutKey: [
                { name: '矩形', keys: 'R' },
                { name: '圆', keys: 'O' },
                { name: '直线', keys: 'L' },
                { name: '连接线', keys: 'X' },
                { name: '文字', keys: 'T' },
            ],
        },
        {
            title: '',
            shortcutKey: [
                { name: '评论', keys: 'C' },

            ],
        },
    ];
    static view = [
        {
            title: '',
            shortcutKey: [
                { name: '显示/隐藏评论', keys: 'Shift + C' },

            ],
        },
        {
            title: '',
            shortcutKey: [

            ],
        },
        {
            title: '',
            shortcutKey: [

            ],
        },
    ];
    static zoom = [
        {
            title: '',
            shortcutKey: [
                { name: '缩放到100%', keys: 'Ctrl + 0' },
                { name: '适应画布', keys: 'Ctrl + 1' },
            ],
        },
        {
            title: '',
            shortcutKey: [

            ],
        },
        {
            title: '',
            shortcutKey: [

            ],
        },
    ];
    static text = [
        {
            title: '',
            shortcutKey: [
                { name: '加粗', keys: 'Ctrl + B' },
                { name: '下划线', keys: 'Ctrl + U' },
                { name: '删除线', keys: 'Shift + Ctrl + X' },
                { name: '倾斜', keys: 'Ctrl + I' },
            ],
        },
        {
            title: '',
            shortcutKey: [

            ],
        },
        {
            title: '',
            shortcutKey: [

            ],
        },
    ];
    static vector = [
        {
            title: '',
            shortcutKey: [
                { name: '选择', keys: 'V' },
            ],
        },
        {
            title: '',
            shortcutKey: [

            ],
        },
        {
            title: '',
            shortcutKey: [

            ],
        },
    ];
    static layer = [
        {
            title: '',
            shortcutKey: [
                { name: '全选', keys: 'Ctrl + A' },
                { name: '反选', keys: 'Shift + Ctrl + A' },
                { name: '取消选中', keys: 'ESC' },
                { name: '显示/隐藏图层', keys: 'Shift + Ctrl + H' },
                { name: '锁定/解锁图层', keys: 'Shift + Ctrl + L' },
            ],
        },
        {
            title: '',
            shortcutKey: [
                { name: '创建编组', keys: 'Ctrl + G' },
                { name: '创建容器', keys: 'Alt + Ctrl + G' },
                { name: '取消编组/容器/区域', keys: 'Shift + Ctrl + G' },
            ],
        },
        {
            title: '',
            shortcutKey: [
                { name: '上移一层', keys: 'Ctrl + ]' },
                { name: '下移一层', keys: 'Ctrl + [' },
                { name: '移到顶层', keys: ']' },
                { name: '移到底层', keys: '[' },
                { name: '大步进移动图层', keys: 'Shift + Direction' },
            ],
        },
    ];
    static cursor = [
        {
            title: '',
            shortcutKey: [
                { name: '选择组合内图层', keys: 'Ctrl + Click' },
            ],
        },
        {
            title: '',
            shortcutKey: [
                { name: '拖拽复制', keys: 'Alt + Drag' },
            ],
        },
        {
            title: '',
            shortcutKey: [

            ],
        },
    ];
    static edit = [
        {
            title: '',
            shortcutKey: [
                { name: '复制', keys: 'Ctrl + C' },
                { name: '剪切', keys: 'Ctrl + X' },
                { name: '粘贴', keys: 'Ctrl + V' },
                { name: '粘贴并替换', keys: 'Shift + Ctrl + R' },
            ],
        },
        {
            title: '',
            shortcutKey: [
                { name: '大步进移动图层', keys: 'Shift + Direction' },
            ],
        },
        {
            title: '',
            shortcutKey: [

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
                return this.foundation;
            case 1:
                return this.tool;
            case 2:
                return this.view;
            case 3:
                return this.zoom;
            case 4:
                return this.text;
            case 5:
                return this.vector;
            case 6:
                return this.layer;
            case 7:
                return this.cursor;
            case 8:
                return this.edit;
            case 9:
                return this.arrangement;
            case 10:
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