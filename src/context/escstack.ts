import { Watchable } from "@kcdesign/data";
export interface EscItem {
  name: string
  f: Function;
}
export class EscStack extends Watchable(Object) {
  private m_stack: EscItem[] = [];
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

  add(name: string, f: Function) {
    this.m_stack.push({ name, f });
    this.m_stack_map.set(name, f);
  }
  remove(name: string) {
    const idx = this.m_stack.findIndex(i => i.name = name);
    if (idx > -1) this.m_stack.splice(idx, 1);
    this.m_stack_map.delete(name);
  }

  excute() {
    const i = this.m_stack.pop();
    if (i) i.f();
  }

  clear_stack() { }
}