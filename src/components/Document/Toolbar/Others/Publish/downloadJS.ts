import { Context } from "@/context";
import { Document, exportExForm } from "@kcdesign/data";
import JSZip from "jszip";

export class MossPacker {
    private m_context: Context;
    private m_doc: Document;

    constructor(context: Context) {
        this.m_context = context;
        this.m_doc = context.data;
    }

    createDocName(name: string) {
        const reg = new RegExp(`(.sketch|.fig)$`, 'img');
        return name.replace(reg, '') + '.mdd';
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

    async pack() {
        try {
            const data = await exportExForm(this.m_doc)
                .catch((error) => {
                    throw error
                });
            console.log('__data__', data);
            if (!data) throw new Error('invalid data');
            const blob = new Blob([JSON.stringify(data)], { type: 'mdd' });
            const zip = new JSZip();
            const main = zip.folder('');
            if (!main) throw new Error('wrong main folder')

            // 文档
            main.file(this.createDocName(this.m_doc.name), blob);

            // 静态资源
            const imageFolder = main.folder('assets');
            if (imageFolder) await this.insertImage(data.media_names, imageFolder);

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