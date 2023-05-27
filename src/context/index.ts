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
import * as share_api from '@/apis/share';
import { router } from '@/router';
import { FILE_UPLOAD } from '@/utils/setting';

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
    upload(id?: string) {
        const token = localStorage.getItem('token')
        if (token)
            uploadExForm(this.m_data, FILE_UPLOAD, token, id ? id : '', async (successed, doc_id) => {
                if (successed) {
                    localStorage.setItem('docId', doc_id)
                    if (!id) {
                        router.replace({
                            path: '/document',
                            query: { id: doc_id }
                        })
                    }
                }
            })
    }

    async documentInfo(id: string) {
        try {
            if (id) {
                const { data } = await share_api.getDocumentInfoAPI({ doc_id: id })
                return data
            } else {
                console.log('没有该文档');
            }

        } catch (err) {
            return console.log(err);
        }
    }
}