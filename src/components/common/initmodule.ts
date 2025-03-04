import { measure } from "@/layout/text/measure";
import { initModule } from "@kcdesign/data";
import { text2path } from "@kcdesign/text2path";

let __inited: boolean = false;

export async function initDataModule() {
    if (__inited) return;

    initModule(measure, text2path)

    __inited = true;
}
