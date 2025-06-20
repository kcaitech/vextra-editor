/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { ShapeView } from "@kcdesign/data";
import { Context } from "@/context";
import { hidden_selection } from "@/utils/content";
import { ElementManager } from "@/components/common/elementmanager";

export type SheetCatch = {
    name: string;
    id: string;
    variables: any[];
}

export class StyleCtx {

    constructor(protected context: Context) {
    }

    get repo() {
        return this.context.repo;
    }

    get page() {
        return this.context.selection.selectedPage!;
    }

    get document() {
        return this.context.data;
    }

    private m_last_selected: ShapeView[] = [];
    /**
     * 选区内的选中图层：相当与context.selection.selectedShapes
     */
    get selected() {
        const __selected = this.context.selection.selectedShapes;
        if (__selected.length) this.m_last_selected = __selected.slice(0);
        return __selected.length ? __selected : this.m_last_selected;
    }

    private m_last_flat: ShapeView[] = [];
    /**
     * 选区内的选中图层的基础上，把编组打平。
     */
    get flat() {
        const __flat = this.context.selection.flat;
        if (__flat.length) this.m_last_flat = __flat.slice(0);
        return __flat.length ? __flat : this.m_last_flat;
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

    protected kill() {
        this.m_panel.forEach(i => i.close());
    }

    catchPanel(ele: ElementManager) {
        this.m_panel.add(ele);
    }

    modifyMaskName(sheet: string, maskID: string, name: string) {
        this.editor4Doc.modifyStyleName(sheet, maskID, name);
    }

    modifyMaskDesc(sheet: string, maskID: string, desc: string) {
        this.editor4Doc.modifyStyleDescription(sheet, maskID, desc);
    }
}