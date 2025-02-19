import { CoopRepository, ShapeView, Document } from "@kcdesign/data";
import { Context } from "@/context";
import { hidden_selection } from "@/utils/content";
import { ElementManager } from "@/components/common/elementmanager";
import { getShapesForStyle } from "@/utils/style";

export type SheetCatch = {
    name: string;
    id: string;
    variables: any[];
}

export class StyleCtx {
    private m_shapes: ShapeView[];
    private m_selected: ShapeView[];

    constructor(protected context: Context) {
        this.m_shapes = [];
        this.m_selected = [];
    }

    get repo() {
        return this.context.coopRepo;
    }

    get page() {
        return this.context.selection.selectedPage!;
    }

    get document() {
        return this.context.data;
    }

    protected getSelected() {
        this.shapes = this.context.selection.selectedShapes;
        this.selected = this.context.selection.flat;
    }

    /**
     * 选区内的选中图层：相当与context.selection.selectedShapes
     */
    get shapes() {
        return this.m_shapes;
    }

    set shapes(ss) {
        this.m_shapes = ss;
    }

    /**
     * 选区内的选中图层的基础上，把编组打平。
     */
    get selected() {
        return this.m_selected;
    }

    set selected(ss) {
        this.m_selected = ss;
    }


    protected get editor(): any { /* any要趋近与Modifier */
        return this.context.editor4Page(this.context.selection.selectedPage!);
    }

    protected get editor4Doc() {
        return this.context.editor4Doc();
    }

    protected hiddenCtrl(event?: Event) {
        hidden_selection(this.context);

        if (event?.target instanceof HTMLInputElement) event.target.blur();
    }

    private m_panel: Set<ElementManager> = new Set();
    private m_panel_map: Map<string, ElementManager> = new Map();

    protected kill() {
        this.m_panel.forEach(i => i.close());
    }

    catchPanel(ele: ElementManager) {
        this.m_panel.add(ele);
    }

    keepUniquePanel(type: string, ele: ElementManager) {
        const exist = this.m_panel_map.get(type);
        if (exist && exist !== ele) exist.close();
        this.m_panel_map.set(type, ele);
    }

    modifyMaskName(sheet: string, maskID: string, name: string) {
        this.editor4Doc.modifyStyleName(sheet, maskID, name);
    }

    modifyMaskDesc(sheet: string, maskID: string, desc: string) {
        this.editor4Doc.modifyStyleDescription(sheet, maskID, desc);
    }
}