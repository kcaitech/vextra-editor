import i18n from '@/i18n'

interface IKcDesk {
    // os
    osOpenFile(localfile: string): Promise<File | undefined>;

    // view
    getViewId(): number;

    // files
    fileCloseSelf(): void; // 关闭自己
    fileShow(viewid: number): void; // 切换文档
    fileOpen(id: string, name: string, args: string): void; // 打开文档或者切换到对应文档
    fileOpenLocal(filter: string): void; // 打开文档或者切换到对应文档

    setNewFileName(name: string): void;
    fileNew(): void;
}


const _desk_secret = 'kcdesk_07444f3a-343d-45a7-bd37-635fc9a26871';
const _kcdesk = ((window as any)[_desk_secret]) as IKcDesk | undefined;
export default _kcdesk;

if (_kcdesk) {
    // @ts-ignore
    const name = i18n.global.t('system.new_file');
    _kcdesk.setNewFileName(name);
}
