"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/is-node-process@1.2.0";
exports.ids = ["vendor-chunks/is-node-process@1.2.0"];
exports.modules = {

/***/ "(rsc)/./node_modules/.pnpm/is-node-process@1.2.0/node_modules/is-node-process/lib/index.mjs":
/*!*********************************************************************************************!*\
  !*** ./node_modules/.pnpm/is-node-process@1.2.0/node_modules/is-node-process/lib/index.mjs ***!
  \*********************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   isNodeProcess: () => (/* binding */ isNodeProcess)\n/* harmony export */ });\n// src/index.ts\nfunction isNodeProcess() {\n  if (typeof navigator !== \"undefined\" && navigator.product === \"ReactNative\") {\n    return true;\n  }\n  if (typeof process !== \"undefined\") {\n    const type = process.type;\n    if (type === \"renderer\" || type === \"worker\") {\n      return false;\n    }\n    return !!(process.versions && process.versions.node);\n  }\n  return false;\n}\n\n//# sourceMappingURL=index.mjs.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvLnBucG0vaXMtbm9kZS1wcm9jZXNzQDEuMi4wL25vZGVfbW9kdWxlcy9pcy1ub2RlLXByb2Nlc3MvbGliL2luZGV4Lm1qcyIsIm1hcHBpbmdzIjoiOzs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUdFO0FBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9sYW1pcmtvaHNhLWRldi8uL25vZGVfbW9kdWxlcy8ucG5wbS9pcy1ub2RlLXByb2Nlc3NAMS4yLjAvbm9kZV9tb2R1bGVzL2lzLW5vZGUtcHJvY2Vzcy9saWIvaW5kZXgubWpzP2UyZWIiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gc3JjL2luZGV4LnRzXG5mdW5jdGlvbiBpc05vZGVQcm9jZXNzKCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gXCJ1bmRlZmluZWRcIiAmJiBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gXCJSZWFjdE5hdGl2ZVwiKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgY29uc3QgdHlwZSA9IHByb2Nlc3MudHlwZTtcbiAgICBpZiAodHlwZSA9PT0gXCJyZW5kZXJlclwiIHx8IHR5cGUgPT09IFwid29ya2VyXCIpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuICEhKHByb2Nlc3MudmVyc2lvbnMgJiYgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5leHBvcnQge1xuICBpc05vZGVQcm9jZXNzXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXgubWpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/.pnpm/is-node-process@1.2.0/node_modules/is-node-process/lib/index.mjs\n");

/***/ })

};
;