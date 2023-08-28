import { CoopRepository, TaskMgr, Task, Watchable, TaskPriority, TableShape, TableEditor, Text } from "@kcdesign/data";
import { Document } from "@kcdesign/data";
import { Page } from "@kcdesign/data";
import { Shape, TextShape } from "@kcdesign/data";
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
import { TableSelection } from "./tableselection";
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
    constructor(data: Document, repo: CoopRepository) {
        super();
        (window as any).__context = this;
        this.m_data = data;
        this.m_coopRepo = repo;
        this.m_repo = new RepoWraper(this.m_coopRepo);
        this.m_taskMgr = new TaskMgr();
        this.m_selection = new Selection(data);
        this.m_workspace = new WorkSpace(this);
        this.m_comment = new Comment();
        this.m_menu = new Menu();
        this.m_tool = new Tool(this);
        this.m_navi = new Navi();
        this.m_editor = new Editor(this.m_data, this.m_coopRepo, this.m_selection);
        this.m_communication = new Communication();
        this.m_cursor = new Cursor(this);
        this.m_escstack = new EscStack();
        this.m_assist = new Asssit(this);
        this.m_teamwork = new TeamWork();
        this.m_tableselection = new TableSelection(this);
        const pagelist = data.pagesList.slice(0);
        this.m_taskMgr.add(new class implements Task { // page auto loader
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
                    }
                    else {
                        id = i.id;
                        break;
                    }
                }
                if (id) {
                    await data.pagesMgr.get(id);
                    pagelist.splice(0, 1);
                }
            }
        }, TaskPriority.normal);

        this.m_taskMgr.startLoop();
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
}