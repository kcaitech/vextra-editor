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

    async pack(config: any) {
        const doc = this.m_doc;
        const createName = this.createDocName;

        const data = await exportExForm(doc)
            .catch((error) => {
                throw error
            });
        if (!data) throw new Error('invalid data');

        try {
            const zip = new JSZip();

            const readmeBlob = generateReadme();
            zip.file('README.md', readmeBlob);

            const web = zip.folder('web')!;

            const html = generateIndexHTML(createName(data.document_meta.name));
            web.file('index.html', html);

            const loader = await generateIndexJS();
            if (loader) web.file('index.js', loader);

            const _static = web.folder('static')!;
            const config = generateConfig();
            _static.file('.config', config);
            const doc = generateDoc();
            _static.file('document-meta.json', doc);
            generatePages(_static);
            const images = _static.folder('images')!;
            await generateImages(images, this.m_context);

            const content = await zip.generateAsync({ type: 'blob' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = createName(data.document_meta.name) + '.zip';
            link.click();
        } catch (e) {
            console.error(e);
        }

        function generateReadme() {
            return readme;
        }

        function generateIndexHTML(title: string) {
            return template.replace('<%title%>', title);
        }

        async function generateIndexJS() {
            const response = await fetch('/static/prototype/index.prototype.js');
            const reader = response.body?.getReader();
            const values: Uint8Array[] = [];
            while (reader) {
                const r = await reader.read();
                if (r.value) values.push(r.value);
                if (r.done) break;
            }
            return new Blob([...values]);
        }

        function generateConfig() {
            return new Blob([JSON.stringify(config)], { type: 'config' });
        }

        function generateDoc() {
            return new Blob([JSON.stringify(data.document_meta)], { type: 'json' });
        }

        function generatePages(folder: JSZip) {
            data.pages.forEach(p => {
                folder.file(p.id + '.json', new Blob([JSON.stringify(p)]));
            });
        }

        async function generateImages(folder: JSZip, context: Context) {
            if (!data.media_names.length) return;
            const manager = context.data.mediasMgr;
            for (const ref of data.media_names) {
                const media = await manager.get(ref);
                if (!media) continue;
                folder.file(ref, media.buff);
            }
        }
    }
}