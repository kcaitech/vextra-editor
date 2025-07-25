/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { ShapeType, ShapeView, WatchableObject } from "@kcaitech/vextra-core";
import { Context } from ".";
import { ReferLineSelection } from "@/components/Document/Rule/referLineSelection";
import { XY } from "@/context/selection";
import { ContextEvents } from "@/openapi";
import { AnchorType } from "@/components/Document/Attribute/Scale/index";

const _uuid = '-E9BB37D8-8853-D650-4EF1-ACCF4E2D4BE5'

export const Action = {
    Auto: 'auto' + _uuid,
    AutoV: 'drag' + _uuid,
    AutoK: 'scale' + _uuid,
    AddRect: 'add-rect' + _uuid,
    AddLine: 'add-line' + _uuid,
    AddEllipse: 'add-ellipse' + _uuid,
    AddArrow: 'add-arrow' + _uuid,
    AddFrame: 'add-frame' + _uuid,
    AddText: 'add-text' + _uuid,
    AddImage: 'add-image' + _uuid,
    AddTable: 'table' + _uuid,
    AddContact: 'add-contact' + _uuid,
    AddCutout: 'add-cutout' + _uuid,
    Curve: 'curve' + _uuid,
    PathClip: 'path-clip' + _uuid,
    Pen: 'add-vector' + _uuid,
    Pencil: 'add-free-path' + _uuid,
    Polygon: 'add-polygon' + _uuid,
    Star: 'add-star' + _uuid,
    Export: 'export' + _uuid,
}

const A2R = new Map([
    [Action.Auto, undefined],
    [Action.AddRect, ShapeType.Rectangle],
    [Action.AddEllipse, ShapeType.Oval],
    [Action.AddLine, ShapeType.Line],
    [Action.AddFrame, ShapeType.Artboard],
    [Action.AddText, ShapeType.Text],
    [Action.AddArrow, ShapeType.Line],
    [Action.AddTable, ShapeType.Table],
    [Action.AddContact, ShapeType.Contact],
    [Action.AddCutout, ShapeType.Cutout],
    [Action.Polygon, ShapeType.Polygon],
    [Action.Star, ShapeType.Star],
]);

export const ResultByAction = (action: string): ShapeType | undefined => A2R.get(action);

export interface Block {
    dataStart: number; // 刻度值
    dataEnd: number;

    offsetStart: number; // 客户端视图偏移值
    offsetEnd: number;

    hidden?: boolean; // 隐藏间距小的端点
}

export class Tool extends WatchableObject {
    static CHANGE_ACTION = 1;
    static GROUP = 2;
    static UNGROUP = 3;
    static COMPS = 4;
    static TITLE_VISIBLE = 5;
    static INSERT_FRAME = 6;
    static INSERT_TABLE = 7;
    static CHANGE_CONTACT_APEX = 8;
    static LABEL_CHANGE = 12;
    static NEW_FILE = 9;
    static COMPONENT = 10;
    static SELECT_IMAGE = 11;
    static BLOCKS_CHANGE = 12;
    static CUTOUT_VISIBLE = 13;
    static RULE_RENDER = 14;
    static RULE_RENDER_SIM = 15;
    static HOVER_REFER_CHANGE = 16;
    static REFER_FOCUS_CHANGE = 17;
    static RULE_CLEAR = 18;
    static SCALE_ANCHOR_CHANGE = 19;
    private m_current_action: string = Action.AutoV;
    private m_context: Context;
    private m_show_title: boolean = true;
    private m_frame_size: { width: number, height: number } = { width: 100, height: 100 }; // 容器模版frame
    private m_frame_name: string = ''; // 容器模版名称
    private m_table_size: { row: number, col: number } = { row: 3, col: 3 };
    private m_contact_apex: ShapeView | undefined;
    private m_contact_from: boolean = false;
    private m_label_status: boolean = false;
    private m_cutout_visible = true;

    constructor(context: Context) {
        super();
        this.m_context = context;
    }

    get action() {
        return this.m_current_action;
    }

    setAction(uuid: string) {
        this.m_current_action = uuid;
        this.notify(Tool.CHANGE_ACTION);
        this.m_context.notify(ContextEvents.action_change)
    }

    reset() {
        let exe_result: boolean = false;
        const action = this.m_current_action;
        if (action !== Action.AutoV && action !== Action.AutoK) {
            exe_result = true;
        }
        this.m_current_action = Action.AutoV;
        this.m_context.cursor.reset();
        this.notify(Tool.CHANGE_ACTION);
        this.m_context.notify(ContextEvents.action_change)
        return exe_result;
    }

    silent() {
        this.m_current_action = '';
        this.m_context.cursor.reset();
        this.notify(Tool.CHANGE_ACTION);
    }

    get isShowTitle() {
        return this.m_show_title;
    }

    setTitleVisible(val: boolean) {
        this.m_show_title = val;
        this.notify(Tool.TITLE_VISIBLE);
    }

    get isCutoutVisible() {
        return this.m_cutout_visible;
    }

    setCutoutVisible(v: boolean) {
        this.m_cutout_visible = v;
        this.notify(Tool.CUTOUT_VISIBLE);
    }

    get frameSize(): { size: { width: number, height: number }, name: string } {
        return { size: this.m_frame_size, name: this.m_frame_name };
    }

    setArtboardTemp(width: number, height: number, name: string) {
        this.m_frame_size = { width, height };
        this.m_frame_name = name;
        this.notify(Tool.INSERT_FRAME);
    }

    get tableSize() {
        return this.m_table_size;
    }

    insertTable(size: { row: number, col: number }) {
        this.m_table_size = size
        this.notify(Tool.INSERT_TABLE);
    }

    get contactApex() {
        return this.m_contact_apex;
    }

    setContactApex(shape: ShapeView) {
        if (shape.id !== this.m_contact_apex?.id) {
            this.m_contact_apex = shape;
            this.notify(Tool.CHANGE_CONTACT_APEX);
        }
    }

    resetContactApex() {
        const needNotify = !!this.m_contact_apex;
        this.m_contact_apex = undefined;
        if (needNotify) {
            this.notify(Tool.CHANGE_CONTACT_APEX);
        }
    }

    get contactFrom() {
        return this.m_contact_from;
    }

    setContactFrom(v: boolean) {
        this.m_contact_from = v;
    }

    get isLabel() {
        return this.m_label_status;
    }

    setLabelSwitch(v: boolean) {
        this.m_label_status = v;
        this.notify(Tool.LABEL_CHANGE);
    }

    private m_refer_selection: ReferLineSelection | undefined;

    setReferSelection(rs: ReferLineSelection | undefined) {
        this.m_refer_selection = rs;
    }

    get referSelection() {
        return this.m_refer_selection;
    }

    private m_refer_finer: ((xy: XY) => boolean) | undefined;

    setReferFiner(func: (xy: XY) => boolean) {
        this.m_refer_finer = func;
    }

    get referFinder() {
        return this.m_refer_finer
    }

    private m_scale_anchor: AnchorType = AnchorType.Center;

    setScaleAnchor(t: AnchorType) {
        this.m_scale_anchor = t;
        this.notify(Tool.SCALE_ANCHOR_CHANGE);
    }

    get scaleAnchor() {
        return this.m_scale_anchor;
    }
}