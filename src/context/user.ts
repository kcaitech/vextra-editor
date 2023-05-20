import { Watchable } from "@kcdesign/data";
interface userInfo {
    id: number
    nickname: string
    avatar: string
}
export class User extends Watchable(Object) {
    private m_username: string = ''
    private m_userinfo: userInfo;
    constructor(info: userInfo) {
        super();
        this.m_userinfo = info;
    }
    setUserName(name: string) {
        this.m_userinfo.nickname = name;
    }
    get userName() {
        return this.m_username;
    }
    get userInfo(){
        return this.m_userinfo;
    }
}