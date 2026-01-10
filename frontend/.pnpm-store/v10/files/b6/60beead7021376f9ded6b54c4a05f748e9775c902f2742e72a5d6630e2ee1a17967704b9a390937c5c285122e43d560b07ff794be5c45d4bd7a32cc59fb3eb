var $ = Object.defineProperty;
var q = (r, e, t) => e in r ? $(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var w = (r, e, t) => q(r, typeof e != "symbol" ? e + "" : e, t);
var D = Object.defineProperty, G = (r, e, t) => e in r ? D(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t, E = (r, e, t) => G(r, typeof e != "symbol" ? e + "" : e, t);
function I(r) {
  return (e) => e instanceof r;
}
function L(r, e) {
  const t = class extends Error {
    constructor(...d) {
      const l = typeof e == "function" ? e(...d) : typeof e == "string" ? [e] : e || [];
      super(...l), this.name = r;
    }
  };
  E(t, "is", I(t));
  let c = t;
  return Object.defineProperty(c, "name", { value: r }), c;
}
function H(r, e, t) {
  const c = class extends L(r, t) {
    constructor(...l) {
      super(...l), E(this, "data"), this.data = e(...l);
    }
  };
  E(c, "is", I(c));
  let o = c;
  return Object.defineProperty(o, "name", { value: r }), o;
}
class J extends L("CancelledError", "Promise was canceled") {
}
class K extends H(
  "TimeoutError",
  (e) => ({ timeout: e }),
  (e, t) => [`Timeout reached: ${e}ms`, { cause: t }]
) {
}
const S = Symbol("resolved");
function V(r) {
  return typeof r == "object" && !!r && "tag" in r && r.tag === S;
}
function M(r) {
  return { tag: S, value: r };
}
function C(r, e) {
  return r.reject = e.reject, r.resolve = e.resolve, r;
}
class g extends Promise {
  constructor(t, c) {
    let o, d, l, p;
    typeof t == "function" ? (l = t, p = c || {}) : p = t || {};
    let u, a;
    const x = () => !!a, O = () => !!u;
    let f = {};
    const b = [], T = () => {
      b.forEach((m) => m()), b.splice(0, b.length), f = {};
    }, y = new AbortController(), k = () => O() || x();
    super((m, F) => {
      const { abortOnResolve: P = !0, abortOnReject: A = !0 } = p;
      d = (n) => {
        var h, s;
        k() || (m(n), u = [n], (h = f.resolved) == null || h.forEach((i) => i(n)), (s = f.finalized) == null || s.forEach((i) => i({ kind: "resolved", result: n })), T(), P && y.abort(M(n)));
      }, o = (n) => {
        var h, s;
        k() || (F(n), a = [n], (h = f.rejected) == null || h.forEach((i) => i(n)), (s = f.finalized) == null || s.forEach((i) => i({ kind: "rejected", reason: n })), T(), A && y.abort(n));
      };
      const { abortSignal: j } = p;
      if (j) {
        if (j.aborted)
          return o(j.reason);
        const n = () => {
          o(j.reason);
        };
        j.addEventListener("abort", n, !0), b.push(() => {
          j.removeEventListener("abort", n, !0);
        });
      }
      const { timeout: R } = p;
      if (R) {
        const n = setTimeout(() => {
          o(new K(R));
        }, R);
        b.push(() => {
          clearTimeout(n);
        });
      }
      try {
        const n = () => {
        }, h = l && l(d, o, {
          abortSignal: y.signal,
          get isRejected() {
            return x();
          },
          get isResolved() {
            return O();
          },
          on(s, i) {
            if (u || a) {
              if (s === "finalized") {
                const v = u ? { kind: "resolved", result: u[0] } : { kind: "rejected", reason: a[0] };
                i(v);
              } else s === "resolved" && u ? i(u[0]) : s === "rejected" && a && i(a[0]);
              return n;
            }
            return f[s] || (f[s] = []), f[s].push(i), () => {
              const v = f[s] || [], z = v.indexOf(i);
              z >= 0 && v.splice(z, 1);
            };
          },
          get result() {
            return u == null ? void 0 : u[0];
          },
          get rejectReason() {
            return a == null ? void 0 : a[0];
          },
          throwIfRejected() {
            if (a)
              throw a[0];
          }
        });
        h instanceof Promise && h.catch(o);
      } catch (n) {
        o(n);
      }
    });
    /**
     * Rejects the initially created promise.
     *
     * This method not only aborts the signal passed to the executor, but also rejects the
     * promise itself calling all chained listeners.
     *
     * The reason passed to the method is being passed as-is to the executor's context.
     */
    w(this, "reject");
    /**
     * Resolves the promise.
     */
    w(this, "resolve");
    this.reject = o, this.resolve = d;
  }
  static fn(t, c) {
    return new g(async (o, d, l) => {
      try {
        o(await t(l));
      } catch (p) {
        d(p);
      }
    }, c);
  }
  static resolve(t) {
    return this.fn(() => t);
  }
  /**
   * @see Promise.reject
   */
  static reject(t) {
    return new g((c, o) => {
      o(t);
    });
  }
  /**
   * Rejects the promise with the `CancelledError` error.
   */
  cancel() {
    this.reject(new J());
  }
  /**
   * @see Promise.catch
   */
  catch(t) {
    return this.then(void 0, t);
  }
  /**
   * @see Promise.finally
   */
  finally(t) {
    return C(super.finally(t), this);
  }
  /**
   * @see Promise.then
   */
  then(t, c) {
    return C(
      super.then(t, c),
      this
    );
  }
}
export {
  g as BetterPromise,
  J as CancelledError,
  K as TimeoutError,
  V as isResolved,
  M as withResolved
};
//# sourceMappingURL=index.js.map
