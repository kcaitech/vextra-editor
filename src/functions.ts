/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */


import { IO, Repo, TransactDataGuard, Document, Creator, DocEditor } from "@kcdesign/data";
import { initDataModule } from "./basic/initmodule";
import i18n from "@/i18n";
import { DocumentProps } from "./openapi";
import { Context } from "./context";
import { IContext } from "./openapi";

const t = (i18n as any).global.t;

export { supportedFormats } from "./basic/consts";

async function _openFile(props: DocumentProps, transact: TransactDataGuard, repoCreator: (data: Document, guard: TransactDataGuard) => Repo.IRepository) {
    if (props.source !== 'file') throw new Error('Invalid source');
    let repo: Repo.IRepository | undefined;
    let data: Document | undefined;
    if (props.fmt === 'sketch') {
        data = await IO.importSketch(props.file, transact);
        repo = repoCreator(data, transact)
    } else if (props.fmt === 'fig') {
        data = await IO.importFigma(props.file, transact)
        repo = repoCreator(data, transact)
    } else if (props.fmt === 'vext') {
        data = await IO.importVext(props.file, transact);
        repo = repoCreator(data, transact)
    } else if (props.fmt === 'svg') {
        data = await IO.importSvg(props.file, transact);
        if (data) repo = repoCreator(data, transact)
    }
    if (data) {
        return { data, repo: repo! }
    }
}

async function _open(props: DocumentProps, repoCreator: (data: Document, guard: TransactDataGuard) => Repo.IRepository) {
    await initDataModule();
    const transact = new TransactDataGuard();
    let repo: Repo.IRepository | undefined;
    let data: Document | undefined;
    if (props.source === 'storage') {
        const { document } = await IO.importRemote(props.storage, props.path, props.fid, props.versionId, transact);
        data = document
        repo = repoCreator(data, transact)
    } else if (props.source === 'file') {
        const result = await _openFile(props, transact, repoCreator);
        if (result) {
            repo = result.repo;
            data = result.data;
        }
    } else if (props.source === 'new') {
        data = Creator.newDocument(t('system.new_file'), transact);
        repo = repoCreator(data, transact)
        repo.startInitData();
        const editor = new DocEditor(data, repo);
        const page = editor.create(t('system.page1'));
        editor.insert(0, page);
        repo.endInitData();
    }

    if (data) {
        return { data, repo: repo! }
    }
}

function createRepo(data: Document, guard: TransactDataGuard) {
    return new Repo.Repo(data, guard);
}

/**
 * 打开文档
 * @param props @see DocumentProps
 * @returns 
 */
export async function openDocument(props: DocumentProps, repoCreator: (data: Document, guard: TransactDataGuard) => Repo.IRepository = createRepo) {
    let repo: Repo.IRepository | undefined;
    let data: Document | undefined;
    try {
        const result = await _open(props, repoCreator);
        if (!result) return;
        repo = result.repo;
        data = result.data;
    } catch (e) {
        console.error(e)
        return;
    }

    return new Context(data, repo, props) as IContext;
}

export async function exportDocument(context: IContext) {
    return IO.exportVext(context.data, 'blob') as Promise<Blob>;
}