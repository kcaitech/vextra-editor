import {
    CoopRepository,
    TaskMgr,
    WatchableObject,
    TableShape,
    TableEditor,
    Text,
    PageView,
    ShapeView,
    adapt2Shape,
    TableView,
    TextShapeView,
    TableCellView,
} from "@kcdesign/data";
import { Document } from "@kcdesign/data";
import { Page } from "@kcdesign/data";
import { Shape } from "@kcdesign/data";
import { DocEditor, Editor, PageEditor } from "@kcdesign/data";
import { ShapeEditor, TextShapeEditor } from "@kcdesign/data";
import { Selection } from "./selection";
import { WorkSpace } from "./workspace";
import { Comment } from "./comment";
import { Menu } from "./menu";
import { Tool } from "./tool";
import { Navi } from "./navigate";
import { Communication } from "@/context/communication/communication";
import { Cursor } from "./cursor";
import { EscStack } from "./escstack";
import { Asssit } from "./assist";
import { TeamWork } from "./teamwork";
import { Component } from "./component";
import { Path } from "./path";
import { PageDom } from "@/components/Document/Content/vdom/page";
import { initComsMap } from "@/components/Document/Content/vdom/comsmap";
import { Arrange } from "./arrange";
import { PdMedia } from "./medias";
import { User } from './user';

import { DomCtx } from "@/components/Document/Content/vdom/domctx";
import { startLoadTask } from "./loadtask";

// 仅暴露必要的方法
export class RepoWraper {
    private m_repo: CoopRepository;

    constructor(repo: CoopRepository) {
        this.m_repo = repo;
    }

    canRedo(): boolean {
        return this.m_repo.canRedo();
    }

    canUndo(): boolean {
        return this.m_repo.canUndo();
    }

    undo() {
        this.m_repo.undo();
    }

    redo() {
        this.m_repo.redo();
    }

    watch(f: Function) {
        // todo
        throw new Error("Not implemented")
    }

    unwatch(f: Function) {
        throw new Error("Not implemented")
    }

    // onCommit(...args: Parameters<typeof this.m_repo.onCommit>): ReturnType<typeof this.m_repo.onCommit> {
    //     return this.m_repo.onCommit(...args)
    // }

    // onUndoRedo(...args: Parameters<typeof this.m_repo.onUndoRedo>): ReturnType<typeof this.m_repo.onUndoRedo> {
    //     return this.m_repo.onUndoRedo(...args)
    // }
}

export class Context extends WatchableObject {
    private m_data: Document;
    private m_editor: Editor;
    private m_repo: RepoWraper;
    private m_coopRepo: CoopRepository;
    private m_taskMgr: TaskMgr;
    private m_textEditor?: TextShapeEditor;
    private m_selection: Selection;
    private m_workspace: WorkSpace;
    private m_comment: Comment;
    private m_menu: Menu;
    private m_tool: Tool;
    private m_navi: Navi;
    private m_cursor: Cursor;
    private m_communication: Communication;
    private m_escstack: EscStack;
    private m_assist: Asssit;
    private m_teamwork: TeamWork;
    private m_component: Component;
    private m_path: Path;
    private m_medias: PdMedia;
    private m_user: User;

    private m_vdom: Map<string, { dom: PageDom, ctx: DomCtx }> = new Map();
    private m_arrange: Arrange

    constructor(data: Document, repo: CoopRepository) {
        super();
        (window as any).__context = this;
        this.m_data = data;
        this.m_coopRepo = repo;
        this.m_repo = new RepoWraper(this.m_coopRepo);
        this.m_taskMgr = new TaskMgr();
        this.m_selection = new Selection(data, this); //选区相关
        repo.setSelection(this.m_selection);
        this.m_workspace = new WorkSpace(this); // 编辑器状态
        this.m_comment = new Comment(); // 评论相关
        this.m_menu = new Menu(this); // 菜单相关
        this.m_tool = new Tool(this); // 工具栏相关
        this.m_navi = new Navi(); // 导航栏相关
        this.m_editor = new Editor(this.m_data, this.m_coopRepo, this.m_selection);
        this.m_communication = new Communication();
        this.m_cursor = new Cursor(this); // 光标变换
        this.m_escstack = new EscStack(); // esc任务队列
        this.m_assist = new Asssit(this); // 辅助线相关
        this.m_teamwork = new TeamWork();

        this.m_component = new Component(this);
        this.m_path = new Path(this);
        this.m_arrange = new Arrange();
        this.m_medias = new PdMedia(this);
        this.m_user = new User();
        
        startLoadTask(data, this.m_taskMgr);
    }

    get editor(): Editor {
        return this.m_editor;
    }

    editor4Doc(): DocEditor {
        return this.editor.editor4Doc();
    }

    editor4Page(page: PageView): PageEditor {
        return this.editor.editor4Page(page);
    }

    editor4Shape(shape: ShapeView): ShapeEditor {
        return this.editor.editor4Shape(shape);
    }

    // 在editor里缓存临时数据不太对，应缓存到textselection
    editor4TextShape(shape: TextShapeView | TableCellView): TextShapeEditor {
        if (this.m_textEditor && this.m_textEditor.shape.id === shape.id) {
            return this.m_textEditor;
        }
        this.m_textEditor = this.editor.editor4TextShape(shape);
        return this.m_textEditor;
    }

    peekEditor4TextShape(shape: TextShapeView | TableCellView): TextShapeEditor | undefined {
        if (this.m_textEditor && this.m_textEditor.shape.id === shape.id) {
            return this.m_textEditor;
        }
    }

    editor4Table(shape: TableView): TableEditor {
        return this.editor.editor4Table(shape);
    }

    get data() {
        return this.m_data;
    }

    get repo(): RepoWraper {
        return this.m_repo;
    }

    get coopRepo(): CoopRepository {
        return this.m_coopRepo;
    }

    get selection() {
        return this.m_selection;
    }

    get workspace() {
        return this.m_workspace;
    }

    get comment() {
        return this.m_comment;
    }

    get menu() {
        return this.m_menu;
    }

    get tool() {
        return this.m_tool;
    }

    get navi() {
        return this.m_navi;
    }

    get communication() {
        return this.m_communication;
    }

    get cursor() {
        return this.m_cursor;
    }

    get assist() {
        return this.m_assist;
    }

    get teamwork() {
        return this.m_teamwork;
    }

    get tableSelection() {
        return this.m_selection.tableSelection;
    }

    get textSelection() {
        return this.m_selection.textSelection;
    }

    get esctask() {
        return this.m_escstack;
    }

    get component() {
        return this.m_component;
    }

    get path() {
        return this.m_path;
    }

    get medias() {
        return this.m_medias;
    }

    get user() {
        return this.m_user;
    }

    private createVDom(page: Page) {
        const domCtx = new DomCtx();
        initComsMap(domCtx.comsMap);
        const dom: PageDom = new PageDom(domCtx, { data: page });
        // dom.update(props, true);
        // console.log("dom.nodeCount: " + dom.nodeCount);
        const ret = { dom, ctx: domCtx }
        this.m_vdom.set(page.id, ret);
        return ret;
    }

    getPageDom(page: Page | PageView): { dom: PageDom, ctx: DomCtx } {
        const ret = this.m_vdom.get(page.id);
        if (ret) return ret;
        page = page instanceof PageView ? page.data : page;
        return this.createVDom(page);
    }

    get arrange() {
        return this.m_arrange;
    }

    nextTick(page: PageView, cb: () => void) {
        const ctx = this.getPageDom(page.data).ctx;
        ctx.once('nextTick', cb);
    }
}