import { IPlugin, PluginLocate } from "../openapi";

export class PluginsMgr {

    private _plugins: Map<string, IPlugin[]> = new Map();

    regist(...plugins: IPlugin[]) {
        plugins.forEach(p => {
            let arr = this._plugins.get(p.locate);
            if (!arr) {
                arr = [];
                this._plugins.set(p.locate, arr);
            }
            arr.push(p);
        })
    }
    search(locate: PluginLocate): IPlugin[] {
        const arr = this._plugins.get(locate);
        return arr || []
    }

    search2(locate: PluginLocate): { begin: IPlugin[], end: IPlugin[] } {
        const begin: IPlugin[] = [];
        const end: IPlugin[] = [];
        this.search(locate).forEach((p) => {
            if (p.align === 'begin') begin.push(p);
            else end.push(p);
        })
        return { begin, end }
    }
}