import { Context } from "@/context";
import { exportExForm, Repository, importMoss } from "@kcdesign/data";
import JSZip from "jszip";
import { MossError } from "@/basic/error";

export async function exportDocument(context: Context) {
    const __data = context.data;
    const data = await exportExForm(__data)
        .catch((error) => {
            throw error
        });
    if (!data) throw new Error('invalid data');

    const MDD = new JSZip();
    const documentBlob = new Blob([JSON.stringify(data.document_meta)]);
    MDD.file('document-meta.json', documentBlob);
    const PAGES = MDD.folder('pages')!;
    packPages(PAGES);
    const IMAGES = MDD.folder('images')!;
    await packImages(IMAGES);

    const content = await MDD.generateAsync({ type: 'blob' });
    downloadByLink(content, data.document_meta.name + '.mdd');

    function packPages(folder: JSZip) {
        for (const page of data.pages) {
            const blob = new Blob([JSON.stringify(page)]);
            folder.file(page.id + '.json', blob);
        }
    }

    async function packImages(folder: JSZip) {
        if (!data.media_names.length) return;
        const manager = context.data.mediasMgr;
        for (const ref of data.media_names) {
            const media = await manager.get(ref);
            if (!media) continue;
            folder.file(ref, media.buff);
        }
    }
}

export function downloadByLink(content: Blob, name: string) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
}

export async function importDocumentFromMDD(filePack: File, repo: Repository) {
    const __files = await getFiles() as {
        [p: string]: JSZip.JSZipObject
    };
    const names = Object.keys(__files);
    const __doc: {
        [p: string]: string | Uint8Array | ArrayBuffer
    } = {};
    for (let name of names) {
        const file = __files[name];
        if (file.dir) continue;
        let type: 'string' | 'arraybuffer' = 'string';
        if (name.startsWith('images')) type = 'arraybuffer';
        let content: string | Uint8Array | ArrayBuffer = await file.async(type);
        if (type === "arraybuffer") {
            content = new Uint8Array(content as Uint8Array);
        }
        if (name.startsWith('pages')) {
            name = name.replace('.json', '');
        }
        __doc[name.replace(/images\/|pages\//, '')] = content;
    }

    return importMoss(__doc as { [p: string]: string | Uint8Array; }, repo);

    function getFiles() {
        const reader = new FileReader();
        reader.readAsArrayBuffer(filePack);
        return new Promise((resolve, reject) => {
            reader.onload = (event) => {
                const buff = event.target!.result as ArrayBuffer;
                if (!buff) reject(new MossError('无法获取文档内容'));
                const zip = new JSZip();
                zip.loadAsync(buff).then(res => {
                    resolve(res.files)
                });
            }
        });
    }
}