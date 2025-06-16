/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */


import { IO, Repo, TransactDataGuard, Document, creator, DocEditor } from "@kcdesign/data";
import { initDataModule } from "./basic/initmodule";
import i18n from "@/i18n";
import { DocumentProps } from "./openapi";
import { Context } from "./context";
import { IContext } from "./openapi";

const t = (i18n as any).global.t;

async function _open(props: DocumentProps, repoCreator: (data: Document, guard: TransactDataGuard) => Repo.IRepository) {
    await initDataModule();
    const repo = new TransactDataGuard();
    let cooprepo: Repo.IRepository | undefined;
    let data: Document | undefined;
    if (props.source === 'storage') {
        const { document } = await IO.importRemote(props.storage, props.path, props.fid, props.versionId, repo);
        data = document
        cooprepo = repoCreator(data, repo)
    } else if (props.source === 'file') {
        if (props.fmt === 'sketch') {
            data = await IO.importSketch(props.file, repo);
            cooprepo = repoCreator(data, repo)
        } else if (props.fmt === 'fig') {
            data = await IO.importFigma(props.file, repo)
            cooprepo = repoCreator(data, repo)
        } else if (props.fmt === 'vext' || props.fmt === 'moss') {
            data = await IO.importVext(props.file, repo);
            cooprepo = repoCreator(data, repo)
        }
    } else if (props.source === 'new') {
        data = creator.newDocument(t('system.new_file'), repo);
        cooprepo = repoCreator(data, repo)
        cooprepo.setInitingDocument(true);
        const editor = new DocEditor(data, cooprepo);
        const page = editor.create(t('system.page1'));
        editor.insert(0, page);
        cooprepo.setInitingDocument(false);
    }

    // todo 移动到data
    if (cooprepo) cooprepo.setBaseVer((data!.lastCmdVer))

    if (data) {
        return { data, cooprepo: cooprepo! }
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
    let cooprepo: Repo.IRepository | undefined;
    let data: Document | undefined;
    try {
        const result = await _open(props, repoCreator);
        if (!result) return;
        cooprepo = result.cooprepo;
        data = result.data;
    } catch (e) {
        console.error(e)
        return;
    }

    return new Context(data, cooprepo, props) as IContext;
}

export async function exportDocument(context: IContext) {
    return IO.exportVext(context.data, 'blob') as Promise<Blob>;
}