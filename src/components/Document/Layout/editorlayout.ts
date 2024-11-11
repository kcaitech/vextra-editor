import { Context } from "@/context";

export type EditorGUI = {
    top: boolean;
    left: boolean;
    right: boolean;
    leftTrigger: boolean;
    rightTrigger: boolean;
};

export class EditorLayout {
    private m_context: Context;
    private m_layout: EditorGUI | undefined;
    private m_next: string;

    constructor(context: Context) {
        this.m_context = context;
        this.m_next = context.workspace.t('layout.hideUI');
    }

    set gui(gui: EditorGUI) {
        this.m_layout = gui;
    }

    private modifyNext() {
        if (!this.m_layout) return;
        if (this.m_layout.left && this.m_layout.right && this.m_layout.top) {
            this.m_next = this.m_context.workspace.t('layout.hideUI');
        } else {
            this.m_next = this.m_context.workspace.t('layout.showUI');
        }
    }

    right(t?: boolean) {
        if (!this.m_layout) return;
        this.m_layout.right = t ?? !this.m_layout.right;
        this.modifyNext();
    }

    left(t?: boolean) {
        if (!this.m_layout) return;
        this.m_layout.left = t ?? !this.m_layout.left;
        this.modifyNext();
    }

    side() {
        if (!this.m_layout) return;
        if (this.m_layout.left !== this.m_layout.right) {
            this.m_layout.left = this.m_layout.right = true;
        } else if (this.m_layout.left) {
            this.m_layout.left = this.m_layout.right = false;
        } else {
            this.m_layout.left = this.m_layout.right = true;
        }
        this.modifyNext();
    }

    all() {
        if (!this.m_layout) return;
        if (!this.m_layout.left || !this.m_layout.right || !this.m_layout.top) {
            this.m_layout.left = this.m_layout.right = this.m_layout.top = true;
        } else {
            this.m_layout.left = this.m_layout.right = this.m_layout.top = false;
        }
        this.modifyNext();
    }

    get next() {
        return this.m_next;
    }
}