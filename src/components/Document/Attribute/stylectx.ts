import { ShapeView } from "@kcdesign/data";
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
    private m_selected: ShapeView[];

    constructor(protected context: Context) {
        this.m_selected = [];
    }

    get page() {
        return this.context.selection.selectedPage!;
    }

    get selected() {
        return this.m_selected;
    }

    set selected(ss) {
        this.m_selected = ss;
    }

    protected getSelected() {
        this.selected = getShapesForStyle(this.context.selection.selectedShapes);
    }

    protected get editor() {
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
}