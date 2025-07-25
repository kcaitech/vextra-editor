/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Matrix, PageView, PrototypeActions, Shape, ShapeType, ShapeView, Transform, WatchableObject } from "@kcaitech/vextra-core";
import { Context } from ".";
// import { router } from "@/router";
import { getFrameList } from "@/utils/preview";

export enum ScaleType {
    Actual = 'Actual',
    FitScreen = 'fit_screen',
    FitWidth = 'fit_width',
    FillScreen = 'fill_screen'
}

export class Preview extends WatchableObject {
    static MATRIX_SCALE = 3;
    static MENU_CHANGE = 4;
    static NAVI_VISIBLE = 5;
    static UI_CHANGE = 6;
    static MENU_VISIBLE = 7;
    static NEXT_PAGE = 8;
    static BEFORE_PAGE = 9;
    static NAVI_CHANGE = 10;
    static SCALE_CHANGE = 11;
    static ARTBOARD_SCROLL = 12;
    static MATRIX_CHANGE = 13;
    static INTERACTION_CHANGE = 14;
    static SWAP_REF_STAT = 15;
    static FLOW_CHANGE = 16;
    static SUPERNATANT_CLOSR = 17;
    static SYMBOL_REF_SWITCH = 18;

    private m_context: Context;
    private m_preview_window: Window | undefined;
    private m_doc_id: string = '';
    private m_scale: number = 1;
    private m_navi_visible: boolean = true;
    private m_menu_options: ScaleType | undefined = ScaleType.Actual;
    private m_visible_ui: boolean = true;
    private m_menu_visible: boolean = false;
    private m_proto_action: { id: string, action: PrototypeActions } | undefined;
    private m_atrboard_scroll_offset: { x: number, y: number } = { x: 0, y: 0 };
    private m_interaction_action: Set<PrototypeActions> = new Set();
    private m_supernatant_open: boolean = false;
    private m_swap_action: Set<PrototypeActions> = new Set();
    private m_navi_shape_list: ShapeView[] = [];
    private m_setTimeouts: Set<any> = new Set();
    private m_delaySetTimeouts: Map<string, any> = new Map();
    private m_arboard_inner_transform: Map<string, Transform | undefined> = new Map();
    private m_arboard_fixed_transform: Map<string, Transform | undefined> = new Map();
    private m_inner_scroll: ShapeView | undefined;
    private m_save_last_shape: ShapeView | undefined;
    private m_supernatant_shapes: ShapeView[] = [];

    constructor(context: Context) {
        super();
        this.m_context = context;
    }

    setPreviewWindow(window: Window | undefined) {
        this.m_preview_window = window;
    }

    get scale() {
        return this.m_scale;
    }

    setScale(scale: number) {
        this.m_scale = scale;
        this.notify(Preview.MATRIX_SCALE);
    }

    get previewWindow() {
        return this.m_preview_window;
    }

    setDocInfoId(id: string) {
        this.m_doc_id = id;
    }

    get pageIndex() {
        const page = this.m_context.selection.selectedPage;
        const index = this.m_context.data.pagesList.findIndex(item => item.id === page?.id);
        return index;
    }
    get shapeIndex() {
        const page = this.m_context.selection.selectedPage;
        const shape = this.m_context.selection.selectedShapes[0];
        return getFrameList(page!).findIndex(item => item.id === shape?.id);

    }

    isSelectedShape(shape: ShapeView | Shape | string) {
        const shapeId = typeof shape === 'string' ? shape : shape.id;
        return shapeId === this.m_context.selection.selectedShapes[0]?.id
    }

    setScaleMenu(type: ScaleType | undefined) {
        this.m_menu_options = type;
        this.notify(Preview.MENU_CHANGE);
    }

    get scaleType() {
        return this.m_menu_options;
    }

    showNavi(visible: boolean) {
        this.m_navi_visible = visible;
        this.notify(Preview.NAVI_VISIBLE);
    }

    get naviState() {
        return this.m_navi_visible;
    }

    showUiVisible(visible: boolean) {
        this.m_visible_ui = visible;
        this.notify(Preview.UI_CHANGE);
    }

    get uiState() {
        return this.m_visible_ui;
    }

    setMenuVisible(visible: boolean) {
        this.m_menu_visible = visible;
    }
    get menuVisible() {
        return this.m_menu_visible;
    }

    setFromShapeAction(info?: { id: string, action: PrototypeActions }) {
        this.m_proto_action = info;
    }

    get protoAction() {
        return this.m_proto_action;
    }

    setArtboardScroll(offset: { x: number, y: number }, action: PrototypeActions, innerScroll?: ShapeView) {
        this.m_atrboard_scroll_offset = offset;
        this.m_inner_scroll = innerScroll;
        this.notify(Preview.ARTBOARD_SCROLL, action);
    }

    get artboardScrollOffset() {
        return this.m_atrboard_scroll_offset;
    }

    get innerScroll() {
        return this.m_inner_scroll;
    }

    setInteractionAction(action?: PrototypeActions, back_id?: string) {
        if (action) {
            this.m_interaction_action.add(action);
        } else {
            this.m_interaction_action.clear();
        }
        this.notify(Preview.INTERACTION_CHANGE, back_id);
    }

    resetInteractionAction(action: PrototypeActions, back_id?: string) {
        this.m_interaction_action.clear();
        this.m_interaction_action.add(action);
        this.notify(Preview.INTERACTION_CHANGE, back_id);
    }

    get interactionAction() {
        return this.m_interaction_action;
    }

    deleteEndAction() {
        const actions = Array.from(this.m_interaction_action);
        const lastItem = actions.pop();
        this.m_interaction_action = new Set(actions);
        this.notify(Preview.SUPERNATANT_CLOSR, lastItem);
    }

    get endAction() {
        const actions = Array.from(this.m_interaction_action);
        return actions[actions.length - 1];
    }

    setSupernatantIsOpen(v: boolean) {
        this.m_supernatant_open = v;
    }

    get supernatantIsOpen() {
        return this.m_supernatant_open;
    }

    setSupernatantShapes(s?: ShapeView[]) {
        this.m_supernatant_shapes = s || [];
    }
    get supernatantShapes() {
        return this.m_supernatant_shapes;
    }

    setSwapAction(action?: PrototypeActions) {
        if (action) {
            this.m_swap_action.add(action);
        } else {
            this.m_swap_action.clear();
        }
    }

    deleteSwapEndAction() {
        const actions = Array.from(this.m_swap_action);
        actions.pop();
        this.m_swap_action = new Set(actions);
    }
    get swapEndAction() {
        const actions = Array.from(this.m_swap_action);
        return actions[actions.length - 1];
    }

    setNaviShapeList(list: ShapeView[]) {
        this.m_navi_shape_list = list;
        this.notify(Preview.FLOW_CHANGE);
    }

    get naviShapeList() {
        return this.m_navi_shape_list;
    }

    addSetTimeout(fn: any) {
        this.m_setTimeouts.add(fn);
    }

    clearSetTimeout() {
        this.m_setTimeouts.forEach(item => {
            clearTimeout(item);
            item = null;
        })
        this.m_setTimeouts.clear();
    }

    get delaySetTimeout() {
        return this.m_delaySetTimeouts;
    }

    addDelaySetTimeout(key: string, value: any) {
        this.m_delaySetTimeouts.set(key, value);
    }

    deleteDelaySetTimeout(key: string) {
        const timer = this.m_delaySetTimeouts.get(key);
        if (timer) {
            clearTimeout(timer);
            this.m_delaySetTimeouts.delete(key);
        }
    }

    clearDelaySetTimeout() {
        this.m_delaySetTimeouts.forEach((v, k) => {
            clearTimeout(v);
            this.m_delaySetTimeouts.delete(k);
        })
        this.m_delaySetTimeouts.clear();
    }

    setInnerTransform(key: string, value: Transform | undefined) {
        this.m_arboard_inner_transform.set(key, value);
    }

    get innerTransform() {
        return this.m_arboard_inner_transform;
    }

    setFixedTransform(key: string, value: Transform | undefined) {
        this.m_arboard_fixed_transform.set(key, value);
    }

    get fixedTransform() {
        return this.m_arboard_fixed_transform;
    }
    clearInnerTransform() {
        this.m_arboard_inner_transform.clear();
        this.m_arboard_fixed_transform.clear();
    }

    saveLastHoverShape(shape: ShapeView | undefined) {
        this.m_save_last_shape = shape;
    }

    get saveShape() {
        return this.m_save_last_shape;
    }
}