import * as boolop from "@pal/pathop";
import { Zip } from "@pal/zip"
import { getTextPath } from "@/textpath";
import { pal } from "@kcdesign/data"
import { measure } from "@/layout/text/measure";

export async function initpal() {
    await boolop.init();
    pal.boolop = boolop;

    pal.text.getTextPath = getTextPath;
    pal.text.textMeasure = measure;

    pal.unzip = (file: File | string) => {
        return new Zip(file);
    }
}
