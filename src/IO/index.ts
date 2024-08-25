import { Context } from "@/context";
import { exportExForm } from "@kcdesign/data";
import JSZip from "jszip";

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

    const content = await MDD.generateAsync({type: 'blob'});
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