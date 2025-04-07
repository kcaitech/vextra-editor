// shapeid -> records

export class ShapeRecords {
    private _shapes: { [key: string]: { idx: number, len: number } } = {}

    getShape(id: string): { idx: number, len: number } | undefined {
        return this._shapes[id]
    }
    putShape(id: string, record: { idx: number, len: number }) {
        this._shapes[id] = record
    }
}