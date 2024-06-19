import _DocumentVue from "./components/Document/index.vue"
import _MobileDocumentVue from "./components/Mobile/Document.vue"
import {
    CoopRepository,
    createDocument,
    DataLoader,
    DocEditor,
    Document,
    importFigma,
    importRemote,
    importSketch,
    RadixConvert,
    Repository,
} from '@kcdesign/data';
import { LzDataLocal } from "./basic/lzdatalocal";
import { Zip } from "./PAL/browser/zip";
import { Context } from "./context";
import i18n from '@/i18n'
import { DocumentProps } from "./openapi";
import { IContext } from "./openapi/context";

export * from "./openapi";

const t = (i18n as any).global.t;

async function _open(props: DocumentProps) {
    const repo = new Repository();
    let cooprepo: CoopRepository | undefined;
    let data: Document | undefined;
    let loader_: DataLoader | undefined
    if (props.source === 'storage') {
        const { document, loader } = await importRemote(props.storage, props.path, props.fid, props.versionId, repo);
        data = document
        cooprepo = new CoopRepository(data, repo)
        loader_ = loader
    }
    else if (props.source === 'file') {
        if (props.fmt === 'sketch') {
            const lzdata = new LzDataLocal(new Zip(props.file));
            data = await importSketch(props.file.name, lzdata, repo)
            cooprepo = new CoopRepository(data, repo)
        } else if (props.fmt === 'fig') {
            data = await importFigma(props.file, repo)
            cooprepo = new CoopRepository(data, repo)
        }
    }
    else if (props.source === 'new') {
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
        return { data, cooprepo: cooprepo!, loader: loader_ }
    }
}

export async function openDocument(props: DocumentProps) {
    let cooprepo: CoopRepository | undefined;
    let data: Document | undefined;
    let loader: DataLoader | undefined
    try {
        const result = await _open(props);
        if (!result) return;
        cooprepo = result.cooprepo;
        data = result.data;
        loader = result.loader;
    } catch (e) {
        console.error(e)
        return;
    }

    // if (props.coop) cooprepo.setNet(props.coop);
    const context = new Context(data, cooprepo, props) as IContext;
    // if (props.communication) context.communication = props.communication;
    // const app = props.isMobile ? Vue.createApp(MobileDocumentVue, { context }) : Vue.createApp(DocumentVue, { context });
    return { context, loader: loader }
}



export const DocumentVue = _DocumentVue
export const MobileDocumentVue = _MobileDocumentVue