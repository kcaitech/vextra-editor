import { Shape, ResourceMgr } from "@kcdesign/data";
import { svgParser as parse_svg} from "@kcdesign/data";
import { Context } from "@/context";

export class Reader {
    protected context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    protected async SVGFileReader(file: File): Promise<{
        shape: Shape | undefined,
        mediaResourceMgr: ResourceMgr<{ buff: Uint8Array, base64: string }>
    }> {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(parse_svg.parse(event.target!.result as string));
            reader.readAsText(file);
        });
    }

    protected maySvgText(content: string) {
        return content.length > 10 && (content.search(/<svg|<?xml/img) > -1) && (new RegExp('</svg>', "img").test(content.slice(content.length - 10).toLowerCase()));
    }

}