import { Context } from "@/context"
import { Parser } from "./paser"
import { XY } from "@/context/selection";

export function parse(content: string) {
    const parser = new DOMParser()
    const svgDocument = parser.parseFromString(content, "image/svg+xml")
    const svgElement = svgDocument.documentElement
    const svgParser = new Parser(svgElement)
    return {
        shape: svgParser.parse(),
        mediaResourceMgr: svgParser.context.mediaResourceMgr,
    }
}
