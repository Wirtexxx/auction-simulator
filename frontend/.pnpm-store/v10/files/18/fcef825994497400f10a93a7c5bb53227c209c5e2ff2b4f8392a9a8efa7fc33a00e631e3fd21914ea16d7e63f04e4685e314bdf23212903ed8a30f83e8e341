import { BetterPromise as d } from "better-promises";
import { function as f, taskEither as i, either as u } from "fp-ts";
function L(t) {
  return t.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
}
function $(t) {
  return t.replace(/[A-Z]/g, (e) => `_${e.toLowerCase()}`);
}
function x(t) {
  return Object.entries(t).reduce((e, [o, r]) => (e[$(o)] = r, e), {});
}
function k(t) {
  return t.replace(/_[a-z]/g, (e) => e[1].toUpperCase());
}
function S(t) {
  return Object.entries(t).reduce((e, [o, r]) => (e[k(o)] = r, e), {});
}
function m(t) {
  const e = S(t);
  for (const o in e) {
    const r = e[o];
    r && typeof r == "object" && !(r instanceof Date) && (e[o] = Array.isArray(r) ? r.map(m) : m(r));
  }
  return e;
}
function A(t) {
  return t.replace(/_([a-z])/g, (e, o) => `-${o.toLowerCase()}`);
}
function h(t) {
  return `tapps/${t}`;
}
function K(t, e) {
  sessionStorage.setItem(h(t), JSON.stringify(e));
}
function _(t) {
  const e = sessionStorage.getItem(h(t));
  try {
    return e ? JSON.parse(e) : void 0;
  } catch {
  }
}
function v(...t) {
  const e = t.flat(1);
  return [
    e.push.bind(e),
    () => {
      e.forEach((o) => {
        o();
      });
    }
  ];
}
// @__NO_SIDE_EFFECTS__
function D(t, e) {
  e || (e = {});
  const {
    textColor: o,
    bgColor: r,
    shouldLog: c
  } = e, n = c === void 0 ? !0 : c, b = typeof n == "boolean" ? () => n : n, g = (a, s, ...l) => {
    if (s || b()) {
      const p = "font-weight:bold;padding:0 5px;border-radius:100px", [y, C, w] = {
        log: ["#0089c3", "white", "INFO"],
        error: ["#ff0000F0", "white", "ERR"],
        warn: ["#D38E15", "white", "WARN"]
      }[a];
      console[a](
        `%c${w} ${Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          fractionalSecondDigits: 3,
          timeZone: "UTC"
        }).format(/* @__PURE__ */ new Date())}%c %c${t}`,
        `${p};background-color:${y};color:${C}`,
        "",
        `${p};${o ? `color:${o};` : ""}${r ? `background-color:${r}` : ""}`,
        ...l
      );
    }
  };
  return [
    ["log", "forceLog"],
    ["warn", "forceWarn"],
    ["error", "forceError"]
  ].reduce((a, [s, l]) => (a[s] = g.bind(void 0, s, !1), a[l] = g.bind(void 0, s, !0), a), {});
}
function T(t) {
  const e = (o) => {
    throw o;
  };
  return typeof t == "function" ? d.resolve(f.pipe(t, i.match(e, (o) => o))()) : f.pipe(t, u.match(e, (o) => o));
}
// @__NO_SIDE_EFFECTS__
function F(t) {
  return Object.assign(
    (...e) => T(t(...e)),
    t
  );
}
const O = /* @__PURE__ */ Object.assign(
  (t, e) => f.pipe(
    i.tryCatch(
      () => new d((o, r, c) => t(
        (n) => o(u.right(n)),
        (n) => o(u.left(n)),
        c
      ), e),
      (o) => o
    ),
    i.chainW(u.match(i.left, i.right))
  ),
  {
    fn: (t, e) => O((o, r, c) => {
      const n = t(c);
      f.pipe(
        typeof n == "function" ? n : i.fromEither(n),
        i.matchW(r, o)
      )();
    }, e)
  }
);
export {
  O as BetterTaskEither,
  L as camelToKebab,
  $ as camelToSnake,
  x as camelToSnakeObjKeys,
  v as createCbCollector,
  D as createLogger,
  m as deepSnakeToCamelObjKeys,
  _ as getStorageValue,
  K as setStorageValue,
  k as snakeToCamel,
  S as snakeToCamelObjKeys,
  A as snakeToKebab,
  T as throwifyAnyEither,
  F as throwifyFpFn
};
//# sourceMappingURL=index.js.map
