import { WatchableObject, TextShape, TextShapeView, TableCellView, TableView, ShapeView, Cmd } from "@kcdesign/data"
import {
    DocSelectionOp as _DocSelectionOp,
    DocSelectionData,
    DocSelectionOpData,
} from "@/communication/modules/doc_selection_op"
import { Context } from "@/context"
import { Selection } from "@/context/selection";
import { throttle } from "@/utils/timing_util";

export class DocSelectionOp extends WatchableObject {
    private docSelectionOp?: _DocSelectionOp
    private startPromise?: Promise<boolean>
    private startResolve?: (value: boolean) => void
    private isClosed: boolean = false
    private context?: Context
    private isFirstStart: boolean = true // 首次启动成功后置为false

    private docSelectionOpUpdate: typeof this.update | undefined
    private selectionWatcherForOp = this._selectionWatcherForOp.bind(this)

    // 上一次变换后的文本选区数据
    private previousTextSelectionAfterTransform: {
        cursorStart: number,
        cursorEnd: number,
        cursorAtBefore: boolean,
    } = { cursorStart: -1, cursorEnd: -1, cursorAtBefore: false }

    private _selectionWatcherForOp(type: number) {
        if (!this.context) return;
        if (![Selection.CHANGE_PAGE, Selection.CHANGE_SHAPE, Selection.CHANGE_SHAPE_HOVER, Selection.CHANGE_TEXT].includes(type)) return;
        if (!this.docSelectionOpUpdate) this.docSelectionOpUpdate = throttle(this.update, 1000).bind(this);
        const selection = this.context.selection;
        const textselection = this.context.textSelection;
        if (type === Selection.CHANGE_TEXT
            && textselection.cursorStart === this.previousTextSelectionAfterTransform.cursorStart
            && textselection.cursorEnd === this.previousTextSelectionAfterTransform.cursorEnd
            && textselection.cursorAtBefore === this.previousTextSelectionAfterTransform.cursorAtBefore
        ) return;
        this.docSelectionOpUpdate({
            select_page_id: selection.selectedPage?.id ?? "",
            select_shape_id_list: selection.selectedShapes.map((shape) => shape.id),
            hover_shape_id: selection.hoveredShape?.id,
            cursor_start: textselection.cursorStart,
            cursor_end: textselection.cursorEnd,
            cursor_at_before: textselection.cursorAtBefore,
        }).catch(err => { })
    }

    public async start(getToken: getTokenFuncAsync, documentId: string, context: Context, options?: StartOptions): Promise<boolean> {
        if (this.docSelectionOp) return true;
        if (this.startPromise) return await this.startPromise;
        const docSelectionOp = _DocSelectionOp.Make(await getToken(), documentId)
        const startParams = [getToken, documentId, context]
        docSelectionOp.setOnClose(async () => {
            const diff_time = 1000 - (Date.now() - (Number.isInteger(options?.last_time) ? options!.last_time! : 0))
            if (diff_time > 0) await new Promise(resolve => setTimeout(resolve, diff_time));
            this.docSelectionOp = undefined
            this.startPromise = undefined
            if (!this.isClosed) await this.start.apply(this, [...startParams, { last_time: Date.now() }] as any); // eslint-disable-line prefer-spread
        });
        this.startPromise = new Promise<boolean>(resolve => this.startResolve = resolve)
        try {
            if (!await docSelectionOp.start()) {
                console.log("doc selection op start失败")
                this.startResolve!(false)
                return false
            }
        } catch (e) {
            console.log("doc selection op start失败", e)
            this.startResolve!(false)
            return false
        }
        this.docSelectionOp = docSelectionOp
        this.startResolve!(true)
        this.startPromise = undefined
        this.context = context
        if (this.isFirstStart) {
            context.selection.watch(this.selectionWatcherForOp)
        }
        this.isFirstStart = false
        return true
    }

    public async update(data: DocSelectionData, timeout?: number): Promise<boolean> {
        if (!this.docSelectionOp) return false;
        return await this.docSelectionOp.send(data, timeout !== undefined, timeout)
    }

    public addOnMessage(onMessage: (docCommentOpData: DocSelectionOpData) => void) {
        this.docSelectionOp?.addOnMessage(onMessage)
    }

    public removeOnMessage(onMessage: (docCommentOpData: DocSelectionOpData) => void) {
        this.docSelectionOp?.removeOnMessage(onMessage)
    }

    public close() {
        if (this.isClosed) return;
        this.isClosed = true
        if (!this.docSelectionOp) return;
        this.docSelectionOp.close()
        this.docSelectionOp = undefined
        this.startPromise = undefined
        this.context?.selection.unwatch(this.selectionWatcherForOp)
    }
}