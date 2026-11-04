"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/mimic-fn@2.1.0";
exports.ids = ["vendor-chunks/mimic-fn@2.1.0"];
exports.modules = {

/***/ "(rsc)/./node_modules/.pnpm/mimic-fn@2.1.0/node_modules/mimic-fn/index.js":
/*!**************************************************************************!*\
  !*** ./node_modules/.pnpm/mimic-fn@2.1.0/node_modules/mimic-fn/index.js ***!
  \**************************************************************************/
/***/ ((module) => {

eval("\n\nconst mimicFn = (to, from) => {\n\tfor (const prop of Reflect.ownKeys(from)) {\n\t\tObject.defineProperty(to, prop, Object.getOwnPropertyDescriptor(from, prop));\n\t}\n\n\treturn to;\n};\n\nmodule.exports = mimicFn;\n// TODO: Remove this for the next major release\nmodule.exports[\"default\"] = mimicFn;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvLnBucG0vbWltaWMtZm5AMi4xLjAvbm9kZV9tb2R1bGVzL21pbWljLWZuL2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFhOztBQUViO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlCQUFzQiIsInNvdXJjZXMiOlsid2VicGFjazovL2xhbWlya29oc2EtZGV2Ly4vbm9kZV9tb2R1bGVzLy5wbnBtL21pbWljLWZuQDIuMS4wL25vZGVfbW9kdWxlcy9taW1pYy1mbi9pbmRleC5qcz9jYjYyIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuY29uc3QgbWltaWNGbiA9ICh0bywgZnJvbSkgPT4ge1xuXHRmb3IgKGNvbnN0IHByb3Agb2YgUmVmbGVjdC5vd25LZXlzKGZyb20pKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRvLCBwcm9wLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGZyb20sIHByb3ApKTtcblx0fVxuXG5cdHJldHVybiB0bztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbWltaWNGbjtcbi8vIFRPRE86IFJlbW92ZSB0aGlzIGZvciB0aGUgbmV4dCBtYWpvciByZWxlYXNlXG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gbWltaWNGbjtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/.pnpm/mimic-fn@2.1.0/node_modules/mimic-fn/index.js\n");

/***/ })

};
;