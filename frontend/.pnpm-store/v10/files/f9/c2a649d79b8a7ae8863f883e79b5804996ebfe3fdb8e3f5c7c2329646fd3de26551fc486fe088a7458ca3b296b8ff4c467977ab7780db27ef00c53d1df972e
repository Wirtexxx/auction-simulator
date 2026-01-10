var it = Object.defineProperty;
var ot = (s, t, r) => t in s ? it(s, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : s[t] = r;
var e = (s, t, r) => ot(s, typeof t != "symbol" ? t + "" : t, r);
import { batch as ue, signal as O, computed as C } from "@tma.js/signals";
import { supports as ee, isTMAFp as at, postEventFp as pt, off as re, on as z, requestFp as ut, request2Fp as ct, invokeCustomMethodFp as lt, retrieveLaunchParamsFp as ce, retrieveRawInitDataFp as ht, captureSameReq as dt, logger as Re } from "@tma.js/bridge";
import { CancelledError as yn, InvalidLaunchParamsError as In, InvokeCustomMethodFailedError as En, LaunchParamsRetrieveError as qn, MethodParameterUnsupportedError as An, MethodUnsupportedError as Bn, TimeoutError as xn, UnknownEnvError as Mn, applyPolyfills as Vn, createLogger as Tn, createPostEvent as Ln, createStartParam as $n, createStartParamFp as Rn, debug as Pn, decodeBase64Url as On, decodeBase64UrlFp as Dn, decodeStartParam as Gn, decodeStartParamFp as jn, deepSnakeToCamelObjKeys as Un, emitEvent as Wn, encodeBase64Url as Hn, getReleaseVersion as Kn, isSafeToCreateStartParam as Qn, isTMA as zn, isTMAFp as Nn, logger as Jn, mockTelegramEnv as Yn, off as Zn, offAll as Xn, on as ei, retrieveLaunchParams as ti, retrieveLaunchParamsFp as si, retrieveRawInitData as ri, retrieveRawInitDataFp as ni, retrieveRawLaunchParams as ii, retrieveRawLaunchParamsFp as oi, setDebug as ai, setTargetOrigin as pi, supports as ui, targetOrigin as ci } from "@tma.js/bridge";
import { throwifyFpFn as he, throwifyAnyEither as Ge, getStorageValue as _t, setStorageValue as ft, snakeToKebab as mt, createCbCollector as ke, camelToKebab as je, BetterTaskEither as ge } from "@tma.js/toolkit";
import { BetterPromise as Ue } from "better-promises";
import { toRGBFullFp as bt, isRGB as _e, pipeQueryToSchema as gt, pipeJsonToSchema as Ft } from "@tma.js/transformers";
import { isAnyRGB as hi, isRGB as di, isRGBA as _i, isRGBAShort as fi, isRGBShort as mi, parseInitDataQuery as bi, parseInitDataQueryFp as gi, parseLaunchParamsQuery as Fi, parseLaunchParamsQueryFp as wi, serializeInitDataQuery as Ci, serializeLaunchParamsQuery as Si, toRGB as vi, toRGBFp as ki, toRGBFull as yi, toRGBFullFp as Ii } from "@tma.js/transformers";
import { either as b, function as u, option as Q, taskEither as c } from "fp-ts";
import { errorClassWithData as ye, errorClass as G } from "error-kid";
import { parse as Pe, record as wt, string as K, array as Ct, safeParse as Fe, looseObject as Oe, pipe as We, transform as He, date as Ke, optional as St, number as Qe, integer as vt } from "valibot";
function R(s) {
  return typeof s == "function" ? s() : s;
}
class ne {
  constructor({
    onMounted: t,
    restoreState: r,
    initialState: n,
    onUnmounted: a,
    isPageReload: o
  }) {
    e(this, "_isMounted", O(!1));
    /**
     * Signal indicating if the component is mounted.
     */
    e(this, "isMounted", C(this._isMounted));
    /**
     * Mounts the component restoring its state and calling required side effects.
     */
    e(this, "mount");
    /**
     * Unmounts the component.
     */
    e(this, "unmount");
    this.mount = () => {
      if (this.isMounted())
        return b.right(void 0);
      const p = R(o) ? r() : void 0, i = p ? b.right(p) : typeof n == "function" ? n() : b.right(n);
      return u.pipe(i, b.map((l) => {
        ue(() => {
          this._isMounted.set(!0), t == null || t(l);
        });
      }));
    }, this.unmount = () => {
      this._isMounted() && ue(() => {
        this._isMounted.set(!1), a == null || a();
      });
    };
  }
}
function we(s) {
  const t = {};
  for (const r in s) {
    const n = s[r];
    n !== void 0 && (t[r] = n);
  }
  return t;
}
function fe(s, t) {
  const r = Object.keys(s), n = Object.keys(t);
  return r.length !== n.length ? !1 : r.every((a) => Object.prototype.hasOwnProperty.call(t, a) && s[a] === t[a]);
}
class J {
  constructor({ initialState: t, onChange: r }) {
    e(this, "_state");
    /**
     * The current state.
     */
    e(this, "state");
    /**
     * Updates the state.
     * @param state - updates to apply.
     */
    e(this, "setState", (t) => {
      const r = { ...this.state(), ...we(t) };
      fe(r, this.state()) || this._state.set(r);
    });
    this._state = O(t, { equals: fe }), this.state = C(this._state), this.state.sub(r);
  }
  /**
   * Creates a computed signal based on the state.
   * @param key - a state key to use as a source.
   */
  getter(t) {
    return C(() => this._state()[t]);
  }
  /**
   * @returns True if specified payload will update the state.
   * @param state
   */
  hasDiff(t) {
    return !fe({ ...this.state(), ...we(t) }, this.state());
  }
}
function W(s, t) {
  return C(() => ee(s, R(t)));
}
// @__NO_SIDE_EFFECTS__
function h(s) {
  return Object.assign(he(s), {
    ifAvailable(...t) {
      return u.pipe(
        s.ifAvailable(...t),
        Q.match(
          () => ({ ok: !1 }),
          (r) => ({
            ok: !0,
            data: Ge(r)
          })
        )
      );
    }
  });
}
function X(s) {
  return [s];
}
class pe extends (/* @__PURE__ */ ye(
  "ValidationError",
  (t, r) => ({ input: t, issues: r }),
  "Validation error"
)) {
}
class Ie extends (/* @__PURE__ */ G(
  "CSSVarsBoundError",
  "CSS variables are already bound"
)) {
}
class kt extends (/* @__PURE__ */ ye("DeviceStorageMethodError", (t) => ({ error: t }), (t) => [t])) {
}
class yt extends (/* @__PURE__ */ ye("SecureStorageMethodError", (t) => ({ error: t }), (t) => [t])) {
}
class It extends (/* @__PURE__ */ G(
  "NotAvailableError",
  X
)) {
}
class Tr extends (/* @__PURE__ */ G(
  "InvalidEnvError",
  X
)) {
}
class Et extends (/* @__PURE__ */ G(
  "FunctionNotAvailableError",
  X
)) {
}
class U extends (/* @__PURE__ */ G(
  "InvalidArgumentsError",
  (t, r) => [t, { cause: r }]
)) {
}
class Ee extends (/* @__PURE__ */ G(
  "ConcurrentCallError",
  X
)) {
}
class qt extends (/* @__PURE__ */ G(
  "SetEmojiStatusError",
  (t) => [`Failed to set emoji status: ${t}`]
)) {
}
class ze extends (/* @__PURE__ */ G(
  "AccessDeniedError",
  X
)) {
}
class At extends (/* @__PURE__ */ G(
  "FullscreenFailedError",
  X
)) {
}
class Bt extends (/* @__PURE__ */ G(
  "ShareMessageError",
  X
)) {
}
class xt extends (/* @__PURE__ */ G(
  "UnknownThemeParamsKeyError",
  (t) => [`Unknown theme params key passed: ${t}`]
)) {
}
function A(s, t) {
  const r = C(() => R(t.version) || "100"), n = C(() => R(t.isTma)), { requires: a, returns: o } = t, p = a ? typeof a == "object" ? a : { every: [a] } : void 0, i = (m) => {
    if (!t.supports)
      return !0;
    const g = t.supports[m];
    return ee(g.method, g.param, r());
  }, l = () => {
    if (!p)
      return;
    const [m, g] = "every" in p ? ["every", p.every] : ["some", p.some];
    for (let d = 0; d < g.length; d++) {
      const B = g[d], T = typeof B == "function" ? B() : ee(B, r()) ? void 0 : `it is unsupported in Mini Apps version ${r()}`;
      if (T && (m === "every" || d === g.length - 1))
        return T;
    }
  }, f = (...m) => {
    for (const g in t.supports)
      if (t.supports[g].shouldCheck(...m) && !i(g))
        return `option ${g} is not supported in Mini Apps version ${r()}`;
  }, F = C(() => !l()), _ = C(() => r() !== "0.0"), S = C(() => t.isMounted ? t.isMounted() : !0), w = C(
    () => n() && _() && F() && S()
  ), k = (m) => {
    const g = new Et(m);
    return ["task", "promise"].includes(t.returns) ? c.left(g) : b.left(g);
  }, y = (...m) => o === "plain" ? b.tryCatch(() => s(...m), (g) => g) : o === "promise" ? c.tryCatch(() => s(...m), (g) => g) : s(...m);
  return Object.assign(
    (...m) => {
      var T;
      const g = "Unable to call function:";
      if (!n())
        return k(`${g} it can't be called outside Mini Apps`);
      if (!_())
        return k(`${g} the SDK was not initialized. Use the SDK init() function`);
      const d = l();
      if (d)
        return k(`${g} ${d}`);
      const B = f(...m);
      if (B)
        return k(`${g} ${B}`);
      if (!S()) {
        const M = (T = t.isMounting) != null && T.call(t) ? "mounting. Wait for the mount completion" : "unmounted. Use the mount() method";
        return k(`${g} the component is ${M}`);
      }
      return y(...m);
    },
    s,
    {
      isAvailable: w,
      ifAvailable(...m) {
        return w() ? Q.some(y(...m)) : Q.none;
      }
    },
    p ? { isSupported: F } : {},
    t.supports ? { supports: i } : {}
  );
}
function E(s) {
  return (t) => A(t, s);
}
class de {
  constructor({
    isTma: t,
    storage: r,
    onClick: n,
    offClick: a,
    initialState: o,
    isPageReload: p,
    postEvent: i,
    payload: l,
    method: f,
    version: F
  }) {
    /**
     * Signal indicating if the component is currently mounted.
     */
    e(this, "isMounted");
    /**
     * Signal indicating if the component is supported.
     */
    e(this, "isSupported");
    /**
     * Complete button state.
     */
    e(this, "state");
    /**
     * @returns A setter with checks for the specified key.
     * @param key
     */
    e(this, "stateSetters");
    /**
     * @returns Setters with checks to set a specified boolean key.
     * @param key
     */
    e(this, "stateBoolSetters");
    /**
     * Updates the button state.
     */
    e(this, "setStateFp");
    /**
     * @see setStateFp
     */
    e(this, "setState");
    /**
     * Adds a new button listener.
     * @param listener - event listener.
     * @param once - should the listener be called only once.
     * @returns A function to remove bound listener.
     * @example
     * const off = button.onClick(() => {
     *   console.log('User clicked the button');
     *   off();
     * });
     */
    e(this, "onClickFp");
    /**
     * @see onClickFp
     */
    e(this, "onClick");
    /**
     * Removes the button click listener.
     * @param listener - event listener.
     * @param once - should the listener be called only once.
     * @example
     * function listener() {
     *   console.log('User clicked the button');
     *   button.offClick(listener);
     * }
     * button.onClick(listener);
     */
    e(this, "offClickFp");
    /**
     * @see offClickFp
     */
    e(this, "offClick");
    /**
     * Mounts the component restoring its state.
     * @since Mini Apps v6.1
     */
    e(this, "mountFp");
    /**
     * @see mountFp
     */
    e(this, "mount");
    /**
     * Unmounts the component.
     *
     * Note that this function does not remove listeners added via the `onClick`
     * function, so you have to remove them on your own.
     * @see onClick
     */
    e(this, "unmount");
    const _ = new J({
      initialState: o,
      onChange(m) {
        r.set(m);
      }
    }), S = new ne({
      initialState: o,
      isPageReload: p,
      onMounted: _.setState,
      restoreState: r.get
    }), w = { version: F, requires: f, isTma: t }, k = E({
      ...w,
      returns: "plain"
    }), y = E({
      ...w,
      returns: "either",
      isMounted: S.isMounted
    });
    this.isMounted = S.isMounted, this.isSupported = W(f, F), this.state = _.state, this.setStateFp = y((m) => {
      const g = { ...this.state(), ...we(m) };
      return _.hasDiff(g) ? u.pipe(
        i(f, l(g)),
        b.map(() => {
          _.setState(g);
        })
      ) : b.right(void 0);
    }), this.setState = /* @__PURE__ */ h(this.setStateFp), this.onClickFp = k(n), this.onClick = /* @__PURE__ */ h(this.onClickFp), this.offClickFp = k(a), this.offClick = /* @__PURE__ */ h(this.offClickFp), this.mountFp = k(() => {
      const m = () => {
      };
      return u.pipe(S.mount(), b.match(m, m));
    }), this.mount = /* @__PURE__ */ h(this.mountFp), this.unmount = S.unmount, this.stateSetters = (m) => {
      const g = y((d) => this.setStateFp({ [m]: d }));
      return [/* @__PURE__ */ h(g), g];
    }, this.stateBoolSetters = (m) => {
      const [, g] = this.stateSetters(m), d = y(() => g(!1)), B = y(() => g(!0));
      return [
        [/* @__PURE__ */ h(d), d],
        [/* @__PURE__ */ h(B), B]
      ];
    };
  }
  /**
   * @returns A computed based on the specified state and its related key.
   * @param key - a key to use.
   */
  stateGetter(t) {
    return C(() => this.state()[t]);
  }
}
class Mt {
  constructor(t) {
    /**
     * Signal indicating if the component is currently visible.
     */
    e(this, "isVisible");
    /**
     * Signal indicating if the component is currently mounted.
     */
    e(this, "isMounted");
    /**
     * Signal indicating if the component is supported.
     */
    e(this, "isSupported");
    /**
     * Hides the button.
     * @since Mini Apps v6.1
     */
    e(this, "hideFp");
    /**
     * @see hideFp
     */
    e(this, "hide");
    /**
     * Shows the button.
     * @since Mini Apps v6.1
     */
    e(this, "showFp");
    /**
     * @see showFp
     */
    e(this, "show");
    /**
     * Adds a new button listener.
     * @param listener - event listener.
     * @param once - should the listener be called only once.
     * @returns A function to remove bound listener.
     * @since Mini Apps v6.1
     * @example
     * const off = button.onClick(() => {
     *   console.log('User clicked the button');
     *   off();
     * });
     */
    e(this, "onClickFp");
    /**
     * @see onClickFp
     */
    e(this, "onClick");
    /**
     * Removes the button click listener.
     * @param listener - event listener.
     * @param once - should the listener be called only once.
     * @since Mini Apps v6.1
     * @example
     * function listener() {
     *   console.log('User clicked the button');
     *   button.offClick(listener);
     * }
     * button.onClick(listener);
     */
    e(this, "offClickFp");
    /**
     * @see offClickFp
     */
    e(this, "offClick");
    /**
     * Mounts the component restoring its state.
     * @since Mini Apps v6.1
     */
    e(this, "mountFp");
    /**
     * @see mountFp
     */
    e(this, "mount");
    /**
     * Unmounts the component.
     *
     * Note that this function does not remove listeners added via the `onClick`
     * function, so you have to remove them on your own.
     * @see onClick
     */
    e(this, "unmount");
    const r = new de({
      ...t,
      method: "web_app_setup_back_button",
      payload: (n) => ({ is_visible: n.isVisible }),
      initialState: { isVisible: !1 }
    });
    this.isVisible = r.stateGetter("isVisible"), this.isMounted = r.isMounted, this.isSupported = r.isSupported, [[this.hide, this.hideFp], [this.show, this.showFp]] = r.stateBoolSetters("isVisible"), this.onClick = r.onClick, this.onClickFp = r.onClickFp, this.offClick = r.offClick, this.offClickFp = r.offClickFp, this.mount = r.mount, this.mountFp = r.mountFp, this.unmount = r.unmount;
  }
}
function v() {
  return { isTma: C(() => at()) };
}
function te(s) {
  return (t) => ({ ...t, ...R(s) });
}
// @__NO_SIDE_EFFECTS__
function ie(s, t) {
  return O(s, t);
}
const Ne = /* @__PURE__ */ ie(pt), se = (...s) => Ne()(...s), Vt = (...s) => Ge(se(...s)), V = te({
  postEvent: se
});
function Tt(s) {
  return {
    get: () => _t(s),
    set(t) {
      ft(s, t);
    }
  };
}
function Lt() {
  return performance.getEntriesByType("navigation")[0];
}
function $t() {
  const s = Lt();
  return !!s && s.type === "reload";
}
function Y(s) {
  return te({
    storage: Tt(s),
    isPageReload: $t
  });
}
const Ce = /* @__PURE__ */ ie("0.0"), I = te({ version: Ce });
// @__NO_SIDE_EFFECTS__
function qe(s, t) {
  return {
    ...u.pipe(
      v(),
      V,
      I,
      Y(s)
    ),
    onClick(r, n) {
      return z(t, r, n);
    },
    offClick(r, n) {
      re(t, r, n);
    }
  };
}
const Lr = /* @__PURE__ */ new Mt(
  /* @__PURE__ */ qe("backButton", "back_button_pressed")
);
class Ae {
  constructor({
    initialState: t,
    onMounted: r,
    restoreState: n,
    onUnmounted: a,
    isPageReload: o
  }) {
    e(this, "_isMounted", O(!1));
    /**
     * Signal indicating if the component is mounted.
     */
    e(this, "isMounted", C(this._isMounted));
    /**
     * Mounts the component restoring its state and calling required side effects.
     * @param options - additional execution options.
     */
    e(this, "mount");
    /**
     * Unmounts the component.
     */
    e(this, "unmount");
    this.mount = (p) => {
      if (this._isMounted())
        return c.right(void 0);
      const i = R(o) ? n() : void 0;
      return u.pipe(
        i ? c.right(i) : t(p),
        c.map((l) => {
          this._isMounted() || ue(() => {
            this._isMounted.set(!0), r == null || r(l);
          });
        })
      );
    }, this.unmount = () => {
      this._isMounted() && ue(() => {
        this._isMounted.set(!1), a == null || a();
      });
    };
  }
}
function De() {
  return new It("Biometry is not available");
}
function me(s) {
  let t = !1, r = !1, n = "", a = !1, o = "", p = !1;
  return s.available && (t = !0, r = s.token_saved, n = s.device_id, a = s.access_requested, o = s.type, p = s.access_granted), { available: t, tokenSaved: r, deviceId: n, type: o, accessGranted: p, accessRequested: a };
}
class Rt {
  constructor({
    version: t,
    request: r,
    postEvent: n,
    storage: a,
    onInfoReceived: o,
    offInfoReceived: p,
    isTma: i,
    isPageReload: l
  }) {
    /**
     * Signal indicating if biometry is available.
     */
    e(this, "isAvailable");
    /**
     * Signal indicating if the component is supported.
     */
    e(this, "isSupported");
    /**
     * Signal indicating if the component is mounted.
     */
    e(this, "isMounted");
    /**
     * Complete component state.
     */
    e(this, "state");
    /**
     * Attempts to authenticate a user using biometrics and fetch a previously stored secure token.
     * @param options - method options.
     * @since Mini Apps v7.2
     * @returns Token from the local secure storage saved previously or undefined.
     * @example
     * const { status, token } = await biometry.authenticate({
     *   reason: 'Authenticate to open wallet',
     * });
     */
    e(this, "authenticateFp");
    /**
     * @see authenticateFp
     */
    e(this, "authenticate");
    /**
     * Opens the biometric access settings for bots. Useful when you need to request biometrics
     * access to users who haven't granted it yet.
     *
     * _Note that this method can be called only in response to user interaction with the Mini App
     * interface (e.g. a click inside the Mini App or on the main button)_.
     * @since Mini Apps v7.2
     */
    e(this, "openSettingsFp");
    /**
     * @see openSettingsFp
     */
    e(this, "openSettings");
    /**
     * Requests permission to use biometrics.
     * @since Mini Apps v7.2
     * @returns Promise with true, if access was granted.
     * @example
     * const accessGranted = await biometry.requestAccess({
     *   reason: 'Authenticate to open wallet',
     * });
     */
    e(this, "requestAccessFp");
    /**
     * @see requestAccessFp
     */
    e(this, "requestAccess");
    /**
     * Updates the biometric token in a secure storage on the device.
     * @since Mini Apps v7.2
     * @returns Promise with `true`, if token was updated.
     * @example Setting a new token
     * biometry.updateToken({
     *   token: 'abcdef',
     * })
     * @example Deleting the token
     * biometry.updateToken();
     */
    e(this, "updateTokenFp");
    /**
     * @see updateTokenFp
     */
    e(this, "updateToken");
    /**
     * Mounts the component restoring its state.
     * @since Mini Apps v7.2
     */
    e(this, "mountFp");
    /**
     * @see mountFp
     */
    e(this, "mount");
    /**
     * Unmounts the component.
     */
    e(this, "unmount");
    const f = (m) => {
      F.setState(me(m));
    }, F = new J({
      initialState: {
        available: !1,
        type: "unknown",
        accessGranted: !1,
        accessRequested: !1,
        deviceId: "",
        tokenSaved: !1
      },
      onChange: a.set
    }), _ = new Ae({
      initialState(m) {
        return u.pipe(
          r("web_app_biometry_get_info", "biometry_info_received", m),
          c.map(me)
        );
      },
      isPageReload: l,
      onMounted(m) {
        F.setState(m), o(f);
      },
      onUnmounted() {
        p(f);
      },
      restoreState: a.get
    }), S = { version: t, requires: "web_app_biometry_request_auth", isTma: i }, w = E({
      ...S,
      returns: "either"
    }), k = E({
      ...S,
      returns: "task"
    }), y = E({
      ...S,
      isMounted: _.isMounted,
      returns: "task"
    });
    this.isAvailable = F.getter("available"), this.isMounted = _.isMounted, this.isSupported = W("web_app_biometry_request_auth", t), this.state = F.state, this.unmount = _.unmount, this.mountFp = k(_.mount), this.authenticateFp = y((m) => this.isAvailable() ? u.pipe(
      r("web_app_biometry_request_auth", "biometry_auth_requested", {
        ...m,
        params: { reason: ((m || {}).reason || "").trim() }
      }),
      c.map((g) => (F.setState({ token: g.token }), g))
    ) : c.left(De())), this.openSettingsFp = w(() => n("web_app_biometry_open_settings")), this.requestAccessFp = y((m) => u.pipe(
      r("web_app_biometry_request_access", "biometry_info_received", {
        ...m,
        params: { reason: ((m || {}).reason || "").trim() }
      }),
      c.chain((g) => {
        const d = me(g);
        return d.available ? (F.setState(d), c.right(d.accessRequested)) : c.left(De());
      })
    )), this.updateTokenFp = y((m = {}) => {
      var g;
      return u.pipe(
        r("web_app_biometry_update_token", "biometry_token_updated", {
          ...m,
          params: { token: m.token || "", reason: (g = m.reason) == null ? void 0 : g.trim() }
        }),
        c.map((d) => d.status)
      );
    }), this.authenticate = /* @__PURE__ */ h(this.authenticateFp), this.openSettings = /* @__PURE__ */ h(this.openSettingsFp), this.requestAccess = /* @__PURE__ */ h(this.requestAccessFp), this.updateToken = /* @__PURE__ */ h(this.updateTokenFp), this.mount = /* @__PURE__ */ h(this.mountFp);
  }
}
const Pt = (s, t, r) => ut(s, t, {
  postEvent: se,
  ...r
}), Je = (s, t, r) => ct(s, t, {
  postEvent: se,
  ...r
}), $r = (...s) => Ue.fn(() => Pt(...s)()), Rr = (...s) => Ue.fn(() => Je(...s)()), L = te({ request: Je });
function Ot() {
  return new Rt({
    ...u.pipe(
      v(),
      V,
      I,
      L,
      Y("biometry")
    ),
    offInfoReceived(s) {
      re("biometry_info_received", s);
    },
    onInfoReceived(s) {
      return z("biometry_info_received", s);
    }
  });
}
const Pr = /* @__PURE__ */ Ot();
class Dt {
  constructor({ postEvent: t, storage: r, isTma: n, isPageReload: a }) {
    /**
     * Signal indicating if closing confirmation dialog is currently enabled.
     */
    e(this, "isConfirmationEnabled");
    /**
     * Signal indicating if the component is currently mounted.
     */
    e(this, "isMounted");
    /**
     * Mounts the component restoring its state.
     */
    e(this, "mountFp");
    /**
     * @see mountFp
     */
    e(this, "mount");
    /**
     * Unmounts the component.
     */
    e(this, "unmount");
    /**
     * Disables the closing confirmation dialog.
     */
    e(this, "disableConfirmationFp");
    /**
     * @see disableConfirmationFp
     */
    e(this, "disableConfirmation");
    /**
     * Enables the closing confirmation dialog.
     */
    e(this, "enableConfirmationFp");
    /**
     * @see enableConfirmationFp
     */
    e(this, "enableConfirmation");
    const o = new J({
      initialState: { isConfirmationEnabled: !1 },
      onChange(_) {
        r.set(_);
      }
    }), p = new ne({
      onMounted: o.setState,
      restoreState: r.get,
      initialState: { isConfirmationEnabled: !1 },
      isPageReload: a
    }), i = { requires: "web_app_setup_closing_behavior", isTma: n }, l = E({
      ...i,
      returns: "plain"
    }), f = E({
      ...i,
      returns: "either",
      isMounted: p.isMounted
    }), F = (_) => _ === this.isConfirmationEnabled() ? b.right(void 0) : (o.setState({ isConfirmationEnabled: _ }), t("web_app_setup_closing_behavior", {
      need_confirmation: _
    }));
    this.isConfirmationEnabled = o.getter("isConfirmationEnabled"), this.isMounted = p.isMounted, this.disableConfirmationFp = f(() => F(!1)), this.enableConfirmationFp = f(() => F(!0)), this.mountFp = l(() => {
      const _ = () => {
      };
      return u.pipe(p.mount(), b.match(_, _));
    }), this.unmount = p.unmount, this.disableConfirmation = /* @__PURE__ */ h(this.disableConfirmationFp), this.enableConfirmation = /* @__PURE__ */ h(this.enableConfirmationFp), this.mount = /* @__PURE__ */ h(this.mountFp);
  }
}
function Gt() {
  return new Dt(u.pipe(
    v(),
    Y("closingBehavior"),
    V
  ));
}
const Or = /* @__PURE__ */ Gt();
class jt {
  constructor({ version: t, isTma: r, invokeCustomMethod: n }) {
    /**
     * Signal indicating if the component is supported.
     */
    e(this, "isSupported");
    /**
     * Deletes specified key or keys from the cloud storage.
     * @param keyOrKeys - key or keys to delete.
     * @param options - request execution options.
     * @since Mini Apps v6.9
     */
    e(this, "deleteItemFp");
    e(this, "deleteItem");
    /**
     * Gets a single key value from the cloud storage.
     * @param key - a key to get.
     * @param options - request execution options.
     * @returns A key value as a string.
     * @since Mini Apps v6.9
     */
    e(this, "getItemFp");
    /**
     * @see getItemFp
     */
    e(this, "getItem");
    /**
     * Gets multiple keys' values from the cloud storage.
     * @param keys - keys list.
     * @param options - request execution options.
     * @returns A map, where a key is one of the specified in the `keys` argument,
     * and a value is a corresponding storage value if an array of keys was passed.
     * @since Mini Apps v6.9
     */
    e(this, "getItemsFp");
    /**
     * @see getItemsFp
     */
    e(this, "getItems");
    /**
     * Returns a list of all keys presented in the cloud storage.
     * @param options - request execution options.
     * @since Mini Apps v6.9
     */
    e(this, "getKeysFp");
    /**
     * @see getKeysFp
     */
    e(this, "getKeys");
    /**
     * Saves the specified value by a key.
     * @param key - storage key.
     * @param value - storage value.
     * @param options - request execution options.
     * @since Mini Apps v6.9
     */
    e(this, "setItemFp");
    /**
     * @see setItemFp
     */
    e(this, "setItem");
    /**
     * Clears the cloud storage.
     * @param options - additional options.
     * @since Mini Apps v6.9
     */
    e(this, "clearFp");
    /**
     * @see clearFp
     */
    e(this, "clear");
    const a = E({
      version: t,
      requires: "web_app_invoke_custom_method",
      isTma: r,
      returns: "task"
    });
    this.isSupported = W("web_app_invoke_custom_method", t), this.deleteItemFp = a((o, p) => {
      const i = Array.isArray(o) ? o : [o];
      return u.pipe(
        i.length ? n("deleteStorageValues", { keys: i }, p) : c.right(void 0),
        c.map(() => {
        })
      );
    }), this.getItemFp = a((o, p) => u.pipe(
      this.getItemsFp([o], p),
      c.map((i) => i[o] || "")
    )), this.getItemsFp = a((o, p) => u.pipe(
      o.length ? n("getStorageValues", { keys: o }, p) : c.right({}),
      c.map((i) => ({
        // Fulfill the response with probably missing keys.
        ...o.reduce((l, f) => (l[f] = "", l), {}),
        ...Pe(wt(K(), K()), i)
      }))
    )), this.getKeysFp = a((o) => u.pipe(
      n("getStorageKeys", {}, o),
      c.map((p) => Pe(Ct(K()), p))
    )), this.setItemFp = a((o, p, i) => u.pipe(
      n("saveStorageValue", { key: o, value: p }, i),
      c.map(() => {
      })
    )), this.clearFp = a((o) => u.pipe(this.getKeysFp(o), c.chain(this.deleteItemFp))), this.deleteItem = /* @__PURE__ */ h(this.deleteItemFp), this.getItem = /* @__PURE__ */ h(this.getItemFp), this.getItems = /* @__PURE__ */ h(this.getItemsFp), this.getKeys = /* @__PURE__ */ h(this.getKeysFp), this.setItem = /* @__PURE__ */ h(this.setItemFp), this.clear = /* @__PURE__ */ h(this.clearFp);
  }
}
const be = /* @__PURE__ */ ie(0);
function Be() {
  return be.set(be() + 1), be().toString();
}
function Ut(s, t, r) {
  return lt(s, t, Be(), {
    ...r || {},
    postEvent: se
  });
}
const xe = te({
  invokeCustomMethod: Ut
});
function Wt() {
  return new jt(u.pipe(
    v(),
    I,
    xe
  ));
}
const Dr = /* @__PURE__ */ Wt();
class Ht {
  constructor({ isTma: t, request: r, version: n, createRequestId: a }) {
    /**
      * Retrieves an item using its key.
      * @since Mini Apps v9.0
      */
    e(this, "getItemFp");
    /**
     * @see getItemFp
     */
    e(this, "getItem");
    /**
      * Sets a new item in the storage.
      * @since Mini Apps v9.0
      */
    e(this, "setItemFp");
    /**
     * @see setItemFp
     */
    e(this, "setItem");
    /**
      * Removes a key from the storage.
      * @since Mini Apps v9.0
      */
    e(this, "deleteItemFp");
    /**
     * @see deleteItemFp
     */
    e(this, "deleteItem");
    /**
      * Removes all keys from the storage.
      * @since Mini Apps v9.0
      */
    e(this, "clearFp");
    /**
     * @see clearFp
     */
    e(this, "clear");
    const o = E({
      version: n,
      requires: "web_app_device_storage_get_key",
      isTma: t,
      returns: "task"
    }), p = (i, l, f) => {
      const F = a();
      return u.pipe(
        r(i, ["device_storage_failed", l], {
          params: { ...f, req_id: F },
          capture: (_) => "payload" in _ ? _.payload.req_id === F : !0
        }),
        c.chain((_) => _.event === "device_storage_failed" ? c.left(new kt(_.payload.error || "UNKNOWN_ERROR")) : c.right(_.payload))
      );
    };
    this.getItemFp = o((i) => u.pipe(
      p("web_app_device_storage_get_key", "device_storage_key_received", { key: i }),
      c.map((l) => l.value)
    )), this.setItemFp = o((i, l) => u.pipe(
      p("web_app_device_storage_save_key", "device_storage_key_saved", { key: i, value: l }),
      c.map(() => {
      })
    )), this.deleteItemFp = o((i) => this.setItemFp(i, null)), this.clearFp = o(() => u.pipe(
      p("web_app_device_storage_clear", "device_storage_cleared", {}),
      c.map(() => {
      })
    )), this.getItem = /* @__PURE__ */ h(this.getItemFp), this.setItem = /* @__PURE__ */ h(this.setItemFp), this.deleteItem = /* @__PURE__ */ h(this.deleteItemFp), this.clear = /* @__PURE__ */ h(this.clearFp);
  }
}
const Ye = te({ createRequestId: Be });
function Kt() {
  return new Ht(u.pipe(
    v(),
    I,
    L,
    Ye
  ));
}
const Gr = /* @__PURE__ */ Kt();
function Qt({ request: s, ...t }) {
  return A((r) => u.pipe(
    s("web_app_request_emoji_status_access", "emoji_status_access_requested", r),
    c.map((n) => n.status)
  ), { ...t, requires: "web_app_request_emoji_status_access", returns: "task" });
}
// @__NO_SIDE_EFFECTS__
function zt() {
  return Qt(u.pipe(
    v(),
    I,
    L
  ));
}
const Nt = /* @__PURE__ */ zt(), jr = /* @__PURE__ */ h(Nt);
function Jt({ request: s, ...t }) {
  return A((r, n) => u.pipe(
    s("web_app_set_emoji_status", ["emoji_status_set", "emoji_status_failed"], {
      params: {
        custom_emoji_id: r,
        duration: (n || {}).duration
      },
      ...n
    }),
    c.chainW((a) => a.event === "emoji_status_failed" ? c.left(new qt(a.payload.error)) : c.right(void 0))
  ), {
    ...t,
    requires: "web_app_set_emoji_status",
    returns: "task"
  });
}
// @__NO_SIDE_EFFECTS__
function Yt() {
  return Jt(u.pipe(
    v(),
    L,
    I
  ));
}
const Zt = /* @__PURE__ */ Yt(), Ur = /* @__PURE__ */ h(Zt);
class Xt {
  constructor({ postEvent: t, isTma: r, version: n }) {
    /**
     * Signal indicating if the component is supported.
     */
    e(this, "isSupported");
    /**
     * A method that tells if an impact occurred. The Telegram app may play the
     * appropriate haptics based on style value passed.
     * @param style - impact style.
     * @since Mini Apps v6.1
     */
    e(this, "impactOccurredFp");
    /**
     * @see impactOccurredFp
     */
    e(this, "impactOccurred");
    /**
     * A method tells that a task or action has succeeded, failed, or produced
     * a warning. The Telegram app may play the appropriate haptics based on type
     * value passed.
     * @param type - notification type.
     * @since Mini Apps v6.1
     */
    e(this, "notificationOccurredFp");
    /**
     * @see notificationOccurredFp
     */
    e(this, "notificationOccurred");
    /**
     * A method tells that the user has changed a selection. The Telegram app may
     * play the appropriate haptics.
     *
     * Do not use this feedback when the user makes or confirms a selection; use
     * it only when the selection changes.
     * @since Mini Apps v6.1
     */
    e(this, "selectionChangedFp");
    /**
     * @see selectionChangedFp
     */
    e(this, "selectionChanged");
    const a = "web_app_trigger_haptic_feedback", o = E({
      requires: a,
      isTma: r,
      version: n,
      returns: "plain"
    });
    this.isSupported = W(a, n), this.impactOccurredFp = o((p) => t(a, { type: "impact", impact_style: p })), this.notificationOccurredFp = o((p) => t(a, { type: "notification", notification_type: p })), this.selectionChangedFp = o(() => t(a, { type: "selection_change" })), this.impactOccurred = /* @__PURE__ */ h(this.impactOccurredFp), this.notificationOccurred = /* @__PURE__ */ h(this.notificationOccurredFp), this.selectionChanged = /* @__PURE__ */ h(this.selectionChangedFp);
  }
}
function es() {
  return new Xt(u.pipe(
    v(),
    V,
    I
  ));
}
const Wr = /* @__PURE__ */ es();
function ts({ postEvent: s, ...t }) {
  return A(() => s("web_app_add_to_home_screen"), { ...t, requires: "web_app_add_to_home_screen", returns: "either" });
}
// @__NO_SIDE_EFFECTS__
function ss() {
  return ts(u.pipe(
    v(),
    I,
    V
  ));
}
const rs = /* @__PURE__ */ ss(), Hr = /* @__PURE__ */ h(rs);
function ns({ request: s, ...t }) {
  return A((r) => u.pipe(
    s("web_app_check_home_screen", "home_screen_checked", r),
    c.map((n) => n.status || "unknown")
  ), { ...t, requires: "web_app_check_home_screen", returns: "task" });
}
// @__NO_SIDE_EFFECTS__
function is() {
  return ns(u.pipe(
    v(),
    I,
    L
  ));
}
const os = /* @__PURE__ */ is(), Kr = /* @__PURE__ */ h(os);
class as {
  constructor({ retrieveInitData: t }) {
    e(this, "_state", O());
    e(this, "_raw", O());
    /**
     * Complete component state.
     */
    e(this, "state", C(this._state));
    /**
     * @see InitDataType.auth_date
     */
    e(this, "authDate", this.fromState("auth_date"));
    /**
     * @see InitDataType.can_send_after
     */
    e(this, "canSendAfter", this.fromState("can_send_after"));
    /**
     * Date after which it is allowed to call
     * the [answerWebAppQuery](https://core.telegram.org/bots/api#answerwebappquery) method.
     */
    e(this, "canSendAfterDate", C(() => {
      const t = this.authDate(), r = this.canSendAfter();
      return r && t ? new Date(t.getTime() + r * 1e3) : void 0;
    }));
    /**
     * @see InitDataType.chat
     */
    e(this, "chat", this.fromState("chat"));
    /**
     * @see InitDataType.chat_type
     */
    e(this, "chatType", this.fromState("chat_type"));
    /**
     * @see InitDataType.chat_instance
     */
    e(this, "chatInstance", this.fromState("chat_instance"));
    /**
     * @see InitDataType.hash
     */
    e(this, "hash", this.fromState("hash"));
    /**
     * @see InitDataType.query_id
     */
    e(this, "queryId", this.fromState("query_id"));
    /**
     * Raw representation of init data.
     */
    e(this, "raw", C(this._raw));
    /**
     * @see InitDataType.receiver
     */
    e(this, "receiver", this.fromState("receiver"));
    /**
     * @see InitDataType.signature
     */
    e(this, "signature", this.fromState("signature"));
    /**
     * @see InitDataType.start_param
     */
    e(this, "startParam", this.fromState("start_param"));
    /**
     * @see InitDataType.user
     */
    e(this, "user", this.fromState("user"));
    /**
     * Restores the component state.
     */
    e(this, "restoreFp");
    /**
     * @see restoreFp
     */
    e(this, "restore");
    this.restoreFp = () => u.pipe(
      t(),
      b.map(Q.match(() => {
      }, ({ raw: r, obj: n }) => {
        this._state.set(n), this._raw.set(r);
      }))
    ), this.restore = he(this.restoreFp);
  }
  fromState(t) {
    return C(() => {
      const r = this._state();
      return r ? r[t] : void 0;
    });
  }
}
function ps() {
  return new as({
    retrieveInitData() {
      return u.pipe(
        b.Do,
        b.bindW("obj", () => u.pipe(
          ce(),
          b.map(({ tgWebAppData: s }) => s ? Q.some(s) : Q.none)
        )),
        b.bindW("raw", ht),
        b.map(({ obj: s, raw: t }) => u.pipe(
          Q.Do,
          Q.bind("obj", () => s),
          Q.bind("raw", () => t)
        ))
      );
    }
  });
}
const Qr = /* @__PURE__ */ ps();
class us {
  constructor({ version: t, request: r, isTma: n }) {
    /**
     * Signal indicating if any invoice is currently opened.
     */
    e(this, "isOpened");
    /**
     * Signal indicating if the component is supported.
     */
    e(this, "isSupported");
    /**
     * Opens an invoice using its slug or URL.
     * @param slug - invoice slug.
     * @param options - additional options.
     * @since Mini Apps v6.1
     * @example
     * const status = await invoice.openSlug('kJNFS331');
     */
    e(this, "openSlugFp");
    /**
     * @see openSlugFp
     */
    e(this, "openSlug");
    /**
     * Opens an invoice using its URL.
     * @param url - invoice URL.
     * @param options - additional options.
     * @since Mini Apps v6.1
     * @example
     * const status = await invoice.openUrl('https://t.me/$kJNFS331');
     */
    e(this, "openUrlFp");
    /**
     * @see openUrlFp
     */
    e(this, "openUrl");
    const a = E({
      version: t,
      isTma: n,
      requires: "web_app_open_invoice",
      returns: "task"
    }), o = O(!1), p = () => {
      o.set(!1);
    };
    this.isSupported = W("web_app_open_invoice", t), this.isOpened = C(o), this.openSlugFp = a((i, l) => u.pipe(
      this.isOpened() ? c.left(new Ee("Invoice is already opened")) : c.right(void 0),
      c.chain(() => (o.set(!0), r("web_app_open_invoice", "invoice_closed", {
        ...l,
        params: { slug: i },
        capture: (f) => i === f.slug
      }))),
      c.mapBoth((f) => (p(), f), (f) => (p(), f.status))
    )), this.openUrlFp = a((i, l) => {
      const { hostname: f, pathname: F } = new URL(i, window.location.href);
      if (f !== "t.me")
        return c.left(new U(`Link has unexpected hostname: ${f}`));
      const _ = F.match(/^\/(\$|invoice\/)([A-Za-z0-9\-_=]+)$/);
      return _ ? this.openSlugFp(_[2], l) : c.left(new U(
        'Expected to receive a link with a pathname in format "/invoice/{slug}" or "/${slug}"'
      ));
    }), this.openUrl = /* @__PURE__ */ h(this.openUrlFp), this.openSlug = /* @__PURE__ */ h(this.openSlugFp);
  }
}
function cs() {
  return new us(u.pipe(v(), L, I));
}
const zr = /* @__PURE__ */ cs();
function ls({ postEvent: s, ...t }) {
  return A((r, n = {}) => {
    if (typeof r == "string")
      try {
        r = new URL(r);
      } catch (a) {
        return b.left(new U(`"${r.toString()}" is invalid URL`, a));
      }
    return s("web_app_open_link", {
      url: r.toString(),
      try_browser: n.tryBrowser,
      try_instant_view: n.tryInstantView
    });
  }, { ...t, returns: "either" });
}
// @__NO_SIDE_EFFECTS__
function hs() {
  return ls(u.pipe(v(), V));
}
const ds = /* @__PURE__ */ hs(), Nr = /* @__PURE__ */ h(ds);
function _s({ postEvent: s, version: t, ...r }) {
  return A((n) => {
    const a = n.toString();
    return a.match(/^https:\/\/t.me\/.+/) ? ee("web_app_open_tg_link", R(t)) ? (n = new URL(n), s("web_app_open_tg_link", { path_full: n.pathname + n.search })) : (window.location.href = a, b.right(void 0)) : b.left(new U(`"${a}" is invalid URL`));
  }, { ...r, returns: "either" });
}
// @__NO_SIDE_EFFECTS__
function fs() {
  return _s(u.pipe(
    v(),
    V,
    I
  ));
}
const Ze = /* @__PURE__ */ fs(), Jr = /* @__PURE__ */ h(Ze);
function ms({ openTelegramLink: s, ...t }) {
  return A((r, n) => s(
    "https://t.me/share/url?" + new URLSearchParams({ url: r, text: n || "" }).toString().replace(/\+/g, "%20")
  ), { ...t, returns: "either" });
}
// @__NO_SIDE_EFFECTS__
function bs() {
  return ms({
    ...v(),
    openTelegramLink: Ze
  });
}
const gs = /* @__PURE__ */ bs(), Yr = /* @__PURE__ */ h(gs);
function Fs(s) {
  let t = !1, r, n;
  return s.available && (t = !0, r = s.access_requested, n = s.access_granted), {
    available: t,
    accessGranted: n || !1,
    accessRequested: r || !1
  };
}
class ws {
  constructor({
    version: t,
    request: r,
    postEvent: n,
    storage: a,
    isTma: o,
    isPageReload: p
  }) {
    /**
     * Complete location manager state.
     */
    e(this, "state");
    /**
     * Signal indicating whether the location data tracking is currently available.
     */
    e(this, "isAvailable");
    /**
     * Signal indicating whether the user has granted the app permission to track location data.
     */
    e(this, "isAccessGranted");
    /**
     * Signal indicating whether the app has previously requested permission to track location data.
     */
    e(this, "isAccessRequested");
    /**
     * Signal indicating if the component is currently mounted.
     */
    e(this, "isMounted");
    /**
     * Signal indicating if the component is supported.
     */
    e(this, "isSupported");
    /**
     * Opens the location access settings for bots. Useful when you need to request location access
     * from users who haven't granted it yet.
     *
     * Note that this method can be called only in response to user interaction with the Mini App
     * interface (e.g., a click inside the Mini App or on the main button).
     * @since Mini Apps v8.0
     */
    e(this, "openSettingsFp");
    /**
     * @see openSettingsFp
     */
    e(this, "openSettings");
    /**
     * Requests location data.
     * @since Mini Apps v8.0
     * @returns Promise with location data or null it access was not granted.
     */
    e(this, "requestLocationFp");
    /**
     * @see requestLocationFp
     */
    e(this, "requestLocation");
    /**
     * Mounts the component restoring its state.
     * @since Mini Apps v8.0
     */
    e(this, "mountFp");
    /**
     * @see mountFp
     */
    e(this, "mount");
    /**
     * Unmounts the component.
     */
    e(this, "unmount");
    const i = new J({
      initialState: {
        available: !1,
        accessGranted: !1,
        accessRequested: !1
      },
      onChange: a.set
    }), l = new Ae({
      isPageReload: p,
      restoreState: a.get,
      onMounted: i.setState,
      initialState(w) {
        return u.pipe(
          r("web_app_check_location", "location_checked", w),
          c.map(Fs)
        );
      }
    }), f = { version: t, requires: "web_app_check_location", isTma: o }, F = E({
      ...f,
      returns: "either"
    }), _ = E({
      ...f,
      returns: "task"
    }), S = E({
      ...f,
      returns: "task",
      isMounted: l.isMounted
    });
    this.isAvailable = i.getter("available"), this.isAccessRequested = i.getter("accessRequested"), this.isAccessGranted = i.getter("accessGranted"), this.isSupported = W("web_app_check_location", t), this.isMounted = l.isMounted, this.state = i.state, this.unmount = l.unmount, this.mountFp = _(l.mount), this.openSettingsFp = F(() => n("web_app_open_location_settings")), this.requestLocationFp = S((w) => u.pipe(
      r("web_app_request_location", "location_requested", w),
      c.map((k) => {
        if (!k.available)
          return i.setState({ available: !1 }), null;
        const { available: y, ...m } = k;
        return m;
      })
    )), this.mount = /* @__PURE__ */ h(this.mountFp), this.openSettings = /* @__PURE__ */ h(this.openSettingsFp), this.requestLocation = /* @__PURE__ */ h(this.requestLocationFp);
  }
}
function Cs() {
  return new ws(u.pipe(
    v(),
    V,
    I,
    L,
    Y("locationManager")
  ));
}
const Zr = /* @__PURE__ */ Cs();
class Ss {
  constructor({ defaults: t, ...r }) {
    //#region Properties.
    /**
     * The button background color.
     */
    e(this, "bgColor");
    /**
     * True if the button has a shining effect.
     */
    e(this, "hasShineEffect");
    /**
     * True if the button is clickable.
     */
    e(this, "isEnabled");
    /**
     * True if the button loader is visible.
     */
    e(this, "isLoaderVisible");
    /**
     * True if the button is visible.
     */
    e(this, "isVisible");
    /**
     * Signal indicating if the component is currently mounted.
     */
    e(this, "isMounted");
    /**
     * The complete button state.
     */
    e(this, "state");
    /**
     * The button displayed text.
     */
    e(this, "text");
    /**
     * The button text color.
     *
     * Note that this value is computed based on the external defaults. For
     * example, if not explicitly set, this value may be equal to one of theme
     * params colors.
     */
    e(this, "textColor");
    //#endregion
    //#region Methods.
    /**
     * Shows the button.
     */
    e(this, "showFp");
    /**
     * @see showFp
     */
    e(this, "show");
    /**
     * Hides the button.
     */
    e(this, "hideFp");
    /**
     * @see hideFp
     */
    e(this, "hide");
    /**
     * Enables the button.
     */
    e(this, "enableFp");
    /**
     * @see enableFp
     */
    e(this, "enable");
    /**
     * Enables the button.
     */
    e(this, "enableShineEffectFp");
    /**
     * @see enableShineEffectFp
     */
    e(this, "enableShineEffect");
    /**
     * Disables the button.
     */
    e(this, "disableFp");
    /**
     * @see disableFp
     */
    e(this, "disable");
    /**
     * Enables the button.
     */
    e(this, "disableShineEffectFp");
    /**
     * @see disableShineEffectFp
     */
    e(this, "disableShineEffect");
    /**
     * Updates the button background color.
     */
    e(this, "setBgColorFp");
    /**
     * @see setBgColorFp
     */
    e(this, "setBgColor");
    /**
     * Updates the button text color.
     */
    e(this, "setTextColorFp");
    /**
     * @see setTextColorFp
     */
    e(this, "setTextColor");
    /**
     * Updates the button text.
     */
    e(this, "setTextFp");
    /**
     * @see setTextFp
     */
    e(this, "setText");
    /**
     * Shows the button loader.
     */
    e(this, "showLoaderFp");
    /**
     * @see showLoaderFp
     */
    e(this, "showLoader");
    /**
     * Hides the button loader.
     */
    e(this, "hideLoaderFp");
    /**
     * @see hideLoaderFp
     */
    e(this, "hideLoader");
    /**
     * Updates the button state.
     * @param state - updates to apply.
     * @example
     * button.setParams({
     *   text: 'Submit',
     *   isEnabled: true,
     *   hasShineEffect: true,
     * });
     */
    e(this, "setParamsFp");
    e(this, "setParams");
    /**
     * Mounts the component restoring its state.
     */
    e(this, "mountFp");
    /**
     * @see mountFp
     */
    e(this, "mount");
    /**
     * Unmounts the component.
     */
    e(this, "unmount");
    /**
     * Adds a new button listener.
     * @param listener - event listener.
     * @param once - should the listener be called only once.
     * @returns A function to remove bound listener.
     * @example
     * const off = button.onClick(() => {
     *   console.log('User clicked the button');
     *   off();
     * });
     */
    e(this, "onClickFp");
    /**
     * @see onClickFp
     */
    e(this, "onClick");
    /**
     * Removes the button click listener.
     * @param listener - event listener.
     * @param once - should the listener be called only once.
     * @example
     * function listener() {
     *   console.log('User clicked the button');
     *   button.offClick(listener);
     * }
     * button.onClick(listener);
     */
    e(this, "offClickFp");
    /**
     * @see offClickFp
     */
    e(this, "offClick");
    const n = new de({
      ...r,
      version: "100",
      initialState: {
        hasShineEffect: !1,
        isEnabled: !0,
        isLoaderVisible: !1,
        isVisible: !1,
        text: "Continue"
      },
      method: "web_app_setup_main_button",
      payload: (o) => ({
        has_shine_effect: o.hasShineEffect,
        is_visible: o.isVisible,
        is_active: o.isEnabled,
        is_progress_visible: o.isLoaderVisible,
        text: o.text,
        color: o.bgColor,
        text_color: o.textColor
      })
    }), a = (o, p) => {
      const i = n.stateGetter(o);
      return C(() => i() || R(p));
    };
    this.bgColor = a("bgColor", t.bgColor), this.textColor = a("textColor", t.textColor), this.hasShineEffect = n.stateGetter("hasShineEffect"), this.isEnabled = n.stateGetter("isEnabled"), this.isLoaderVisible = n.stateGetter("isLoaderVisible"), this.text = n.stateGetter("text"), this.isVisible = n.stateGetter("isVisible"), this.isMounted = n.isMounted, this.state = n.state, [this.setBgColor, this.setBgColorFp] = n.stateSetters("bgColor"), [this.setTextColor, this.setTextColorFp] = n.stateSetters("textColor"), [
      [this.disableShineEffect, this.disableShineEffectFp],
      [this.enableShineEffect, this.enableShineEffectFp]
    ] = n.stateBoolSetters("hasShineEffect"), [
      [this.disable, this.disableFp],
      [this.enable, this.enableFp]
    ] = n.stateBoolSetters("isEnabled"), [
      [this.hideLoader, this.hideLoaderFp],
      [this.showLoader, this.showLoaderFp]
    ] = n.stateBoolSetters("isLoaderVisible"), [this.setText, this.setTextFp] = n.stateSetters("text"), [[this.hide, this.hideFp], [this.show, this.showFp]] = n.stateBoolSetters("isVisible"), this.setParams = n.setState, this.setParamsFp = n.setStateFp, this.onClick = n.onClick, this.onClickFp = n.onClickFp, this.offClick = n.offClick, this.offClickFp = n.offClickFp, this.mount = n.mount, this.mountFp = n.mountFp, this.unmount = n.unmount;
  }
  //#endregion
}
function Me(s, t) {
  document.documentElement.style.setProperty(s, t);
}
function Ve(s) {
  document.documentElement.style.removeProperty(s);
}
function vs(s) {
  return u.pipe(
    bt(s),
    b.map((t) => Math.sqrt(
      [0.299, 0.587, 0.114].reduce((r, n, a) => {
        const o = parseInt(t.slice(1 + a * 2, 1 + (a + 1) * 2), 16);
        return r + o * o * n;
      }, 0)
    ) < 120)
  );
}
const Xe = he(vs);
class ks {
  constructor({
    initialState: t,
    onChange: r,
    offChange: n,
    isTma: a,
    storage: o,
    isPageReload: p
  }) {
    //#region Colors.
    /**
     * @since v6.10
     */
    e(this, "accentTextColor");
    e(this, "bgColor");
    e(this, "buttonColor");
    e(this, "buttonTextColor");
    /**
     * @since v7.10
     */
    e(this, "bottomBarBgColor");
    e(this, "destructiveTextColor");
    /**
     * @since v6.10
     */
    e(this, "headerBgColor");
    e(this, "hintColor");
    e(this, "linkColor");
    e(this, "secondaryBgColor");
    /**
     * @since v6.10
     */
    e(this, "sectionBgColor");
    /**
     * @since v6.10
     */
    e(this, "sectionHeaderTextColor");
    /**
     * @since v7.6
     */
    e(this, "sectionSeparatorColor");
    /**
     * @since v6.10
     */
    e(this, "subtitleTextColor");
    e(this, "textColor");
    //#endregion
    //#region CSS variables.
    e(this, "_isCssVarsBound", O(!1));
    /**
     * True if CSS variables are currently bound.
     */
    e(this, "isCssVarsBound", C(this._isCssVarsBound));
    /**
     * Creates CSS variables connected with the current theme parameters.
     *
     * By default, created CSS variables names are following the pattern "--tg-theme-{name}", where
     * {name} is a theme parameters key name converted from snake case to kebab case.
     *
     * Default variables:
     * - `--tg-theme-bg-color`
     * - `--tg-theme-secondary-text-color`
     *
     * Variables are being automatically updated if theme parameters were changed.
     *
     * @param getCSSVarName - function, returning complete CSS variable name for the specified
     * theme parameters key.
     * @returns Function to stop updating variables.
     * @throws {CSSVarsBoundError} CSS variables are already bound
     * @example Using custom CSS vars generator
     * themeParams.bindCssVars(key => `--my-prefix-${key}`);
     */
    e(this, "bindCssVarsFp");
    /**
     * @see bindCssVarsFp
     */
    e(this, "bindCssVars");
    //#endregion
    //#region Other public signals.
    /**
     * Complete component state.
     */
    e(this, "state");
    /**
     * @returns True if the current color scheme is recognized as dark.
     * This value is calculated based on the current theme's background color.
     */
    e(this, "isDark", C(() => {
      const t = this.bgColor();
      return !t || Xe(t);
    }));
    //#endregion
    //#region Mounting.
    /**
     * Signal indicating if the component is currently mounted.
     */
    e(this, "isMounted");
    /**
     * Mounts the component restoring its state.
     */
    e(this, "mountFp");
    /**
     * @see mountFp
     */
    e(this, "mount");
    /**
     * Unmounts the component.
     */
    e(this, "unmount");
    const i = new J({
      initialState: {},
      onChange: o.set
    }), l = (w) => {
      i.setState(w.theme_params);
    }, f = new ne({
      initialState: () => b.right(R(t)),
      isPageReload: p,
      onMounted(w) {
        i.setState(w), r(l);
      },
      onUnmounted() {
        n(l);
      },
      restoreState: o.get
    }), F = { isTma: a, returns: "either" }, _ = E(F), S = E({
      ...F,
      isMounted: f.isMounted
    });
    this.accentTextColor = i.getter("accent_text_color"), this.bgColor = i.getter("bg_color"), this.buttonColor = i.getter("button_color"), this.buttonTextColor = i.getter("button_text_color"), this.bottomBarBgColor = i.getter("bottom_bar_bg_color"), this.destructiveTextColor = i.getter("destructive_text_color"), this.headerBgColor = i.getter("header_bg_color"), this.hintColor = i.getter("hint_color"), this.linkColor = i.getter("link_color"), this.secondaryBgColor = i.getter("secondary_bg_color"), this.sectionBgColor = i.getter("section_bg_color"), this.sectionHeaderTextColor = i.getter("section_header_text_color"), this.sectionSeparatorColor = i.getter("section_separator_color"), this.subtitleTextColor = i.getter("subtitle_text_color"), this.textColor = i.getter("text_color"), this.state = i.state, this.isMounted = f.isMounted, this.bindCssVarsFp = S((w) => {
      if (this._isCssVarsBound())
        return b.left(new Ie());
      w || (w = (m) => `--tg-theme-${mt(m)}`);
      const k = (m) => {
        Object.entries(i.state()).forEach(([g, d]) => {
          d && m(g, d);
        });
      }, y = () => {
        k((m, g) => {
          Me(w(m), g);
        });
      };
      return y(), i.state.sub(y), this._isCssVarsBound.set(!0), b.right(() => {
        k(Ve), i.state.unsub(y), this._isCssVarsBound.set(!1);
      });
    }), this.mountFp = _(f.mount), this.unmount = f.unmount, this.bindCssVars = /* @__PURE__ */ h(this.bindCssVarsFp), this.mount = /* @__PURE__ */ h(this.mountFp);
  }
  //#endregion
}
const Se = /* @__PURE__ */ ie({});
function ys() {
  return new ks({
    ...u.pipe(
      v(),
      Y("themeParams")
    ),
    offChange(s) {
      re("theme_changed", s);
    },
    onChange(s) {
      z("theme_changed", s);
    },
    initialState: Se
  });
}
const le = /* @__PURE__ */ ys();
// @__NO_SIDE_EFFECTS__
function et(s, t, r) {
  return u.pipe(
    /* @__PURE__ */ qe(s, t),
    (n) => ({ ...n, defaults: r })
  );
}
const Xr = /* @__PURE__ */ new Ss(
  /* @__PURE__ */ et("mainButton", "main_button_pressed", {
    bgColor: C(() => le.buttonColor() || "#2481cc"),
    textColor: C(() => le.buttonTextColor() || "#ffffff")
  })
);
class Is {
  constructor({
    storage: t,
    isPageReload: r,
    version: n,
    postEvent: a,
    isTma: o,
    theme: p,
    onVisibilityChanged: i,
    offVisibilityChanged: l
  }) {
    //#region Other properties.
    /**
     * Signal indicating if the component is supported.
     */
    e(this, "isSupported");
    /**
     * True if the current Mini App background color is recognized as dark.
     */
    e(this, "isDark", C(() => {
      const t = this.bgColorRgb();
      return t ? Xe(t) : !1;
    }));
    /**
     * Signal indicating if the mini app is currently active.
     */
    e(this, "isActive");
    /**
     * Complete component state.
     */
    e(this, "state");
    //#endregion
    //#region CSS variables.
    /**
     * True if the CSS variables are currently bound.
     */
    e(this, "isCssVarsBound");
    /**
     * Creates CSS variables connected with the mini app.
     *
     * Default variables:
     * - `--tg-bg-color`
     * - `--tg-header-color`
     * - `--tg-bottom-bar-color`
     *
     * Variables are being automatically updated if theme parameters were changed.
     *
     * @param getCSSVarName - function, returning complete CSS variable name for the specified
     * mini app key.
     * @returns Function to stop updating variables.
     * @example Using no arguments
     * miniApp.bindCssVars();
     * @example Using custom CSS vars generator
     * miniApp.bindCssVars(key => `--my-prefix-${key}`);
     */
    e(this, "bindCssVarsFp");
    e(this, "bindCssVars");
    //#endregion
    //#region Mounting.
    /**
     * Signal indicating if the component is mounted.
     */
    e(this, "isMounted");
    /**
     * Mounts the component.
     *
     * This function restores the component state and is automatically saving it in the local storage
     * if it changed.
     * @since Mini Apps v6.1
     */
    e(this, "mountFp");
    /**
     * @see mount
     */
    e(this, "mount");
    /**
     * Unmounts the component.
     */
    e(this, "unmount");
    //#endregion
    //#region Background color.
    /**
     * The Mini App background color.
     *
     * Represents an RGB color, or theme parameters key, like "bg_color", "secondary_bg_color", etc.
     *
     * Note that using a theme parameters key, background color becomes bound to the current
     * theme parameters, making it automatically being updated whenever theme parameters change.
     * In order to remove this bind, use an explicit RGB color.
     */
    e(this, "bgColor");
    /**
     * RGB representation of the background color.
     *
     * This value requires the Theme Params component to be mounted to extract a valid RGB value
     * of the color key.
     */
    e(this, "bgColorRgb");
    /**
     * Updates the mini app background color.
     * @since Mini Apps v6.1
     */
    e(this, "setBgColorFp");
    /**
     * @see setBgColorFp
     */
    e(this, "setBgColor");
    //#endregion
    //#region Header color.
    /**
     * The Mini App header color.
     */
    e(this, "headerColor");
    /**
     * RGB representation of the header color.
     *
     * This value requires the Theme Params component to be mounted to extract a valid RGB value
     * of the color key.
     */
    e(this, "headerColorRgb");
    /**
     * Updates the mini app header color.
     * @since Mini Apps v6.1
     */
    e(this, "setHeaderColorFp");
    /**
     * @see setHeaderColorFp
     */
    e(this, "setHeaderColor");
    //#endregion
    //#region Bottom bar background color.
    /**
     * The Mini App bottom bar background color.
     */
    e(this, "bottomBarColor");
    /**
     * RGB representation of the bottom bar background color.
     *
     * This value requires the Theme Params component to be mounted to extract a valid RGB value
     * of the color key.
     */
    e(this, "bottomBarColorRgb");
    /**
     * Updates the mini app bottom bar bg color.
     * @since Mini Apps v7.10
     */
    e(this, "setBottomBarColorFp");
    /**
     * @see setBottomBarColorFp
     */
    e(this, "setBottomBarColor");
    //#endregion
    //#region Other methods.
    /**
     * Closes the Mini App.
     * @param returnBack - should the client return to the previous activity.
     */
    e(this, "closeFp");
    /**
     * @see closeFp
     */
    e(this, "close");
    /**
     * Informs the Telegram app that the Mini App is ready to be displayed.
     *
     * It is recommended to call this method as early as possible, as soon as all
     * essential interface elements loaded.
     *
     * Once this method is called, the loading placeholder is hidden and the Mini
     * App shown.
     *
     * If the method is not called, the placeholder will be hidden only when the
     * page was fully loaded.
     */
    e(this, "readyFp");
    /**
     * @see readyFp
     */
    e(this, "ready");
    const f = (d) => {
      S.setState({ isActive: d.is_visible });
    }, F = (d) => {
      [
        [this.headerColor, "web_app_set_header_color"],
        [this.bgColor, "web_app_set_background_color"],
        [this.bottomBarColor, "web_app_set_bottom_bar_color"]
      ].forEach(([B, T]) => {
        const M = B();
        if (!_e(M) && (T !== "web_app_set_header_color" || !["bg_color", "secondary_bg_color"].includes(M))) {
          const P = d[M];
          P && a(T, { color: P });
        }
      });
    }, _ = new ne({
      initialState() {
        return b.right({
          bgColor: "bg_color",
          headerColor: "header_bg_color",
          bottomBarColor: "bottom_bar_bg_color",
          isActive: !0
        });
      },
      isPageReload: r,
      onMounted: (d) => {
        i(f), p.sub(F), S.setState(d);
      },
      onUnmounted() {
        l(f), p.unsub(F);
      },
      restoreState: t.get
    });
    this.isMounted = _.isMounted, this.mountFp = A(() => {
      const d = () => {
      };
      return u.pipe(_.mount(), b.match(d, d));
    }, { isTma: o, returns: "plain" }), this.mount = /* @__PURE__ */ h(this.mountFp), this.unmount = _.unmount;
    const S = new J({
      initialState: {
        bgColor: "bg_color",
        bottomBarColor: "bottom_bar_bg_color",
        headerColor: "bg_color",
        isActive: !1
      },
      onChange: t.set
    });
    this.state = S.state;
    const w = (d) => _e(d) ? d : R(p)[d], k = (d) => C(() => w(d()));
    this.isActive = S.getter("isActive"), this.isSupported = C(() => [
      "web_app_set_header_color",
      "web_app_set_background_color",
      "web_app_set_bottom_bar_color"
    ].some((d) => ee(d, R(n))));
    const y = O(!1);
    this.isCssVarsBound = C(y), this.bindCssVarsFp = A((d) => {
      if (y())
        return b.left(new Ie());
      const [B, T] = ke(() => {
        y.set(!1);
      }), M = (P, $) => {
        const j = () => {
          Me(P, $() || null);
        };
        j(), B($.sub(j), Ve.bind(null, P));
      };
      return d || (d = (P) => `--tg-${je(P)}`), M(d("bgColor"), this.bgColorRgb), M(d("bottomBarColor"), this.bottomBarColorRgb), M(d("headerColor"), this.headerColorRgb), y.set(!0), b.right(T);
    }, { isTma: o, returns: "either", isMounted: this.isMounted }), this.bindCssVars = /* @__PURE__ */ h(this.bindCssVarsFp);
    const m = (d) => {
      const B = S.getter(d), T = k(B), M = {
        headerColor: "web_app_set_header_color",
        bgColor: "web_app_set_background_color",
        bottomBarColor: "web_app_set_bottom_bar_color"
      }[d], P = A(
        ($) => {
          if ($ === B())
            return b.right(void 0);
          if (M === "web_app_set_header_color" && ($ === "bg_color" || $ === "secondary_bg_color"))
            return u.pipe(
              a("web_app_set_header_color", { color_key: $ }),
              b.map(() => {
                S.setState({ [d]: $ });
              })
            );
          const j = w($);
          return u.pipe(
            j ? a(M, { color: j }) : b.left(new xt($)),
            b.map(() => {
              S.setState({ [d]: $ });
            })
          );
        },
        {
          isTma: o,
          version: n,
          requires: M,
          isMounted: this.isMounted,
          returns: "either",
          supports: d === "headerColor" ? {
            rgb: {
              method: "web_app_set_header_color",
              param: "color",
              shouldCheck: _e
            }
          } : void 0
        }
      );
      return [B, T, /* @__PURE__ */ h(P), P];
    };
    [
      this.bgColor,
      this.bgColorRgb,
      this.setBgColor,
      this.setBgColorFp
    ] = m("bgColor"), [
      this.headerColor,
      this.headerColorRgb,
      this.setHeaderColor,
      this.setHeaderColorFp
    ] = m("headerColor"), [
      this.bottomBarColor,
      this.bottomBarColorRgb,
      this.setBottomBarColor,
      this.setBottomBarColorFp
    ] = m("bottomBarColor");
    const g = E({ isTma: o, returns: "either" });
    this.closeFp = g((d) => a("web_app_close", { return_back: d })), this.close = /* @__PURE__ */ h(this.closeFp), this.readyFp = g(() => a("web_app_ready")), this.ready = /* @__PURE__ */ h(this.readyFp);
  }
  //#endregion
}
function Es() {
  return new Is({
    ...u.pipe(
      v(),
      V,
      I,
      Y("miniApp")
    ),
    offVisibilityChanged(s) {
      re("visibility_changed", s);
    },
    onVisibilityChanged(s) {
      z("visibility_changed", s);
    },
    theme: le.state
  });
}
const qs = /* @__PURE__ */ Es();
function As(s) {
  const t = s.message.trim(), r = (s.title || "").trim(), n = s.buttons || [];
  if (r.length > 64)
    return b.left(new U(`Invalid title: ${r}`));
  if (!t || t.length > 256)
    return b.left(new U(`Invalid message: ${t}`));
  if (n.length > 3)
    return b.left(new U(`Invalid buttons count: ${n.length}`));
  const a = [];
  if (!n.length)
    a.push({ type: "close", id: "" });
  else
    for (let o = 0; o < n.length; o++) {
      const p = n[o], i = p.id || "";
      if (i.length > 64)
        return b.left(new U(`Button with index ${o} has invalid id: ${i}`));
      if (!p.type || p.type === "default" || p.type === "destructive") {
        const l = p.text.trim();
        if (!l || l.length > 64)
          return b.left(new U(`Button with index ${o} has invalid text: ${l}`));
        a.push({ type: p.type, text: l, id: i });
      } else
        a.push({ type: p.type, id: i });
    }
  return b.right({ title: r, message: t, buttons: a });
}
class Bs {
  constructor({ version: t, isTma: r, request: n }) {
    /**
     * Signal indicating if any popup is currently opened.
     */
    e(this, "isOpened");
    /**
     * Signal indicating if the component is supported.
     */
    e(this, "isSupported");
    /**
     * A method that shows a native popup described by the `params` argument.
     * The promise will be resolved when the popup is closed. Resolved value will have
     * an identifier of the pressed button.
     *
     * If a user clicked outside the popup or clicked the top right popup close
     * button, null will be resolved.
     *
     * @param options - popup parameters.
     * @since Mini Apps v6.2
     * @example
     * fn.pipe(
     *   popup.showFp({
     *     title: 'Confirm action',
     *     message: 'Do you really want to buy this burger?',
     *     buttons: [
     *       { id: 'yes', text: 'Yes' },
     *       { id: 'no', type: 'destructive', text: 'No' },
     *     ],
     *   }),
     *   TE.map(buttonId => {
     *     console.log('User clicked a button with ID', buttonId);
     *   }),
     * );
     */
    e(this, "showFp");
    /**
     * @see showFp
     */
    e(this, "show");
    const a = O(!1), o = () => {
      a.set(!1);
    }, p = E({
      version: t,
      isTma: r,
      requires: "web_app_open_popup",
      returns: "task"
    });
    this.isSupported = W("web_app_open_popup", t), this.isOpened = C(a), this.showFp = p((i) => u.pipe(
      this.isOpened() ? c.left(new Ee("A popup is already opened")) : c.right(void 0),
      c.chainW(() => c.fromEither(As(i))),
      c.chain((l) => (a.set(!0), n("web_app_open_popup", "popup_closed", {
        ...i,
        params: l
      }))),
      c.mapBoth(
        (l) => (o(), l),
        (l) => (o(), l.button_id)
      )
    )), this.show = /* @__PURE__ */ h(this.showFp);
  }
}
function xs() {
  return new Bs(u.pipe(v(), L, I));
}
const en = /* @__PURE__ */ xs();
function Ms({ request: s, ...t }) {
  return A((r) => u.pipe(
    s("web_app_request_phone", "phone_requested", r),
    c.map((n) => n.status)
  ), { ...t, requires: "web_app_request_phone", returns: "task" });
}
// @__NO_SIDE_EFFECTS__
function Vs() {
  return Ms(u.pipe(
    v(),
    I,
    L
  ));
}
const tt = /* @__PURE__ */ Vs(), tn = /* @__PURE__ */ h(tt);
function Ts({
  invokeCustomMethod: s,
  requestPhoneAccess: t,
  ...r
}) {
  const n = (p) => u.pipe(
    s("getRequestedContact", {}, {
      ...p,
      timeout: (p || {}).timeout || 5e3
    }),
    c.chainW((i) => {
      const l = Fe(K(), i);
      if (!l.success)
        return c.left(new pe(i, l.issues));
      if (!l.output)
        return c.right(void 0);
      const f = Fe(
        gt(
          Oe({
            contact: Ft(Oe({
              user_id: Qe(),
              phone_number: K(),
              first_name: K(),
              last_name: St(K())
            })),
            auth_date: We(
              K(),
              He((F) => new Date(Number(F) * 1e3)),
              Ke()
            ),
            hash: K()
          })
        ),
        l.output
      );
      return f.success ? c.right({ raw: l.output, parsed: f.output }) : c.left(new pe(l.output, f.issues));
    })
  ), a = (p) => u.pipe(
    n(p),
    c.match(
      // All other errors except validation ones should be ignored. Receiving validation error
      // means that we have some data, but we are unable to parse it properly. So, there is no
      // need to make some more requests further, the problem is local.
      (i) => pe.is(i) ? b.left(i) : b.right(void 0),
      (i) => b.right(i)
    )
  ), o = (p) => ge(
    async (i, l, f) => {
      let F = 50;
      for (; !f.isRejected; ) {
        const _ = await a(f)();
        if (_._tag === "Left")
          return l(_.left);
        if (_.right)
          return i(_.right);
        await new Promise((S) => setTimeout(S, F)), F += 50;
      }
    },
    p
  );
  return A((p) => ge.fn((i) => u.pipe(
    // Try to get the requested contact. Probably, we already requested it before.
    a(i),
    c.chain((l) => l ? c.right(l) : u.pipe(
      t(i),
      c.chainW((f) => f === "sent" ? o(i) : c.left(new ze("User denied access")))
    ))
  ), p), { ...r, returns: "task", requires: "web_app_request_phone" });
}
// @__NO_SIDE_EFFECTS__
function Ls() {
  return Ts({
    ...u.pipe(v(), xe, I),
    requestPhoneAccess: tt
  });
}
function $s({ requestContact: s, ...t }) {
  return A(
    s,
    { ...t, returns: "task", requires: "web_app_request_phone" }
  );
}
// @__NO_SIDE_EFFECTS__
function Rs() {
  return $s({
    ...u.pipe(v(), I),
    requestContact(s) {
      return u.pipe(
        st(s),
        c.map((t) => t.parsed)
      );
    }
  });
}
const st = /* @__PURE__ */ Ls(), sn = /* @__PURE__ */ h(st), Ps = /* @__PURE__ */ Rs(), rn = /* @__PURE__ */ h(Ps);
function Os({ request: s, ...t }) {
  return A((r) => u.pipe(
    s("web_app_request_write_access", "write_access_requested", r),
    c.map((n) => n.status)
  ), { ...t, requires: "web_app_request_write_access", returns: "task" });
}
// @__NO_SIDE_EFFECTS__
function Ds() {
  return Os(u.pipe(
    v(),
    I,
    L
  ));
}
const Gs = /* @__PURE__ */ Ds(), nn = /* @__PURE__ */ h(Gs);
class js {
  constructor({
    version: t,
    onClosed: r,
    onTextReceived: n,
    isTma: a,
    postEvent: o
  }) {
    /**
     * Signal indicating if the scanner is currently opened.
     */
    e(this, "isOpened");
    /**
     * Signal indicating if the component is supported.
     */
    e(this, "isSupported");
    /**
     * Opens the scanner and returns a task which will be completed with the QR content if the
     * passed `capture` function returned true.
     *
     * Task may also be completed with undefined if the scanner was closed.
     * @param options - method options.
     * @returns A promise with QR content presented as string or undefined if the scanner was closed.
     * @since Mini Apps v6.4
     * @example
     * fn.pipe(
     *   qrScanner.captureFp({
     *     capture(scannedQr) {
     *       return scannedQr === 'any expected by me qr';
     *     }
     *   }),
     *   TE.match(
     *     error => {
     *       console.error(error);
     *     },
     *     qr => {
     *       console.log('My QR:'), qr;
     *     }
     *   ),
     * );
     */
    e(this, "captureFp");
    /**
     * @see captureFp
     */
    e(this, "capture");
    /**
     * Closes the scanner.
     * @since Mini Apps v6.4
     */
    e(this, "closeFp");
    /**
     * @see close
     */
    e(this, "close");
    /**
     * Opens the scanner and returns a task which will be completed when the scanner was closed.
     * @param options - method options.
     * @since Mini Apps v6.4
     * @example Without `capture` option
     * if (qrScanner.open.isAvailable()) {
     *   const qr = await qrScanner.open({ text: 'Scan any QR' });
     * }
     * @example
     * fn.pipe(
     *   qrScanner.openFp({
     *     onCaptured(scannedQr) {
     *       if (scannedQr === 'any expected by me qr') {
     *         qrScanner.close();
     *       }
     *     }
     *   }),
     *   TE.match(
     *     error => {
     *       console.error(error);
     *     },
     *     () => {
     *       console.log('The scanner was closed');
     *     }
     *   ),
     * );
     */
    e(this, "openFp");
    /**
     * @see openFp
     */
    e(this, "open");
    const p = { version: t, requires: "web_app_open_scan_qr_popup", isTma: a }, i = E({ ...p, returns: "either" }), l = E({ ...p, returns: "task" }), f = O(!1), F = () => {
      f.set(!1);
    };
    this.isSupported = W("web_app_open_scan_qr_popup", t), this.isOpened = C(f), this.captureFp = l((_) => {
      let S;
      return u.pipe(
        this.openFp({
          ..._,
          onCaptured: (w) => {
            _.capture(w) && (S = w, this.close());
          }
        }),
        c.map(() => S)
      );
    }), this.closeFp = i(() => u.pipe(o("web_app_close_scan_qr_popup"), b.map(F))), this.openFp = l((_) => u.pipe(
      f() ? c.left(new Ee("The QR Scanner is already opened")) : async () => o("web_app_open_scan_qr_popup", { text: _.text }),
      c.chainW(() => {
        f.set(!0);
        const [S, w] = ke(), k = (y) => (w(), f.set(!1), y);
        return u.pipe(
          ge((y) => {
            S(
              // The scanner was closed externally.
              r(y),
              // The scanner was closed internally.
              f.sub((m) => {
                m || y();
              }),
              n(_.onCaptured)
            );
          }, _),
          c.mapBoth(k, k)
        );
      })
    )), this.open = /* @__PURE__ */ h(this.openFp), this.capture = /* @__PURE__ */ h(this.captureFp), this.close = /* @__PURE__ */ h(this.closeFp);
  }
}
function Us() {
  return new js({
    ...u.pipe(v(), V, I),
    onClosed(s) {
      return z("scan_qr_popup_closed", s);
    },
    onTextReceived(s) {
      return z("qr_text_received", (t) => {
        s(t.data);
      });
    }
  });
}
const on = /* @__PURE__ */ Us();
class Ws {
  constructor({ defaults: t, ...r }) {
    //#region Properties.
    /**
     * Signal indicating if the component is supported.
     */
    e(this, "isSupported");
    /**
     * The button position relative to the main one.
     */
    e(this, "position");
    /**
     * The button background color.
     */
    e(this, "bgColor");
    /**
     * True if the button has a shining effect.
     */
    e(this, "hasShineEffect");
    /**
     * True if the button is clickable.
     */
    e(this, "isEnabled");
    /**
     * True if the button loader is visible.
     */
    e(this, "isLoaderVisible");
    /**
     * True if the button is visible.
     */
    e(this, "isVisible");
    /**
     * Signal indicating if the component is currently mounted.
     */
    e(this, "isMounted");
    /**
     * The complete button state.
     */
    e(this, "state");
    /**
     * The button displayed text.
     */
    e(this, "text");
    /**
     * The button text color.
     *
     * Note that this value is computed based on the external defaults. For
     * example, if not explicitly set, this value may be equal to one of theme
     * params colors.
     */
    e(this, "textColor");
    //#endregion
    //#region Methods.
    /**
     * Shows the button.
     * @since Mini Apps v7.10
     */
    e(this, "showFp");
    /**
     * @see showFp
     */
    e(this, "show");
    /**
     * Hides the button.
     * @since Mini Apps v7.10
     */
    e(this, "hideFp");
    /**
     * @see hideFp
     */
    e(this, "hide");
    /**
     * Enables the button.
     * @since Mini Apps v7.10
     */
    e(this, "enableFp");
    /**
     * @see enableFp
     */
    e(this, "enable");
    /**
     * Enables the button.
     * @since Mini Apps v7.10
     */
    e(this, "enableShineEffectFp");
    /**
     * @see enableShineEffectFp
     */
    e(this, "enableShineEffect");
    /**
     * Disables the button.
     * @since Mini Apps v7.10
     */
    e(this, "disableFp");
    /**
     * @see disableFp
     */
    e(this, "disable");
    /**
     * Enables the button.
     * @since Mini Apps v7.10
     */
    e(this, "disableShineEffectFp");
    /**
     * @see disableShineEffectFp
     */
    e(this, "disableShineEffect");
    /**
     * Updates the button background color.
     * @since Mini Apps v7.10
     */
    e(this, "setBgColorFp");
    /**
     * @see setBgColorFp
     */
    e(this, "setBgColor");
    /**
     * Updates the button text color.
     * @since Mini Apps v7.10
     */
    e(this, "setTextColorFp");
    /**
     * @see setTextColorFp
     */
    e(this, "setTextColor");
    /**
     * Updates the button text.
     * @since Mini Apps v7.10
     */
    e(this, "setTextFp");
    /**
     * @see setTextFp
     */
    e(this, "setText");
    /**
     * Updates the button position.
     * @since Mini Apps v7.10
     */
    e(this, "setPositionFp");
    /**
     * @see setPositionFp
     */
    e(this, "setPosition");
    /**
     * Shows the button loader.
     * @since Mini Apps v7.10
     */
    e(this, "showLoaderFp");
    /**
     * @see showLoaderFp
     */
    e(this, "showLoader");
    /**
     * Hides the button loader.
     * @since Mini Apps v7.10
     */
    e(this, "hideLoaderFp");
    /**
     * @see hideLoaderFp
     */
    e(this, "hideLoader");
    /**
     * Updates the button state.
     * @param state - updates to apply.
     * @since Mini Apps v7.10
     * @example
     * button.setParams({
     *   text: 'Submit',
     *   isEnabled: true,
     *   hasShineEffect: true,
     * });
     */
    e(this, "setParamsFp");
    /**
     * @see setParamsFp
     */
    e(this, "setParams");
    /**
     * Mounts the component restoring its state.
     * @since Mini Apps v7.10
     */
    e(this, "mountFp");
    /**
     * @see mountFp
     */
    e(this, "mount");
    /**
     * Unmounts the component.
     */
    e(this, "unmount");
    /**
     * Adds a new button listener.
     * @param listener - event listener.
     * @param once - should the listener be called only once.
     * @returns A function to remove bound listener.
     * @since Mini Apps v7.10
     * @example
     * const off = button.onClick(() => {
     *   console.log('User clicked the button');
     *   off();
     * });
     */
    e(this, "onClickFp");
    /**
     * @see onClick
     */
    e(this, "onClick");
    /**
     * Removes the button click listener.
     * @param listener - event listener.
     * @param once - should the listener be called only once.
     * @since Mini Apps v7.10
     * @example
     * function listener() {
     *   console.log('User clicked the button');
     *   button.offClick(listener);
     * }
     * button.onClick(listener);
     */
    e(this, "offClickFp");
    /**
     * @see offClick
     */
    e(this, "offClick");
    const n = new de({
      ...r,
      initialState: {
        hasShineEffect: !1,
        isEnabled: !0,
        isLoaderVisible: !1,
        isVisible: !1,
        text: "Cancel",
        position: "left"
      },
      method: "web_app_setup_secondary_button",
      payload: (o) => ({
        has_shine_effect: o.hasShineEffect,
        is_visible: o.isVisible,
        is_active: o.isEnabled,
        is_progress_visible: o.isLoaderVisible,
        text: o.text,
        color: o.bgColor,
        text_color: o.textColor,
        position: o.position
      })
    }), a = (o, p) => {
      const i = n.stateGetter(o);
      return C(() => i() || R(p));
    };
    this.isSupported = W("web_app_setup_secondary_button", r.version), this.bgColor = a("bgColor", t.bgColor), this.textColor = a("textColor", t.textColor), this.position = n.stateGetter("position"), this.hasShineEffect = n.stateGetter("hasShineEffect"), this.isEnabled = n.stateGetter("isEnabled"), this.isLoaderVisible = n.stateGetter("isLoaderVisible"), this.text = n.stateGetter("text"), this.isVisible = n.stateGetter("isVisible"), this.isMounted = n.isMounted, this.state = n.state, [this.setPosition, this.setPositionFp] = n.stateSetters("position"), [this.setBgColor, this.setBgColorFp] = n.stateSetters("bgColor"), [this.setTextColor, this.setTextColorFp] = n.stateSetters("textColor"), [
      [this.disableShineEffect, this.disableShineEffectFp],
      [this.enableShineEffect, this.enableShineEffectFp]
    ] = n.stateBoolSetters("hasShineEffect"), [
      [this.disable, this.disableFp],
      [this.enable, this.enableFp]
    ] = n.stateBoolSetters("isEnabled"), [
      [this.hideLoader, this.hideLoaderFp],
      [this.showLoader, this.showLoaderFp]
    ] = n.stateBoolSetters("isLoaderVisible"), [this.setText, this.setTextFp] = n.stateSetters("text"), [[this.hide, this.hideFp], [this.show, this.showFp]] = n.stateBoolSetters("isVisible"), this.setParams = n.setState, this.setParamsFp = n.setStateFp, this.onClick = n.onClick, this.onClickFp = n.onClickFp, this.offClick = n.offClick, this.offClickFp = n.offClickFp, this.mount = n.mount, this.mountFp = n.mountFp, this.unmount = n.unmount;
  }
  //#endregion
}
function Hs() {
  return new Ws(
    /* @__PURE__ */ et("secondaryButton", "secondary_button_pressed", {
      bgColor: C(() => qs.bottomBarColorRgb() || "#000000"),
      textColor: C(() => le.buttonColor() || "#2481cc")
    })
  );
}
const an = /* @__PURE__ */ Hs();
class Ks {
  constructor({ isTma: t, request: r, version: n, createRequestId: a }) {
    /**
      * Retrieves an item using its key.
      * @since Mini Apps v9.0
      */
    e(this, "getItemFp");
    /**
     * @see getItemFp
     */
    e(this, "getItem");
    /**
     * Restores an item from the storage.
     * @since Mini Apps v9.0
     */
    e(this, "restoreItemFp");
    /**
     * @see restoreItemFp
     */
    e(this, "restoreItem");
    /**
      * Sets a new item in the storage.
      * @since Mini Apps v9.0
      */
    e(this, "setItemFp");
    /**
     * @see setItemFp
     */
    e(this, "setItem");
    /**
      * Removes a key from the storage.
      * @since Mini Apps v9.0
      */
    e(this, "deleteItemFp");
    /**
     * @see deleteItemFp
     */
    e(this, "deleteItem");
    /**
      * Removes all keys from the storage.
      * @since Mini Apps v9.0
      */
    e(this, "clearFp");
    /**
     * @see clearFp
     */
    e(this, "clear");
    const o = E({
      version: n,
      requires: "web_app_secure_storage_get_key",
      isTma: t,
      returns: "task"
    }), p = (i, l, f) => {
      const F = a();
      return u.pipe(
        r(i, ["secure_storage_failed", l], {
          params: { ...f, req_id: F },
          capture: (_) => "payload" in _ ? _.payload.req_id === F : !0
        }),
        c.chain((_) => _.event === "secure_storage_failed" ? c.left(new yt(_.payload.error || "UNKNOWN_ERROR")) : c.right(_.payload))
      );
    };
    this.getItemFp = o((i) => u.pipe(
      p("web_app_secure_storage_get_key", "secure_storage_key_received", { key: i }),
      c.map((l) => ({
        value: l.value,
        canRestore: !!l.can_restore
      }))
    )), this.setItemFp = o((i, l) => u.pipe(
      p("web_app_secure_storage_save_key", "secure_storage_key_saved", { key: i, value: l }),
      c.map(() => {
      })
    )), this.deleteItemFp = o((i) => this.setItemFp(i, null)), this.clearFp = o(() => u.pipe(
      p("web_app_secure_storage_clear", "secure_storage_cleared", {}),
      c.map(() => {
      })
    )), this.restoreItemFp = o((i) => u.pipe(
      p("web_app_secure_storage_restore_key", "secure_storage_key_restored", { key: i }),
      c.map((l) => l.value)
    )), this.getItem = /* @__PURE__ */ h(this.getItemFp), this.setItem = /* @__PURE__ */ h(this.setItemFp), this.deleteItem = /* @__PURE__ */ h(this.deleteItemFp), this.clear = /* @__PURE__ */ h(this.clearFp), this.restoreItem = /* @__PURE__ */ h(this.restoreItemFp);
  }
}
function Qs() {
  return new Ks(u.pipe(
    v(),
    I,
    L,
    Ye
  ));
}
const pn = /* @__PURE__ */ Qs();
class zs {
  constructor(t) {
    /**
     * Signal indicating if the component is currently visible.
     */
    e(this, "isVisible");
    /**
     * Signal indicating if the component is currently mounted.
     */
    e(this, "isMounted");
    /**
     * Signal indicating if the component is supported.
     */
    e(this, "isSupported");
    /**
     * Hides the button.
     * @since Mini Apps v6.10
     */
    e(this, "hideFp");
    /**
     * @see hideFp
     */
    e(this, "hide");
    /**
     * Shows the button.
     * @since Mini Apps v6.10
     */
    e(this, "showFp");
    /**
     * @see showFp
     */
    e(this, "show");
    /**
     * Adds a new button listener.
     * @param listener - event listener.
     * @param once - should the listener be called only once.
     * @returns A function to remove bound listener.
     * @since Mini Apps v6.10
     * @example
     * const off = button.onClick(() => {
     *   console.log('User clicked the button');
     *   off();
     * });
     */
    e(this, "onClickFp");
    /**
     * @see onClickFp
     */
    e(this, "onClick");
    /**
     * Removes the button click listener.
     * @param listener - event listener.
     * @param once - should the listener be called only once.
     * @since Mini Apps v6.10
     * @example
     * function listener() {
     *   console.log('User clicked the button');
     *   button.offClick(listener);
     * }
     * button.onClick(listener);
     */
    e(this, "offClickFp");
    /**
     * @see offClickFp
     */
    e(this, "offClick");
    /**
     * Mounts the component restoring its state.
     * @since Mini Apps v6.10
     */
    e(this, "mountFp");
    /**
     * @see mountFp
     */
    e(this, "mount");
    /**
     * Unmounts the component.
     *
     * Note that this function does not remove listeners added via the `onClick`
     * function, so you have to remove them on your own.
     * @see onClick
     */
    e(this, "unmount");
    const r = new de({
      ...t,
      method: "web_app_setup_settings_button",
      payload: (n) => ({ is_visible: n.isVisible }),
      initialState: { isVisible: !1 }
    });
    this.isVisible = r.stateGetter("isVisible"), this.isMounted = r.isMounted, this.isSupported = r.isSupported, [[this.hide, this.hideFp], [this.show, this.showFp]] = r.stateBoolSetters("isVisible"), this.onClick = r.onClick, this.onClickFp = r.onClickFp, this.offClick = r.offClick, this.offClickFp = r.offClickFp, this.mount = r.mount, this.mountFp = r.mountFp, this.unmount = r.unmount;
  }
}
const un = /* @__PURE__ */ new zs(
  /* @__PURE__ */ qe("settingsButton", "settings_button_pressed")
);
class Ns {
  constructor({ postEvent: t, storage: r, isTma: n, isPageReload: a, version: o }) {
    /**
     * Signal indicating if the component is supported.
     */
    e(this, "isSupported");
    /**
     * Signal indicating if vertical swipes are enabled.
     */
    e(this, "isVerticalEnabled");
    /**
     * Signal indicating if the component is currently mounted.
     */
    e(this, "isMounted");
    /**
     * Mounts the component restoring its state.
     * @since Mini Apps v7.7
     */
    e(this, "mountFp");
    /**
     * @see mountFp
     */
    e(this, "mount");
    /**
     * Unmounts the component.
     */
    e(this, "unmount");
    /**
     * Disables the closing confirmation dialog.
     * @since Mini Apps v7.7
     */
    e(this, "disableVerticalFp");
    /**
     * @see disableVerticalFp
     */
    e(this, "disableVertical");
    /**
     * Enables the closing confirmation dialog.
     * @since Mini Apps v7.7
     */
    e(this, "enableVerticalFp");
    /**
     * @see enableVerticalFp
     */
    e(this, "enableVertical");
    const p = { isVerticalEnabled: !0 }, i = new J({
      initialState: p,
      onChange(w) {
        r.set(w);
      }
    }), l = new ne({
      initialState: p,
      isPageReload: a,
      onMounted: i.setState,
      restoreState: r.get
    }), f = { requires: "web_app_setup_swipe_behavior", isTma: n, version: o }, F = E({
      ...f,
      returns: "plain"
    }), _ = E({
      ...f,
      isMounted: l.isMounted,
      returns: "either"
    }), S = (w) => {
      const k = { isVerticalEnabled: w };
      return i.hasDiff(k) ? u.pipe(
        t("web_app_setup_swipe_behavior", { allow_vertical_swipe: w }),
        b.map(() => {
          i.setState(k);
        })
      ) : b.right(void 0);
    };
    this.isSupported = W("web_app_setup_swipe_behavior", o), this.isVerticalEnabled = i.getter("isVerticalEnabled"), this.isMounted = l.isMounted, this.disableVerticalFp = _(() => S(!1)), this.enableVerticalFp = _(() => S(!0)), this.mountFp = F(() => {
      const w = () => {
      };
      return u.pipe(l.mount(), b.match(w, w));
    }), this.unmount = l.unmount, this.disableVertical = /* @__PURE__ */ h(this.disableVerticalFp), this.enableVertical = /* @__PURE__ */ h(this.enableVerticalFp), this.mount = /* @__PURE__ */ h(this.mountFp);
  }
}
function Js() {
  return new Ns(u.pipe(
    v(),
    V,
    I,
    Y("swipeBehavior")
  ));
}
const cn = /* @__PURE__ */ Js();
async function ln(s) {
  try {
    const { clipboard: r } = navigator;
    if (r)
      return await r.writeText(s);
  } catch {
  }
  const t = document.createElement("textarea");
  t.value = s, t.style.top = "0", t.style.left = "0", t.style.position = "fixed", document.body.appendChild(t), t.focus(), t.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(t);
  }
}
function Ys({ request: s, ...t }) {
  return A((r, n, a) => u.pipe(
    s(
      "web_app_request_file_download",
      "file_download_requested",
      { ...a, params: { url: r, file_name: n } }
    ),
    c.chain((o) => o.status === "downloading" ? c.right(void 0) : c.left(new ze("User denied the action")))
  ), { ...t, requires: "web_app_request_file_download", returns: "task" });
}
// @__NO_SIDE_EFFECTS__
function Zs() {
  return Ys(u.pipe(
    v(),
    L,
    I
  ));
}
const Xs = /* @__PURE__ */ Zs(), hn = /* @__PURE__ */ h(Xs);
function er({ invokeCustomMethod: s, ...t }) {
  return A((r) => u.pipe(
    s("getCurrentTime", {}, r),
    c.chain((n) => {
      const a = Fe(
        We(Qe(), vt(), He((o) => new Date(o * 1e3)), Ke()),
        n
      );
      return a.success ? c.right(a.output) : c.left(new pe(n, a.issues));
    })
  ), { ...t, requires: "web_app_invoke_custom_method", returns: "task" });
}
// @__NO_SIDE_EFFECTS__
function tr() {
  return er(u.pipe(
    v(),
    xe,
    I
  ));
}
const sr = /* @__PURE__ */ tr(), dn = /* @__PURE__ */ h(sr);
function rr({ postEvent: s, ...t }) {
  return A(() => s("web_app_hide_keyboard"), { ...t, returns: "either", requires: "web_app_hide_keyboard" });
}
// @__NO_SIDE_EFFECTS__
function nr() {
  return rr(u.pipe(
    v(),
    V,
    I
  ));
}
const ir = /* @__PURE__ */ nr(), _n = /* @__PURE__ */ h(ir);
function or({ request: s, createRequestId: t, ...r }) {
  return A((n) => {
    const a = t();
    return u.pipe(
      s("web_app_read_text_from_clipboard", "clipboard_text_received", {
        ...n,
        params: { req_id: a },
        capture: dt(a)
      }),
      c.map(({ data: o = null }) => o)
    );
  }, { ...r, requires: "web_app_read_text_from_clipboard", returns: "task" });
}
// @__NO_SIDE_EFFECTS__
function ar() {
  return or({
    ...u.pipe(
      v(),
      I,
      L
    ),
    createRequestId: Be
  });
}
const pr = /* @__PURE__ */ ar(), fn = /* @__PURE__ */ h(pr);
function ur(s) {
  const t = {}, r = s.match(/Telegram-Android(?:\/([^ ]+))?(?: (\([^)]+\))?|$)/);
  if (r) {
    const [, n, a] = r;
    n && (t.appVersion = n), a && a.slice(1, a.length - 1).split(";").forEach((o) => {
      const [p, i] = o.trim().split(" ");
      if (p === "Android")
        t.androidVersion = i;
      else if (p === "SDK") {
        const l = parseInt(i, 10);
        l && (t.sdkVersion = l);
      } else i ? (t.manufacturer = p, t.model = i) : t.performanceClass = p;
    });
  }
  return t;
}
function mn() {
  return ur(navigator.userAgent);
}
function cr({ postEvent: s, ...t }) {
  return A((r) => {
    const { size: n } = new Blob([r]);
    return !n || n > 4096 ? b.left(
      new U(n ? "Maximum size of data to send is 4096 bytes" : "Attempted to send empty data")
    ) : s("web_app_data_send", { data: r });
  }, { ...t, returns: "either" });
}
// @__NO_SIDE_EFFECTS__
function lr() {
  return cr(u.pipe(v(), V));
}
const hr = /* @__PURE__ */ lr(), bn = /* @__PURE__ */ h(hr);
function dr({ request: s, ...t }) {
  return A((r, n) => u.pipe(
    s(
      "web_app_send_prepared_message",
      ["prepared_message_failed", "prepared_message_sent"],
      {
        ...n,
        params: { id: r }
      }
    ),
    c.chain((a) => a.event === "prepared_message_failed" ? c.left(new Bt(a.payload.error)) : c.right(void 0))
  ), { ...t, requires: "web_app_send_prepared_message", returns: "task" });
}
// @__NO_SIDE_EFFECTS__
function _r() {
  return dr(u.pipe(
    v(),
    L,
    I
  ));
}
const fr = /* @__PURE__ */ _r(), gn = /* @__PURE__ */ h(fr);
function mr({ postEvent: s, ...t }) {
  return A((r, n = {}) => s("web_app_share_to_story", {
    text: n.text,
    media_url: r,
    widget_link: n.widgetLink
  }), { ...t, requires: "web_app_share_to_story", returns: "either" });
}
// @__NO_SIDE_EFFECTS__
function br() {
  return mr(u.pipe(
    v(),
    V,
    I
  ));
}
const gr = /* @__PURE__ */ br(), Fn = /* @__PURE__ */ h(gr), ve = /* @__PURE__ */ ie(!1);
function Fr({ isInlineMode: s, postEvent: t, ...r }) {
  return A((n, a) => t("web_app_switch_inline_query", {
    query: n,
    chat_types: a || []
  }), {
    ...r,
    requires: {
      every: ["web_app_switch_inline_query", () => R(s) ? void 0 : "The application must be launched in the inline mode"]
    },
    returns: "either"
  });
}
// @__NO_SIDE_EFFECTS__
function wr() {
  return Fr({
    ...u.pipe(
      v(),
      V,
      I
    ),
    isInlineMode: ve
  });
}
const Cr = /* @__PURE__ */ wr(), wn = /* @__PURE__ */ h(Cr);
class Sr {
  constructor({
    storage: t,
    isPageReload: r,
    onContentSafeAreaInsetsChanged: n,
    onSafeAreaInsetsChanged: a,
    onViewportChanged: o,
    onFullscreenChanged: p,
    offContentSafeAreaInsetsChanged: i,
    offFullscreenChanged: l,
    offSafeAreaInsetsChanged: f,
    offViewportChanged: F,
    request: _,
    isViewportStable: S,
    isFullscreen: w,
    isTma: k,
    version: y,
    postEvent: m
  }) {
    //#region Other properties.
    /**
     * Complete component state.
     */
    e(this, "state");
    /**
     * Signal containing the current height of the **visible area** of the Mini App.
     *
     * The application can display just the top part of the Mini App, with its
     * lower part remaining outside the screen area. From this position, the user
     * can "pull" the Mini App to its maximum height, while the bot can do the same
     * by calling `expand` method. As the position of the Mini App changes, the
     * current height value of the visible area will be updated  in real time.
     *
     * Please note that the refresh rate of this value is not sufficient to
     * smoothly follow the lower border of the window. It should not be used to pin
     * interface elements to the bottom of the visible area. It's more appropriate
     * to use the value of the `stableHeight` field for this purpose.
     *
     * @see stableHeight
     */
    e(this, "height");
    /**
     * Signal containing the height of the visible area of the Mini App in its last stable state.
     *
     * The application can display just the top part of the Mini App, with its
     * lower part remaining outside the screen area. From this position, the user
     * can "pull" the Mini App to its maximum height, while the application can do
     * the same by calling `expand` method.
     *
     * Unlike the value of `height`, the value of `stableHeight` does not change as
     * the position of the Mini App changes with user gestures or during
     * animations. The value of `stableHeight` will be updated after all gestures
     * and animations are completed and the Mini App reaches its final size.
     *
     * @see height
     */
    e(this, "stableHeight");
    /**
     * Signal containing the currently visible area width.
     */
    e(this, "width");
    /**
     * Signal indicating if the Mini App is expanded to the maximum available height. Otherwise,
     * if the Mini App occupies part of the screen and can be expanded to the full
     * height using the `expand` method.
     */
    e(this, "isExpanded");
    /**
     * Signal indicating if the current viewport height is stable and is not going to change in
     * the next moment.
     */
    e(this, "isStable", C(() => this.height() === this.stableHeight()));
    //#endregion
    //#region Content safe area insets.
    /**
     * Signal containing content safe area insets.
     */
    e(this, "contentSafeAreaInsets");
    /**
     * Signal containing top content safe area inset.
     */
    e(this, "contentSafeAreaInsetTop");
    /**
     * Signal containing left content safe area inset.
     */
    e(this, "contentSafeAreaInsetLeft");
    /**
     * Signal containing right content safe area inset.
     */
    e(this, "contentSafeAreaInsetRight");
    /**
     * Signal containing bottom content safe area inset.
     */
    e(this, "contentSafeAreaInsetBottom");
    //#endregion
    //#region Safe area insets.
    /**
     * Signal containing safe area insets.
     */
    e(this, "safeAreaInsets");
    /**
     * Signal containing top safe area inset.
     */
    e(this, "safeAreaInsetTop");
    /**
     * Signal containing left safe area inset.
     */
    e(this, "safeAreaInsetLeft");
    /**
     * Signal containing right safe area inset.
     */
    e(this, "safeAreaInsetRight");
    /**
     * Signal containing bottom safe area inset.
     */
    e(this, "safeAreaInsetBottom");
    //#endregion
    //#region Fullscreen.
    /**
     * Signal indicating if the viewport is currently in fullscreen mode.
     */
    e(this, "isFullscreen");
    /**
     * Requests fullscreen mode for the mini application.
     * @since Mini Apps v8.0
     */
    e(this, "requestFullscreenFp");
    /**
     * @see requestFullscreenFp
     */
    e(this, "requestFullscreen");
    /**
     * Exits mini application from the fullscreen mode.
     * @since Mini Apps v8.0
     */
    e(this, "exitFullscreenFp");
    /**
     * @see exitFullscreenFp
     */
    e(this, "exitFullscreen");
    //#endregion
    //#region CSS Vars.
    /**
     * Signal indicating if CSS variables are bound.
     */
    e(this, "isCssVarsBound");
    /**
     * Creates CSS variables connected with the current viewport.
     *
     * By default, created CSS variables names are following the pattern "--tg-theme-{name}", where
     * {name} is a viewport property name converted from camel case to kebab case.
     *
     * Default variables:
     * - `--tg-viewport-height`
     * - `--tg-viewport-width`
     * - `--tg-viewport-stable-height`
     * - `--tg-viewport-content-safe-area-inset-top`
     * - `--tg-viewport-content-safe-area-inset-bottom`
     * - `--tg-viewport-content-safe-area-inset-left`
     * - `--tg-viewport-content-safe-area-inset-right`
     * - `--tg-viewport-safe-area-inset-top`
     * - `--tg-viewport-safe-area-inset-bottom`
     * - `--tg-viewport-safe-area-inset-left`
     * - `--tg-viewport-safe-area-inset-right`
     *
     * Variables are being automatically updated if the viewport was changed.
     *
     * @param getCSSVarName - function, returning computed complete CSS variable name. The CSS
     * variable will only be defined if the function returned non-empty string value.
     * @returns Function to stop updating variables.
     * @example Using no arguments
     * bindCssVarsFp();
     * @example Using custom CSS vars generator
     * bindCssVarsFp(key => `--my-prefix-${key}`);
     */
    e(this, "bindCssVarsFp");
    /**
     * @see bindCssVarsFp
     */
    e(this, "bindCssVars");
    //#endregion
    //#region Mount.
    /**
     * Signal indicating if the component is currently mounted.
     */
    e(this, "isMounted");
    /**
     * Mounts the component.
     */
    e(this, "mountFp");
    /**
     * @see mountFp
     */
    e(this, "mount");
    //#endregion
    //#region Other methods.
    /**
     * A method that expands the Mini App to the maximum available height. To find
     * out if the Mini App is expanded to the maximum height, refer to the value of
     * the `isExpanded`.
     */
    e(this, "expandFp");
    /**
     * @see expandFp
     */
    e(this, "expand");
    const g = { top: 0, right: 0, left: 0, bottom: 0 }, d = new J({
      initialState: {
        contentSafeAreaInsets: g,
        height: 0,
        isExpanded: !1,
        isFullscreen: !1,
        safeAreaInsets: g,
        stableHeight: 0,
        width: 0
      },
      onChange: t.set
    }), B = (q) => {
      d.setState({
        isExpanded: q.is_expanded,
        height: q.height,
        width: q.width,
        stableHeight: q.is_state_stable ? q.height : void 0
      });
    }, T = (q) => {
      d.setState({ isFullscreen: q.is_fullscreen });
    }, M = (q) => {
      d.setState({ safeAreaInsets: q });
    }, P = (q) => {
      d.setState({ contentSafeAreaInsets: q });
    }, $ = new Ae({
      initialState(q) {
        const Z = (H) => () => {
          const [N, D] = H === "safe-area" ? ["web_app_request_safe_area", "safe_area_changed"] : ["web_app_request_content_safe_area", "content_safe_area_changed"];
          return ee(N, R(y)) ? _(N, D, q) : c.right({ top: 0, left: 0, right: 0, bottom: 0 });
        }, x = (H) => () => typeof H == "boolean" ? c.right(H) : c.fromEither(H());
        return u.pipe(
          c.Do,
          c.bindW("safeAreaInsets", Z("safe-area")),
          c.bindW("contentSafeAreaInsets", Z("content-safe-area")),
          c.bindW("isFullscreen", x(w)),
          c.bindW("isViewportStable", x(S)),
          c.chainW(({ isViewportStable: H, ...N }) => H ? c.right({
            ...N,
            height: window.innerHeight,
            isExpanded: !0,
            stableHeight: window.innerHeight,
            width: window.innerWidth
          }) : u.pipe(
            _("web_app_request_viewport", "viewport_changed", q),
            c.map((D) => ({
              ...N,
              height: D.height,
              isExpanded: D.is_expanded,
              stableHeight: D.is_state_stable ? D.height : 0,
              width: D.width
            }))
          ))
        );
      },
      isPageReload: r,
      onMounted(q) {
        o(B), p(T), a(M), n(P), d.setState(q);
      },
      onUnmounted() {
        F(B), l(T), f(M), i(P);
      },
      restoreState: t.get
    }), j = (q) => C(() => this.safeAreaInsets()[q]), oe = (q) => C(() => this.contentSafeAreaInsets()[q]);
    this.state = d.state, this.height = d.getter("height"), this.stableHeight = d.getter("stableHeight"), this.width = d.getter("width"), this.isExpanded = d.getter("isExpanded"), this.safeAreaInsets = d.getter("safeAreaInsets"), this.safeAreaInsetTop = j("top"), this.safeAreaInsetBottom = j("bottom"), this.safeAreaInsetLeft = j("left"), this.safeAreaInsetRight = j("right"), this.contentSafeAreaInsets = d.getter("contentSafeAreaInsets"), this.contentSafeAreaInsetTop = oe("top"), this.contentSafeAreaInsetBottom = oe("bottom"), this.contentSafeAreaInsetLeft = oe("left"), this.contentSafeAreaInsetRight = oe("right");
    const rt = E({ isTma: k, returns: "task" }), Te = E({
      isTma: k,
      returns: "either"
    }), nt = E({
      isTma: k,
      requires: "web_app_request_fullscreen",
      version: y,
      returns: "task"
    }), Le = (q) => nt((Z) => u.pipe(
      _(
        q ? "web_app_request_fullscreen" : "web_app_exit_fullscreen",
        ["fullscreen_changed", "fullscreen_failed"],
        Z
      ),
      c.chain((x) => x.event === "fullscreen_failed" && x.payload.error !== "ALREADY_FULLSCREEN" ? c.left(new At(x.payload.error)) : (d.setState({
        isFullscreen: "is_fullscreen" in x.payload ? x.payload.is_fullscreen : !0
      }), c.right(void 0)))
    ));
    this.isMounted = $.isMounted, this.mountFp = rt($.mount), this.mount = /* @__PURE__ */ h(this.mountFp), this.isFullscreen = d.getter("isFullscreen"), this.requestFullscreenFp = Le(!0), this.requestFullscreen = /* @__PURE__ */ h(this.requestFullscreenFp), this.exitFullscreenFp = Le(!1), this.exitFullscreen = /* @__PURE__ */ h(this.exitFullscreenFp);
    const ae = O(!1);
    this.isCssVarsBound = C(ae), this.bindCssVarsFp = Te(
      (q) => {
        if (ae())
          return b.left(new Ie());
        q || (q = (x) => `--tg-viewport-${je(x)}`);
        const Z = [
          ["height", this.height],
          ["stableHeight", this.stableHeight],
          ["width", this.width],
          ["safeAreaInsetTop", this.safeAreaInsetTop],
          ["safeAreaInsetBottom", this.safeAreaInsetBottom],
          ["safeAreaInsetLeft", this.safeAreaInsetLeft],
          ["safeAreaInsetRight", this.safeAreaInsetRight],
          ["contentSafeAreaInsetTop", this.contentSafeAreaInsetTop],
          ["contentSafeAreaInsetBottom", this.contentSafeAreaInsetBottom],
          ["contentSafeAreaInsetLeft", this.contentSafeAreaInsetLeft],
          ["contentSafeAreaInsetRight", this.contentSafeAreaInsetRight]
        ].reduce((x, [H, N]) => {
          const D = q(H);
          if (D) {
            const $e = () => {
              Me(D, `${N()}px`);
            };
            x.push({ update: $e, removeListener: N.sub($e), cssVar: D });
          }
          return x;
        }, []);
        return Z.forEach((x) => {
          x.update();
        }), ae.set(!0), b.right(() => {
          Z.forEach((x) => {
            x.removeListener(), Ve(x.cssVar);
          }), ae.set(!1);
        });
      }
    ), this.bindCssVars = /* @__PURE__ */ h(this.bindCssVarsFp), this.expandFp = Te(() => m("web_app_expand")), this.expand = /* @__PURE__ */ h(this.expandFp);
  }
  //#endregion
}
function vr() {
  const s = (o) => ({
    on: (p) => {
      z(o, p);
    },
    off: (p) => {
      re(o, p);
    }
  }), t = s("viewport_changed"), r = s("fullscreen_changed"), n = s("safe_area_changed"), a = s("content_safe_area_changed");
  return new Sr({
    ...u.pipe(
      v(),
      Y("viewport"),
      I,
      V,
      L
    ),
    isFullscreen() {
      return u.pipe(ce(), b.map((o) => !!o.tgWebAppFullscreen));
    },
    isViewportStable() {
      return u.pipe(ce(), b.map((o) => ["macos", "tdesktop", "unigram", "webk", "weba", "web"].includes(o.tgWebAppPlatform)));
    },
    offContentSafeAreaInsetsChanged: a.off,
    offFullscreenChanged: r.off,
    offSafeAreaInsetsChanged: n.off,
    offViewportChanged: t.off,
    onContentSafeAreaInsetsChanged: a.on,
    onFullscreenChanged: r.on,
    onSafeAreaInsetsChanged: n.on,
    onViewportChanged: t.on
  });
}
const Cn = /* @__PURE__ */ vr();
function kr(s = {}) {
  const {
    version: t,
    isInlineMode: r,
    themeParams: n
  } = s;
  if (t && typeof r == "boolean" && n)
    Ce.set(t), ve.set(r), Se.set(n);
  else {
    const i = u.pipe(ce(), b.matchW(
      (l) => l,
      (l) => {
        Ce.set(t || l.tgWebAppVersion), ve.set(typeof r == "boolean" ? r : !!l.tgWebAppBotInline), Se.set(n || l.tgWebAppThemeParams);
      }
    ));
    if (i)
      return b.left(i);
  }
  s.postEvent && Ne.set(s.postEvent);
  const [a, o] = ke(
    z("reload_iframe", () => {
      Re().log("Received a request to reload the page"), Vt("iframe_will_reload"), window.location.reload();
    })
  ), { acceptCustomStyles: p = !0 } = s;
  if (p) {
    const i = document.createElement("style");
    i.id = "telegram-custom-styles", document.head.appendChild(i), a(
      z("set_custom_style", (l) => {
        i.innerHTML = l;
      }),
      () => {
        document.head.removeChild(i);
      }
    );
  }
  return u.pipe(
    se("iframe_ready", { reload_supported: !0 }),
    b.map(() => (Re().log("The package was initialized"), o))
  );
}
const Sn = he(kr);
export {
  ze as AccessDeniedError,
  Mt as BackButton,
  Rt as Biometry,
  Ie as CSSVarsBoundError,
  yn as CancelledError,
  Dt as ClosingBehavior,
  jt as CloudStorage,
  Ee as ConcurrentCallError,
  Ht as DeviceStorage,
  kt as DeviceStorageMethodError,
  At as FullscreenFailedError,
  Et as FunctionUnavailableError,
  Xt as HapticFeedback,
  as as InitData,
  U as InvalidArgumentsError,
  Tr as InvalidEnvError,
  In as InvalidLaunchParamsError,
  us as Invoice,
  En as InvokeCustomMethodFailedError,
  qn as LaunchParamsRetrieveError,
  ws as LocationManager,
  Ss as MainButton,
  An as MethodParameterUnsupportedError,
  Bn as MethodUnsupportedError,
  Is as MiniApp,
  It as NotAvailableError,
  Bs as Popup,
  js as QrScanner,
  Ws as SecondaryButton,
  Ks as SecureStorage,
  yt as SecureStorageMethodError,
  qt as SetEmojiStatusError,
  zs as SettingsButton,
  Bt as ShareMessageError,
  Ns as SwipeBehavior,
  ks as ThemeParams,
  xn as TimeoutError,
  Mn as UnknownEnvError,
  xt as UnknownThemeParamsKeyError,
  pe as ValidationError,
  Sr as Viewport,
  Hr as addToHomeScreen,
  rs as addToHomeScreenFp,
  Vn as applyPolyfills,
  Lr as backButton,
  Pr as biometry,
  Kr as checkHomeScreenStatus,
  os as checkHomeScreenStatusFp,
  Or as closingBehavior,
  Dr as cloudStorage,
  ln as copyTextToClipboard,
  Tn as createLogger,
  Ln as createPostEvent,
  Be as createRequestId,
  $n as createStartParam,
  Rn as createStartParamFp,
  Pn as debug,
  On as decodeBase64Url,
  Dn as decodeBase64UrlFp,
  Gn as decodeStartParam,
  jn as decodeStartParamFp,
  Un as deepSnakeToCamelObjKeys,
  Gr as deviceStorage,
  hn as downloadFile,
  Xs as downloadFileFp,
  Wn as emitEvent,
  Hn as encodeBase64Url,
  dn as getCurrentTime,
  sr as getCurrentTimeFp,
  Kn as getReleaseVersion,
  Wr as hapticFeedback,
  _n as hideKeyboard,
  ir as hideKeyboardFp,
  Sn as init,
  Qr as initData,
  kr as initFp,
  zr as invoice,
  Ut as invokeCustomMethod,
  hi as isAnyRGB,
  Xe as isColorDark,
  vs as isColorDarkFp,
  di as isRGB,
  _i as isRGBA,
  fi as isRGBAShort,
  mi as isRGBShort,
  Qn as isSafeToCreateStartParam,
  zn as isTMA,
  Nn as isTMAFp,
  Zr as locationManager,
  Jn as logger,
  Xr as mainButton,
  qs as miniApp,
  Yn as mockTelegramEnv,
  Zn as off,
  Xn as offAll,
  ei as on,
  Nr as openLink,
  ds as openLinkFp,
  Jr as openTelegramLink,
  Ze as openTelegramLinkFp,
  bi as parseInitDataQuery,
  gi as parseInitDataQueryFp,
  Fi as parseLaunchParamsQuery,
  wi as parseLaunchParamsQueryFp,
  en as popup,
  Vt as postEvent,
  se as postEventFp,
  on as qrScanner,
  fn as readTextFromClipboard,
  pr as readTextFromClipboardFp,
  $r as request,
  Rr as request2,
  Je as request2Fp,
  rn as requestContact,
  sn as requestContactComplete,
  st as requestContactCompleteFp,
  Ps as requestContactFp,
  jr as requestEmojiStatusAccess,
  Nt as requestEmojiStatusAccessFp,
  Pt as requestFp,
  tn as requestPhoneAccess,
  tt as requestPhoneAccessFp,
  nn as requestWriteAccess,
  Gs as requestWriteAccessFp,
  mn as retrieveAndroidDeviceData,
  ur as retrieveAndroidDeviceDataFrom,
  ti as retrieveLaunchParams,
  si as retrieveLaunchParamsFp,
  ri as retrieveRawInitData,
  ni as retrieveRawInitDataFp,
  ii as retrieveRawLaunchParams,
  oi as retrieveRawLaunchParamsFp,
  an as secondaryButton,
  pn as secureStorage,
  bn as sendData,
  hr as sendDataFp,
  Ci as serializeInitDataQuery,
  Si as serializeLaunchParamsQuery,
  ai as setDebug,
  Ur as setEmojiStatus,
  Zt as setEmojiStatusFp,
  pi as setTargetOrigin,
  un as settingsButton,
  gn as shareMessage,
  fr as shareMessageFp,
  Fn as shareStory,
  gr as shareStoryFp,
  Yr as shareURL,
  gs as shareURLFp,
  ui as supports,
  cn as swipeBehavior,
  wn as switchInlineQuery,
  Cr as switchInlineQueryFp,
  ci as targetOrigin,
  le as themeParams,
  vi as toRGB,
  ki as toRGBFp,
  yi as toRGBFull,
  Ii as toRGBFullFp,
  Cn as viewport
};
//# sourceMappingURL=index.js.map
