/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import {
    CoopRepository,
    WatchableObject,
    TableEditor,
    PageView,
    ShapeView,
    TableView,
    TextShapeView,
    TableCellView,
    IEventEmitter,
    EventEmitter,
    Document,
    Page,
    DocEditor,
    Editor,
    PageEditor,
    ShapeEditor,
    TextShapeEditor
} from "@kcdesign/data";
import { Selection } from "./selection";
import { WorkSpace } from "./workspace";
import { Menu } from "./menu";
import { Tool } from "./tool";
import { Navi } from "./navigate";
import { Cursor } from "./cursor";
import { Assist } from "./assist";
import { TeamWork } from "./teamwork";
import { PageDom } from "@/components/Document/Content/vdom/page";
import { initComsMap } from "@/components/Document/Content/vdom/comsmap";
import { Arrange } from "./arrange";
import { PdMedia } from "./medias";
import { User } from './user';

import { DomCtx } from "@/components/Document/Content/vdom/domctx";
import { Component } from "./component";
import { Path } from "./path";
import { ColorCtx } from "./color";
import { startLoadTask } from "./loadtask";
import { Attribute } from "./atrribute";
import { ContextEnvironment, DocumentProps, INet, IScout, IToolBox } from "@/openapi";
import { PluginsMgr } from "./pluginsmgr";
import { events } from "./events";
import { IContext } from "@/openapi";
import { EscStack } from "./escstack";
import { scout } from "@/utils/scout";
import { Preview } from "./preview";
import { Clipboard } from "@/clipboard";
import { EditorLayout } from "@/components/Document/Layout/editorlayout";
import { RenderContext } from "@/context/render";
import { TaskMgr } from "@/basic/taskmgr";

// 仅暴露必要的方法
class RepoWrapper {
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

    setOnChange(onChange: (id: string) => void) {
        this.m_repo.setOnChange(onChange);
    }
}

class ToolBox implements IToolBox {

    _scout: IScout | undefined;
    _event = new EventEmitter()
    _context: Context;

    constructor(context: Context) {
        this._context = context;
    }

    get scout(): IScout {
        if (!this._scout) this._scout = scout(this._context);
        return this._scout;
    }

    get event(): IEventEmitter {
        return this._event;
    }

    silent() {
        this._context.tool.silent();
    }

    reset() {
        this._context.tool.reset();
    }
}

export class Context extends WatchableObject implements IContext {
    // 用EventEmitter及storage来进行界面组件之间的数据同步及通信
    // storage的key可以用组件路径也可用uuid等唯一标识
    // eventid同上，需要个唯一前缀。
    // 做到不同功能的组件之间可以完全解耦合
    // public storage: Map<string, any> = new Map();

    private m_data: Document;
    private m_editor: Editor;
    private m_repo: RepoWrapper;
    private m_coopRepo: CoopRepository;
    private m_taskMgr: TaskMgr;
    private m_textEditor?: TextShapeEditor;
    private m_selection: Selection;
    private m_workspace: WorkSpace;
    private m_pluginsMgr: PluginsMgr;
    private m_menu: Menu;
    private m_tool: Tool;
    private m_navi: Navi;
    private m_cursor: Cursor;
    private m_escstack: EscStack;
    private m_assist: Assist;
    private m_teamwork: TeamWork;
    private m_component: Component;
    private m_path: Path;
    private m_color: ColorCtx;
    private m_medias: PdMedia;
    private m_user: User;
    private m_attr: Attribute;
    private m_preview: Preview;
    private m_clip: Clipboard;
    private m_layout: EditorLayout;

    private m_vdom: Map<string, { dom: PageDom, ctx: DomCtx }> = new Map();
    private m_arrange: Arrange
    private m_props: DocumentProps;
    private m_net?: INet;
    private m_readonly?: boolean;

    private m_render: RenderContext;

    inactive: boolean;
    env: ContextEnvironment;

    constructor(data: Document, repo: CoopRepository, props: DocumentProps) {
        super();
        (window as any).__context = this;
        this.m_data = data;
        this.m_coopRepo = repo;
        this.m_props = props;
        this.m_repo = new RepoWrapper(this.m_coopRepo);
        this.m_taskMgr = new TaskMgr();
        this.m_selection = new Selection(data, this); //选区相关
        repo.setSelection(this.m_selection);
        this.m_workspace = new WorkSpace(this); // 编辑器状态
        this.m_pluginsMgr = new PluginsMgr();
        this.m_menu = new Menu(this); // 菜单相关
        this.m_tool = new Tool(this); // 工具栏相关
        this.m_navi = new Navi(); // 导航栏相关
        this.m_editor = new Editor(this.m_data, this.m_coopRepo, this.m_selection);
        this.m_cursor = new Cursor(); // 光标变换
        this.m_escstack = new EscStack(); // esc任务队列
        this.m_assist = new Assist(this); // 辅助线相关
        this.m_teamwork = new TeamWork();

        this.m_component = new Component(this);
        this.m_path = new Path(this);
        this.m_arrange = new Arrange();
        this.m_color = new ColorCtx();
        this.m_medias = new PdMedia(this);
        this.m_user = new User();
        this.m_attr = new Attribute();
        this.m_preview = new Preview(this);
        this.m_clip = new Clipboard(this);
        this.m_layout = new EditorLayout(this);
        this.m_render = new RenderContext();
        startLoadTask(data, this.m_taskMgr);

        this.eventsMap = new Map();

        this.env = ContextEnvironment.Web;
        this.inactive = false;

    }

    private _storage: Map<string, string> = new Map();
    get storage(): Map<string, string> {
        return this._storage;
    }

    private _sessionStorage: Map<string, string> = new Map();
    get sessionStorage(): Map<string, string> {
        return this._sessionStorage;
    }

    private m_toolbox = new ToolBox(this);

    get toolbox(): IToolBox {
        return this.m_toolbox; // todo
    }

    get escstack(): EscStack {
        return this.m_escstack;
    }

    get curAction(): string | undefined {
        return this.tool.action;
    }

    setCurAction(uuid: string): void {
        this.tool.setAction(uuid);
    }

    keyHandlers: {
        [key: string]: (
            event: KeyboardEvent, context: IContext) => void
    } = {}

    registKeyHandler(keyCode: string, handler: (
        event: KeyboardEvent, context: IContext) => void): void {
        this.keyHandlers[keyCode] = handler;
    }

    lastRemoteCmdVersion(): number | undefined {
        return this.m_coopRepo.lastRemoteCmdVersion()
    }

    hasPendingSyncCmd(): boolean {
        return this.m_coopRepo.hasPendingSyncCmd();
    }

    setNet(net: INet): void {
        this.m_net = net;
        this.m_coopRepo.setNet(net);
    }

    get net() {
        return this.m_net;
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
        if (!this.selection.selectedPage) throw new Error("not selected page?");
        return this.editor.editor4Shape(this.selection.selectedPage, shape);
    }

    // 在editor里缓存临时数据不太对，应缓存到textselection
    editor4TextShape(shape: TextShapeView | TableCellView): TextShapeEditor {
        if (!this.selection.selectedPage) throw new Error("not selected page?");
        if (this.m_textEditor && this.m_textEditor.shape.id === shape.id && this.m_textEditor.view.parent) {
            return this.m_textEditor;
        }
        this.m_textEditor = this.editor.editor4TextShape(this.selection.selectedPage, shape);
        return this.m_textEditor;
    }

    peekEditor4TextShape(shape: TextShapeView | TableCellView): TextShapeEditor | undefined {
        if (this.m_textEditor && this.m_textEditor.shape.id === shape.id) {
            return this.m_textEditor;
        }
    }

    editor4Table(shape: TableView): TableEditor {
        if (!this.selection.selectedPage) throw new Error("not selected page?");
        return this.editor.editor4Table(this.selection.selectedPage, shape);
    }

    get data() {
        return this.m_data;
    }

    get repo(): RepoWrapper {
        return this.m_repo;
    }

    get props() {
        return this.m_props;
    }

    setReadonly(readonly: boolean) {
        this.m_readonly = readonly;
        this.notify(events.context_readonly_change, readonly)
    }

    get readonly() {
        return !!this.m_readonly;
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

    get pluginsMgr() {
        return this.m_pluginsMgr;
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

    get attr() {
        return this.m_attr;
    }

    get preview() {
        return this.m_preview;
    }

    get clip() {
        return this.m_clip;
    }

    private createVDom(page: Page) {
        // const domCtx = new DomCtx("Canvas");
        const domCtx = new DomCtx();
        initComsMap(domCtx.comsMap);
        const dom: PageDom = new PageDom(domCtx, { data: page });
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

    get color() {
        return this.m_color;
    }

    rename(name: string) {
        this.editor4Doc().rename(name);
    }

    get layout() {
        return this.m_layout;
    }

    private m_custom_loading = false;
    private m_custom_loading_watcher: (show: boolean) => void = () => { };
    setCustomLoading(show: boolean): void {
        this.m_custom_loading = show;
        this.m_custom_loading_watcher(show)
    }
    watchCustomLoading(cb: (show: boolean) => void) {
        this.m_custom_loading_watcher = (cb);
    }
    get customLoading() {
        return this.m_custom_loading;
    }

    get render() {
        return this.m_render;
    }

    eventsMap: Map<string, Function[]>;
}