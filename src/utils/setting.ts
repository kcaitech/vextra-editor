export const SCREEN_SIZE = {
    KEY: 'documentFullScreen',
    FULL: 'full',
    NORMAL: 'normal'
}; // 编辑器屏幕尺寸
export const WEAKEN_ANIMATION = false; // 弱化动画

export const SKIP_LOGIN = false; // 跳过登录过程，直接进入个人首页，开发使用

//上传下载接口
const production = true
export const FILE_UPLOAD = production ? 'wss://protodesign.cn/api/v1' : 'wss://192.168.0.10:10000/api/v1';
export const FILE_DOWNLOAD = production ? "https://storage.protodesign.cn" : "https://192.168.0.18:9000";
//请求根路径
export const BASE_URL = production ? 'https://protodesign.cn/api/v1' : 'https://192.168.0.10:10000/api/v1';