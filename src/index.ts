import _DocumentVue from "./components/Document/index.vue"
import _MobileDocumentVue from "./components/Mobile/Document.vue"
import _PreviewVue from "./components/Preview/index.vue"
import _StaticShape from "./components/Document/Content/StaticShape.vue"
import {
    CoopRepository,
    createDocument,
    DocEditor,
    Document,
    importFigma,
    importRemote,
    importSketch,
    RadixConvert,
    Repository,
} from '@kcdesign/data';
import { LzDataLocal } from "./basic/lzdatalocal";
import { Zip } from "@/basic/zip";
import { Context } from "./context";
import i18n from '@/i18n'
import { DocumentProps } from "./openapi";
import { IContext } from "@/openapi";
import { importDocumentFromMDD } from "@/io";

import '@/style/constant.scss'
import '@/style/app.scss'
import { initDataModule } from "./components/common/initmodule";
export {i18n_messages as i18n} from '@/i18n';

export * from "./openapi";

export const DocumentVue = _DocumentVue
export const MobileDocumentVue = _MobileDocumentVue
export const PreviewVue = _PreviewVue

export const StaticShape = _StaticShape

const t = (i18n as any).global.t;

/**
 * @deprecated 不能这么导出
 */
export { useComment } from '@/components/Document/Creator/execute'

async function _open(props: DocumentProps) {
    await initDataModule();
    const repo = new Repository();
    let cooprepo: CoopRepository | undefined;
    let data: Document | undefined;
    // let loader_: DataLoader | undefined
    if (props.source === 'storage') {
        const { document, loader } = await importRemote(props.storage, props.path, props.fid, props.versionId, repo);
        data = document
        cooprepo = new CoopRepository(data, repo)
        // loader_ = loader
    } else if (props.source === 'file') {
        if (props.fmt === 'sketch') {
            const lzdata = new LzDataLocal(new Zip(props.file));
            data = await importSketch(props.file.name.replace(/.sketch$/, ''), lzdata, repo);
            cooprepo = new CoopRepository(data, repo)
        } else if (props.fmt === 'fig') {
            data = await importFigma(props.file, repo)
            cooprepo = new CoopRepository(data, repo)
        } else if (props.fmt === 'moss') {
            data = await importDocumentFromMDD(props.file, repo);
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
    if (cooprepo) cooprepo.setBaseVer(new RadixConvert(62).from(data!.lastCmdId))

    if (data) {
        return { data, cooprepo: cooprepo! }
    }
}

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
