import { WatchableObject, Cmd, cmdClone, cmdTransform, OpType, setCmdServerIdAndOpsOrder, ArrayOpSelection, TextShape, TableShape, TableCell, TableIndex, TextShapeView, TableCellView, TableView, ShapeView } from "@kcdesign/data"
import { MyTextCmdSelection } from "@kcdesign/data"
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
    private textSelectionTransform = this._textSelectionTransform.bind(this)

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
            previous_cmd_id: this.context.communication.docOp.lastServerCmdId ?? this.context.data.lastCmdId,
        }).catch(err => { })
    }

    private _textSelectionTransform(cmd: Cmd) {
        if (!this.context) return;
        const _selection = this.context.selection;
        if (_selection.selectedShapes.length !== 1) return;
        const shape0: ShapeView = _selection.selectedShapes[0];

        if (!(shape0 instanceof TextShapeView) || !(shape0 instanceof TableCellView)) return;

        const selection = this.context.textSelection;
        if (selection.cursorStart === -1 || selection.cursorEnd === -1) return;
        if (cmd.serverId === undefined && !(cmd as any).isUndo) return;
        if (!this.docSelectionOpUpdate) this.docSelectionOpUpdate = throttle(this.update, 1000).bind(this);
        const originalCursorStart = selection.cursorStart
        const originalCursorEnd = selection.cursorEnd

        const shapeId = ((shape0 as ShapeView) instanceof TableCellView) ? ((() => {
            const table = (shape0 as ShapeView).parent as TableView;
            const index = table.indexOfCell(shape0);
            return [table.id, new TableIndex(index?.rowIdx ?? -1, index?.colIdx ?? -1)]
        })()) : [(shape0 as TextShape).id];

        const textSelectionCmd = MyTextCmdSelection.Make(
            _selection.selectedPage?.id ?? "",
            shapeId,
            selection.cursorStart,
            selection.cursorEnd - selection.cursorStart,
        )
        const originalCmd = cmdClone(cmd)
        setCmdServerIdAndOpsOrder(originalCmd, undefined, Number.MAX_VALUE - 1)
        setCmdServerIdAndOpsOrder(textSelectionCmd, undefined, Number.MAX_VALUE)
        cmdTransform(originalCmd, textSelectionCmd)
        const op = textSelectionCmd.ops?.[0]
        let cursorStart: number, cursorEnd: number
        if (op?.type !== OpType.ArraySelection) {
            cursorStart = cursorEnd = -1
        } else {
            const _op = op as ArrayOpSelection;
            cursorStart = _op.start
            cursorEnd = _op.start + _op.length
        }
        if (cursorStart === originalCursorStart && cursorEnd === originalCursorEnd) return;
        this.previousTextSelectionAfterTransform = { cursorStart: cursorStart, cursorEnd: cursorEnd, cursorAtBefore: selection.cursorAtBefore }
        if (cursorStart === cursorEnd) selection.setCursor(cursorStart, selection.cursorAtBefore, (shape0 as TextShape).text);
        else selection.selectText(cursorStart, cursorEnd, (shape0 as TextShape).text);
    }

    public async start(token: string, documentId: string, context: Context, options?: StartOptions): Promise<boolean> {
        if (this.docSelectionOp) return true;
        if (this.startPromise) return await this.startPromise;
        const docSelectionOp = _DocSelectionOp.Make(token, documentId)
        const startParams = [token, documentId, context]
        docSelectionOp.setOnClose(async () => {
            const diff_time = 1000 - (Date.now() - (Number.isInteger(options?.last_time) ? options!.last_time! : 0))
            if (diff_time > 0) await new Promise(resolve => setTimeout(resolve, diff_time));
            this.docSelectionOp = undefined
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
            context.communication.docOp.addOnLocalUpdateAsync(this.textSelectionTransform)
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
        // this.updateHandlerSet.clear()
        this.context?.selection.unwatch(this.selectionWatcherForOp)
        this.context?.communication.docOp.removeOnLocalUpdate(this.textSelectionTransform)
    }
}