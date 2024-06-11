// import * as users_api from "@/request/users";
// import * as base64 from "js-base64";

let visibilityTimer: ReturnType<typeof setInterval> | Parameters<typeof clearInterval>[0] = undefined;

async function refreshToken() {
    // const jwt = localStorage.getItem("token");
    // if (!jwt) return;
    // const jwtSplitRes = jwt.split(".");
    // if (jwtSplitRes.length !== 3) return;
    // try {
    //     const r = base64.decode(jwtSplitRes[1]);
    //     const jwtPayload = JSON.parse(r);
    //     const expRemain = (jwtPayload.exp ?? 0) * 1000 - Date.now();
    //     if (expRemain <= 0 || expRemain >= 1000 * 60 * 60) return;
    //     const res = await users_api.RefreshToken();
    //     if (res.code === 0 && res.data.token) localStorage.setItem("token", res.data.token);
    // } catch (e) {
    //     console.log("refresh token error", e);
    // }
}

export function startRefreshTokenTask(interval: number = 1000 * 3) {
    if (visibilityTimer) stopRefreshTokenTask();
    refreshToken();
    visibilityTimer = setInterval(() => document.visibilityState === "visible" && refreshToken(), interval);
}

export function stopRefreshTokenTask() {
    clearInterval(visibilityTimer)
    visibilityTimer = undefined;
}