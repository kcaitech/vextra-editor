import { Watchable } from "@kcdesign/data";
import { Document } from "@kcdesign/data";
import { Page } from "@kcdesign/data";
import { Shape } from "@kcdesign/data";
import { Repository } from "@kcdesign/data";
import { DocEditor, Editor, PageEditor } from "@kcdesign/data";
import { ShapeEditor } from "@kcdesign/data";
import { uploadExForm } from "@kcdesign/data";
import { Selection } from "./selection";
import { WorkSpace } from "./workspace";

// 仅暴露必要的方法
export class RepoWraper {
    private m_repo: Repository;
    constructor(repo: Repository) {
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
    /**
     * @deprecated
     */
    get transactCtx() { // TODO 
        return this.m_repo.transactCtx;
    }
    /**
     * @deprecated
     * @param cmd 
     */
    commit(cmd: any) {
        this.m_repo.commit(cmd);
    }
}

export class Context extends Watchable(Object) {
    private m_data: Document;
    private m_selection: Selection;
    private m_editor: Editor;
    private m_repo: RepoWraper;
    private m_workspace: WorkSpace;

    constructor(data: Document, repo: Repository) {
        super();
        this.m_data = data;
        this.m_selection = new Selection(data);
        this.m_repo = new RepoWraper(repo);
        this.m_workspace = new WorkSpace(this);
        this.m_editor = new Editor(this.m_data, repo, this.m_selection);
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

    get selection() {
        return this.m_selection;
    }

    get workspace() {
        return this.m_workspace;
    }

    // debug
    upload() {
        const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2ODM5NjA2ODUsIm5iZiI6MTY4MzM1NTg4NSwiaWF0IjoxNjgzMzU1ODg1LCJkYXRhIjp7ImRhdGEiOnsiaWQiOiI4Iiwibmlja25hbWUiOiJJY2UuWiJ9fX0.AZsb_9SYPWAoQHjFD1S0PqY5Kq34yFtmhQ4hKN0BceE"
        uploadExForm(this.m_data, 'ws://192.168.0.10:10000/api/v1', token, "47330851083522048", (successed, doc_id) => {
            console.log(successed, doc_id);
        })
    }
}