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
exports.id = "pages/dashboard";
exports.ids = ["pages/dashboard"];
exports.modules = {

/***/ "(pages-dir-node)/./context/AuthContext.tsx":
/*!*********************************!*\
  !*** ./context/AuthContext.tsx ***!
  \*********************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   AuthProvider: () => (/* binding */ AuthProvider),\n/* harmony export */   useAuth: () => (/* binding */ useAuth)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! axios */ \"axios\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([axios__WEBPACK_IMPORTED_MODULE_2__]);\naxios__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\nconst AuthContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)(undefined);\nfunction AuthProvider({ children }) {\n    const [user, setUser] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [token, setToken] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)({\n        \"AuthProvider.useEffect\": ()=>{\n            const storedToken = localStorage.getItem('token');\n            if (storedToken) {\n                setToken(storedToken);\n                // Optionally, verify token with backend or decode it to get user info\n                // For now, we'll assume a valid token means a logged-in user\n                // A more robust solution would fetch user details from /api/auth\n                axios__WEBPACK_IMPORTED_MODULE_2__[\"default\"].get('/api/auth', {\n                    headers: {\n                        'x-auth-token': storedToken\n                    }\n                }).then({\n                    \"AuthProvider.useEffect\": (res)=>{\n                        setUser(res.data);\n                        axios__WEBPACK_IMPORTED_MODULE_2__[\"default\"].defaults.headers.common['x-auth-token'] = storedToken;\n                    }\n                }[\"AuthProvider.useEffect\"]).catch({\n                    \"AuthProvider.useEffect\": ()=>{\n                        localStorage.removeItem('token');\n                        setToken(null);\n                        setUser(null);\n                    }\n                }[\"AuthProvider.useEffect\"]).finally({\n                    \"AuthProvider.useEffect\": ()=>{\n                        setLoading(false);\n                    }\n                }[\"AuthProvider.useEffect\"]);\n            } else {\n                setLoading(false);\n            }\n        }\n    }[\"AuthProvider.useEffect\"], []);\n    const login = (newToken)=>{\n        localStorage.setItem('token', newToken);\n        setToken(newToken);\n        axios__WEBPACK_IMPORTED_MODULE_2__[\"default\"].defaults.headers.common['x-auth-token'] = newToken;\n        // Fetch user details after login\n        axios__WEBPACK_IMPORTED_MODULE_2__[\"default\"].get('/api/auth', {\n            headers: {\n                'x-auth-token': newToken\n            }\n        }).then((res)=>setUser(res.data)).catch((err)=>console.error('Failed to fetch user after login', err));\n    };\n    const logout = ()=>{\n        localStorage.removeItem('token');\n        setToken(null);\n        setUser(null);\n        delete axios__WEBPACK_IMPORTED_MODULE_2__[\"default\"].defaults.headers.common['x-auth-token'];\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(AuthContext.Provider, {\n        value: {\n            user,\n            token,\n            login,\n            logout,\n            loading\n        },\n        children: children\n    }, void 0, false, {\n        fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\context\\\\AuthContext.tsx\",\n        lineNumber: 72,\n        columnNumber: 5\n    }, this);\n}\nfunction useAuth() {\n    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(AuthContext);\n    if (context === undefined) {\n        throw new Error('useAuth must be used within an AuthProvider');\n    }\n    return context;\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL2NvbnRleHQvQXV0aENvbnRleHQudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQWtGO0FBQ3hEO0FBZ0IxQixNQUFNSyw0QkFBY0wsb0RBQWFBLENBQThCTTtBQUV4RCxTQUFTQyxhQUFhLEVBQUVDLFFBQVEsRUFBMkI7SUFDaEUsTUFBTSxDQUFDQyxNQUFNQyxRQUFRLEdBQUdSLCtDQUFRQSxDQUFjO0lBQzlDLE1BQU0sQ0FBQ1MsT0FBT0MsU0FBUyxHQUFHViwrQ0FBUUEsQ0FBZ0I7SUFDbEQsTUFBTSxDQUFDVyxTQUFTQyxXQUFXLEdBQUdaLCtDQUFRQSxDQUFDO0lBRXZDQyxnREFBU0E7a0NBQUM7WUFDUixNQUFNWSxjQUFjQyxhQUFhQyxPQUFPLENBQUM7WUFDekMsSUFBSUYsYUFBYTtnQkFDZkgsU0FBU0c7Z0JBQ1Qsc0VBQXNFO2dCQUN0RSw2REFBNkQ7Z0JBQzdELGlFQUFpRTtnQkFDakVYLGlEQUFTLENBQUMsYUFBYTtvQkFDckJlLFNBQVM7d0JBQUUsZ0JBQWdCSjtvQkFBWTtnQkFDekMsR0FDQ0ssSUFBSTs4Q0FBQ0MsQ0FBQUE7d0JBQ0pYLFFBQVFXLElBQUlDLElBQUk7d0JBQ2hCbEIsc0RBQWMsQ0FBQ2UsT0FBTyxDQUFDSyxNQUFNLENBQUMsZUFBZSxHQUFHVDtvQkFDbEQ7NkNBQ0NVLEtBQUs7OENBQUM7d0JBQ0xULGFBQWFVLFVBQVUsQ0FBQzt3QkFDeEJkLFNBQVM7d0JBQ1RGLFFBQVE7b0JBQ1Y7NkNBQ0NpQixPQUFPOzhDQUFDO3dCQUNQYixXQUFXO29CQUNiOztZQUNGLE9BQU87Z0JBQ0xBLFdBQVc7WUFDYjtRQUNGO2lDQUFHLEVBQUU7SUFFTCxNQUFNYyxRQUFRLENBQUNDO1FBQ2JiLGFBQWFjLE9BQU8sQ0FBQyxTQUFTRDtRQUM5QmpCLFNBQVNpQjtRQUNUekIsc0RBQWMsQ0FBQ2UsT0FBTyxDQUFDSyxNQUFNLENBQUMsZUFBZSxHQUFHSztRQUNoRCxpQ0FBaUM7UUFDakN6QixpREFBUyxDQUFDLGFBQWE7WUFDckJlLFNBQVM7Z0JBQUUsZ0JBQWdCVTtZQUFTO1FBQ3RDLEdBQ0NULElBQUksQ0FBQ0MsQ0FBQUEsTUFBT1gsUUFBUVcsSUFBSUMsSUFBSSxHQUM1QkcsS0FBSyxDQUFDTSxDQUFBQSxNQUFPQyxRQUFRQyxLQUFLLENBQUMsb0NBQW9DRjtJQUNsRTtJQUVBLE1BQU1HLFNBQVM7UUFDYmxCLGFBQWFVLFVBQVUsQ0FBQztRQUN4QmQsU0FBUztRQUNURixRQUFRO1FBQ1IsT0FBT04sc0RBQWMsQ0FBQ2UsT0FBTyxDQUFDSyxNQUFNLENBQUMsZUFBZTtJQUN0RDtJQUVBLHFCQUNFLDhEQUFDbkIsWUFBWThCLFFBQVE7UUFBQ0MsT0FBTztZQUFFM0I7WUFBTUU7WUFBT2lCO1lBQU9NO1lBQVFyQjtRQUFRO2tCQUNoRUw7Ozs7OztBQUdQO0FBRU8sU0FBUzZCO0lBQ2QsTUFBTUMsVUFBVXJDLGlEQUFVQSxDQUFDSTtJQUMzQixJQUFJaUMsWUFBWWhDLFdBQVc7UUFDekIsTUFBTSxJQUFJaUMsTUFBTTtJQUNsQjtJQUNBLE9BQU9EO0FBQ1QiLCJzb3VyY2VzIjpbIkU6XFxXT1JLXFx0ZWxlZ3JhbS1mb3J3YXJkZXItYm90XFxmcm9udGVuZFxcY29udGV4dFxcQXV0aENvbnRleHQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNvbnRleHQsIHVzZUNvbnRleHQsIHVzZVN0YXRlLCB1c2VFZmZlY3QsIFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XG5cbmludGVyZmFjZSBVc2VyIHtcbiAgX2lkOiBzdHJpbmc7XG4gIGVtYWlsOiBzdHJpbmc7XG4gIC8vIEFkZCBvdGhlciB1c2VyIHByb3BlcnRpZXMgYXMgbmVlZGVkXG59XG5cbmludGVyZmFjZSBBdXRoQ29udGV4dFR5cGUge1xuICB1c2VyOiBVc2VyIHwgbnVsbDtcbiAgdG9rZW46IHN0cmluZyB8IG51bGw7XG4gIGxvZ2luOiAodG9rZW46IHN0cmluZykgPT4gdm9pZDtcbiAgbG9nb3V0OiAoKSA9PiB2b2lkO1xuICBsb2FkaW5nOiBib29sZWFuO1xufVxuXG5jb25zdCBBdXRoQ29udGV4dCA9IGNyZWF0ZUNvbnRleHQ8QXV0aENvbnRleHRUeXBlIHwgdW5kZWZpbmVkPih1bmRlZmluZWQpO1xuXG5leHBvcnQgZnVuY3Rpb24gQXV0aFByb3ZpZGVyKHsgY2hpbGRyZW4gfTogeyBjaGlsZHJlbjogUmVhY3ROb2RlIH0pIHtcbiAgY29uc3QgW3VzZXIsIHNldFVzZXJdID0gdXNlU3RhdGU8VXNlciB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbdG9rZW4sIHNldFRva2VuXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHN0b3JlZFRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJyk7XG4gICAgaWYgKHN0b3JlZFRva2VuKSB7XG4gICAgICBzZXRUb2tlbihzdG9yZWRUb2tlbik7XG4gICAgICAvLyBPcHRpb25hbGx5LCB2ZXJpZnkgdG9rZW4gd2l0aCBiYWNrZW5kIG9yIGRlY29kZSBpdCB0byBnZXQgdXNlciBpbmZvXG4gICAgICAvLyBGb3Igbm93LCB3ZSdsbCBhc3N1bWUgYSB2YWxpZCB0b2tlbiBtZWFucyBhIGxvZ2dlZC1pbiB1c2VyXG4gICAgICAvLyBBIG1vcmUgcm9idXN0IHNvbHV0aW9uIHdvdWxkIGZldGNoIHVzZXIgZGV0YWlscyBmcm9tIC9hcGkvYXV0aFxuICAgICAgYXhpb3MuZ2V0KCcvYXBpL2F1dGgnLCB7XG4gICAgICAgIGhlYWRlcnM6IHsgJ3gtYXV0aC10b2tlbic6IHN0b3JlZFRva2VuIH1cbiAgICAgIH0pXG4gICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICBzZXRVc2VyKHJlcy5kYXRhKTtcbiAgICAgICAgYXhpb3MuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bJ3gtYXV0aC10b2tlbiddID0gc3RvcmVkVG9rZW47XG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3Rva2VuJyk7XG4gICAgICAgIHNldFRva2VuKG51bGwpO1xuICAgICAgICBzZXRVc2VyKG51bGwpO1xuICAgICAgfSlcbiAgICAgIC5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgfVxuICB9LCBbXSk7XG5cbiAgY29uc3QgbG9naW4gPSAobmV3VG9rZW46IHN0cmluZykgPT4ge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0b2tlbicsIG5ld1Rva2VuKTtcbiAgICBzZXRUb2tlbihuZXdUb2tlbik7XG4gICAgYXhpb3MuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bJ3gtYXV0aC10b2tlbiddID0gbmV3VG9rZW47XG4gICAgLy8gRmV0Y2ggdXNlciBkZXRhaWxzIGFmdGVyIGxvZ2luXG4gICAgYXhpb3MuZ2V0KCcvYXBpL2F1dGgnLCB7XG4gICAgICBoZWFkZXJzOiB7ICd4LWF1dGgtdG9rZW4nOiBuZXdUb2tlbiB9XG4gICAgfSlcbiAgICAudGhlbihyZXMgPT4gc2V0VXNlcihyZXMuZGF0YSkpXG4gICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gZmV0Y2ggdXNlciBhZnRlciBsb2dpbicsIGVycikpO1xuICB9O1xuXG4gIGNvbnN0IGxvZ291dCA9ICgpID0+IHtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndG9rZW4nKTtcbiAgICBzZXRUb2tlbihudWxsKTtcbiAgICBzZXRVc2VyKG51bGwpO1xuICAgIGRlbGV0ZSBheGlvcy5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vblsneC1hdXRoLXRva2VuJ107XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8QXV0aENvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3sgdXNlciwgdG9rZW4sIGxvZ2luLCBsb2dvdXQsIGxvYWRpbmcgfX0+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9BdXRoQ29udGV4dC5Qcm92aWRlcj5cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUF1dGgoKSB7XG4gIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KEF1dGhDb250ZXh0KTtcbiAgaWYgKGNvbnRleHQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndXNlQXV0aCBtdXN0IGJlIHVzZWQgd2l0aGluIGFuIEF1dGhQcm92aWRlcicpO1xuICB9XG4gIHJldHVybiBjb250ZXh0O1xufSJdLCJuYW1lcyI6WyJjcmVhdGVDb250ZXh0IiwidXNlQ29udGV4dCIsInVzZVN0YXRlIiwidXNlRWZmZWN0IiwiYXhpb3MiLCJBdXRoQ29udGV4dCIsInVuZGVmaW5lZCIsIkF1dGhQcm92aWRlciIsImNoaWxkcmVuIiwidXNlciIsInNldFVzZXIiLCJ0b2tlbiIsInNldFRva2VuIiwibG9hZGluZyIsInNldExvYWRpbmciLCJzdG9yZWRUb2tlbiIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJnZXQiLCJoZWFkZXJzIiwidGhlbiIsInJlcyIsImRhdGEiLCJkZWZhdWx0cyIsImNvbW1vbiIsImNhdGNoIiwicmVtb3ZlSXRlbSIsImZpbmFsbHkiLCJsb2dpbiIsIm5ld1Rva2VuIiwic2V0SXRlbSIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsImxvZ291dCIsIlByb3ZpZGVyIiwidmFsdWUiLCJ1c2VBdXRoIiwiY29udGV4dCIsIkVycm9yIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(pages-dir-node)/./context/AuthContext.tsx\n");

/***/ }),

/***/ "(pages-dir-node)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES&page=%2Fdashboard&preferredRegion=&absolutePagePath=.%2Fpages%5Cdashboard.tsx&absoluteAppPath=private-next-pages%2F_app&absoluteDocumentPath=private-next-pages%2F_document&middlewareConfigBase64=e30%3D!":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES&page=%2Fdashboard&preferredRegion=&absolutePagePath=.%2Fpages%5Cdashboard.tsx&absoluteAppPath=private-next-pages%2F_app&absoluteDocumentPath=private-next-pages%2F_document&middlewareConfigBase64=e30%3D! ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   config: () => (/* binding */ config),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   getServerSideProps: () => (/* binding */ getServerSideProps),\n/* harmony export */   getStaticPaths: () => (/* binding */ getStaticPaths),\n/* harmony export */   getStaticProps: () => (/* binding */ getStaticProps),\n/* harmony export */   handler: () => (/* binding */ handler),\n/* harmony export */   reportWebVitals: () => (/* binding */ reportWebVitals),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   unstable_getServerProps: () => (/* binding */ unstable_getServerProps),\n/* harmony export */   unstable_getServerSideProps: () => (/* binding */ unstable_getServerSideProps),\n/* harmony export */   unstable_getStaticParams: () => (/* binding */ unstable_getStaticParams),\n/* harmony export */   unstable_getStaticPaths: () => (/* binding */ unstable_getStaticPaths),\n/* harmony export */   unstable_getStaticProps: () => (/* binding */ unstable_getStaticProps)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_pages_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/pages/module.compiled */ \"(pages-dir-node)/./node_modules/next/dist/server/route-modules/pages/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_pages_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_pages_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(pages-dir-node)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/build/templates/helpers */ \"(pages-dir-node)/./node_modules/next/dist/build/templates/helpers.js\");\n/* harmony import */ var private_next_pages_document__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! private-next-pages/_document */ \"(pages-dir-node)/./node_modules/next/dist/pages/_document.js\");\n/* harmony import */ var private_next_pages_document__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(private_next_pages_document__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var private_next_pages_app__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! private-next-pages/_app */ \"(pages-dir-node)/./pages/_app.tsx\");\n/* harmony import */ var _pages_dashboard_tsx__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./pages\\dashboard.tsx */ \"(pages-dir-node)/./pages/dashboard.tsx\");\n/* harmony import */ var next_dist_server_route_modules_pages_pages_handler__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! next/dist/server/route-modules/pages/pages-handler */ \"(pages-dir-node)/./node_modules/next/dist/server/route-modules/pages/pages-handler.js\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([private_next_pages_app__WEBPACK_IMPORTED_MODULE_4__, _pages_dashboard_tsx__WEBPACK_IMPORTED_MODULE_5__]);\n([private_next_pages_app__WEBPACK_IMPORTED_MODULE_4__, _pages_dashboard_tsx__WEBPACK_IMPORTED_MODULE_5__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\n// Import the app and document modules.\n\n\n// Import the userland code.\n\n\n// Re-export the component (should be the default export).\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_pages_dashboard_tsx__WEBPACK_IMPORTED_MODULE_5__, 'default'));\n// Re-export methods.\nconst getStaticProps = (0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_pages_dashboard_tsx__WEBPACK_IMPORTED_MODULE_5__, 'getStaticProps');\nconst getStaticPaths = (0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_pages_dashboard_tsx__WEBPACK_IMPORTED_MODULE_5__, 'getStaticPaths');\nconst getServerSideProps = (0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_pages_dashboard_tsx__WEBPACK_IMPORTED_MODULE_5__, 'getServerSideProps');\nconst config = (0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_pages_dashboard_tsx__WEBPACK_IMPORTED_MODULE_5__, 'config');\nconst reportWebVitals = (0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_pages_dashboard_tsx__WEBPACK_IMPORTED_MODULE_5__, 'reportWebVitals');\n// Re-export legacy methods.\nconst unstable_getStaticProps = (0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_pages_dashboard_tsx__WEBPACK_IMPORTED_MODULE_5__, 'unstable_getStaticProps');\nconst unstable_getStaticPaths = (0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_pages_dashboard_tsx__WEBPACK_IMPORTED_MODULE_5__, 'unstable_getStaticPaths');\nconst unstable_getStaticParams = (0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_pages_dashboard_tsx__WEBPACK_IMPORTED_MODULE_5__, 'unstable_getStaticParams');\nconst unstable_getServerProps = (0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_pages_dashboard_tsx__WEBPACK_IMPORTED_MODULE_5__, 'unstable_getServerProps');\nconst unstable_getServerSideProps = (0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_pages_dashboard_tsx__WEBPACK_IMPORTED_MODULE_5__, 'unstable_getServerSideProps');\n// Create and export the route module that will be consumed.\nconst routeModule = new next_dist_server_route_modules_pages_module_compiled__WEBPACK_IMPORTED_MODULE_0__.PagesRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.PAGES,\n        page: \"/dashboard\",\n        pathname: \"/dashboard\",\n        // The following aren't used in production.\n        bundlePath: '',\n        filename: ''\n    },\n    distDir: \".next\" || 0,\n    relativeProjectDir:  false || '',\n    components: {\n        // default export might not exist when optimized for data only\n        App: private_next_pages_app__WEBPACK_IMPORTED_MODULE_4__[\"default\"],\n        Document: (private_next_pages_document__WEBPACK_IMPORTED_MODULE_3___default())\n    },\n    userland: _pages_dashboard_tsx__WEBPACK_IMPORTED_MODULE_5__\n});\nconst handler = (0,next_dist_server_route_modules_pages_pages_handler__WEBPACK_IMPORTED_MODULE_6__.getHandler)({\n    srcPage: \"/dashboard\",\n    config,\n    userland: _pages_dashboard_tsx__WEBPACK_IMPORTED_MODULE_5__,\n    routeModule,\n    getStaticPaths,\n    getStaticProps,\n    getServerSideProps\n});\n\n//# sourceMappingURL=pages.js.map\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL25vZGVfbW9kdWxlcy9uZXh0L2Rpc3QvYnVpbGQvd2VicGFjay9sb2FkZXJzL25leHQtcm91dGUtbG9hZGVyL2luZGV4LmpzP2tpbmQ9UEFHRVMmcGFnZT0lMkZkYXNoYm9hcmQmcHJlZmVycmVkUmVnaW9uPSZhYnNvbHV0ZVBhZ2VQYXRoPS4lMkZwYWdlcyU1Q2Rhc2hib2FyZC50c3gmYWJzb2x1dGVBcHBQYXRoPXByaXZhdGUtbmV4dC1wYWdlcyUyRl9hcHAmYWJzb2x1dGVEb2N1bWVudFBhdGg9cHJpdmF0ZS1uZXh0LXBhZ2VzJTJGX2RvY3VtZW50Jm1pZGRsZXdhcmVDb25maWdCYXNlNjQ9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQXdGO0FBQ2hDO0FBQ0U7QUFDMUQ7QUFDeUQ7QUFDVjtBQUMvQztBQUNtRDtBQUM2QjtBQUNoRjtBQUNBLGlFQUFlLHdFQUFLLENBQUMsaURBQVEsWUFBWSxFQUFDO0FBQzFDO0FBQ08sdUJBQXVCLHdFQUFLLENBQUMsaURBQVE7QUFDckMsdUJBQXVCLHdFQUFLLENBQUMsaURBQVE7QUFDckMsMkJBQTJCLHdFQUFLLENBQUMsaURBQVE7QUFDekMsZUFBZSx3RUFBSyxDQUFDLGlEQUFRO0FBQzdCLHdCQUF3Qix3RUFBSyxDQUFDLGlEQUFRO0FBQzdDO0FBQ08sZ0NBQWdDLHdFQUFLLENBQUMsaURBQVE7QUFDOUMsZ0NBQWdDLHdFQUFLLENBQUMsaURBQVE7QUFDOUMsaUNBQWlDLHdFQUFLLENBQUMsaURBQVE7QUFDL0MsZ0NBQWdDLHdFQUFLLENBQUMsaURBQVE7QUFDOUMsb0NBQW9DLHdFQUFLLENBQUMsaURBQVE7QUFDekQ7QUFDTyx3QkFBd0Isa0dBQWdCO0FBQy9DO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLGFBQWEsT0FBb0MsSUFBSSxDQUFFO0FBQ3ZELHdCQUF3QixNQUF1QztBQUMvRDtBQUNBO0FBQ0EsYUFBYSw4REFBVztBQUN4QixrQkFBa0Isb0VBQWdCO0FBQ2xDLEtBQUs7QUFDTCxZQUFZO0FBQ1osQ0FBQztBQUNNLGdCQUFnQiw4RkFBVTtBQUNqQztBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRCIsInNvdXJjZXMiOlsiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBhZ2VzUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1tb2R1bGVzL3BhZ2VzL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgaG9pc3QgfSBmcm9tIFwibmV4dC9kaXN0L2J1aWxkL3RlbXBsYXRlcy9oZWxwZXJzXCI7XG4vLyBJbXBvcnQgdGhlIGFwcCBhbmQgZG9jdW1lbnQgbW9kdWxlcy5cbmltcG9ydCAqIGFzIGRvY3VtZW50IGZyb20gXCJwcml2YXRlLW5leHQtcGFnZXMvX2RvY3VtZW50XCI7XG5pbXBvcnQgKiBhcyBhcHAgZnJvbSBcInByaXZhdGUtbmV4dC1wYWdlcy9fYXBwXCI7XG4vLyBJbXBvcnQgdGhlIHVzZXJsYW5kIGNvZGUuXG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiLi9wYWdlc1xcXFxkYXNoYm9hcmQudHN4XCI7XG5pbXBvcnQgeyBnZXRIYW5kbGVyIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9wYWdlcy9wYWdlcy1oYW5kbGVyXCI7XG4vLyBSZS1leHBvcnQgdGhlIGNvbXBvbmVudCAoc2hvdWxkIGJlIHRoZSBkZWZhdWx0IGV4cG9ydCkuXG5leHBvcnQgZGVmYXVsdCBob2lzdCh1c2VybGFuZCwgJ2RlZmF1bHQnKTtcbi8vIFJlLWV4cG9ydCBtZXRob2RzLlxuZXhwb3J0IGNvbnN0IGdldFN0YXRpY1Byb3BzID0gaG9pc3QodXNlcmxhbmQsICdnZXRTdGF0aWNQcm9wcycpO1xuZXhwb3J0IGNvbnN0IGdldFN0YXRpY1BhdGhzID0gaG9pc3QodXNlcmxhbmQsICdnZXRTdGF0aWNQYXRocycpO1xuZXhwb3J0IGNvbnN0IGdldFNlcnZlclNpZGVQcm9wcyA9IGhvaXN0KHVzZXJsYW5kLCAnZ2V0U2VydmVyU2lkZVByb3BzJyk7XG5leHBvcnQgY29uc3QgY29uZmlnID0gaG9pc3QodXNlcmxhbmQsICdjb25maWcnKTtcbmV4cG9ydCBjb25zdCByZXBvcnRXZWJWaXRhbHMgPSBob2lzdCh1c2VybGFuZCwgJ3JlcG9ydFdlYlZpdGFscycpO1xuLy8gUmUtZXhwb3J0IGxlZ2FjeSBtZXRob2RzLlxuZXhwb3J0IGNvbnN0IHVuc3RhYmxlX2dldFN0YXRpY1Byb3BzID0gaG9pc3QodXNlcmxhbmQsICd1bnN0YWJsZV9nZXRTdGF0aWNQcm9wcycpO1xuZXhwb3J0IGNvbnN0IHVuc3RhYmxlX2dldFN0YXRpY1BhdGhzID0gaG9pc3QodXNlcmxhbmQsICd1bnN0YWJsZV9nZXRTdGF0aWNQYXRocycpO1xuZXhwb3J0IGNvbnN0IHVuc3RhYmxlX2dldFN0YXRpY1BhcmFtcyA9IGhvaXN0KHVzZXJsYW5kLCAndW5zdGFibGVfZ2V0U3RhdGljUGFyYW1zJyk7XG5leHBvcnQgY29uc3QgdW5zdGFibGVfZ2V0U2VydmVyUHJvcHMgPSBob2lzdCh1c2VybGFuZCwgJ3Vuc3RhYmxlX2dldFNlcnZlclByb3BzJyk7XG5leHBvcnQgY29uc3QgdW5zdGFibGVfZ2V0U2VydmVyU2lkZVByb3BzID0gaG9pc3QodXNlcmxhbmQsICd1bnN0YWJsZV9nZXRTZXJ2ZXJTaWRlUHJvcHMnKTtcbi8vIENyZWF0ZSBhbmQgZXhwb3J0IHRoZSByb3V0ZSBtb2R1bGUgdGhhdCB3aWxsIGJlIGNvbnN1bWVkLlxuZXhwb3J0IGNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IFBhZ2VzUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLlBBR0VTLFxuICAgICAgICBwYWdlOiBcIi9kYXNoYm9hcmRcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2Rhc2hib2FyZFwiLFxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGFyZW4ndCB1c2VkIGluIHByb2R1Y3Rpb24uXG4gICAgICAgIGJ1bmRsZVBhdGg6ICcnLFxuICAgICAgICBmaWxlbmFtZTogJydcbiAgICB9LFxuICAgIGRpc3REaXI6IHByb2Nlc3MuZW52Ll9fTkVYVF9SRUxBVElWRV9ESVNUX0RJUiB8fCAnJyxcbiAgICByZWxhdGl2ZVByb2plY3REaXI6IHByb2Nlc3MuZW52Ll9fTkVYVF9SRUxBVElWRV9QUk9KRUNUX0RJUiB8fCAnJyxcbiAgICBjb21wb25lbnRzOiB7XG4gICAgICAgIC8vIGRlZmF1bHQgZXhwb3J0IG1pZ2h0IG5vdCBleGlzdCB3aGVuIG9wdGltaXplZCBmb3IgZGF0YSBvbmx5XG4gICAgICAgIEFwcDogYXBwLmRlZmF1bHQsXG4gICAgICAgIERvY3VtZW50OiBkb2N1bWVudC5kZWZhdWx0XG4gICAgfSxcbiAgICB1c2VybGFuZFxufSk7XG5leHBvcnQgY29uc3QgaGFuZGxlciA9IGdldEhhbmRsZXIoe1xuICAgIHNyY1BhZ2U6IFwiL2Rhc2hib2FyZFwiLFxuICAgIGNvbmZpZyxcbiAgICB1c2VybGFuZCxcbiAgICByb3V0ZU1vZHVsZSxcbiAgICBnZXRTdGF0aWNQYXRocyxcbiAgICBnZXRTdGF0aWNQcm9wcyxcbiAgICBnZXRTZXJ2ZXJTaWRlUHJvcHNcbn0pO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYWdlcy5qcy5tYXBcbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(pages-dir-node)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES&page=%2Fdashboard&preferredRegion=&absolutePagePath=.%2Fpages%5Cdashboard.tsx&absoluteAppPath=private-next-pages%2F_app&absoluteDocumentPath=private-next-pages%2F_document&middlewareConfigBase64=e30%3D!\n");

/***/ }),

/***/ "(pages-dir-node)/./pages/_app.tsx":
/*!************************!*\
  !*** ./pages/_app.tsx ***!
  \************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tanstack/react-query */ \"@tanstack/react-query\");\n/* harmony import */ var _context_AuthContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../context/AuthContext */ \"(pages-dir-node)/./context/AuthContext.tsx\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../styles/globals.css */ \"(pages-dir-node)/./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var next_i18next__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! next-i18next */ \"next-i18next\");\n/* harmony import */ var next_i18next__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(next_i18next__WEBPACK_IMPORTED_MODULE_4__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_tanstack_react_query__WEBPACK_IMPORTED_MODULE_1__, _context_AuthContext__WEBPACK_IMPORTED_MODULE_2__]);\n([_tanstack_react_query__WEBPACK_IMPORTED_MODULE_1__, _context_AuthContext__WEBPACK_IMPORTED_MODULE_2__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n // Import AuthProvider\n\n\nconst queryClient = new _tanstack_react_query__WEBPACK_IMPORTED_MODULE_1__.QueryClient();\nfunction MyApp({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_tanstack_react_query__WEBPACK_IMPORTED_MODULE_1__.QueryClientProvider, {\n        client: queryClient,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_context_AuthContext__WEBPACK_IMPORTED_MODULE_2__.AuthProvider, {\n            children: [\n                \" \",\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                    ...pageProps\n                }, void 0, false, {\n                    fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\_app.tsx\",\n                    lineNumber: 13,\n                    columnNumber: 9\n                }, this)\n            ]\n        }, void 0, true, {\n            fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\_app.tsx\",\n            lineNumber: 12,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\_app.tsx\",\n        lineNumber: 11,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,next_i18next__WEBPACK_IMPORTED_MODULE_4__.appWithTranslation)(MyApp));\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3BhZ2VzL19hcHAudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDeUU7QUFDbkIsQ0FBQyxzQkFBc0I7QUFDOUM7QUFDbUI7QUFFbEQsTUFBTUksY0FBYyxJQUFJSiw4REFBV0E7QUFFbkMsU0FBU0ssTUFBTSxFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBWTtJQUMvQyxxQkFDRSw4REFBQ04sc0VBQW1CQTtRQUFDTyxRQUFRSjtrQkFDM0IsNEVBQUNGLDhEQUFZQTs7Z0JBQUM7OEJBQ1osOERBQUNJO29CQUFXLEdBQUdDLFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSWhDO0FBRUEsaUVBQWVKLGdFQUFrQkEsQ0FBQ0UsTUFBTUEsRUFBQyIsInNvdXJjZXMiOlsiRTpcXFdPUktcXHRlbGVncmFtLWZvcndhcmRlci1ib3RcXGZyb250ZW5kXFxwYWdlc1xcX2FwcC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBBcHBQcm9wcyB9IGZyb20gJ25leHQvYXBwJztcbmltcG9ydCB7IFF1ZXJ5Q2xpZW50LCBRdWVyeUNsaWVudFByb3ZpZGVyIH0gZnJvbSAnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5JztcbmltcG9ydCB7IEF1dGhQcm92aWRlciB9IGZyb20gJy4uL2NvbnRleHQvQXV0aENvbnRleHQnOyAvLyBJbXBvcnQgQXV0aFByb3ZpZGVyXG5pbXBvcnQgJy4uL3N0eWxlcy9nbG9iYWxzLmNzcyc7XG5pbXBvcnQgeyBhcHBXaXRoVHJhbnNsYXRpb24gfSBmcm9tICduZXh0LWkxOG5leHQnO1xuXG5jb25zdCBxdWVyeUNsaWVudCA9IG5ldyBRdWVyeUNsaWVudCgpO1xuXG5mdW5jdGlvbiBNeUFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzIH06IEFwcFByb3BzKSB7XG4gIHJldHVybiAoXG4gICAgPFF1ZXJ5Q2xpZW50UHJvdmlkZXIgY2xpZW50PXtxdWVyeUNsaWVudH0+XG4gICAgICA8QXV0aFByb3ZpZGVyPiB7LyogV3JhcCB3aXRoIEF1dGhQcm92aWRlciAqL31cbiAgICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxuICAgICAgPC9BdXRoUHJvdmlkZXI+XG4gICAgPC9RdWVyeUNsaWVudFByb3ZpZGVyPlxuICApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBhcHBXaXRoVHJhbnNsYXRpb24oTXlBcHApOyJdLCJuYW1lcyI6WyJRdWVyeUNsaWVudCIsIlF1ZXJ5Q2xpZW50UHJvdmlkZXIiLCJBdXRoUHJvdmlkZXIiLCJhcHBXaXRoVHJhbnNsYXRpb24iLCJxdWVyeUNsaWVudCIsIk15QXBwIiwiQ29tcG9uZW50IiwicGFnZVByb3BzIiwiY2xpZW50Il0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(pages-dir-node)/./pages/_app.tsx\n");

/***/ }),

/***/ "(pages-dir-node)/./pages/dashboard.tsx":
/*!*****************************!*\
  !*** ./pages/dashboard.tsx ***!
  \*****************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Dashboard),\n/* harmony export */   getStaticProps: () => (/* binding */ getStaticProps)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tanstack/react-query */ \"@tanstack/react-query\");\n/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! axios */ \"axios\");\n/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-i18next */ \"react-i18next\");\n/* harmony import */ var next_i18next_serverSideTranslations__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! next-i18next/serverSideTranslations */ \"next-i18next/serverSideTranslations\");\n/* harmony import */ var next_i18next_serverSideTranslations__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(next_i18next_serverSideTranslations__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! next/router */ \"(pages-dir-node)/./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var _barrel_optimize_names_Bar_BarChart_CartesianGrid_Legend_ResponsiveContainer_Tooltip_XAxis_YAxis_recharts__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! __barrel_optimize__?names=Bar,BarChart,CartesianGrid,Legend,ResponsiveContainer,Tooltip,XAxis,YAxis!=!recharts */ \"(pages-dir-node)/__barrel_optimize__?names=Bar,BarChart,CartesianGrid,Legend,ResponsiveContainer,Tooltip,XAxis,YAxis!=!./node_modules/recharts/lib/index.js\");\n/* harmony import */ var _barrel_optimize_names_ChartBarIcon_ClockIcon_InformationCircleIcon_KeyIcon_heroicons_react_24_outline__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! __barrel_optimize__?names=ChartBarIcon,ClockIcon,InformationCircleIcon,KeyIcon!=!@heroicons/react/24/outline */ \"(pages-dir-node)/__barrel_optimize__?names=ChartBarIcon,ClockIcon,InformationCircleIcon,KeyIcon!=!./node_modules/@heroicons/react/24/outline/esm/index.js\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_tanstack_react_query__WEBPACK_IMPORTED_MODULE_2__, axios__WEBPACK_IMPORTED_MODULE_3__, react_i18next__WEBPACK_IMPORTED_MODULE_4__]);\n([_tanstack_react_query__WEBPACK_IMPORTED_MODULE_2__, axios__WEBPACK_IMPORTED_MODULE_3__, react_i18next__WEBPACK_IMPORTED_MODULE_4__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\n\n\n\n\n\n\nconst apiClient = axios__WEBPACK_IMPORTED_MODULE_3__[\"default\"].create({\n    baseURL: \"http://localhost:5000\"\n});\n// Stat Card component\nconst StatCard = ({ title, value, icon })=>/*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"bg-white p-6 rounded-lg shadow-md flex items-center\",\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"mr-4\",\n                children: icon\n            }, void 0, false, {\n                fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                lineNumber: 42,\n                columnNumber: 9\n            }, undefined),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h3\", {\n                        className: \"text-gray-500 text-sm font-medium\",\n                        children: title\n                    }, void 0, false, {\n                        fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                        lineNumber: 44,\n                        columnNumber: 13\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                        className: \"text-2xl font-bold\",\n                        children: value\n                    }, void 0, false, {\n                        fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                        lineNumber: 45,\n                        columnNumber: 13\n                    }, undefined)\n                ]\n            }, void 0, true, {\n                fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                lineNumber: 43,\n                columnNumber: 9\n            }, undefined)\n        ]\n    }, void 0, true, {\n        fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n        lineNumber: 41,\n        columnNumber: 5\n    }, undefined);\nfunction Dashboard() {\n    const { t } = (0,react_i18next__WEBPACK_IMPORTED_MODULE_4__.useTranslation)('common');\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_6__.useRouter)();\n    const { locale } = router;\n    const [newKeyword, setNewKeyword] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('');\n    const queryClient = (0,_tanstack_react_query__WEBPACK_IMPORTED_MODULE_2__.useQueryClient)();\n    const changeLanguage = (lng)=>{\n        router.push(router.pathname, router.asPath, {\n            locale: lng\n        });\n    };\n    // Fetch keywords\n    const { data: keywords, isLoading: isLoadingKeywords } = (0,_tanstack_react_query__WEBPACK_IMPORTED_MODULE_2__.useQuery)({\n        queryKey: [\n            'keywords'\n        ],\n        queryFn: {\n            \"Dashboard.useQuery\": async ()=>{\n                const response = await apiClient.get('/api/keywords');\n                return response.data;\n            }\n        }[\"Dashboard.useQuery\"]\n    });\n    // Fetch logs\n    const { data: logs, isLoading: isLoadingLogs } = (0,_tanstack_react_query__WEBPACK_IMPORTED_MODULE_2__.useQuery)({\n        queryKey: [\n            'logs'\n        ],\n        queryFn: {\n            \"Dashboard.useQuery\": async ()=>{\n                const response = await apiClient.get('/api/logs');\n                return response.data;\n            }\n        }[\"Dashboard.useQuery\"]\n    });\n    // Fetch channels\n    const { data: channels, isLoading: isLoadingChannels } = (0,_tanstack_react_query__WEBPACK_IMPORTED_MODULE_2__.useQuery)({\n        queryKey: [\n            'channels'\n        ],\n        queryFn: {\n            \"Dashboard.useQuery\": async ()=>{\n                const response = await apiClient.get('/api/channels');\n                return response.data;\n            }\n        }[\"Dashboard.useQuery\"]\n    });\n    const addKeywordMutation = (0,_tanstack_react_query__WEBPACK_IMPORTED_MODULE_2__.useMutation)({\n        mutationFn: {\n            \"Dashboard.useMutation[addKeywordMutation]\": (keyword)=>apiClient.post('/api/keywords', {\n                    keyword\n                })\n        }[\"Dashboard.useMutation[addKeywordMutation]\"],\n        onSuccess: {\n            \"Dashboard.useMutation[addKeywordMutation]\": ()=>{\n                queryClient.invalidateQueries({\n                    queryKey: [\n                        'keywords'\n                    ]\n                });\n                setNewKeyword('');\n            }\n        }[\"Dashboard.useMutation[addKeywordMutation]\"]\n    });\n    const deleteKeywordMutation = (0,_tanstack_react_query__WEBPACK_IMPORTED_MODULE_2__.useMutation)({\n        mutationFn: {\n            \"Dashboard.useMutation[deleteKeywordMutation]\": (id)=>apiClient.delete(`/api/keywords/${id}`)\n        }[\"Dashboard.useMutation[deleteKeywordMutation]\"],\n        onSuccess: {\n            \"Dashboard.useMutation[deleteKeywordMutation]\": ()=>{\n                queryClient.invalidateQueries({\n                    queryKey: [\n                        'keywords'\n                    ]\n                });\n            }\n        }[\"Dashboard.useMutation[deleteKeywordMutation]\"]\n    });\n    const handleAddKeyword = (e)=>{\n        e.preventDefault();\n        if (newKeyword.trim()) {\n            addKeywordMutation.mutate(newKeyword.trim());\n        }\n    };\n    const { forwardedToday, chartData } = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)({\n        \"Dashboard.useMemo\": ()=>{\n            if (!logs) return {\n                forwardedToday: 0,\n                chartData: []\n            };\n            const today = new Date();\n            today.setHours(0, 0, 0, 0);\n            const forwardedToday = logs.filter({\n                \"Dashboard.useMemo\": (log)=>new Date(log.timestamp) >= today\n            }[\"Dashboard.useMemo\"]).length;\n            const last7Days = Array.from({\n                length: 7\n            }, {\n                \"Dashboard.useMemo.last7Days\": (_, i)=>{\n                    const d = new Date();\n                    d.setDate(d.getDate() - i);\n                    return d.toISOString().split('T')[0];\n                }\n            }[\"Dashboard.useMemo.last7Days\"]).reverse();\n            const chartData = last7Days.map({\n                \"Dashboard.useMemo.chartData\": (date)=>({\n                        date,\n                        count: logs.filter({\n                            \"Dashboard.useMemo.chartData\": (log)=>log.timestamp.startsWith(date)\n                        }[\"Dashboard.useMemo.chartData\"]).length\n                    })\n            }[\"Dashboard.useMemo.chartData\"]);\n            return {\n                forwardedToday,\n                chartData\n            };\n        }\n    }[\"Dashboard.useMemo\"], [\n        logs\n    ]);\n    const activeChannels = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)({\n        \"Dashboard.useMemo[activeChannels]\": ()=>{\n            if (!channels) return 0;\n            return channels.filter({\n                \"Dashboard.useMemo[activeChannels]\": (c)=>c.isActive\n            }[\"Dashboard.useMemo[activeChannels]\"]).length;\n        }\n    }[\"Dashboard.useMemo[activeChannels]\"], [\n        channels\n    ]);\n    const isLoading = isLoadingKeywords || isLoadingLogs || isLoadingChannels;\n    if (isLoading) return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        children: t('loadingKeywords')\n    }, void 0, false, {\n        fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n        lineNumber: 141,\n        columnNumber: 25\n    }, this);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"bg-gray-50 min-h-screen\",\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            className: \"container mx-auto px-4 py-8\",\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    className: \"flex justify-between items-center mb-8\",\n                    children: [\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h1\", {\n                            className: \"text-3xl font-bold\",\n                            children: t('dashboard')\n                        }, void 0, false, {\n                            fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                            lineNumber: 147,\n                            columnNumber: 17\n                        }, this),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                            children: [\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                                    onClick: ()=>changeLanguage('en'),\n                                    disabled: locale === 'en',\n                                    className: \"px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 mr-2\",\n                                    children: \"English\"\n                                }, void 0, false, {\n                                    fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                    lineNumber: 149,\n                                    columnNumber: 21\n                                }, this),\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                                    onClick: ()=>changeLanguage('fa'),\n                                    disabled: locale === 'fa',\n                                    className: \"px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50\",\n                                    children: \"فارسی\"\n                                }, void 0, false, {\n                                    fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                    lineNumber: 150,\n                                    columnNumber: 21\n                                }, this)\n                            ]\n                        }, void 0, true, {\n                            fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                            lineNumber: 148,\n                            columnNumber: 17\n                        }, this)\n                    ]\n                }, void 0, true, {\n                    fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                    lineNumber: 146,\n                    columnNumber: 13\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    className: \"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8\",\n                    children: [\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(StatCard, {\n                            title: t('messagesForwardedToday'),\n                            value: forwardedToday,\n                            icon: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_ChartBarIcon_ClockIcon_InformationCircleIcon_KeyIcon_heroicons_react_24_outline__WEBPACK_IMPORTED_MODULE_7__.ChartBarIcon, {\n                                className: \"h-8 w-8 text-blue-500\"\n                            }, void 0, false, {\n                                fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                lineNumber: 156,\n                                columnNumber: 92\n                            }, void 0)\n                        }, void 0, false, {\n                            fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                            lineNumber: 156,\n                            columnNumber: 17\n                        }, this),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(StatCard, {\n                            title: t('totalKeywords'),\n                            value: keywords?.length ?? 0,\n                            icon: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_ChartBarIcon_ClockIcon_InformationCircleIcon_KeyIcon_heroicons_react_24_outline__WEBPACK_IMPORTED_MODULE_7__.KeyIcon, {\n                                className: \"h-8 w-8 text-green-500\"\n                            }, void 0, false, {\n                                fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                lineNumber: 157,\n                                columnNumber: 90\n                            }, void 0)\n                        }, void 0, false, {\n                            fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                            lineNumber: 157,\n                            columnNumber: 17\n                        }, this),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(StatCard, {\n                            title: t('activeChannels'),\n                            value: activeChannels,\n                            icon: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_ChartBarIcon_ClockIcon_InformationCircleIcon_KeyIcon_heroicons_react_24_outline__WEBPACK_IMPORTED_MODULE_7__.InformationCircleIcon, {\n                                className: \"h-8 w-8 text-indigo-500\"\n                            }, void 0, false, {\n                                fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                lineNumber: 158,\n                                columnNumber: 84\n                            }, void 0)\n                        }, void 0, false, {\n                            fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                            lineNumber: 158,\n                            columnNumber: 17\n                        }, this)\n                    ]\n                }, void 0, true, {\n                    fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                    lineNumber: 155,\n                    columnNumber: 13\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    className: \"grid grid-cols-1 lg:grid-cols-3 gap-8\",\n                    children: [\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                            className: \"lg:col-span-2\",\n                            children: [\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                    className: \"bg-white p-6 rounded-lg shadow-md mb-8\",\n                                    children: [\n                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h2\", {\n                                            className: \"text-xl font-bold mb-4\",\n                                            children: t('forwardingActivityLast7Days')\n                                        }, void 0, false, {\n                                            fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                            lineNumber: 166,\n                                            columnNumber: 25\n                                        }, this),\n                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Bar_BarChart_CartesianGrid_Legend_ResponsiveContainer_Tooltip_XAxis_YAxis_recharts__WEBPACK_IMPORTED_MODULE_8__.ResponsiveContainer, {\n                                            width: \"100%\",\n                                            height: 300,\n                                            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Bar_BarChart_CartesianGrid_Legend_ResponsiveContainer_Tooltip_XAxis_YAxis_recharts__WEBPACK_IMPORTED_MODULE_8__.BarChart, {\n                                                data: chartData,\n                                                children: [\n                                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Bar_BarChart_CartesianGrid_Legend_ResponsiveContainer_Tooltip_XAxis_YAxis_recharts__WEBPACK_IMPORTED_MODULE_8__.CartesianGrid, {\n                                                        strokeDasharray: \"3 3\"\n                                                    }, void 0, false, {\n                                                        fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                                        lineNumber: 169,\n                                                        columnNumber: 33\n                                                    }, this),\n                                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Bar_BarChart_CartesianGrid_Legend_ResponsiveContainer_Tooltip_XAxis_YAxis_recharts__WEBPACK_IMPORTED_MODULE_8__.XAxis, {\n                                                        dataKey: \"date\"\n                                                    }, void 0, false, {\n                                                        fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                                        lineNumber: 170,\n                                                        columnNumber: 33\n                                                    }, this),\n                                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Bar_BarChart_CartesianGrid_Legend_ResponsiveContainer_Tooltip_XAxis_YAxis_recharts__WEBPACK_IMPORTED_MODULE_8__.YAxis, {}, void 0, false, {\n                                                        fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                                        lineNumber: 171,\n                                                        columnNumber: 33\n                                                    }, this),\n                                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Bar_BarChart_CartesianGrid_Legend_ResponsiveContainer_Tooltip_XAxis_YAxis_recharts__WEBPACK_IMPORTED_MODULE_8__.Tooltip, {}, void 0, false, {\n                                                        fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                                        lineNumber: 172,\n                                                        columnNumber: 33\n                                                    }, this),\n                                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Bar_BarChart_CartesianGrid_Legend_ResponsiveContainer_Tooltip_XAxis_YAxis_recharts__WEBPACK_IMPORTED_MODULE_8__.Legend, {}, void 0, false, {\n                                                        fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                                        lineNumber: 173,\n                                                        columnNumber: 33\n                                                    }, this),\n                                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Bar_BarChart_CartesianGrid_Legend_ResponsiveContainer_Tooltip_XAxis_YAxis_recharts__WEBPACK_IMPORTED_MODULE_8__.Bar, {\n                                                        dataKey: \"count\",\n                                                        fill: \"#8884d8\",\n                                                        name: t('forwardedMessages')\n                                                    }, void 0, false, {\n                                                        fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                                        lineNumber: 174,\n                                                        columnNumber: 33\n                                                    }, this)\n                                                ]\n                                            }, void 0, true, {\n                                                fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                                lineNumber: 168,\n                                                columnNumber: 29\n                                            }, this)\n                                        }, void 0, false, {\n                                            fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                            lineNumber: 167,\n                                            columnNumber: 25\n                                        }, this)\n                                    ]\n                                }, void 0, true, {\n                                    fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                    lineNumber: 165,\n                                    columnNumber: 21\n                                }, this),\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                    className: \"bg-white p-6 rounded-lg shadow-md\",\n                                    children: [\n                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h2\", {\n                                            className: \"text-xl font-bold mb-4\",\n                                            children: t('keywordManager')\n                                        }, void 0, false, {\n                                            fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                            lineNumber: 181,\n                                            columnNumber: 25\n                                        }, this),\n                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"form\", {\n                                            onSubmit: handleAddKeyword,\n                                            className: \"mb-8\",\n                                            children: [\n                                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                                    className: \"flex gap-4\",\n                                                    children: [\n                                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"input\", {\n                                                            type: \"text\",\n                                                            value: newKeyword,\n                                                            onChange: (e)=>setNewKeyword(e.target.value),\n                                                            placeholder: t('enterKeyword'),\n                                                            className: \"flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\"\n                                                        }, void 0, false, {\n                                                            fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                                            lineNumber: 184,\n                                                            columnNumber: 33\n                                                        }, this),\n                                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                                                            type: \"submit\",\n                                                            disabled: addKeywordMutation.isPending,\n                                                            className: \"px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50\",\n                                                            children: addKeywordMutation.isPending ? t('adding') : t('addKeyword')\n                                                        }, void 0, false, {\n                                                            fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                                            lineNumber: 191,\n                                                            columnNumber: 33\n                                                        }, this)\n                                                    ]\n                                                }, void 0, true, {\n                                                    fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                                    lineNumber: 183,\n                                                    columnNumber: 29\n                                                }, this),\n                                                addKeywordMutation.isError && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                                                    className: \"text-red-500 mt-2\",\n                                                    children: [\n                                                        t('errorAddingKeyword'),\n                                                        addKeywordMutation.error.message\n                                                    ]\n                                                }, void 0, true, {\n                                                    fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                                    lineNumber: 200,\n                                                    columnNumber: 29\n                                                }, this)\n                                            ]\n                                        }, void 0, true, {\n                                            fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                            lineNumber: 182,\n                                            columnNumber: 25\n                                        }, this),\n                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                            className: \"grid gap-4\",\n                                            children: keywords?.map((keyword)=>/*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                                    className: \"p-4 border border-gray-200 rounded-lg flex justify-between items-center\",\n                                                    children: [\n                                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                                            children: [\n                                                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                                                                    className: \"font-semibold\",\n                                                                    children: keyword.keyword\n                                                                }, void 0, false, {\n                                                                    fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                                                    lineNumber: 208,\n                                                                    columnNumber: 33\n                                                                }, this),\n                                                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                                                    className: \"text-sm text-gray-500\",\n                                                                    children: [\n                                                                        keyword.caseSensitive && `${t('caseSensitive')} • `,\n                                                                        keyword.exactMatch && `${t('exactMatch')} • `,\n                                                                        t('added'),\n                                                                        \" \",\n                                                                        new Date(keyword.createdAt).toLocaleDateString()\n                                                                    ]\n                                                                }, void 0, true, {\n                                                                    fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                                                    lineNumber: 209,\n                                                                    columnNumber: 33\n                                                                }, this)\n                                                            ]\n                                                        }, void 0, true, {\n                                                            fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                                            lineNumber: 207,\n                                                            columnNumber: 33\n                                                        }, this),\n                                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                                                            onClick: ()=>deleteKeywordMutation.mutate(keyword._id),\n                                                            disabled: deleteKeywordMutation.isPending,\n                                                            className: \"px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50\",\n                                                            children: deleteKeywordMutation.isPending ? t('deleting') : t('delete')\n                                                        }, void 0, false, {\n                                                            fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                                            lineNumber: 215,\n                                                            columnNumber: 33\n                                                        }, this)\n                                                    ]\n                                                }, keyword._id, true, {\n                                                    fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                                    lineNumber: 206,\n                                                    columnNumber: 29\n                                                }, this))\n                                        }, void 0, false, {\n                                            fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                            lineNumber: 204,\n                                            columnNumber: 25\n                                        }, this),\n                                        deleteKeywordMutation.isError && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                                            className: \"text-red-500 mt-2\",\n                                            children: [\n                                                t('errorDeletingKeyword'),\n                                                deleteKeywordMutation.error.message\n                                            ]\n                                        }, void 0, true, {\n                                            fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                            lineNumber: 226,\n                                            columnNumber: 29\n                                        }, this)\n                                    ]\n                                }, void 0, true, {\n                                    fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                    lineNumber: 180,\n                                    columnNumber: 21\n                                }, this)\n                            ]\n                        }, void 0, true, {\n                            fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                            lineNumber: 163,\n                            columnNumber: 17\n                        }, this),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                            className: \"bg-white p-6 rounded-lg shadow-md\",\n                            children: [\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h2\", {\n                                    className: \"text-xl font-bold mb-4\",\n                                    children: t('recentActivity')\n                                }, void 0, false, {\n                                    fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                    lineNumber: 233,\n                                    columnNumber: 21\n                                }, this),\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"ul\", {\n                                    className: \"space-y-4\",\n                                    children: logs?.slice(0, 10).map((log)=>/*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"li\", {\n                                            className: \"flex items-start\",\n                                            children: [\n                                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_ChartBarIcon_ClockIcon_InformationCircleIcon_KeyIcon_heroicons_react_24_outline__WEBPACK_IMPORTED_MODULE_7__.ClockIcon, {\n                                                    className: \"h-5 w-5 text-gray-400 mr-3 mt-1\"\n                                                }, void 0, false, {\n                                                    fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                                    lineNumber: 237,\n                                                    columnNumber: 33\n                                                }, this),\n                                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                                    children: [\n                                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                                                            className: \"font-semibold\",\n                                                            children: log.keywordId.keyword\n                                                        }, void 0, false, {\n                                                            fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                                            lineNumber: 239,\n                                                            columnNumber: 37\n                                                        }, this),\n                                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                                                            className: \"text-sm text-gray-600 truncate\",\n                                                            children: log.message\n                                                        }, void 0, false, {\n                                                            fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                                            lineNumber: 240,\n                                                            columnNumber: 37\n                                                        }, this),\n                                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                                                            className: \"text-xs text-gray-400\",\n                                                            children: new Date(log.timestamp).toLocaleString()\n                                                        }, void 0, false, {\n                                                            fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                                            lineNumber: 241,\n                                                            columnNumber: 37\n                                                        }, this)\n                                                    ]\n                                                }, void 0, true, {\n                                                    fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                                    lineNumber: 238,\n                                                    columnNumber: 33\n                                                }, this)\n                                            ]\n                                        }, log._id, true, {\n                                            fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                            lineNumber: 236,\n                                            columnNumber: 29\n                                        }, this))\n                                }, void 0, false, {\n                                    fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                                    lineNumber: 234,\n                                    columnNumber: 21\n                                }, this)\n                            ]\n                        }, void 0, true, {\n                            fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                            lineNumber: 232,\n                            columnNumber: 17\n                        }, this)\n                    ]\n                }, void 0, true, {\n                    fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n                    lineNumber: 161,\n                    columnNumber: 13\n                }, this)\n            ]\n        }, void 0, true, {\n            fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n            lineNumber: 145,\n            columnNumber: 9\n        }, this)\n    }, void 0, false, {\n        fileName: \"E:\\\\WORK\\\\telegram-forwarder-bot\\\\frontend\\\\pages\\\\dashboard.tsx\",\n        lineNumber: 144,\n        columnNumber: 5\n    }, this);\n}\nconst getStaticProps = async ({ locale })=>{\n    console.log('Dashboard getStaticProps: Received locale', locale);\n    const translations = await (0,next_i18next_serverSideTranslations__WEBPACK_IMPORTED_MODULE_5__.serverSideTranslations)(locale ?? 'en', [\n        'common'\n    ]); // Pass the i18n config\n    console.log('Dashboard getStaticProps: Loaded translations for locale', locale ?? 'en', translations);\n    return {\n        props: {\n            ...translations\n        }\n    };\n};\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Ozs7Ozs7c0VBQzFELDhEQUFDdkY7NERBQUVGLFdBQVU7c0VBQXlCLElBQUk0QyxLQUFLRyxJQUFJQyxTQUFTLEVBQUVvRCxjQUFjOzs7Ozs7Ozs7Ozs7OzJDQUwzRXJELElBQUlnRCxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFlNUM7QUFFTyxNQUFNTSxpQkFBaUMsT0FBTyxFQUFFL0YsTUFBTSxFQUFFO0lBQzdEZ0csUUFBUXZELEdBQUcsQ0FBQyw2Q0FBNkN6QztJQUN6RCxNQUFNaUcsZUFBZSxNQUFNaEksMkZBQXNCQSxDQUFDK0IsVUFBVSxNQUFNO1FBQUM7S0FBUyxHQUFHLHVCQUF1QjtJQUN0R2dHLFFBQVF2RCxHQUFHLENBQUMsNERBQTREekMsVUFBVSxNQUFNaUc7SUFDeEYsT0FBTztRQUNMQyxPQUFPO1lBQ0wsR0FBR0QsWUFBWTtRQUNqQjtJQUNGO0FBQ0YsRUFBRSIsInNvdXJjZXMiOlsiRTpcXFdPUktcXHRlbGVncmFtLWZvcndhcmRlci1ib3RcXGZyb250ZW5kXFxwYWdlc1xcZGFzaGJvYXJkLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VTdGF0ZSwgdXNlTWVtbyB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZVF1ZXJ5LCB1c2VNdXRhdGlvbiwgdXNlUXVlcnlDbGllbnQgfSBmcm9tICdAdGFuc3RhY2svcmVhY3QtcXVlcnknO1xuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcbmltcG9ydCB7IHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAncmVhY3QtaTE4bmV4dCc7XG5pbXBvcnQgeyBzZXJ2ZXJTaWRlVHJhbnNsYXRpb25zIH0gZnJvbSAnbmV4dC1pMThuZXh0L3NlcnZlclNpZGVUcmFuc2xhdGlvbnMnO1xuaW1wb3J0IHR5cGUgeyBHZXRTdGF0aWNQcm9wcyB9IGZyb20gJ25leHQnO1xuaW1wb3J0IHsgdXNlUm91dGVyIH0gZnJvbSAnbmV4dC9yb3V0ZXInO1xuaW1wb3J0IHsgQmFyQ2hhcnQsIEJhciwgWEF4aXMsIFlBeGlzLCBDYXJ0ZXNpYW5HcmlkLCBUb29sdGlwLCBMZWdlbmQsIFJlc3BvbnNpdmVDb250YWluZXIgfSBmcm9tICdyZWNoYXJ0cyc7XG5pbXBvcnQgeyBJbmZvcm1hdGlvbkNpcmNsZUljb24sIENoYXJ0QmFySWNvbiwgQ2xvY2tJY29uLCBLZXlJY29uIH0gZnJvbSAnQGhlcm9pY29ucy9yZWFjdC8yNC9vdXRsaW5lJztcblxuXG5jb25zdCBhcGlDbGllbnQgPSBheGlvcy5jcmVhdGUoe1xuICBiYXNlVVJMOiBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19BUElfVVJMLFxufSk7XG5cbmludGVyZmFjZSBLZXl3b3JkIHtcbiAgX2lkOiBzdHJpbmc7XG4gIGtleXdvcmQ6IHN0cmluZztcbiAgaXNBY3RpdmU6IGJvb2xlYW47XG4gIGNhc2VTZW5zaXRpdmU6IGJvb2xlYW47XG4gIGV4YWN0TWF0Y2g6IGJvb2xlYW47XG4gIGNyZWF0ZWRBdDogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgTG9nIHtcbiAgICBfaWQ6IHN0cmluZztcbiAgICBtZXNzYWdlOiBzdHJpbmc7XG4gICAgdGltZXN0YW1wOiBzdHJpbmc7XG4gICAga2V5d29yZElkOiB7IGtleXdvcmQ6IHN0cmluZyB9O1xuICAgIGNoYW5uZWxJZDogeyBjaGFubmVsTmFtZTogc3RyaW5nIH07XG59XG5cbmludGVyZmFjZSBDaGFubmVsIHtcbiAgICBfaWQ6IHN0cmluZztcbiAgICBjaGFubmVsTmFtZTogc3RyaW5nO1xuICAgIGlzQWN0aXZlOiBib29sZWFuO1xufVxuXG4vLyBTdGF0IENhcmQgY29tcG9uZW50XG5jb25zdCBTdGF0Q2FyZCA9ICh7IHRpdGxlLCB2YWx1ZSwgaWNvbiB9OiB7IHRpdGxlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcgfCBudW1iZXIsIGljb246IFJlYWN0LlJlYWN0Tm9kZSB9KSA9PiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJiZy13aGl0ZSBwLTYgcm91bmRlZC1sZyBzaGFkb3ctbWQgZmxleCBpdGVtcy1jZW50ZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtci00XCI+e2ljb259PC9kaXY+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwidGV4dC1ncmF5LTUwMCB0ZXh0LXNtIGZvbnQtbWVkaXVtXCI+e3RpdGxlfTwvaDM+XG4gICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LTJ4bCBmb250LWJvbGRcIj57dmFsdWV9PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbik7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIERhc2hib2FyZCgpIHtcbiAgY29uc3QgeyB0IH0gPSB1c2VUcmFuc2xhdGlvbignY29tbW9uJyk7XG4gIGNvbnN0IHJvdXRlciA9IHVzZVJvdXRlcigpO1xuICBjb25zdCB7IGxvY2FsZSB9ID0gcm91dGVyO1xuXG4gIGNvbnN0IFtuZXdLZXl3b3JkLCBzZXROZXdLZXl3b3JkXSA9IHVzZVN0YXRlKCcnKTtcbiAgY29uc3QgcXVlcnlDbGllbnQgPSB1c2VRdWVyeUNsaWVudCgpO1xuXG4gIGNvbnN0IGNoYW5nZUxhbmd1YWdlID0gKGxuZzogc3RyaW5nKSA9PiB7XG4gICAgcm91dGVyLnB1c2gocm91dGVyLnBhdGhuYW1lLCByb3V0ZXIuYXNQYXRoLCB7IGxvY2FsZTogbG5nIH0pO1xuICB9O1xuXG4gIC8vIEZldGNoIGtleXdvcmRzXG4gIGNvbnN0IHsgZGF0YToga2V5d29yZHMsIGlzTG9hZGluZzogaXNMb2FkaW5nS2V5d29yZHMgfSA9IHVzZVF1ZXJ5PEtleXdvcmRbXT4oe1xuICAgIHF1ZXJ5S2V5OiBbJ2tleXdvcmRzJ10sXG4gICAgcXVlcnlGbjogYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGlDbGllbnQuZ2V0KCcvYXBpL2tleXdvcmRzJyk7XG4gICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICB9LFxuICB9KTtcblxuICAvLyBGZXRjaCBsb2dzXG4gIGNvbnN0IHsgZGF0YTogbG9ncywgaXNMb2FkaW5nOiBpc0xvYWRpbmdMb2dzIH0gPSB1c2VRdWVyeTxMb2dbXT4oe1xuICAgIHF1ZXJ5S2V5OiBbJ2xvZ3MnXSxcbiAgICBxdWVyeUZuOiBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXBpQ2xpZW50LmdldCgnL2FwaS9sb2dzJyk7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRmV0Y2ggY2hhbm5lbHNcbiAgY29uc3QgeyBkYXRhOiBjaGFubmVscywgaXNMb2FkaW5nOiBpc0xvYWRpbmdDaGFubmVscyB9ID0gdXNlUXVlcnk8Q2hhbm5lbFtdPih7XG4gICAgcXVlcnlLZXk6IFsnY2hhbm5lbHMnXSxcbiAgICBxdWVyeUZuOiBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXBpQ2xpZW50LmdldCgnL2FwaS9jaGFubmVscycpO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICB9XG4gIH0pO1xuXG4gIGNvbnN0IGFkZEtleXdvcmRNdXRhdGlvbiA9IHVzZU11dGF0aW9uKHtcbiAgICBtdXRhdGlvbkZuOiAoa2V5d29yZDogc3RyaW5nKSA9PiBhcGlDbGllbnQucG9zdCgnL2FwaS9rZXl3b3JkcycsIHsga2V5d29yZCB9KSxcbiAgICBvblN1Y2Nlc3M6ICgpID0+IHtcbiAgICAgIHF1ZXJ5Q2xpZW50LmludmFsaWRhdGVRdWVyaWVzKHsgcXVlcnlLZXk6IFsna2V5d29yZHMnXSB9KTtcbiAgICAgIHNldE5ld0tleXdvcmQoJycpO1xuICAgIH0sXG4gIH0pO1xuXG4gIGNvbnN0IGRlbGV0ZUtleXdvcmRNdXRhdGlvbiA9IHVzZU11dGF0aW9uKHtcbiAgICBtdXRhdGlvbkZuOiAoaWQ6IHN0cmluZykgPT4gYXBpQ2xpZW50LmRlbGV0ZShgL2FwaS9rZXl3b3Jkcy8ke2lkfWApLFxuICAgIG9uU3VjY2VzczogKCkgPT4ge1xuICAgICAgcXVlcnlDbGllbnQuaW52YWxpZGF0ZVF1ZXJpZXMoeyBxdWVyeUtleTogWydrZXl3b3JkcyddIH0pO1xuICAgIH0sXG4gIH0pO1xuXG4gIGNvbnN0IGhhbmRsZUFkZEtleXdvcmQgPSAoZTogUmVhY3QuRm9ybUV2ZW50KSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmIChuZXdLZXl3b3JkLnRyaW0oKSkge1xuICAgICAgYWRkS2V5d29yZE11dGF0aW9uLm11dGF0ZShuZXdLZXl3b3JkLnRyaW0oKSk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHsgZm9yd2FyZGVkVG9kYXksIGNoYXJ0RGF0YSB9ID0gdXNlTWVtbygoKSA9PiB7XG4gICAgaWYgKCFsb2dzKSByZXR1cm4geyBmb3J3YXJkZWRUb2RheTogMCwgY2hhcnREYXRhOiBbXSB9O1xuXG4gICAgY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIHRvZGF5LnNldEhvdXJzKDAsIDAsIDAsIDApO1xuXG4gICAgY29uc3QgZm9yd2FyZGVkVG9kYXkgPSBsb2dzLmZpbHRlcihsb2cgPT4gbmV3IERhdGUobG9nLnRpbWVzdGFtcCkgPj0gdG9kYXkpLmxlbmd0aDtcblxuICAgIGNvbnN0IGxhc3Q3RGF5cyA9IEFycmF5LmZyb20oeyBsZW5ndGg6IDcgfSwgKF8sIGkpID0+IHtcbiAgICAgICAgY29uc3QgZCA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGQuc2V0RGF0ZShkLmdldERhdGUoKSAtIGkpO1xuICAgICAgICByZXR1cm4gZC50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF07XG4gICAgfSkucmV2ZXJzZSgpO1xuXG4gICAgY29uc3QgY2hhcnREYXRhID0gbGFzdDdEYXlzLm1hcChkYXRlID0+ICh7XG4gICAgICAgIGRhdGUsXG4gICAgICAgIGNvdW50OiBsb2dzLmZpbHRlcihsb2cgPT4gbG9nLnRpbWVzdGFtcC5zdGFydHNXaXRoKGRhdGUpKS5sZW5ndGgsXG4gICAgfSkpO1xuXG4gICAgcmV0dXJuIHsgZm9yd2FyZGVkVG9kYXksIGNoYXJ0RGF0YSB9O1xuICB9LCBbbG9nc10pO1xuXG4gIGNvbnN0IGFjdGl2ZUNoYW5uZWxzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICBpZighY2hhbm5lbHMpIHJldHVybiAwO1xuICAgICAgcmV0dXJuIGNoYW5uZWxzLmZpbHRlcihjID0+IGMuaXNBY3RpdmUpLmxlbmd0aDtcbiAgfSwgW2NoYW5uZWxzXSk7XG5cblxuICBjb25zdCBpc0xvYWRpbmcgPSBpc0xvYWRpbmdLZXl3b3JkcyB8fCBpc0xvYWRpbmdMb2dzIHx8IGlzTG9hZGluZ0NoYW5uZWxzO1xuXG4gIGlmIChpc0xvYWRpbmcpIHJldHVybiA8ZGl2Pnt0KCdsb2FkaW5nS2V5d29yZHMnKX08L2Rpdj47XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLWdyYXktNTAgbWluLWgtc2NyZWVuXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29udGFpbmVyIG14LWF1dG8gcHgtNCBweS04XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLWNlbnRlciBtYi04XCI+XG4gICAgICAgICAgICAgICAgPGgxIGNsYXNzTmFtZT1cInRleHQtM3hsIGZvbnQtYm9sZFwiPnt0KCdkYXNoYm9hcmQnKX08L2gxPlxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gY2hhbmdlTGFuZ3VhZ2UoJ2VuJyl9IGRpc2FibGVkPXtsb2NhbGUgPT09ICdlbid9IGNsYXNzTmFtZT1cInB4LTMgcHktMSBiZy1ncmF5LTIwMCB0ZXh0LWdyYXktNzAwIHJvdW5kZWQgZGlzYWJsZWQ6b3BhY2l0eS01MCBtci0yXCI+RW5nbGlzaDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IGNoYW5nZUxhbmd1YWdlKCdmYScpfSBkaXNhYmxlZD17bG9jYWxlID09PSAnZmEnfSBjbGFzc05hbWU9XCJweC0zIHB5LTEgYmctZ3JheS0yMDAgdGV4dC1ncmF5LTcwMCByb3VuZGVkIGRpc2FibGVkOm9wYWNpdHktNTBcIj7Zgdin2LHYs9uMPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgey8qIFN0YXRzIENhcmRzICovfVxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy0yIGxnOmdyaWQtY29scy0zIGdhcC02IG1iLThcIj5cbiAgICAgICAgICAgICAgICA8U3RhdENhcmQgdGl0bGU9e3QoJ21lc3NhZ2VzRm9yd2FyZGVkVG9kYXknKX0gdmFsdWU9e2ZvcndhcmRlZFRvZGF5fSBpY29uPXs8Q2hhcnRCYXJJY29uIGNsYXNzTmFtZT0naC04IHctOCB0ZXh0LWJsdWUtNTAwJy8+fSAvPlxuICAgICAgICAgICAgICAgIDxTdGF0Q2FyZCB0aXRsZT17dCgndG90YWxLZXl3b3JkcycpfSB2YWx1ZT17a2V5d29yZHM/Lmxlbmd0aCA/PyAwfSBpY29uPXs8S2V5SWNvbiBjbGFzc05hbWU9J2gtOCB3LTggdGV4dC1ncmVlbi01MDAnLz59IC8+XG4gICAgICAgICAgICAgICAgPFN0YXRDYXJkIHRpdGxlPXt0KCdhY3RpdmVDaGFubmVscycpfSB2YWx1ZT17YWN0aXZlQ2hhbm5lbHN9IGljb249ezxJbmZvcm1hdGlvbkNpcmNsZUljb24gY2xhc3NOYW1lPSdoLTggdy04IHRleHQtaW5kaWdvLTUwMCcvPn0gLz5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdyaWQgZ3JpZC1jb2xzLTEgbGc6Z3JpZC1jb2xzLTMgZ2FwLThcIj5cbiAgICAgICAgICAgICAgICB7LyogTGVmdCBDb2x1bW4gKi99XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsZzpjb2wtc3Bhbi0yXCI+XG4gICAgICAgICAgICAgICAgICAgIHsvKiBDaGFydCAqL31cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy13aGl0ZSBwLTYgcm91bmRlZC1sZyBzaGFkb3ctbWQgbWItOFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQteGwgZm9udC1ib2xkIG1iLTRcIj57dCgnZm9yd2FyZGluZ0FjdGl2aXR5TGFzdDdEYXlzJyl9PC9oMj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxSZXNwb25zaXZlQ29udGFpbmVyIHdpZHRoPVwiMTAwJVwiIGhlaWdodD17MzAwfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QmFyQ2hhcnQgZGF0YT17Y2hhcnREYXRhfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPENhcnRlc2lhbkdyaWQgc3Ryb2tlRGFzaGFycmF5PVwiMyAzXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFhBeGlzIGRhdGFLZXk9XCJkYXRlXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFlBeGlzIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUb29sdGlwIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxMZWdlbmQgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJhciBkYXRhS2V5PVwiY291bnRcIiBmaWxsPVwiIzg4ODRkOFwiIG5hbWU9e3QoJ2ZvcndhcmRlZE1lc3NhZ2VzJyl9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9CYXJDaGFydD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvUmVzcG9uc2l2ZUNvbnRhaW5lcj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgICAgey8qIEtleXdvcmQgTWFuYWdlciAqL31cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy13aGl0ZSBwLTYgcm91bmRlZC1sZyBzaGFkb3ctbWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ0ZXh0LXhsIGZvbnQtYm9sZCBtYi00XCI+e3QoJ2tleXdvcmRNYW5hZ2VyJyl9PC9oMj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXtoYW5kbGVBZGRLZXl3b3JkfSBjbGFzc05hbWU9XCJtYi04XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGdhcC00XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e25ld0tleXdvcmR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldE5ld0tleXdvcmQoZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3QoJ2VudGVyS2V5d29yZCcpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZmxleC0xIHB4LTQgcHktMiBib3JkZXIgYm9yZGVyLWdyYXktMzAwIHJvdW5kZWQtbGcgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctYmx1ZS01MDAgZm9jdXM6Ym9yZGVyLXRyYW5zcGFyZW50XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInN1Ym1pdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17YWRkS2V5d29yZE11dGF0aW9uLmlzUGVuZGluZ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInB4LTYgcHktMiBiZy1ibHVlLTYwMCB0ZXh0LXdoaXRlIHJvdW5kZWQtbGcgaG92ZXI6YmctYmx1ZS03MDAgZGlzYWJsZWQ6b3BhY2l0eS01MFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHthZGRLZXl3b3JkTXV0YXRpb24uaXNQZW5kaW5nID8gdCgnYWRkaW5nJykgOiB0KCdhZGRLZXl3b3JkJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHthZGRLZXl3b3JkTXV0YXRpb24uaXNFcnJvciAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1yZWQtNTAwIG10LTJcIj57dCgnZXJyb3JBZGRpbmdLZXl3b3JkJyl9eyhhZGRLZXl3b3JkTXV0YXRpb24uZXJyb3IgYXMgRXJyb3IpLm1lc3NhZ2V9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Zvcm0+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBnYXAtNFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtrZXl3b3Jkcz8ubWFwKChrZXl3b3JkOiBLZXl3b3JkKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2tleXdvcmQuX2lkfSBjbGFzc05hbWU9XCJwLTQgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCByb3VuZGVkLWxnIGZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLWNlbnRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJmb250LXNlbWlib2xkXCI+e2tleXdvcmQua2V5d29yZH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LWdyYXktNTAwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7a2V5d29yZC5jYXNlU2Vuc2l0aXZlICYmIGAke3QoJ2Nhc2VTZW5zaXRpdmUnKX0g4oCiIGB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7a2V5d29yZC5leGFjdE1hdGNoICYmIGAke3QoJ2V4YWN0TWF0Y2gnKX0g4oCiIGB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dCgnYWRkZWQnKX0ge25ldyBEYXRlKGtleXdvcmQuY3JlYXRlZEF0KS50b0xvY2FsZURhdGVTdHJpbmcoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGRlbGV0ZUtleXdvcmRNdXRhdGlvbi5tdXRhdGUoa2V5d29yZC5faWQpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17ZGVsZXRlS2V5d29yZE11dGF0aW9uLmlzUGVuZGluZ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicHgtMyBweS0xIGJnLXJlZC01MDAgdGV4dC13aGl0ZSByb3VuZGVkIGhvdmVyOmJnLXJlZC02MDAgZGlzYWJsZWQ6b3BhY2l0eS01MFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2RlbGV0ZUtleXdvcmRNdXRhdGlvbi5pc1BlbmRpbmcgPyB0KCdkZWxldGluZycpIDogdCgnZGVsZXRlJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7ZGVsZXRlS2V5d29yZE11dGF0aW9uLmlzRXJyb3IgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtcmVkLTUwMCBtdC0yXCI+e3QoJ2Vycm9yRGVsZXRpbmdLZXl3b3JkJyl9eyhkZWxldGVLZXl3b3JkTXV0YXRpb24uZXJyb3IgYXMgRXJyb3IpLm1lc3NhZ2V9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICB7LyogUmlnaHQgQ29sdW1uICovfVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctd2hpdGUgcC02IHJvdW5kZWQtbGcgc2hhZG93LW1kXCI+XG4gICAgICAgICAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ0ZXh0LXhsIGZvbnQtYm9sZCBtYi00XCI+e3QoJ3JlY2VudEFjdGl2aXR5Jyl9PC9oMj5cbiAgICAgICAgICAgICAgICAgICAgPHVsIGNsYXNzTmFtZT1cInNwYWNlLXktNFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge2xvZ3M/LnNsaWNlKDAsIDEwKS5tYXAobG9nID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkga2V5PXtsb2cuX2lkfSBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLXN0YXJ0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDbG9ja0ljb24gY2xhc3NOYW1lPVwiaC01IHctNSB0ZXh0LWdyYXktNDAwIG1yLTMgbXQtMVwiLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cImZvbnQtc2VtaWJvbGRcIj57bG9nLmtleXdvcmRJZC5rZXl3b3JkfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1ncmF5LTYwMCB0cnVuY2F0ZVwiPntsb2cubWVzc2FnZX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtZ3JheS00MDBcIj57bmV3IERhdGUobG9nLnRpbWVzdGFtcCkudG9Mb2NhbGVTdHJpbmcoKX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKTtcbn1cblxuZXhwb3J0IGNvbnN0IGdldFN0YXRpY1Byb3BzOiBHZXRTdGF0aWNQcm9wcyA9IGFzeW5jICh7IGxvY2FsZSB9KSA9PiB7XG4gIGNvbnNvbGUubG9nKCdEYXNoYm9hcmQgZ2V0U3RhdGljUHJvcHM6IFJlY2VpdmVkIGxvY2FsZScsIGxvY2FsZSk7XG4gIGNvbnN0IHRyYW5zbGF0aW9ucyA9IGF3YWl0IHNlcnZlclNpZGVUcmFuc2xhdGlvbnMobG9jYWxlID8/ICdlbicsIFsnY29tbW9uJ10pOyAvLyBQYXNzIHRoZSBpMThuIGNvbmZpZ1xuICBjb25zb2xlLmxvZygnRGFzaGJvYXJkIGdldFN0YXRpY1Byb3BzOiBMb2FkZWQgdHJhbnNsYXRpb25zIGZvciBsb2NhbGUnLCBsb2NhbGUgPz8gJ2VuJywgdHJhbnNsYXRpb25zKTtcbiAgcmV0dXJuIHtcbiAgICBwcm9wczoge1xuICAgICAgLi4udHJhbnNsYXRpb25zLFxuICAgIH0sXG4gIH07XG59O1xuIl0sIm5hbWVzIjpbInVzZVN0YXRlIiwidXNlTWVtbyIsInVzZVF1ZXJ5IiwidXNlTXV0YXRpb24iLCJ1c2VRdWVyeUNsaWVudCIsImF4aW9zIiwidXNlVHJhbnNsYXRpb24iLCJzZXJ2ZXJTaWRlVHJhbnNsYXRpb25zIiwidXNlUm91dGVyIiwiQmFyQ2hhcnQiLCJCYXIiLCJYQXhpcyIsIllBeGlzIiwiQ2FydGVzaWFuR3JpZCIsIlRvb2x0aXAiLCJMZWdlbmQiLCJSZXNwb25zaXZlQ29udGFpbmVyIiwiSW5mb3JtYXRpb25DaXJjbGVJY29uIiwiQ2hhcnRCYXJJY29uIiwiQ2xvY2tJY29uIiwiS2V5SWNvbiIsImFwaUNsaWVudCIsImNyZWF0ZSIsImJhc2VVUkwiLCJwcm9jZXNzIiwiZW52IiwiTkVYVF9QVUJMSUNfQVBJX1VSTCIsIlN0YXRDYXJkIiwidGl0bGUiLCJ2YWx1ZSIsImljb24iLCJkaXYiLCJjbGFzc05hbWUiLCJoMyIsInAiLCJEYXNoYm9hcmQiLCJ0Iiwicm91dGVyIiwibG9jYWxlIiwibmV3S2V5d29yZCIsInNldE5ld0tleXdvcmQiLCJxdWVyeUNsaWVudCIsImNoYW5nZUxhbmd1YWdlIiwibG5nIiwicHVzaCIsInBhdGhuYW1lIiwiYXNQYXRoIiwiZGF0YSIsImtleXdvcmRzIiwiaXNMb2FkaW5nIiwiaXNMb2FkaW5nS2V5d29yZHMiLCJxdWVyeUtleSIsInF1ZXJ5Rm4iLCJyZXNwb25zZSIsImdldCIsImxvZ3MiLCJpc0xvYWRpbmdMb2dzIiwiY2hhbm5lbHMiLCJpc0xvYWRpbmdDaGFubmVscyIsImFkZEtleXdvcmRNdXRhdGlvbiIsIm11dGF0aW9uRm4iLCJrZXl3b3JkIiwicG9zdCIsIm9uU3VjY2VzcyIsImludmFsaWRhdGVRdWVyaWVzIiwiZGVsZXRlS2V5d29yZE11dGF0aW9uIiwiaWQiLCJkZWxldGUiLCJoYW5kbGVBZGRLZXl3b3JkIiwiZSIsInByZXZlbnREZWZhdWx0IiwidHJpbSIsIm11dGF0ZSIsImZvcndhcmRlZFRvZGF5IiwiY2hhcnREYXRhIiwidG9kYXkiLCJEYXRlIiwic2V0SG91cnMiLCJmaWx0ZXIiLCJsb2ciLCJ0aW1lc3RhbXAiLCJsZW5ndGgiLCJsYXN0N0RheXMiLCJBcnJheSIsImZyb20iLCJfIiwiaSIsImQiLCJzZXREYXRlIiwiZ2V0RGF0ZSIsInRvSVNPU3RyaW5nIiwic3BsaXQiLCJyZXZlcnNlIiwibWFwIiwiZGF0ZSIsImNvdW50Iiwic3RhcnRzV2l0aCIsImFjdGl2ZUNoYW5uZWxzIiwiYyIsImlzQWN0aXZlIiwiaDEiLCJidXR0b24iLCJvbkNsaWNrIiwiZGlzYWJsZWQiLCJoMiIsIndpZHRoIiwiaGVpZ2h0Iiwic3Ryb2tlRGFzaGFycmF5IiwiZGF0YUtleSIsImZpbGwiLCJuYW1lIiwiZm9ybSIsIm9uU3VibWl0IiwiaW5wdXQiLCJ0eXBlIiwib25DaGFuZ2UiLCJ0YXJnZXQiLCJwbGFjZWhvbGRlciIsImlzUGVuZGluZyIsImlzRXJyb3IiLCJlcnJvciIsIm1lc3NhZ2UiLCJzcGFuIiwiY2FzZVNlbnNpdGl2ZSIsImV4YWN0TWF0Y2giLCJjcmVhdGVkQXQiLCJ0b0xvY2FsZURhdGVTdHJpbmciLCJfaWQiLCJ1bCIsInNsaWNlIiwibGkiLCJrZXl3b3JkSWQiLCJ0b0xvY2FsZVN0cmluZyIsImdldFN0YXRpY1Byb3BzIiwiY29uc29sZSIsInRyYW5zbGF0aW9ucyIsInByb3BzIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(pages-dir-node)/./pages/dashboard.tsx\n");

/***/ }),

/***/ "(pages-dir-node)/./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "(pages-dir-node)/__barrel_optimize__?names=Bar,BarChart,CartesianGrid,Legend,ResponsiveContainer,Tooltip,XAxis,YAxis!=!./node_modules/recharts/lib/index.js":
/*!**************************************************************************************************************************************************!*\
  !*** __barrel_optimize__?names=Bar,BarChart,CartesianGrid,Legend,ResponsiveContainer,Tooltip,XAxis,YAxis!=!./node_modules/recharts/lib/index.js ***!
  \**************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var E_WORK_telegram_forwarder_bot_frontend_node_modules_recharts_lib_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/recharts/lib/index.js */ "(pages-dir-node)/./node_modules/recharts/lib/index.js");
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in E_WORK_telegram_forwarder_bot_frontend_node_modules_recharts_lib_index_js__WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== "default") __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => E_WORK_telegram_forwarder_bot_frontend_node_modules_recharts_lib_index_js__WEBPACK_IMPORTED_MODULE_0__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);


/***/ }),

/***/ "(pages-dir-node)/__barrel_optimize__?names=ChartBarIcon,ClockIcon,InformationCircleIcon,KeyIcon!=!./node_modules/@heroicons/react/24/outline/esm/index.js":
/*!************************************************************************************************************************************************!*\
  !*** __barrel_optimize__?names=ChartBarIcon,ClockIcon,InformationCircleIcon,KeyIcon!=!./node_modules/@heroicons/react/24/outline/esm/index.js ***!
  \************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   ChartBarIcon: () => (/* reexport safe */ _ChartBarIcon_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"]),\n/* harmony export */   ClockIcon: () => (/* reexport safe */ _ClockIcon_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"]),\n/* harmony export */   InformationCircleIcon: () => (/* reexport safe */ _InformationCircleIcon_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"]),\n/* harmony export */   KeyIcon: () => (/* reexport safe */ _KeyIcon_js__WEBPACK_IMPORTED_MODULE_3__[\"default\"])\n/* harmony export */ });\n/* harmony import */ var _ChartBarIcon_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ChartBarIcon.js */ \"(pages-dir-node)/./node_modules/@heroicons/react/24/outline/esm/ChartBarIcon.js\");\n/* harmony import */ var _ClockIcon_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ClockIcon.js */ \"(pages-dir-node)/./node_modules/@heroicons/react/24/outline/esm/ClockIcon.js\");\n/* harmony import */ var _InformationCircleIcon_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./InformationCircleIcon.js */ \"(pages-dir-node)/./node_modules/@heroicons/react/24/outline/esm/InformationCircleIcon.js\");\n/* harmony import */ var _KeyIcon_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./KeyIcon.js */ \"(pages-dir-node)/./node_modules/@heroicons/react/24/outline/esm/KeyIcon.js\");\n\n\n\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS9fX2JhcnJlbF9vcHRpbWl6ZV9fP25hbWVzPUNoYXJ0QmFySWNvbixDbG9ja0ljb24sSW5mb3JtYXRpb25DaXJjbGVJY29uLEtleUljb24hPSEuL25vZGVfbW9kdWxlcy9AaGVyb2ljb25zL3JlYWN0LzI0L291dGxpbmUvZXNtL2luZGV4LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUMyRDtBQUNOO0FBQ3dCIiwic291cmNlcyI6WyJFOlxcV09SS1xcdGVsZWdyYW0tZm9yd2FyZGVyLWJvdFxcZnJvbnRlbmRcXG5vZGVfbW9kdWxlc1xcQGhlcm9pY29uc1xccmVhY3RcXDI0XFxvdXRsaW5lXFxlc21cXGluZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlxuZXhwb3J0IHsgZGVmYXVsdCBhcyBDaGFydEJhckljb24gfSBmcm9tIFwiLi9DaGFydEJhckljb24uanNcIlxuZXhwb3J0IHsgZGVmYXVsdCBhcyBDbG9ja0ljb24gfSBmcm9tIFwiLi9DbG9ja0ljb24uanNcIlxuZXhwb3J0IHsgZGVmYXVsdCBhcyBJbmZvcm1hdGlvbkNpcmNsZUljb24gfSBmcm9tIFwiLi9JbmZvcm1hdGlvbkNpcmNsZUljb24uanNcIlxuZXhwb3J0IHsgZGVmYXVsdCBhcyBLZXlJY29uIH0gZnJvbSBcIi4vS2V5SWNvbi5qc1wiIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6WzBdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(pages-dir-node)/__barrel_optimize__?names=ChartBarIcon,ClockIcon,InformationCircleIcon,KeyIcon!=!./node_modules/@heroicons/react/24/outline/esm/index.js\n");

/***/ }),

/***/ "../../../shared/lib/no-fallback-error.external":
/*!*********************************************************************!*\
  !*** external "next/dist/shared/lib/no-fallback-error.external.js" ***!
  \*********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/no-fallback-error.external.js");

/***/ }),

/***/ "@tanstack/react-query":
/*!****************************************!*\
  !*** external "@tanstack/react-query" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@tanstack/react-query");;

/***/ }),

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = import("axios");;

/***/ }),

/***/ "clsx":
/*!***********************!*\
  !*** external "clsx" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("clsx");

/***/ }),

/***/ "eventemitter3":
/*!********************************!*\
  !*** external "eventemitter3" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("eventemitter3");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "lodash/every":
/*!*******************************!*\
  !*** external "lodash/every" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/every");

/***/ }),

/***/ "lodash/find":
/*!******************************!*\
  !*** external "lodash/find" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/find");

/***/ }),

/***/ "lodash/first":
/*!*******************************!*\
  !*** external "lodash/first" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/first");

/***/ }),

/***/ "lodash/flatMap":
/*!*********************************!*\
  !*** external "lodash/flatMap" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/flatMap");

/***/ }),

/***/ "lodash/get":
/*!*****************************!*\
  !*** external "lodash/get" ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/get");

/***/ }),

/***/ "lodash/isBoolean":
/*!***********************************!*\
  !*** external "lodash/isBoolean" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/isBoolean");

/***/ }),

/***/ "lodash/isEqual":
/*!*********************************!*\
  !*** external "lodash/isEqual" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/isEqual");

/***/ }),

/***/ "lodash/isFunction":
/*!************************************!*\
  !*** external "lodash/isFunction" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/isFunction");

/***/ }),

/***/ "lodash/isNaN":
/*!*******************************!*\
  !*** external "lodash/isNaN" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/isNaN");

/***/ }),

/***/ "lodash/isNil":
/*!*******************************!*\
  !*** external "lodash/isNil" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/isNil");

/***/ }),

/***/ "lodash/isNumber":
/*!**********************************!*\
  !*** external "lodash/isNumber" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/isNumber");

/***/ }),

/***/ "lodash/isObject":
/*!**********************************!*\
  !*** external "lodash/isObject" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/isObject");

/***/ }),

/***/ "lodash/isPlainObject":
/*!***************************************!*\
  !*** external "lodash/isPlainObject" ***!
  \***************************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/isPlainObject");

/***/ }),

/***/ "lodash/isString":
/*!**********************************!*\
  !*** external "lodash/isString" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/isString");

/***/ }),

/***/ "lodash/last":
/*!******************************!*\
  !*** external "lodash/last" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/last");

/***/ }),

/***/ "lodash/mapValues":
/*!***********************************!*\
  !*** external "lodash/mapValues" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/mapValues");

/***/ }),

/***/ "lodash/max":
/*!*****************************!*\
  !*** external "lodash/max" ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/max");

/***/ }),

/***/ "lodash/maxBy":
/*!*******************************!*\
  !*** external "lodash/maxBy" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/maxBy");

/***/ }),

/***/ "lodash/memoize":
/*!*********************************!*\
  !*** external "lodash/memoize" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/memoize");

/***/ }),

/***/ "lodash/min":
/*!*****************************!*\
  !*** external "lodash/min" ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/min");

/***/ }),

/***/ "lodash/minBy":
/*!*******************************!*\
  !*** external "lodash/minBy" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/minBy");

/***/ }),

/***/ "lodash/omit":
/*!******************************!*\
  !*** external "lodash/omit" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/omit");

/***/ }),

/***/ "lodash/range":
/*!*******************************!*\
  !*** external "lodash/range" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/range");

/***/ }),

/***/ "lodash/some":
/*!******************************!*\
  !*** external "lodash/some" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/some");

/***/ }),

/***/ "lodash/sortBy":
/*!********************************!*\
  !*** external "lodash/sortBy" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/sortBy");

/***/ }),

/***/ "lodash/sumBy":
/*!*******************************!*\
  !*** external "lodash/sumBy" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/sumBy");

/***/ }),

/***/ "lodash/throttle":
/*!**********************************!*\
  !*** external "lodash/throttle" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/throttle");

/***/ }),

/***/ "lodash/uniqBy":
/*!********************************!*\
  !*** external "lodash/uniqBy" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/uniqBy");

/***/ }),

/***/ "lodash/upperFirst":
/*!************************************!*\
  !*** external "lodash/upperFirst" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("lodash/upperFirst");

/***/ }),

/***/ "next-i18next":
/*!*******************************!*\
  !*** external "next-i18next" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("next-i18next");

/***/ }),

/***/ "next-i18next/serverSideTranslations":
/*!******************************************************!*\
  !*** external "next-i18next/serverSideTranslations" ***!
  \******************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next-i18next/serverSideTranslations");

/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ "react-i18next":
/*!********************************!*\
  !*** external "react-i18next" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = import("react-i18next");;

/***/ }),

/***/ "react-smooth":
/*!*******************************!*\
  !*** external "react-smooth" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-smooth");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ }),

/***/ "recharts-scale":
/*!*********************************!*\
  !*** external "recharts-scale" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("recharts-scale");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "tiny-invariant":
/*!*********************************!*\
  !*** external "tiny-invariant" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("tiny-invariant");

/***/ }),

/***/ "victory-vendor/d3-scale":
/*!******************************************!*\
  !*** external "victory-vendor/d3-scale" ***!
  \******************************************/
/***/ ((module) => {

"use strict";
module.exports = require("victory-vendor/d3-scale");

/***/ }),

/***/ "victory-vendor/d3-shape":
/*!******************************************!*\
  !*** external "victory-vendor/d3-shape" ***!
  \******************************************/
/***/ ((module) => {

"use strict";
module.exports = require("victory-vendor/d3-shape");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/recharts","vendor-chunks/@heroicons"], () => (__webpack_exec__("(pages-dir-node)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES&page=%2Fdashboard&preferredRegion=&absolutePagePath=.%2Fpages%5Cdashboard.tsx&absoluteAppPath=private-next-pages%2F_app&absoluteDocumentPath=private-next-pages%2F_document&middlewareConfigBase64=e30%3D!")));
module.exports = __webpack_exports__;

})();