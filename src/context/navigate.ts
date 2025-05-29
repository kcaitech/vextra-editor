/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import {Shape, ShapeView, WatchableObject} from "@kcdesign/data";

interface TextSelection {
    shape: ShapeView
    slice: [number, number][]
}

export class Navi extends WatchableObject {
    static SEARCH = 1;
    static SEARCH_FINISHED = 2;
    static SEARCH_PRE = 3;
    static SEARCHING = 4;
    static CHANGE_TYPE = 6;
    static TEXT_SELECTION_CHANGE = 7;
    static SHAPELIST_UPDATE = 8;
    static ADD_PAGE = 9;
    static MODULE_CHANGE = 10;
    static ITEM_DRAG = 11;
    static TO_SEARCH = 12;
    static COMP_LIST_CHANGED = 13;
    static LIST_FOLD = 14;
    static RENAME = 15;
    private m_page_need_extend: boolean = false;
    private m_focus_text: TextSelection | undefined;
    private m_keywords: string = '';
    private m_shapelist_freeze: boolean = false;
    private m_accurate: boolean = false;
    private m_phase1: string = '';
    private m_cur_module: "Shape" | "Comps" | "Resource" | "Comment" = 'Shape';
    private m_item_dragging: boolean = false;

    constructor() {
        super();
    }

    get is_item_dragging() {
        return this.m_item_dragging;
    }

    set_dragging_status(v: boolean) {
        this.m_item_dragging = v;
    }

    get needExtend() {
        return this.m_page_need_extend;
    }

    set_phase(id: string) {
        this.m_phase1 = id;
    }

    isPhase2(shape: ShapeView) {
        return Boolean(shape.id === this.m_phase1);
    }

    set_page_need_extend(v: boolean) {
        this.m_page_need_extend = v;
    }

    get focusText() {
        return this.m_focus_text;
    }

    set_focus_text(v?: TextSelection) {
        this.m_focus_text = v;
        this.notify(Navi.TEXT_SELECTION_CHANGE);
    }

    get is_shapelist_freeze() {
        return this.m_shapelist_freeze;
    }

    set_sl_freeze(v?: boolean) {
        this.m_shapelist_freeze = v || false;
    }

    get keywords() {
        return this.m_keywords;
    }

    set_keywords(v?: string) {
        this.m_keywords = v || '';
    }

    get accurate() {
        return this.m_accurate;
    }

    setMode(isAcc: boolean) {
        this.m_accurate = isAcc;
    }

    get current_navi_module() {
        return this.m_cur_module;
    }

    set_current_navi_module(v: "Shape" | "Comps" | "Resource" | "Comment") {
        if(v == this.m_cur_module) return;
        this.m_cur_module = v;
        this.notify(Navi.MODULE_CHANGE);
    }
}