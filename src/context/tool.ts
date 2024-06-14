import { ShapeType, ShapeView, WatchableObject } from "@kcdesign/data";
import { Context } from ".";
import { Comment } from "./comment";
import { v4 as uuid } from "uuid"
import { CursorType } from "@/utils/cursor2";

export enum Action {
    Auto = 'auto',
    AutoV = 'drag',
    AutoK = 'scale',
    AddRect = 'add-rect',
    AddLine = 'add-line',
    AddEllipse = 'add-ellipse',
    AddArrow = 'add-arrow',
    AddFrame = 'add-frame',
    AddText = 'add-text',
    AddComment = 'add-comment',
    AddImage = 'add-image',
    AddTable = 'table',
    AddContact = 'add-contact',
    AddCutout = 'add-cutout',
    Curve = 'curve',
    PathClip = 'path-clip',
    Pen = 'add-vector',
    Pen2 = 'vector',
    Pencil = 'add-free-path',
    Polygon = 'add-polygon',
    Star = 'add-star',
    Export = 'export',
}

const A2R = new Map([
    [Action.Auto, undefined],
    [Action.AddRect, ShapeType.Rectangle],
    [Action.AddEllipse, ShapeType.Oval],
    [Action.AddLine, ShapeType.Line],
    [Action.AddFrame, ShapeType.Artboard],
    [Action.AddText, ShapeType.Text],
    [Action.AddImage, ShapeType.Image],
    [Action.AddArrow, ShapeType.Line],
    [Action.AddTable, ShapeType.Table],
    [Action.AddContact, ShapeType.Contact],
    [Action.AddCutout, ShapeType.Cutout],
    [Action.Polygon, ShapeType.Polygon],
    [Action.Star, ShapeType.Star],
]);

export const ResultByAction = (action: Action): ShapeType | undefined => A2R.get(action); // 参数action状态下新增图形会得到的图形类型

export class Tool extends WatchableObject {
    static CHANGE_ACTION = 1;
    static GROUP = 2;
    static UNGROUP = 3;
    static COMPS = 4;
    static TITILE_VISIBLE = 5;
    static INSERT_FRAME = 6;
    static INSERT_TABLE = 7;
    static CHANGE_CONTACT_APEX = 8;
    static LABLE_CHANGE = 12;
    static NEW_FILE = 9;
    static COMPONENT = 10;
    static SELECT_IMAGE = 11;
    static CUTOUT_VISIBLE = 12;
    private m_current_action: Action = Action.AutoV;
    private m_context: Context;
    private m_show_title: boolean = true;
    private m_frame_size: { width: number, height: number } = { width: 100, height: 100 }; // 容器模版frame
    private m_frame_name: string = ''; // 容器模版名称
    private m_table_size: { row: number, col: number } = { row: 3, col: 3 };
    private m_contact_apex: ShapeView | undefined;
    private m_contact_from: boolean = false;
    private m_lable_status: boolean = false;
    private m_cutout_visible = true;

    constructor(context: Context) {
        super();
        this.m_context = context;
    }

    get action() {
        return this.m_current_action;
    }

    setAction(action: Action) {
        this.m_current_action = action;
        if (action.startsWith('add')) {
            this.m_context.menu.menuMount();

            this.m_context.esctask.save('tool-action', this.reset.bind(this));

            if (action === Action.AddComment) {
                if (this.m_context.workspace.documentPerm === 1) {
                    return;
                }

                this.m_context.comment.commentInput(false);
                this.m_context.comment.notify(Comment.SELECT_LIST_TAB);
                this.m_context.cursor.setType(CursorType.Auto, 0);
            } else if (action === Action.Pen) {
                this.m_context.cursor.setType(CursorType.Pen, 0);
            } else {
                this.m_context.cursor.setType(CursorType.Create, 0);
            }

        } else {
            this.m_context.cursor.reset();
        }

        this.notify(Tool.CHANGE_ACTION);
    }

    reset() {
        let exe_result: boolean = false;
        if (this.m_current_action.startsWith('add')) {
            exe_result = true;
        }
        this.m_current_action = Action.AutoV;
        this.m_context.cursor.reset();
        this.notify(Tool.CHANGE_ACTION);
        return exe_result;
    }

    get isShowTitle() {
        return this.m_show_title;
    }

    setTitleVisible(val: boolean) {
        this.m_show_title = val;
        this.notify(Tool.TITILE_VISIBLE);
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

    get isLable() {
        return this.m_lable_status;
    }

    setLableSwitch(v: boolean) {
        this.m_lable_status = v;
        this.notify(Tool.LABLE_CHANGE);
    }

    get uniqueID() {
        return uuid();
    }
}