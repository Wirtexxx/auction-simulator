import { throwifyFpFn as g } from "@tma.js/toolkit";
import { either as s, function as G } from "fp-ts";
import { pipe as u, string as e, check as y, transform as c, union as S, instance as P, parse as b, looseObject as m, optional as n, number as _, boolean as d, integer as W, date as C, record as F, is as T, unknown as J } from "valibot";
function N(t) {
  const r = (a) => {
    const o = {};
    return new URLSearchParams(a).forEach((i, f) => {
      const h = o[f];
      Array.isArray(h) ? h.push(i) : h === void 0 ? o[f] = i : o[f] = [h, i];
    }), b(t, o);
  };
  return u(
    S([e(), P(URLSearchParams)]),
    y((a) => {
      try {
        return r(a), !0;
      } catch {
        return !1;
      }
    }, "The value doesn't match required schema"),
    c(r)
  );
}
function O(t) {
  return u(
    e(),
    y((r) => {
      try {
        return JSON.parse(r), !0;
      } catch {
        return !1;
      }
    }, "Input is not a valid JSON value"),
    c(JSON.parse),
    t
  );
}
function p(t) {
  return u(e(), O(t));
}
function B(t) {
  return u(
    S([e(), P(URLSearchParams)]),
    N(t)
  );
}
function l(t) {
  return (r) => t.test(r);
}
const I = l(/^#[\da-f]{3}$/i), U = l(/^#[\da-f]{4}$/i), z = l(/^#[\da-f]{6}$/i), E = l(/^#[\da-f]{8}$/i);
function V(t) {
  return [z, E, I, U].some((r) => r(t));
}
function A(t) {
  let r = "#";
  for (let a = 0; a < t.length - 1; a += 1)
    r += t[1 + a].repeat(2);
  return r;
}
function D(t) {
  const r = t.replace(/\s/g, "").toLowerCase();
  if (/^#[\da-f]{3}$/i.test(r))
    return s.right(A(r.toLowerCase() + "f"));
  if (/^#[\da-f]{4}$/i.test(r))
    return s.right(A(r.toLowerCase()));
  if (/^#[\da-f]{6}$/i.test(r))
    return s.right(r.toLowerCase() + "ff");
  if (/^#[\da-f]{8}$/i.test(r))
    return s.right(r.toLowerCase());
  const a = r.match(/^rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/) || r.match(/^rgba\((\d{1,3}),(\d{1,3}),(\d{1,3}),(\d{1,3})\)$/);
  return a ? s.right(
    a.slice(1).reduce(
      (o, i) => o + parseInt(i, 10).toString(16).padStart(2, "0"),
      "#"
    ).padEnd(9, "f")
  ) : s.left(new Error(`Value "${t}" does not satisfy any of known RGB formats.`));
}
function q(t) {
  return G.pipe(
    D(t),
    s.map((r) => r.slice(0, 7))
  );
}
const v = g(q), tt = g(D);
function x() {
  return m({
    id: _(),
    photo_url: n(e()),
    type: e(),
    title: e(),
    username: n(e())
  });
}
function w() {
  return m({
    added_to_attachment_menu: n(d()),
    allows_write_to_pm: n(d()),
    first_name: e(),
    id: _(),
    is_bot: n(d()),
    is_premium: n(d()),
    last_name: n(e()),
    language_code: n(e()),
    photo_url: n(e()),
    username: n(e())
  });
}
function j() {
  return m({
    auth_date: u(
      e(),
      c((t) => new Date(Number(t) * 1e3)),
      C()
    ),
    can_send_after: n(u(e(), c(Number), W())),
    chat: n(p(x())),
    chat_type: n(e()),
    chat_instance: n(e()),
    hash: e(),
    query_id: n(e()),
    receiver: n(p(w())),
    start_param: n(e()),
    signature: e(),
    user: n(p(w()))
  });
}
function L() {
  return B(j());
}
function R() {
  return F(
    e(),
    u(
      S([e(), _()]),
      c((t) => typeof t == "number" ? `#${(t & 16777215).toString(16).padStart(6, "0")}` : t),
      y(V)
    )
  );
}
function M() {
  const t = n(u(e(), c((r) => r === "1")));
  return m({
    tgWebAppBotInline: t,
    tgWebAppData: n(L()),
    tgWebAppDefaultColors: n(p(R())),
    tgWebAppFullscreen: t,
    tgWebAppPlatform: e(),
    tgWebAppShowSettings: t,
    tgWebAppStartParam: n(e()),
    tgWebAppThemeParams: p(R()),
    tgWebAppVersion: e()
  });
}
function Q() {
  return B(M());
}
function rt(t) {
  try {
    return T(Q(), t);
  } catch {
    return !1;
  }
}
function et() {
  return m({
    eventType: e(),
    eventData: n(J())
  });
}
function H(t) {
  return s.tryCatch(
    () => b(L(), t),
    (r) => r
  );
}
function K(t) {
  return s.tryCatch(
    () => b(Q(), t),
    (r) => r
  );
}
const nt = g(H), at = g(K);
function $(t, r) {
  return r || (r = (a, o) => JSON.stringify(o)), new URLSearchParams(
    Object.entries(t).reduce((a, [o, i]) => (Array.isArray(i) ? a.push(...i.map((f) => [o, String(f)])) : i != null && a.push([
      o,
      i instanceof Date ? (i.getTime() / 1e3 | 0).toString() : typeof i == "string" || typeof i == "number" ? String(i) : typeof i == "boolean" ? i ? "1" : "0" : r(o, i)
    ]), a), [])
  ).toString();
}
function X(t) {
  return $(t);
}
function it(t) {
  return $(t, (r, a) => r === "tgWebAppData" ? X(a) : JSON.stringify(a));
}
export {
  j as initData,
  x as initDataChat,
  L as initDataQuery,
  w as initDataUser,
  V as isAnyRGB,
  rt as isLaunchParamsQuery,
  z as isRGB,
  E as isRGBA,
  U as isRGBAShort,
  I as isRGBShort,
  M as launchParams,
  Q as launchParamsQuery,
  et as miniAppsMessage,
  nt as parseInitDataQuery,
  H as parseInitDataQueryFp,
  at as parseLaunchParamsQuery,
  K as parseLaunchParamsQueryFp,
  p as pipeJsonToSchema,
  B as pipeQueryToSchema,
  X as serializeInitDataQuery,
  it as serializeLaunchParamsQuery,
  R as themeParams,
  v as toRGB,
  q as toRGBFp,
  tt as toRGBFull,
  D as toRGBFullFp
};
//# sourceMappingURL=index.js.map
