var l = Object.defineProperty;
var o = (e, t, n) => t in e ? l(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var c = (e, t, n) => o(e, typeof t != "symbol" ? t + "" : t, n);
function f(e) {
  return (t) => t instanceof e;
}
function u(e, t) {
  const s = class s extends Error {
    constructor(...d) {
      const i = typeof t == "function" ? t(...d) : typeof t == "string" ? [t] : t || [];
      super(...i), this.name = e;
    }
  };
  c(s, "is", f(s));
  let n = s;
  return Object.defineProperty(n, "name", { value: e }), n;
}
function y(e, t, n) {
  const a = class a extends u(e, n) {
    constructor(...r) {
      super(...r);
      c(this, "data");
      this.data = t(...r);
    }
  };
  c(a, "is", f(a));
  let s = a;
  return Object.defineProperty(s, "name", { value: e }), s;
}
export {
  u as errorClass,
  y as errorClassWithData
};
//# sourceMappingURL=index.js.map
