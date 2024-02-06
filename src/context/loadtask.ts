import { Document, SymbolShape, Task, TaskMgr, TaskPriority } from "@kcdesign/data";

export function startLoadTask(data: Document, taskMgr: TaskMgr) {
    const pagelist = data.pagesList.slice(0);
        const checkSymLoaded: (() => boolean)[] = [];
        const pageloadTask = new class implements Task { // page auto loader
            isValid(): boolean {
                return !this.isDone();
            }

            isDone(): boolean {
                return pagelist.length <= 0;
            }

            async run(): Promise<void> {
                let id;
                while (pagelist.length > 0) {
                    const i = pagelist[0];
                    if (data.pagesMgr.getSync(i.id)) {
                        pagelist.splice(0, 1);
                    } else {
                        id = i.id;
                        break;
                    }
                }
                if (id) {
                    await data.pagesMgr.get(id);
                    pagelist.splice(0, 1);
                    for (let i = 0; i < checkSymLoaded.length;) {
                        if (checkSymLoaded[i]()) {
                            checkSymLoaded.splice(i, 1);
                        } else {
                            ++i;
                        }
                    }
                }
            }
        }

        taskMgr.add(pageloadTask, TaskPriority.normal);

        let hasLoadFreeSymbols = false;
        const freesymbolTask = new class implements Task {
            
            isValid(): boolean {
                return true;
            }
            isDone(): boolean {
                return hasLoadFreeSymbols;
            }
            async run(): Promise<void> {
                const loader = data.__freesymbolsLoader;
                loader && await loader();
                hasLoadFreeSymbols = true;
                for (let i = 0; i < checkSymLoaded.length;) {
                    if (checkSymLoaded[i]()) {
                        checkSymLoaded.splice(i, 1);
                    } else {
                        ++i;
                    }
                }
            }
        }
        taskMgr.add(freesymbolTask, TaskPriority.normal);

        taskMgr.startLoop();

        // symbol loader
        data.symbolsMgr.setLoader(async (id: string): Promise<SymbolShape> => {
            return new Promise((resolve, reject) => {
                checkSymLoaded.push(() => {
                    const sym = data.symbolsMgr.getSync(id);
                    if (sym) resolve(sym);
                    else if (pageloadTask.isDone()) reject();
                    else return false;
                    return true;
                })
            })
        })
}