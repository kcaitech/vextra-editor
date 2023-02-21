export namespace idot {
    enum OpType {
        id_none,
        id_insert,
        id_remove,
    }

    interface Op {
        get type(): OpType;
    }

    export class OpIdNone implements Op {
        get type(): OpType {
            return OpType.id_none;
        }
        private _unit_order: number;
        constructor(unitOrder: number) {
            this._unit_order = unitOrder;
        }
        get unit_order() {
            // 返回对用户有唯一顺序的数据，如登陆时间、用户id等
            // 用于在插入位置一样时，判断将哪个插入在前
            return this._unit_order
        }
    }

    export class OpIdInsert implements Op {
        get type(): OpType {
            return OpType.id_insert;
        }
    }

    export class OpIdRemove implements Op {
        get type(): OpType {
            return OpType.id_remove;
        }
    }
}