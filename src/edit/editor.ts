import { IDocEdit, IPageEdit } from "@/data/iedit";
import { Page } from "@/data/page";
import { Shape, GroupShape } from "@/data/shape";

export class DocEditor implements IDocEdit {

    delete(page: Page): boolean {
        throw new Error("Method not implemented.");
    }
    insert(index: number, page: Page): boolean {
        throw new Error("Method not implemented.");
    }
    create(): Page {
        throw new Error("Method not implemented.");
    }
    modify(page: Page, attribute: string, value: any): boolean {
        throw new Error("Method not implemented.");
    }
    move(page: Page, index: number): boolean {
        throw new Error("Method not implemented.");
    }
}

export class PageEditor implements IPageEdit {

    delete(shape: Shape): boolean {
        throw new Error("Method not implemented.");
    }
    insert(parent: GroupShape, index: number, shape: Shape): boolean {
        throw new Error("Method not implemented.");
    }
    create(parent: GroupShape, type: string): Shape {
        throw new Error("Method not implemented.");
    }
    modify(shape: Shape, attribute: string, value: any): boolean {
        throw new Error("Method not implemented.");
    }
    move(shape: Shape, target: GroupShape, index: number): boolean {
        throw new Error("Method not implemented.");
    }
    group(shapes: Shape[]): boolean {
        throw new Error("Method not implemented.");
    }
    ungroup(shape: Shape): boolean {
        throw new Error("Method not implemented.");
    }
}