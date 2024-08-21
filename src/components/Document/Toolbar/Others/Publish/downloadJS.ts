import { Context } from "@/context";
import { Document, exportExForm } from "@kcdesign/data";
import JSZip from "jszip";
import { readme, template } from "@/components/Document/Toolbar/Others/Publish/index.template";

export class MossPacker {
    private m_context: Context;
    private m_doc: Document;

    constructor(context: Context) {
        this.m_context = context;
        this.m_doc = context.data;
    }

    createDocName(name: string, suffix?: string) {
        const reg = new RegExp('(.sketch|.fig)$', 'img');
        return name.replace(reg, '') + (suffix ? `.${suffix}` : '');
    }

    createHTML() {

    }

    async insertImage(refs: string[], folder: JSZip) {
        if (!refs.length) return;
        const manage = this.m_context.data.mediasMgr;
        for (const ref of refs) {
            const media = await manage.get(ref);
            if (!media) continue;
            folder.file(ref, media.buff);
        }
    }

    async pack(config: any) {
        try {
            const doc = this.m_doc;
            const createName = this.createDocName;

            const data = await exportExForm(doc)
                .catch((error) => {
                    throw error
                });
            console.log('__data__', data);
            if (!data) throw new Error('invalid data');

            const zip = new JSZip();
            const main = zip.folder('');
            if (!main) throw new Error('wrong main folder');

            // 配置文件
            const configBlob = new Blob([JSON.stringify(config)], { type: 'config' });
            main.file('.config', configBlob);

            // .mdd
            const zipMDD = new JSZip();
            const mddFolder = zipMDD.folder('');
            if (!mddFolder) throw new Error('wrong mdd folder');
            // doc.json
            const dataBlob = new Blob([JSON.stringify(data)], { type: 'json' });
            mddFolder.file(createName(doc.name, 'json'), dataBlob);
            // 静态资源
            const imageFolder = mddFolder.folder('assets');
            if (imageFolder) await this.insertImage(data.media_names, imageFolder);
            const contentMDD = await zipMDD.generateAsync({ type: 'blob' });
            main.file(createName(doc.name, 'mdd'), contentMDD);

            // index.html
            main.file('index.html', template);

            // README.md
            main.file('README.md', readme);

            const content = await zip.generateAsync({ type: 'blob' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'download.zip';
            link.click();
        } catch (e) {
            console.error(e);
        }
    }
}