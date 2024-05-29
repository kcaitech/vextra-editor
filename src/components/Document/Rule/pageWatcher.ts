import { ReferUnit } from "@/components/Document/Rule/refer";
import { PageView, ShapeView } from "@kcdesign/data";

export class ReferUnderContainerHandler {
    private readonly m_units: ReferUnit[];
    private readonly m_page: PageView;

    constructor(units: ReferUnit[], page: PageView) {
        this.m_units = units;
        this.m_page = page;
    }

    // 已监听的Container对象
    underRootContainerMap = new Map<string, ShapeView>();
    // 对象监听卸载函数集合
    watcherUninstallerMap = new Map<string, () => void>();

    /**
     * @description 更新指定Container的参考线绘制
     */
    updateContainerLineRender(id: string, args: any) {
        if (!(args && args?.includes('layout'))) {
            return;
        }

        // 寻找修改对象
        const units = this.m_units;
        let unit: ReferUnit | undefined = undefined;

        for (let i = 0; i < units.length; i++) {
            const u = units[i];
            if (u.id === id) {
                unit = u as ReferUnit;
                break;
            }
        }

        if (!unit) {
            return;
        }
    }

    /**
     * @description 更新监听目标
     */
    updateUnderRootContainerMap() {
        const page = this.m_page;
        const children = page.childs;
        const URCM = this.underRootContainerMap;
        const WUM = this.watcherUninstallerMap;
        const UCLR = this.updateContainerLineRender.bind(this);

        URCM.clear();

        for (let i = 0; i < children.length; i++) {
            const c = children[i];
            if (!c.isContainer || (c.rotation || 0) % 180) {
                continue;
            }
            URCM.set(c.id, c);
            if (!WUM.has(c.id)) {
                WUM.set(c.id, c.watch((...args) => {
                    UCLR(c.id, args)
                }));
            }
        }

        WUM.forEach((stopFunc, key) => {
            if (!URCM.has(key)) {
                stopFunc();
                WUM.delete(key);
            }
        })

        console.log('update:', URCM.size, WUM.size);
    }

    clearContainerWatcher() {
        this.watcherUninstallerMap.forEach((stopFunc) => {
            stopFunc();
        })
        this.watcherUninstallerMap.clear();
    }
}