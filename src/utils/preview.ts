import kcdesk from "@/kcdesk";
import { Context } from '@/context';
import { ElMessage } from 'element-plus';
import { PageView, ShapeType } from "@kcdesign/data";

export function open_preview(doc_id: string, context: Context, artboardId?: string) {
    const page = context.selection.selectedPage;
    if (!page) return;
    if (!page.artboardList.length) {
        ElMessage.error({ duration: 3000, message: '当前页面没有可预览内容' })
        return;
    }
    const artboard = page.artboardList[0];
    const frame_id = artboardId ? artboardId : artboard.id;
    const href = `${window.location.href.split('?')[0]}?id=${doc_id}&page_id=${page.id.slice(0, 8)}&frame_id=${frame_id.slice(0, 8)}`;
    const url = href.replace(/document/, 'prototype');
    const p_window = context.preview.previewWindow;

    if (p_window && !p_window.closed) {
        p_window.location.href = url;
        p_window.focus();
    } else {
        const newWindow = window.open(url);
        if (newWindow) context.preview.setPreviewWindow(newWindow);
    }
    return true;
}

export function getFrameList(page: PageView) {
    return page.childs.filter(item => item.type === ShapeType.Artboard || item.type === ShapeType.Symbol || item.type === ShapeType.SymbolRef);
}
