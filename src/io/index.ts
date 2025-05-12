/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import { exportExForm, importVext, TransactDataGuard } from "@kcdesign/data";
import JSZip from "jszip";
import { BasicError } from "@/basic/error";
import { ContextEnvironment } from "@/openapi";

export async function _exportDocument(context: Context) {
    const __data = context.data;
    const data = await exportExForm(__data)
        .catch((error) => {
            throw error
        });
    if (!data) throw new Error('invalid data');
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
    const zip = new JSZip();
    zip.file('document-meta.json', new Blob([JSON.stringify(data.document_meta)]));
    packPages(zip.folder('pages')!);
    await packImages(zip.folder('images')!);
    return await zip.generateAsync({ type: 'blob' });
}

export async function exportDocument(context: Context) {
    const content = await _exportDocument(context);
    const name = context.data.name;
    const reg = new RegExp('(.sketch|.fig|.vext|.moss)$', 'img');
    // if (context.env === ContextEnvironment.Client) {
        downloadByLink(content, name.replace(reg, '') + '.vext');
    // } else {
    //     downloadByLink(content, name.replace(reg, '') + '.moss');
    // }
}

export function downloadByLink(content: Blob, name: string) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
}

export async function importDocumentFromMDD(filePack: File, repo: TransactDataGuard) {
    const __files = await getFiles() as {
        [p: string]: JSZip.JSZipObject
    };
    const names = Object.keys(__files);
    const __doc: {
        [p: string]: string | Uint8Array | ArrayBuffer;
    } = {};
    for (let name of names) {
        const file = __files[name];
        if (file.dir) continue;
        let type: 'string' | 'arraybuffer' = 'string';
        if (name.startsWith('images')) type = 'arraybuffer';
        let content: string | Uint8Array | ArrayBuffer = await file.async(type);
        if (type === "arraybuffer") {
            content = new Uint8Array(content as ArrayBuffer);
        }
        if (name.startsWith('pages')) name = name.replace('.json', '');
        __doc[name.replace(/images\/|pages\//, '')] = content;
    }

    return importVext(filePack.name.replace(/\.(moss|vext)$/i, ''), __doc as { [p: string]: string | Uint8Array; }, repo);

    function getFiles() {
        const reader = new FileReader();
        reader.readAsArrayBuffer(filePack);
        return new Promise((resolve, reject) => {
            reader.onload = (event) => {
                const buff = event.target!.result as ArrayBuffer;
                if (!buff) reject(new BasicError('无法获取文档内容'));
                const zip = new JSZip();
                zip.loadAsync(buff).then(res => {
                    resolve(res.files)
                });
            }
        });
    }
}