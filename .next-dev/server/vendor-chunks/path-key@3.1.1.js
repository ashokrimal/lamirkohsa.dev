"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/path-key@3.1.1";
exports.ids = ["vendor-chunks/path-key@3.1.1"];
exports.modules = {

/***/ "(rsc)/./node_modules/.pnpm/path-key@3.1.1/node_modules/path-key/index.js":
/*!**************************************************************************!*\
  !*** ./node_modules/.pnpm/path-key@3.1.1/node_modules/path-key/index.js ***!
  \**************************************************************************/
/***/ ((module) => {

eval("\n\nconst pathKey = (options = {}) => {\n\tconst environment = options.env || process.env;\n\tconst platform = options.platform || process.platform;\n\n\tif (platform !== 'win32') {\n\t\treturn 'PATH';\n\t}\n\n\treturn Object.keys(environment).reverse().find(key => key.toUpperCase() === 'PATH') || 'Path';\n};\n\nmodule.exports = pathKey;\n// TODO: Remove this for the next major release\nmodule.exports[\"default\"] = pathKey;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvLnBucG0vcGF0aC1rZXlAMy4xLjEvbm9kZV9tb2R1bGVzL3BhdGgta2V5L2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFhOztBQUViLDZCQUE2QjtBQUM3QjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx5QkFBc0IiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9sYW1pcmtvaHNhLWRldi8uL25vZGVfbW9kdWxlcy8ucG5wbS9wYXRoLWtleUAzLjEuMS9ub2RlX21vZHVsZXMvcGF0aC1rZXkvaW5kZXguanM/OTQ0MyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHBhdGhLZXkgPSAob3B0aW9ucyA9IHt9KSA9PiB7XG5cdGNvbnN0IGVudmlyb25tZW50ID0gb3B0aW9ucy5lbnYgfHwgcHJvY2Vzcy5lbnY7XG5cdGNvbnN0IHBsYXRmb3JtID0gb3B0aW9ucy5wbGF0Zm9ybSB8fCBwcm9jZXNzLnBsYXRmb3JtO1xuXG5cdGlmIChwbGF0Zm9ybSAhPT0gJ3dpbjMyJykge1xuXHRcdHJldHVybiAnUEFUSCc7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0LmtleXMoZW52aXJvbm1lbnQpLnJldmVyc2UoKS5maW5kKGtleSA9PiBrZXkudG9VcHBlckNhc2UoKSA9PT0gJ1BBVEgnKSB8fCAnUGF0aCc7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBhdGhLZXk7XG4vLyBUT0RPOiBSZW1vdmUgdGhpcyBmb3IgdGhlIG5leHQgbWFqb3IgcmVsZWFzZVxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IHBhdGhLZXk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/.pnpm/path-key@3.1.1/node_modules/path-key/index.js\n");

/***/ })

};
;