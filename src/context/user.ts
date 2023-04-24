import { Watchable } from "@kcdesign/data/data/basic";

export class User extends Watchable(Object) {
    private m_username: string = ''
    constructor() {
        super();
    }
    setUserName(name: string) {
        this.m_username = name;
    }
    get userName() {
        return this.m_username;
    }
}