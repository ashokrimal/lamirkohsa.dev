"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/gallery/drive/route";
exports.ids = ["app/api/gallery/drive/route"];
exports.modules = {

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "pg":
/*!*********************!*\
  !*** external "pg" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("pg");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "http2":
/*!************************!*\
  !*** external "http2" ***!
  \************************/
/***/ ((module) => {

module.exports = require("http2");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("net");

/***/ }),

/***/ "node:assert":
/*!******************************!*\
  !*** external "node:assert" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:assert");

/***/ }),

/***/ "node:async_hooks":
/*!***********************************!*\
  !*** external "node:async_hooks" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("node:async_hooks");

/***/ }),

/***/ "node:buffer":
/*!******************************!*\
  !*** external "node:buffer" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:buffer");

/***/ }),

/***/ "node:console":
/*!*******************************!*\
  !*** external "node:console" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("node:console");

/***/ }),

/***/ "node:crypto":
/*!******************************!*\
  !*** external "node:crypto" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:crypto");

/***/ }),

/***/ "node:diagnostics_channel":
/*!*******************************************!*\
  !*** external "node:diagnostics_channel" ***!
  \*******************************************/
/***/ ((module) => {

module.exports = require("node:diagnostics_channel");

/***/ }),

/***/ "node:dns":
/*!***************************!*\
  !*** external "node:dns" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("node:dns");

/***/ }),

/***/ "node:events":
/*!******************************!*\
  !*** external "node:events" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:events");

/***/ }),

/***/ "node:fs":
/*!**************************!*\
  !*** external "node:fs" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("node:fs");

/***/ }),

/***/ "node:fs/promises":
/*!***********************************!*\
  !*** external "node:fs/promises" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("node:fs/promises");

/***/ }),

/***/ "node:http":
/*!****************************!*\
  !*** external "node:http" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:http");

/***/ }),

/***/ "node:http2":
/*!*****************************!*\
  !*** external "node:http2" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("node:http2");

/***/ }),

/***/ "node:https":
/*!*****************************!*\
  !*** external "node:https" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("node:https");

/***/ }),

/***/ "node:net":
/*!***************************!*\
  !*** external "node:net" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("node:net");

/***/ }),

/***/ "node:os":
/*!**************************!*\
  !*** external "node:os" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("node:os");

/***/ }),

/***/ "node:path":
/*!****************************!*\
  !*** external "node:path" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:path");

/***/ }),

/***/ "node:perf_hooks":
/*!**********************************!*\
  !*** external "node:perf_hooks" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("node:perf_hooks");

/***/ }),

/***/ "node:process":
/*!*******************************!*\
  !*** external "node:process" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("node:process");

/***/ }),

/***/ "node:querystring":
/*!***********************************!*\
  !*** external "node:querystring" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("node:querystring");

/***/ }),

/***/ "node:stream":
/*!******************************!*\
  !*** external "node:stream" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:stream");

/***/ }),

/***/ "node:stream/web":
/*!**********************************!*\
  !*** external "node:stream/web" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("node:stream/web");

/***/ }),

/***/ "node:tls":
/*!***************************!*\
  !*** external "node:tls" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("node:tls");

/***/ }),

/***/ "node:url":
/*!***************************!*\
  !*** external "node:url" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("node:url");

/***/ }),

/***/ "node:util":
/*!****************************!*\
  !*** external "node:util" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:util");

/***/ }),

/***/ "node:util/types":
/*!**********************************!*\
  !*** external "node:util/types" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("node:util/types");

/***/ }),

/***/ "node:worker_threads":
/*!**************************************!*\
  !*** external "node:worker_threads" ***!
  \**************************************/
/***/ ((module) => {

module.exports = require("node:worker_threads");

/***/ }),

/***/ "node:zlib":
/*!****************************!*\
  !*** external "node:zlib" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:zlib");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "process":
/*!**************************!*\
  !*** external "process" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("process");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "string_decoder":
/*!*********************************!*\
  !*** external "string_decoder" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("string_decoder");

/***/ }),

/***/ "tls":
/*!**********************!*\
  !*** external "tls" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("tls");

/***/ }),

/***/ "tty":
/*!**********************!*\
  !*** external "tty" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("tty");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "worker_threads":
/*!*********************************!*\
  !*** external "worker_threads" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("worker_threads");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/.pnpm/next@14.2.5_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fgallery%2Fdrive%2Froute&page=%2Fapi%2Fgallery%2Fdrive%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fgallery%2Fdrive%2Froute.ts&appDir=%2Fvercel%2Fshare%2Fv0-project%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fvercel%2Fshare%2Fv0-project&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/next@14.2.5_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fgallery%2Fdrive%2Froute&page=%2Fapi%2Fgallery%2Fdrive%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fgallery%2Fdrive%2Froute.ts&appDir=%2Fvercel%2Fshare%2Fv0-project%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fvercel%2Fshare%2Fv0-project&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/.pnpm/next@14.2.5_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/.pnpm/next@14.2.5_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/.pnpm/next@14.2.5_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _vercel_share_v0_project_src_app_api_gallery_drive_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/gallery/drive/route.ts */ \"(rsc)/./src/app/api/gallery/drive/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/gallery/drive/route\",\n        pathname: \"/api/gallery/drive\",\n        filename: \"route\",\n        bundlePath: \"app/api/gallery/drive/route\"\n    },\n    resolvedPagePath: \"/vercel/share/v0-project/src/app/api/gallery/drive/route.ts\",\n    nextConfigOutput,\n    userland: _vercel_share_v0_project_src_app_api_gallery_drive_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/gallery/drive/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvLnBucG0vbmV4dEAxNC4yLjVfcmVhY3QtZG9tQDE4LjMuMV9yZWFjdEAxOC4zLjFfX3JlYWN0QDE4LjMuMS9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZnYWxsZXJ5JTJGZHJpdmUlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmdhbGxlcnklMkZkcml2ZSUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmdhbGxlcnklMkZkcml2ZSUyRnJvdXRlLnRzJmFwcERpcj0lMkZ2ZXJjZWwlMkZzaGFyZSUyRnYwLXByb2plY3QlMkZzcmMlMkZhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPSUyRnZlcmNlbCUyRnNoYXJlJTJGdjAtcHJvamVjdCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ2M7QUFDVztBQUN4RjtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLGlFQUFpRTtBQUN6RTtBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ3VIOztBQUV2SCIsInNvdXJjZXMiOlsid2VicGFjazovL2xhbWlya29oc2EtZGV2Lz8xMjkxIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi92ZXJjZWwvc2hhcmUvdjAtcHJvamVjdC9zcmMvYXBwL2FwaS9nYWxsZXJ5L2RyaXZlL3JvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9nYWxsZXJ5L2RyaXZlL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvZ2FsbGVyeS9kcml2ZVwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvZ2FsbGVyeS9kcml2ZS9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIi92ZXJjZWwvc2hhcmUvdjAtcHJvamVjdC9zcmMvYXBwL2FwaS9nYWxsZXJ5L2RyaXZlL3JvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9nYWxsZXJ5L2RyaXZlL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/.pnpm/next@14.2.5_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fgallery%2Fdrive%2Froute&page=%2Fapi%2Fgallery%2Fdrive%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fgallery%2Fdrive%2Froute.ts&appDir=%2Fvercel%2Fshare%2Fv0-project%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fvercel%2Fshare%2Fv0-project&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/gallery/drive/route.ts":
/*!********************************************!*\
  !*** ./src/app/api/gallery/drive/route.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var _vercel_connect__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @vercel/connect */ \"(rsc)/./node_modules/.pnpm/@vercel+connect@2.8.0_better-auth@1.7.15_drizzle-orm@0.45.4_@types+pg@8.23.1_kysely@0.2_faf5aa5d7b2c4fbe2ba6ff5a283c94b3/node_modules/@vercel/connect/dist/index.js\");\n/* harmony import */ var googleapis__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! googleapis */ \"(rsc)/./node_modules/.pnpm/googleapis@189.0.0/node_modules/googleapis/build/src/index.js\");\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/.pnpm/next@14.2.5_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/api/server.js\");\n/* harmony import */ var next_headers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/headers */ \"(rsc)/./node_modules/.pnpm/next@14.2.5_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/api/headers.js\");\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./src/lib/auth.ts\");\n/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/lib/db */ \"(rsc)/./src/lib/db/index.ts\");\n/* harmony import */ var _lib_db_schema__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/lib/db/schema */ \"(rsc)/./src/lib/db/schema.ts\");\n/* harmony import */ var _vercel_blob__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @vercel/blob */ \"(rsc)/./node_modules/.pnpm/@vercel+blob@2.8.2/node_modules/@vercel/blob/dist/index.js\");\n/* harmony import */ var next_cache__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! next/cache */ \"(rsc)/./node_modules/.pnpm/next@14.2.5_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/cache.js\");\n/* harmony import */ var next_cache__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(next_cache__WEBPACK_IMPORTED_MODULE_6__);\n\n\n\n\n\n\n\n\n\nconst connector = \"google/gallery-photo-imports\";\nconst driveScopes = [\n    \"https://www.googleapis.com/auth/drive.readonly\"\n];\nasync function getDrive() {\n    const session = await _lib_auth__WEBPACK_IMPORTED_MODULE_3__.auth.api.getSession({\n        headers: await (0,next_headers__WEBPACK_IMPORTED_MODULE_2__.headers)()\n    });\n    if (!session?.user) throw new Error(\"Unauthorized\");\n    const subject = {\n        type: \"user\",\n        id: session.user.id\n    };\n    const token = await (0,_vercel_connect__WEBPACK_IMPORTED_MODULE_0__.getToken)(connector, {\n        subject,\n        scopes: driveScopes\n    });\n    const client = new googleapis__WEBPACK_IMPORTED_MODULE_7__.google.auth.OAuth2();\n    client.setCredentials({\n        access_token: token\n    });\n    return {\n        drive: googleapis__WEBPACK_IMPORTED_MODULE_7__.google.drive({\n            version: \"v3\",\n            auth: client\n        }),\n        userId: session.user.id,\n        subject\n    };\n}\nasync function authorizationResponse(subject) {\n    const authorization = await (0,_vercel_connect__WEBPACK_IMPORTED_MODULE_0__.startAuthorization)(connector, {\n        subject,\n        scopes: driveScopes\n    });\n    return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.json({\n        code: \"AUTH_REQUIRED\",\n        authorizationUrl: authorization.url\n    }, {\n        status: 409\n    });\n}\nasync function GET() {\n    try {\n        const { drive } = await getDrive();\n        const result = await drive.files.list({\n            q: \"trashed = false and mimeType contains 'image/'\",\n            pageSize: 50,\n            orderBy: \"modifiedTime desc\",\n            fields: \"files(id,name,mimeType,thumbnailLink,modifiedTime)\"\n        });\n        return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.json({\n            files: result.data.files ?? []\n        });\n    } catch (error) {\n        if (error instanceof _vercel_connect__WEBPACK_IMPORTED_MODULE_0__.UserAuthorizationRequiredError) {\n            const session = await _lib_auth__WEBPACK_IMPORTED_MODULE_3__.auth.api.getSession({\n                headers: await (0,next_headers__WEBPACK_IMPORTED_MODULE_2__.headers)()\n            });\n            if (session?.user) return authorizationResponse({\n                type: \"user\",\n                id: session.user.id\n            });\n        }\n        if (error instanceof Error && error.message === \"Unauthorized\") return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.json({\n            error: \"Unauthorized\"\n        }, {\n            status: 401\n        });\n        console.error(\"[v0] Google Drive list failed:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.json({\n            error: \"Google Drive is temporarily unavailable.\"\n        }, {\n            status: 500\n        });\n    }\n}\nasync function POST(request) {\n    try {\n        const { drive, userId } = await getDrive();\n        const body = await request.json();\n        if (!body.fileId) return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.json({\n            error: \"Missing Drive file.\"\n        }, {\n            status: 400\n        });\n        const metadata = await drive.files.get({\n            fileId: body.fileId,\n            fields: \"name,mimeType\"\n        });\n        const media = await drive.files.get({\n            fileId: body.fileId,\n            alt: \"media\"\n        }, {\n            responseType: \"arraybuffer\"\n        });\n        const fileName = metadata.data.name || `drive-${Date.now()}.jpg`;\n        const blob = await (0,_vercel_blob__WEBPACK_IMPORTED_MODULE_8__.put)(`gallery/${userId}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, \"-\")}`, Buffer.from(media.data), {\n            access: \"public\",\n            contentType: metadata.data.mimeType || \"image/jpeg\"\n        });\n        const title = body.title?.trim() || null;\n        const slug = `${title || \"photo\"}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, \"-\").replace(/^-|-$/g, \"\");\n        await _lib_db__WEBPACK_IMPORTED_MODULE_4__.db.insert(_lib_db_schema__WEBPACK_IMPORTED_MODULE_5__.galleryItem).values({\n            userId,\n            title,\n            slug,\n            description: null,\n            imageUrl: blob.url,\n            category: body.category?.trim() || \"Selected work\",\n            featured: false,\n            published: true\n        });\n        (0,next_cache__WEBPACK_IMPORTED_MODULE_6__.revalidatePath)(\"/gallery\");\n        (0,next_cache__WEBPACK_IMPORTED_MODULE_6__.revalidatePath)(\"/media\");\n        return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.json({\n            url: blob.url\n        });\n    } catch (error) {\n        if (error instanceof _vercel_connect__WEBPACK_IMPORTED_MODULE_0__.UserAuthorizationRequiredError) {\n            const session = await _lib_auth__WEBPACK_IMPORTED_MODULE_3__.auth.api.getSession({\n                headers: await (0,next_headers__WEBPACK_IMPORTED_MODULE_2__.headers)()\n            });\n            if (session?.user) return authorizationResponse({\n                type: \"user\",\n                id: session.user.id\n            });\n        }\n        if (error instanceof Error && error.message === \"Unauthorized\") return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.json({\n            error: \"Unauthorized\"\n        }, {\n            status: 401\n        });\n        console.error(\"[v0] Google Drive import failed:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.json({\n            error: \"Drive import failed. Please try again.\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9nYWxsZXJ5L2RyaXZlL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUE4RjtBQUMzRDtBQUNPO0FBQ0o7QUFDTDtBQUNKO0FBQ2dCO0FBQ1g7QUFDUztBQUUzQyxNQUFNVyxZQUFZO0FBQ2xCLE1BQU1DLGNBQWM7SUFBQztDQUFpRDtBQUN0RSxlQUFlQztJQUFhLE1BQU1DLFVBQVUsTUFBTVIsMkNBQUlBLENBQUNTLEdBQUcsQ0FBQ0MsVUFBVSxDQUFDO1FBQUVYLFNBQVMsTUFBTUEscURBQU9BO0lBQUc7SUFBSSxJQUFJLENBQUNTLFNBQVNHLE1BQU0sTUFBTSxJQUFJQyxNQUFNO0lBQWlCLE1BQU1DLFVBQVU7UUFBRUMsTUFBTTtRQUFpQkMsSUFBSVAsUUFBUUcsSUFBSSxDQUFDSSxFQUFFO0lBQUM7SUFBRyxNQUFNQyxRQUFRLE1BQU10Qix5REFBUUEsQ0FBQ1csV0FBVztRQUFFUTtRQUFTSSxRQUFRWDtJQUFZO0lBQUksTUFBTVksU0FBUyxJQUFJckIsOENBQU1BLENBQUNHLElBQUksQ0FBQ21CLE1BQU07SUFBSUQsT0FBT0UsY0FBYyxDQUFDO1FBQUVDLGNBQWNMO0lBQU07SUFBSSxPQUFPO1FBQUVNLE9BQU96Qiw4Q0FBTUEsQ0FBQ3lCLEtBQUssQ0FBQztZQUFFQyxTQUFTO1lBQU12QixNQUFNa0I7UUFBTztRQUFJTSxRQUFRaEIsUUFBUUcsSUFBSSxDQUFDSSxFQUFFO1FBQUVGO0lBQVE7QUFBRTtBQUNoZSxlQUFlWSxzQkFBc0JaLE9BQXFDO0lBQUksTUFBTWEsZ0JBQWdCLE1BQU0vQixtRUFBa0JBLENBQUNVLFdBQVc7UUFBRVE7UUFBU0ksUUFBUVg7SUFBWTtJQUFJLE9BQU9SLHFEQUFZQSxDQUFDNkIsSUFBSSxDQUFDO1FBQUVDLE1BQU07UUFBaUJDLGtCQUFrQkgsY0FBY0ksR0FBRztJQUFDLEdBQUc7UUFBRUMsUUFBUTtJQUFJO0FBQUc7QUFFOVEsZUFBZUM7SUFBUSxJQUFJO1FBQUUs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QztRQUFXLE9BQU9OLHFEQUFZQSxDQUFDNkIsSUFBSSxDQUFDO1lBQUVHLEtBQUsyQixLQUFLM0IsR0FBRztRQUFDO0lBQUcsRUFBRSxPQUFPVyxPQUFPO1FBQUUsSUFBSUEsaUJBQWlCN0MsMkVBQThCQSxFQUFFO1lBQUUsTUFBTVksVUFBVSxNQUFNUiwyQ0FBSUEsQ0FBQ1MsR0FBRyxDQUFDQyxVQUFVLENBQUM7Z0JBQUVYLFNBQVMsTUFBTUEscURBQU9BO1lBQUc7WUFBSSxJQUFJUyxTQUFTRyxNQUFNLE9BQU9jLHNCQUFzQjtnQkFBRVgsTUFBTTtnQkFBUUMsSUFBSVAsUUFBUUcsSUFBSSxDQUFDSSxFQUFFO1lBQUM7UUFBRztRQUFFLElBQUkwQixpQkFBaUI3QixTQUFTNkIsTUFBTUMsT0FBTyxLQUFLLGdCQUFnQixPQUFPNUMscURBQVlBLENBQUM2QixJQUFJLENBQUM7WUFBRWMsT0FBTztRQUFlLEdBQUc7WUFBRVYsUUFBUTtRQUFJO1FBQUlZLFFBQVFGLEtBQUssQ0FBQyxvQ0FBb0NBO1FBQVEsT0FBTzNDLHFEQUFZQSxDQUFDNkIsSUFBSSxDQUFDO1lBQUVjLE9BQU87UUFBeUMsR0FBRztZQUFFVixRQUFRO1FBQUk7SUFBRztBQUFFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbGFtaXJrb2hzYS1kZXYvLi9zcmMvYXBwL2FwaS9nYWxsZXJ5L2RyaXZlL3JvdXRlLnRzP2M3MDQiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0VG9rZW4sIHN0YXJ0QXV0aG9yaXphdGlvbiwgVXNlckF1dGhvcml6YXRpb25SZXF1aXJlZEVycm9yIH0gZnJvbSAnQHZlcmNlbC9jb25uZWN0J1xuaW1wb3J0IHsgZ29vZ2xlIH0gZnJvbSAnZ29vZ2xlYXBpcydcbmltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJ1xuaW1wb3J0IHsgaGVhZGVycyB9IGZyb20gJ25leHQvaGVhZGVycydcbmltcG9ydCB7IGF1dGggfSBmcm9tICdAL2xpYi9hdXRoJ1xuaW1wb3J0IHsgZGIgfSBmcm9tICdAL2xpYi9kYidcbmltcG9ydCB7IGdhbGxlcnlJdGVtIH0gZnJvbSAnQC9saWIvZGIvc2NoZW1hJ1xuaW1wb3J0IHsgcHV0IH0gZnJvbSAnQHZlcmNlbC9ibG9iJ1xuaW1wb3J0IHsgcmV2YWxpZGF0ZVBhdGggfSBmcm9tICduZXh0L2NhY2hlJ1xuXG5jb25zdCBjb25uZWN0b3IgPSAnZ29vZ2xlL2dhbGxlcnktcGhvdG8taW1wb3J0cydcbmNvbnN0IGRyaXZlU2NvcGVzID0gWydodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2RyaXZlLnJlYWRvbmx5J11cbmFzeW5jIGZ1bmN0aW9uIGdldERyaXZlKCkgeyBjb25zdCBzZXNzaW9uID0gYXdhaXQgYXV0aC5hcGkuZ2V0U2Vzc2lvbih7IGhlYWRlcnM6IGF3YWl0IGhlYWRlcnMoKSB9KTsgaWYgKCFzZXNzaW9uPy51c2VyKSB0aHJvdyBuZXcgRXJyb3IoJ1VuYXV0aG9yaXplZCcpOyBjb25zdCBzdWJqZWN0ID0geyB0eXBlOiAndXNlcicgYXMgY29uc3QsIGlkOiBzZXNzaW9uLnVzZXIuaWQgfTsgY29uc3QgdG9rZW4gPSBhd2FpdCBnZXRUb2tlbihjb25uZWN0b3IsIHsgc3ViamVjdCwgc2NvcGVzOiBkcml2ZVNjb3BlcyB9KTsgY29uc3QgY2xpZW50ID0gbmV3IGdvb2dsZS5hdXRoLk9BdXRoMigpOyBjbGllbnQuc2V0Q3JlZGVudGlhbHMoeyBhY2Nlc3NfdG9rZW46IHRva2VuIH0pOyByZXR1cm4geyBkcml2ZTogZ29vZ2xlLmRyaXZlKHsgdmVyc2lvbjogJ3YzJywgYXV0aDogY2xpZW50IH0pLCB1c2VySWQ6IHNlc3Npb24udXNlci5pZCwgc3ViamVjdCB9IH1cbmFzeW5jIGZ1bmN0aW9uIGF1dGhvcml6YXRpb25SZXNwb25zZShzdWJqZWN0OiB7IHR5cGU6ICd1c2VyJzsgaWQ6IHN0cmluZyB9KSB7IGNvbnN0IGF1dGhvcml6YXRpb24gPSBhd2FpdCBzdGFydEF1dGhvcml6YXRpb24oY29ubmVjdG9yLCB7IHN1YmplY3QsIHNjb3BlczogZHJpdmVTY29wZXMgfSk7IHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGNvZGU6ICdBVVRIX1JFUVVJUkVEJywgYXV0aG9yaXphdGlvblVybDogYXV0aG9yaXphdGlvbi51cmwgfSwgeyBzdGF0dXM6IDQwOSB9KSB9XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQoKSB7IHRyeSB7IGNvbnN0IHsgZHJpdmUgfSA9IGF3YWl0IGdldERyaXZlKCk7IGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRyaXZlLmZpbGVzLmxpc3QoeyBxOiBcInRyYXNoZWQgPSBmYWxzZSBhbmQgbWltZVR5cGUgY29udGFpbnMgJ2ltYWdlLydcIiwgcGFnZVNpemU6IDUwLCBvcmRlckJ5OiAnbW9kaWZpZWRUaW1lIGRlc2MnLCBmaWVsZHM6ICdmaWxlcyhpZCxuYW1lLG1pbWVUeXBlLHRodW1ibmFpbExpbmssbW9kaWZpZWRUaW1lKScgfSk7IHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGZpbGVzOiByZXN1bHQuZGF0YS5maWxlcyA/PyBbXSB9KSB9IGNhdGNoIChlcnJvcikgeyBpZiAoZXJyb3IgaW5zdGFuY2VvZiBVc2VyQXV0aG9yaXphdGlvblJlcXVpcmVkRXJyb3IpIHsgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGF1dGguYXBpLmdldFNlc3Npb24oeyBoZWFkZXJzOiBhd2FpdCBoZWFkZXJzKCkgfSk7IGlmIChzZXNzaW9uPy51c2VyKSByZXR1cm4gYXV0aG9yaXphdGlvblJlc3BvbnNlKHsgdHlwZTogJ3VzZXInLCBpZDogc2Vzc2lvbi51c2VyLmlkIH0pIH0gaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgZXJyb3IubWVzc2FnZSA9PT0gJ1VuYXV0aG9yaXplZCcpIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9LCB7IHN0YXR1czogNDAxIH0pOyBjb25zb2xlLmVycm9yKCdbdjBdIEdvb2dsZSBEcml2ZSBsaXN0IGZhaWxlZDonLCBlcnJvcik7IHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnR29vZ2xlIERyaXZlIGlzIHRlbXBvcmFyaWx5IHVuYXZhaWxhYmxlLicgfSwgeyBzdGF0dXM6IDUwMCB9KSB9IH1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxdWVzdDogUmVxdWVzdCkgeyB0cnkgeyBjb25zdCB7IGRyaXZlLCB1c2VySWQgfSA9IGF3YWl0IGdldERyaXZlKCk7IGNvbnN0IGJvZHkgPSBhd2FpdCByZXF1ZXN0Lmpzb24oKSBhcyB7IGZpbGVJZD86IHN0cmluZzsgdGl0bGU/OiBzdHJpbmc7IGNhdGVnb3J5Pzogc3RyaW5nIH07IGlmICghYm9keS5maWxlSWQpIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnTWlzc2luZyBEcml2ZSBmaWxlLicgfSwgeyBzdGF0dXM6IDQwMCB9KTsgY29uc3QgbWV0YWRhdGEgPSBhd2FpdCBkcml2ZS5maWxlcy5nZXQoeyBmaWxlSWQ6IGJvZHkuZmlsZUlkLCBmaWVsZHM6ICduYW1lLG1pbWVUeXBlJyB9KTsgY29uc3QgbWVkaWEgPSBhd2FpdCBkcml2ZS5maWxlcy5nZXQoeyBmaWxlSWQ6IGJvZHkuZmlsZUlkLCBhbHQ6ICdtZWRpYScgfSwgeyByZXNwb25zZVR5cGU6ICdhcnJheWJ1ZmZlcicgfSk7IGNvbnN0IGZpbGVOYW1lID0gbWV0YWRhdGEuZGF0YS5uYW1lIHx8IGBkcml2ZS0ke0RhdGUubm93KCl9LmpwZ2A7IGNvbnN0IGJsb2IgPSBhd2FpdCBwdXQoYGdhbGxlcnkvJHt1c2VySWR9LyR7RGF0ZS5ub3coKX0tJHtmaWxlTmFtZS5yZXBsYWNlKC9bXmEtekEtWjAtOS5fLV0vZywgJy0nKX1gLCBCdWZmZXIuZnJvbShtZWRpYS5kYXRhIGFzIEFycmF5QnVmZmVyKSwgeyBhY2Nlc3M6ICdwdWJsaWMnLCBjb250ZW50VHlwZTogbWV0YWRhdGEuZGF0YS5taW1lVHlwZSB8fCAnaW1hZ2UvanBlZycgfSk7IGNvbnN0IHRpdGxlID0gYm9keS50aXRsZT8udHJpbSgpIHx8IG51bGw7IGNvbnN0IHNsdWcgPSBgJHt0aXRsZSB8fCAncGhvdG8nfS0ke0RhdGUubm93KCl9YC50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teYS16MC05XSsvZywgJy0nKS5yZXBsYWNlKC9eLXwtJC9nLCAnJyk7IGF3YWl0IGRiLmluc2VydChnYWxsZXJ5SXRlbSkudmFsdWVzKHsgdXNlcklkLCB0aXRsZSwgc2x1ZywgZGVzY3JpcHRpb246IG51bGwsIGltYWdlVXJsOiBibG9iLnVybCwgY2F0ZWdvcnk6IGJvZHkuY2F0ZWdvcnk/LnRyaW0oKSB8fCAnU2VsZWN0ZWQgd29yaycsIGZlYXR1cmVkOiBmYWxzZSwgcHVibGlzaGVkOiB0cnVlIH0pOyByZXZhbGlkYXRlUGF0aCgnL2dhbGxlcnknKTsgcmV2YWxpZGF0ZVBhdGgoJy9tZWRpYScpOyByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyB1cmw6IGJsb2IudXJsIH0pIH0gY2F0Y2ggKGVycm9yKSB7IGlmIChlcnJvciBpbnN0YW5jZW9mIFVzZXJBdXRob3JpemF0aW9uUmVxdWlyZWRFcnJvcikgeyBjb25zdCBzZXNzaW9uID0gYXdhaXQgYXV0aC5hcGkuZ2V0U2Vzc2lvbih7IGhlYWRlcnM6IGF3YWl0IGhlYWRlcnMoKSB9KTsgaWYgKHNlc3Npb24/LnVzZXIpIHJldHVybiBhdXRob3JpemF0aW9uUmVzcG9uc2UoeyB0eXBlOiAndXNlcicsIGlkOiBzZXNzaW9uLnVzZXIuaWQgfSkgfSBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnJvci5tZXNzYWdlID09PSAnVW5hdXRob3JpemVkJykgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH0sIHsgc3RhdHVzOiA0MDEgfSk7IGNvbnNvbGUuZXJyb3IoJ1t2MF0gR29vZ2xlIERyaXZlIGltcG9ydCBmYWlsZWQ6JywgZXJyb3IpOyByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ0RyaXZlIGltcG9ydCBmYWlsZWQuIFBsZWFzZSB0cnkgYWdhaW4uJyB9LCB7IHN0YXR1czogNTAwIH0pIH0gfVxuIl0sIm5hbWVzIjpbImdldFRva2VuIiwic3RhcnRBdXRob3JpemF0aW9uIiwiVXNlckF1dGhvcml6YXRpb25SZXF1aXJlZEVycm9yIiwiZ29vZ2xlIiwiTmV4dFJlc3BvbnNlIiwiaGVhZGVycyIsImF1dGgiLCJkYiIsImdhbGxlcnlJdGVtIiwicHV0IiwicmV2YWxpZGF0ZVBhdGgiLCJjb25uZWN0b3IiLCJkcml2ZVNjb3BlcyIsImdldERyaXZlIiwic2Vzc2lvbiIsImFwaSIsImdldFNlc3Npb24iLCJ1c2VyIiwiRXJyb3IiLCJzdWJqZWN0IiwidHlwZSIsImlkIiwidG9rZW4iLCJzY29wZXMiLCJjbGllbnQiLCJPQXV0aDIiLCJzZXRDcmVkZW50aWFscyIsImFjY2Vzc190b2tlbiIsImRyaXZlIiwidmVyc2lvbiIsInVzZXJJZCIsImF1dGhvcml6YXRpb25SZXNwb25zZSIsImF1dGhvcml6YXRpb24iLCJqc29uIiwiY29kZSIsImF1dGhvcml6YXRpb25VcmwiLCJ1cmwiLCJzdGF0dXMiLCJHRVQiLCJyZXN1bHQiLCJmaWxlcyIsImxpc3QiLCJxIiwicGFnZVNpemUiLCJvcmRlckJ5IiwiZmllbGRzIiwiZGF0YSIsImVycm9yIiwibWVzc2FnZSIsImNvbnNvbGUiLCJQT1NUIiwicmVxdWVzdCIsImJvZHkiLCJmaWxlSWQiLCJtZXRhZGF0YSIsImdldCIsIm1lZGlhIiwiYWx0IiwicmVzcG9uc2VUeXBlIiwiZmlsZU5hbWUiLCJuYW1lIiwiRGF0ZSIsIm5vdyIsImJsb2IiLCJyZXBsYWNlIiwiQnVmZmVyIiwiZnJvbSIsImFjY2VzcyIsImNvbnRlbnRUeXBlIiwibWltZVR5cGUiLCJ0aXRsZSIsInRyaW0iLCJzbHVnIiwidG9Mb3dlckNhc2UiLCJpbnNlcnQiLCJ2YWx1ZXMiLCJkZXNjcmlwdGlvbiIsImltYWdlVXJsIiwiY2F0ZWdvcnkiLCJmZWF0dXJlZCIsInB1Ymxpc2hlZCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/gallery/drive/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/auth.ts":
/*!*************************!*\
  !*** ./src/lib/auth.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   auth: () => (/* binding */ auth)\n/* harmony export */ });\n/* harmony import */ var better_auth__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! better-auth */ \"(rsc)/./node_modules/.pnpm/better-auth@1.7.15_drizzle-orm@0.45.4_@types+pg@8.23.1_kysely@0.29.8_pg@8.23.1__next@14_f5743b56dd5d12f87c21945c7c0f135d/node_modules/better-auth/dist/auth/full.mjs\");\n/* harmony import */ var better_auth_adapters_drizzle__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! better-auth/adapters/drizzle */ \"(rsc)/./node_modules/.pnpm/@better-auth+drizzle-adapter@1.7.15_@better-auth+core@1.7.15_@better-auth+utils@0.5.1_@_7db781423c3b2aa3e092de9f019bc02c/node_modules/@better-auth/drizzle-adapter/dist/index.mjs\");\n/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/lib/db */ \"(rsc)/./src/lib/db/index.ts\");\n/* harmony import */ var _lib_db_schema__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/db/schema */ \"(rsc)/./src/lib/db/schema.ts\");\n/* harmony import */ var resend__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! resend */ \"(rsc)/./node_modules/.pnpm/resend@6.37.0/node_modules/resend/dist/index.mjs\");\n\n\n\n\n\nconst origin = (value)=>value ? value.startsWith(\"http\") ? value : `https://${value}` : undefined;\nconst trustedOrigins = [\n    \"http://localhost:3000\",\n    origin(process.env.V0_RUNTIME_URL),\n    origin(process.env.V0_DEV_APP_URL),\n    origin(process.env.V0_BUILD_URL),\n    origin(process.env.V0_SANDBOX_URL),\n    origin(process.env.VERCEL_URL),\n    origin(process.env.VERCEL_PROJECT_PRODUCTION_URL)\n].filter(Boolean);\nconst auth = (0,better_auth__WEBPACK_IMPORTED_MODULE_3__.betterAuth)({\n    database: (0,better_auth_adapters_drizzle__WEBPACK_IMPORTED_MODULE_4__.drizzleAdapter)(_lib_db__WEBPACK_IMPORTED_MODULE_0__.db, {\n        provider: \"pg\",\n        schema: _lib_db_schema__WEBPACK_IMPORTED_MODULE_1__\n    }),\n    emailAndPassword: {\n        enabled: true,\n        sendResetPassword: async ({ user, url })=>{\n            const resend = new resend__WEBPACK_IMPORTED_MODULE_2__.Resend(process.env.RESEND_API_KEY);\n            const domain = process.env.RESEND_EMAIL_DOMAIN || \"ashokrimal.com.np\";\n            await resend.emails.send({\n                from: `Portfolio Admin <noreply@${domain}>`,\n                to: \"info.ashokrimal@gmail.com\",\n                subject: \"Reset your admin password\",\n                html: `<p>You requested a password reset for the portfolio admin.</p><p><a href=\"${url}\">Reset your password</a></p><p>This link expires soon. If you did not request it, you can ignore this email.</p>`\n            });\n        }\n    },\n    baseURL: origin(process.env.BETTER_AUTH_URL) || origin(process.env.VERCEL_PROJECT_PRODUCTION_URL) || origin(process.env.VERCEL_URL) || origin(process.env.V0_RUNTIME_URL),\n    trustedOrigins,\n    ... true ? {\n        advanced: {\n            defaultCookieAttributes: {\n                sameSite: \"none\",\n                secure: true\n            }\n        }\n    } : 0\n});\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL2F1dGgudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQXdDO0FBQ3FCO0FBQ2hDO0FBQ1k7QUFDVjtBQUUvQixNQUFNSyxTQUFTLENBQUNDLFFBQW1CQSxRQUFTQSxNQUFNQyxVQUFVLENBQUMsVUFBVUQsUUFBUSxDQUFDLFFBQVEsRUFBRUEsTUFBTSxDQUFDLEdBQUlFO0FBQ3JHLE1BQU1DLGlCQUFpQjtJQUNyQjtJQUNBSixPQUFPSyxRQUFRQyxHQUFHLENBQUNDLGNBQWM7SUFBR1AsT0FBT0ssUUFBUUMsR0FBRyxDQUFDRSxjQUFjO0lBQUdSLE9BQU9LLFFBQVFDLEdBQUcsQ0FBQ0csWUFBWTtJQUFHVCxPQUFPSyxRQUFRQyxHQUFHLENBQUNJLGNBQWM7SUFDM0lWLE9BQU9LLFFBQVFDLEdBQUcsQ0FBQ0ssVUFBVTtJQUFHWCxPQUFPSyxRQUFRQyxHQUFHLENBQUNNLDZCQUE2QjtDQUNqRixDQUFDQyxNQUFNLENBQUNDO0FBRUYsTUFBTUMsT0FBT3BCLHVEQUFVQSxDQUFDO0lBQzdCcUIsVUFBVXBCLDRFQUFjQSxDQUFDQyx1Q0FBRUEsRUFBRTtRQUFFb0IsVUFBVTtRQUFNbkIsTUFBTUEsNkNBQUFBO0lBQUM7SUFDdERvQixrQkFBa0I7UUFDaEJDLFNBQVM7UUFDVEMsbUJBQW1CLE9BQU8sRUFBRUMsSUFBSSxFQUFFQyxHQUFHLEVBQUU7WUFDckMsTUFBTUMsU0FBUyxJQUFJeEIsMENBQU1BLENBQUNNLFFBQVFDLEdBQUcsQ0FBQ2tCLGNBQWM7WUFDcEQsTUFBTUMsU0FBU3BCLFFBQVFDLEdBQUcsQ0FBQ29CLG1CQUFtQixJQUFJO1lBQ2xELE1BQU1ILE9BQU9JLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDO2dCQUN2QkMsTUFBTSxDQUFDLHlCQUF5QixFQUFFSixPQUFPLENBQUMsQ0FBQztnQkFDM0NLLElBQUk7Z0JBQ0pDLFNBQVM7Z0JBQ1RDLE1BQU0sQ0FBQywwRUFBMEUsRUFBRVYsSUFBSSxpSEFBaUgsQ0FBQztZQUMzTTtRQUNGO0lBQ0Y7SUFDQVcsU0FBU2pDLE9BQU9LLFFBQVFDLEdBQUcsQ0FBQzRCLGVBQWUsS0FBS2xDLE9BQU9LLFFBQVFDLEdBQUcsQ0FBQ00sNkJBQTZCLEtBQUtaLE9BQU9LLFFBQVFDLEdBQUcsQ0FBQ0ssVUFBVSxLQUFLWCxPQUFPSyxRQUFRQyxHQUFHLENBQUNDLGNBQWM7SUFDeEtIO0lBQ0EsR0FBSUMsS0FBeUIsR0FBZ0I7UUFBRThCLFVBQVU7WUFBRUMseUJBQXlCO2dCQUFFQyxVQUFVO2dCQUFpQkMsUUFBUTtZQUFLO1FBQUU7SUFBRSxJQUFJLENBQUU7QUFDMUksR0FBRSIsInNvdXJjZXMiOlsid2VicGFjazovL2xhbWlya29oc2EtZGV2Ly4vc3JjL2xpYi9hdXRoLnRzPzY2OTIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYmV0dGVyQXV0aCB9IGZyb20gJ2JldHRlci1hdXRoJ1xuaW1wb3J0IHsgZHJpenpsZUFkYXB0ZXIgfSBmcm9tICdiZXR0ZXItYXV0aC9hZGFwdGVycy9kcml6emxlJ1xuaW1wb3J0IHsgZGIgfSBmcm9tICdAL2xpYi9kYidcbmltcG9ydCAqIGFzIHNjaGVtYSBmcm9tICdAL2xpYi9kYi9zY2hlbWEnXG5pbXBvcnQgeyBSZXNlbmQgfSBmcm9tICdyZXNlbmQnXG5cbmNvbnN0IG9yaWdpbiA9ICh2YWx1ZT86IHN0cmluZykgPT4gdmFsdWUgPyAodmFsdWUuc3RhcnRzV2l0aCgnaHR0cCcpID8gdmFsdWUgOiBgaHR0cHM6Ly8ke3ZhbHVlfWApIDogdW5kZWZpbmVkXG5jb25zdCB0cnVzdGVkT3JpZ2lucyA9IFtcbiAgJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsXG4gIG9yaWdpbihwcm9jZXNzLmVudi5WMF9SVU5USU1FX1VSTCksIG9yaWdpbihwcm9jZXNzLmVudi5WMF9ERVZfQVBQX1VSTCksIG9yaWdpbihwcm9jZXNzLmVudi5WMF9CVUlMRF9VUkwpLCBvcmlnaW4ocHJvY2Vzcy5lbnYuVjBfU0FOREJPWF9VUkwpLFxuICBvcmlnaW4ocHJvY2Vzcy5lbnYuVkVSQ0VMX1VSTCksIG9yaWdpbihwcm9jZXNzLmVudi5WRVJDRUxfUFJPSkVDVF9QUk9EVUNUSU9OX1VSTCksXG5dLmZpbHRlcihCb29sZWFuKSBhcyBzdHJpbmdbXVxuXG5leHBvcnQgY29uc3QgYXV0aCA9IGJldHRlckF1dGgoe1xuICBkYXRhYmFzZTogZHJpenpsZUFkYXB0ZXIoZGIsIHsgcHJvdmlkZXI6ICdwZycsIHNjaGVtYSB9KSxcbiAgZW1haWxBbmRQYXNzd29yZDoge1xuICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgc2VuZFJlc2V0UGFzc3dvcmQ6IGFzeW5jICh7IHVzZXIsIHVybCB9KSA9PiB7XG4gICAgICBjb25zdCByZXNlbmQgPSBuZXcgUmVzZW5kKHByb2Nlc3MuZW52LlJFU0VORF9BUElfS0VZKVxuICAgICAgY29uc3QgZG9tYWluID0gcHJvY2Vzcy5lbnYuUkVTRU5EX0VNQUlMX0RPTUFJTiB8fCAnYXNob2tyaW1hbC5jb20ubnAnXG4gICAgICBhd2FpdCByZXNlbmQuZW1haWxzLnNlbmQoe1xuICAgICAgICBmcm9tOiBgUG9ydGZvbGlvIEFkbWluIDxub3JlcGx5QCR7ZG9tYWlufT5gLFxuICAgICAgICB0bzogJ2luZm8uYXNob2tyaW1hbEBnbWFpbC5jb20nLFxuICAgICAgICBzdWJqZWN0OiAnUmVzZXQgeW91ciBhZG1pbiBwYXNzd29yZCcsXG4gICAgICAgIGh0bWw6IGA8cD5Zb3UgcmVxdWVzdGVkIGEgcGFzc3dvcmQgcmVzZXQgZm9yIHRoZSBwb3J0Zm9saW8gYWRtaW4uPC9wPjxwPjxhIGhyZWY9XCIke3VybH1cIj5SZXNldCB5b3VyIHBhc3N3b3JkPC9hPjwvcD48cD5UaGlzIGxpbmsgZXhwaXJlcyBzb29uLiBJZiB5b3UgZGlkIG5vdCByZXF1ZXN0IGl0LCB5b3UgY2FuIGlnbm9yZSB0aGlzIGVtYWlsLjwvcD5gLFxuICAgICAgfSlcbiAgICB9LFxuICB9LFxuICBiYXNlVVJMOiBvcmlnaW4ocHJvY2Vzcy5lbnYuQkVUVEVSX0FVVEhfVVJMKSB8fCBvcmlnaW4ocHJvY2Vzcy5lbnYuVkVSQ0VMX1BST0pFQ1RfUFJPRFVDVElPTl9VUkwpIHx8IG9yaWdpbihwcm9jZXNzLmVudi5WRVJDRUxfVVJMKSB8fCBvcmlnaW4ocHJvY2Vzcy5lbnYuVjBfUlVOVElNRV9VUkwpLFxuICB0cnVzdGVkT3JpZ2lucyxcbiAgLi4uKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnID8geyBhZHZhbmNlZDogeyBkZWZhdWx0Q29va2llQXR0cmlidXRlczogeyBzYW1lU2l0ZTogJ25vbmUnIGFzIGNvbnN0LCBzZWN1cmU6IHRydWUgfSB9IH0gOiB7fSksXG59KVxuIl0sIm5hbWVzIjpbImJldHRlckF1dGgiLCJkcml6emxlQWRhcHRlciIsImRiIiwic2NoZW1hIiwiUmVzZW5kIiwib3JpZ2luIiwidmFsdWUiLCJzdGFydHNXaXRoIiwidW5kZWZpbmVkIiwidHJ1c3RlZE9yaWdpbnMiLCJwcm9jZXNzIiwiZW52IiwiVjBfUlVOVElNRV9VUkwiLCJWMF9ERVZfQVBQX1VSTCIsIlYwX0JVSUxEX1VSTCIsIlYwX1NBTkRCT1hfVVJMIiwiVkVSQ0VMX1VSTCIsIlZFUkNFTF9QUk9KRUNUX1BST0RVQ1RJT05fVVJMIiwiZmlsdGVyIiwiQm9vbGVhbiIsImF1dGgiLCJkYXRhYmFzZSIsInByb3ZpZGVyIiwiZW1haWxBbmRQYXNzd29yZCIsImVuYWJsZWQiLCJzZW5kUmVzZXRQYXNzd29yZCIsInVzZXIiLCJ1cmwiLCJyZXNlbmQiLCJSRVNFTkRfQVBJX0tFWSIsImRvbWFpbiIsIlJFU0VORF9FTUFJTF9ET01BSU4iLCJlbWFpbHMiLCJzZW5kIiwiZnJvbSIsInRvIiwic3ViamVjdCIsImh0bWwiLCJiYXNlVVJMIiwiQkVUVEVSX0FVVEhfVVJMIiwiYWR2YW5jZWQiLCJkZWZhdWx0Q29va2llQXR0cmlidXRlcyIsInNhbWVTaXRlIiwic2VjdXJlIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/db/index.ts":
/*!*****************************!*\
  !*** ./src/lib/db/index.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   db: () => (/* binding */ db),\n/* harmony export */   pool: () => (/* binding */ pool)\n/* harmony export */ });\n/* harmony import */ var drizzle_orm_node_postgres__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! drizzle-orm/node-postgres */ \"(rsc)/./node_modules/.pnpm/drizzle-orm@0.45.4_@types+pg@8.23.1_kysely@0.29.8_pg@8.23.1/node_modules/drizzle-orm/node-postgres/driver.js\");\n/* harmony import */ var pg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! pg */ \"pg\");\n/* harmony import */ var pg__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(pg__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _schema__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./schema */ \"(rsc)/./src/lib/db/schema.ts\");\n\n\n\nconst pool = new pg__WEBPACK_IMPORTED_MODULE_0__.Pool({\n    connectionString: process.env.DATABASE_URL\n});\nconst db = (0,drizzle_orm_node_postgres__WEBPACK_IMPORTED_MODULE_2__.drizzle)(pool, {\n    schema: _schema__WEBPACK_IMPORTED_MODULE_1__\n});\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL2RiL2luZGV4LnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFtRDtBQUMxQjtBQUNTO0FBRTNCLE1BQU1HLE9BQU8sSUFBSUYsb0NBQUlBLENBQUM7SUFBRUcsa0JBQWtCQyxRQUFRQyxHQUFHLENBQUNDLFlBQVk7QUFBQyxHQUFFO0FBQ3JFLE1BQU1DLEtBQUtSLGtFQUFPQSxDQUFDRyxNQUFNO0lBQUVELE1BQU1BLHNDQUFBQTtBQUFDLEdBQUUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9sYW1pcmtvaHNhLWRldi8uL3NyYy9saWIvZGIvaW5kZXgudHM/NThkOCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkcml6emxlIH0gZnJvbSAnZHJpenpsZS1vcm0vbm9kZS1wb3N0Z3JlcydcbmltcG9ydCB7IFBvb2wgfSBmcm9tICdwZydcbmltcG9ydCAqIGFzIHNjaGVtYSBmcm9tICcuL3NjaGVtYSdcblxuZXhwb3J0IGNvbnN0IHBvb2wgPSBuZXcgUG9vbCh7IGNvbm5lY3Rpb25TdHJpbmc6IHByb2Nlc3MuZW52LkRBVEFCQVNFX1VSTCB9KVxuZXhwb3J0IGNvbnN0IGRiID0gZHJpenpsZShwb29sLCB7IHNjaGVtYSB9KVxuIl0sIm5hbWVzIjpbImRyaXp6bGUiLCJQb29sIiwic2NoZW1hIiwicG9vbCIsImNvbm5lY3Rpb25TdHJpbmciLCJwcm9jZXNzIiwiZW52IiwiREFUQUJBU0VfVVJMIiwiZGIiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/db/index.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/db/schema.ts":
/*!******************************!*\
  !*** ./src/lib/db/schema.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   account: () => (/* binding */ account),\n/* harmony export */   animeMangaItem: () => (/* binding */ animeMangaItem),\n/* harmony export */   cmsContent: () => (/* binding */ cmsContent),\n/* harmony export */   galleryItem: () => (/* binding */ galleryItem),\n/* harmony export */   inboxMessage: () => (/* binding */ inboxMessage),\n/* harmony export */   musicTrack: () => (/* binding */ musicTrack),\n/* harmony export */   portfolioProject: () => (/* binding */ portfolioProject),\n/* harmony export */   profileSettings: () => (/* binding */ profileSettings),\n/* harmony export */   session: () => (/* binding */ session),\n/* harmony export */   user: () => (/* binding */ user),\n/* harmony export */   verification: () => (/* binding */ verification)\n/* harmony export */ });\n/* harmony import */ var drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! drizzle-orm/pg-core */ \"(rsc)/./node_modules/.pnpm/drizzle-orm@0.45.4_@types+pg@8.23.1_kysely@0.29.8_pg@8.23.1/node_modules/drizzle-orm/pg-core/table.js\");\n/* harmony import */ var drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! drizzle-orm/pg-core */ \"(rsc)/./node_modules/.pnpm/drizzle-orm@0.45.4_@types+pg@8.23.1_kysely@0.29.8_pg@8.23.1/node_modules/drizzle-orm/pg-core/columns/text.js\");\n/* harmony import */ var drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! drizzle-orm/pg-core */ \"(rsc)/./node_modules/.pnpm/drizzle-orm@0.45.4_@types+pg@8.23.1_kysely@0.29.8_pg@8.23.1/node_modules/drizzle-orm/pg-core/columns/boolean.js\");\n/* harmony import */ var drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! drizzle-orm/pg-core */ \"(rsc)/./node_modules/.pnpm/drizzle-orm@0.45.4_@types+pg@8.23.1_kysely@0.29.8_pg@8.23.1/node_modules/drizzle-orm/pg-core/columns/timestamp.js\");\n/* harmony import */ var drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! drizzle-orm/pg-core */ \"(rsc)/./node_modules/.pnpm/drizzle-orm@0.45.4_@types+pg@8.23.1_kysely@0.29.8_pg@8.23.1/node_modules/drizzle-orm/pg-core/columns/serial.js\");\n/* harmony import */ var drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! drizzle-orm/pg-core */ \"(rsc)/./node_modules/.pnpm/drizzle-orm@0.45.4_@types+pg@8.23.1_kysely@0.29.8_pg@8.23.1/node_modules/drizzle-orm/pg-core/columns/integer.js\");\n/* harmony import */ var drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! drizzle-orm/pg-core */ \"(rsc)/./node_modules/.pnpm/drizzle-orm@0.45.4_@types+pg@8.23.1_kysely@0.29.8_pg@8.23.1/node_modules/drizzle-orm/pg-core/columns/jsonb.js\");\n\nconst user = (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_0__.pgTable)(\"user\", {\n    id: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"id\").primaryKey(),\n    name: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"name\").notNull(),\n    email: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"email\").notNull().unique(),\n    emailVerified: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_2__.boolean)(\"emailVerified\").notNull().default(false),\n    image: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"image\"),\n    createdAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"createdAt\").notNull().defaultNow(),\n    updatedAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"updatedAt\").notNull().defaultNow()\n});\nconst session = (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_0__.pgTable)(\"session\", {\n    id: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"id\").primaryKey(),\n    expiresAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"expiresAt\").notNull(),\n    token: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"token\").notNull().unique(),\n    createdAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"createdAt\").notNull().defaultNow(),\n    updatedAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"updatedAt\").notNull().defaultNow(),\n    ipAddress: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"ipAddress\"),\n    userAgent: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"userAgent\"),\n    userId: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"userId\").notNull()\n});\nconst account = (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_0__.pgTable)(\"account\", {\n    id: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"id\").primaryKey(),\n    accountId: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"accountId\").notNull(),\n    providerId: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"providerId\").notNull(),\n    userId: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"userId\").notNull(),\n    accessToken: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"accessToken\"),\n    refreshToken: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"refreshToken\"),\n    idToken: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"idToken\"),\n    accessTokenExpiresAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"accessTokenExpiresAt\"),\n    refreshTokenExpiresAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"refreshTokenExpiresAt\"),\n    scope: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"scope\"),\n    password: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"password\"),\n    createdAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"createdAt\").notNull().defaultNow(),\n    updatedAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"updatedAt\").notNull().defaultNow()\n});\nconst verification = (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_0__.pgTable)(\"verification\", {\n    id: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"id\").primaryKey(),\n    identifier: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"identifier\").notNull(),\n    value: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"value\").notNull(),\n    expiresAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"expiresAt\").notNull(),\n    createdAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"createdAt\").defaultNow(),\n    updatedAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"updatedAt\").defaultNow()\n});\nconst galleryItem = (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_0__.pgTable)(\"galleryItem\", {\n    id: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_4__.serial)(\"id\").primaryKey(),\n    userId: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"userId\").notNull(),\n    title: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"title\"),\n    slug: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"slug\").notNull(),\n    description: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"description\"),\n    imageUrl: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"imageUrl\").notNull(),\n    category: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"category\").notNull().default(\"Selected work\"),\n    featured: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_2__.boolean)(\"featured\").notNull().default(false),\n    published: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_2__.boolean)(\"published\").notNull().default(true),\n    createdAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"createdAt\").notNull().defaultNow(),\n    updatedAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"updatedAt\").notNull().defaultNow()\n});\nconst profileSettings = (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_0__.pgTable)(\"profileSettings\", {\n    id: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_4__.serial)(\"id\").primaryKey(),\n    userId: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"userId\").notNull().unique(),\n    githubUsername: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"githubUsername\"),\n    malUsername: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"malUsername\"),\n    lastfmUsername: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"lastfmUsername\"),\n    listenbrainzUsername: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"listenbrainzUsername\"),\n    malUsernames: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"malUsernames\").array().notNull().default([]),\n    anilistUsernames: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"anilistUsernames\").array().notNull().default([]),\n    spotifyProfileUrl: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"spotifyProfileUrl\"),\n    updatedAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"updatedAt\").notNull().defaultNow()\n});\nconst musicTrack = (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_0__.pgTable)(\"musicTrack\", {\n    id: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_4__.serial)(\"id\").primaryKey(),\n    userId: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"userId\").notNull(),\n    title: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"title\").notNull(),\n    artist: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"artist\").notNull(),\n    audioUrl: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"audioUrl\").notNull(),\n    coverUrl: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"coverUrl\"),\n    album: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"album\"),\n    published: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_2__.boolean)(\"published\").notNull().default(true),\n    sortOrder: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_5__.integer)(\"sortOrder\").notNull().default(0),\n    createdAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"createdAt\").notNull().defaultNow()\n});\nconst portfolioProject = (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_0__.pgTable)(\"portfolioProject\", {\n    id: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_4__.serial)(\"id\").primaryKey(),\n    userId: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"userId\").notNull(),\n    title: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"title\").notNull(),\n    slug: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"slug\").notNull(),\n    summary: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"summary\").notNull(),\n    description: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"description\"),\n    tech: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"tech\").array().notNull().default([]),\n    imageUrl: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"imageUrl\"),\n    liveUrl: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"liveUrl\"),\n    featured: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_2__.boolean)(\"featured\").notNull().default(false),\n    published: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_2__.boolean)(\"published\").notNull().default(true),\n    createdAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"createdAt\").notNull().defaultNow(),\n    updatedAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"updatedAt\").notNull().defaultNow()\n});\nconst inboxMessage = (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_0__.pgTable)(\"inboxMessage\", {\n    id: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"id\").primaryKey(),\n    fromEmail: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"fromEmail\").notNull(),\n    toEmail: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"toEmail\").notNull(),\n    subject: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"subject\").notNull(),\n    textBody: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"textBody\"),\n    htmlBody: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"htmlBody\"),\n    receivedAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"receivedAt\").notNull().defaultNow(),\n    readAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"readAt\"),\n    archivedAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"archivedAt\")\n});\nconst animeMangaItem = (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_0__.pgTable)(\"animeMangaItem\", {\n    id: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_4__.serial)(\"id\").primaryKey(),\n    userId: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"userId\").notNull(),\n    kind: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"kind\").notNull(),\n    externalId: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"externalId\"),\n    title: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"title\").notNull(),\n    status: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"status\"),\n    score: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"score\"),\n    progress: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"progress\"),\n    imageUrl: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"imageUrl\"),\n    synopsis: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"synopsis\"),\n    source: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"source\").notNull().default(\"import\"),\n    rawData: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_6__.jsonb)(\"rawData\").$type().notNull().default({}),\n    createdAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"createdAt\").notNull().defaultNow(),\n    updatedAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"updatedAt\").notNull().defaultNow()\n});\nconst cmsContent = (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_0__.pgTable)(\"cmsContent\", {\n    id: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_4__.serial)(\"id\").primaryKey(),\n    userId: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"userId\").notNull(),\n    collection: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"collection\").notNull(),\n    title: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"title\").notNull(),\n    slug: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"slug\").notNull(),\n    payload: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_6__.jsonb)(\"payload\").$type().notNull().default({}),\n    status: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_1__.text)(\"status\").notNull().default(\"draft\"),\n    sortOrder: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_5__.integer)(\"sortOrder\").notNull().default(0),\n    createdAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"createdAt\").notNull().defaultNow(),\n    updatedAt: (0,drizzle_orm_pg_core__WEBPACK_IMPORTED_MODULE_3__.timestamp)(\"updatedAt\").notNull().defaultNow()\n});\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDLFVBQVVNLE9BQU87SUFBSTJFLFlBQVlqRix5REFBSUEsQ0FBQyxjQUFjTSxPQUFPO0lBQUk2QixPQUFPbkMseURBQUlBLENBQUMsU0FBU00sT0FBTztJQUFJOEIsTUFBTXBDLHlEQUFJQSxDQUFDLFFBQVFNLE9BQU87SUFBSTRFLFNBQVNyRiwwREFBS0EsQ0FBQyxXQUFXa0YsS0FBSyxHQUE0QnpFLE9BQU8sR0FBR0ksT0FBTyxDQUFDLENBQUM7SUFBSStELFFBQVF6RSx5REFBSUEsQ0FBQyxVQUFVTSxPQUFPLEdBQUdJLE9BQU8sQ0FBQztJQUFVOEMsV0FBVzVELDREQUFPQSxDQUFDLGFBQWFVLE9BQU8sR0FBR0ksT0FBTyxDQUFDO0lBQUlFLFdBQVdYLDhEQUFTQSxDQUFDLGFBQWFLLE9BQU8sR0FBR08sVUFBVTtJQUFJQyxXQUFXYiw4REFBU0EsQ0FBQyxhQUFhSyxPQUFPLEdBQUdPLFVBQVU7QUFBRyxHQUFFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbGFtaXJrb2hzYS1kZXYvLi9zcmMvbGliL2RiL3NjaGVtYS50cz82MmI2Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJvb2xlYW4sIGludGVnZXIsIGpzb25iLCBwZ1RhYmxlLCBzZXJpYWwsIHRleHQsIHRpbWVzdGFtcCB9IGZyb20gJ2RyaXp6bGUtb3JtL3BnLWNvcmUnXG5cbmV4cG9ydCBjb25zdCB1c2VyID0gcGdUYWJsZSgndXNlcicsIHsgaWQ6IHRleHQoJ2lkJykucHJpbWFyeUtleSgpLCBuYW1lOiB0ZXh0KCduYW1lJykubm90TnVsbCgpLCBlbWFpbDogdGV4dCgnZW1haWwnKS5ub3ROdWxsKCkudW5pcXVlKCksIGVtYWlsVmVyaWZpZWQ6IGJvb2xlYW4oJ2VtYWlsVmVyaWZpZWQnKS5ub3ROdWxsKCkuZGVmYXVsdChmYWxzZSksIGltYWdlOiB0ZXh0KCdpbWFnZScpLCBjcmVhdGVkQXQ6IHRpbWVzdGFtcCgnY3JlYXRlZEF0Jykubm90TnVsbCgpLmRlZmF1bHROb3coKSwgdXBkYXRlZEF0OiB0aW1lc3RhbXAoJ3VwZGF0ZWRBdCcpLm5vdE51bGwoKS5kZWZhdWx0Tm93KCkgfSlcbmV4cG9ydCBjb25zdCBzZXNzaW9uID0gcGdUYWJsZSgnc2Vzc2lvbicsIHsgaWQ6IHRleHQoJ2lkJykucHJpbWFyeUtleSgpLCBleHBpcmVzQXQ6IHRpbWVzdGFtcCgnZXhwaXJlc0F0Jykubm90TnVsbCgpLCB0b2tlbjogdGV4dCgndG9rZW4nKS5ub3ROdWxsKCkudW5pcXVlKCksIGNyZWF0ZWRBdDogdGltZXN0YW1wKCdjcmVhdGVkQXQnKS5ub3ROdWxsKCkuZGVmYXVsdE5vdygpLCB1cGRhdGVkQXQ6IHRpbWVzdGFtcCgndXBkYXRlZEF0Jykubm90TnVsbCgpLmRlZmF1bHROb3coKSwgaXBBZGRyZXNzOiB0ZXh0KCdpcEFkZHJlc3MnKSwgdXNlckFnZW50OiB0ZXh0KCd1c2VyQWdlbnQnKSwgdXNlcklkOiB0ZXh0KCd1c2VySWQnKS5ub3ROdWxsKCkgfSlcbmV4cG9ydCBjb25zdCBhY2NvdW50ID0gcGdUYWJsZSgnYWNjb3VudCcsIHsgaWQ6IHRleHQoJ2lkJykucHJpbWFyeUtleSgpLCBhY2NvdW50SWQ6IHRleHQoJ2FjY291bnRJZCcpLm5vdE51bGwoKSwgcHJvdmlkZXJJZDogdGV4dCgncHJvdmlkZXJJZCcpLm5vdE51bGwoKSwgdXNlcklkOiB0ZXh0KCd1c2VySWQnKS5ub3ROdWxsKCksIGFjY2Vzc1Rva2VuOiB0ZXh0KCdhY2Nlc3NUb2tlbicpLCByZWZyZXNoVG9rZW46IHRleHQoJ3JlZnJlc2hUb2tlbicpLCBpZFRva2VuOiB0ZXh0KCdpZFRva2VuJyksIGFjY2Vzc1Rva2VuRXhwaXJlc0F0OiB0aW1lc3RhbXAoJ2FjY2Vzc1Rva2VuRXhwaXJlc0F0JyksIHJlZnJlc2hUb2tlbkV4cGlyZXNBdDogdGltZXN0YW1wKCdyZWZyZXNoVG9rZW5FeHBpcmVzQXQnKSwgc2NvcGU6IHRleHQoJ3Njb3BlJyksIHBhc3N3b3JkOiB0ZXh0KCdwYXNzd29yZCcpLCBjcmVhdGVkQXQ6IHRpbWVzdGFtcCgnY3JlYXRlZEF0Jykubm90TnVsbCgpLmRlZmF1bHROb3coKSwgdXBkYXRlZEF0OiB0aW1lc3RhbXAoJ3VwZGF0ZWRBdCcpLm5vdE51bGwoKS5kZWZhdWx0Tm93KCkgfSlcbmV4cG9ydCBjb25zdCB2ZXJpZmljYXRpb24gPSBwZ1RhYmxlKCd2ZXJpZmljYXRpb24nLCB7IGlkOiB0ZXh0KCdpZCcpLnByaW1hcnlLZXkoKSwgaWRlbnRpZmllcjogdGV4dCgnaWRlbnRpZmllcicpLm5vdE51bGwoKSwgdmFsdWU6IHRleHQoJ3ZhbHVlJykubm90TnVsbCgpLCBleHBpcmVzQXQ6IHRpbWVzdGFtcCgnZXhwaXJlc0F0Jykubm90TnVsbCgpLCBjcmVhdGVkQXQ6IHRpbWVzdGFtcCgnY3JlYXRlZEF0JykuZGVmYXVsdE5vdygpLCB1cGRhdGVkQXQ6IHRpbWVzdGFtcCgndXBkYXRlZEF0JykuZGVmYXVsdE5vdygpIH0pXG5leHBvcnQgY29uc3QgZ2FsbGVyeUl0ZW0gPSBwZ1RhYmxlKCdnYWxsZXJ5SXRlbScsIHsgaWQ6IHNlcmlhbCgnaWQnKS5wcmltYXJ5S2V5KCksIHVzZXJJZDogdGV4dCgndXNlcklkJykubm90TnVsbCgpLCB0aXRsZTogdGV4dCgndGl0bGUnKSwgc2x1ZzogdGV4dCgnc2x1ZycpLm5vdE51bGwoKSwgZGVzY3JpcHRpb246IHRleHQoJ2Rlc2NyaXB0aW9uJyksIGltYWdlVXJsOiB0ZXh0KCdpbWFnZVVybCcpLm5vdE51bGwoKSwgY2F0ZWdvcnk6IHRleHQoJ2NhdGVnb3J5Jykubm90TnVsbCgpLmRlZmF1bHQoJ1NlbGVjdGVkIHdvcmsnKSwgZmVhdHVyZWQ6IGJvb2xlYW4oJ2ZlYXR1cmVkJykubm90TnVsbCgpLmRlZmF1bHQoZmFsc2UpLCBwdWJsaXNoZWQ6IGJvb2xlYW4oJ3B1Ymxpc2hlZCcpLm5vdE51bGwoKS5kZWZhdWx0KHRydWUpLCBjcmVhdGVkQXQ6IHRpbWVzdGFtcCgnY3JlYXRlZEF0Jykubm90TnVsbCgpLmRlZmF1bHROb3coKSwgdXBkYXRlZEF0OiB0aW1lc3RhbXAoJ3VwZGF0ZWRBdCcpLm5vdE51bGwoKS5kZWZhdWx0Tm93KCkgfSlcbmV4cG9ydCBjb25zdCBwcm9maWxlU2V0dGluZ3MgPSBwZ1RhYmxlKCdwcm9maWxlU2V0dGluZ3MnLCB7IGlkOiBzZXJpYWwoJ2lkJykucHJpbWFyeUtleSgpLCB1c2VySWQ6IHRleHQoJ3VzZXJJZCcpLm5vdE51bGwoKS51bmlxdWUoKSwgZ2l0aHViVXNlcm5hbWU6IHRleHQoJ2dpdGh1YlVzZXJuYW1lJyksIG1hbFVzZXJuYW1lOiB0ZXh0KCdtYWxVc2VybmFtZScpLCBsYXN0Zm1Vc2VybmFtZTogdGV4dCgnbGFzdGZtVXNlcm5hbWUnKSwgbGlzdGVuYnJhaW56VXNlcm5hbWU6IHRleHQoJ2xpc3RlbmJyYWluelVzZXJuYW1lJyksIG1hbFVzZXJuYW1lczogdGV4dCgnbWFsVXNlcm5hbWVzJykuYXJyYXkoKS5ub3ROdWxsKCkuZGVmYXVsdChbXSksIGFuaWxpc3RVc2VybmFtZXM6IHRleHQoJ2FuaWxpc3RVc2VybmFtZXMnKS5hcnJheSgpLm5vdE51bGwoKS5kZWZhdWx0KFtdKSwgc3BvdGlmeVByb2ZpbGVVcmw6IHRleHQoJ3Nwb3RpZnlQcm9maWxlVXJsJyksIHVwZGF0ZWRBdDogdGltZXN0YW1wKCd1cGRhdGVkQXQnKS5ub3ROdWxsKCkuZGVmYXVsdE5vdygpIH0pXG5leHBvcnQgY29uc3QgbXVzaWNUcmFjayA9IHBnVGFibGUoJ211c2ljVHJhY2snLCB7IGlkOiBzZXJpYWwoJ2lkJykucHJpbWFyeUtleSgpLCB1c2VySWQ6IHRleHQoJ3VzZXJJZCcpLm5vdE51bGwoKSwgdGl0bGU6IHRleHQoJ3RpdGxlJykubm90TnVsbCgpLCBhcnRpc3Q6IHRleHQoJ2FydGlzdCcpLm5vdE51bGwoKSwgYXVkaW9Vcmw6IHRleHQoJ2F1ZGlvVXJsJykubm90TnVsbCgpLCBjb3ZlclVybDogdGV4dCgnY292ZXJVcmwnKSwgYWxidW06IHRleHQoJ2FsYnVtJyksIHB1Ymxpc2hlZDogYm9vbGVhbigncHVibGlzaGVkJykubm90TnVsbCgpLmRlZmF1bHQodHJ1ZSksIHNvcnRPcmRlcjogaW50ZWdlcignc29ydE9yZGVyJykubm90TnVsbCgpLmRlZmF1bHQoMCksIGNyZWF0ZWRBdDogdGltZXN0YW1wKCdjcmVhdGVkQXQnKS5ub3ROdWxsKCkuZGVmYXVsdE5vdygpIH0pXG5leHBvcnQgY29uc3QgcG9ydGZvbGlvUHJvamVjdCA9IHBnVGFibGUoJ3BvcnRmb2xpb1Byb2plY3QnLCB7IGlkOiBzZXJpYWwoJ2lkJykucHJpbWFyeUtleSgpLCB1c2VySWQ6IHRleHQoJ3VzZXJJZCcpLm5vdE51bGwoKSwgdGl0bGU6IHRleHQoJ3RpdGxlJykubm90TnVsbCgpLCBzbHVnOiB0ZXh0KCdzbHVnJykubm90TnVsbCgpLCBzdW1tYXJ5OiB0ZXh0KCdzdW1tYXJ5Jykubm90TnVsbCgpLCBkZXNjcmlwdGlvbjogdGV4dCgnZGVzY3JpcHRpb24nKSwgdGVjaDogdGV4dCgndGVjaCcpLmFycmF5KCkubm90TnVsbCgpLmRlZmF1bHQoW10pLCBpbWFnZVVybDogdGV4dCgnaW1hZ2VVcmwnKSwgbGl2ZVVybDogdGV4dCgnbGl2ZVVybCcpLCBmZWF0dXJlZDogYm9vbGVhbignZmVhdHVyZWQnKS5ub3ROdWxsKCkuZGVmYXVsdChmYWxzZSksIHB1Ymxpc2hlZDogYm9vbGVhbigncHVibGlzaGVkJykubm90TnVsbCgpLmRlZmF1bHQodHJ1ZSksIGNyZWF0ZWRBdDogdGltZXN0YW1wKCdjcmVhdGVkQXQnKS5ub3ROdWxsKCkuZGVmYXVsdE5vdygpLCB1cGRhdGVkQXQ6IHRpbWVzdGFtcCgndXBkYXRlZEF0Jykubm90TnVsbCgpLmRlZmF1bHROb3coKSB9KVxuZXhwb3J0IGNvbnN0IGluYm94TWVzc2FnZSA9IHBnVGFibGUoJ2luYm94TWVzc2FnZScsIHsgaWQ6IHRleHQoJ2lkJykucHJpbWFyeUtleSgpLCBmcm9tRW1haWw6IHRleHQoJ2Zyb21FbWFpbCcpLm5vdE51bGwoKSwgdG9FbWFpbDogdGV4dCgndG9FbWFpbCcpLm5vdE51bGwoKSwgc3ViamVjdDogdGV4dCgnc3ViamVjdCcpLm5vdE51bGwoKSwgdGV4dEJvZHk6IHRleHQoJ3RleHRCb2R5JyksIGh0bWxCb2R5OiB0ZXh0KCdodG1sQm9keScpLCByZWNlaXZlZEF0OiB0aW1lc3RhbXAoJ3JlY2VpdmVkQXQnKS5ub3ROdWxsKCkuZGVmYXVsdE5vdygpLCByZWFkQXQ6IHRpbWVzdGFtcCgncmVhZEF0JyksIGFyY2hpdmVkQXQ6IHRpbWVzdGFtcCgnYXJjaGl2ZWRBdCcpIH0pXG5leHBvcnQgY29uc3QgYW5pbWVNYW5nYUl0ZW0gPSBwZ1RhYmxlKCdhbmltZU1hbmdhSXRlbScsIHsgaWQ6IHNlcmlhbCgnaWQnKS5wcmltYXJ5S2V5KCksIHVzZXJJZDogdGV4dCgndXNlcklkJykubm90TnVsbCgpLCBraW5kOiB0ZXh0KCdraW5kJykubm90TnVsbCgpLCBleHRlcm5hbElkOiB0ZXh0KCdleHRlcm5hbElkJyksIHRpdGxlOiB0ZXh0KCd0aXRsZScpLm5vdE51bGwoKSwgc3RhdHVzOiB0ZXh0KCdzdGF0dXMnKSwgc2NvcmU6IHRleHQoJ3Njb3JlJyksIHByb2dyZXNzOiB0ZXh0KCdwcm9ncmVzcycpLCBpbWFnZVVybDogdGV4dCgnaW1hZ2VVcmwnKSwgc3lub3BzaXM6IHRleHQoJ3N5bm9wc2lzJyksIHNvdXJjZTogdGV4dCgnc291cmNlJykubm90TnVsbCgpLmRlZmF1bHQoJ2ltcG9ydCcpLCByYXdEYXRhOiBqc29uYigncmF3RGF0YScpLiR0eXBlPFJlY29yZDxzdHJpbmcsIHVua25vd24+PigpLm5vdE51bGwoKS5kZWZhdWx0KHt9KSwgY3JlYXRlZEF0OiB0aW1lc3RhbXAoJ2NyZWF0ZWRBdCcpLm5vdE51bGwoKS5kZWZhdWx0Tm93KCksIHVwZGF0ZWRBdDogdGltZXN0YW1wKCd1cGRhdGVkQXQnKS5ub3ROdWxsKCkuZGVmYXVsdE5vdygpIH0pXG5leHBvcnQgY29uc3QgY21zQ29udGVudCA9IHBnVGFibGUoJ2Ntc0NvbnRlbnQnLCB7IGlkOiBzZXJpYWwoJ2lkJykucHJpbWFyeUtleSgpLCB1c2VySWQ6IHRleHQoJ3VzZXJJZCcpLm5vdE51bGwoKSwgY29sbGVjdGlvbjogdGV4dCgnY29sbGVjdGlvbicpLm5vdE51bGwoKSwgdGl0bGU6IHRleHQoJ3RpdGxlJykubm90TnVsbCgpLCBzbHVnOiB0ZXh0KCdzbHVnJykubm90TnVsbCgpLCBwYXlsb2FkOiBqc29uYigncGF5bG9hZCcpLiR0eXBlPFJlY29yZDxzdHJpbmcsIHVua25vd24+PigpLm5vdE51bGwoKS5kZWZhdWx0KHt9KSwgc3RhdHVzOiB0ZXh0KCdzdGF0dXMnKS5ub3ROdWxsKCkuZGVmYXVsdCgnZHJhZnQnKSwgc29ydE9yZGVyOiBpbnRlZ2VyKCdzb3J0T3JkZXInKS5ub3ROdWxsKCkuZGVmYXVsdCgwKSwgY3JlYXRlZEF0OiB0aW1lc3RhbXAoJ2NyZWF0ZWRBdCcpLm5vdE51bGwoKS5kZWZhdWx0Tm93KCksIHVwZGF0ZWRBdDogdGltZXN0YW1wKCd1cGRhdGVkQXQnKS5ub3ROdWxsKCkuZGVmYXVsdE5vdygpIH0pXG4iXSwibmFtZXMiOlsiYm9vbGVhbiIsImludGVnZXIiLCJqc29uYiIsInBnVGFibGUiLCJzZXJpYWwiLCJ0ZXh0IiwidGltZXN0YW1wIiwidXNlciIsImlkIiwicHJpbWFyeUtleSIsIm5hbWUiLCJub3ROdWxsIiwiZW1haWwiLCJ1bmlxdWUiLCJlbWFpbFZlcmlmaWVkIiwiZGVmYXVsdCIsImltYWdlIiwiY3JlYXRlZEF0IiwiZGVmYXVsdE5vdyIsInVwZGF0ZWRBdCIsInNlc3Npb24iLCJleHBpcmVzQXQiLCJ0b2tlbiIsImlwQWRkcmVzcyIsInVzZXJBZ2VudCIsInVzZXJJZCIsImFjY291bnQiLCJhY2NvdW50SWQiLCJwcm92aWRlcklkIiwiYWNjZXNzVG9rZW4iLCJyZWZyZXNoVG9rZW4iLCJpZFRva2VuIiwiYWNjZXNzVG9rZW5FeHBpcmVzQXQiLCJyZWZyZXNoVG9rZW5FeHBpcmVzQXQiLCJzY29wZSIsInBhc3N3b3JkIiwidmVyaWZpY2F0aW9uIiwiaWRlbnRpZmllciIsInZhbHVlIiwiZ2FsbGVyeUl0ZW0iLCJ0aXRsZSIsInNsdWciLCJkZXNjcmlwdGlvbiIsImltYWdlVXJsIiwiY2F0ZWdvcnkiLCJmZWF0dXJlZCIsInB1Ymxpc2hlZCIsInByb2ZpbGVTZXR0aW5ncyIsImdpdGh1YlVzZXJuYW1lIiwibWFsVXNlcm5hbWUiLCJsYXN0Zm1Vc2VybmFtZSIsImxpc3RlbmJyYWluelVzZXJuYW1lIiwibWFsVXNlcm5hbWVzIiwiYXJyYXkiLCJhbmlsaXN0VXNlcm5hbWVzIiwic3BvdGlmeVByb2ZpbGVVcmwiLCJtdXNpY1RyYWNrIiwiYXJ0aXN0IiwiYXVkaW9VcmwiLCJjb3ZlclVybCIsImFsYnVtIiwic29ydE9yZGVyIiwicG9ydGZvbGlvUHJvamVjdCIsInN1bW1hcnkiLCJ0ZWNoIiwibGl2ZVVybCIsImluYm94TWVzc2FnZSIsImZyb21FbWFpbCIsInRvRW1haWwiLCJzdWJqZWN0IiwidGV4dEJvZHkiLCJodG1sQm9keSIsInJlY2VpdmVkQXQiLCJyZWFkQXQiLCJhcmNoaXZlZEF0IiwiYW5pbWVNYW5nYUl0ZW0iLCJraW5kIiwiZXh0ZXJuYWxJZCIsInN0YXR1cyIsInNjb3JlIiwicHJvZ3Jlc3MiLCJzeW5vcHNpcyIsInNvdXJjZSIsInJhd0RhdGEiLCIkdHlwZSIsImNtc0NvbnRlbnQiLCJjb2xsZWN0aW9uIiwicGF5bG9hZCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/db/schema.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/@better-auth+kysely-adapter@1.7.15_@better-auth+core@1.7.15_@better-auth+utils@0.5.1_@b_b58057a44b123812a413ded8b40394b8","vendor-chunks/better-auth@1.7.15_drizzle-orm@0.45.4_@types+pg@8.23.1_kysely@0.29.8_pg@8.23.1__next@14_f5743b56dd5d12f87c21945c7c0f135d","vendor-chunks/next@14.2.5_react-dom@18.3.1_react@18.3.1__react@18.3.1","vendor-chunks/kysely@0.29.8","vendor-chunks/zod@4.6.7","vendor-chunks/@better-auth+core@1.7.15_@better-auth+utils@0.5.1_@better-fetch+fetch@1.3.3_better-call_5464a0692b57b7b1050e3b61cd775e4b","vendor-chunks/drizzle-orm@0.45.4_@types+pg@8.23.1_kysely@0.29.8_pg@8.23.1","vendor-chunks/postal-mime@2.7.6","vendor-chunks/jose@6.2.15","vendor-chunks/@noble+ciphers@2.4.0","vendor-chunks/@noble+hashes@2.4.0","vendor-chunks/resend@6.37.0","vendor-chunks/@better-fetch+fetch@1.3.3","vendor-chunks/better-call@1.4.4_zod@4.6.7","vendor-chunks/@better-auth+drizzle-adapter@1.7.15_@better-auth+core@1.7.15_@better-auth+utils@0.5.1_@_7db781423c3b2aa3e092de9f019bc02c","vendor-chunks/rou3@0.9.2","vendor-chunks/@better-auth+telemetry@1.7.15_@better-auth+core@1.7.15_@better-auth+utils@0.5.1_@better_460e57e0148e1ac304050f690430a639","vendor-chunks/fast-sha256@1.3.0","vendor-chunks/@stablelib+base64@1.0.1","vendor-chunks/@better-auth+utils@0.5.1","vendor-chunks/standardwebhooks@1.1.1","vendor-chunks/defu@6.1.7","vendor-chunks/@vercel+oidc@4.0.6","vendor-chunks/@vercel+oidc@3.8.10","vendor-chunks/googleapis@189.0.0","vendor-chunks/undici@6.29.1","vendor-chunks/jose@5.10.0","vendor-chunks/google-auth-library@11.3.2","vendor-chunks/googleapis-common@9.3.1","vendor-chunks/@vercel+connect@2.8.0_better-auth@1.7.15_drizzle-orm@0.45.4_@types+pg@8.23.1_kysely@0.2_faf5aa5d7b2c4fbe2ba6ff5a283c94b3","vendor-chunks/math-intrinsics@1.1.0","vendor-chunks/@vercel+cli-exec@1.0.1","vendor-chunks/gaxios@8.3.2","vendor-chunks/execa@5.1.1","vendor-chunks/es-errors@1.3.0","vendor-chunks/cross-spawn@7.0.6","vendor-chunks/qs@6.17.1","vendor-chunks/jws@4.0.1","vendor-chunks/call-bind-apply-helpers@1.0.2","vendor-chunks/human-signals@2.1.0","vendor-chunks/google-logging-utils@2.1.1","vendor-chunks/retry@0.13.1","vendor-chunks/json-bigint@1.0.0","vendor-chunks/isexe@2.0.0","vendor-chunks/get-proto@1.0.1","vendor-chunks/@vercel+blob@2.8.2","vendor-chunks/gcp-metadata@9.2.3","vendor-chunks/signal-exit@3.0.7","vendor-chunks/object-inspect@1.13.4","vendor-chunks/has-symbols@1.1.0","vendor-chunks/gopd@1.2.0","vendor-chunks/get-stream@6.0.1","vendor-chunks/function-bind@1.1.2","vendor-chunks/ecdsa-sig-formatter@1.0.11","vendor-chunks/is-node-process@1.2.0","vendor-chunks/which@2.0.2","vendor-chunks/url-template@2.0.8","vendor-chunks/throttleit@2.1.0","vendor-chunks/strip-final-newline@2.0.0","vendor-chunks/side-channel@1.1.1","vendor-chunks/side-channel-weakmap@1.0.2","vendor-chunks/side-channel-map@1.0.1","vendor-chunks/side-channel-list@1.0.1","vendor-chunks/shebang-regex@3.0.0","vendor-chunks/shebang-command@2.0.0","vendor-chunks/safe-buffer@5.2.1","vendor-chunks/path-key@3.1.1","vendor-chunks/onetime@5.1.2","vendor-chunks/npm-run-path@4.0.1","vendor-chunks/mimic-fn@2.1.0","vendor-chunks/merge-stream@2.0.0","vendor-chunks/jwa@2.0.1","vendor-chunks/is-stream@2.0.1","vendor-chunks/is-buffer@2.0.5","vendor-chunks/hasown@2.0.4","vendor-chunks/get-intrinsic@1.3.0","vendor-chunks/extend@3.0.2","vendor-chunks/es-object-atoms@1.1.2","vendor-chunks/es-define-property@1.0.1","vendor-chunks/dunder-proto@1.0.1","vendor-chunks/call-bound@1.0.4","vendor-chunks/buffer-equal-constant-time@1.0.1","vendor-chunks/bignumber.js@9.3.1","vendor-chunks/base64-js@1.5.1","vendor-chunks/async-retry@1.3.3","vendor-chunks/@vercel+cli-config@0.3.6","vendor-chunks/@vercel+cli-config@0.3.1"], () => (__webpack_exec__("(rsc)/./node_modules/.pnpm/next@14.2.5_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fgallery%2Fdrive%2Froute&page=%2Fapi%2Fgallery%2Fdrive%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fgallery%2Fdrive%2Froute.ts&appDir=%2Fvercel%2Fshare%2Fv0-project%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fvercel%2Fshare%2Fv0-project&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();