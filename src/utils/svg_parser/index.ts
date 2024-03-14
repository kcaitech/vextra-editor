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

/**
 * @deprecated
 */
export function insert(context: Context, svgString: string, xy?: XY) {
    const parser = new DOMParser()
    const svgDocument = parser.parseFromString(svgString, "image/svg+xml")
    const svgElement = svgDocument.documentElement
    const svgParser = new Parser(svgElement)
    const shape = svgParser.parse()
    const page = context.selection.selectedPage?.data
    const repo = context.coopRepo
    if (shape && page) {
        const api = repo.start("parseSvgInsert")
        try {
            api.shapeInsert(context.data, page, page, shape, page.childs.length)
            repo.commit()
        } catch (error) {
            console.log(error)
            repo.rollback()
        }
    }
}

export function maySvgText(content: string) {
    if (content.length < 11) {
        return false;
    }

    return (content.search(/<svg|<?xml/) > -1) && (new RegExp('</svg>').test(content.slice(content.length - 6).toLowerCase()));
}
