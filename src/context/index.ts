import {Watchable} from "@kcdesign/data/data/basic";
import {Document} from "@kcdesign/data/data/document";
import {Page} from "@kcdesign/data/data/page";
import {Shape} from "@kcdesign/data/data/shape";
import {Repository} from "@kcdesign/data/data/transact";
import {DocEditor, Editor, PageEditor} from "@kcdesign/data/editor";
import {ShapeEditor} from "@kcdesign/data/editor/shape";
import {uploadExForm} from "@kcdesign/data/io/export";
import {Selection} from "./selection";
import {WorkSpace} from "./workspace";
export class Context extends Watchable(Object) {
    private m_data: Document;
    private m_selection: Selection;
    private m_editor?: Editor;
    private m_repo: Repository;
    private m_workspace: WorkSpace;

    constructor(data: Document, repo: Repository) {
        super();
        this.m_data = data;
        this.m_selection = new Selection(data);
        this.m_repo = repo;
        this.m_workspace = new WorkSpace(this);
    }

    get editor(): Editor {
        if (this.m_editor === undefined) {
            this.m_editor = new Editor(this.m_data, this.m_repo, this.m_selection);
            this.notify();
        }
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

    get repo(): Repository {
        return this.m_repo;
    }

    get selection() {
        return this.m_selection;
    }

    get workspace() {
        return this.m_workspace;
    }

    // debug
    upload(id?: string) {
        const token = localStorage.getItem('token')
        if(token)
         uploadExForm(this.m_data, 'ws://192.168.0.10:10000/api/v1', token, id ? id : '', async (successed, doc_id) => {
            if(successed) {
                localStorage.setItem('docId', doc_id)
            }
        })
    }

}