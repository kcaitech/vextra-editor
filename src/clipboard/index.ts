import { Context } from "@/context";
import { ShapeView } from "@kcdesign/data";

const identity = 'design.moss';
const paras = 'design.moss/paras';
const properties = 'design.moss/properties';

interface Bundle {
    HTML?: string;
    plain?: string;
    base64?: string;
    fileInfo?: {
        name?: string;
        height?: number;
        width?: number;
    }
}
export class Clipboard {
    static MIME = ['image/png', 'text/html', 'text/plain'];
    private context: Context;
    private cache: Bundle | undefined;
    constructor(context: Context) {
        this.context = context;
    }

    private encode(target: ShapeView[]) {
    }

    private decode() {
    }

    /**
     * @description 先读同步，再读异步
     */
    async read(event?: ClipboardEvent) {
        const bundle: Bundle = {};
        if (event) {
            const items = event.clipboardData?.items;
            if (items) for (const item of items) {
                if (item.kind === "file") {
                    const file = item.getAsFile()!;
                    const result = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (event) => resolve(event.target!.result as string);
                        reader.readAsDataURL(file);
                    });
                    result && (bundle["base64"] = result);
                } else if (item.kind === "string") {
                    const result = await new Promise<string>(resolve => {
                        item.getAsString((result) => resolve(result));
                    });
                    if (item.type === "text/html") bundle["HTML"] = result;
                    else bundle["plain"] = result;
                }
            }
        }
        if (navigator.clipboard.read) for (const item of await navigator.clipboard.read()) for (const type of item.types) {
            if (type === "text/html") {
                const blob = await item.getType("text/html");
                bundle["HTML"] = await blob.text();
            } else if (type === "text/plain") {
                const blob = await item.getType("text/plain");
                bundle["plain"] = await blob.text();
            } else if (type.includes("image")) {
                const blob = await item.getType(type);
                bundle["base64"] = await new Promise<string>(resolve => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target!.result as string);
                    reader.readAsDataURL(blob);
                })
            }
        }

        this.cache = bundle;

        return bundle;
    }

    init() {
    }

    destroy() {
    }
}