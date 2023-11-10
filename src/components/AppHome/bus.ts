interface List {
    [key: string]: Array<Function>
}

interface BusType {
    on: (name: string, fn: Function) => void;
    emit: (name: string, ...args: Array<any>) => void;
    off: (name: string, fn: Function) => void;
    once: (name: string, fn: Function) => void;
}

class Bus implements BusType {
    list: List
    constructor() {
        this.list = {}
    }
    on(name: string, fn: Function) {
        let callback: Array<Function> = this.list[name] || []
        if (callback && fn) {
            const index = callback.findIndex(fns => fns === fn)
            callback.splice(index, 1)
        }
        callback.push(fn)
        this.list[name] = callback 
    }
    emit(name: string, ...args: Array<any>) {
        let callback: Array<Function> = this.list[name]
        if (callback) {
            callback.forEach((fn) => { fn(...args) });
        } else {
            console.log('名称错误')
        }
    }
    off(name: string, fn: Function) {
        let callback: Array<any> = this.list[name]
        if (callback && fn) {
            const index = callback.findIndex(fns => fns === fn)
            callback.splice(index, 1)
        } else {
            console.log('名称错误');
        }
    }
    once(name: string, fn: Function) {
        let temporary = (...args: Array<any>) => {
            fn.apply(this,args)
            this.off(name, temporary)
        }
        this.on(name, temporary)
    }
}


export default new Bus()