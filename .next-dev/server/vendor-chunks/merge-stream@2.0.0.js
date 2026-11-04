"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/merge-stream@2.0.0";
exports.ids = ["vendor-chunks/merge-stream@2.0.0"];
exports.modules = {

/***/ "(rsc)/./node_modules/.pnpm/merge-stream@2.0.0/node_modules/merge-stream/index.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/.pnpm/merge-stream@2.0.0/node_modules/merge-stream/index.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\nconst { PassThrough } = __webpack_require__(/*! stream */ \"stream\");\n\nmodule.exports = function (/*streams...*/) {\n  var sources = []\n  var output  = new PassThrough({objectMode: true})\n\n  output.setMaxListeners(0)\n\n  output.add = add\n  output.isEmpty = isEmpty\n\n  output.on('unpipe', remove)\n\n  Array.prototype.slice.call(arguments).forEach(add)\n\n  return output\n\n  function add (source) {\n    if (Array.isArray(source)) {\n      source.forEach(add)\n      return this\n    }\n\n    sources.push(source);\n    source.once('end', remove.bind(null, source))\n    source.once('error', output.emit.bind(output, 'error'))\n    source.pipe(output, {end: false})\n    return this\n  }\n\n  function isEmpty () {\n    return sources.length == 0;\n  }\n\n  function remove (source) {\n    sources = sources.filter(function (it) { return it !== source })\n    if (!sources.length && output.readable) { output.end() }\n  }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvLnBucG0vbWVyZ2Utc3RyZWFtQDIuMC4wL25vZGVfbW9kdWxlcy9tZXJnZS1zdHJlYW0vaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQWE7O0FBRWIsUUFBUSxjQUFjLEVBQUUsbUJBQU8sQ0FBQyxzQkFBUTs7QUFFeEM7QUFDQTtBQUNBLGlDQUFpQyxpQkFBaUI7O0FBRWxEOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUIsV0FBVztBQUNwQztBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDZDQUE2QyxzQkFBc0I7QUFDbkUsOENBQThDO0FBQzlDO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9sYW1pcmtvaHNhLWRldi8uL25vZGVfbW9kdWxlcy8ucG5wbS9tZXJnZS1zdHJlYW1AMi4wLjAvbm9kZV9tb2R1bGVzL21lcmdlLXN0cmVhbS9pbmRleC5qcz80NGE3Il0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuY29uc3QgeyBQYXNzVGhyb3VnaCB9ID0gcmVxdWlyZSgnc3RyZWFtJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKC8qc3RyZWFtcy4uLiovKSB7XG4gIHZhciBzb3VyY2VzID0gW11cbiAgdmFyIG91dHB1dCAgPSBuZXcgUGFzc1Rocm91Z2goe29iamVjdE1vZGU6IHRydWV9KVxuXG4gIG91dHB1dC5zZXRNYXhMaXN0ZW5lcnMoMClcblxuICBvdXRwdXQuYWRkID0gYWRkXG4gIG91dHB1dC5pc0VtcHR5ID0gaXNFbXB0eVxuXG4gIG91dHB1dC5vbigndW5waXBlJywgcmVtb3ZlKVxuXG4gIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykuZm9yRWFjaChhZGQpXG5cbiAgcmV0dXJuIG91dHB1dFxuXG4gIGZ1bmN0aW9uIGFkZCAoc291cmNlKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgc291cmNlLmZvckVhY2goYWRkKVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbiAgICBzb3VyY2VzLnB1c2goc291cmNlKTtcbiAgICBzb3VyY2Uub25jZSgnZW5kJywgcmVtb3ZlLmJpbmQobnVsbCwgc291cmNlKSlcbiAgICBzb3VyY2Uub25jZSgnZXJyb3InLCBvdXRwdXQuZW1pdC5iaW5kKG91dHB1dCwgJ2Vycm9yJykpXG4gICAgc291cmNlLnBpcGUob3V0cHV0LCB7ZW5kOiBmYWxzZX0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzRW1wdHkgKCkge1xuICAgIHJldHVybiBzb3VyY2VzLmxlbmd0aCA9PSAwO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlIChzb3VyY2UpIHtcbiAgICBzb3VyY2VzID0gc291cmNlcy5maWx0ZXIoZnVuY3Rpb24gKGl0KSB7IHJldHVybiBpdCAhPT0gc291cmNlIH0pXG4gICAgaWYgKCFzb3VyY2VzLmxlbmd0aCAmJiBvdXRwdXQucmVhZGFibGUpIHsgb3V0cHV0LmVuZCgpIH1cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/.pnpm/merge-stream@2.0.0/node_modules/merge-stream/index.js\n");

/***/ })

};
;