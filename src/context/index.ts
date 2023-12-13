import {
    CoopRepository,
    TaskMgr,
    Task,
    Watchable,
    TaskPriority,
    TableShape,
    TableEditor,
    Text,
    SymbolShape,
    DViewCtx
} from "@kcdesign/data";
import {Document} from "@kcdesign/data";
import {Page} from "@kcdesign/data";
import {Shape} from "@kcdesign/data";
import {DocEditor, Editor, PageEditor} from "@kcdesign/data";
import {ShapeEditor, TextShapeEditor} from "@kcdesign/data";
import {Selection} from "./selection";
import {WorkSpace} from "./workspace";
import {Comment} from "./comment";
import {Menu} from "./menu";
import {Tool} from "./tool";
import {Navi} from "./navigate";
import {Communication} from "@/context/communication/communication";
import {Cursor} from "./cursor";
import {EscStack} from "./escstack";
import {Asssit} from "./assist";
import {TeamWork} from "./teamwork";
import {TableSelection} from "./tableselection";
import {TextSelection} from "./textselection";
import {Component} from "./component";
import {Path} from "./path";
import { PageDom } from "@/components/Document/Content/vdom/page";

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
}

export class Context extends Watchable(Object) {
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
    private m_tableselection: TableSelection;
    private m_component: Component;
    private m_path: Path;

    private m_vdom: Map<string, { dom: PageDom, ctx: DViewCtx }> = new Map();

    constructor(data: Document, repo: CoopRepository) {
        super();
        (window as any).__context = this;
        this.m_data = data;
        this.m_coopRepo = repo;
        this.m_repo = new RepoWraper(this.m_coopRepo);
        this.m_taskMgr = new TaskMgr();
        this.m_selection = new Selection(data, this); //选区相关
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
        this.m_tableselection = new TableSelection(this); // 表格选区
        this.m_textselection = new TextSelection(this.m_selection); // 文字选区
        this.m_component = new Component(this);
        this.m_path = new Path(this);
        const pagelist = data.pagesList.slice(0);
        const checkSymLoaded: (() => boolean)[] = [];
        const pageloadTask = new class implements Task { // page auto loader
            isValid(): boolean {
                return !this.isDone();
            }

            isDone(): boolean {
                return pagelist.length <= 0;
            }

            async run(): Promise<void> {
                let id;
                while (pagelist.length > 0) {
                    const i = pagelist[0];
                    if (data.pagesMgr.getSync(i.id)) {
                        pagelist.splice(0, 1);
                    } else {
                        id = i.id;
                        break;
                    }
                }
                if (id) {
                    await data.pagesMgr.get(id);
                    pagelist.splice(0, 1);
                    for (let i = 0; i < checkSymLoaded.length;) {
                        if (checkSymLoaded[i]()) {
                            checkSymLoaded.splice(i, 1);
                        } else {
                            ++i;
                        }
                    }
                }
            }
        }

        this.m_taskMgr.add(pageloadTask, TaskPriority.normal);
        this.m_taskMgr.startLoop();

        // symbol loader
        data.symbolsMgr.setLoader(async (id: string): Promise<SymbolShape> => {
            return new Promise((resolve, reject) => {
                checkSymLoaded.push(() => {
                    const sym = data.symbolsMgr.getSync(id);
                    if (sym) resolve(sym);
                    else if (pageloadTask.isDone()) reject();
                    else return false;
                    return true;
                })
            })
        })
    }

    get editor(): Editor {
        return this.m_editor;
    }

    editor4Doc(): DocEditor {
        return this.editor.editor4Doc();
    }

    editor4Page(page: Page): PageEditor {
        return this.editor.editor4Page(page);
    }

    editor4Shape(shape: Shape): ShapeEditor {
        return this.editor.editor4Shape(shape);
    }

    editor4TextShape(shape: Shape & { text: Text }): TextShapeEditor {
        if (this.m_textEditor && this.m_textEditor.shape.id === shape.id) {
            return this.m_textEditor;
        }
        this.m_textEditor = this.editor.editor4TextShape(shape);
        return this.m_textEditor;
    }

    peekEditor4TextShape(shape: Shape & { text: Text }): TextShapeEditor | undefined {
        if (this.m_textEditor && this.m_textEditor.shape.id === shape.id) {
            return this.m_textEditor;
        }
    }

    editor4Table(shape: TableShape): TableEditor {
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
        return this.m_tableselection;
    }

    get textSelection() {
        return this.m_textselection;
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

    get vdom() {
        return this.m_vdom;
    }
}