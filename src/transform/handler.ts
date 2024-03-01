import { Context } from "@/context";
import { WorkSpace } from "@/context/workspace";
import { AsyncApiCaller, PageView, ShapeView } from "@kcdesign/data";

export class TransformHandler {
    context: Context;
    workspace: WorkSpace;

    shapes: ShapeView[];
    page: PageView;

    shiftStatus: boolean;
    altStatus: boolean;
    alignPixel: boolean;

    asyncApiCaller: AsyncApiCaller | undefined;

    constructor(context: Context, shapes: ShapeView[], event: MouseEvent) {
        this.context = context;
        this.workspace = context.workspace;
        this.shapes = shapes;
        this.page = context.selection.selectedPage!;

        this.shiftStatus = event.shiftKey;
        this.altStatus = event.altKey;
        this.alignPixel = context.user.isPixelAlignMent;

        this.beforeTransform();
    }

    beforeTransform() {
        this.context.menu.menuMount(); // 关闭已打开的弹窗

        this.context.cursor.cursor_freeze(true); // 禁用光标自动变换

        this.workspace.setCtrl('controller'); // 将编辑器控制权交给控件
    }

    modifyShiftStatus(v: boolean) {
        this.shiftStatus = v;
        this.passiveExcute();
    }

    modifyAltStatus(v: boolean) {
        this.altStatus = v;
        this.passiveExcute();
    }

    passiveExcute() { }

    abort() { }

    protected __fulfil() {
        this.asyncApiCaller?.commit();

        this.context.assist.reset();

        this.workspace.setCtrl('page');

        this.context.cursor.cursor_freeze(false);
    }

    fulfil() {
        this.__fulfil();
        return undefined;
    }
}