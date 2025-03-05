import { Bundle } from "@/clipboard";
import { svgParser as SVGParse } from "@kcdesign/data";
import { Reader } from "@/clipboard/read/reader";
import { Context } from "@/context";

export class NavigatorClipboardReader extends Reader {
    constructor(context: Context) {
        super(context);
    }

    async read(bundle: Bundle) {
        if (Object.keys(bundle).length || !navigator.clipboard.read) return;
        for (const item of await navigator.clipboard.read()) for (const type of item.types) {
            if (type === "text/html") {
                const blob = await item.getType("text/html");
                bundle["HTML"] = await blob.text();
            } else if (type === "text/plain") {
                const blob = await item.getType("text/plain");
                const text = await blob.text();
                if (this.maySvgText(text)) {
                    const svg = SVGParse.parse(text);
                    const svgs = bundle["SVG"];
                    svgs ? svgs.push(svg) : bundle["SVG"] = [svg];
                } else bundle["plain"] = text;
            } else if (type.includes("image")) {
                const blob = await item.getType(type);
                const base64 = await new Promise<{
                    name: string,
                    base64: string
                }>(resolve => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve({ name: this.context.workspace.t('shape.image'), base64: e.target!.result as string });
                    reader.readAsDataURL(blob);
                });
                const size = await new Promise<{
                    width: number,
                    height: number
                }>(resolve => {
                    const img = new Image();
                    img.src = URL.createObjectURL(blob);
                    img.onload = () => resolve({ width: img.width, height: img.height });
                });
                if (size && base64) {
                    const images = bundle["images"];
                    images ? images.push(Object.assign(size, base64)) : bundle["images"] = [Object.assign(size, base64)];
                }
            }
        }
    }
}