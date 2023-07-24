/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../../node_modules/uuid/dist/esm-browser/native.js":
/*!**********************************************************!*\
  !*** ../../node_modules/uuid/dist/esm-browser/native.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\nconst randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);\n/* harmony default export */ __webpack_exports__[\"default\"] = ({\n  randomUUID\n});\n\n//# sourceURL=webpack://communication/../../node_modules/uuid/dist/esm-browser/native.js?");

/***/ }),

/***/ "../../node_modules/uuid/dist/esm-browser/regex.js":
/*!*********************************************************!*\
  !*** ../../node_modules/uuid/dist/esm-browser/regex.js ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i);\n\n//# sourceURL=webpack://communication/../../node_modules/uuid/dist/esm-browser/regex.js?");

/***/ }),

/***/ "../../node_modules/uuid/dist/esm-browser/rng.js":
/*!*******************************************************!*\
  !*** ../../node_modules/uuid/dist/esm-browser/rng.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ rng; }\n/* harmony export */ });\n// Unique ID creation requires a high quality random # generator. In the browser we therefore\n// require the crypto API and do not support built-in fallback to lower quality random number\n// generators (like Math.random()).\nlet getRandomValues;\nconst rnds8 = new Uint8Array(16);\nfunction rng() {\n  // lazy load so that environments that need to polyfill have a chance to do so\n  if (!getRandomValues) {\n    // getRandomValues needs to be invoked in a context where \"this\" is a Crypto implementation.\n    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);\n\n    if (!getRandomValues) {\n      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');\n    }\n  }\n\n  return getRandomValues(rnds8);\n}\n\n//# sourceURL=webpack://communication/../../node_modules/uuid/dist/esm-browser/rng.js?");

/***/ }),

/***/ "../../node_modules/uuid/dist/esm-browser/stringify.js":
/*!*************************************************************!*\
  !*** ../../node_modules/uuid/dist/esm-browser/stringify.js ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   unsafeStringify: function() { return /* binding */ unsafeStringify; }\n/* harmony export */ });\n/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validate.js */ \"../../node_modules/uuid/dist/esm-browser/validate.js\");\n\n/**\n * Convert array of 16 byte values to UUID string format of the form:\n * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX\n */\n\nconst byteToHex = [];\n\nfor (let i = 0; i < 256; ++i) {\n  byteToHex.push((i + 0x100).toString(16).slice(1));\n}\n\nfunction unsafeStringify(arr, offset = 0) {\n  // Note: Be careful editing this code!  It's been tuned for performance\n  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434\n  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();\n}\n\nfunction stringify(arr, offset = 0) {\n  const uuid = unsafeStringify(arr, offset); // Consistency check for valid UUID.  If this throws, it's likely due to one\n  // of the following:\n  // - One or more input array values don't map to a hex octet (leading to\n  // \"undefined\" in the uuid)\n  // - Invalid input values for the RFC `version` or `variant` fields\n\n  if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(uuid)) {\n    throw TypeError('Stringified UUID is invalid');\n  }\n\n  return uuid;\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (stringify);\n\n//# sourceURL=webpack://communication/../../node_modules/uuid/dist/esm-browser/stringify.js?");

/***/ }),

/***/ "../../node_modules/uuid/dist/esm-browser/v4.js":
/*!******************************************************!*\
  !*** ../../node_modules/uuid/dist/esm-browser/v4.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _native_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./native.js */ \"../../node_modules/uuid/dist/esm-browser/native.js\");\n/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rng.js */ \"../../node_modules/uuid/dist/esm-browser/rng.js\");\n/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./stringify.js */ \"../../node_modules/uuid/dist/esm-browser/stringify.js\");\n\n\n\n\nfunction v4(options, buf, offset) {\n  if (_native_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].randomUUID && !buf && !options) {\n    return _native_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].randomUUID();\n  }\n\n  options = options || {};\n  const rnds = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`\n\n  rnds[6] = rnds[6] & 0x0f | 0x40;\n  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided\n\n  if (buf) {\n    offset = offset || 0;\n\n    for (let i = 0; i < 16; ++i) {\n      buf[offset + i] = rnds[i];\n    }\n\n    return buf;\n  }\n\n  return (0,_stringify_js__WEBPACK_IMPORTED_MODULE_2__.unsafeStringify)(rnds);\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (v4);\n\n//# sourceURL=webpack://communication/../../node_modules/uuid/dist/esm-browser/v4.js?");

/***/ }),

/***/ "../../node_modules/uuid/dist/esm-browser/validate.js":
/*!************************************************************!*\
  !*** ../../node_modules/uuid/dist/esm-browser/validate.js ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./regex.js */ \"../../node_modules/uuid/dist/esm-browser/regex.js\");\n\n\nfunction validate(uuid) {\n  return typeof uuid === 'string' && _regex_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].test(uuid);\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (validate);\n\n//# sourceURL=webpack://communication/../../node_modules/uuid/dist/esm-browser/validate.js?");

/***/ }),

/***/ "./server.ts":
/*!*******************!*\
  !*** ./server.ts ***!
  \*******************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Server: function() { return /* binding */ Server; }\n/* harmony export */ });\n/* harmony import */ var _communication_types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/communication/types */ \"./types.ts\");\n/* harmony import */ var _utils_setting__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/utils/setting */ \"../utils/setting.ts\");\n\n\nfunction sleep(ms) {\n    return new Promise(resolve => setTimeout(resolve, ms));\n}\nclass Server {\n    token;\n    ws = undefined;\n    isConnected = false;\n    isConnecting = false;\n    connectPromise = undefined;\n    onmessage;\n    id = \"\";\n    constructor(token, onmessage) {\n        this.token = token;\n        this.onmessage = onmessage;\n    }\n    async connect() {\n        if (this.isConnected)\n            return true;\n        if (this.isConnecting && this.connectPromise)\n            return await this.connectPromise;\n        this.isConnecting = true;\n        let resolve = () => { };\n        this.connectPromise = new Promise(r => resolve = r);\n        try {\n            this.ws = new WebSocket(_utils_setting__WEBPACK_IMPORTED_MODULE_1__.COMMUNICATION_URL);\n            this.ws.binaryType = \"arraybuffer\";\n        }\n        catch (e) {\n            console.log(e);\n            this.ws = undefined;\n            resolve(false);\n            this.isConnecting = false;\n            return false;\n        }\n        await new Promise(resolve => this.ws.onopen = _ => resolve());\n        this.ws.send(JSON.stringify({\n            token: this.token,\n        }));\n        if (!await new Promise(resolve => {\n            this.ws.onmessage = (event) => {\n                try {\n                    const data = JSON.parse(event.data);\n                    if (data.cmd_type !== _communication_types__WEBPACK_IMPORTED_MODULE_0__.ServerCmdType.InitResult\n                        || typeof data.cmd_id !== \"string\" || data.cmd_id === \"\"\n                        || data.status !== _communication_types__WEBPACK_IMPORTED_MODULE_0__.CmdStatus.Success || !data.data?.communication_id) {\n                        resolve(false);\n                        return;\n                    }\n                    this.id = data.data.communication_id;\n                    resolve(true);\n                }\n                catch (e) {\n                    console.log(e);\n                    resolve(false);\n                }\n            };\n        })) {\n            this.ws = undefined;\n            resolve(false);\n            this.isConnecting = false;\n            return false;\n        }\n        this.ws.onmessage = this.onmessage.bind(this);\n        resolve(true);\n        this.isConnecting = false;\n        this.isConnected = true;\n        this.ws.onclose = event => {\n            this.isConnected = false;\n        };\n        return true;\n    }\n    async send(data) {\n        if (!this.isConnected) {\n            while (!await this.connect())\n                await sleep(1000);\n        }\n        this.ws.send(data);\n    }\n    async close() {\n        if (this.ws !== undefined) {\n            this.ws?.close();\n            this.ws = undefined;\n            this.isConnected = false;\n            this.isConnecting = false;\n        }\n        else if (this.isConnecting && this.connectPromise !== undefined) {\n            await this.connectPromise;\n            await this.close();\n        }\n    }\n}\n\n\n//# sourceURL=webpack://communication/./server.ts?");

/***/ }),

/***/ "./tunnel.ts":
/*!*******************!*\
  !*** ./tunnel.ts ***!
  \*******************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Tunnel: function() { return /* binding */ Tunnel; }\n/* harmony export */ });\n/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! uuid */ \"../../node_modules/uuid/dist/esm-browser/v4.js\");\n/* harmony import */ var _communication_types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/communication/types */ \"./types.ts\");\n\n\nclass Tunnel {\n    port;\n    server;\n    info;\n    tunnelId = \"\";\n    tunnelType;\n    pendingCmdList = new Map();\n    sendToServerHandler;\n    receivingData = undefined;\n    constructor(port, server, info) {\n        this.port = port;\n        this.server = server;\n        this.info = info;\n        this.tunnelType = info.tunnelType;\n    }\n    async start() {\n        const cmdId = await this.sendToServer(_communication_types__WEBPACK_IMPORTED_MODULE_0__.ClientCmdType.OpenTunnel, { data: this.info.data }, true);\n        const cmdResult = await this.getCmdResult(cmdId);\n        if (!cmdResult || typeof cmdResult.data.tunnel_id !== \"string\" || cmdResult.data.tunnel_id === \"\")\n            return false;\n        this.tunnelId = cmdResult.data.tunnel_id;\n        return true;\n    }\n    async receiveFromClient(event) {\n        const data = event.data;\n        console.log(\"receiveFromClient\", this.tunnelId, data);\n        if (data.close) {\n            this.close(true);\n            return;\n        }\n        const isBinary = data instanceof ArrayBuffer;\n        if (isBinary && this.receivingData === undefined) {\n            console.log(\"数据传输错误：缺少数据头\");\n            return;\n        }\n        if (!isBinary && this.receivingData !== undefined) {\n            console.log(\"数据传输错误：缺少数据段\");\n            this.receivingData = undefined;\n        }\n        if (isBinary) {\n            this.server.send(data);\n            this.receivingData = undefined;\n            return;\n        }\n        if (data.dataType === _communication_types__WEBPACK_IMPORTED_MODULE_0__.DataType.Binary) {\n            this.receivingData = data;\n        }\n        const cmdId = await this.sendToServer(_communication_types__WEBPACK_IMPORTED_MODULE_0__.ClientCmdType.TunnelData, data, data.isListened, data.cmdId);\n        if (data.isListened) {\n            if (!data.cmdId) {\n                console.log(\"数据传输错误：data.isListened=true时cmdId不能为空\");\n                return;\n            }\n            const cmdResult = await this.getCmdResult(cmdId);\n            if (!cmdResult)\n                return;\n            this.sendToClient({\n                cmdId: data.cmdId,\n                isListened: true,\n                data: cmdResult,\n            });\n        }\n    }\n    sendToClient(data) {\n        if (data.isListened && !data.cmdId) {\n            console.log(\"数据传输错误：data.isListened=false时cmdId不能为空\");\n            return;\n        }\n        const dataData = data.data;\n        const isBinary = dataData instanceof ArrayBuffer;\n        if (isBinary)\n            data.data = undefined;\n        data.dataType = isBinary ? _communication_types__WEBPACK_IMPORTED_MODULE_0__.DataType.Binary : _communication_types__WEBPACK_IMPORTED_MODULE_0__.DataType.Text;\n        this.port.postMessage(data);\n        if (isBinary)\n            this.port.postMessage(dataData, [dataData]);\n    }\n    receiveFromServer(cmdData) {\n        switch (cmdData.cmd_type) {\n            case _communication_types__WEBPACK_IMPORTED_MODULE_0__.ServerCmdType.CmdReturn:\n                const cmdId = cmdData.data?.cmd_id;\n                if (typeof cmdId !== \"string\" || cmdId === \"\")\n                    return;\n                if (!this.pendingCmdList.has(cmdId))\n                    return;\n                const cmd = this.pendingCmdList.get(cmdId);\n                cmd.resolve({\n                    status: cmdData.status ?? _communication_types__WEBPACK_IMPORTED_MODULE_0__.CmdStatus.Fail,\n                    message: cmdData.message,\n                    data: cmdData.data,\n                });\n                break;\n            case _communication_types__WEBPACK_IMPORTED_MODULE_0__.ServerCmdType.CloseTunnel:\n                this.close();\n                break;\n            case _communication_types__WEBPACK_IMPORTED_MODULE_0__.ServerCmdType.TunnelData:\n                const dataType = cmdData.data?.data_type;\n                if (dataType !== _communication_types__WEBPACK_IMPORTED_MODULE_0__.DataType.Text && dataType !== _communication_types__WEBPACK_IMPORTED_MODULE_0__.DataType.Binary) {\n                    console.log(\"不支持的数据类型\", dataType);\n                    break;\n                }\n                if (dataType === _communication_types__WEBPACK_IMPORTED_MODULE_0__.DataType.Binary && !(cmdData.data.data instanceof ArrayBuffer)) {\n                    console.log(\"数据类型错误：非二进制数据\");\n                    break;\n                }\n                this.sendToClient({\n                    data: cmdData.data.data,\n                });\n                break;\n            default:\n                console.log(\"不支持的cmd_type\", cmdData.cmd_type);\n        }\n    }\n    async sendToServer(cmdType, data, isListened = false, cmdId) {\n        if (typeof cmdId !== \"string\" || cmdId === \"\")\n            cmdId = (0,uuid__WEBPACK_IMPORTED_MODULE_1__[\"default\"])();\n        const cmdData = {\n            cmd_id: data?.cmdId,\n            tunnel_id: this.tunnelId ? this.tunnelId : undefined,\n            data_type: data?.dataType,\n            data: data?.data,\n        };\n        const cmd = {\n            cmd_type: cmdType,\n            cmd_id: cmdId,\n            tunnel_type: this.tunnelType,\n            data: cmdData,\n        };\n        if (isListened) {\n            let resolve = () => {\n            };\n            const promise = new Promise(r => resolve = r);\n            this.pendingCmdList.set(cmdId, {\n                cmd: cmd,\n                promise: promise,\n                resolve: resolve,\n            });\n            this.sendToServerHandler?.(cmdId, cmd);\n        }\n        await this.server.send(JSON.stringify(cmd));\n        return cmdId;\n    }\n    async getCmdResult(cmdId) {\n        if (!this.pendingCmdList.has(cmdId))\n            return;\n        const cmd = this.pendingCmdList.get(cmdId);\n        const result = await cmd.promise;\n        this.pendingCmdList.delete(cmdId);\n        return result;\n    }\n    setSendToServerHandler(handler) {\n        this.sendToServerHandler = handler;\n    }\n    close(closeServerPeer = false) {\n        if (closeServerPeer) {\n            this.sendToServer(_communication_types__WEBPACK_IMPORTED_MODULE_0__.ClientCmdType.CloseTunnel, {\n                tunnel_id: this.tunnelId,\n            });\n        }\n        this.port.close();\n    }\n}\n\n\n//# sourceURL=webpack://communication/./tunnel.ts?");

/***/ }),

/***/ "./types.ts":
/*!******************!*\
  !*** ./types.ts ***!
  \******************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   ClientCmdType: function() { return /* binding */ ClientCmdType; },\n/* harmony export */   CmdStatus: function() { return /* binding */ CmdStatus; },\n/* harmony export */   DataType: function() { return /* binding */ DataType; },\n/* harmony export */   ServerCmdType: function() { return /* binding */ ServerCmdType; },\n/* harmony export */   TunnelType: function() { return /* binding */ TunnelType; },\n/* harmony export */   TunnelTypeStr: function() { return /* binding */ TunnelTypeStr; }\n/* harmony export */ });\nvar TunnelType;\n(function (TunnelType) {\n    TunnelType[TunnelType[\"DocOp\"] = 0] = \"DocOp\";\n    TunnelType[TunnelType[\"DocResourceUpload\"] = 1] = \"DocResourceUpload\";\n    TunnelType[TunnelType[\"DocCommentOp\"] = 2] = \"DocCommentOp\";\n    TunnelType[TunnelType[\"DocUpload\"] = 3] = \"DocUpload\";\n})(TunnelType || (TunnelType = {}));\nconst TunnelTypeStr = {\n    [TunnelType.DocOp]: \"文档操作\",\n    [TunnelType.DocResourceUpload]: \"文档资源上传\",\n    [TunnelType.DocCommentOp]: \"文档评论操作\",\n    [TunnelType.DocUpload]: \"文档上传\",\n};\nvar ClientCmdType;\n(function (ClientCmdType) {\n    ClientCmdType[ClientCmdType[\"Return\"] = 0] = \"Return\";\n    ClientCmdType[ClientCmdType[\"OpenTunnel\"] = 1] = \"OpenTunnel\";\n    ClientCmdType[ClientCmdType[\"CloseTunnel\"] = 2] = \"CloseTunnel\";\n    ClientCmdType[ClientCmdType[\"TunnelData\"] = 3] = \"TunnelData\";\n    ClientCmdType[ClientCmdType[\"Heartbeat\"] = 255] = \"Heartbeat\";\n    ClientCmdType[ClientCmdType[\"HeartbeatResponse\"] = 254] = \"HeartbeatResponse\";\n})(ClientCmdType || (ClientCmdType = {}));\nvar ServerCmdType;\n(function (ServerCmdType) {\n    ServerCmdType[ServerCmdType[\"InitResult\"] = 0] = \"InitResult\";\n    ServerCmdType[ServerCmdType[\"CmdReturn\"] = 1] = \"CmdReturn\";\n    ServerCmdType[ServerCmdType[\"CloseTunnel\"] = 2] = \"CloseTunnel\";\n    ServerCmdType[ServerCmdType[\"TunnelData\"] = 3] = \"TunnelData\";\n    ServerCmdType[ServerCmdType[\"Heartbeat\"] = 255] = \"Heartbeat\";\n    ServerCmdType[ServerCmdType[\"HeartbeatResponse\"] = 254] = \"HeartbeatResponse\";\n})(ServerCmdType || (ServerCmdType = {}));\nvar CmdStatus;\n(function (CmdStatus) {\n    CmdStatus[\"Success\"] = \"success\";\n    CmdStatus[\"Fail\"] = \"fail\";\n})(CmdStatus || (CmdStatus = {}));\nvar DataType;\n(function (DataType) {\n    DataType[DataType[\"Text\"] = 1] = \"Text\";\n    DataType[DataType[\"Binary\"] = 2] = \"Binary\";\n})(DataType || (DataType = {}));\n\n\n//# sourceURL=webpack://communication/./types.ts?");

/***/ }),

/***/ "./worker.ts":
/*!*******************!*\
  !*** ./worker.ts ***!
  \*******************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! uuid */ \"../../node_modules/uuid/dist/esm-browser/v4.js\");\n/* harmony import */ var _communication_types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/communication/types */ \"./types.ts\");\n/* harmony import */ var _communication_tunnel__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/communication/tunnel */ \"./tunnel.ts\");\n/* harmony import */ var _communication_server__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/communication/server */ \"./server.ts\");\n\n\n\n\nconst ctx = self;\nlet server = undefined;\nconst tunnelMap = new Map();\nconst cmdIdToTunnel = new Map();\nlet token = \"\";\nlet receivingTunnel = undefined;\nlet receivingTunnelCmd = undefined;\nfunction receiveFromServer(event) {\n    const isBinary = event.data instanceof ArrayBuffer;\n    const data = (isBinary ? event.data : JSON.parse(event.data));\n    if (isBinary && (receivingTunnel === undefined || receivingTunnelCmd === undefined)) {\n        console.log(\"数据传输错误：缺少数据头\");\n        return;\n    }\n    if (!isBinary && (receivingTunnel !== undefined || receivingTunnelCmd !== undefined)) {\n        console.log(\"数据传输错误：缺少数据段\");\n        receivingTunnel = undefined;\n        receivingTunnelCmd = undefined;\n    }\n    if (isBinary) {\n        receivingTunnelCmd.data.data = data;\n        receivingTunnel.receiveFromServer(receivingTunnelCmd);\n        receivingTunnel = undefined;\n        receivingTunnelCmd = undefined;\n        return;\n    }\n    const cmdId = data.cmd_id;\n    if (typeof cmdId !== \"string\" || cmdId === \"\") {\n        console.log(\"cmd_id参数错误\", cmdId);\n        return;\n    }\n    const originCmdId = data.data?.cmd_id;\n    const tunnelId = data.data?.tunnel_id;\n    const isTunnelDataCmd = data.cmd_type === _communication_types__WEBPACK_IMPORTED_MODULE_0__.ServerCmdType.TunnelData;\n    const tunnel = isTunnelDataCmd ? tunnelMap.get(tunnelId) : cmdIdToTunnel.get(originCmdId);\n    if (!tunnel)\n        return;\n    if (isTunnelDataCmd && data.data?.data_type === _communication_types__WEBPACK_IMPORTED_MODULE_0__.DataType.Binary) {\n        receivingTunnel = tunnel;\n        receivingTunnelCmd = data;\n        return;\n    }\n    tunnel.receiveFromServer(data);\n    console.log(\"receiveFromServer\", data);\n}\nctx.onconnect = (event) => {\n    const port = event.ports[0];\n    port.onmessage = async (messageEvent) => {\n        const data = messageEvent.data;\n        if (token !== \"\" && data.token !== token && server !== undefined) { // 当有第二个用户连接时，关闭前面用户的连接\n            server.close();\n            server = undefined;\n        }\n        const sendData = {\n            name: data.name,\n            id: \"\",\n        };\n        if (!data.name) {\n            console.log(\"name参数错误\", data.name);\n            port.postMessage(sendData);\n            return;\n        }\n        if (server === undefined) {\n            server = new _communication_server__WEBPACK_IMPORTED_MODULE_2__.Server(data.token, receiveFromServer);\n            server.connect();\n        }\n        data.id = (0,uuid__WEBPACK_IMPORTED_MODULE_3__[\"default\"])();\n        const tunnel = new _communication_tunnel__WEBPACK_IMPORTED_MODULE_1__.Tunnel(port, server, data);\n        tunnel.setSendToServerHandler((cmdId, cmd) => cmdIdToTunnel.set(cmdId, tunnel));\n        if (await tunnel.start()) {\n            console.log(\"tunnel创建成功\", tunnel.tunnelId);\n            sendData.id = tunnel.tunnelId;\n            tunnelMap.set(tunnel.tunnelId, tunnel);\n            port.onmessage = tunnel.receiveFromClient.bind(tunnel);\n        }\n        port.postMessage(sendData);\n    };\n};\n\n\n//# sourceURL=webpack://communication/./worker.ts?");

/***/ }),

/***/ "../utils/setting.ts":
/*!***************************!*\
  !*** ../utils/setting.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   API_PATH: function() { return /* binding */ API_PATH; },\n/* harmony export */   API_URL: function() { return /* binding */ API_URL; },\n/* harmony export */   BASE_HOST: function() { return /* binding */ BASE_HOST; },\n/* harmony export */   BASE_PATH: function() { return /* binding */ BASE_PATH; },\n/* harmony export */   BASE_SCHEME: function() { return /* binding */ BASE_SCHEME; },\n/* harmony export */   COMMUNICATION_URL: function() { return /* binding */ COMMUNICATION_URL; },\n/* harmony export */   SCREEN_SIZE: function() { return /* binding */ SCREEN_SIZE; },\n/* harmony export */   SKIP_LOGIN: function() { return /* binding */ SKIP_LOGIN; },\n/* harmony export */   STORAGE_URL: function() { return /* binding */ STORAGE_URL; },\n/* harmony export */   WEAKEN_ANIMATION: function() { return /* binding */ WEAKEN_ANIMATION; }\n/* harmony export */ });\nconst SCREEN_SIZE = {\n    KEY: 'documentFullScreen',\n    FULL: 'full',\n    NORMAL: 'normal'\n}; // 编辑器屏幕尺寸\nconst WEAKEN_ANIMATION = false; // 弱化动画\nconst SKIP_LOGIN = false; // 跳过登录过程，直接进入个人首页，开发使用\nconst production = false;\nconst BASE_SCHEME = production ? \"https\" : \"https\";\nconst BASE_HOST = production ? \"protodesign.cn\" : \"protodesign.cn\";\nconst BASE_PATH = `${BASE_SCHEME}://${BASE_HOST}`;\nconst API_PATH = production ? \"/api/v1\" : \"/api_test/v1\";\nconst API_URL = `${BASE_PATH}${API_PATH}`;\nconst STORAGE_URL = `${BASE_SCHEME}://storage.${BASE_HOST}`;\nconst COMMUNICATION_URL = `wss://${BASE_HOST}${API_PATH}/communication`;\n\n\n//# sourceURL=webpack://communication/../utils/setting.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./worker.ts");
/******/ 	
/******/ })()
;