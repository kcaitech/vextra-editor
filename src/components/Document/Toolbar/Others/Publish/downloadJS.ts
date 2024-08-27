import { Context } from "@/context";
import { Document, exportExForm } from "@kcdesign/data";
import JSZip from "jszip";
import { readme, template } from "@/components/Document/Toolbar/Others/Publish/index.template";
import { MossError } from "@/basic/error";

export class MossPacker {
    private readonly m_context: Context;
    private readonly m_doc: Document;

    constructor(context: Context) {
        this.m_context = context;
        this.m_doc = context.data;
    }

    createDocName(name: string, suffix?: string) {
        const reg = new RegExp('(.sketch|.fig)$', 'img');
        return name.replace(reg, '') + (suffix ? `.${suffix}` : '');
    }

    async pack(config: any, commit: (status: 0 | 1, message: string) => void) {
        const doc = this.m_doc;
        const createName = this.createDocName;
        const t = this.m_context.workspace.t.bind(this.m_context.workspace);

        commit(1, t('publish.export_doc'));
        await __ease();
        const data = await exportExForm(doc)
            .catch((error) => {
                console.error(error);
                throw new MossError(t('publish.export_doc_error'));
            });

        if (!data) throw new MossError(t('publish.invalid_document'));

        const web = new JSZip()!;
        const readmeBlob = generateReadme();
        web.file('README.md', readmeBlob);

        const html = generateIndexHTML(createName(data.document_meta.name));
        web.file('index.html', html);

        commit(1, t('publish.export_script'));
        await __ease();
        const loader = await generateIndexJS();
        if (loader) web.file('index.js', loader);

        const _static = web.folder('static')!;
        const configBlob = generateConfig();
        _static.file('.config', configBlob);
        const docBlob = generateDoc();
        _static.file('document-meta.json', docBlob);
        generatePages(_static);
        const images = _static.folder('images')!;
        await generateImages(images, this.m_context);

        commit(1, t('publish.packaging'));
        await __ease();
        const content = await web.generateAsync({ type: 'blob' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = createName(data.document_meta.name) + '.zip';
        link.click();

        function generateReadme() {
            return readme;
        }

        function generateIndexHTML(title: string) {
            return template.replace('<%title%>', title);
        }

        async function generateIndexJS() {
            const channel = (window as any).APP_VERSION_CHANNEL;
            let url = '/static/prototype/index.preview.prototype.js';
            if (channel) url = '/' + channel + url;
            const response = await fetch(url);
            if (response.status === 404) throw new MossError(t('publish.packaging_script_err'));
            else if (response.status !== 200 || !response.body) throw new MossError(t('publish.script_exception'));
            const reader = response.body.getReader();
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
            for (const p of data.pages) {
                folder.file(p.id + '.json', new Blob([JSON.stringify(p)]));
            }
        }

        async function generateImages(folder: JSZip, context: Context) {
            if (!data.media_names.length) return;
            commit(1, t('publish.download_images'));
            await __ease();
            const manager = context.data.mediasMgr;
            for (const ref of data.media_names) {
                const media = await manager.get(ref);
                if (!media) continue;
                folder.file(ref, media.buff);
            }
        }

        function __ease() {
            return new Promise((resolve) => {
                let timer: any = setTimeout(() => {
                    resolve(true);
                    clearTimeout(timer);
                    timer = null;
                }, 300 * Math.random());
            });
        }
    }
}