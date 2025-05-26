/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

/**
 * 文档编辑器组件
 * @description 用于渲染和编辑设计文档的主要组件
 */
import _DocumentVue from "./components/Document/index.vue"

/**
 * 移动端文档编辑器组件
 * @description 针对移动端优化的文档编辑器组件
 */
import _MobileDocumentVue from "./components/Mobile/Document.vue"

/**
 * 预览组件
 * @description 用于预览设计文档的组件
 */
import _PreviewVue from "./components/Preview/index.vue"
import _StaticShape from "./components/Document/Content/StaticShape.vue"
import {
    CoopRepository,
    createDocument,
    DocEditor,
    Document,
    exportVext,
    importFigma,
    importRemote,
    importSketch,
    importVext,
    TransactDataGuard,
} from '@kcdesign/data';

import { Context } from "./context";
import i18n from '@/i18n'
import { DocumentProps } from "./openapi";
import { IContext } from "@/openapi";

import '@/style/constant.scss'
import '@/style/app.scss'
import { initDataModule } from "./basic/initmodule";
export {i18n_messages as i18n} from '@/i18n';

export * from "./openapi";

export const DocumentVue = _DocumentVue

/**
 * 移动端文档编辑器组件
 * @component
 */
export const MobileDocumentVue = _MobileDocumentVue

/**
 * 预览组件
 * @component
 */
export const PreviewVue = _PreviewVue

export const StaticShape = _StaticShape

const t = (i18n as any).global.t;

async function _open(props: DocumentProps) {
    await initDataModule();
    const repo = new TransactDataGuard();
    let cooprepo: CoopRepository | undefined;
    let data: Document | undefined;
    if (props.source === 'storage') {
        const { document } = await importRemote(props.storage, props.path, props.fid, props.versionId, repo);
        data = document
        cooprepo = new CoopRepository(data, repo)
    } else if (props.source === 'file') {
        if (props.fmt === 'sketch') {
            data = await importSketch(props.file, repo);
            cooprepo = new CoopRepository(data, repo)
        } else if (props.fmt === 'fig') {
            data = await importFigma(props.file, repo)
            cooprepo = new CoopRepository(data, repo)
        } else if (props.fmt === 'vext' || props.fmt === 'moss') {
            data = await importVext(props.file, repo);
            cooprepo = new CoopRepository(data, repo)
        }
    } else if (props.source === 'new') {
        data = createDocument(t('system.new_file'), repo);
        cooprepo = new CoopRepository(data, repo)
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

/**
 * 打开文档
 * @param props @see DocumentProps
 * @returns 
 */
export async function openDocument(props: DocumentProps) {
    let cooprepo: CoopRepository | undefined;
    let data: Document | undefined;
    try {
        const result = await _open(props);
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
    return exportVext(context.data, 'blob') as Promise<Blob>;
}

export { initModule } from "./basic/initmodule";

export { DragKit } from "./components/common/draggable";