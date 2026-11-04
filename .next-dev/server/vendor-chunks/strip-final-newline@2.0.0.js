"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/strip-final-newline@2.0.0";
exports.ids = ["vendor-chunks/strip-final-newline@2.0.0"];
exports.modules = {

/***/ "(rsc)/./node_modules/.pnpm/strip-final-newline@2.0.0/node_modules/strip-final-newline/index.js":
/*!************************************************************************************************!*\
  !*** ./node_modules/.pnpm/strip-final-newline@2.0.0/node_modules/strip-final-newline/index.js ***!
  \************************************************************************************************/
/***/ ((module) => {

eval("\n\nmodule.exports = input => {\n\tconst LF = typeof input === 'string' ? '\\n' : '\\n'.charCodeAt();\n\tconst CR = typeof input === 'string' ? '\\r' : '\\r'.charCodeAt();\n\n\tif (input[input.length - 1] === LF) {\n\t\tinput = input.slice(0, input.length - 1);\n\t}\n\n\tif (input[input.length - 1] === CR) {\n\t\tinput = input.slice(0, input.length - 1);\n\t}\n\n\treturn input;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvLnBucG0vc3RyaXAtZmluYWwtbmV3bGluZUAyLjAuMC9ub2RlX21vZHVsZXMvc3RyaXAtZmluYWwtbmV3bGluZS9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBYTs7QUFFYjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbGFtaXJrb2hzYS1kZXYvLi9ub2RlX21vZHVsZXMvLnBucG0vc3RyaXAtZmluYWwtbmV3bGluZUAyLjAuMC9ub2RlX21vZHVsZXMvc3RyaXAtZmluYWwtbmV3bGluZS9pbmRleC5qcz80NjBkIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBpbnB1dCA9PiB7XG5cdGNvbnN0IExGID0gdHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyA/ICdcXG4nIDogJ1xcbicuY2hhckNvZGVBdCgpO1xuXHRjb25zdCBDUiA9IHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgPyAnXFxyJyA6ICdcXHInLmNoYXJDb2RlQXQoKTtcblxuXHRpZiAoaW5wdXRbaW5wdXQubGVuZ3RoIC0gMV0gPT09IExGKSB7XG5cdFx0aW5wdXQgPSBpbnB1dC5zbGljZSgwLCBpbnB1dC5sZW5ndGggLSAxKTtcblx0fVxuXG5cdGlmIChpbnB1dFtpbnB1dC5sZW5ndGggLSAxXSA9PT0gQ1IpIHtcblx0XHRpbnB1dCA9IGlucHV0LnNsaWNlKDAsIGlucHV0Lmxlbmd0aCAtIDEpO1xuXHR9XG5cblx0cmV0dXJuIGlucHV0O1xufTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/.pnpm/strip-final-newline@2.0.0/node_modules/strip-final-newline/index.js\n");

/***/ })

};
;