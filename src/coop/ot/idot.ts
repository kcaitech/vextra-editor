enum OpType {
    id_none,
    id_insert,
    id_remove,
}

interface Op {
    get type(): OpType;
}

class OpIdNone implements Op {
    get type(): OpType {
        return OpType.id_none;
    }
}

class OpIdInsert implements Op {
    get type(): OpType {
        return OpType.id_insert;
    }
}

class OpIdRemove implements Op {
    get type(): OpType {
        return OpType.id_remove;
    }
}