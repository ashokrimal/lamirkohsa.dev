"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/npm-run-path@4.0.1";
exports.ids = ["vendor-chunks/npm-run-path@4.0.1"];
exports.modules = {

/***/ "(rsc)/./node_modules/.pnpm/npm-run-path@4.0.1/node_modules/npm-run-path/index.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/.pnpm/npm-run-path@4.0.1/node_modules/npm-run-path/index.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\nconst path = __webpack_require__(/*! path */ \"path\");\nconst pathKey = __webpack_require__(/*! path-key */ \"(rsc)/./node_modules/.pnpm/path-key@3.1.1/node_modules/path-key/index.js\");\n\nconst npmRunPath = options => {\n\toptions = {\n\t\tcwd: process.cwd(),\n\t\tpath: process.env[pathKey()],\n\t\texecPath: process.execPath,\n\t\t...options\n\t};\n\n\tlet previous;\n\tlet cwdPath = path.resolve(options.cwd);\n\tconst result = [];\n\n\twhile (previous !== cwdPath) {\n\t\tresult.push(path.join(cwdPath, 'node_modules/.bin'));\n\t\tprevious = cwdPath;\n\t\tcwdPath = path.resolve(cwdPath, '..');\n\t}\n\n\t// Ensure the running `node` binary is used\n\tconst execPathDir = path.resolve(options.cwd, options.execPath, '..');\n\tresult.push(execPathDir);\n\n\treturn result.concat(options.path).join(path.delimiter);\n};\n\nmodule.exports = npmRunPath;\n// TODO: Remove this for the next major release\nmodule.exports[\"default\"] = npmRunPath;\n\nmodule.exports.env = options => {\n\toptions = {\n\t\tenv: process.env,\n\t\t...options\n\t};\n\n\tconst env = {...options.env};\n\tconst path = pathKey({env});\n\n\toptions.path = env[path];\n\tenv[path] = module.exports(options);\n\n\treturn env;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvLnBucG0vbnBtLXJ1bi1wYXRoQDQuMC4xL25vZGVfbW9kdWxlcy9ucG0tcnVuLXBhdGgvaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQWE7QUFDYixhQUFhLG1CQUFPLENBQUMsa0JBQU07QUFDM0IsZ0JBQWdCLG1CQUFPLENBQUMsMEZBQVU7O0FBRWxDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx5QkFBc0I7O0FBRXRCLGtCQUFrQjtBQUNsQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxjQUFjO0FBQ2QsdUJBQXVCLElBQUk7O0FBRTNCO0FBQ0E7O0FBRUE7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2xhbWlya29oc2EtZGV2Ly4vbm9kZV9tb2R1bGVzLy5wbnBtL25wbS1ydW4tcGF0aEA0LjAuMS9ub2RlX21vZHVsZXMvbnBtLXJ1bi1wYXRoL2luZGV4LmpzP2I3OTEiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHBhdGhLZXkgPSByZXF1aXJlKCdwYXRoLWtleScpO1xuXG5jb25zdCBucG1SdW5QYXRoID0gb3B0aW9ucyA9PiB7XG5cdG9wdGlvbnMgPSB7XG5cdFx0Y3dkOiBwcm9jZXNzLmN3ZCgpLFxuXHRcdHBhdGg6IHByb2Nlc3MuZW52W3BhdGhLZXkoKV0sXG5cdFx0ZXhlY1BhdGg6IHByb2Nlc3MuZXhlY1BhdGgsXG5cdFx0Li4ub3B0aW9uc1xuXHR9O1xuXG5cdGxldCBwcmV2aW91cztcblx0bGV0IGN3ZFBhdGggPSBwYXRoLnJlc29sdmUob3B0aW9ucy5jd2QpO1xuXHRjb25zdCByZXN1bHQgPSBbXTtcblxuXHR3aGlsZSAocHJldmlvdXMgIT09IGN3ZFBhdGgpIHtcblx0XHRyZXN1bHQucHVzaChwYXRoLmpvaW4oY3dkUGF0aCwgJ25vZGVfbW9kdWxlcy8uYmluJykpO1xuXHRcdHByZXZpb3VzID0gY3dkUGF0aDtcblx0XHRjd2RQYXRoID0gcGF0aC5yZXNvbHZlKGN3ZFBhdGgsICcuLicpO1xuXHR9XG5cblx0Ly8gRW5zdXJlIHRoZSBydW5uaW5nIGBub2RlYCBiaW5hcnkgaXMgdXNlZFxuXHRjb25zdCBleGVjUGF0aERpciA9IHBhdGgucmVzb2x2ZShvcHRpb25zLmN3ZCwgb3B0aW9ucy5leGVjUGF0aCwgJy4uJyk7XG5cdHJlc3VsdC5wdXNoKGV4ZWNQYXRoRGlyKTtcblxuXHRyZXR1cm4gcmVzdWx0LmNvbmNhdChvcHRpb25zLnBhdGgpLmpvaW4ocGF0aC5kZWxpbWl0ZXIpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBucG1SdW5QYXRoO1xuLy8gVE9ETzogUmVtb3ZlIHRoaXMgZm9yIHRoZSBuZXh0IG1ham9yIHJlbGVhc2Vcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBucG1SdW5QYXRoO1xuXG5tb2R1bGUuZXhwb3J0cy5lbnYgPSBvcHRpb25zID0+IHtcblx0b3B0aW9ucyA9IHtcblx0XHRlbnY6IHByb2Nlc3MuZW52LFxuXHRcdC4uLm9wdGlvbnNcblx0fTtcblxuXHRjb25zdCBlbnYgPSB7Li4ub3B0aW9ucy5lbnZ9O1xuXHRjb25zdCBwYXRoID0gcGF0aEtleSh7ZW52fSk7XG5cblx0b3B0aW9ucy5wYXRoID0gZW52W3BhdGhdO1xuXHRlbnZbcGF0aF0gPSBtb2R1bGUuZXhwb3J0cyhvcHRpb25zKTtcblxuXHRyZXR1cm4gZW52O1xufTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/.pnpm/npm-run-path@4.0.1/node_modules/npm-run-path/index.js\n");

/***/ })

};
;