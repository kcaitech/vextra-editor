import { Context } from "@/context";
import { component, lower_layer, select_all, set_lock_for_shapes, set_visible_for_shapes, uppper_layer } from "./content";
import { Perm, WorkSpace } from "@/context/workspace";
import { Action, Tool } from "@/context/tool";
import { Navi } from "@/context/navigate";
import { Arrange } from "@/context/arrange";
import { deleteUnits } from "./delete";
import { replace } from "./clipboard";

const keydownHandler: { [key: string]: (event: KeyboardEvent, context: Context) => any } = {};

function keydown(event: KeyboardEvent, context: Context) {
    if (event.target instanceof HTMLInputElement) { // 不处理输入框内的键盘事件
        return;
    }
    if (context.workspace.documentPerm !== Perm.isEdit) { // 非编辑状态下允许的动作
        const { code, ctrlKey, metaKey, shiftKey } = event;
        if (!(code === 'KeyV' || code === 'KeyC' || code === 'KeyA' || code === 'Digit0 ' || ctrlKey || metaKey || shiftKey)) {
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
        select_all(context);
        return;
    }
}

keydownHandler['KeyB'] = function (event: KeyboardEvent, context: Context) {
    const { metaKey, ctrlKey } = event;
    if (event.repeat) {
        return;
    }
    if (metaKey || ctrlKey) {
        context.workspace.notify(WorkSpace.BOLD); // 文本加粗
    }
}

keydownHandler['KeyC'] = function (event: KeyboardEvent, context: Context) {
    const { metaKey, ctrlKey, shiftKey } = event;
    if ((ctrlKey || metaKey) && !shiftKey) {
        context.workspace.notify(WorkSpace.COPY); // 拷贝
        return
    }
    if (shiftKey) {
        context.comment.setVisibleComment(!context.comment.isVisibleComment); // 评论隐藏与显示
        return;
    }
    context.workspace.notify(WorkSpace.COPY);
}

keydownHandler['KeyD'] = function (event: KeyboardEvent, context: Context) {
    if (event.altKey) {
        context.arrange.notify(Arrange.FLEX_END) // 图层右对齐
    }
}

keydownHandler['KeyE'] = function (event: KeyboardEvent, context: Context) {

}

keydownHandler['KeyF'] = function (event: KeyboardEvent, context: Context) {
    const { ctrlKey, metaKey, shiftKey } = event;

    if (ctrlKey || metaKey) {
        event.preventDefault();
        context.navi.notify(Navi.TO_SEARCH); // 图层搜索
        return;
    }

    if (!shiftKey) {
        context.tool.setAction(Action.AddFrame); // 容器工具
        return;
    }
}

keydownHandler['KeyG'] = function (event: KeyboardEvent, context: Context) {
    const { ctrlKey, metaKey, shiftKey, altKey } = event;
    const is_ctrl = ctrlKey || metaKey;

    if (is_ctrl && !shiftKey) {
        context.tool.notify(Tool.GROUP, altKey); // 创建编组或容器
        return;
    }

    if (is_ctrl && shiftKey) {
        context.tool.notify(Tool.UNGROUP); // 解除编组或容器
    }
}

keydownHandler['KeyH'] = function (event: KeyboardEvent, context: Context) {
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
    }
}

keydownHandler['KeyI'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl) {
        context.workspace.notify(WorkSpace.ITALIC); // 文字斜体
        return;
    }
    if (event.shiftKey) {
        context.tool.notify(Tool.COMPONENT); // 组件工具
    }
}

keydownHandler['KeyJ'] = function (event: KeyboardEvent, context: Context) {

}

keydownHandler['KeyK'] = function (event: KeyboardEvent, context: Context) {
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
    context.tool.setAction(Action.AddEllipse); // 椭圆工具
}

keydownHandler['KeyP'] = function (event: KeyboardEvent, context: Context) { }

keydownHandler['KeyR'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl && event.shiftKey) {
        event.preventDefault();
        replace(context, context.selection.selectedShapes); // 替换图形
        return;
    }
    context.tool.setAction(Action.AddRect); // 矩形工具
}

keydownHandler['KeyS'] = function (event: KeyboardEvent, context: Context) {
    if (event.altKey) {
        context.arrange.notify(Arrange.FLEX_END_COL);
    }
}

keydownHandler['KeyT'] = function (event: KeyboardEvent, context: Context) {
    context.tool.setAction(Action.AddText); // 文字工具
}

keydownHandler['KeyU'] = function (event: KeyboardEvent, context: Context) {
    if (event.ctrlKey || event.metaKey) {
        context.workspace.notify(WorkSpace.UNDER_LINE); // 文字下划线
    }
}

keydownHandler['KeyV'] = function (event: KeyboardEvent, context: Context) {
    if (event.ctrlKey || event.metaKey) {
        context.workspace.notify(WorkSpace.PASTE); // 复制图层（文本的复制不在这里处理）
        return;
    }
    if (event.altKey && event.shiftKey) {
        context.arrange.notify(Arrange.SPACE_AROUND_VER); // 图层垂直方向等距分布
        return;
    }
    if (event.altKey) {
        context.arrange.notify(Arrange.ITEMS_ALIGN_VER); // 图层中线对齐
    }
}

keydownHandler['KeyW'] = function (event: KeyboardEvent, context: Context) {
    if (event.altKey) {
        context.arrange.notify(Arrange.FLEX_START_COL);
    }
}

keydownHandler['KeyX'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl && event.shiftKey) {
        context.workspace.notify(WorkSpace.DELETE_LINE); // 下划线
        return;
    }
    if (is_ctrl) {
        context.workspace.clipboard
            .cut()
            .then((res) => {
                if (!res) {
                    return;
                }
                context.selection.resetSelectShapes(); // 剪切图形
            })
    }
}

keydownHandler['KeyY'] = function (event: KeyboardEvent, context: Context) { }

keydownHandler['KeyZ'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    const repo = context.repo;
    if (is_ctrl && event.shiftKey) { // 重做
        repo.canRedo() && repo.redo();
        if (context.selection.selectedShapes.length > 1) {
            context.workspace.notify(WorkSpace.CLAC_ATTRI);
        }
        return;
    }
    if (is_ctrl) { // 撤销
        repo.canUndo() && repo.undo();
        const selection = context.selection;
        const shapes = context.selection.selectedShapes;
        const page = context.selection.selectedPage!;
        const flat = page.shapes;
        if (shapes.length) {
            for (let i = 0; i < shapes.length; i++) {
                const item = shapes[i];
                if (!flat.get(item.id)) selection.unSelectShape(item);
            }
        }
        if (context.selection.selectedShapes.length > 1) {
            context.workspace.notify(WorkSpace.CLAC_ATTRI);
        }
        return;
    }
}

keydownHandler['Escape'] = function (event: KeyboardEvent, context: Context) {
    if (event.shiftKey) {
        context.esctask.clear_stack.call(context.esctask);
        return;
    }
    context.esctask.execute.call(context.esctask);
}

keydownHandler['Backslash'] = function (event: KeyboardEvent, context: Context) {
    const is_ctrl = event.ctrlKey || event.metaKey;
    if (is_ctrl && event.shiftKey) {
        context.workspace.notify(WorkSpace.HIDDEN_UI, true);
        return;
    }
    if (is_ctrl) {
        context.workspace.notify(WorkSpace.HIDDEN_UI);
    }
}

keydownHandler['Backspace'] = function (event: KeyboardEvent, context: Context) {
    deleteUnits(context);
}

keydownHandler['Delete'] = function (event: KeyboardEvent, context: Context) {
    deleteUnits(context);
}

keydownHandler['BracketRight'] = function (event: KeyboardEvent, context: Context) {
    uppper_layer(context);
}

keydownHandler['BracketLeft'] = function (event: KeyboardEvent, context: Context) {
    lower_layer(context);
}

keydownHandler['Equal'] = function (event: KeyboardEvent, context: Context) {
    uppper_layer(context, 1);
}

keydownHandler['Minus'] = function (event: KeyboardEvent, context: Context) {
    lower_layer(context, 1);
}
