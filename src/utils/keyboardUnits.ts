import { Context } from "@/context";
import { adapt_page, component, lower_layer, redo, scale_0, select_all, set_lock_for_shapes, set_visible_for_shapes, undo, uppper_layer } from "./content";
import { Perm, WorkSpace } from "@/context/workspace";
import { Action, Tool } from "@/context/tool";
import { Navi } from "@/context/navigate";
import { Arrange } from "@/context/arrange";
import { deleteUnits } from "./delete";
import { enter_path_edit_mode } from "./pathedit";
import { untie_instance } from "./symbol";
import { modifyOpacity } from "./common";
import { message } from "./message";

// todo 键盘事件的权限处理

const keydownHandler: { [key: string]: (event: KeyboardEvent, context: Context) => any } = {};

function keydown(event: KeyboardEvent, context: Context) {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) { // 不处理输入框内的键盘事件
        return;
    }

    if (context.workspace.documentPerm !== Perm.isEdit || context.tool.isLable) { // 非编辑状态下允许的动作
        const { code, ctrlKey, metaKey, shiftKey } = event;
        if (!(code === 'KeyV' || code === 'KeyC' || code === 'KeyA' || code === 'Digit0' || code === 'Escape' || ctrlKey || metaKey || shiftKey)) {
            return;
        }
    }

    const f = keydownHandler[event.code];
    f && f(event, context);
}
function keyup(event: KeyboardEvent, context: Context) {

}

export function setup(context: Context) {
    const down = (event: KeyboardEvent) => keydown(event, context);
    const up = (event: KeyboardEvent) => keyup(event, context);

    document.addEventListener('keydown', down);
    document.addEventListener('keyup', up);

    const remove_keyboard_units = () => {
        document.removeEventListener('keydown', down);
        document.removeEventListener('keyup', up);
    }

    return remove_keyboard_units;
}

keydownHandler[''] = function (event: KeyboardEvent, context: Context) { }

keydownHandler['KeyA'] = function (event: KeyboardEvent, context: Context) {
    if (event.shiftKey && event.altKey) {
        event.preventDefault();
        context.arrange.notify(Arrange.FLEX_START); // 图层左对齐
        return;
    }
    const { metaKey, ctrlKey } = event;
    if (metaKey || ctrlKey) {
        event.preventDefault();
        select_all(context);
        return;
    }
}

keydownHandler['KeyB'] = function (event: KeyboardEvent, context: Context) {
    const { metaKey, ctrlKey, altKey } = event;
    if (event.repeat) {
        return;
    }
    if (metaKey || ctrlKey) {
        event.preventDefault();
        context.workspace.notify(WorkSpace.BOLD); // 文本加粗
    }
    if ((metaKey || ctrlKey) && altKey) {
        untie_instance(context); // 创建组件
        return;
    }
}

keydownHandler['KeyC'] = function (event: KeyboardEvent, context: Context) {
    const { metaKey, ctrlKey, shiftKey } = event;
    if ((ctrlKey || metaKey) && !shiftKey) {
        // context.workspace.notify(WorkSpace.COPY); // 拷贝
        return
    }
    event.preventDefault();
    if (shiftKey) {
        context.comment.setVisibleComment(!context.comment.isVisibleComment); // 评论隐藏与显示
        return;
    }
    context.tool.setAction(Action.AddComment)
}

keydownHandler['KeyD'] = function (event: KeyboardEvent, context: Context) {
    if (event.altKey) {
        event.preventDefault();
        context.arrange.notify(Arrange.FLEX_END) // 图层右对齐
    }
}

keydownHandler['KeyE'] = function (event: KeyboardEvent, context: Context) {

}

keydownHandler['KeyF'] = function (event: KeyboardEvent, context: Context) {
    const { ctrlKey, metaKey, shiftKey } = event;

    if (ctrlKey || metaKey) {
        event.preventDefault();
        event.preventDefault();
        console.log('ctrlKey');

        context.navi.notify(Navi.TO_SEARCH); // 图层搜索
        return;
    }

    if (!shiftKey) {
        event.preventDefault();
        context.tool.setAction(Action.AddFrame); // 容器工具
        return;
    }
}

keydownHandler['KeyG'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();

    const { ctrlKey, metaKey, shiftKey, altKey } = event;
    const is_ctrl = ctrlKey || metaKey;

    if (is_ctrl && !shiftKey) {
        event.preventDefault();
        context.tool.notify(Tool.GROUP, altKey); // 创建编组或容器
        return;
    }

    if (is_ctrl && shiftKey) {
        event.preventDefault();
        context.tool.notify(Tool.UNGROUP); // 解除编组或容器
    }
}

keydownHandler['KeyH'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl && event.shiftKey) {
        event.preventDefault();
        set_visible_for_shapes(context); // 图层隐藏与显示
        return;
    }
    if (event.altKey && event.shiftKey) {
        event.preventDefault();
        context.arrange.notify(Arrange.SPACE_AROUND_HOR); // 图层水平等距分布
        return;
    }
    if (event.altKey) {
        event.preventDefault();
        context.arrange.notify(Arrange.ITEMS_ALIGN); // 图层水平线对齐
    }
}

keydownHandler['KeyI'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl) {
        event.preventDefault();
        context.workspace.notify(WorkSpace.ITALIC); // 文字斜体
        return;
    }
    if (event.shiftKey) {
        event.preventDefault();
        context.tool.notify(Tool.COMPONENT); // 组件工具
    }
}

keydownHandler['KeyJ'] = function (event: KeyboardEvent, context: Context) {

}

keydownHandler['KeyK'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl && event.shiftKey) {
        context.tool.notify(Tool.SELECT_IMAGE) // 图片选择工具
        return;
    }
    if (is_ctrl && event.altKey) {
        component(context); // 创建组件
        return;
    }
    context.tool.setAction(Action.AutoK); // 等比缩放工具
}

keydownHandler['KeyL'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl && event.shiftKey) {
        set_lock_for_shapes(context); // 图层隐藏与显示
        return;
    }
    if (event.shiftKey) {
        context.tool.setAction(Action.AddArrow); // 箭头工具
        return;
    }
    context.tool.setAction(Action.AddLine); // 线段工具
}

keydownHandler['KeyM'] = function (event: KeyboardEvent, context: Context) {

}

keydownHandler['KeyN'] = function (event: KeyboardEvent, context: Context) {

}

keydownHandler['KeyO'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    context.tool.setAction(Action.AddEllipse); // 椭圆工具
}

keydownHandler['KeyP'] = function (event: KeyboardEvent, context: Context) { }

keydownHandler['KeyR'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl && event.shiftKey) {
        event.preventDefault();
        context.workspace.clipboard.replace() // 替换图形 // 替换图形
        return;
    }
    context.tool.setAction(Action.AddRect); // 矩形工具
}

keydownHandler['KeyS'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    if (event.altKey) {
        context.arrange.notify(Arrange.FLEX_END_COL); // 图层右侧对齐
        return;
    }
    context.tool.setAction(Action.AddCutout); // 切图工具
}

keydownHandler['KeyT'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    context.tool.setAction(Action.AddText); // 文字工具
}

keydownHandler['KeyU'] = function (event: KeyboardEvent, context: Context) {
    if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        context.workspace.notify(WorkSpace.UNDER_LINE); // 文字下划线
    }
}

keydownHandler['KeyV'] = function (event: KeyboardEvent, context: Context) {
    if (event.ctrlKey || event.metaKey) {
        return;
    }

    event.preventDefault();
    if (event.altKey && event.shiftKey) {
        context.arrange.notify(Arrange.SPACE_AROUND_VER); // 图层垂直方向等距分布
        return;
    }
    if (event.altKey) {
        context.arrange.notify(Arrange.ITEMS_ALIGN_VER); // 图层中线对齐
    }
    context.tool.setAction(Action.AutoV); // 自由光标
}

keydownHandler['KeyW'] = function (event: KeyboardEvent, context: Context) {
    if (event.altKey) {
        event.preventDefault();
        context.arrange.notify(Arrange.FLEX_START_COL);
    }
}

keydownHandler['KeyX'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;

    if (is_ctrl && event.shiftKey) {
        event.preventDefault();
        context.workspace.notify(WorkSpace.DELETE_LINE); // 下划线
        return;
    }

    if (is_ctrl) {
        return; // 剪切操作已经系统监听
    }
    context.tool.setAction(Action.AddContact); // 连接线功能
}

keydownHandler['KeyY'] = function (event: KeyboardEvent, context: Context) { }

keydownHandler['KeyZ'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    try {
        if (is_ctrl && event.shiftKey) { // 重做
            event.preventDefault();
            redo(context);
            return;
        }

        if (is_ctrl) { // 撤销
            event.preventDefault();
            undo(context);
        }
    } catch (error) {
        console.log('wrong timing:', error);
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

    if (is_ctrl) {
        event.preventDefault();
        scale_0(context);
        return;
    }
    if (event.repeat) {
        return;
    }
    modifyOpacity(context, get_opacity(0));
}

keydownHandler['Numpad0'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;

    if (is_ctrl) {
        event.preventDefault();
        scale_0(context);
        return;
    }
    if (event.repeat) {
        return;
    }
    modifyOpacity(context, get_opacity(0));
}

keydownHandler['Digit1'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl) {
        event.preventDefault();
        adapt_page(context);
        return;
    }
    if (event.repeat) {
        return;
    }
    modifyOpacity(context, get_opacity(1));
}

keydownHandler['Numpad1'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl) {
        event.preventDefault();
        adapt_page(context);
        return;
    }
    if (event.repeat) {
        return;
    }
    modifyOpacity(context, get_opacity(1));
}

keydownHandler['Digit2'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    modifyOpacity(context, get_opacity(2));
}

keydownHandler['Numpad2'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    modifyOpacity(context, get_opacity(2));
}

keydownHandler['Digit3'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    modifyOpacity(context, get_opacity(3));
}

keydownHandler['Numpad3'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    modifyOpacity(context, get_opacity(3));
}

keydownHandler['Digit4'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    modifyOpacity(context, get_opacity(4));
}

keydownHandler['Numpad4'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    modifyOpacity(context, get_opacity(4));
}

keydownHandler['Digit5'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    modifyOpacity(context, get_opacity(5));
}

keydownHandler['Numpad5'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    modifyOpacity(context, get_opacity(5));
}

keydownHandler['Digit6'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    modifyOpacity(context, get_opacity(6));
}

keydownHandler['Numpad6'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    modifyOpacity(context, get_opacity(6));
}

keydownHandler['Digit7'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    modifyOpacity(context, get_opacity(7));
}

keydownHandler['Numpad7'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    modifyOpacity(context, get_opacity(7));
}

keydownHandler['Digit8'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    modifyOpacity(context, get_opacity(8));
}

keydownHandler['Numpad8'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    modifyOpacity(context, get_opacity(8));
}

keydownHandler['Digit9'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    modifyOpacity(context, get_opacity(9));
}

keydownHandler['Numpad9'] = function (event: KeyboardEvent, context: Context) {
    if (event.repeat) {
        return;
    }
    modifyOpacity(context, get_opacity(9));
}

keydownHandler['Enter'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    enter_path_edit_mode(context);
}

keydownHandler['NumpadEnter'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    enter_path_edit_mode(context);
}

keydownHandler['Escape'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    if (event.shiftKey) {
        context.esctask.clear_stack.call(context.esctask);
        return;
    }
    context.esctask.execute.call(context.esctask);
}

keydownHandler['Backslash'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl && event.shiftKey) {
        event.preventDefault();
        context.workspace.notify(WorkSpace.HIDDEN_UI, true);
        return;
    }
    if (is_ctrl) {
        event.preventDefault();
        context.workspace.notify(WorkSpace.HIDDEN_UI);
    }
}

keydownHandler['Backspace'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    deleteUnits(context);
}

keydownHandler['Delete'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    deleteUnits(context);
}

keydownHandler['BracketRight'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    uppper_layer(context);
}

keydownHandler['BracketLeft'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    lower_layer(context);
}

keydownHandler['Equal'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    uppper_layer(context, 1);
}

keydownHandler['Minus'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    lower_layer(context, 1);
}

keydownHandler['Tab'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    // TODO 选区切换
}

keydownHandler['Quote'] = function (event: KeyboardEvent, context: Context) {
    event.preventDefault();
    if (event.shiftKey && (event.ctrlKey || event.metaKey)) {
        const status = context.user.isPixelAlignMent;
        context.user.modifyPixelAlignment(!status);
        message('info', status
            ? context.workspace.t('setting.pixelAlignMentOff')
            : context.workspace.t('setting.pixelAlignMentOn'));
        return;
    }
}
