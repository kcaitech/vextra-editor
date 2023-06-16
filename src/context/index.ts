import { CoopRepository, Watchable } from "@kcdesign/data";
import { Document } from "@kcdesign/data";
import { Page } from "@kcdesign/data";
import { Shape } from "@kcdesign/data";
import { Repository } from "@kcdesign/data";
import { DocEditor, Editor, PageEditor } from "@kcdesign/data";
import { ShapeEditor } from "@kcdesign/data";
import { Selection } from "./selection";
import { WorkSpace } from "./workspace";
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
    private m_selection: Selection;
    private m_editor: Editor;
    private m_repo: RepoWraper;
    private m_coopRepo: CoopRepository;
    private m_workspace: WorkSpace;

    constructor(data: Document, repo: CoopRepository) {
        super();
        this.m_data = data;
        this.m_selection = new Selection(data);
        this.m_coopRepo = repo;
        this.m_repo = new RepoWraper(this.m_coopRepo);
        this.m_workspace = new WorkSpace(this);
        this.m_editor = new Editor(this.m_data, this.m_coopRepo, this.m_selection);
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
}