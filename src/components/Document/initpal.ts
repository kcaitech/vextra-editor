import * as boolop from "@pal/pathop";
import { Zip } from "@pal/zip"
import { getTextPath } from "@/textpath";
import { gPal } from "@kcdesign/data"
import { measure } from "@/layout/text/measure";

export async function initpal() {
    await boolop.init();
    gPal.boolop = boolop;

    gPal.text.getTextPath = getTextPath;
    gPal.text.textMeasure = measure;

    gPal.unzip = (file: File | string) => {
        return new Zip(file);
    }
}
