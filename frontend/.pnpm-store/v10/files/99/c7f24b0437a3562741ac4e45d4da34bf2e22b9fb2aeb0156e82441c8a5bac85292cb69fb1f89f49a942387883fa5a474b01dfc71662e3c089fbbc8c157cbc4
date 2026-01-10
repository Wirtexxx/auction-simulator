import { is as O, looseObject as m, function as Y, nullish as v, boolean as I, number as $, string as E, optional as z, unknown as me, parse as F, any as we } from "valibot";
import { throwifyFpFn as T, getStorageValue as de, setStorageValue as X, createLogger as ge, throwifyAnyEither as A, createCbCollector as Z, BetterTaskEither as ee } from "@tma.js/toolkit";
import { createLogger as yt, deepSnakeToCamelObjKeys as vt } from "@tma.js/toolkit";
import { BetterPromise as te, TimeoutError as be } from "better-promises";
import { CancelledError as Pt, TimeoutError as kt } from "better-promises";
import { function as f, either as c, option as L, taskEither as w, json as he } from "fp-ts";
import { errorClassWithData as ye, errorClass as k } from "error-kid";
import { parseLaunchParamsQueryFp as re, themeParams as ve, pipeJsonToSchema as ne, miniAppsMessage as oe, serializeLaunchParamsQuery as Ee, parseLaunchParamsQuery as Pe } from "@tma.js/transformers";
import { signal as b, computed as ae } from "@tma.js/signals";
import ke from "mitt";
function se(e) {
  return O(
    m({ TelegramWebviewProxy: m({ postEvent: Y() }) }),
    e
  );
}
function ie() {
  try {
    return window.self !== window.top;
  } catch {
    return !0;
  }
}
class xe extends (/* @__PURE__ */ k("MethodUnsupportedError", (t, r) => [
  `Method "${t}" is unsupported in Mini Apps version ${r}`
])) {
}
class Se extends (/* @__PURE__ */ k("MethodParameterUnsupportedError", (t, r, n) => [
  `Parameter "${r}" of "${t}" method is unsupported in Mini Apps version ${n}`
])) {
}
class Te extends (/* @__PURE__ */ ye(
  "LaunchParamsRetrieveError",
  (t) => ({ errors: t }),
  (t) => [
    [
      "Unable to retrieve launch parameters from any known source. Perhaps, you have opened your app outside Telegram?",
      "📖 Refer to docs for more information:",
      "https://docs.telegram-mini-apps.com/packages/tma-js-bridge/environment",
      "",
      "Collected errors:",
      ...t.map(({ source: r, error: n }) => `Source: ${r} / ${n instanceof Error ? n.message : String(n)}`)
    ].join(`
`)
  ]
)) {
}
class Ae extends (/* @__PURE__ */ k("InvalidLaunchParamsError", (t, r) => [
  `Invalid value for launch params: ${t}`,
  { cause: r }
])) {
}
class pe extends (/* @__PURE__ */ k("UnknownEnvError")) {
}
class Ce extends (/* @__PURE__ */ k(
  "InvokeCustomMethodError",
  (t) => [`Server returned error: ${t}`]
)) {
}
const V = "launchParams";
function B(e) {
  return e.replace(/^[^?#]*[?#]/, "").replace(/[?#]/g, "&");
}
function Me() {
  return f.pipe(
    C(),
    c.chainW(re)
  );
}
const tt = T(Me);
function qe() {
  return f.pipe(
    C(),
    c.map((e) => {
      const t = new URLSearchParams(e).get("tgWebAppData");
      return t ? L.some(t) : L.none;
    })
  );
}
function rt() {
  return f.pipe(
    qe(),
    c.fold((e) => {
      throw e;
    }, (e) => e),
    L.match(() => {
    }, (e) => e)
  );
}
function C() {
  const e = [];
  for (const [t, r] of [
    // Try to retrieve launch parameters from the current location. This method
    // can return nothing in case, location was changed, and then the page was
    // reloaded.
    [() => B(window.location.href), "window.location.href"],
    // Then, try using the lower level API - window.performance.
    [() => {
      const n = performance.getEntriesByType("navigation")[0];
      return n && B(n.name);
    }, "performance navigation entries"],
    // Finally, try using the session storage.
    [() => de(V), "local storage"]
  ]) {
    const n = t();
    if (!n) {
      e.push({ source: r, error: new Error("Source is empty") });
      continue;
    }
    const a = f.pipe(
      re(n),
      c.foldW((o) => o, () => !0)
    );
    if (typeof a != "boolean") {
      e.push({ source: r, error: a });
      continue;
    }
    return X(V, n), c.right(n);
  }
  return c.left(new Te(e));
}
const nt = T(C);
function We(e, t) {
  const r = /* @__PURE__ */ new Map(), n = ke(), a = (o, s, p = !1) => {
    const _ = r.get(o) || /* @__PURE__ */ new Map();
    r.set(o, _);
    const i = _.get(s) || [];
    _.set(s, i);
    const u = i.findIndex((l) => l[1] === p);
    if (u >= 0 && (n.off(o, i[u][0]), i.splice(u, 1), !i.length && (_.delete(s), !_.size))) {
      const l = r.size;
      r.delete(o), l && !r.size && t();
    }
  };
  return {
    on(o, s, p) {
      !r.size && e();
      const _ = () => {
        a(o, s, p);
      }, i = (...d) => {
        p && _(), o === "*" ? s({ name: d[0], payload: d[1] }) : s(...d);
      };
      n.on(o, i);
      const u = r.get(o) || /* @__PURE__ */ new Map();
      r.set(o, u);
      const l = u.get(s) || [];
      return u.set(s, l), l.push([i, p || !1]), _;
    },
    off: a,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    emit: n.emit,
    clear() {
      const o = r.size;
      n.all.clear(), r.clear(), o && t();
    }
  };
}
function q(e, t) {
  window.dispatchEvent(new MessageEvent("message", {
    data: JSON.stringify({ eventType: e, eventData: t }),
    // We specify this kind of source here in order to allow the package's "on" function to
    // capture it. The reason is this function always checks the event source and relies on
    // it to be the parent window.
    source: window.parent
  }));
}
const S = b(!1), R = b("https://web.telegram.org"), Fe = (e) => {
  g().log("Event received:", e);
}, ce = ae(S);
function ot(e) {
  e !== S() && (S.set(e), (e ? j : Oe)("*", Fe));
}
const _e = ae(R);
function at(e) {
  R.set(e), g().log("New target origin set", e);
}
const P = b((...e) => {
  window.parent.postMessage(...e);
}), g = b(ge("Bridge", {
  bgColor: "#9147ff",
  textColor: "white",
  shouldLog: ce
}));
function st() {
  je(), [P, R, _e, S, ce, g].forEach((e) => {
    e.unsubAll(), "reset" in e && e.reset();
  });
}
function W(e, t, r) {
  const n = [r], a = e[t];
  typeof a == "function" && n.push(a);
  const o = (...p) => {
    n.forEach((_) => _(...p));
  }, s = Object.assign((...p) => {
    o(...p);
  }, {
    // Unwraps the composer.
    unwrap() {
      const { length: p } = n;
      if (p === 1) {
        delete e[t];
        return;
      }
      if (p === 2) {
        D(e, t, n[1]);
        return;
      }
      n.unshift(1), D(e, t, o);
    }
  });
  ue(
    e,
    t,
    () => s,
    (p) => n.push(p)
  );
}
function G(e, t) {
  const r = e[t];
  ue(e, t, () => r, (n) => {
    Object.entries(n).forEach(([a, o]) => {
      r[a] = o;
    });
  });
}
function ue(e, t, r, n) {
  Object.defineProperty(e, t, {
    enumerable: !0,
    configurable: !0,
    get: r,
    set: n
  });
}
function D(e, t, r) {
  Object.defineProperty(e, t, {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: r
  });
}
const Le = {
  clipboard_text_received: m({
    req_id: E(),
    data: v(E())
  }),
  custom_method_invoked: m({
    req_id: E(),
    result: z(me()),
    error: z(E())
  }),
  popup_closed: v(
    m({ button_id: v(E(), () => {
    }) }),
    {}
  ),
  viewport_changed: v(
    m({
      height: $(),
      width: v($(), () => window.innerWidth),
      is_state_stable: I(),
      is_expanded: I()
    }),
    // TODO: At the moment, macOS has a bug with the invalid event payload - it is always equal to
    //  null. Leaving this default value until the bug is fixed.
    () => ({
      height: window.innerHeight,
      is_state_stable: !0,
      is_expanded: !0
    })
  ),
  theme_changed: m({
    theme_params: ve()
  })
};
function J(e) {
  if (e.source !== window.parent)
    return;
  let t;
  try {
    t = F(ne(oe()), e.data);
  } catch {
    return;
  }
  const { eventType: r, eventData: n } = t, a = Le[r];
  let o;
  try {
    o = a ? F(a, n) : n;
  } catch (s) {
    return g().forceError(
      [
        `An error occurred processing the "${r}" event from the Telegram application.`,
        "Please, file an issue here:",
        "https://github.com/Telegram-Mini-Apps/tma.js/issues/new/choose"
      ].join(`
`),
      t,
      s
    );
  }
  Re(r, o);
}
const {
  on: j,
  off: Oe,
  emit: Re,
  clear: je
} = We(
  () => {
    const e = window;
    !e.TelegramGameProxy && (e.TelegramGameProxy = {}), W(e.TelegramGameProxy, "receiveEvent", q), G(e, "TelegramGameProxy"), !e.Telegram && (e.Telegram = {}), !e.Telegram.WebView && (e.Telegram.WebView = {}), W(e.Telegram.WebView, "receiveEvent", q), G(e.Telegram, "WebView"), W(e, "TelegramGameProxy_receiveEvent", q), window.addEventListener("message", J);
  },
  () => {
    [
      ["TelegramGameProxy_receiveEvent"],
      ["TelegramGameProxy", "receiveEvent"],
      ["Telegram", "WebView", "receiveEvent"]
    ].forEach((e) => {
      const t = window;
      let r = [void 0, t];
      for (const o of e)
        if (r = [r[1], r[1][o]], !r[1])
          return;
      const [n, a] = r;
      "unwrap" in a && (a.unwrap(), n && n !== t && !Object.keys(n).length && delete t[e[0]]);
    }), window.removeEventListener("message", J);
  }
), Ue = (...e) => P()(...e);
function Ie(e, t) {
  f.pipe(
    x(
      // @ts-expect-error It's ok, TS can't determine a specific override.
      e,
      t
    ),
    c.mapLeft((r) => {
      throw r;
    })
  );
}
function x(e, t) {
  g().log("Posting event:", t ? { eventType: e, eventData: t } : { eventType: e });
  const r = window, n = JSON.stringify({ eventType: e, eventData: t });
  return ie() ? (Ue(n, _e()), c.right(void 0)) : se(r) ? (r.TelegramWebviewProxy.postEvent(e, JSON.stringify(t)), c.right(void 0)) : O(m({ external: m({ notify: Y() }) }), r) ? (r.external.notify(n), c.right(void 0)) : c.left(new pe());
}
function U(e, t, r = {}) {
  const {
    // If no capture function was passed, we capture the first compatible event.
    capture: n = () => !0,
    postEvent: a = x
  } = r, o = b(), [s, p] = Z();
  (Array.isArray(t) ? t : [t]).forEach((i) => {
    s(
      j(i, (u) => {
        const l = Array.isArray(t);
        n(l ? { event: i, payload: u } : u) && o.set([
          l ? { event: i, payload: u } : u
        ]);
      })
    );
  });
  const _ = (i) => (p(), i);
  return f.pipe(
    async () => a(e, r.params),
    w.chainW(() => ee((i, u, l) => {
      const d = o();
      if (d)
        return i(d[0]);
      const h = (y) => {
        y && i(y[0]);
      }, M = () => {
        o.unsub(h);
      };
      o.sub(h), l.on("finalized", M);
    }, r)),
    w.mapBoth(_, _)
  );
}
function it(e, t, r) {
  const { postEvent: n } = r || {};
  return A(
    // @ts-expect-error TypeScript will not be able to handle our overrides here.
    U(e, t, {
      ...r,
      postEvent: n ? (...a) => {
        try {
          return n(...a), c.right(void 0);
        } catch (o) {
          return c.left(o);
        }
      } : x
    })
  );
}
function pt(e, t) {
  const r = $e(
    // @ts-expect-error TS doesn't get what override we are going to use.
    e,
    t
  );
  return typeof r == "function" ? te.fn(() => A(r)) : r;
}
function $e(e, t) {
  const r = se(window);
  if (!e)
    return r || f.pipe(C(), c.match(() => !1, () => !0));
  if (r)
    return w.right(!0);
  const { timeout: n = 100 } = t || {};
  return f.pipe(
    U("web_app_request_theme", "theme_changed", { ...t, timeout: n }),
    w.match(
      (a) => be.is(a) || pe.is(a) ? c.right(!1) : c.left(a),
      () => c.right(!0)
    )
  );
}
function ct({ launchParams: e, onEvent: t, resetPostMessage: r } = {}) {
  if (e) {
    const o = typeof e == "string" || e instanceof URLSearchParams ? e.toString() : (
      // Here we have to trick serializeLaunchParamsQuery into thinking, it serializes a valid
      // value. We are doing it because we are working with tgWebAppData presented as a
      // string, not an object as serializeLaunchParamsQuery requires.
      Ee({ ...e, tgWebAppData: void 0 }) + (e.tgWebAppData ? `&tgWebAppData=${encodeURIComponent(e.tgWebAppData.toString())}` : "")
    );
    try {
      Pe(o);
    } catch (s) {
      throw new Ae(o, s);
    }
    X("launchParams", o);
  }
  if (ie()) {
    if (!t)
      return;
    r && P.reset();
    const o = P();
    P.set((...s) => {
      const [p] = s, _ = () => {
        o(...s);
      };
      try {
        const i = F(ne(oe()), p);
        t({ name: i.eventType, params: i.eventData }, _);
      } catch {
        _();
      }
    });
    return;
  }
  const n = window.TelegramWebviewProxy || {}, a = n.postEvent || (() => {
  });
  window.TelegramWebviewProxy = {
    ...n,
    postEvent(o, s) {
      const p = () => {
        a(o, s);
      };
      t ? t({
        name: o,
        params: s ? JSON.parse(s) : void 0
      }, p) : p();
    }
  }, g().log("Environment was mocked by the mockTelegramEnv function");
}
function ze(e) {
  return ({ req_id: t }) => t === e;
}
const N = {
  "6.0": [
    "iframe_ready",
    "iframe_will_reload",
    "web_app_close",
    "web_app_data_send",
    "web_app_expand",
    "web_app_open_link",
    "web_app_ready",
    "web_app_request_theme",
    "web_app_request_viewport",
    "web_app_setup_main_button",
    "web_app_setup_closing_behavior"
  ],
  6.1: [
    "web_app_open_tg_link",
    "web_app_open_invoice",
    "web_app_setup_back_button",
    "web_app_set_background_color",
    "web_app_set_header_color",
    "web_app_trigger_haptic_feedback"
  ],
  6.2: ["web_app_open_popup"],
  6.4: [
    "web_app_close_scan_qr_popup",
    "web_app_open_scan_qr_popup",
    "web_app_read_text_from_clipboard",
    { method: "web_app_open_link", param: "try_instant_view" }
  ],
  6.7: ["web_app_switch_inline_query"],
  6.9: [
    "web_app_invoke_custom_method",
    "web_app_request_write_access",
    "web_app_request_phone",
    { method: "web_app_set_header_color", param: "color" }
  ],
  "6.10": ["web_app_setup_settings_button"],
  7.2: [
    "web_app_biometry_get_info",
    "web_app_biometry_open_settings",
    "web_app_biometry_request_access",
    "web_app_biometry_request_auth",
    "web_app_biometry_update_token"
  ],
  7.6: [
    { method: "web_app_open_link", param: "try_browser" },
    { method: "web_app_close", param: "return_back" }
  ],
  7.7: ["web_app_setup_swipe_behavior"],
  7.8: ["web_app_share_to_story"],
  "7.10": [
    "web_app_setup_secondary_button",
    "web_app_set_bottom_bar_color",
    { method: "web_app_setup_main_button", param: "has_shine_effect" }
  ],
  "8.0": [
    "web_app_request_safe_area",
    "web_app_request_content_safe_area",
    "web_app_request_fullscreen",
    "web_app_exit_fullscreen",
    "web_app_set_emoji_status",
    "web_app_add_to_home_screen",
    "web_app_check_home_screen",
    "web_app_request_emoji_status_access",
    "web_app_check_location",
    "web_app_open_location_settings",
    "web_app_request_file_download",
    "web_app_request_location",
    "web_app_send_prepared_message",
    "web_app_start_accelerometer",
    "web_app_start_device_orientation",
    "web_app_start_gyroscope",
    "web_app_stop_accelerometer",
    "web_app_stop_device_orientation",
    "web_app_stop_gyroscope",
    "web_app_toggle_orientation_lock"
  ],
  "9.0": [
    "web_app_device_storage_clear",
    "web_app_device_storage_get_key",
    "web_app_device_storage_save_key",
    "web_app_secure_storage_clear",
    "web_app_secure_storage_get_key",
    "web_app_secure_storage_restore_key",
    "web_app_secure_storage_save_key"
  ],
  9.1: ["web_app_hide_keyboard"]
};
function Q(e, t) {
  return Object.keys(N).find((n) => N[n].some((a) => t ? typeof a == "object" && a.method === e && a.param === t : a === e)) || null;
}
function H(e) {
  return e.split(".").map(Number);
}
function Ve(e, t) {
  const r = H(e), n = H(t), a = Math.max(r.length, n.length);
  for (let o = 0; o < a; o += 1) {
    const s = r[o] || 0, p = n[o] || 0;
    if (s !== p)
      return s > p ? 1 : -1;
  }
  return 0;
}
function K(e, t, r) {
  const n = r ? Q(
    e,
    t
  ) : Q(e);
  return n ? Ve(n, r || t) <= 0 : !1;
}
function _t(e, t = "strict") {
  const r = typeof t == "function" ? t : (n) => {
    const { method: a, version: o } = n, s = "param" in n ? new Se(a, n.param, o) : new xe(a, o);
    if (t === "strict")
      throw s;
    return g().forceWarn(s.message);
  };
  return (n, a) => K(n, e) ? n === "web_app_set_header_color" && O(m({ color: we() }), a) && !K(n, "color", e) ? r({ version: e, method: n, param: "color" }) : Ie(n, a) : r({ version: e, method: n });
}
function Be(e, t, r, n) {
  return f.pipe(
    U("web_app_invoke_custom_method", "custom_method_invoked", {
      ...n || {},
      params: { method: e, params: t, req_id: r },
      capture: ze(r)
    }),
    w.chain(({ result: a, error: o }) => o ? w.left(new Ce(o)) : w.right(a))
  );
}
function ut(e, t, r, n) {
  return te.fn(() => f.pipe(
    // @ts-expect-error TypeScript is unable to determine required override.
    Be(e, t, r, n),
    w.match(
      (a) => {
        throw a;
      },
      (a) => a
    )
  )());
}
function Ge(e, t, r = {}) {
  const {
    // If no capture function was passed, we capture the first compatible event.
    capture: n = () => !0,
    postEvent: a = x
  } = r, o = b(), [s, p] = Z();
  (Array.isArray(t) ? t : [t]).forEach((i) => {
    s(
      j(i, (u) => {
        (Array.isArray(t) ? n({ event: i, payload: u }) : n(u)) && o.set([u]);
      })
    );
  });
  const _ = (i) => (p(), i);
  return f.pipe(
    async () => a(e, r.params),
    w.chainW(() => ee((i, u, l) => {
      const d = o();
      if (d)
        return i(d[0]);
      const h = (y) => {
        y && i(y[0]);
      }, M = () => {
        o.unsub(h);
      };
      o.sub(h), l.on("finalized", M);
    }, r)),
    w.mapBoth(_, _)
  );
}
function lt(e, t, r) {
  const { postEvent: n } = r || {};
  return A(
    // @ts-expect-error TypeScript will not be able to handle our overrides here.
    Ge(e, t, {
      ...r,
      postEvent: n ? (...a) => {
        try {
          return n(...a), c.right(void 0);
        } catch (o) {
          return c.left(o);
        }
      } : x
    })
  );
}
function ft() {
  Object.hasOwn || (Object.hasOwn = function(e, t) {
    return Object.prototype.hasOwnProperty.call(e, t);
  });
}
function le(e) {
  return c.tryCatch(() => decodeURIComponent(
    atob(
      e.replace(/-/g, "+").replace(/_/g, "/")
    ).split("").map((t) => "%" + ("00" + t.charCodeAt(0).toString(16)).slice(-2)).join("")
  ), (t) => t);
}
const mt = T(le);
function fe(e) {
  return btoa(
    encodeURIComponent(e).replace(/%([0-9A-F]{2})/g, (t, r) => String.fromCharCode(parseInt(`0x${r}`)))
  ).replace(/\+/g, "-").replace(/\//g, "_");
}
function De(e) {
  const t = fe(typeof e == "string" ? e : JSON.stringify(e));
  return t.length > 512 ? c.left(new Error("Value is too long for start parameter")) : c.right(t);
}
const wt = T(De);
function dt(e, t) {
  return A(
    Je(
      e,
      // @ts-expect-error TypeScript is unable to detect a correct override.
      typeof t == "function" ? (r) => c.tryCatch(() => t(r), (n) => n) : t
    )
  );
}
function Je(e, t) {
  return f.pipe(
    le(e),
    c.chain((r) => t ? typeof t == "function" ? t(r) : he.parse(r) : c.right(r))
  );
}
function gt(e) {
  return fe(e).length <= 512;
}
export {
  Pt as CancelledError,
  Ae as InvalidLaunchParamsError,
  Ce as InvokeCustomMethodFailedError,
  Te as LaunchParamsRetrieveError,
  Se as MethodParameterUnsupportedError,
  xe as MethodUnsupportedError,
  kt as TimeoutError,
  pe as UnknownEnvError,
  ft as applyPolyfills,
  ze as captureSameReq,
  Ve as compareVersions,
  yt as createLogger,
  _t as createPostEvent,
  wt as createStartParam,
  De as createStartParamFp,
  ce as debug,
  mt as decodeBase64Url,
  le as decodeBase64UrlFp,
  dt as decodeStartParam,
  Je as decodeStartParamFp,
  vt as deepSnakeToCamelObjKeys,
  q as emitEvent,
  fe as encodeBase64Url,
  Q as getReleaseVersion,
  se as hasWebviewProxy,
  ut as invokeCustomMethod,
  Be as invokeCustomMethodFp,
  ie as isIframe,
  gt as isSafeToCreateStartParam,
  pt as isTMA,
  $e as isTMAFp,
  g as logger,
  ct as mockTelegramEnv,
  Oe as off,
  je as offAll,
  j as on,
  Ie as postEvent,
  x as postEventFp,
  Ue as postMessage,
  P as postMessageImpl,
  lt as request,
  it as request2,
  U as request2Fp,
  Ge as requestFp,
  st as resetGlobals,
  tt as retrieveLaunchParams,
  Me as retrieveLaunchParamsFp,
  rt as retrieveRawInitData,
  qe as retrieveRawInitDataFp,
  nt as retrieveRawLaunchParams,
  C as retrieveRawLaunchParamsFp,
  ot as setDebug,
  at as setTargetOrigin,
  K as supports,
  _e as targetOrigin
};
//# sourceMappingURL=index.js.map
