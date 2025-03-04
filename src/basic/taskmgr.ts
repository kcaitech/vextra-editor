/**
 * 大的先执行
 */
export enum TaskPriority {
    normal = 0,
    requestdata = 1,
}

export interface Task {
    isValid(): boolean;
    isDone(): boolean;
    run(): Promise<void>;
}

export class TaskMgr {
    private __tasks: { task: Task, priority: TaskPriority }[] = [];
    private __started: boolean = false;
    private __timer: any | undefined;

    constructor() {
        this.__intervalRun = this.__intervalRun.bind(this);
    }

    private __sort() {
        this.__tasks.sort((a, b) => b.priority - a.priority)
    }

    private __popTask(task: Task) {
        if (this.__tasks.length > 0 && this.__tasks[0].task === task) {
            this.__tasks.splice(0, 1);
        }
    }

    private __next() {
        this.__timer = setTimeout(this.__intervalRun, 0);
    }

    private async __intervalRun() {
        if (this.__tasks.length === 0) {
            // clearInterval(this.__timer);
            this.__timer = undefined;
            return;
        }
        this.__sort();
        const task = this.__tasks[0].task;
        if (!task.isValid()) {
            this.__popTask(task);
            this.__next();
            return;
        }
        await task.run();
        if (task.isDone()) {
            this.__popTask(task);
        }
        this.__next();
    }

    add(task: Task, priority: TaskPriority) {
        const val = { task, priority };
        this.__tasks.push(val);

        if (this.__started && !this.__timer) {
            this.__next();
        }

        const _this = this;
        return {
            remove() {
                const idx = _this.__tasks.indexOf(val);
                if (idx >= 0) _this.__tasks.splice(idx, 0);
            }
        }
    }

    startLoop() {
        if (this.__started) return;
        this.__started = true;
        if (this.__tasks.length > 0) {
            this.__next();
        }
    }
}