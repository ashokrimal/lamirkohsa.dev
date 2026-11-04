"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/is-stream@2.0.1";
exports.ids = ["vendor-chunks/is-stream@2.0.1"];
exports.modules = {

/***/ "(rsc)/./node_modules/.pnpm/is-stream@2.0.1/node_modules/is-stream/index.js":
/*!****************************************************************************!*\
  !*** ./node_modules/.pnpm/is-stream@2.0.1/node_modules/is-stream/index.js ***!
  \****************************************************************************/
/***/ ((module) => {

eval("\n\nconst isStream = stream =>\n\tstream !== null &&\n\ttypeof stream === 'object' &&\n\ttypeof stream.pipe === 'function';\n\nisStream.writable = stream =>\n\tisStream(stream) &&\n\tstream.writable !== false &&\n\ttypeof stream._write === 'function' &&\n\ttypeof stream._writableState === 'object';\n\nisStream.readable = stream =>\n\tisStream(stream) &&\n\tstream.readable !== false &&\n\ttypeof stream._read === 'function' &&\n\ttypeof stream._readableState === 'object';\n\nisStream.duplex = stream =>\n\tisStream.writable(stream) &&\n\tisStream.readable(stream);\n\nisStream.transform = stream =>\n\tisStream.duplex(stream) &&\n\ttypeof stream._transform === 'function';\n\nmodule.exports = isStream;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvLnBucG0vaXMtc3RyZWFtQDIuMC4xL25vZGVfbW9kdWxlcy9pcy1zdHJlYW0vaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQWE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9sYW1pcmtvaHNhLWRldi8uL25vZGVfbW9kdWxlcy8ucG5wbS9pcy1zdHJlYW1AMi4wLjEvbm9kZV9tb2R1bGVzL2lzLXN0cmVhbS9pbmRleC5qcz9hZmFiIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuY29uc3QgaXNTdHJlYW0gPSBzdHJlYW0gPT5cblx0c3RyZWFtICE9PSBudWxsICYmXG5cdHR5cGVvZiBzdHJlYW0gPT09ICdvYmplY3QnICYmXG5cdHR5cGVvZiBzdHJlYW0ucGlwZSA9PT0gJ2Z1bmN0aW9uJztcblxuaXNTdHJlYW0ud3JpdGFibGUgPSBzdHJlYW0gPT5cblx0aXNTdHJlYW0oc3RyZWFtKSAmJlxuXHRzdHJlYW0ud3JpdGFibGUgIT09IGZhbHNlICYmXG5cdHR5cGVvZiBzdHJlYW0uX3dyaXRlID09PSAnZnVuY3Rpb24nICYmXG5cdHR5cGVvZiBzdHJlYW0uX3dyaXRhYmxlU3RhdGUgPT09ICdvYmplY3QnO1xuXG5pc1N0cmVhbS5yZWFkYWJsZSA9IHN0cmVhbSA9PlxuXHRpc1N0cmVhbShzdHJlYW0pICYmXG5cdHN0cmVhbS5yZWFkYWJsZSAhPT0gZmFsc2UgJiZcblx0dHlwZW9mIHN0cmVhbS5fcmVhZCA9PT0gJ2Z1bmN0aW9uJyAmJlxuXHR0eXBlb2Ygc3RyZWFtLl9yZWFkYWJsZVN0YXRlID09PSAnb2JqZWN0JztcblxuaXNTdHJlYW0uZHVwbGV4ID0gc3RyZWFtID0+XG5cdGlzU3RyZWFtLndyaXRhYmxlKHN0cmVhbSkgJiZcblx0aXNTdHJlYW0ucmVhZGFibGUoc3RyZWFtKTtcblxuaXNTdHJlYW0udHJhbnNmb3JtID0gc3RyZWFtID0+XG5cdGlzU3RyZWFtLmR1cGxleChzdHJlYW0pICYmXG5cdHR5cGVvZiBzdHJlYW0uX3RyYW5zZm9ybSA9PT0gJ2Z1bmN0aW9uJztcblxubW9kdWxlLmV4cG9ydHMgPSBpc1N0cmVhbTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/.pnpm/is-stream@2.0.1/node_modules/is-stream/index.js\n");

/***/ })

};
;