import { Watchable } from "@kcdesign/data";
export enum TaskType {
  TOOL = 'tool',
  MENU = 'menu',
  EDIT = 'edit',
  WINDOW = 'window'
}
export interface EscItem {
  name: TaskType
  call: () => boolean;
}
export class EscStack extends Watchable(Object) {
  private m_stack_map: Map<string, Function> = new Map();
  constructor() {
    super();
  }

  keyboardHandle(event: KeyboardEvent) {
    const { code, shiftKey } = event;
    if (code !== 'Escape') return;
    if (shiftKey) {
      this.clear_stack();
    } else {
      this.excute();
    }
  }

  push(task: TaskType, call: Function) {
    if (this.m_stack_map.get(task)) { // 先删后加，保持先来的后出
      this.m_stack_map.delete(task);
    }
    this.m_stack_map.set(task, call);
  }

  remove(task: TaskType) {
    this.m_stack_map.delete(task);
  }

  excute() {
    const queue = Array.from(this.m_stack_map.keys());
    let result: boolean = false;
    while (!result && queue.length) {
      const task = queue.pop();
      if (!task) continue;
      const call = this.m_stack_map.get(task);
      this.m_stack_map.delete(task);
      if (typeof call !== 'function') break;
      result = call();
    }
  }

  clear_stack() {
    const queue = Array.from(this.m_stack_map.values());
    let result: boolean = false;
    while (queue.length) {
      const f = queue.pop();
      if (typeof f !== 'function') continue;
      result = f();
    }
  }
}