import i18n from '@/i18n'
import { router } from './router';

interface IKcDesk {
    // os
    osOpenFile(localfile: string): Promise<File | undefined>;
    osPlatform(): string;

    // window
    winClose(): void; // 关闭窗口
    winMinimize(): void; // 最小化窗口
    winToggleMaximize(): void; // 切换最大化
    // getViewId(): number;

    // files
    fileGetList(): Promise<{ list: { name: string, viewid: number }[], active: number }>; // 打开文件列表
    fileWatchList(watcher: (infos: { list: { name: string, viewid: number }[], active: number }) => void): void;
    fileClose(viewid: number): void; // 关闭文档
    fileShow(viewid: number): void; // 切换文档
    fileSetName(viewid: number, name: string): void;
    // fileCloseSelf(): void;

    fileMove(viewid: number, index: number): void; // 移动文档位置
    fileOffsetList(offset: number): void; // 文件列表偏移
    fileGetListOffset(): number; // 文件列表偏移
    fileOpen(id: string, name: string, args: string): void; // 打开文档或者切换到对应文档
    fileOpenLocal(filter: string): void; // 打开文档或者切换到对应文档

    setNewFileName(name: string): void;
    fileNew(): void;

    setRouterAcceptor(acceptor: (rout: { path: string, query: { [key: string]: any } }) => void): void;
}

function getQuerys(): { [key: string]: any } {
    if (!window.location.search) return {};
    const params = window.location.search.substring(1);
    const lists = params.split("&");
    const querys: { [key: string]: any } = {};
    for (let i = 0, len = lists.length; i < len; ++i) {
        const item = lists[i];
        const idx = item.indexOf('=');
        const key = idx < 0 ? item : item.substring(0, idx);
        const val = idx < 0 ? '' : item.substring(idx + 1);
        querys[key] = decodeURIComponent(val);
    }
    return querys;
}

class KcDeskContext {
    // 本地上下文

    _api: IKcDesk;
    _querys: { [key: string]: any };
    _routeacept: (rout: { path: string; query: { [key: string]: any; }; }) => void;
    constructor(api: IKcDesk) {
        this._api = api;

        // init
        // @ts-ignore
        const name = i18n.global.t('system.new_file');
        api.setNewFileName(name);

        this._querys = getQuerys();

        this._routeacept = (rout: { path: string; query: { [key: string]: any; }; }): void => {
            delete this._querys['prepare'];

            // 更新querys
            for (let key of Object.keys(rout.query)) {
                if (Object.prototype.hasOwnProperty.call(rout.query, key)) {
                    const val = rout.query[key];
                    this._querys[key] = val;
                }
            }
            // router.push(rout);
            router.replace(rout);


        }
        this._api.setRouterAcceptor(this._routeacept);
    }
    osOpenFile(localfile: string): Promise<File | undefined> {
        return this._api.osOpenFile(localfile);
    }

    getViewId(): number {
        return this._querys['viewid'] || -1;
    }
    fileCloseSelf(): void {
        const viewid = this._querys['viewid'] || -1;
        if (viewid > 0) this._api.fileClose(viewid);
    }
    fileShow(viewid: number): void {
        return this._api.fileShow(viewid);
    }
    fileOpen(id: string, name: string, args: string): void {
        return this._api.fileOpen(id, name, args);
    }
    fileOpenLocal(filter: string): void {
        return this._api.fileOpenLocal(filter);
    }

    fileNew(): void {
        return this._api.fileNew();
    }
    // setRouterAcceptor(acceptor: (rout: { path: string; query: { [key: string]: any; }; }) => void): void {
    //     this._routeracceptor = acceptor;
    // }

    isPrepareView() {
        return this._querys['prepare'] !== undefined;
    }

    fileSetName(name: string) {
        const viewid = this.getViewId();
        if (viewid > 0) this._api.fileSetName(viewid, name);
    }

    // 其它本地数据

}


const _desk_guid = '07444f3a-343d-45a7-bd37-635fc9a26871';
const _kcdesk = ((window as any)[_desk_guid]) as IKcDesk | undefined;
const kcdesk = _kcdesk ? new KcDeskContext(_kcdesk) : undefined;
export default kcdesk;

// watch title
// if (kcdesk) {
//     const title = document.querySelector('title');
//     if (title) {
//         const observer = new MutationObserver(function () {
//             const title = document.title.split(' ')[0];
//             kcdesk.onTitleChange(title);
//         });
//         observer.observe(title, {
//             subtree: true,
//             characterData: true,
//             childList: true,
//         });
//     }
// }