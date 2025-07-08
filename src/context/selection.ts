/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import {
    PageView,
    ShapeType,
    ShapeView,
    SymbolRefView,
    SymbolView,
    TableCellView,
    SymbolUnionShape,
    TableView,
    TextShapeView,
    WatchableObject,
    TableCellType,
    TidyUpAlign,
    Repo, FillType,
} from "@kcdesign/data";
import { Document } from "@kcdesign/data";
import { Shape } from "@kcdesign/data";
import {
    finder_layers,
    finder_contact,
    finder_container, finder2, finder_env_for_migrate,
} from "@/utils/scout";
import { Context } from ".";
import { TextSelectionLite } from "@/context/textselectionlite";
import { is_symbol_or_union } from "@/utils/symbol";
import { TableSelection } from "./tableselection";
import { v4 } from "uuid";
import { ISelection, SelectionEvents } from "@/openapi/selection";
import { skipUserSelectShapes } from "@/utils/content";
import { DocSelectionData } from "./user";
import { initDataModule } from "@/basic/initmodule";
import { EnvChainGenerator } from "@/mouse/envchain";
import { IScout } from "@/openapi";
import { getShapesForStyle } from "@/utils/style";

export interface XY {
    x: number,
    y: number
}

export interface ClientXYRaw { // 视口坐标系的xy
    x: number,
    y: number
}

export interface ClientXY { // 视口坐标系的xy，相对root
    x: number,
    y: number
}

export interface PageXY { // 页面坐标系的xy
    x: number,
    y: number
}

type TextShapeLike = TextShapeView | TableCellView;
export type TableArea = 'invalid' | 'body' | 'content' | 'hover';

export const enum SelectionTheme {
    Normal = '#1878F5',
    Symbol = '#7F58F9'
}

export interface ImageRefShape {
    name: string;
    id: string;
    pageId: string;
    pageName: string;
}

export class Selection extends WatchableObject implements Repo.ISave4Restore, ISelection {
    static CHANGE_PAGE = SelectionEvents.page_change;
    static CHANGE_SHAPE = SelectionEvents.shape_change;
    static CHANGE_SHAPE_HOVER = SelectionEvents.shape_hover_change;
    static CHANGE_RENAME = 4;
    static CHANGE_TEXT = SelectionEvents.text_change;
    static PAGE_RENAME = 6;
    static UPDATE_RENDER_ITEM = 7;
    static EXTEND = 14;
    static PLACEMENT_CHANGE = 15;
    static SELECTION_HIDDEN = 16;
    static SHOW_INTERVAL = 17;
    static PASSIVE_CONTOUR = 18;
    static CHANGE_USER_STATE = 19;
    static PREVIEW_HOVER_CHANGE = 20;
    static LAYOUT_DOTTED_LINE = 21;
    static LAYOUT_DOTTED_LINE_MOVE = 22;
    static UPDATE_LAYOUT_DOTTED_LINE = 23;
    static PRE_INSERT = 24;
    static NEED_TIDY_UP = 25;
    static CHANGE_TIDY_UP_SHAPE = 26;
    static HIDDEN_RESET = 27;

    private m_selectPage?: PageView;
    private m_selectShapes: ShapeView[] = [];
    private m_hoverShape?: ShapeView;
    private m_document: Document;
    private m_tableselection: TableSelection;
    private m_textselection: TextSelectionLite;
    private m_comment_page_id: string | undefined;
    private m_table_area: { id: TableArea, area: string }[] = [];
    private m_context: Context;
    private m_is_new_shape_selection: boolean = false;
    private m_shapes_set: Set<string> = new Set();
    private m_interval: boolean = false;

    private m_label_fixed_group: ShapeView[] = [];
    private m_label_living_group: ShapeView[] = [];
    private userSelectionList: DocSelectionData[] = [];
    private tidy_up: boolean = true;
    private tidy_up_dir: boolean = false; //false 水平， true垂直
    private tidy_up_align: TidyUpAlign = 'center';
    private m_tidyup_selectShapes: ShapeView[] = [];
    private m_hover_stroke: number = 14;
    private m_flat: ShapeView[] | undefined = undefined;

    chainGenerator: EnvChainGenerator;

    constructor(document: Document, context: Context) {
        super();
        this.m_document = document;
        this.m_context = context;
        this.m_textselection = new TextSelectionLite(this); // 文字选区
        this.m_tableselection = new TableSelection(context, () => {
            this.m_textselection.reset();
        });
        this.chainGenerator = new EnvChainGenerator();
    }

    get scout(): IScout {
        return this.m_context.toolbox.scout;
    }

    scoutMount(context: Context) {
        // this.m_scout = scout(context);
    }

    get commentPageId() {
        return this.m_comment_page_id;
    }

    get tableSelection() {
        return this.m_tableselection;
    }

    get textSelection() {
        return this.m_textselection;
    }

    get focusTextShape(): TextShapeView | TableCellView | undefined {
        const selected = this.selectedShapes;
        if (selected.length !== 1) {
            return;
        }
        const shape = selected[0];
        if (shape instanceof TextShapeView) {
            return shape;
        }
        if (shape instanceof TableView) {
            return this.tableSelection.editingCell;
        }
    }

    async selectPage(p: PageView | string | undefined) {
        if (typeof p === 'string') {
            const id = p;
            const ctx = this.m_context;
            const pagesMgr = ctx.data.pagesMgr;
            const cur_page = this.m_selectPage;
            if (cur_page && cur_page.id === id) return cur_page;
            const page = await pagesMgr.get(id);
            if (!page) return;
            await initDataModule();
            p = ctx.getPageDom(page).dom;
        }

        if (this.m_selectPage === p) {
            this.notify(Selection.CHANGE_PAGE);
            return p;
        }
        this.m_selectPage = p;
        this.m_selectShapes.length = 0;
        this.m_flat = undefined;
        this.notify(Selection.CHANGE_PAGE);

        return p;
    }

    async deletePage(id: string, index: number) {
        if (id === this.m_selectPage?.id) {
            index = index === this.m_document.pagesList.length ? index - 1 : index;
            await this.m_document.pagesMgr.get(this.m_document.pagesList[index].id).then(p => {
                this.selectPage(p ? this.m_context.getPageDom(p).dom : undefined);
            });
        }
    }

    reName(id?: string) {
        if (id) {
            this.notify(Selection.CHANGE_RENAME, id);
        } else {
            this.notify(Selection.CHANGE_RENAME, this.selectedPage?.id);
        }
    }

    rename() {
        this.notify(Selection.PAGE_RENAME);
    }

    get selectedPage(): PageView | undefined {
        return this.m_selectPage;
    }

    /**
     * 在page范围内获取一个点上的所有图层
     * @param position 点位置，坐标系时page
     * @returns 符合检索条件的图形
     */
    getLayers(position: PageXY): ShapeView[] {
        position = { x: position.x, y: position.y };
        const result: ShapeView[] = [];
        if (this.scout) {
            const page = this.m_selectPage;
            if (page && page.childs.length) {
                result.push(...finder_layers(this.scout, page.childs, position));
            }
        }
        return result;
    }

    getViews(offsetX: number, offsetY: number): ShapeView[] {
        const toRoot = this.m_context.workspace.matrix.inverseCoord(offsetX, offsetY);
        const result: ShapeView[] = [];
        if (this.scout) {
            const page = this.m_selectPage;
            if (page && page.childs.length) {
                result.push(...finder_layers(this.scout, page.childs, toRoot));
            }
        }
        return result;
    }

    /**
     * @description 基于SVGGeometryElement的图形检索，与getLayers相比，getShapesByXY返回的结果长度最多为1，而这里可以大于1
     * @param position 点位置，坐标系时page
     * @param isCtrl 是否取消编组、容器等图形的特殊处理
     * @param scope 在scope范围内进行检索，如果没有限定范围则在全域(page)下寻找
     * @returns 符合检索条件的图形
     */
    getShapesByXY(position: PageXY, isCtrl: boolean, scope?: ShapeView[]): ShapeView | undefined {
        let shape: ShapeView | undefined;
        const page = this.m_selectPage!;
        const childs: ShapeView[] = scope || page.childs;
        shape = finder2(this.m_context, this.scout, childs, position, isCtrl)
        return shape;
    }

    getContactByXY(position: PageXY, scope?: ShapeView[]): ShapeView[] {
        const shapes: ShapeView[] = [];
        if (this.scout) {
            const page = this.m_selectPage!;
            const childs: ShapeView[] = scope || page.childs;
            shapes.push(...finder_contact(this.scout, childs, position, this.selectedShapes[0]));
        }
        return shapes;
    }

    setShapesSet(shapes: ShapeView[]) {
        this.m_shapes_set.clear();
        for (let i = 0, l = shapes.length; i < l; i++) {
            this.m_shapes_set.add(shapes[i].id); // data 和 view的id是否一致
        }
    }

    /**
     * @description 获取点上最近的可插入图形
     * @param position
     * @param except
     * @param scope
     */
    getClosestContainer(position: PageXY, except?: Map<string, ShapeView>, scope?: ShapeView[]): ShapeView {
        const range: ShapeView[] = scope || this.selectedPage?.childs || [];
        return finder_container(this.scout!, range, position, except) || this.selectedPage!;
    }

    getEnvForMigrate(position: PageXY, scope?: ShapeView[]): ShapeView {
        const range: ShapeView[] = scope || this.selectedPage?.childs || [];
        return finder_env_for_migrate(this.scout!, range, position, this.m_shapes_set) || this.selectedPage!;
    }

    selectShape(shape?: ShapeView) {
        if (!shape) {
            this.resetSelectShapes();
        } else {
            this.m_selectShapes.length = 0;
            this.m_flat = undefined;
            this.m_selectShapes.push(shape);
            this.m_hoverShape = undefined;
            this.notify(Selection.CHANGE_SHAPE);
            this.chainGenerator.gen(this.m_selectShapes);
        }
    }

    unSelectShape(shape: ShapeView) {
        const index = this.m_selectShapes.findIndex((s: ShapeView) => s.id === shape.id);
        if (index > -1) {
            this.m_selectShapes.splice(index, 1);
            this.notify(Selection.CHANGE_SHAPE);
            this.chainGenerator.gen(this.m_selectShapes);
        }
    }

    rangeSelectShape(shapes: ShapeView[]) {
        this.m_selectShapes.length = 0;
        this.m_flat = undefined;
        this.m_selectShapes.push(...shapes);
        this.m_hoverShape = undefined;
        this.notify(Selection.CHANGE_SHAPE);
        this.chainGenerator.gen(this.m_selectShapes);
    }

    resetSelectShapes() {
        if (this.m_textselection.cursorStart > -1) {
            this.m_textselection.reset();
        }
        if (this.m_tableselection.editingCell || this.m_tableselection.tableColStart > -1) {
            this.m_tableselection.resetSelection();
        }
        if (this.m_selectShapes.length > 0) {
            this.m_selectShapes.length = 0;
            this.m_flat = undefined;
            this.m_hoverShape = undefined;
            this.notify(Selection.CHANGE_SHAPE_HOVER);
            this.notify(Selection.CHANGE_SHAPE);
            this.chainGenerator.gen(this.m_selectShapes);
        }
    }

    isSelectedShape(shape: ShapeView | Shape | string) {
        const shapeId = typeof shape === 'string' ? shape : shape.id;
        const ret = this.m_selectShapes.find(value => shapeId == value.id);
        return ret !== undefined;
    }

    get selectedShapes(): ShapeView[] {
        return this.m_selectShapes;
    }

    get hoveredShape() {
        return this.m_hoverShape;
    }

    hoverShape(shape: ShapeView) {
        if (shape.id !== this.hoveredShape?.id) {
            this.m_hoverShape = shape;
            this.notify(Selection.CHANGE_SHAPE_HOVER);
        }
    }

    unHoverShape() {
        const needNotify = this.m_hoverShape;
        this.m_hoverShape = undefined;
        if (needNotify) {
            this.notify(Selection.CHANGE_SHAPE_HOVER);
        }
    }

    replaceSelectShape(shape: ShapeView) {
        this.m_selectShapes.length = 0;
        this.m_flat = undefined;
        this.m_selectShapes.push(shape);
    }

    getShapeById(id: string): ShapeView | undefined {
        const page = this.m_selectPage;
        let shape: ShapeView | undefined;
        if (page) {
            shape = page.shapes.get(id);
        }
        return shape;
    }

    getArea(p: ClientXY): TableArea {
        let area: TableArea = 'invalid';
        if (this.hoveredShape) {
            let m = this.hoveredShape.matrix2Root(), wm = this.m_context.workspace.matrix;
            m.multiAtLeft(wm);
            let path = this.hoveredShape.getPath().clone();
            path.transform(m);
            if (this.scout.isPointInPath(path.toString(), p)) return 'hover';
        }
        for (let i = 0, len = this.m_table_area.length; i < len; i++) {
            const a = this.m_table_area[i];
            if (this.scout.isPointInPath(a.area, p)) {
                area = a.id;
                return area;
            }
        }
        return area;
    }

    setArea(table_area: { id: TableArea, area: string }[]) {
        this.m_table_area = table_area;
    }

    /** @deprecated */
    getTextSelection(shape: TextShapeLike) {
        return this.textSelection;
    }

    save(): Repo.SelectionState {
        const state: Repo.SelectionState = {
            shapes: []
        }
        if (this.selectedShapes.length > 0) {
            state.shapes = this.selectedShapes.map(s => s.id);
        }
        // table
        const tableView = this.tableshape;
        if (tableView) {
            const table = tableView.data;
            const rowStart = this.tableSelection.tableRowStart;
            const rowEnd = this.tableSelection.tableRowEnd;
            const colStart = this.tableSelection.tableColStart;
            const colEnd = this.tableSelection.tableColEnd;
            if (!(rowStart < 0 && rowEnd < 0 && colStart < 0 && colEnd < 0)) {
                state.table = { isRowOrCol: false, rows: [], cols: [] }
                const rowCount = table.rowHeights.length;
                const colCount = table.colWidths.length;
                if (rowStart === 0 && rowEnd === rowCount - 1) {
                    // 选中列
                    state.table.isRowOrCol = true;
                    if (colStart < 0 /*|| colEnd >= colCount 可能的, 比如删除最后一列时*/) throw new Error();
                    for (let i = colStart; i <= colEnd && i < colCount; ++i) {
                        state.table.cols.push(table.colWidths[i].id);
                    }
                } else if (colStart === 0 && colEnd === colCount - 1) {
                    // 选中行
                    state.table.isRowOrCol = true;
                    if (rowStart < 0 /*|| rowEnd >= rowCount*/) throw new Error();
                    for (let i = rowStart; i <= rowEnd && i < rowCount; ++i) {
                        state.table.rows.push(table.rowHeights[i].id);
                    }
                } else {
                    if (colStart < 0 /*|| colEnd >= colCount*/) throw new Error();
                    if (rowStart < 0 /*|| rowEnd >= rowCount*/) throw new Error();
                    for (let i = colStart; i <= colEnd && i < colCount; ++i) {
                        state.table.cols.push(table.colWidths[i].id);
                    }
                    for (let i = rowStart; i <= rowEnd && i < rowCount; ++i) {
                        state.table.rows.push(table.rowHeights[i].id);
                    }
                }
            }
        }
        // text
        const textShape = this.textSelection.shape;
        if (this.textSelection.cursorStart >= 0 && this.textSelection.cursorEnd >= 0 && textShape) {
            state.text = new Repo.ArrayOpSelection(v4(), textShape.text.getCrdtPath(),
                Number.MAX_SAFE_INTEGER, this.textSelection.cursorStart,
                this.textSelection.cursorEnd - this.textSelection.cursorStart)
        }
        return state;
    }

    saveText(path: string[]): Repo.ArrayOpSelection | undefined {
        const shape = this.focusTextShape;
        if (!shape) return;
        const text = shape.text;
        if (!text) return;
        const curPath = text.getCrdtPath();
        if (path.length !== curPath.length) return;
        if (Repo.isDiffStringArr(path, curPath)) return;
        if (this.textSelection.cursorStart >= 0 && this.textSelection.cursorEnd >= 0) {
            return new Repo.ArrayOpSelection(v4(), path,
                Number.MAX_SAFE_INTEGER, this.textSelection.cursorStart,
                this.textSelection.cursorEnd - this.textSelection.cursorStart)
        }
    }

    restoreText(op: Repo.ArrayOpSelection): void {
        const path = op.path;
        const shape = this.focusTextShape;
        if (!shape) return;
        const text = shape.text;
        if (!text) return;
        const curPath = text.getCrdtPath();
        if (path.length !== curPath.length) return;
        if (Repo.isDiffStringArr(path, curPath)) return;
        if ((this.textSelection.cursorStart !== op.start || this.textSelection.cursorEnd !== (op.start + op.length))) {
            if (op.length === 0) this.textSelection.setCursor(op.start, false);
            else this.textSelection.selectText(op.start, op.start + op.length);
        }
    }

    restore(state: Repo.SelectionState): void {
        if (!this.selectedPage) return;
        const shapes = state.shapes.map(id => this.selectedPage?.getShape(id) as ShapeView);
        if (shapes.findIndex((s) => s === undefined) >= 0) {
            this.m_context.nextTick(this.selectedPage, () => {
                const shapes = state.shapes.map(id => this.selectedPage?.getShape(id) as ShapeView).filter(s => s !== undefined);
                this.rangeSelectShape(shapes);
            })
        } else if (Repo.isDiffStringArr(state.shapes, this.selectedShapes.map(s => s.id))) {
            this.rangeSelectShape(shapes);
        }
        // table
        let tableView: TableView | undefined;
        if (state.table && (tableView = this.tableshape)) {
            const table = tableView.data;
            const colCount = table.colWidths.length;
            const rowCount = table.rowHeights.length;
            let colsIdxs, rowsIdxs;
            if (!state.table.isRowOrCol) {
                colsIdxs = state.table.cols.map((id) => table!.colWidths.findIndex((v) => v.id === id)).filter((v) => v >= 0);
                rowsIdxs = state.table.rows.map((id) => table!.rowHeights.findIndex((v) => v.id === id)).filter((v) => v >= 0);
            } else if (state.table.cols.length === 0) {
                if (state.table.rows.length === 0) throw new Error();
                // 选中行
                rowsIdxs = state.table.rows.map((id) => table!.rowHeights.findIndex((v) => v.id === id)).filter((v) => v >= 0);
                colsIdxs = [0, colCount - 1];
            } else {
                if (state.table.rows.length !== 0) throw new Error();
                if (state.table.cols.length === 0) throw new Error();
                // 选中列
                colsIdxs = state.table.cols.map((id) => table!.colWidths.findIndex((v) => v.id === id)).filter((v) => v >= 0);
                rowsIdxs = [0, rowCount - 1];
            }
            const _colStart = colsIdxs.length === 0 ? -1 : colsIdxs.reduce((m, c) => (c < m) ? c : m, colCount - 1);
            const _colEnd = colsIdxs.length === 0 ? -1 : colsIdxs.reduce((m, c) => (c < m) ? m : c, 0);
            const _rowStart = rowsIdxs.length === 0 ? -1 : rowsIdxs.reduce((m, c) => (c < m) ? c : m, rowCount - 1);
            const _rowEnd = rowsIdxs.length === 0 ? -1 : rowsIdxs.reduce((m, c) => (c < m) ? m : c, 0);

            // check
            if (_colStart < 0 || _colEnd < 0 || _rowStart < 0 || _rowEnd < 0) {
                const rowStart = this.tableSelection.tableRowStart;
                const rowEnd = this.tableSelection.tableRowEnd;
                const colStart = this.tableSelection.tableColStart;
                const colEnd = this.tableSelection.tableColEnd;
                if (rowStart !== -1 || rowEnd !== -1 || colStart !== -1 || colEnd !== -1) this.tableSelection.resetSelection();
            } else {
                this.tableSelection.selectTableCellRange(_rowStart, _rowEnd, _colStart, _colEnd);
            }
        }
        if (state.text && (this.textSelection.cursorStart !== state.text.start || this.textSelection.cursorEnd !== (state.text.start + state.text.length))) {
            if (state.text.length === 0) this.textSelection.setCursor(state.text.start, false);
            else this.textSelection.selectText(state.text.start, state.text.start + state.text.length);
        }
    }

    get isNewShapeSelection() {
        return this.m_is_new_shape_selection;
    }

    setSelectionNewShapeStatus(v: boolean) {
        this.m_is_new_shape_selection = v;
    }

    get textshape() {
        if (this.selectedShapes.length !== 1) {
            return;
        }
        const _textshape = this.selectedShapes[0] instanceof TextShapeView ? (this.selectedShapes[0]) : undefined;

        if (_textshape) {
            return _textshape;
        }

        return (() => {
            if (!(this.selectedShapes[0] instanceof TableView)) {
                return
            }
            const tableSelection = this.m_context.tableSelection;
            if (tableSelection.editingCell && tableSelection.editingCell && tableSelection.editingCell.cellType === TableCellType.Text) {
                return tableSelection.editingCell;
            }
        })();
    }

    get pathshape() {
        const selected = this.selectedShapes;
        if (selected.length === 1 && selected[0].pathType) {
            return (this.selectedShapes[0]) as ShapeView;
        }
    }

    get symbolshape() {
        return this.selectedShapes.length === 1 && is_symbol_or_union(this.selectedShapes[0]) ? (this.selectedShapes[0]) as SymbolView : undefined;
    }

    get symbolview() {
        return this.selectedShapes.length === 1 && is_symbol_or_union(this.selectedShapes[0]) ? (this.selectedShapes[0]) as SymbolView : undefined;
    }

    get symbolstate() {
        if (this.selectedShapes.length === 1) {
            const s = this.selectedShapes[0];
            const p = s.parent;
            if (!p || !(p.data instanceof SymbolUnionShape)) {
                return;
            }
            return (s) as SymbolView;
        }
    }

    get symbolrefshape() {
        if (this.selectedShapes.length === 1) {
            const s = this.selectedShapes[0];
            if (s.type === ShapeType.SymbolRef) {
                return (s) as SymbolRefView;
            }
        }
    }

    get symbolrefview() {
        if (this.selectedShapes.length === 1) {
            const s = this.selectedShapes[0];
            if (s.type === ShapeType.SymbolRef) {
                return s as SymbolRefView;
            }
        }
    }

    get tableshape() {
        if (this.selectedShapes.length === 1) {
            const s = this.selectedShapes[0];
            if (s instanceof TableView) {
                return s;
            }
        }
    }

    get is_interval() {
        return this.m_interval;
    }

    setShowInterval(v: boolean) {
        this.m_interval = v;
        this.notify(Selection.SHOW_INTERVAL);
    }

    get labelFixedGroup() {
        return this.m_label_fixed_group.length ? this.m_label_fixed_group : undefined;
    }

    setLabelFixedGroup(shapes: ShapeView[]) {
        this.m_label_fixed_group = shapes;
    }

    get labelLivingGroup() {
        return this.m_label_living_group.length ? this.m_label_living_group : undefined;
    }

    setLabelLivingGroup(shapes: ShapeView[]) {
        this.m_label_living_group = shapes;
    }

    get hoverStroke() {
        return this.m_hover_stroke;
    }

    setHoverStroke(val: number) {
        this.m_hover_stroke = val;
    }

    locateShape(shapes: ShapeView[]) {
        skipUserSelectShapes(this.m_context, shapes);
    }

    get getUserSelection() {
        return this.userSelectionList;
    }

    userSelectionData(data: DocSelectionData[]) {
        this.userSelectionList = data;
        this.notify(Selection.CHANGE_USER_STATE);
    }

    previewHoverShape(shape: ShapeView) {
        this.m_hoverShape = shape;
        this.notify(Selection.PREVIEW_HOVER_CHANGE);
    }

    whetherTidyUp(v: boolean, dir: boolean, align: TidyUpAlign) {
        this.tidy_up = v;
        this.tidy_up_dir = dir;
        this.tidy_up_align = align;
        this.notify(Selection.NEED_TIDY_UP);
    }

    get isTidyUp() {
        return this.tidy_up;
    }

    get isTidyUpDir() {
        return this.tidy_up_dir;
    }

    get tidyUpAlign() {
        return this.tidy_up_align;
    }

    selectTidyUpShape(shapes?: ShapeView[]) {
        if (!shapes) {
            this.m_tidyup_selectShapes.length = 0;
        } else {
            this.m_tidyup_selectShapes.length = 0;
            this.m_tidyup_selectShapes.push(...shapes);
        }
        this.notify(Selection.CHANGE_TIDY_UP_SHAPE);
    }

    get selectedTidyUpShapes(): ShapeView[] {
        return this.m_tidyup_selectShapes;
    }

    zoomIn: boolean = false;

    get flat() {
        return this.m_flat ?? (this.m_flat = getShapesForStyle(this.m_selectShapes));
    }

    getShapesUsingImage(imageRef: string): ImageRefShape[] {
        const pages = this.m_document.pagesMgr.resource;
        const pagesList = this.m_document.pagesList;
        const ret: Array<{ name: string; id: string; pageId: string; pageName: string }> = [];
        for (const page of pages) {
            const pageName = pagesList.find(p => p.id === page.id)?.name ?? page.name;
            const shapes = page.childs;
            for (const shape of shapes) {
                const fills = shape.style.fills;
                if (fills.length === 0) continue;
                for (const fill of fills) {
                    if (fill.fillType !== FillType.Pattern) continue;
                    if (fill.imageRef === imageRef) {
                        ret.push({ name: shape.name, id: shape.id, pageId: page.id, pageName: pageName });
                    }
                }
            }
        }
        return ret;
    }
    getSelectionLink(): string {
        const selectedShape = this.selectedShapes[0];
        if (!selectedShape) throw new Error('Wrong selection');
        return `${window.location.href}/${this.selectedPage!.id}/${selectedShape.id}`;
    }
}
