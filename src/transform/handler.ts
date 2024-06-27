import { Context } from "@/context";
import { WorkSpace } from "@/context/workspace";
import { AsyncApiCaller, PageView } from "@kcdesign/data";
import { Tool } from "@/context/tool";

export type FrameLike = {
    x: number;
    y: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
};

export class TransformHandler {
    context: Context;
    workspace: WorkSpace;

    page: PageView;

    shiftStatus: boolean = false;
    altStatus: boolean = false;
    alignPixel: boolean;

    asyncApiCaller: AsyncApiCaller | undefined;

    constructor(context: Context, event?: MouseEvent) {
        this.context = context;
        this.workspace = context.workspace;
        this.page = context.selection.selectedPage!;

        if (event) {
            this.shiftStatus = event.shiftKey;
            this.altStatus = event.altKey;
        }

        this.alignPixel = context.user.isPixelAlignMent;

        this.beforeTransform();

        document.addEventListener('keydown', this.__keydown);
        document.addEventListener('keyup', this.__keyup);
    }

    protected beforeTransform() {
        this.context.menu.menuMount(); // 关闭已打开的弹窗

        this.context.cursor.cursor_freeze(true); // 禁用光标自动变换

        this.workspace.setCtrl('controller'); // 将编辑器控制权交给控件
    }

    protected keydown(event: KeyboardEvent) {
    }

    protected keyup(event: KeyboardEvent) {
    }

    private __keydown = this.keydown.bind(this);
    private __keyup = this.keyup.bind(this);


    fulfil() {
        const context = this.context;

        this.asyncApiCaller?.commit();
        context.assist.reset();
        this.workspace.setCtrl('page');
        context.cursor.cursor_freeze(false);

        document.removeEventListener('keydown', this.__keydown);
        document.removeEventListener('keyup', this.__keyup);
    }

    updateCtrlView(rule: number) {
        this.context.nextTick(this.context.selection.selectedPage!, () => {

            this.workspace.notify(WorkSpace.SELECTION_VIEW_UPDATE);
            if (rule) {
                this.context.tool.notify(Tool.RULE_RENDER);
            }
        })
    }
}