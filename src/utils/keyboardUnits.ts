/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import {
    fitView,
    component,
    flattenSelection,
    lessen,
    lower_layer,
    magnify,
    outlineSelection,
    redo,
    scale_0,
    select_all,
    set_lock_for_shapes,
    set_visible_for_shapes,
    undo,
    upper_layer,
} from "./content";
import { WorkSpace } from "@/context/workspace";
import { Action, Tool } from "@/context/tool";
import { Navi } from "@/context/navigate";
import { Arrange } from "@/context/arrange";
import { deleteUnits } from "./delete";
import { enter_path_edit_mode } from "./pathedit";
import { untie_instance } from "./symbol";
import { modifyOpacity } from "./common";
import { message } from "./message";
import { permIsEdit } from "./permission";
import { Menu } from "@/context/menu";
import { hexToX } from "@/components/common/ColorPicker/utils";
import { ArtboardView, Color, ShapeType, ShapeView, SymbolView } from "@kcdesign/data";
import { Attribute } from "@/context/atrribute";
import {
    useArrow,
    useAuto,
    useAutoK,
    useContact,
    useCutout,
    useEllipse,
    useFrame,
    useImage,
    useLine,
    useMask,
    usePen,
    useRect,
    useText,
} from "@/components/Document/Creator/execute";
import { unAutoLayoutFn } from "./auto_layout";
import { Clipboard } from "@/clipboard";
import { group, ungroup } from "@/utils/group_ungroup";
import { KeyboardMgr } from "@/keyboard";

const keydownHandler: { [key: string]: (event: KeyboardEvent, context: Context) => any } = {};

function keydown(event: KeyboardEvent, context: Context) {
    const rf = context.keyHandlers[event.code];
    rf && rf(event, context);

    const f = keydownHandler[event.code];
    f && f(event, context);
}

function keyup(event: KeyboardEvent, context: Context) {
    if (event.code === 'AltLeft' || event.code === 'AltRight') {
        event.preventDefault();
        context.selection.setShowInterval(false);
    }
    if (event.code === "KeyZ") {
        context.selection.zoomIn = false;
    }
}

export function setup(context: Context) {
    const down = (event: KeyboardEvent) => keydown(event, context);
    const up = (event: KeyboardEvent) => keyup(event, context);
    const boardMgr = new KeyboardMgr(context);
    const stop1 = boardMgr.addEventListener('keydown', down);
    const stop2 = boardMgr.addEventListener('keyup', up);
    return () => {
        stop1();
        stop2();
    }
}

keydownHandler[''] = function (event: KeyboardEvent, context: Context) {
}

keydownHandler['KeyA'] = function (event: KeyboardEvent, context: Context) {
    const { metaKey, ctrlKey, altKey, shiftKey } = event;
    const isCtrl = ctrlKey || metaKey;
    if (isCtrl && event.shiftKey) {
        event.preventDefault();
        select_all(context, true);
        return;
    }

    if (shiftKey && altKey) {
        event.preventDefault();
        unAutoLayoutFn(context);
        return;
    }

    if (isCtrl) {
        event.preventDefault();
        select_all(context);
        return;
    }

    if (shiftKey) {
        event.preventDefault();
        context.menu.notify(Menu.AUTO_LAYOUT);
        return;
    }

    if (event.altKey && permIsEdit(context)) {
        event.preventDefault();
        context.arrange.notify(Arrange.FLEX_START); // 图层左对齐
        return;
    }

    if (permIsEdit(context)) {
        event.preventDefault();
        context.tool.setAction(Action.AddFrame); // 容器工具
        return;
    }
}

keydownHandler['KeyB'] = function (event: KeyboardEvent, context: Context) {
    const { metaKey, ctrlKey, altKey } = event;
    if (event.repeat) {
        return;
    }
    if ((metaKey || ctrlKey) && permIsEdit(context)) {
        event.preventDefault();
        context.workspace.notify(WorkSpace.BOLD); // 文本加粗
    }
    if ((metaKey || ctrlKey) && altKey && permIsEdit(context)) {
        untie_instance(context); // 创建组件
        return;
    }
}

keydownHandler['KeyC'] = function (event: KeyboardEvent, context: Context) {
    const { metaKey, ctrlKey, shiftKey } = event;
    const isCtrl = ctrlKey || metaKey;
    if (isCtrl && shiftKey) {
        event.preventDefault();
        context.menu.notify(Menu.WRITE_MEDIA);
        return;
    }
    if (isCtrl && event.altKey) {
        event.preventDefault();
        context.workspace.clipboard.write_properties();
        return;
    }
}

keydownHandler['KeyD'] = function (event: KeyboardEvent, context: Context) {
    if (event.altKey && permIsEdit(context)) {
        event.preventDefault();
        context.arrange.notify(Arrange.FLEX_END) // 图层右对齐
    }
}

keydownHandler['KeyE'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl && event.shiftKey) {
        event.preventDefault();
        if (!permIsEdit(context)) {
            context.tool.setAction(Action.Export);
        }
        context.menu.setExportDialog(true);
    } else if (is_ctrl) {
        event.preventDefault();
        flattenSelection(context);
    } else if (event.shiftKey) {
        context.menu.notify(Menu.TOGGLE_PROTOTYPE);
    }
}

keydownHandler['KeyF'] = function (event: KeyboardEvent, context: Context) {
    const { ctrlKey, metaKey, shiftKey } = event;

    if (ctrlKey || metaKey) {
        event.preventDefault();
        context.navi.notify(Navi.TO_SEARCH); // 图层搜索
        return;
    }

    if (!shiftKey && permIsEdit(context)) {
        event.preventDefault();
        useFrame(context);
        return;
    }
}

keydownHandler['KeyG'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    if (!permIsEdit(context)) return;
    const { ctrlKey, metaKey, shiftKey, altKey } = event;
    const is_ctrl = ctrlKey || metaKey;

    if (is_ctrl && !shiftKey) {
        const t = context.workspace.t.bind(context.workspace);
        const name = altKey ? t('shape.artboard') : t('shape.group')
        group(context, context.selection.selectedShapes, name, altKey);
        return;
    }

    if (is_ctrl && shiftKey) {
        ungroup(context);
    }
}

keydownHandler['KeyH'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    if (!permIsEdit(context)) return;
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl && event.shiftKey) {
        set_visible_for_shapes(context); // 图层隐藏与显示
        return;
    }
    if (event.altKey && event.shiftKey) {
        context.arrange.notify(Arrange.SPACE_AROUND_HOR); // 图层水平等距分布
        return;
    }
    if (event.altKey) {
        context.arrange.notify(Arrange.ITEMS_ALIGN); // 图层水平线对齐
        return;
    }
    if (event.shiftKey) {
        if (event.repeat) {
            return;
        }
        context.attr.notify(Attribute.HOR_HILP);
        return;
    }
}

keydownHandler['KeyI'] = function (event: KeyboardEvent, context: Context) {
    if (!permIsEdit(context)) return;
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl) {
        event.preventDefault();
        context.workspace.notify(WorkSpace.ITALIC); // 文字斜体
        return;
    }
    if (event.shiftKey) {
        event.preventDefault();
        context.tool.notify(Tool.COMPONENT); // 组件工具
        return;
    }
    if (!(window as any).EyeDropper) {
        message('info', '当前浏览器不支持取色工具');
    } else {
        const System_EyeDropper = (window as any).EyeDropper;
        const s_eye_dropper = new System_EyeDropper();
        s_eye_dropper.open().then((result: any) => {
            const rgb = hexToX(result.sRGBHex);
            if (!context.selection.selectedShapes.length) {
                return;
            }
            const page = context.selection.selectedPage!;
            const editor = context.editor4Page(page);
            editor.modifyStyleByEyeDropper(
                context.selection.selectedShapes,
                new Color(1, rgb[0], rgb[1], rgb[2]) as any
            );
        }).catch((e: any) => {
            console.log("failed:", e);
        });
    }
}

keydownHandler['KeyJ'] = function (event: KeyboardEvent, context: Context) {

}

keydownHandler['KeyK'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    if (!permIsEdit(context)) return;
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl && event.shiftKey) {
        useImage(context); // 图片选择工具
        return;
    }
    if (is_ctrl && event.altKey) {
        component(context); // 创建组件
        return;
    }
    useAutoK(context);
}

keydownHandler['KeyL'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    if (!permIsEdit(context)) return;
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl && event.shiftKey) {
        set_lock_for_shapes(context); // 图层隐藏与显示
        return;
    }
    if (event.shiftKey) {
        useArrow(context); // 箭头工具
        return;
    }
    if (event.altKey) {
        context.navi.notify(Navi.LIST_FOLD);
        return;
    }
    useLine(context); // 线段工具
}

keydownHandler['KeyM'] = function (event: KeyboardEvent, context: Context) {
    const isCtrl = event.ctrlKey || event.metaKey;
    if (isCtrl && event.altKey) {
        event.preventDefault();
        event.stopPropagation();
        return useMask(context);
    }
}

keydownHandler['KeyN'] = function (event: KeyboardEvent, context: Context) {

}

keydownHandler['KeyO'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl && event.altKey && permIsEdit(context)) {
        return outlineSelection(context);
    }
    if (!permIsEdit(context) || is_ctrl || event.shiftKey || event.altKey) return;
    useEllipse(context) // 椭圆工具
}

keydownHandler['KeyP'] = function (event: KeyboardEvent, context: Context) {
    if (!permIsEdit(context)) {
        return;
    }

    usePen(context); // 钢笔工具
}

keydownHandler['KeyR'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    if (!permIsEdit(context)) return;
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl && event.shiftKey && event.altKey) {
        event.preventDefault();
        context.editor4Page(context.selection.selectedPage!).adapt(context.selection.selectedShapes);
        return;
    }
    if (is_ctrl && event.shiftKey) {
        event.preventDefault();
        new Clipboard(context).replace(); // 替换图形
        return;
    }
    if (is_ctrl) {
        context.navi.notify(Navi.RENAME);
        return;
    }
    if (event.shiftKey) {
        const status = context.user.isRuleVisible;
        context.user.modifyRuleVisible(!status);
        return;
    }
    if (event.altKey) return;

    useRect(context); // 矩形工具
}

keydownHandler['KeyS'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    if (!permIsEdit(context)) return;
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (event.altKey) {
        context.arrange.notify(Arrange.FLEX_END_COL); // 图层底部对齐
        return;
    }
    if (is_ctrl || event.shiftKey) return;
    useCutout(context); // 切图工具
}

keydownHandler['KeyT'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (!permIsEdit(context) || is_ctrl || event.shiftKey || event.altKey) return;
    useText(context); // 文字工具
}

keydownHandler['KeyU'] = function (event: KeyboardEvent, context: Context) {
    if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        if (!permIsEdit(context)) return;
        context.workspace.notify(WorkSpace.UNDER_LINE); // 文字下划线
    }
}

keydownHandler['KeyV'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl && event.altKey && permIsEdit(context)) {
        event.preventDefault();
        context.workspace.clipboard.paste_properties(); // 粘贴图层属性
        return;
    }
    if (event.altKey && event.shiftKey && permIsEdit(context)) {
        context.arrange.notify(Arrange.SPACE_AROUND_VER); // 图层垂直方向等距分布
        return;
    }
    if (event.altKey && permIsEdit(context)) {
        if (event.repeat) return;
        context.arrange.notify(Arrange.ITEMS_ALIGN_VER); // 图层中线对齐
        return;
    }
    if (event.shiftKey && permIsEdit(context)) {
        if (event.repeat) return;
        context.attr.notify(Attribute.VER_HILP);
        return;
    }
    useAuto(context); // 自由光标
}

keydownHandler['KeyW'] = function (event: KeyboardEvent, context: Context) {
    if (event.altKey) {
        event.preventDefault();
        if (!permIsEdit(context)) return;
        context.arrange.notify(Arrange.FLEX_START_COL);
    }
}

keydownHandler['KeyX'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (!permIsEdit(context)) return;
    if (is_ctrl && event.shiftKey) {
        event.preventDefault();
        context.workspace.notify(WorkSpace.DELETE_LINE); // 下划线
        return;
    }
    if (event.shiftKey) {
        const page = context.selection.selectedPage;
        if (page) {
            const editor = context.editor4Page(page);
            const shapes = context.selection.selectedShapes;
            editor.setShapeBorderFillExchange(shapes);
        }
    }

    if (is_ctrl) {
        return; // 剪切操作已经系统监听
    }
    if (event.shiftKey || event.altKey) return;
    useContact(context); // 连接线功能
}

keydownHandler['KeyY'] = function (event: KeyboardEvent, context: Context) {
}

keydownHandler['KeyZ'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    event.preventDefault();
    if (!is_ctrl && !event.repeat) context.selection.zoomIn = true;
    if (!permIsEdit(context)) return;
    try {
        if (is_ctrl && event.shiftKey) { // 重做
            event.preventDefault();
            redo(context);
            return;
        }
        if (is_ctrl) { // 撤销
            event.preventDefault();
            undo(context);
            return;
        }
    } catch (error) {
        console.error('wrong timing:', error);
    }
    if (event.altKey) {
        event.preventDefault();
        lessen(context);
        return;
    }
}

let last_opacity = -1;
let last_opacity_keeper: any = null;

function get_opacity(val: number) {
    let need_keep = !last_opacity_keeper;

    if (need_keep) {
        last_opacity = val;
        last_opacity_keeper = setTimeout(() => {
            last_opacity = -1;
            clearTimeout(last_opacity_keeper);
            last_opacity_keeper = null;
        }, 1000);
        return (val ? val * 10 : 100) / 100;
    } else {
        clearTimeout(last_opacity_keeper);
        last_opacity_keeper = null;
        return Number(last_opacity.toString() + val.toString()) / 100;
    }
}

keydownHandler['Digit0'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl || event.shiftKey) {
        event.preventDefault();
        scale_0(context);
        return;
    }
    if (event.repeat) {
        return;
    }
    if (!permIsEdit(context)) return;
    if (event.shiftKey || event.altKey) return;
    modifyOpacity(context, get_opacity(0));
}

keydownHandler['Numpad0'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl || event.shiftKey) {
        event.preventDefault();
        scale_0(context);
        return;
    }
    if (event.repeat) {
        return;
    }
    if (!permIsEdit(context)) return;
    if (event.shiftKey || event.altKey) return;
    modifyOpacity(context, get_opacity(0));
}

keydownHandler['Digit1'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl || event.shiftKey) {
        event.preventDefault();
        fitView(context);
        return;
    }
    if (event.repeat) {
        return;
    }
    if (event.altKey) {
        context.navi.set_current_navi_module('Shape');
    }
    if (!permIsEdit(context)) return;
    if (event.shiftKey || event.altKey) return;
    modifyOpacity(context, get_opacity(1));
}

keydownHandler['Numpad1'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl || event.shiftKey) {
        event.preventDefault();
        fitView(context);
        return;
    }
    if (event.repeat) {
        return;
    }
    if (event.altKey) {
        context.navi.set_current_navi_module('Shape');
    }
    if (!permIsEdit(context)) return;
    if (event.shiftKey || event.altKey) return;
    modifyOpacity(context, get_opacity(1));
}

keydownHandler['Digit2'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl || event.shiftKey) {
        event.preventDefault();
        fitView(context, false, true);
        return;
    }
    if (event.repeat) {
        return;
    }
    if (event.altKey) {
        context.navi.set_current_navi_module('Comps');
    }
    if (event.shiftKey || event.altKey || is_ctrl) return;
    modifyOpacity(context, get_opacity(2));
}

keydownHandler['Numpad2'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl || event.shiftKey) {
        event.preventDefault();
        fitView(context, false, true);
        return;
    }
    if (event.repeat) {
        return;
    }
    if (event.altKey) {
        context.navi.set_current_navi_module('Comps');
    }
    if (event.shiftKey || event.altKey || is_ctrl) return;
    modifyOpacity(context, get_opacity(2));
}

keydownHandler['Digit3'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    if (event.repeat) {
        return;
    }
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (event.altKey) {
        context.navi.set_current_navi_module('Comment');
    }
    if (event.shiftKey || event.altKey || is_ctrl) return;
    modifyOpacity(context, get_opacity(3));
}

keydownHandler['Numpad3'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    if (event.repeat) {
        return;
    }
    if (event.altKey) {
        context.navi.set_current_navi_module('Comment');
    }
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (event.shiftKey || event.altKey || is_ctrl) return;
    modifyOpacity(context, get_opacity(3));
}

keydownHandler['Digit4'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (event.shiftKey || event.altKey || is_ctrl) return;
    modifyOpacity(context, get_opacity(4));
}

keydownHandler['Numpad4'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (event.shiftKey || event.altKey || is_ctrl) return;
    modifyOpacity(context, get_opacity(4));
}

keydownHandler['Digit5'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (event.shiftKey || event.altKey || is_ctrl) return;
    modifyOpacity(context, get_opacity(5));
}

keydownHandler['Numpad5'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (event.shiftKey || event.altKey || is_ctrl) return;
    modifyOpacity(context, get_opacity(5));
}

keydownHandler['Digit6'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (event.shiftKey || event.altKey || is_ctrl) return;
    modifyOpacity(context, get_opacity(6));
}

keydownHandler['Numpad6'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (event.shiftKey || event.altKey || is_ctrl) return;
    modifyOpacity(context, get_opacity(6));
}

keydownHandler['Digit7'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (event.shiftKey || event.altKey || is_ctrl) return;
    modifyOpacity(context, get_opacity(7));
}

keydownHandler['Numpad7'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (event.shiftKey || event.altKey || is_ctrl) return;
    modifyOpacity(context, get_opacity(7));
}

keydownHandler['Digit8'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (event.shiftKey || event.altKey || is_ctrl) return;
    modifyOpacity(context, get_opacity(8));
}

keydownHandler['Numpad8'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (event.shiftKey || event.altKey || is_ctrl) return;
    modifyOpacity(context, get_opacity(8));
}

keydownHandler['Digit9'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (event.shiftKey || event.altKey || is_ctrl) return;
    modifyOpacity(context, get_opacity(9));
}

keydownHandler['Numpad9'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (event.shiftKey || event.altKey || is_ctrl) return;
    modifyOpacity(context, get_opacity(9));
}

keydownHandler['Enter'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    if (!permIsEdit(context)) return;
    enter_path_edit_mode(context, event);
}

keydownHandler['NumpadEnter'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    if (!permIsEdit(context)) return;
    enter_path_edit_mode(context, event);
}

keydownHandler['Escape'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    if (event.shiftKey) {
        context.escstack.clear();
        return;
    }
    context.escstack.execute();
}

keydownHandler['Backslash'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl && event.shiftKey) {
        event.preventDefault();
        context.layout.side();
        return;
    }
    if (is_ctrl) {
        event.preventDefault();
        // context.workspace.notify(WorkSpace.HIDDEN_UI);
        context.layout.all();
    }
}

keydownHandler['Backspace'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    if (!permIsEdit(context)) return;
    deleteUnits(context, event.shiftKey);
}

keydownHandler['Delete'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    if (!permIsEdit(context)) return;
    deleteUnits(context, event.shiftKey);
}

keydownHandler['BracketRight'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl && event.shiftKey && permIsEdit(context)) {
        event.preventDefault();
        upper_layer(context);
        return;
    }
    if (is_ctrl) {
        event.preventDefault();
        if (!permIsEdit(context)) {
            return;
        }
        upper_layer(context, 1);
        return;
    }
}

keydownHandler['BracketLeft'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl && event.shiftKey && permIsEdit(context)) {
        event.preventDefault();
        lower_layer(context);
        return;
    }
    if (is_ctrl) {
        event.preventDefault();
        if (!permIsEdit(context)) {
            return;
        }
        lower_layer(context, 1);
        return;
    }
}
keydownHandler['Equal'] = function (event: KeyboardEvent, context: Context) {
    // todo 缩放页面视图
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl) {
        event.preventDefault();
        magnify(context);
        return;
    }
}

keydownHandler['Minus'] = function (event: KeyboardEvent, context: Context) {
    // todo 缩放页面视图
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl) {
        event.preventDefault();
        lessen(context);
        return;
    }
}

keydownHandler['Tab'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    // TODO 选区切换
}

keydownHandler['Quote'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    const isCtrl = event.ctrlKey || event.metaKey;

    // 对齐像素
    if (event.shiftKey && isCtrl) {
        const status = context.user.isPixelAlignMent;
        context.user.modifyPixelAlignment(!status);
        message('info', status
            ? context.workspace.t('setting.pixelAlignMentOff')
            : context.workspace.t('setting.pixelAlignMentOn'));
        return;
    }

    // 像素网格
    if (isCtrl) {
        const status = context.user.isPixelGrid;
        context.user.modifyPixelGrid(!status);

        message('info', status
            ? context.workspace.t('setting.pixelGridOff')
            : context.workspace.t('setting.pixelGridOn'));
        return;
    }
}

function modifyLivingGroupForLabel(context: Context) {
    if (!context.selection.selectedShapes.length) return;
    context.selection.setShowInterval(true);

    if (context.selection.hoveredShape) {
        context.selection.setLabelLivingGroup([]);
    } else {
        const parents: Set<ShapeView> = new Set();
        for (const view of context.selection.selectedShapes) {
            const parent = view.parent!;
            if ((parent instanceof ArtboardView || parent instanceof SymbolView) && parent.parent?.type === ShapeType.Page) {
                parents.add(parent);
            }
        }
        if (parents.size === 1) parents.forEach(v => {
            context.selection.setLabelLivingGroup([v]);
        });
    }

}
keydownHandler['AltLeft'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    if (event.repeat) return;
    modifyLivingGroupForLabel(context);
}
keydownHandler['AltRight'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    if (event.repeat) return;
    modifyLivingGroupForLabel(context);
}
keydownHandler['Comma'] = function (event: KeyboardEvent, context: Context) {
    const { ctrlKey, metaKey, shiftKey } = event;
    if ((ctrlKey || metaKey) && shiftKey) {
        event.preventDefault();
        context.attr.notify(Attribute.MINUS_SIZE_CHANGE);
    }
}
keydownHandler['Period'] = function (event: KeyboardEvent, context: Context) {
    const { ctrlKey, metaKey, shiftKey } = event;
    if ((ctrlKey || metaKey) && shiftKey) {
        event.preventDefault();
        context.attr.notify(Attribute.ADD_SIZE_CHANGE);
    }
}