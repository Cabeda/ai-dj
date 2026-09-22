// @bun
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  if (mod && typeof mod === "object" || typeof mod === "function") {
    for (let key of __getOwnPropNames(mod))
      if (!__hasOwnProp.call(to, key))
        __defProp(to, key, {
          get: __accessProp.bind(mod, key),
          enumerable: true
        });
  }
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};
var __esm = (fn, res, err) => () => {
  if (fn)
    try {
      res = fn(fn = 0);
    } catch (e) {
      err = [e];
    }
  if (err)
    throw err[0];
  return res;
};
var __exportCjs = (target, getters, setters) => {
  for (var name in getters)
    __defProp(target, name, {
      get: getters[name],
      set: setters[name],
      enumerable: true,
      configurable: true
    });
};

// node_modules/fraction.js/dist/fraction.mjs
function assign(n, s) {
  try {
    n = BigInt(n);
  } catch (e) {
    throw InvalidParameter();
  }
  return n * s;
}
function ifloor(x) {
  return typeof x === "bigint" ? x : Math.floor(x);
}
function newFraction(n, d) {
  if (d === C_ZERO) {
    throw DivisionByZero();
  }
  const f = Object.create(Fraction.prototype);
  f["s"] = n < C_ZERO ? -C_ONE : C_ONE;
  n = n < C_ZERO ? -n : n;
  const a = gcd(n, d);
  f["n"] = n / a;
  f["d"] = d / a;
  return f;
}
function factorize(n) {
  const factors = Object.create(null);
  if (n <= C_ONE) {
    factors[n] = C_ONE;
    return factors;
  }
  const add2 = (p) => {
    factors[p] = (factors[p] || C_ZERO) + C_ONE;
  };
  while (n % C_TWO === C_ZERO) {
    add2(C_TWO);
    n /= C_TWO;
  }
  while (n % C_THREE === C_ZERO) {
    add2(C_THREE);
    n /= C_THREE;
  }
  while (n % C_FIVE === C_ZERO) {
    add2(C_FIVE);
    n /= C_FIVE;
  }
  for (let si = 0, p = C_TWO + C_FIVE;p * p <= n; ) {
    while (n % p === C_ZERO) {
      add2(p);
      n /= p;
    }
    p += FACTORSTEPS[si];
    si = si + 1 & 7;
  }
  if (n > C_ONE)
    add2(n);
  return factors;
}
function modpow(b, e, m) {
  let r = C_ONE;
  for (;e > C_ZERO; b = b * b % m, e >>= C_ONE) {
    if (e & C_ONE) {
      r = r * b % m;
    }
  }
  return r;
}
function cycleLen(n, d) {
  for (;d % C_TWO === C_ZERO; d /= C_TWO) {}
  for (;d % C_FIVE === C_ZERO; d /= C_FIVE) {}
  if (d === C_ONE)
    return C_ZERO;
  let rem = C_TEN % d;
  let t = 1;
  for (;rem !== C_ONE; t++) {
    rem = rem * C_TEN % d;
    if (t > MAX_CYCLE_LEN)
      return C_ZERO;
  }
  return BigInt(t);
}
function cycleStart(n, d, len) {
  let rem1 = C_ONE;
  let rem2 = modpow(C_TEN, len, d);
  for (let t = 0;t < 300; t++) {
    if (rem1 === rem2)
      return BigInt(t);
    rem1 = rem1 * C_TEN % d;
    rem2 = rem2 * C_TEN % d;
  }
  return 0;
}
function gcd(a, b) {
  if (!a)
    return b;
  if (!b)
    return a;
  while (true) {
    a %= b;
    if (!a)
      return b;
    b %= a;
    if (!b)
      return a;
  }
}
function Fraction(a, b) {
  parse(a, b);
  if (this instanceof Fraction) {
    a = gcd(P["d"], P["n"]);
    this["s"] = P["s"];
    this["n"] = P["n"] / a;
    this["d"] = P["d"] / a;
  } else {
    return newFraction(P["s"] * P["n"], P["d"]);
  }
}
var C_ZERO, C_ONE, C_TWO, C_THREE, C_FIVE, C_TEN, MAX_INTEGER, MAX_CYCLE_LEN = 2000, P, FACTORSTEPS, parse = function(p1, p2) {
  let n = C_ZERO, d = C_ONE, s = C_ONE;
  if (p1 === undefined || p1 === null) {} else if (p2 !== undefined) {
    if (typeof p1 === "bigint") {
      n = p1;
    } else if (isNaN(p1)) {
      throw InvalidParameter();
    } else if (p1 % 1 !== 0) {
      throw NonIntegerParameter();
    } else {
      n = BigInt(p1);
    }
    if (typeof p2 === "bigint") {
      d = p2;
    } else if (isNaN(p2)) {
      throw InvalidParameter();
    } else if (p2 % 1 !== 0) {
      throw NonIntegerParameter();
    } else {
      d = BigInt(p2);
    }
    s = n * d;
  } else if (typeof p1 === "object") {
    if ("d" in p1 && "n" in p1) {
      n = BigInt(p1["n"]);
      d = BigInt(p1["d"]);
      if ("s" in p1)
        n *= BigInt(p1["s"]);
    } else if (0 in p1) {
      n = BigInt(p1[0]);
      if (1 in p1)
        d = BigInt(p1[1]);
    } else if (typeof p1 === "bigint") {
      n = p1;
    } else {
      throw InvalidParameter();
    }
    s = n * d;
  } else if (typeof p1 === "number") {
    if (isNaN(p1)) {
      throw InvalidParameter();
    }
    if (p1 < 0) {
      s = -C_ONE;
      p1 = -p1;
    }
    if (p1 % 1 === 0) {
      n = BigInt(p1);
    } else {
      let z = 1;
      let A = 0, B = 1;
      let C = 1, D = 1;
      let N = 1e7;
      if (p1 >= 1) {
        z = 10 ** Math.floor(1 + Math.log10(p1));
        p1 /= z;
      }
      while (B <= N && D <= N) {
        let M = (A + C) / (B + D);
        if (p1 === M) {
          if (B + D <= N) {
            n = A + C;
            d = B + D;
          } else if (D > B) {
            n = C;
            d = D;
          } else {
            n = A;
            d = B;
          }
          break;
        } else {
          if (p1 > M) {
            A += C;
            B += D;
          } else {
            C += A;
            D += B;
          }
          if (B > N) {
            n = C;
            d = D;
          } else {
            n = A;
            d = B;
          }
        }
      }
      n = BigInt(n) * BigInt(z);
      d = BigInt(d);
    }
  } else if (typeof p1 === "string") {
    let ndx = 0;
    let v = C_ZERO, w = C_ZERO, x = C_ZERO, y = C_ONE, z = C_ONE;
    let match = p1.replace(/_/g, "").match(/\d+|./g);
    if (match === null)
      throw InvalidParameter();
    if (match[ndx] === "-") {
      s = -C_ONE;
      ndx++;
    } else if (match[ndx] === "+") {
      ndx++;
    }
    if (match.length === ndx + 1) {
      w = assign(match[ndx++], s);
    } else if (match[ndx + 1] === "." || match[ndx] === ".") {
      if (match[ndx] !== ".") {
        v = assign(match[ndx++], s);
      }
      ndx++;
      if (ndx + 1 === match.length || match[ndx + 1] === "(" && match[ndx + 3] === ")" || match[ndx + 1] === "'" && match[ndx + 3] === "'") {
        w = assign(match[ndx], s);
        y = C_TEN ** BigInt(match[ndx].length);
        ndx++;
      }
      if (match[ndx] === "(" && match[ndx + 2] === ")" || match[ndx] === "'" && match[ndx + 2] === "'") {
        x = assign(match[ndx + 1], s);
        z = C_TEN ** BigInt(match[ndx + 1].length) - C_ONE;
        ndx += 3;
      }
    } else if (match[ndx + 1] === "/" || match[ndx + 1] === ":") {
      w = assign(match[ndx], s);
      y = assign(match[ndx + 2], C_ONE);
      ndx += 3;
    } else if (match[ndx + 3] === "/" && match[ndx + 1] === " ") {
      v = assign(match[ndx], s);
      w = assign(match[ndx + 2], s);
      y = assign(match[ndx + 4], C_ONE);
      ndx += 5;
    }
    if (match.length <= ndx) {
      d = y * z;
      s = n = x + d * v + z * w;
    } else {
      throw InvalidParameter();
    }
  } else if (typeof p1 === "bigint") {
    n = p1;
    s = p1;
    d = C_ONE;
  } else {
    throw InvalidParameter();
  }
  if (d === C_ZERO) {
    throw DivisionByZero();
  }
  P["s"] = s < C_ZERO ? -C_ONE : C_ONE;
  P["n"] = n < C_ZERO ? -n : n;
  P["d"] = d < C_ZERO ? -d : d;
}, DivisionByZero = function() {
  return new Error("Division by Zero");
}, InvalidParameter = function() {
  return new Error("Invalid argument");
}, NonIntegerParameter = function() {
  return new Error("Parameters must be integer");
};
var init_fraction = __esm(() => {
  if (typeof BigInt === "undefined")
    BigInt = function(n) {
      if (isNaN(n))
        throw new Error("");
      return n;
    };
  C_ZERO = BigInt(0);
  C_ONE = BigInt(1);
  C_TWO = BigInt(2);
  C_THREE = BigInt(3);
  C_FIVE = BigInt(5);
  C_TEN = BigInt(10);
  MAX_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);
  P = {
    s: C_ONE,
    n: C_ZERO,
    d: C_ONE
  };
  FACTORSTEPS = [C_TWO * C_TWO, C_TWO, C_TWO * C_TWO, C_TWO, C_TWO * C_TWO, C_TWO * C_THREE, C_TWO, C_TWO * C_THREE];
  Fraction.prototype = {
    s: C_ONE,
    n: C_ZERO,
    d: C_ONE,
    abs: function() {
      return newFraction(this["n"], this["d"]);
    },
    neg: function() {
      return newFraction(-this["s"] * this["n"], this["d"]);
    },
    add: function(a, b) {
      parse(a, b);
      return newFraction(this["s"] * this["n"] * P["d"] + P["s"] * this["d"] * P["n"], this["d"] * P["d"]);
    },
    sub: function(a, b) {
      parse(a, b);
      return newFraction(this["s"] * this["n"] * P["d"] - P["s"] * this["d"] * P["n"], this["d"] * P["d"]);
    },
    mul: function(a, b) {
      parse(a, b);
      return newFraction(this["s"] * P["s"] * this["n"] * P["n"], this["d"] * P["d"]);
    },
    div: function(a, b) {
      parse(a, b);
      return newFraction(this["s"] * P["s"] * this["n"] * P["d"], this["d"] * P["n"]);
    },
    clone: function() {
      return newFraction(this["s"] * this["n"], this["d"]);
    },
    mod: function(a, b) {
      if (a === undefined) {
        return newFraction(this["s"] * this["n"] % this["d"], C_ONE);
      }
      parse(a, b);
      if (C_ZERO === P["n"] * this["d"]) {
        throw DivisionByZero();
      }
      return newFraction(this["s"] * (P["d"] * this["n"]) % (P["n"] * this["d"]), P["d"] * this["d"]);
    },
    gcd: function(a, b) {
      parse(a, b);
      return newFraction(gcd(P["n"], this["n"]) * gcd(P["d"], this["d"]), P["d"] * this["d"]);
    },
    lcm: function(a, b) {
      parse(a, b);
      if (P["n"] === C_ZERO && this["n"] === C_ZERO) {
        return newFraction(C_ZERO, C_ONE);
      }
      return newFraction(P["n"] * this["n"], gcd(P["n"], this["n"]) * gcd(P["d"], this["d"]));
    },
    inverse: function() {
      return newFraction(this["s"] * this["d"], this["n"]);
    },
    pow: function(a, b) {
      parse(a, b);
      if (P["d"] === C_ONE) {
        if (P["s"] < C_ZERO) {
          return newFraction((this["s"] * this["d"]) ** P["n"], this["n"] ** P["n"]);
        } else {
          return newFraction((this["s"] * this["n"]) ** P["n"], this["d"] ** P["n"]);
        }
      }
      if (this["s"] < C_ZERO)
        return null;
      let N = factorize(this["n"]);
      let D = factorize(this["d"]);
      let n = C_ONE;
      let d = C_ONE;
      for (let k in N) {
        if (k === "1")
          continue;
        if (k === "0") {
          n = C_ZERO;
          break;
        }
        N[k] *= P["n"];
        if (N[k] % P["d"] === C_ZERO) {
          N[k] /= P["d"];
        } else
          return null;
        n *= BigInt(k) ** N[k];
      }
      for (let k in D) {
        if (k === "1")
          continue;
        D[k] *= P["n"];
        if (D[k] % P["d"] === C_ZERO) {
          D[k] /= P["d"];
        } else
          return null;
        d *= BigInt(k) ** D[k];
      }
      if (P["s"] < C_ZERO) {
        return newFraction(d, n);
      }
      return newFraction(n, d);
    },
    log: function(a, b) {
      parse(a, b);
      if (this["s"] <= C_ZERO || P["s"] <= C_ZERO)
        return null;
      const allPrimes = Object.create(null);
      const baseFactors = factorize(P["n"]);
      const T1 = factorize(P["d"]);
      const numberFactors = factorize(this["n"]);
      const T2 = factorize(this["d"]);
      for (const prime in T1) {
        baseFactors[prime] = (baseFactors[prime] || C_ZERO) - T1[prime];
      }
      for (const prime in T2) {
        numberFactors[prime] = (numberFactors[prime] || C_ZERO) - T2[prime];
      }
      for (const prime in baseFactors) {
        if (prime === "1")
          continue;
        allPrimes[prime] = true;
      }
      for (const prime in numberFactors) {
        if (prime === "1")
          continue;
        allPrimes[prime] = true;
      }
      let retN = null;
      let retD = null;
      for (const prime in allPrimes) {
        const baseExponent = baseFactors[prime] || C_ZERO;
        const numberExponent = numberFactors[prime] || C_ZERO;
        if (baseExponent === C_ZERO) {
          if (numberExponent !== C_ZERO) {
            return null;
          }
          continue;
        }
        let curN = numberExponent;
        let curD = baseExponent;
        const gcdValue = gcd(curN, curD);
        curN /= gcdValue;
        curD /= gcdValue;
        if (retN === null && retD === null) {
          retN = curN;
          retD = curD;
        } else if (curN * retD !== retN * curD) {
          return null;
        }
      }
      return retN !== null && retD !== null ? newFraction(retN, retD) : null;
    },
    equals: function(a, b) {
      parse(a, b);
      return this["s"] * this["n"] * P["d"] === P["s"] * P["n"] * this["d"];
    },
    lt: function(a, b) {
      parse(a, b);
      return this["s"] * this["n"] * P["d"] < P["s"] * P["n"] * this["d"];
    },
    lte: function(a, b) {
      parse(a, b);
      return this["s"] * this["n"] * P["d"] <= P["s"] * P["n"] * this["d"];
    },
    gt: function(a, b) {
      parse(a, b);
      return this["s"] * this["n"] * P["d"] > P["s"] * P["n"] * this["d"];
    },
    gte: function(a, b) {
      parse(a, b);
      return this["s"] * this["n"] * P["d"] >= P["s"] * P["n"] * this["d"];
    },
    compare: function(a, b) {
      parse(a, b);
      let t = this["s"] * this["n"] * P["d"] - P["s"] * P["n"] * this["d"];
      return (C_ZERO < t) - (t < C_ZERO);
    },
    ceil: function(places) {
      places = C_TEN ** BigInt(places || 0);
      return newFraction(ifloor(this["s"] * places * this["n"] / this["d"]) + (places * this["n"] % this["d"] > C_ZERO && this["s"] >= C_ZERO ? C_ONE : C_ZERO), places);
    },
    floor: function(places) {
      places = C_TEN ** BigInt(places || 0);
      return newFraction(ifloor(this["s"] * places * this["n"] / this["d"]) - (places * this["n"] % this["d"] > C_ZERO && this["s"] < C_ZERO ? C_ONE : C_ZERO), places);
    },
    round: function(places) {
      places = C_TEN ** BigInt(places || 0);
      return newFraction(ifloor(this["s"] * places * this["n"] / this["d"]) + this["s"] * ((this["s"] >= C_ZERO ? C_ONE : C_ZERO) + C_TWO * (places * this["n"] % this["d"]) > this["d"] ? C_ONE : C_ZERO), places);
    },
    roundTo: function(a, b) {
      parse(a, b);
      const n = this["n"] * P["d"];
      const d = this["d"] * P["n"];
      const r = n % d;
      let k = ifloor(n / d);
      if (r + r >= d) {
        k++;
      }
      return newFraction(this["s"] * k * P["n"], P["d"]);
    },
    divisible: function(a, b) {
      parse(a, b);
      if (P["n"] === C_ZERO)
        return false;
      return this["n"] * P["d"] % (P["n"] * this["d"]) === C_ZERO;
    },
    valueOf: function() {
      return Number(this["s"] * this["n"]) / Number(this["d"]);
    },
    toString: function(dec = 15) {
      let N = this["n"];
      let D = this["d"];
      let cycLen = cycleLen(N, D);
      let cycOff = cycleStart(N, D, cycLen);
      let str = this["s"] < C_ZERO ? "-" : "";
      str += ifloor(N / D);
      N %= D;
      N *= C_TEN;
      if (N)
        str += ".";
      if (cycLen) {
        for (let i = cycOff;i--; ) {
          str += ifloor(N / D);
          N %= D;
          N *= C_TEN;
        }
        str += "(";
        for (let i = cycLen;i--; ) {
          str += ifloor(N / D);
          N %= D;
          N *= C_TEN;
        }
        str += ")";
      } else {
        for (let i = dec;N && i--; ) {
          str += ifloor(N / D);
          N %= D;
          N *= C_TEN;
        }
      }
      return str;
    },
    toFraction: function(showMixed = false) {
      let n = this["n"];
      let d = this["d"];
      let str = this["s"] < C_ZERO ? "-" : "";
      if (d === C_ONE) {
        str += n;
      } else {
        const whole = ifloor(n / d);
        if (showMixed && whole > C_ZERO) {
          str += whole;
          str += " ";
          n %= d;
        }
        str += n;
        str += "/";
        str += d;
      }
      return str;
    },
    toLatex: function(showMixed = false) {
      let n = this["n"];
      let d = this["d"];
      let str = this["s"] < C_ZERO ? "-" : "";
      if (d === C_ONE) {
        str += n;
      } else {
        const whole = ifloor(n / d);
        if (showMixed && whole > C_ZERO) {
          str += whole;
          n %= d;
        }
        str += "\\frac{";
        str += n;
        str += "}{";
        str += d;
        str += "}";
      }
      return str;
    },
    toContinued: function() {
      let a = this["n"];
      let b = this["d"];
      const res = [];
      while (b) {
        res.push(ifloor(a / b));
        const t = a % b;
        a = b;
        b = t;
      }
      return res;
    },
    simplify: function(eps = 0.001) {
      const ieps = BigInt(Math.ceil(1 / eps));
      const thisABS = this["abs"]();
      const cont = thisABS["toContinued"]();
      for (let i = 1;i < cont.length; i++) {
        let s = newFraction(cont[i - 1], C_ONE);
        for (let k = i - 2;k >= 0; k--) {
          s = s["inverse"]()["add"](cont[k]);
        }
        let t = s["sub"](thisABS);
        if (t["n"] * ieps < t["d"]) {
          return s["mul"](this["s"]);
        }
      }
      return this;
    }
  };
});

// node_modules/@kabelsalat/web/dist/index.mjs
function W(e, t) {
  if (t || (t = "assertion failed"), !e)
    throw new Error(t);
}

class c {
  constructor(t, i) {
    this.type = t, i !== undefined && (this.value = i), this.ins = [];
  }
  static parseInput(t, i) {
    if (typeof t == "function") {
      if (!i)
        throw new Error("tried to parse function input without without passing node..");
      return t(i);
    }
    return typeof t == "object" ? t : typeof t == "number" && !isNaN(t) || typeof t == "string" ? f(t) : (console.log(`invalid input type "${typeof t}" for node of type "${i.type}", falling back to 0. The input was:`, t), 0);
  }
}
function F(e, ...t) {
  let i = 1;
  if (t = t.map((l) => {
    if (Array.isArray(l)) {
      if (l.length === 1)
        return l[0];
      l = new c(Z).withIns(...l);
    }
    if (typeof l == "function") {
      const o = l(new c("peek"));
      o.type === Z && (i = Math.max(o.ins.length, i));
    }
    return l.type === Z && (i = Math.max(l.ins.length, i)), l;
  }), i === 1) {
    const l = x(e);
    return l.withIns(...t.map((o) => c.parseInput(o, l)));
  }
  if (e === Y) {
    const l = t.map((o) => o.type === Z ? o.ins.map((d) => c.parseInput(d).inherit(d)) : o).flat();
    return x(Y).withIns(...l);
  }
  const n = Array.from({ length: i }, (l, o) => {
    const d = new c(e), G = t.map((p) => p.type === Z ? c.parseInput(p.ins[o % p.ins.length], d).inherit(p) : (p = c.parseInput(p, d), p.type === Z && (p = p.ins[o]), p));
    return d.withIns(...G);
  });
  return new c(Z).withIns(...n);
}
function oe(e, t) {
  const i = y.get(e);
  return i?.ins?.[t] ? i.ins[t].name : "";
}
function g(e, t, i) {
  return u(e, (...n) => {
    const l = de++;
    return n = n.map((o, d) => c.parseInput(o).asModuleInput?.(e, l, d)), t(...n).asModuleOutput?.(e, l);
  }, i);
}
function f(e) {
  return Array.isArray(e) ? poly(...e.map((t) => f(t))) : typeof e == "object" ? e : x("n", e);
}
function ce(e) {
  const t = modules.get(e), i = Array.from({ length: t.length }, (l, o) => x(`$INPUT${o}`)), n = t(...i);
  return JSON.stringify(n, null, 2);
}
function pe(e) {
  const t = [];
  return S(e, (i) => (t.push(i), i)), t.map((i) => {
    let n = {
      ...i,
      type: i.type,
      ins: i.ins.map((l) => t.indexOf(l) + "")
    };
    return i.value !== undefined && (n.value = i.value), i.to !== undefined && (n.to = t.indexOf(i.to)), n;
  });
}
function j(e, t) {
  let i = [];
  const n = u("out", function(o, d = [0, 1]) {
    return i.push(o.output(d)), o;
  });
  return t ? (t.out = n, Function(...Object.keys(t), e)(...Object.values(t))) : (globalThis.out = n, Function(e)()), J(...i);
}
function T(e, t = {}) {
  const {
    log: i = false,
    lang: n = "js",
    fallbackType: l = "thru",
    constType: o = "n",
    getRegister: d = (h) => `r[${h}]`,
    getOutput: G = (h) => `o[${h}]`,
    getSource: p = (h) => `s[${h}]`
  } = t;
  i && console.log("compile", e);
  const m = ue(e);
  let r = [], R = (h) => m[h].type !== o ? d(h) : typeof m[h].value == "string" ? `"${m[h].value}"` : m[h].value;
  const X = [];
  for (let h in m) {
    const v = m[h], I = m[h].ins.map((ae) => R(m.indexOf(ae))), se = X.length;
    let b = y.get(v.type);
    b || (console.warn(`unhandled node type "${m[h].type}". falling back to "${l}"`), b = y.get(l));
    const le = {
      vars: I,
      node: v,
      nodes: m,
      id: h,
      ugenIndex: se,
      ugen: b.ugen,
      name: R(h),
      lang: n,
      getRegister: d,
      getOutput: G,
      getSource: p
    };
    b.compile && r.push(b.compile(le)), b.ugen && X.push({ type: b.ugen, inputs: I });
  }
  const z = r.join(`
`);
  return i && (console.log("compiled code:"), console.log(z)), { src: z, ugens: X, registers: m.length };
}
function ue(e) {
  const t = [], i = /* @__PURE__ */ new Set;
  function n(l) {
    if (!(typeof l != "object" || i.has(l))) {
      i.add(l);
      for (let o in l.ins)
        n(l.ins[o]);
      t.push(l);
    }
  }
  return n(e), t;
}

class Q {
  constructor() {
    this._events = {};
  }
  on(t, i) {
    this._events[t] || (this._events[t] = []);
    let n = this._events[t];
    W(n.indexOf(i) == -1), n.push(i);
  }
  removeListener(t, i) {
    let n = this._events[t], l = n.indexOf(i);
    l != -1 && n.splice(l, 1);
  }
  trigger(t, ...i) {
    let n = this._events[t] || [];
    for (let l = 0;l < n.length; l++)
      n[l].apply(null, i);
  }
}
function re(e) {
  let t = e[0] & 240, i = (e[0] & 15) + 1;
  if (t == 176 && e.length == 3) {
    let n = e[1], o = e[2] / 127 * 2 - 1;
    return { type: "CC", channel: i, cc: n, value: o };
  }
  if (t == 224 && e.length == 3) {
    let n = e[1], d = (e[2] << 7 | n) / 16383 * 2 - 1;
    return { type: "PITCHBEND", channel: i, value: d };
  }
  if (t == 144 && e.length == 3) {
    let n = e[1], l = e[2] / 127;
    return { type: "NOTE_ON", channel: i, note: n, velocity: l };
  }
  if (t == 128 && e.length == 3) {
    let n = e[1];
    return { type: "NOTE_ON", channel: i, note: n, velocity: 0 };
  }
}
function fe(e, t, i) {
  if (e.length < 1)
    return;
  e[0];
  const n = 3, l = 32, o = e.map((X) => X.length).reduce((X, z) => X + z, 0), d = l / 8, G = i * d, p = 44, m = new ArrayBuffer(p + o * d), r = new DataView(m);
  V(r, 0, "RIFF"), r.setUint32(4, 36 + o * d, true), V(r, 8, "WAVE"), V(r, 12, "fmt "), r.setUint32(16, 16, true), r.setUint16(20, n, true), r.setUint16(22, i, true), r.setUint32(24, t, true), r.setUint32(28, t * G, true), r.setUint16(32, G, true), r.setUint16(34, l, true), V(r, 36, "data"), r.setUint32(40, o * d, true);
  let R = 44;
  for (const X of e)
    ge(r, R, X), R += X.length * d;
  return m;
}
function V(e, t, i) {
  for (let n = 0;n < i.length; n++)
    e.setUint8(t + n, i.charCodeAt(n));
}
function ge(e, t, i) {
  for (var n = 0;n < i.length; n++, t += 4)
    e.setFloat32(t, i[n], true);
}

class Fe {
  constructor(t = null) {
    this.ugens = /* @__PURE__ */ new Map, this.outputNode = t;
  }
  async spawn(t, i) {
    this.graph = t;
    const { src: n, ugens: l, registers: o } = t.compile({
      log: false
    });
    !this.mouse && n.includes("mouse") && this.initMouse(), !this.midiInited && l.some((d) => d.type.startsWith("Midi")) && this.initMidi(), !this.audioIn && l.some((d) => d.type === "AudioIn") && await this.initAudioIn(), this.sendCustomUgens(), this.send({
      type: "SPAWN_UNIT",
      unit: { src: n, ugens: l, registers: o },
      duration: i
    });
  }
  registerUgen(t) {
    this.ugens.set(t.name, t);
  }
  sendCustomUgens() {
    if (!this.ugens.size)
      return;
    let t = [];
    for (let [i, n] of this.ugens)
      t.push({
        type: "SET_UGEN",
        className: i,
        ugen: n + ""
      });
    this.send({
      type: "BATCH_MSG",
      messages: t
    });
  }
  scheduleMessage(t, i) {
    this.send({
      type: "SCHEDULE_MSG",
      msg: t,
      time: i
    });
  }
  setControl(t, i, n) {
    const l = {
      type: "SET_CONTROL",
      id: t,
      value: i
    };
    n ? this.send({ type: "SCHEDULE_MSG", time: n, msg: l }) : this.send(l);
  }
  setControls(t) {
    const i = {
      type: "BATCH_MSG",
      messages: t.map((n) => {
        const l = { type: "SET_CONTROL", id: n.id, value: n.value };
        return n.time === undefined ? l : {
          type: "SCHEDULE_MSG",
          time: n.time,
          msg: l
        };
      })
    };
    this.send(i);
  }
  async initAudioIn() {
    console.log("init audio input...");
    const t = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    });
    this.audioCtx.createMediaStreamSource(t).connect(this.audioWorklet);
  }
  initMidi() {
    console.log("init midi input..."), this.midiInited = true, new me().on("midimessage", (i, n) => {
      const l = re(n);
      l && this.send(l);
    });
  }
  initMouse() {
    console.log("init mouse"), this.mouse = new he, this.mouse.on("move", (t, i) => {
      this.setControl("mouseX", t), this.setControl("mouseY", i);
    });
  }
  send(t) {
    W(t instanceof Object), this.audioWorklet && this.audioWorklet.port.postMessage(t);
  }
  async init() {
    if (!this.audioCtx) {
      if (W(!this.audioCtx), this.audioCtx = this.outputNode?.context || new AudioContext({
        latencyHint: "interactive",
        sampleRate: 48000
      }), await this.audioCtx.resume(), !this.audioCtx.audioWorklet)
        throw new Error("Audio cannot be loaded: non-secure origin? (AudioContext.audioWorklet is undefined)");
      await this.audioCtx.audioWorklet.addModule(Ge), await this.audioCtx.audioWorklet.addModule(ye), this.audioWorklet = new AudioWorkletNode(this.audioCtx, "sample-generator", {
        outputChannelCount: [2]
      }), this.audioWorklet.port.onmessage = (t) => {
        const { id: i, time: n, type: l } = t.data;
        l === "SIGNAL_TRIGGER" ? this.graph.dfs((o) => {
          if (o.type === "signal" && o.id === i) {
            const d = o.callback(n, i);
            isNaN(d) ? d !== undefined && console.warn(`expected number from "on" callback with id "${i}", got "${d}" instead.`) : window.postMessage({
              type: "KABELSALAT_SET_CONTROL",
              value: d,
              id: i
            });
          }
          return o;
        }) : l === "STOP" ? setTimeout(() => this.destroy(), t.data.fadeTime * 1000 + 200) : l === "SEND_SAMPLES" && this.graph.dfs((o) => (o.type !== "scope" || o.ins.length < 2 || o.ins[1].value !== i || window.postMessage({
          type: "KABELSALAT_UPDATE_SCOPE",
          samples: t.data.samples,
          channels: t.data.channels,
          channel: t.data.channel,
          id: i
        }), o));
      }, this.recorder = new window.AudioWorkletNode(this.audioCtx, "recorder"), this.audioWorklet.connect(this.recorder), this.sendCustomUgens(), this.recorder.connect(this.outputNode || this.audioCtx.destination), this.recorder.port.onmessage = (t) => {
        if (t.data.eventType === "data" && this.recordedBuffers.push(t.data.audioBuffer), t.data.eventType === "stop") {
          console.log("recording stopped");
          const i = fe(this.recordedBuffers, this.audioCtx.sampleRate, 2);
          Je(i, "kabelsalat.wav", "audio/wav"), this.recordedBuffers = [];
        }
      }, this.recordOnPlay && this.record();
    }
  }
  destroy() {
    this.audioWorklet?.disconnect(), this.audioWorklet = null, this.recorder?.disconnect(), this.recorder = null, !this.outputNode && this.audioCtx?.close(), this.audioCtx = null;
  }
  stop() {
    this.audioCtx && this.send({ type: "STOP" }), this.mouse?.detach();
  }
  record() {
    if (!this.audioCtx) {
      this.recordOnPlay = true;
      return;
    }
    this.recordedBuffers = [], this.recorder.parameters.get("isRecording").setValueAtTime(1, 0), console.log("recording started");
  }
  stopRecording() {
    this.recordOnPlay = false, this.audioCtx && this.recorder.parameters.get("isRecording").setValueAtTime(0, 0);
  }
  set fadeTime(t) {
    this.send({ type: "FADE_TIME", fadeTime: t });
  }
  set maxUnits(t) {
    this.send({ type: "MAX_UNITS", maxUnits: t });
  }
}
function Je(e, t, i) {
  const n = new Blob([e], { type: i }), l = document.createElement("a");
  l.href = window.URL.createObjectURL(n), l.download = t, l.click();
}

class en {
  constructor({
    onToggle: t,
    onToggleRecording: i,
    beforeEval: n,
    transpiler: l,
    localScope: o = false,
    outputNode: d = null
  } = {}) {
    this.outputNode = d, this.audio = new Fe(this.outputNode), this.onToggle = t, this.transpiler = l, this.onToggleRecording = i, this.beforeEval = n, this.localScope = o, typeof window < "u" && (o || (Object.assign(globalThis, k), Object.assign(globalThis, P2), Object.assign(globalThis, U), Object.assign(globalThis, { repl: this })), window.addEventListener("message", (p) => {
      p.data.type === "KABELSALAT_SET_CONTROL" && this.audio.setControl(p.data.id, p.data.value);
    }));
    const G = this;
    c.prototype.spawn = function(p = [0, 1], m) {
      G.audio.spawn(this.output(p).exit(), m);
    };
  }
  registerUgen(t, i) {
    return this.audio.registerUgen(i), E(t, i.name);
  }
  evaluate(t) {
    this.localScope || (Object.assign(globalThis, { audio: this.audio }), Object.assign(globalThis, {
      addUgen: this.registerUgen.bind(this)
    }));
    let i;
    this.transpiler ? i = this.transpiler(t) : i = { output: t }, this.beforeEval?.(i);
    let n;
    return this.localScope && (n = {
      ...k,
      ...P2,
      ...U,
      audio: this.audio,
      addUgen: this.registerUgen.bind(this),
      repl: this
    }), j(i.output, n);
  }
  async play(t) {
    await this.audio.init(), t.ins.length && this.audio.spawn(t), this.onToggle?.(true);
  }
  run(t) {
    const i = this.evaluate(t);
    this.play(i);
  }
  stop() {
    this.stopRecording(), this.audio.stop(), this.onToggle?.(false);
  }
  record() {
    this.audio.record(), this.onToggleRecording?.(true);
  }
  stopRecording() {
    this.audio.stopRecording(), this.onToggleRecording?.(false);
  }
}
var x = (e, t) => new c(e, t), y, Z = "poly", Y = "exit", a = (e, t) => u(e, (...i) => F(e, ...i), t), u = (e, t, i) => (i && y.set(e, i), c.prototype[e] = function(...n) {
  return t(this, ...n);
}, c.prototype["_" + e] = function() {
  return this;
}, t), de = 0, J, S = (e, t, i = []) => (e = t(e, i), i.push(e), e.ins = e.ins.map((n) => i.includes(n) ? n : S(n, t, i)), e), U, me, he, Ge = "data:text/javascript;base64,KGZ1bmN0aW9uKCl7InVzZSBzdHJpY3QiO2Z1bmN0aW9uIGcoaCx0KXtpZih0fHwodD0iYXNzZXJ0aW9uIGZhaWxlZCIpLCFoKXRocm93IG5ldyBFcnJvcih0KX1mdW5jdGlvbiBTKGgsdCxzKXtyZXR1cm4gaDw9MD90Omg+PTE/czp0K2gqKHMtdCl9ZnVuY3Rpb24gUChoLHQscyl7cmV0dXJuIGg8PXQ/MDpoPj1zPzE6cz09PXQ/MDooaC10KS8ocy10KX1mdW5jdGlvbiBFKGgsdCl7cmV0dXJuIGg8dD8oaC89dCxoK2gtaCpoLTEpOmg+MS10PyhoPShoLTEpL3QsaCpoK2graCsxKTowfWZ1bmN0aW9uIFUoaCl7cmV0dXJuIE1hdGguZmxvb3IoaCk9PT1ofWZ1bmN0aW9uIF8oaCl7cmV0dXJuIFUoaCkmJmg+MH1mdW5jdGlvbiBrKGgsdCl7dD1NYXRoLm1pbihNYXRoLm1heCh0LDApLDEpLHQtPS4wMTt2YXIgcz0yKnQvKDEtdCksZT0oMStzKSpoLygxK3MqTWF0aC5hYnMoaCkpO3JldHVybiBlfWZ1bmN0aW9uIHcoaCx0LHMpe3JldHVybiBoPj0xP3M6dCtoKihzLXQpfWZ1bmN0aW9uIFQoKXt0aGlzLnN0YXRlPSJvZmYiLHRoaXMuc3RhcnRUaW1lPTAsdGhpcy5zdGFydFZhbD0wfVQucHJvdG90eXBlLmV2YWw9ZnVuY3Rpb24oaCx0LHMsZSxpLG4pe3N3aXRjaCh0aGlzLnN0YXRlKXtjYXNlIm9mZiI6cmV0dXJuIHQ+MCYmKHRoaXMuc3RhdGU9ImF0dGFjayIsdGhpcy5zdGFydFRpbWU9aCx0aGlzLnN0YXJ0VmFsPTApLDA7Y2FzZSJhdHRhY2siOntsZXQgcj1oLXRoaXMuc3RhcnRUaW1lO3JldHVybiByPnM/KHRoaXMuc3RhdGU9ImRlY2F5Iix0aGlzLnN0YXJ0VGltZT1oLDEpOncoci9zLHRoaXMuc3RhcnRWYWwsMSl9Y2FzZSJkZWNheSI6e2xldCByPWgtdGhpcy5zdGFydFRpbWUsbD13KHIvZSwxLGkpO3JldHVybiB0PD0wPyh0aGlzLnN0YXRlPSJyZWxlYXNlIix0aGlzLnN0YXJ0VGltZT1oLHRoaXMuc3RhcnRWYWw9bCxsKTpyPmU/KHRoaXMuc3RhdGU9InN1c3RhaW4iLHRoaXMuc3RhcnRUaW1lPWgsaSk6bH1jYXNlInN1c3RhaW4iOnJldHVybiB0PD0wJiYodGhpcy5zdGF0ZT0icmVsZWFzZSIsdGhpcy5zdGFydFRpbWU9aCx0aGlzLnN0YXJ0VmFsPWkpLGk7Y2FzZSJyZWxlYXNlIjp7bGV0IHI9aC10aGlzLnN0YXJ0VGltZTtpZihyPm4pcmV0dXJuIHRoaXMuc3RhdGU9Im9mZiIsMDtsZXQgbD13KHIvbix0aGlzLnN0YXJ0VmFsLDApO3JldHVybiB0PjAmJih0aGlzLnN0YXRlPSJhdHRhY2siLHRoaXMuc3RhcnRUaW1lPWgsdGhpcy5zdGFydFZhbD1sKSxsfX10aHJvdyJpbnZhbGlkIGVudmVsb3BlIHN0YXRlIn07ZnVuY3Rpb24gdigpe3RoaXMuczA9MCx0aGlzLnMxPTB9di5wcm90b3R5cGUuYXBwbHk9ZnVuY3Rpb24oaCx0LHMpe2coIWlzTmFOKGgpLCJOYU4gdmFsdWUgZmVkIGluIFR3b1BvbGVGaWx0ZXIiKSx0PU1hdGgubWluKHQsMSkscz1NYXRoLm1heChzLDApO3ZhciBlPU1hdGgucG93KC41LCgxLXQpLy4xMjUpLGk9TWF0aC5wb3coLjUsKHMrLjEyNSkvLjEyNSksbj0xLWkqZSxyPXRoaXMuczAsbD10aGlzLnMxO3JldHVybiByPW4qci1lKmwrZSpoLGw9bipsK2UqcixoPWwsdGhpcy5zMD1yLHRoaXMuczE9bCxofTtsZXQgQT1jbGFzcyBDe2NvbnN0cnVjdG9yKHQscyl7dGhpcy5zYW1wbGVSYXRlPXQscz90aGlzLmJ1ZmZlcj1zLnNsaWNlKDApOih0aGlzLmJ1ZmZlcj1uZXcgRmxvYXQzMkFycmF5KDEwKnQpLHRoaXMuYnVmZmVyLmZpbGwoMCkpLHRoaXMud3JpdGVJZHg9MCx0aGlzLnJlYWRJZHg9MH1yZXNldCgpe3RoaXMuYnVmZmVyLmZpbGwoMCksdGhpcy53cml0ZUlkeD0wLHRoaXMucmVhZElkeD0wfWNsb25lKCl7Y29uc3QgdD1uZXcgQyh0aGlzLnNhbXBsZVJhdGUsdGhpcy5idWZmZXIpO3JldHVybiB0LndyaXRlSWR4PXRoaXMud3JpdGVJZHgsdC5yZWFkSWR4PXRoaXMucmVhZElkeCx0fXdyaXRlKHQscyl7dGhpcy53cml0ZUlkeD0odGhpcy53cml0ZUlkeCsxKSV0aGlzLmJ1ZmZlci5sZW5ndGgsdGhpcy5idWZmZXJbdGhpcy53cml0ZUlkeF09dDtsZXQgZT1NYXRoLm1pbihNYXRoLmZsb29yKHRoaXMuc2FtcGxlUmF0ZSpzKSx0aGlzLmJ1ZmZlci5sZW5ndGgtMSk7dGhpcy5yZWFkSWR4PXRoaXMud3JpdGVJZHgtZSx0aGlzLnJlYWRJZHg8MCYmKHRoaXMucmVhZElkeCs9dGhpcy5idWZmZXIubGVuZ3RoKX1yZWFkKCl7cmV0dXJuIHRoaXMuYnVmZmVyW3RoaXMucmVhZElkeF19fTtjb25zdCB5PTEvNDhlMyxNPTI0LE49TS80O2NsYXNzIG97Y29uc3RydWN0b3IodCxzLGUsaSl7dGhpcy5ub2RlSWQ9dCx0aGlzLnN0YXRlPXMsdGhpcy5zYW1wbGVSYXRlPWUsdGhpcy5zYW1wbGVUaW1lPTEvZSx0aGlzLnNlbmQ9aX19Y2xhc3MgcSBleHRlbmRzIG97Y29uc3RydWN0b3IodCxzLGUsaSl7c3VwZXIodCxzLGUsaSksdGhpcy5lbnY9bmV3IFR9dXBkYXRlKHQscyxlLGksbixyKXtyZXR1cm4gdGhpcy5lbnYuZXZhbCh0LHMsZSxpLG4scil9fWNsYXNzIEYgZXh0ZW5kcyBve2NvbnN0cnVjdG9yKHQscyxlLGkpe3N1cGVyKHQscyxlLGkpLHRoaXMucGhhc2U9MH11cGRhdGUodCl7bGV0IHM9TSp0LzYwLGU9LjU7cmV0dXJuIHRoaXMucGhhc2UrPXRoaXMuc2FtcGxlVGltZSpzLHRoaXMucGhhc2UlMTxlPzE6LTF9fWNsYXNzIEQgZXh0ZW5kcyBve2NvbnN0cnVjdG9yKHQscyxlLGkpe3N1cGVyKHQscyxlLGkpLHRoaXMuaW5TZ249ITAsdGhpcy5vdXRTZ249ITAsdGhpcy5jbG9ja0NudD0wfXVwZGF0ZSh0LHMpe2xldCBlPXQ+MDtyZXR1cm4gdGhpcy5pblNnbiE9ZSYmKHRoaXMuY2xvY2tDbnQrKyx0aGlzLmNsb2NrQ250Pj1zJiYodGhpcy5jbG9ja0NudD0wLHRoaXMub3V0U2duPSF0aGlzLm91dFNnbikpLHRoaXMuaW5TZ249ZSx0aGlzLm91dFNnbj8xOi0xfX1jbGFzcyBMIGV4dGVuZHMgb3tjb25zdHJ1Y3Rvcih0LHMsZSxpKXtzdXBlcih0LHMsZSxpKSx0aGlzLmluU2duPSExfXVwZGF0ZSh0LHMpe2xldCBlPXM+MDtyZXR1cm4gZSYmdGhpcy5pblNnbiE9ZSYmdGhpcy5zZW5kKHt0eXBlOiJDTE9DS19QVUxTRSIsbm9kZUlkOnRoaXMubm9kZUlkLHRpbWU6dH0pLHRoaXMuaW5TZ249ZSwwfX1jb25zdCBPPW5ldyBNYXA7Y2xhc3MgViBleHRlbmRzIG97Y29uc3RydWN0b3IodCxzLGUsaSl7c3VwZXIodCxzLGUsaSk7Y29uc3Qgbj1zLmlucHV0c1syXTtuJiZPLmhhcyhuKT90aGlzLmRlbGF5PU8uZ2V0KG4pLmNsb25lKCk6dGhpcy5kZWxheT1uZXcgQShlKSxuJiZPLnNldChuLHRoaXMuZGVsYXkpfXVwZGF0ZSh0LHMpe3JldHVybiB0aGlzLmRlbGF5LndyaXRlKHQscyksdGhpcy5kZWxheS5yZWFkKCl9fWNsYXNzIEcgZXh0ZW5kcyBve2NvbnN0cnVjdG9yKHQscyxlLGkpe3N1cGVyKHQscyxlLGkpfXVwZGF0ZSh0LHMpe3JldHVybiBrKHQscyl9fWNsYXNzIFIgZXh0ZW5kcyBve2NvbnN0cnVjdG9yKHQscyxlLGkpe3N1cGVyKHQscyxlLGkpLHRoaXMudmFsdWU9MCx0aGlzLnRyaWdTZ249ITF9d3JpdGUodCxzKXshdGhpcy50cmlnU2duJiZzPjAmJih0aGlzLnZhbHVlPXQpLHRoaXMudHJpZ1Nnbj1zPjB9cmVhZCgpe3JldHVybiB0aGlzLnZhbHVlfXVwZGF0ZSh0LHMpe3JldHVybiB0aGlzLndyaXRlKHQscyksdGhpcy5yZWFkKCl9fWNsYXNzIEJ7Y29uc3RydWN0b3IoKXt0aGlzLnZhbHVlPTB9dXBkYXRlKHQpe3JldHVybiB0aGlzLnZhbHVlPXQsdGhpcy52YWx1ZX19Y29uc3QgJD0zNDA7bGV0IEk9MDtjbGFzcyBIe2NvbnN0cnVjdG9yKCl7dGhpcy5jaD1JLHRoaXMuc3RhcnRfc2VlZD0kKih0aGlzLmNoKzEpPj4+MCx0aGlzLnN0YXRlPXRoaXMuc3RhcnRfc2VlZCx0aGlzLnZhbHVlPTAsdGhpcy5hPTE2NjQ1MjUsdGhpcy5jPTEwMTM5MDQyMjMsdGhpcy5tYXNrPTE2Nzc3MjE1LHRoaXMuc2NhbGU9MS8oMTw8MjQpLEkrK311cGRhdGUodCxzKXtpZighdClyZXR1cm4gdGhpcy52YWx1ZTtzJiYodGhpcy5zdGF0ZT10aGlzLnN0YXJ0X3NlZWQpLHRoaXMuc3RhdGU9dGhpcy5zdGF0ZSp0aGlzLmErdGhpcy5jPj4+MDtjb25zdCBlPSh0aGlzLnN0YXRlJnRoaXMubWFzaykqdGhpcy5zY2FsZTtyZXR1cm4gdGhpcy52YWx1ZT1lKjItMSx0aGlzLnZhbHVlfX1jbGFzcyBqe2NvbnN0cnVjdG9yKCl7dGhpcy52YWx1ZT1NYXRoLnJhbmRvbSgpKjItMX11cGRhdGUodCl7cmV0dXJuIHQ/KHRoaXMudmFsdWU9TWF0aC5yYW5kb20oKSoyLTEsdGhpcy52YWx1ZSk6dGhpcy52YWx1ZX19Y2xhc3MgS3t1cGRhdGUodCl7cmV0dXJuIE1hdGgucmFuZG9tKCk8dCp5P01hdGgucmFuZG9tKCk6MH19Y2xhc3MgV3tjb25zdHJ1Y3Rvcigpe3RoaXMub3V0PTB9dXBkYXRlKCl7bGV0IHQ9TWF0aC5yYW5kb20oKSoyLTE7cmV0dXJuIHRoaXMub3V0PSh0aGlzLm91dCsuMDIqdCkvMS4wMix0aGlzLm91dH19Y2xhc3MgWHtjb25zdHJ1Y3Rvcigpe3RoaXMuYjA9MCx0aGlzLmIxPTAsdGhpcy5iMj0wLHRoaXMuYjM9MCx0aGlzLmI0PTAsdGhpcy5iNT0wLHRoaXMuYjY9MH11cGRhdGUoKXtjb25zdCB0PU1hdGgucmFuZG9tKCkqMi0xO3RoaXMuYjA9Ljk5ODg2KnRoaXMuYjArdCouMDU1NTE3OSx0aGlzLmIxPS45OTMzMip0aGlzLmIxK3QqLjA3NTA3NTksdGhpcy5iMj0uOTY5KnRoaXMuYjIrdCouMTUzODUyLHRoaXMuYjM9Ljg2NjUqdGhpcy5iMyt0Ki4zMTA0ODU2LHRoaXMuYjQ9LjU1KnRoaXMuYjQrdCouNTMyOTUyMix0aGlzLmI1PS0uNzYxNip0aGlzLmI1LXQqLjAxNjg5ODtjb25zdCBzPXRoaXMuYjArdGhpcy5iMSt0aGlzLmIyK3RoaXMuYjMrdGhpcy5iNCt0aGlzLmI1K3RoaXMuYjYrdCouNTM2MjtyZXR1cm4gdGhpcy5iNj10Ki4xMTU5MjYscyouMTF9fWNsYXNzIFkgZXh0ZW5kcyBve2NvbnN0cnVjdG9yKHQscyxlLGkpe3N1cGVyKHQscyxlLGkpLHRoaXMucGhhc2U9MX11cGRhdGUodCl7dGhpcy5waGFzZSs9dGhpcy5zYW1wbGVUaW1lKnQ7bGV0IHM9dGhpcy5waGFzZT49MT8xOjA7cmV0dXJuIHRoaXMucGhhc2U9dGhpcy5waGFzZSUxLHN9fWNsYXNzIHogZXh0ZW5kcyBve2NvbnN0cnVjdG9yKHQscyxlLGkpe3N1cGVyKHQscyxlLGkpLHRoaXMucGhhc2U9MH11cGRhdGUodCxzKXtyZXR1cm4gdGhpcy5waGFzZSs9dGhpcy5zYW1wbGVUaW1lKnQsdGhpcy5waGFzZSUxPHM/MTotMX19Y2xhc3MgWiBleHRlbmRzIG97Y29uc3RydWN0b3IodCxzLGUsaSl7c3VwZXIodCxzLGUsaSksdGhpcy5waGFzZT0wfXVwZGF0ZSh0KXtyZXR1cm4gdGhpcy5waGFzZSs9dGhpcy5zYW1wbGVUaW1lKnQsdGhpcy5waGFzZSUxKjItMX19Y2xhc3MgSntjb25zdHJ1Y3Rvcigpe3RoaXMucGhhc2U9TWF0aC5yYW5kb20oKX11cGRhdGUodCl7Y29uc3Qgcz10L3NhbXBsZVJhdGU7bGV0IGU9RSh0aGlzLnBoYXNlLHMpLGk9Mip0aGlzLnBoYXNlLTEtZTtyZXR1cm4gdGhpcy5waGFzZSs9cyx0aGlzLnBoYXNlPjEmJih0aGlzLnBoYXNlLT0xKSxpfX1jbGFzcyBRIGV4dGVuZHMgb3tjb25zdHJ1Y3Rvcih0LHMsZSxpKXtzdXBlcih0LHMsZSxpKSx0aGlzLnBoYXNlPTAsdGhpcy5zeW5jU2duPSExfXVwZGF0ZSh0LHMsZSl7IXRoaXMuc3luY1NnbiYmcz4wJiYodGhpcy5waGFzZT0wKSx0aGlzLnN5bmNTZ249cz4wO2xldCBpPSh0aGlzLnBoYXNlK2UpJTE7cmV0dXJuIHRoaXMucGhhc2UrPXRoaXMuc2FtcGxlVGltZSp0LE1hdGguc2luKGkqMipNYXRoLlBJKX19Y2xhc3MgdHR7ZEJUb0xpbmVhcih0KXtyZXR1cm4gTWF0aC5wb3coMTAsdC8yMCl9bGluZWFyVG9EQih0KXtyZXR1cm4gMjAqTWF0aC5sb2cxMCh0KX11cGRhdGUodCxzLGUpe2xldCBpPXRoaXMubGluZWFyVG9EQihNYXRoLmFicyh0KSksbj0wO3JldHVybiBpPnMmJihuPShpLXMpKigxLTEvZSkpLHRoaXMuZEJUb0xpbmVhcigtbil9fWNsYXNzIHN0IGV4dGVuZHMgb3tjb25zdHJ1Y3Rvcih0LHMsZSxpKXtzdXBlcih0LHMsZSxpKSx0aGlzLnBoYXNlPTB9dXBkYXRlKHQpe3RoaXMucGhhc2UrPXRoaXMuc2FtcGxlVGltZSp0O2xldCBzPXRoaXMucGhhc2UlMTtyZXR1cm4oczwuNT8yKnM6MS0yKihzLS41KSkqMi0xfX1jbGFzcyBldCBleHRlbmRzIG97Y29uc3RydWN0b3IodCxzLGUsaSl7c3VwZXIodCxzLGUsaSk7Y29uc3Qgbj1lLzMwO2coXyhuKSksdGhpcy5idWZmZXI9bmV3IEZsb2F0MzJBcnJheShuKSx0aGlzLndyaXRlUG9zPTB9dXBkYXRlKHQscyxlLGkpe3JldHVybiB0aGlzLmJ1ZmZlclt0aGlzLndyaXRlUG9zXT10LHRoaXMud3JpdGVQb3MrKyx0aGlzLndyaXRlUG9zJXRoaXMuYnVmZmVyLmxlbmd0aD09MCYmKHRoaXMud3JpdGVQb3M9MCx0aGlzLnNlbmQoe3R5cGU6IlNFTkRfU0FNUExFUyIsaWQ6cyxzYW1wbGVzOnRoaXMuYnVmZmVyLGNoYW5uZWxzOmUsY2hhbm5lbDppfSkpLHR9fWNsYXNzIGl0e2NvbnN0cnVjdG9yKCl7dGhpcy5sYWdVbml0PTQ0MTAsdGhpcy5zPTB9dXBkYXRlKHQscyl7cmV0dXJuIHM9cyp0aGlzLmxhZ1VuaXQsczwxJiYocz0xKSx0aGlzLnMrPTEvcyoodC10aGlzLnMpLHRoaXMuc319Y2xhc3MgaHR7Y29uc3RydWN0b3IoKXt0aGlzLmxhc3Q9MH11cGRhdGUodCxzLGUpe2NvbnN0IGk9cyp5LG49ZSp5O2xldCByPXQtdGhpcy5sYXN0O3JldHVybiByPmk/cj1pOnI8LW4mJihyPS1uKSx0aGlzLmxhc3QrPXIsdGhpcy5sYXN0fX1jbGFzcyBhdCBleHRlbmRzIG97Y29uc3RydWN0b3IodCxzLGUsaSl7c3VwZXIodCxzLGUsaSksdGhpcy5zPTB9dXBkYXRlKHQscyl7cmV0dXJuIHM9cyoxZTMsczwxJiYocz0xKSx0aGlzLnMrPTEvcyoodC10aGlzLnMpLHRoaXMuc319Y2xhc3MgbnQgZXh0ZW5kcyBve2NvbnN0cnVjdG9yKHQscyxlLGkpe3N1cGVyKHQscyxlLGkpLHRoaXMuZmlsdGVyPW5ldyB2fXVwZGF0ZSh0LHMsZSl7cmV0dXJuIHRoaXMuZmlsdGVyLmFwcGx5KHQscyxlKSx0aGlzLmZpbHRlci5zMX19Y2xhc3MgcnQgZXh0ZW5kcyBve2NvbnN0cnVjdG9yKHQscyxlLGkpe3N1cGVyKHQscyxlLGkpLHRoaXMuZmlsdGVyPW5ldyB2fXVwZGF0ZSh0LHMsZSl7cmV0dXJuIHRoaXMuZmlsdGVyLmFwcGx5KHQscyxlKSx0aGlzLmZpbHRlci5zMH19Y2xhc3MgdXQgZXh0ZW5kcyBve2NvbnN0cnVjdG9yKHQscyxlLGkpe3N1cGVyKHQscyxlLGkpfXVwZGF0ZSh0LHMpe3JldHVybiBzPDAmJihzPTApLHM9cysxLHQ9dCpzLDQqKE1hdGguYWJzKC4yNSp0Ky4yNS1NYXRoLnJvdW5kKC4yNSp0Ky4yNSkpLS4yNSl9fWNsYXNzIGx0IGV4dGVuZHMgb3t1cGRhdGUodCl7cmV0dXJuIHR9fWNsYXNzIG0gZXh0ZW5kcyBve2NvbnN0cnVjdG9yKHQscyxlLGkpe3N1cGVyKHQscyxlLGkpLHRoaXMubm90ZT0wLHRoaXMuZnJlcT0wLHRoaXMudmVsb2NpdHk9MCx0aGlzLmdhdGVTdGF0ZT0ib2ZmIix0aGlzLnR5cGU9Im1pZGlpbiIsdGhpcy5jaGFubmVsPS0xfWlzRnJlZSgpe3JldHVybiB0aGlzLmdhdGVTdGF0ZT09PSJvZmYifW5vdGVPbih0LHMpe3M+MD8odGhpcy5ub3RlPXQsdGhpcy52ZWxvY2l0eT1zLHRoaXMuZnJlcT0yKiooKHQtNjkpLzEyKSo0NDAsdGhpcy5nYXRlU3RhdGU9InByZXRyaWciKTp0aGlzLm5vdGVPZmYoKX1ub3RlT2ZmKCl7dGhpcy5ub3RlPTAsdGhpcy5nYXRlU3RhdGU9Im9mZiJ9Z2V0R2F0ZSgpe3N3aXRjaCh0aGlzLmdhdGVTdGF0ZSl7Y2FzZSJwcmV0cmlnIjpyZXR1cm4gdGhpcy5nYXRlU3RhdGU9Im9uIiwwO2Nhc2Uib24iOnJldHVybiAxO2Nhc2Uib2ZmIjpyZXR1cm4gMDtkZWZhdWx0OmcoITEpfX1nZXRGcmVxKCl7c3dpdGNoKHRoaXMuZ2F0ZVN0YXRlKXtjYXNlInByZXRyaWciOnJldHVybiB0aGlzLmdhdGVTdGF0ZT0ib24iLDA7Y2FzZSJvbiI6cmV0dXJuIHRoaXMuZnJlcTtjYXNlIm9mZiI6cmV0dXJuIHRoaXMuZnJlcTtkZWZhdWx0OmcoITEpfX1nZXRWZWxvY2l0eSgpe3N3aXRjaCh0aGlzLmdhdGVTdGF0ZSl7Y2FzZSJwcmV0cmlnIjpyZXR1cm4gdGhpcy5nYXRlU3RhdGU9Im9uIiwwO2Nhc2Uib24iOnJldHVybiB0aGlzLnZlbG9jaXR5O2Nhc2Uib2ZmIjpyZXR1cm4gdGhpcy52ZWxvY2l0eTtkZWZhdWx0OmcoITEpfX19Y2xhc3Mgb3QgZXh0ZW5kcyBte2NvbnN0cnVjdG9yKHQscyxlLGkpe3N1cGVyKHQscyxlLGkpLHRoaXMudHlwZT0ibWlkaWdhdGUifXVwZGF0ZSh0KXtyZXR1cm4gdGhpcy5jaGFubmVsPXQsdGhpcy5nZXRHYXRlKCl9fWNsYXNzIGN0IGV4dGVuZHMgbXtjb25zdHJ1Y3Rvcih0LHMsZSxpKXtzdXBlcih0LHMsZSxpKSx0aGlzLnR5cGU9Im1pZGlmcmVxIn11cGRhdGUodCl7cmV0dXJuIHRoaXMuY2hhbm5lbD10LHRoaXMuZ2V0RnJlcSgpfX1jbGFzcyBkdCBleHRlbmRzIG17Y29uc3RydWN0b3IodCxzLGUsaSl7c3VwZXIodCxzLGUsaSksdGhpcy50eXBlPSJtaWRpdmVsIn11cGRhdGUodCl7cmV0dXJuIHRoaXMuY2hhbm5lbD10LHRoaXMuZ2V0VmVsb2NpdHkoKX19Y2xhc3MgZnR7Y29uc3RydWN0b3IodCxzLGUsaSl7dGhpcy51cD0hMSx0aGlzLnNlbmQ9aSx0aGlzLnZhbHVlPTAsdGhpcy50eXBlPSJjYyJ9c2V0VmFsdWUodCl7dGhpcy52YWx1ZT10fXVwZGF0ZSh0LHMsZSl7cmV0dXJuIHRoaXMuaWQ9cywhdGhpcy51cCYmdD4wPyh0aGlzLnVwPSEwLHRoaXMuc2VuZCh7dHlwZToiU0lHTkFMX1RSSUdHRVIiLGlkOnMsdGltZTplfSksdGhpcy52YWx1ZSk6KHRoaXMudXA9dD4wLHRoaXMudmFsdWUpfX1jbGFzcyBwdCBleHRlbmRzIG97Y29uc3RydWN0b3IodCxzLGUsaSl7c3VwZXIodCxzLGUsaSksdGhpcy50eXBlPSJjYyIsdGhpcy52YWx1ZT1zLmlucHV0c1sxXT8/MH1zZXRWYWx1ZSh0KXt0aGlzLnZhbHVlPXR9dXBkYXRlKHQpe3JldHVybiB0aGlzLmlkPXQsdGhpcy52YWx1ZX19Y2xhc3MgYnQgZXh0ZW5kcyBve2NvbnN0cnVjdG9yKHQscyxlLGkpe3N1cGVyKHQscyxlLGkpLHRoaXMudHlwZT0ibWlkaWNjIix0aGlzLnZhbHVlPXMuaW5wdXRzWzJdPz8tMSx0aGlzLmNoYW5uZWw9LTEsdGhpcy5jY251bWJlcj0tMX1zZXRWYWx1ZSh0KXt0aGlzLnZhbHVlPXR9dXBkYXRlKHQscyl7cmV0dXJuIHRoaXMuY2NudW1iZXI9dCx0aGlzLmNoYW5uZWw9cyx0aGlzLnZhbHVlfX1jbGFzcyBndCBleHRlbmRzIG97Y29uc3RydWN0b3IodCxzLGUsaSl7c3VwZXIodCxzLGUsaSksdGhpcy5jbG9ja1Nnbj0hMCx0aGlzLnN0ZXA9MCx0aGlzLmZpcnN0PSEwfXVwZGF0ZSh0LC4uLnMpe3JldHVybiF0aGlzLmNsb2NrU2duJiZ0PjA/KHRoaXMuc3RlcD0odGhpcy5zdGVwKzEpJXMubGVuZ3RoLHRoaXMuY2xvY2tTZ249dD4wLDApOih0aGlzLmNsb2NrU2duPXQ+MCxzW3RoaXMuc3RlcF0pfX1jbGFzcyBtdCBleHRlbmRzIG97dXBkYXRlKHQsLi4ucyl7Y29uc3QgZT10JXMubGVuZ3RoK3MubGVuZ3RoO3JldHVybiBzW01hdGguZmxvb3IoZSklcy5sZW5ndGhdfX1jbGFzcyBTdHt1cGRhdGUodCxzLGUsaSxuKXtsZXQgcj1QKHQscyxlKTtyZXR1cm4gUyhyLGksbil9fWNsYXNzIHd0e3VwZGF0ZSh0LHMsZSl7cmV0dXJuIE1hdGgubWluKE1hdGgubWF4KHQscyksZSl9fWNsYXNzIHZ0e2NvbnN0cnVjdG9yKCl7dGhpcy5oaT0hMX11cGRhdGUodCl7cmV0dXJuIXRoaXMuaGkmJnQ+MD8odGhpcy5oaT0hMCwxKToodGhpcy5oaSYmdDw9MCYmKHRoaXMuaGk9ITEpLDApfX1jbGFzcyB5dHtjb25zdHJ1Y3Rvcigpe3RoaXMueDE9MCx0aGlzLngyPTAsdGhpcy55MT0wLHRoaXMueTI9MCx0aGlzLmEwPTEsdGhpcy5hMT0wLHRoaXMuYTI9MCx0aGlzLmIwPTEsdGhpcy5iMT0wLHRoaXMuYjI9MH11cGRhdGUodD0wLHM9MCxlPTUwMCxpPTEsbj0xKXtjb25zdCByPTIqTWF0aC5QSSplL3NhbXBsZVJhdGUsbD1NYXRoLnNpbihyKTtpPU1hdGgucG93KDEwLGkvMjApO2NvbnN0IHU9bC8oMippKSxjPU1hdGguY29zKHIpO2lmKHM9PT0wKXRoaXMuYjE9MS1jLHRoaXMuYjA9dGhpcy5iMS8yLHRoaXMuYjI9dGhpcy5iMCx0aGlzLmEwPTErdSx0aGlzLmExPS0yKmMsdGhpcy5hMj0xLXU7ZWxzZSBpZihzPT09MSl0aGlzLmIwPSgxK2MpLzIsdGhpcy5iMT0tKDErYyksdGhpcy5iMj10aGlzLmIwLHRoaXMuYTA9MSt1LHRoaXMuYTE9LTIqYyx0aGlzLmEyPTEtdTtlbHNlIGlmKHM9PT0yKXRoaXMuYjA9bC8yLHRoaXMuYjE9MCx0aGlzLmIyPS10aGlzLmIwLHRoaXMuYTA9MSt1LHRoaXMuYTE9LTIqYyx0aGlzLmEyPTEtdTtlbHNlIGlmKHM9PT0zKXRoaXMuYjA9MSx0aGlzLmIxPS0yKmMsdGhpcy5iMj0xLHRoaXMuYTA9MSt1LHRoaXMuYTE9LTIqYyx0aGlzLmEyPTEtdTtlbHNlIGlmKHM9PT00KXRoaXMuYjA9MS11LHRoaXMuYjE9LTIqYyx0aGlzLmIyPTErdSx0aGlzLmEwPTErdSx0aGlzLmExPS0yKmMsdGhpcy5hMj0xLXU7ZWxzZSBpZihzPT09NSl7Y29uc3QgYT1NYXRoLnBvdygxMCxuLzQwKTt0aGlzLmIwPTErdSphLHRoaXMuYjE9LTIqYyx0aGlzLmIyPTEtdSphLHRoaXMuYTA9MSt1L2EsdGhpcy5hMT0tMipjLHRoaXMuYTI9MS11L2F9ZWxzZSBpZihzPT09Nil7Y29uc3QgYT1NYXRoLnBvdygxMCxuLzQwKSxkPTIqTWF0aC5zcXJ0KGEpKnUsZj0oYS0xKSpjLHA9KGErMSkqYzt0aGlzLmIwPWEqKGErMS1mK2QpLHRoaXMuYjE9MiphKihhLTEtcCksdGhpcy5iMj1hKihhKzEtZi1kKSx0aGlzLmEwPWErMStmK2QsdGhpcy5hMT0tMiooYS0xK3ApLHRoaXMuYTI9YSsxK2YtZH1lbHNlIGlmKHM9PT03KXtjb25zdCBhPU1hdGgucG93KDEwLG4vNDApLGQ9MipNYXRoLnNxcnQoYSkqdSxmPShhLTEpKmMscD0oYSsxKSpjO3RoaXMuYjA9YSooYSsxK2YrZCksdGhpcy5iMT0tMiphKihhLTErcCksdGhpcy5iMj1hKihhKzErZi1kKSx0aGlzLmEwPWErMS1mK2QsdGhpcy5hMT0yKihhLTEtcCksdGhpcy5hMj1hKzEtZi1kfXRoaXMuYjAvPXRoaXMuYTAsdGhpcy5iMS89dGhpcy5hMCx0aGlzLmIyLz10aGlzLmEwLHRoaXMuYTEvPXRoaXMuYTAsdGhpcy5hMi89dGhpcy5hMCx0aGlzLmEwPTE7Y29uc3QgYj10aGlzLmIwKnQrdGhpcy5iMSp0aGlzLngxK3RoaXMuYjIqdGhpcy54Mi10aGlzLmExKnRoaXMueTEtdGhpcy5hMip0aGlzLnkyO3JldHVybiB0aGlzLngyPXRoaXMueDEsdGhpcy54MT10LHRoaXMueTI9dGhpcy55MSx0aGlzLnkxPWIsYn19Y29uc3QgTXQ9T2JqZWN0LmZyZWV6ZShPYmplY3QuZGVmaW5lUHJvcGVydHkoe19fcHJvdG9fXzpudWxsLEFEU1JOb2RlOnEsQXVkaW9JbjpsdCxBdWRpb05vZGU6byxCUEY6cnQsQmlxdWFkRmlsdGVyOnl0LEJyb3duTm9pc2VPc2M6VyxDQzpwdCxDTE9DS19QUFE6TSxDTE9DS19QUFM6TixDbGlwOnd0LENsb2NrOkYsQ2xvY2tEaXY6RCxDbG9ja091dDpMLERlbGF5OlYsRGlzdG9ydDpHLER1c3RPc2M6SyxGaWx0ZXI6bnQsRm9sZDp1dCxIb2xkOlIsSW1wdWxzZU9zYzpZLExhZzppdCxMY2dOb2lzZTpILE1pZGlDQzpidCxNaWRpRnJlcTpjdCxNaWRpR2F0ZTpvdCxNaWRpSW46bSxNaWRpVmVsOmR0LE5vaXNlT3NjOmosT3V0cHV0OkIsUGljazptdCxQaW5rTm9pc2U6WCxQdWxzZU9zYzp6LFJlbWFwOlN0LFNhd09zYzpKLFNjb3BlOmV0LFNlcXVlbmNlOmd0LFNpZGVjaGFpbkNvbXByZXNzb3I6dHQsU2lnbmFsOmZ0LFNpbmVPc2M6USxTbGV3Omh0LFNsaWRlOmF0LFRyaU9zYzpzdCxUcmlnOnZ0LFphd09zYzpafSxTeW1ib2wudG9TdHJpbmdUYWcse3ZhbHVlOiJNb2R1bGUifSkpLHg9bmV3IE1hcChPYmplY3QuZW50cmllcyhNdCkpO2NsYXNzIE90e2NvbnN0cnVjdG9yKHQscyl7Zyh0PT00OGUzKSx0aGlzLnNhbXBsZVJhdGU9dCx0aGlzLnBsYXlQb3M9MCx0aGlzLnNlbmQ9cyx0aGlzLnVuaXRzPVtdLHRoaXMudW5pdElEPTAsdGhpcy5mYWRlVGltZT0uMDEsdGhpcy5tYXhVbml0cz0xLHRoaXMucT1bXX1mYWRlT3V0VW5pdCh0KXt0LmZhZGVPdXQodGhpcy5wbGF5UG9zLHRoaXMuZmFkZVRpbWUpLHRoaXMuZnJlZVVuaXQodC5pZCx0aGlzLmZhZGVUaW1lKX1mYWRlT3V0VW5pdEJ5SWQodCl7Y29uc3Qgcz10aGlzLnVuaXRzLmZpbmQoZT0+ZS5pZD09PXQpO3MmJnRoaXMuZmFkZU91dFVuaXQocyl9ZmFkZU91dEFsbFVuaXRzKCl7dGhpcy51bml0cy5mb3JFYWNoKHQ9PnRoaXMuZmFkZU91dFVuaXQodCkpfWZhZGVPdXRPbGRVbml0cygpe2NvbnN0IHQ9dGhpcy51bml0cy5maWx0ZXIoZT0+ZS5hY3RpdmUpLHM9dC5sZW5ndGgtdGhpcy5tYXhVbml0cztzPD0wfHx0LnNsaWNlKDAscykuZm9yRWFjaChlPT50aGlzLmZhZGVPdXRVbml0KGUpKX1zdG9wKCl7dGhpcy5mYWRlT3V0QWxsVW5pdHMoKSx0aGlzLnNlbmQoe3R5cGU6IlNUT1AiLGZhZGVUaW1lOnRoaXMuZmFkZVRpbWV9KX1zcGF3blVuaXQodCxzKXtjb25zdCBlPW5ldyB4dCh0aGlzLnVuaXRJRCsrLHQsdGhpcy5zYW1wbGVSYXRlLHRoaXMuc2VuZCk7dGhpcy51bml0cy5wdXNoKGUpLGUuZmFkZUluKHRoaXMucGxheVBvcyx0aGlzLmZhZGVUaW1lKSx0aGlzLmZhZGVPdXRPbGRVbml0cygpLGNvbnNvbGUubG9nKGBzcGF3biB1bml0ICR7ZS5pZH0sIHVuaXRzIGFsaXZlOiAke3RoaXMudW5pdHMubGVuZ3RofWApLHMmJnRoaXMuc2NoZWR1bGVNZXNzYWdlKHttc2c6e3R5cGU6IkZBREVfT1VUX1VOSVQiLGlkOmUuaWR9LHRpbWU6c30pfWZyZWVVbml0KHQscyl7aWYocyl7dGhpcy5zY2hlZHVsZU1lc3NhZ2Uoe21zZzp7dHlwZToiRlJFRV9VTklUIixpZDp0fSx0aW1lOnN9KTtyZXR1cm59Y29uc3QgZT10aGlzLnVuaXRzLmxlbmd0aDt0aGlzLnVuaXRzPXRoaXMudW5pdHMuZmlsdGVyKGk9PmkuaWQhPT10KSxlPnRoaXMudW5pdHMubGVuZ3RoJiZjb25zb2xlLmxvZyhgZnJlZSB1bml0ICR7dH0sIHVuaXRzIGFsaXZlOiAke3RoaXMudW5pdHMubGVuZ3RofWApfXBhcnNlTXNnKHQpe3N3aXRjaCh0LnR5cGUpe2Nhc2UiU1BBV05fVU5JVCI6dGhpcy5zcGF3blVuaXQodC51bml0LHQuZHVyYXRpb24pO2JyZWFrO2Nhc2UiRlJFRV9VTklUIjp0aGlzLmZyZWVVbml0KHQuaWQpO2JyZWFrO2Nhc2UiRkFERV9PVVRfVU5JVCI6dGhpcy5mYWRlT3V0VW5pdEJ5SWQodC5pZCk7YnJlYWs7Y2FzZSJOT1RFX09OIjp0aGlzLm5vdGVPbih0KTticmVhaztjYXNlIkNDIjp0aGlzLm1pZGlDQyh0KTticmVhaztjYXNlIlNFVF9DT05UUk9MIjp0aGlzLnNldENvbnRyb2wodCk7YnJlYWs7Y2FzZSJGQURFX1RJTUUiOnRoaXMuZmFkZVRpbWU9TnVtYmVyKHQuZmFkZVRpbWUpO2JyZWFrO2Nhc2UiTUFYX1VOSVRTIjp0aGlzLm1heFVuaXRzPU51bWJlcih0Lm1heFVuaXRzKTticmVhaztjYXNlIlNUT1AiOnRoaXMuc3RvcCgpO2JyZWFrO2Nhc2UiU0VUX1VHRU4iOnRoaXMuYWRkVWdlbih0LmNsYXNzTmFtZSx0LnVnZW4pO2JyZWFrO2Nhc2UiU0NIRURVTEVfTVNHIjp0aGlzLnNjaGVkdWxlTWVzc2FnZSh0KTticmVhaztjYXNlIkJBVENIX01TRyI6dC5tZXNzYWdlcy5mb3JFYWNoKHM9PnRoaXMucGFyc2VNc2cocykpO2JyZWFrO2RlZmF1bHQ6dGhyb3cgbmV3IFR5cGVFcnJvcihgdW5rbm93biBtZXNzYWdlIHR5cGUgJHt0LnR5cGV9YCl9fW5vdGVPbih0KXt0aGlzLnVuaXRzLmZvckVhY2gocz0+cy5ub3RlT24odCkpfW1pZGlDQyh0KXt0aGlzLnVuaXRzLmZvckVhY2gocz0+cy5taWRpQ0ModCkpfXNldENvbnRyb2wodCl7dGhpcy51bml0cy5mb3JFYWNoKHM9PnMuc2V0Q29udHJvbCh0KSl9c2NoZWR1bGVNZXNzYWdlKHQpe2lmKHQudGltZT10aGlzLnBsYXlQb3MrdC50aW1lLCF0aGlzLnEubGVuZ3RoKXt0aGlzLnEucHVzaCh0KTtyZXR1cm59bGV0IHM9MDtmb3IoO3M8dGhpcy5xLmxlbmd0aCYmdGhpcy5xW3NdLnRpbWU8dC50aW1lOylzKys7dGhpcy5xLnNwbGljZShzLDAsdCl9Z2VuU2FtcGxlKHQpe2Zvcig7dGhpcy5xLmxlbmd0aD4wJiZ0aGlzLnFbMF0udGltZTw9dGhpcy5wbGF5UG9zOyl0aGlzLnBhcnNlTXNnKHRoaXMucVswXS5tc2cpLHRoaXMucS5zaGlmdCgpO2lmKCF0aGlzLnVuaXRzLmxlbmd0aClyZXR1cm5bMCwwXTtjb25zdCBzPVswLDBdO2ZvcihsZXQgZT0wO2U8dGhpcy51bml0cy5sZW5ndGg7ZSsrKXtjb25zdCBpPXRoaXMudW5pdHNbZV0sbj1pLmdldExldmVsKHRoaXMucGxheVBvcyk7aS5nZW5TYW1wbGUodGhpcy5wbGF5UG9zLGkubm9kZXMsdCxpLnJlZ2lzdGVycyxpLm91dHB1dHMsaS5zb3VyY2VzKSxzWzBdKz1pLm91dHB1dHNbMF0qbixzWzFdKz1pLm91dHB1dHNbMV0qbn1yZXR1cm4gdGhpcy5wbGF5UG9zKz0xLzQ4ZTMsc31hZGRVZ2VuKHQscyl7Y29uc3QgZT1uZXcgRnVuY3Rpb24oYCR7c307cmV0dXJuICR7dH1gKSgpO3guc2V0KHQsZSl9fWNsYXNzIHh0e2NvbnN0cnVjdG9yKHQscyxlLGkpe3RoaXMuaWQ9dCx0aGlzLnNhbXBsZVJhdGU9ZSx0aGlzLnNlbmQ9aSx0aGlzLm5vZGVzPVtdLHRoaXMuYWN0aXZlPSEwO2ZvcihsZXQgciBpbiBzLnVnZW5zKXtjb25zdCBsPXMudWdlbnNbcl07aWYoeC5oYXMobC50eXBlKSl7Y29uc3QgdT14LmdldChsLnR5cGUpLGM9TnVtYmVyKHIpO3RoaXMubm9kZXNbY109bmV3IHUoYyxsLHRoaXMuc2FtcGxlUmF0ZSx0aGlzLnNlbmQpfWVsc2UgY29uc29sZS53YXJuKGB1bmtub3duIHVnZW4gIiR7bC50eXBlfSJgKX10aGlzLnJlZ2lzdGVycz1uZXcgQXJyYXkocy5yZWdpc3RlcnMpLmZpbGwoMCk7bGV0IG49MTY7dGhpcy5vdXRwdXRzPW5ldyBBcnJheShuKS5maWxsKDApLHRoaXMuc291cmNlcz1uZXcgQXJyYXkobikuZmlsbCgwKSxzLnNyYz1gby5maWxsKDApOyAvLyByZXNldCBvdXRwdXRzCmArcy5zcmMsdGhpcy5nZW5TYW1wbGU9bmV3IEZ1bmN0aW9uKCJ0aW1lIiwibm9kZXMiLCJpbnB1dCIsInIiLCJvIiwicyIscy5zcmMpfW5vdGVPbih0KXt2YXIgdSxjLGI7Y29uc3R7Y2hhbm5lbDpzLG5vdGU6ZSx2ZWxvY2l0eTppfT10LG49dGhpcy5ub2Rlcy5maWx0ZXIoYT0+YS50eXBlPT09Im1pZGlmcmVxIiYmKGEuY2hhbm5lbD09PS0xfHxhLmNoYW5uZWw9PT1zKSkscj10aGlzLm5vZGVzLmZpbHRlcihhPT5hLnR5cGU9PT0ibWlkaWdhdGUiJiYoYS5jaGFubmVsPT09LTF8fGEuY2hhbm5lbD09PXMpKSxsPXRoaXMubm9kZXMuZmlsdGVyKGE9PmEudHlwZT09PSJtaWRpdmVsIiYmKGEuY2hhbm5lbD09PS0xfHxhLmNoYW5uZWw9PT1zKSk7aWYoaT4wKXtsZXQgYT1uLmZpbmQocD0+cC5pc0ZyZWUoKSl8fG5bMF0sZD1yLmZpbmQocD0+cC5pc0ZyZWUoKSl8fHJbMF0sZj1sLmZpbmQocD0+cC5pc0ZyZWUoKSl8fGxbMF07YT09bnVsbHx8YS5ub3RlT24oZSxpKSxkPT1udWxsfHxkLm5vdGVPbihlLGkpLGY9PW51bGx8fGYubm90ZU9uKGUsaSl9ZWxzZSh1PW4uZmluZChhPT5hLm5vdGU9PT1lKSk9PW51bGx8fHUubm90ZU9mZigpLChjPXIuZmluZChhPT5hLm5vdGU9PT1lKSk9PW51bGx8fGMubm90ZU9mZigpLChiPWwuZmluZChhPT5hLm5vdGU9PT1lKSk9PW51bGx8fGIubm90ZU9mZigpfW1pZGlDQyh0KXtjb25zdHtjaGFubmVsOnMsY2M6ZSx2YWx1ZTppfT10O3RoaXMubm9kZXMuZm9yRWFjaChuPT57bi50eXBlPT09Im1pZGljYyImJihuLmNoYW5uZWw9PT0tMXx8bi5jaGFubmVsPT09cykmJm4uY2NudW1iZXI9PT1lJiZuLnNldFZhbHVlKGkpfSl9c2V0Q29udHJvbCh0KXtjb25zdHt2YWx1ZTpzLGlkOmV9PXQsaT10aGlzLm5vZGVzLmZpbmQobj0+bi50eXBlPT09ImNjIiYmbi5pZD09PWUpO2kmJmkuc2V0VmFsdWUocyl9Z2V0TGV2ZWwodCl7cmV0dXJuIHRoaXMuZmFkZVN0YXJ0PT09dm9pZCAwPzA6dGhpcy5hY3RpdmU/UygodC10aGlzLmZhZGVTdGFydCkvdGhpcy5mYWRlVGltZSwwLC4zKTpTKCh0LXRoaXMuZmFkZVN0YXJ0KS90aGlzLmZhZGVUaW1lLHRoaXMuZmFkZUZyb20sMCl9ZmFkZUluKHQscyl7dGhpcy5mYWRlU3RhcnQ9dCx0aGlzLmZhZGVUaW1lPXN9ZmFkZU91dCh0LHMpe3RoaXMuZmFkZVRpbWU9cyx0aGlzLmZhZGVGcm9tPXRoaXMuZ2V0TGV2ZWwodCksdGhpcy5hY3RpdmU9ITEsdGhpcy5mYWRlU3RhcnQ9dH1pc0RvbmUodCl7cmV0dXJuIXRoaXMuYWN0aXZlJiZ0aGlzLmdldExldmVsKHQpPT09MH19Y2xhc3MgVHQgZXh0ZW5kcyBBdWRpb1dvcmtsZXRQcm9jZXNzb3J7Y29uc3RydWN0b3IoKXtzdXBlcigpLHRoaXMucG9ydC5vbm1lc3NhZ2U9dGhpcy5vbm1lc3NhZ2UuYmluZCh0aGlzKSx0aGlzLmF1ZGlvR3JhcGg9bmV3IE90KDQ4ZTMsdGhpcy5wb3J0LnBvc3RNZXNzYWdlLmJpbmQodGhpcy5wb3J0KSl9b25tZXNzYWdlKHQpe2xldCBzPXQuZGF0YTt0aGlzLmF1ZGlvR3JhcGgucGFyc2VNc2cocyl9cHJvY2Vzcyh0LHMsZSl7Y29uc3QgaT1zWzBdLG49dFswXVswXSxyPWlbMF0sbD1pWzFdO2ZvcihsZXQgdT0wO3U8ci5sZW5ndGg7dSsrKXtsZXRbYyxiXT10aGlzLmF1ZGlvR3JhcGguZ2VuU2FtcGxlKG4/blt1XTowKTtyW3VdPWMsbFt1XT1ifXJldHVybiEwfX1yZWdpc3RlclByb2Nlc3Nvcigic2FtcGxlLWdlbmVyYXRvciIsVHQpfSkoKTsK", ye = "data:text/javascript;base64,KGZ1bmN0aW9uKCl7InVzZSBzdHJpY3QiO2NsYXNzIG4gZXh0ZW5kcyBBdWRpb1dvcmtsZXRQcm9jZXNzb3J7c3RhdGljIGdldCBwYXJhbWV0ZXJEZXNjcmlwdG9ycygpe3JldHVyblt7bmFtZToiaXNSZWNvcmRpbmciLGRlZmF1bHRWYWx1ZTowfV19Y29uc3RydWN0b3IoKXtzdXBlcigpLHRoaXMuX2J1ZmZlclNpemU9MjA0OCx0aGlzLl9idWZmZXI9bmV3IEZsb2F0MzJBcnJheSh0aGlzLl9idWZmZXJTaXplKSx0aGlzLl9pbml0QnVmZmVyKCl9X2luaXRCdWZmZXIoKXt0aGlzLl9ieXRlc1dyaXR0ZW49MH1faXNCdWZmZXJFbXB0eSgpe3JldHVybiB0aGlzLl9ieXRlc1dyaXR0ZW49PT0wfV9pc0J1ZmZlckZ1bGwoKXtyZXR1cm4gdGhpcy5fYnl0ZXNXcml0dGVuPT09dGhpcy5fYnVmZmVyU2l6ZX1fYXBwZW5kVG9CdWZmZXIoZSl7dGhpcy5faXNCdWZmZXJGdWxsKCkmJnRoaXMuX2ZsdXNoKCksdGhpcy5fYnVmZmVyW3RoaXMuX2J5dGVzV3JpdHRlbl09ZSx0aGlzLl9ieXRlc1dyaXR0ZW4rPTF9X2ZsdXNoKCl7bGV0IGU9dGhpcy5fYnVmZmVyO3RoaXMuX2J5dGVzV3JpdHRlbjx0aGlzLl9idWZmZXJTaXplJiYoZT1lLnNsaWNlKDAsdGhpcy5fYnl0ZXNXcml0dGVuKSksdGhpcy5wb3J0LnBvc3RNZXNzYWdlKHtldmVudFR5cGU6ImRhdGEiLGF1ZGlvQnVmZmVyOmV9KSx0aGlzLl9pbml0QnVmZmVyKCl9X3JlY29yZGluZ1N0b3BwZWQoKXt0aGlzLnBvcnQucG9zdE1lc3NhZ2Uoe2V2ZW50VHlwZToic3RvcCJ9KX1wcm9jZXNzKGUsbyxoKXtjb25zdCBpPWguaXNSZWNvcmRpbmcsZj1vWzBdLHM9ZVswXSx1PWZbMF0sXz1mWzFdO2xldCByPSExO2ZvcihsZXQgdD0wO3Q8dS5sZW5ndGg7dCsrKXQ8aS5sZW5ndGgmJihyPWlbdF09PT0xKSwhciYmIXRoaXMuX2lzQnVmZmVyRW1wdHkoKSYmKHRoaXMuX2ZsdXNoKCksdGhpcy5fcmVjb3JkaW5nU3RvcHBlZCgpKSxyJiYodGhpcy5fYXBwZW5kVG9CdWZmZXIoc1swXVt0XSksdGhpcy5fYXBwZW5kVG9CdWZmZXIoc1sxXVt0XSkpLHVbdF09c1swXVt0XSxfW3RdPXNbMV1bdF07cmV0dXJuITB9fXJlZ2lzdGVyUHJvY2Vzc29yKCJyZWNvcmRlciIsbil9KSgpOwo=", k, Xe = (e) => `Math.sin(${e})`, Ze = (e) => `Math.cos(${e})`, be = (e) => `Math.tan(${e})`, xe = (e) => `Math.asin(${e})`, Re = (e) => `Math.acos(${e})`, Le = (e) => `Math.atan(${e})`, B = (e, t, i) => `${e} = ${t};${i ? ` /* ${i} */` : ""}`, w = (e, ...t) => B(e.name, `nodes[${e.ugenIndex}].update(${t.join(",")})`, e.node.type), Me = (e) => `(2 ** ((${e} - 69) / 12) * 440)`, ze = (e, t) => `${e} ** ${t}`, Ve = (e) => `Math.exp(${e})`, We = (e) => `Math.log(${e})`, Ye = (e, t) => `${e}%${t}`, Ne = (e) => `Math.abs(${e})`, He = (e) => `Math.round(${e})`, Se = (e) => `Math.floor(${e})`, Te = (e) => `Math.sign(${e})`, we = (e) => `Math.ceil(${e})`, Ke = (e, t) => `Math.min(${e}, ${t})`, Ce = (e, t) => `Math.max(${e}, ${t})`, ve = (e, t) => `[${e}, ${t}]`, L = (e) => `${e}[0]`, Ie = (e) => `${e}[1]`, Ue = (e, t) => `(${L(e)} < ${L(t)} ? ${e} : ${t})`, ke = (e, t) => `(${L(e)} > ${L(t)} ? ${e} : ${t})`, Pe, je = 0, _i, Qe = (e) => `sin(${e})`, Be = (e) => `cos(${e})`, Ee = (e) => `tan(${e})`, Oe = (e) => `asin(${e})`, $e = (e) => `acos(${e})`, De = (e) => `atan(${e})`, N = (e, t, i) => `${e} = ${t};${i ? ` /* ${i} */` : ""}`, Ae = (e, ...t) => {
  if (t.unshift(`nodes[${e.ugenIndex}]`), e.ugen === "Sequence" || e.ugen === "Pick") {
    const i = t.length - 2, n = `(float[${i}]){${t.slice(2).join(",")}}`;
    return N(e.name, `${e.ugen}_update(${t[0]}, ${t[1]}, ${i}, ${n})`, e.ugen);
  }
  return N(e.name, `${e.ugen}_update(${t.join(",")})`, e.ugen);
}, qe = (e) => `pow(2.0, ((${e} - 69.0) / 12.0)) * 440.0`, _e = (e, t) => `pow(${e}, ${t})`, et = (e) => `exp(${e})`, tt = (e) => `log(${e})`, it = (e, t) => `${e}>=${t}?${e}-${t}:${e}`, nt = (e) => `fabs(${e})`, st = (e, t) => `fmin(${e}, ${t})`, lt = (e, t) => `fmax(${e}, ${t})`, at = (e) => `fround(${e})`, ot = (e) => `floor(${e})`, dt = (e) => `ceil(${e})`, ct = (e, t) => `((pair) {${e}, ${t}})`, M = (e) => `${e}.a`, pt = (e) => `${e}.b`, ut = (e, t) => `(${M(e)} < ${M(t)} ? ${e} : ${t})`, mt = (e, t) => `(${M(e)} > ${M(t)} ? ${e} : ${t})`, rt, s, E = (e, t) => a(e, {
  ugen: t,
  compile: ({ vars: i, ...n }) => s[n.lang].defUgen(n, ...i)
}), ht, Gt, yt, ft, gt, Xt, Zt, bt, xt, Rt, O, Lt, Mt, zt, Vt, $, Wt, Yt, Nt, Ht, St, Tt, wt, Kt, D, Ct, vt, It, Ut, kt, Pt, Ft, Jt, K, jt, H, A, Qt, q, _, Bt, Et, Ot, $t, Dt, C, At, qt, _t, ei, ti, ii, ni, si, li, ai, oi, di, ci, ee, te, pi, ui, mi, ri, hi, Gi, yi, fi, gi, Xi, Zi, bi, xi, Ri, Li, ie, ne, Mi, zi, Vi, Wi, Yi, Ni, Hi, Si, Ti, wi, Ki, Ci, vi, Ii, Ui, ki, Pi, Fi, Ji, ji, Qi = (e) => C(e), Bi, Ei, Oi, $i, Di, Ai, qi, P2;
var init_dist = __esm(() => {
  y = /* @__PURE__ */ new Map;
  c.prototype.inherit = function(e) {
    return e.inputOf && (this.inputOf = e.inputOf), e.outputOf && (this.outputOf = e.outputOf), this;
  };
  c.prototype.toObject = function() {
    return JSON.parse(JSON.stringify(this));
  };
  c.prototype.stringify = function() {
    return JSON.stringify(this, null, 2).replaceAll('"', "'");
  };
  y.set("register", {
    tags: ["meta"],
    graph: false,
    description: "Registers a new Node function. Sets it on the prototype + returns the function itself. Like `module` but doesn't hide complexity in graph viz.",
    examples: [
      `let kick = register('kick', gate => gate.adsr(0,.11,0,.11)
.apply(env => env.mul(env)
  .mul(158)
  .sine(env)
  .distort(.85)
))
impulse(2).kick().out()`
    ]
  });
  y.set("module", {
    tags: ["meta"],
    graph: true,
    description: "Creates a module. Like `register`, but the graph viz will hide the internal complexity of the module.",
    examples: [
      `let kick = module('kick', gate => gate.adsr(0,.11,0,.11)
.apply(env => env.mul(env)
  .mul(158)
  .sine(env)
  .distort(.85)
))
impulse(2).kick().out()`
    ]
  });
  y.set("n", {
    tags: ["math"],
    description: "Constant value node. Turns a number into a Node.",
    ins: [{ name: "value", default: 0 }]
  });
  y.set("out", {
    tags: ["meta"],
    description: "Sends the node to the audio output"
  });
  y.set("withIns", {
    internal: true,
    tags: ["innards"],
    description: "Sets the inputs of a node. Returns the node itself",
    ins: [{ name: "in", dynamic: true }]
  });
  c.prototype.withIns = function(...e) {
    return this.ins = e, this;
  };
  y.set("flatten", {
    internal: true,
    tags: ["innards"],
    description: "Flattens the node to a list of all nodes in the graph, where each Node's ins are now indices"
  });
  c.prototype.flatten = function() {
    return pe(this);
  };
  y.set("apply", {
    graph: true,
    tags: ["meta"],
    description: "Applies the given function to the Node. Useful when a node has to be used multiple times.",
    examples: [
      `impulse(4)
.apply(imp=>imp
  .seq(110,220,330,440)
  .sine()
  .mul( imp.ad(.1,.1) )
).out()`
    ]
  });
  c.prototype.apply = function(e) {
    return e(this);
  };
  y.set("clone", {
    internal: true,
    tags: ["innards"],
    description: "Clones the node"
  });
  c.prototype.clone = function() {
    return new c(this.type, this.value).withIns(...this.ins);
  };
  y.set("map", {
    tags: ["meta"],
    description: "Applies the given function to all ins if it's poly node. Otherwise it applies the function to itself.",
    examples: [
      `n([110,220,330])
.map( freq=>freq.mul([1,1.007]).saw().mix() )
.mix(2).mul(.5).out()`
    ]
  });
  c.prototype.map = function(e) {
    return this.type !== "poly" ? e(this) : poly(...this.ins.map(e));
  };
  c.prototype.channel = function(e) {
    return this.type !== "poly" ? this : this.ins[e % this.ins.length];
  };
  y.set("select", {
    tags: ["meta"],
    graph: true,
    description: "Find the first occurence of the given type up in the graph and returns the match. Useful to exit a feedback loop at another point.",
    examples: [
      `sine(220).mul(impulse(1).ad(.001,.2))
.add( x=>x.delay(.2).mul(.8) )
.select('delay').out()
`
    ]
  });
  c.prototype.select = function(e) {
    for (let t of this.ins) {
      if (t.type === e)
        return t;
      const i = t.select(e);
      if (i)
        return i;
    }
  };
  y.set("debug", {
    tags: ["meta"],
    description: "Logs the node to the console"
  });
  c.prototype.debug = function(e = (t) => t) {
    return console.log(e(this)), this;
  };
  J = a("exit", { internal: true });
  c.prototype.over = function(e) {
    return this.apply((t) => add(t, e(t)));
  };
  c.prototype.dfs = function(e, t) {
    return this.apply((i) => S(i, e, t));
  };
  c.prototype.apply2 = function(e) {
    return e(this, this);
  };
  c.prototype.asModuleInput = function(e, t, i) {
    return this.inputOf = this.inputOf || [], this.inputOf.push([e, t, i]), this;
  };
  c.prototype.asModuleOutput = function(e, t) {
    return this.outputOf = [e, t], this;
  };
  c.prototype.compile = function(e) {
    return T(this, e);
  };
  U = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    compile: T
  }, Symbol.toStringTag, { value: "Module" }));
  me = class me extends Q {
    constructor(t = navigator) {
      super(), this.midiAccess = null, this.getMIDIAccess(t);
    }
    async getMIDIAccess(t) {
      if ("requestMIDIAccess" in t) {
        this.midiAccess = await t.requestMIDIAccess({ sysex: false }), console.log("got MIDI access");
        for (let i of this.midiAccess.inputs.values())
          i.state == "connected" && (i.onmidimessage = (n) => this.trigger("midimessage", i.id, n.data));
        this.midiAccess.onstatechange = (i) => {
          i.port.type == "input" && i.port.state == "connected" && (console.log("MIDI device connected:", i.port.name, "PORT:", i.port.id), i.port.onmidimessage = (n) => this.trigger("midimessage", i.port.id, n.data));
        };
      }
    }
    broadcast(t, i) {
      if (midi)
        for (let n of this.midiAccess.outputs.values())
          n.send(t, i);
    }
  };
  he = class he extends Q {
    constructor() {
      super(), this.attach();
    }
    attach() {
      typeof window < "u" && (this.handleMouseMove = (t) => {
        const i = t.clientX / document.body.clientWidth * 2 - 1, n = t.clientY / document.body.clientHeight * 2 - 1;
        this.trigger("move", i, n);
      }, document.addEventListener("mousemove", this.handleMouseMove));
    }
    detach() {
      typeof window < "u" && document.removeEventListener("mousemove", this.handleMouseMove);
    }
  };
  k = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    Node: c,
    compile: T,
    evaluate: j,
    exit: J,
    exportModule: ce,
    getInletName: oe,
    getNode: F,
    module: g,
    n: f,
    node: x,
    nodeRegistry: y,
    outputType: Y,
    polyType: Z,
    register: u,
    registerNode: a
  }, Symbol.toStringTag, { value: "Module" }));
  Pe = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    abs: Ne,
    ceil: we,
    def: B,
    defAcos: Re,
    defAsin: xe,
    defAtan: Le,
    defCos: Ze,
    defSin: Xe,
    defTan: be,
    defUgen: w,
    exp: Ve,
    floor: Se,
    log: We,
    max: Ce,
    midinote: Me,
    min: Ke,
    mod: Ye,
    pair_a: L,
    pair_a_max: ke,
    pair_a_min: Ue,
    pair_b: Ie,
    pair_make: ve,
    pow: ze,
    round: He,
    sign: Te
  }, Symbol.toStringTag, { value: "Module" }));
  _i = u("signal", (e, t) => {
    const i = je++, n = getNode("signal", e, i);
    return n.callback = t, n.id = i, n;
  }, {
    ugen: "Signal",
    compile: ({ vars: [e, t], ...i }) => w(i, e, t, "time")
  });
  rt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    abs: nt,
    ceil: dt,
    def: N,
    defAcos: $e,
    defAsin: Oe,
    defAtan: De,
    defCos: Be,
    defSin: Qe,
    defTan: Ee,
    defUgen: Ae,
    exp: et,
    floor: ot,
    log: tt,
    max: lt,
    midinote: qe,
    min: st,
    mod: it,
    pair_a: M,
    pair_a_max: mt,
    pair_a_min: ut,
    pair_b: pt,
    pair_make: ct,
    pow: _e,
    round: at
  }, Symbol.toStringTag, { value: "Module" }));
  s = {
    js: Pe,
    c: rt
  };
  ht = u("time", (e) => new c("time", e), {
    tags: ["meta"],
    description: "Returns elapsed time in seconds",
    compile: ({ name: e, lang: t }) => s[t].def(e, "time")
  });
  Gt = u("raw", (e, t) => new c("raw", t).withIns(f(e)), {
    ins: [
      { name: "in" },
      {
        name: "code",
        description: "expression with variable `t` being the elapsed time and `$input` the input."
      }
    ],
    tags: ["meta"],
    description: "Raw code node, expects floats between -1 and 1",
    compile: ({ vars: e, node: t, name: i }) => `let $input = ${e[0]}; 
const ${i} = (${t.value}); // raw`,
    examples: [
      `sine(4).range(.5,1)
.raw("(time*110%1*2-1)*$input")
.out()`
    ]
  });
  yt = u("bytebeat", (e, t) => new c("bytebeat", t).withIns(f(e)), {
    ins: [
      { name: "t", description: "time in samples" },
      {
        name: "code",
        description: "bytebeat code with variable `t`"
      }
    ],
    tags: ["meta"],
    description: "Bytebeat node, expects numbers from 0 to 255",
    examples: [
      `time().mul(8000).bytebeat\`
// Fractalized Past
// by: lhphr
// from: https://dollchan.net/btb/res/3.html#69

(t>>10^t>>11)%5*((t>>14&3^t>>15&1)+1)*t%99+((3+(t>>14&3)-(t>>16&1))/3*t%99&64)
\`.out()`
    ],
    compile: ({ vars: e, node: t, name: i }) => `let t = ${e[0]}; 
const ${i} = ((${t.value}) & 255) / 127.5 - 1; // bytebeat`
  });
  ft = u("floatbeat", (e, t) => new c("bytebeat", t).withIns(f(e)), {
    ins: [
      { name: "t", description: "time in samples" },
      {
        name: "code",
        description: "floatbeat code with variable `t`"
      }
    ],
    tags: ["meta"],
    description: "Raw code node, expects numbers from -1 to 1",
    compile: ({ vars: e, node: t, name: i }) => `let t = ${e[0]}; const ${i} = (${t.value}); // floatbeat`
  });
  gt = a("adsr", {
    ugen: "ADSRNode",
    tags: ["envelope"],
    description: "ADSR envelope",
    examples: [
      `impulse(1).perc(.5)
.adsr(.01, .1, .5, .1)
.mul(sine(220)).out()`
    ],
    ins: [
      { name: "gate", default: 0, description: "gate input" },
      { name: "att", default: 0.02, description: "attack time" },
      { name: "dec", default: 0.1, description: "decay time" },
      { name: "sus", default: 0.2, description: "sustain level" },
      { name: "rel", default: 0.1, description: "release time" }
    ],
    compile: ({
      vars: [e = 0, t = 0.02, i = 0.1, n = 0.2, l = 0.1],
      ...o
    }) => s[o.lang].defUgen(o, "time", e, t, i, n, l)
  });
  Xt = g("ar", (e = 0, t = 0.02, i = 0.1) => e.adsr(t, 0, 1, i), {
    tags: ["envelope"],
    description: "AR envelope",
    examples: ["impulse(1).ad(.01, .1).mul(sine(220)).out()"],
    ins: [
      { name: "trig", default: 0, description: "gate input" },
      { name: "att", default: 0.02, description: "attack time" },
      { name: "rel", default: 0.1, description: "release time" }
    ]
  });
  Zt = g("ad", (e = 0, t = 0.02, i = 0.1) => e.adsr(t, i, 0, i), {
    tags: ["envelope"],
    description: "AD envelope",
    examples: ["impulse(1).ad(.01, .1).mul(sine(220)).out()"],
    ins: [
      { name: "trig", default: 0, description: "gate input" },
      { name: "att", default: 0.02, description: "attack time" },
      { name: "dec", default: 0.1, description: "decay time" }
    ]
  });
  bt = a("clock", {
    ugen: "Clock",
    internal: true,
    tags: ["regular", "clock"],
    description: "Clock source, with tempo in BPM",
    examples: ["clock(120).clockdiv(16).mul(sine(220)).out()"],
    ins: [
      {
        name: "bpm",
        default: 120,
        description: "clock tempo in bpm (beats per minute)"
      }
    ],
    compile: ({ vars: [e = 120], ...t }) => s[t.lang].defUgen(t, e)
  });
  xt = a("clockdiv", {
    ugen: "ClockDiv",
    tags: ["clock", "trigger"],
    description: "Clock signal divider",
    examples: ["impulse(8).clockdiv(2).ad(.1,.1).mul(sine(220)).out()"],
    ins: [
      { name: "clock", default: 0, description: "clock input" },
      { name: "divisor", default: 2, description: "tempo divisor" }
    ],
    compile: ({ vars: [e = 0, t = 2], ...i }) => s[i.lang].defUgen(i, e, t)
  });
  Rt = a("distort", {
    ugen: "Distort",
    tags: ["fx", "distortion"],
    description: "Overdrive-style distortion",
    examples: [
      `sine(220)
.distort( saw(.5).range(0,1) )
.out()`
    ],
    ins: [
      { name: "in", default: 0 },
      { name: "amt", default: 0, description: "distortion amount" }
    ],
    compile: ({ vars: [e = 0, t = 0], ...i }) => s[i.lang].defUgen(i, e, t)
  });
  O = a("noise", {
    ugen: "NoiseOsc",
    tags: ["source", "noise"],
    description: "White noise source",
    examples: ["noise().mul(.25).out()"],
    ins: [
      {
        name: "next",
        default: 1,
        description: "if 0, the noise will hold the previous value. defaults to 1."
      }
    ],
    compile: ({ lang: e, vars: [t = 1], ...i }) => s[e].defUgen(i, t)
  });
  Lt = a("lcgnoise", {
    ugen: "LcgNoise",
    tags: ["source", "noise"],
    description: "Lcg white noise source.",
    examples: ["lcgnoise().mul(.25).out()"],
    ins: [
      {
        name: "next",
        default: 1,
        description: "if 0, the noise will hold the previous value. defaults to 1."
      },
      {
        name: "reset",
        default: 0,
        description: "if 1, the random number generator sequence will reset."
      }
    ],
    compile: ({ lang: e, vars: [t = 1, i = 0], ...n }) => s[e].defUgen(n, t, i)
  });
  Mt = a("pink", {
    ugen: "PinkNoise",
    tags: ["source", "noise"],
    description: "Pink noise source",
    examples: ["pink().mul(.5).out()"],
    ins: [],
    compile: ({ lang: e, ...t }) => s[e].defUgen(t)
  });
  zt = a("brown", {
    ugen: "BrownNoiseOsc",
    tags: ["source", "noise"],
    description: "Brown noise source",
    examples: ["brown().out()"],
    ins: [],
    compile: ({ lang: e, ...t }) => s[e].defUgen(t)
  });
  Vt = a("dust", {
    ugen: "DustOsc",
    tags: ["trigger", "noise", "source"],
    description: "Generates random impulses from 0 to +1.",
    examples: ["dust(200).out()"],
    ins: [
      { name: "density", default: 0, description: "average impulses per second" }
    ],
    compile: ({ vars: [e = 0], ...t }) => s[t.lang].defUgen(t, e)
  });
  $ = a("impulse", {
    ugen: "ImpulseOsc",
    tags: ["regular", "trigger"],
    description: "Regular single sample impulses (0 - 1)",
    examples: ["impulse(10).out()"],
    ins: [
      { name: "freq", default: 0 },
      { name: "phase", default: 0 }
    ],
    compile: ({ vars: [e = 0, t = 0], ...i }) => s[i.lang].defUgen(i, e, t)
  });
  Wt = a("saw", {
    ugen: "SawOsc",
    tags: ["regular", "waveform", "source"],
    description: "Sawtooth wave oscillator with anti aliasing",
    examples: ["saw(110).mul(.5).out()"],
    ins: [{ name: "freq", default: 0 }],
    compile: ({ vars: [e = 0], ...t }) => s[t.lang].defUgen(t, e)
  });
  Yt = a("zaw", {
    ugen: "ZawOsc",
    tags: ["regular", "waveform", "source"],
    description: "Sawtooth wave oscillator with sharp edges. Use saw for anti aliased variant.",
    examples: ["zaw(110).mul(.5).out()"],
    ins: [{ name: "freq", default: 0 }],
    compile: ({ vars: [e = 0], ...t }) => s[t.lang].defUgen(t, e)
  });
  Nt = a("sine", {
    tags: ["regular", "waveform", "source"],
    ugen: "SineOsc",
    description: "Sine wave oscillator",
    examples: ["sine(220).out()"],
    ins: [
      { name: "freq", default: 0 },
      { name: "sync", default: 0, description: "sync input" },
      { name: "phase", default: 0, description: "phase offset" }
    ],
    compile: ({ vars: [e = 0, t = 0, i = 0], ...n }) => s[n.lang].defUgen(n, e, t, i)
  });
  Ht = a("tri", {
    ugen: "TriOsc",
    tags: ["regular", "waveform", "source"],
    description: "Triangle wave oscillator",
    examples: ["tri(220).out()"],
    ins: [{ name: "freq", default: 0 }],
    compile: ({ vars: [e = 0], ...t }) => s[t.lang].defUgen(t, e)
  });
  St = a("pulse", {
    ugen: "PulseOsc",
    tags: ["regular", "waveform", "source"],
    description: "Pulse wave oscillator",
    examples: ["pulse(220, sine(.1).range(.1,.5)).mul(.5).out()"],
    ins: [
      { name: "freq", default: 0 },
      { name: "pw", default: 0.5, description: "pulse width 0 - 1" }
    ],
    compile: ({ vars: [e = 0, t = 0.5], ...i }) => s[i.lang].defUgen(i, e, t)
  });
  Tt = a("slide", {
    ugen: "Slide",
    tags: ["fx"],
    internal: true,
    description: "Slide/portamento node",
    examples: [
      `impulse(2).seq(55,110,220,330)
.slide(4).sine().out()`
    ],
    ins: [
      { name: "in", default: 0 },
      { name: "rate", default: 1 }
    ],
    compile: ({ vars: [e = 0, t = 1], ...i }) => s[i.lang].defUgen(i, e, t)
  });
  wt = a("lag", {
    ugen: "Lag",
    tags: ["fx"],
    description: "Smoothes a signal. Good for slide / portamento effects.",
    examples: [
      `impulse(2).seq(220,330,440,550)
.lag(.4).sine().out()`
    ],
    ins: [
      { name: "in", default: 0 },
      { name: "rate", default: 1, description: "60 dB lag time in seconds" }
    ],
    compile: ({ vars: [e = 0, t = 1], ...i }) => s[i.lang].defUgen(i, e, t)
  });
  Kt = a("slew", {
    ugen: "Slew",
    tags: ["fx"],
    description: "Limits the slope of an input signal. The slope is expressed in units per second.",
    examples: ["pulse(800).slew(4000, 4000).out()"],
    ins: [
      { name: "in", default: 0 },
      {
        name: "up",
        default: 1,
        description: "Maximum upward slope in units per second"
      },
      {
        name: "dn",
        default: 1,
        description: "Maximum downward slope in units per second"
      }
    ],
    compile: ({ vars: [e = 0, t = 1, i = 1], ...n }) => s[n.lang].defUgen(n, e, t, i)
  });
  D = a("filter", {
    ugen: "Filter",
    tags: ["fx", "filter"],
    internal: true,
    description: "Two-pole low-pass filter",
    examples: ["saw(55).lpf( sine(1).range(.4,.8) ).out()"],
    ins: [
      { name: "in", default: 0 },
      { name: "cutoff", default: 1 },
      { name: "reso", default: 0 }
    ],
    compile: ({ vars: [e = 0, t = 1, i = 0], ...n }) => s[n.lang].defUgen(n, e, t, i)
  });
  Ct = a("fold", {
    ugen: "Fold",
    tags: ["fx", "distortion", "limiter"],
    description: 'Distort incoming audio signal by "folding"',
    examples: [
      `sine(55)
.fold( sine(.5).range(0.2,4) )
.out()`
    ],
    ins: [
      { name: "in", default: 0 },
      { name: "rate", default: 0 }
    ],
    compile: ({ vars: [e = 0, t = 0], ...i }) => s[i.lang].defUgen(i, e, t)
  });
  vt = a("seq", {
    ugen: "Sequence",
    tags: ["sequencer"],
    description: "Trigger controlled sequencer",
    examples: [
      `impulse(2).seq(220,330,440,550)
.sine().out()`
    ],
    ins: [
      { name: "trig", default: 0 },
      { name: "step", default: 0, dynamic: true, description: "step inputs" }
    ],
    compile: ({ vars: e, ...t }) => s[t.lang].defUgen(t, ...e)
  });
  It = a("delay", {
    ugen: "Delay",
    tags: ["fx"],
    description: "Delay line node",
    examples: [
      `impulse(1).ad(.01,.2).mul(sine(220))
.add(x=>x.delay(.1).mul(.8)).out()`
    ],
    ins: [
      { name: "in", default: 0 },
      { name: "time", default: 0 }
    ],
    compile: ({ vars: [e = 0, t = 0], ...i }) => s[i.lang].defUgen(i, e, t)
  });
  Ut = a("hold", {
    ugen: "Hold",
    tags: ["fx"],
    description: "Sample and hold",
    examples: [
      `noise().hold(impulse(2))
.range(220,880).sine().out()`
    ],
    ins: [
      { name: "in", default: 0 },
      { name: "trig", default: 0 }
    ],
    compile: ({ vars: [e = 0, t = 0], ...i }) => s[i.lang].defUgen(i, e, t)
  });
  kt = a("midifreq", {
    ugen: "MidiFreq",
    tags: ["external", "midi"],
    description: "Outputs frequency of midi note in. Multiple instances will do voice allocation",
    examples: ["midifreq().sine().out()"],
    ins: [
      {
        name: "channel",
        default: -1,
        description: "Channel filter. Defaults to all channels"
      }
    ],
    compile: ({ vars: [e = -1], ...t }) => s[t.lang].defUgen(t, e)
  });
  Pt = a("midigate", {
    ugen: "MidiGate",
    tags: ["external", "midi"],
    description: "outputs gate of midi note in. Multiple instances will do voice allocation",
    examples: ["midigate().lag(1).mul(sine(220)).out()"],
    ins: [{ name: "channel", default: -1 }],
    compile: ({ vars: [e = -1], ...t }) => s[t.lang].defUgen(t, e)
  });
  Ft = a("midivel", {
    ugen: "MidiVel",
    tags: ["external", "midi"],
    description: "outputs velocity of midi note in. Multiple instances will do voice allocation",
    examples: [
      "midigate().ar(0.01,0.2).mul(saw(midifreq())).mul(midivel()).mul(.8).out()"
    ],
    ins: [{ name: "channel", default: -1 }],
    compile: ({ vars: [e = -1], ...t }) => s[t.lang].defUgen(t, e)
  });
  Jt = a("midicc", {
    ugen: "MidiCC",
    tags: ["external", "midi"],
    description: "Outputs bipolar value of given midi cc number. initValue can be set to be the output before getting first cc message.",
    examples: ["midicc(74).range(100,200).sine().out()"],
    ins: [
      { name: "ccnumber", default: -1 },
      { name: "channel", default: -1 },
      { name: "initValue", default: -1 }
    ],
    compile: ({ vars: [e = -1, t = -1], ...i }) => s[i.lang].defUgen(i, e, t)
  });
  K = a("cc", {
    ugen: "CC",
    tags: ["external"],
    description: "CC control",
    ins: [
      { name: "id", default: 0 },
      { name: "value", default: 0 }
    ],
    compile: ({ vars: [e], ...t }) => s[t.lang].defUgen(t, e)
  });
  jt = a("audioin", {
    ugen: "AudioIn",
    tags: ["source", "external"],
    description: "External Audio Input, depends on your system input",
    examples: ["audioin().add(x=>x.delay(.1).mul(.8)).out()"],
    ins: [],
    compile: (e) => s[e.lang].defUgen(e, "input")
  });
  H = a("log", {
    tags: ["math"],
    description: "calculates the logarithm (base 10) of the input signal",
    ins: [{ name: "in" }],
    compile: ({ vars: [e = 0], name: t, lang: i }) => s[i].def(t, s[i].log(e))
  });
  A = a("exp", {
    tags: ["math"],
    description: "raises e to the power of the input signal",
    ins: [{ name: "in" }],
    compile: ({ vars: [e = 0], name: t, lang: i }) => s[i].def(t, s[i].exp(e))
  });
  Qt = a("pow", {
    tags: ["math"],
    description: "raises the input to the given power",
    ins: [{ name: "in" }, { name: "power" }],
    compile: ({ vars: [e = 0, t = 1], name: i, lang: n }) => s[n].def(i, s[n].pow(e, t))
  });
  q = a("sin", {
    tags: ["math"],
    description: "calculates the sine of the input signal",
    ins: [{ name: "in" }],
    compile: ({ vars: [e = 0], name: t, lang: i }) => s[i].def(t, s[i].defSin(e))
  });
  _ = a("cos", {
    tags: ["math"],
    description: "calculates the cosine of the input signal",
    ins: [{ name: "in" }],
    compile: ({ vars: [e = 0], name: t, lang: i }) => s[i].def(t, s[i].defCos(e))
  });
  Bt = a("tan", {
    tags: ["math"],
    description: "calculates the tan of the input signal",
    ins: [{ name: "in" }],
    compile: ({ vars: [e = 0], name: t, lang: i }) => s[i].def(t, s[i].defTan(e))
  });
  Et = a("acos", {
    tags: ["math"],
    description: "calculates the acos of the input signal",
    ins: [{ name: "in" }],
    compile: ({ vars: [e = 0], name: t, lang: i }) => s[i].def(t, s[i].defAcos(e))
  });
  Ot = a("asin", {
    tags: ["math"],
    description: "calculates the asin of the input signal",
    ins: [{ name: "in" }],
    compile: ({ vars: [e = 0], name: t, lang: i }) => s[i].def(t, s[i].defAsin(e))
  });
  $t = a("atan", {
    tags: ["math"],
    description: "calculates the atan of the input signal",
    ins: [{ name: "in" }],
    compile: ({ vars: [e = 0], name: t, lang: i }) => s[i].def(t, s[i].defAtan(e))
  });
  Dt = a("mul", {
    tags: ["math"],
    description: "Multiplies the given signals.",
    examples: ["sine(220).mul( sine(4).range(.25,1) ).out()"],
    ins: [{ name: "in", dynamic: true }],
    compile: ({ vars: e, name: t, lang: i }) => s[i].def(t, e.join(" * ") || 0)
  });
  C = a("add", {
    tags: ["math"],
    description: "sums the given signals",
    examples: ["n([0,3,7,10]).add(60).midinote().sine().mix(2).out()"],
    ins: [{ name: "in", dynamic: true }],
    compile: ({ vars: e, name: t, lang: i }) => s[i].def(t, e.join(" + ") || 0)
  });
  At = a("div", {
    tags: ["math"],
    description: "adds the given signals",
    ins: [{ name: "in", dynamic: true }],
    compile: ({ vars: e, name: t, lang: i }) => s[i].def(t, e.join(" / ") || 0)
  });
  qt = a("sub", {
    tags: ["math"],
    description: "subtracts the given signals",
    ins: [{ name: "in", dynamic: true }],
    compile: ({ vars: e, name: t, lang: i }) => s[i].def(t, e.join(" - ") || 0)
  });
  _t = a("mod", {
    tags: ["math"],
    description: "calculates the modulo",
    examples: ["add(x=>x.add(.003).mod(1)).out()"],
    ins: [{ name: "in" }, { name: "modulo" }],
    compile: ({ vars: e, name: t, lang: i }) => s[i].def(t, s[i].mod(...e) || 0)
  });
  ei = a("abs", {
    tags: ["math"],
    description: "returns the absolute value of the signal",
    ins: [{ name: "in" }],
    examples: ["sine(440).abs().out()"],
    compile: ({ vars: [e = 0], name: t, lang: i }) => s[i].def(t, s[i].abs(e))
  });
  ti = a("round", {
    tags: ["math"],
    description: "Rounds the signal to the nearest integer",
    ins: [{ name: "in" }],
    examples: ["sine(440.5).round().out()"],
    compile: ({ vars: [e = 0], name: t, lang: i }) => s[i].def(t, s[i].round(e))
  });
  ii = a("clamp", {
    tags: ["math"],
    description: "Clamps the signal to stay within the given range",
    ins: [{ name: "in" }, { name: "min" }, { name: "max" }],
    examples: ["sine(440.5).clamp(-.6,.6).out()"],
    compile: ({ vars: [e = 0, t = -1, i = 1], name: n, lang: l }) => {
      const o = s[l].min(t, i), d = s[l].max(t, i), G = s[l].min(s[l].max(e, o), d);
      return s[l].def(n, G);
    }
  });
  ni = a("floor", {
    tags: ["math"],
    description: "Rounds the signal down",
    ins: [{ name: "in" }],
    examples: ["sine(440.5).floor().out()"],
    compile: ({ vars: [e = 0], name: t, lang: i }) => s[i].def(t, s[i].floor(e))
  });
  si = a("ceil", {
    tags: ["math"],
    description: "Rounds the signal up",
    ins: [{ name: "in" }],
    examples: ["sine(440.5).ceil().out()"],
    compile: ({ vars: [e = 0], name: t, lang: i }) => s[i].def(t, s[i].ceil(e))
  });
  li = a("sign", {
    tags: ["math"],
    description: "Returns 1 if positive and -1 if negative. uses Math.sign",
    ins: [{ name: "in" }],
    examples: ["sine(440.5).ceil().out()"],
    compile: ({ vars: [e = 0], name: t, lang: i }) => s[i].def(t, s[i].sign(e))
  });
  ai = a("min", {
    tags: ["math"],
    description: "returns the minimum of the given signals",
    examples: [
      "impulse(4).apply(x => min(x.seq(0,3,2), x.seq(0,7,0,5,0)).add(48).midinote().sine()).out()"
    ],
    ins: [{ name: "in", dynamic: true }],
    compile: ({ vars: e, name: t, lang: i }) => s[i].def(t, e.reduce(s[i].min) || 0)
  });
  oi = a("max", {
    tags: ["math"],
    description: "returns the maximum of the given signals",
    examples: [
      "impulse(4).apply(x => max(x.seq(0,3,2), x.seq(0,7,0,5,0)).add(48).midinote().sine()).out()"
    ],
    ins: [{ name: "in", dynamic: true }],
    compile: ({ vars: e, name: t, lang: i }) => s[i].def(t, e.reduce(s[i].max) || 0)
  });
  di = a("argmin", {
    tags: ["math"],
    description: "returns the index of the minimum of the given signals",
    examples: [
      "argmin(saw(1), saw(3), saw(5)).mul(12).add(48).midinote().sine().out()"
    ],
    ins: [{ name: "in", dynamic: true }],
    compile: ({ vars: e, name: t, lang: i }) => s[i].def(t, s[i].pair_b(e.map(s[i].pair_make).reduce(s[i].pair_a_min)) || 0)
  });
  ci = a("argmax", {
    tags: ["math"],
    description: "returns the index of the maximum of the given signals",
    examples: [
      "argmax(saw(1), saw(3), saw(5)).mul(12).add(48).midinote().sine().out()"
    ],
    ins: [{ name: "in", dynamic: true }],
    compile: ({ vars: e, name: t, lang: i }) => s[i].def(t, s[i].pair_b(e.map(s[i].pair_make).reduce(s[i].pair_a_max)) || 0)
  });
  ee = a("greater", {
    tags: ["logic"],
    description: "returns 1 if input is greater then threshold",
    ins: [{ name: "in" }, { name: "threshold" }],
    examples: [
      `greater(sine(1),0)
.bipolar().range(100,200)
.sine().out()`
    ],
    compile: ({ vars: [e = 0, t = 0], name: i, lang: n }) => s[n].def(i, `${e} > ${t}`)
  });
  te = a("lower", {
    tags: ["logic"],
    description: "returns 1 if input is lower then threshold",
    ins: [{ name: "in" }, { name: "threshold" }],
    examples: [
      `lower(sine(1),0)
.bipolar().range(100,200)
.sine().out()`
    ],
    compile: ({ vars: [e = 0, t = 0], name: i, lang: n }) => s[n].def(i, `${e} < ${t}`)
  });
  pi = ee;
  ui = te;
  mi = a("xor", {
    tags: ["logic"],
    description: "returns 1 if exactly one of the inputs is 1",
    ins: [{ name: "a" }, { name: "b" }],
    compile: ({ vars: [e = 0, t = 0], name: i, lang: n }) => s[n].def(i, `${e} != ${t} ? 1 : 0`)
  });
  ri = a("and", {
    tags: ["logic"],
    description: "returns 1 if both inputs are 1",
    ins: [{ name: "a" }, { name: "b" }],
    compile: ({ vars: [e = 0, t = 0], name: i, lang: n }) => s[n].def(i, `${e} && ${t} ? 1 : 0`)
  });
  hi = a("or", {
    tags: ["logic"],
    description: "returns 1 if one or both inputs are 1",
    ins: [{ name: "a" }, { name: "b" }],
    compile: ({ vars: [e = 0, t = 0], name: i, lang: n }) => s[n].def(i, `${e} || ${t} ? 1 : 0`)
  });
  Gi = a("not", {
    tags: ["logic"],
    description: "returns 1 if input is 0, otherwise 0",
    ins: [{ name: "in" }],
    compile: ({ vars: [e = 0], name: t, lang: i }) => s[i].def(t, `(${e} === 0 ? 1 : 0)`)
  });
  yi = a("bool", {
    tags: ["logic"],
    description: "returns 1 signal is non zero. inspired by genish",
    ins: [{ name: "a" }],
    compile: ({ vars: [e = 0], name: t, lang: i }) => s[i].def(t, `(${e} === 0 ? 0 : 1)`)
  });
  fi = a("ifelse", {
    tags: ["logic"],
    description: "if control is 1, a is returned, otherwise b",
    ins: [{ name: "control" }, { name: "a" }, { name: "b" }],
    compile: ({ vars: [e = 0, t = 0, i = 0], name: n, lang: l }) => s[l].def(n, `(${e} === 1 ? ${t} : ${i})`),
    examples: ["ifelse(pulse(1), sine(220), sine(330)).out()"]
  });
  gi = a("range", {
    tags: ["math"],
    description: "Scales the incoming bipolar value to the given range.",
    examples: ["sine(.5).range(.25,1).mul(sine(440)).out()"],
    ins: [{ name: "in" }, { name: "min" }, { name: "max" }],
    compile: ({ vars: e, name: t, lang: i }) => {
      const [n, l, o, d = 1] = e, G = `((${n} + 1) * 0.5)`, p = d === 1 ? G : s[i].pow(G, d);
      return s[i].def(t, `${p} * (${o} - ${l}) + ${l}`);
    }
  });
  Xi = a("remap", {
    ugen: "Remap",
    tags: ["math"],
    description: "Remaps input from one value range to another",
    ins: [
      { name: "in" },
      { name: "inmin" },
      { name: "inmax" },
      { name: "outmin" },
      { name: "outmax" }
    ],
    compile: ({
      vars: [e = 0, t = -1, i = 1, n = -1, l = 1],
      ...o
    }) => s[o.lang].defUgen(o, e, t, i, n, l)
  });
  Zi = a("thru", {
    compile: ({ name: e, vars: t, lang: i }) => s[i].def(e, t[0], "thru")
  });
  bi = g("rangex", (e, t, i) => {
    let n = H(t), l = H(i).sub(n), d = e.unipolar().mul(l).add(n);
    return A(d);
  }, {
    tags: ["math"],
    description: "exponential range",
    ins: [{ name: "in" }, { name: "min" }, { name: "max" }],
    examples: ["sine([1,3]).rangex(100, 2e3).sine().out()"]
  });
  xi = a("midinote", {
    compile: ({ vars: [e], name: t, lang: i }) => s[i].def(t, s[i].midinote(e)),
    tags: ["math"],
    description: "convert midi number to frequency",
    ins: [{ name: "midi" }],
    examples: [
      `impulse(4).seq(0,3,7,12).add(60)
.midinote().sine().out()`
    ]
  });
  Ri = a("src", {
    internal: true,
    compile: ({ vars: [e = 0], name: t, lang: i, ...n }) => s[i].def(t, n.getSource(e), `read source ${e}`)
  });
  Li = a("output", {
    internal: true,
    ugen: "Output",
    compile: ({ vars: [e, t = 0], name: i, lang: n, ...l }) => {
      const o = l.getOutput(t), d = l.getSource(t);
      return [
        s[n].def(o, [o, e].join(" + "), `+ output ${t}`),
        s[n].def(d, o, `write source ${t}`)
      ].join(`
`);
    }
  });
  ie = a("poly");
  ne = f(Math.PI);
  Mi = u("fork", (e, t = 1) => ie(...Array.from({ length: t }, () => e.clone())), {
    ins: [{ name: "in" }, { name: "times" }],
    tags: ["multi-channel"],
    description: "split the signal into n channels",
    examples: ["dust(4).fork(2).adsr(.1).mul(sine(220)).out()"]
  });
  zi = g("perc", (e, t) => e.adsr(0, 0, 1, t), {
    tags: ["envelope"],
    description: "percussive envelope. usable with triggers or gates",
    ins: [{ name: "gate" }, { name: "release" }],
    examples: ["impulse(4).perc(.1).mul( pink() ).out()"]
  });
  Vi = g("hpf", (e, t, i = 0) => e.sub(e.lpf(t, i)), {
    ins: [{ name: "in" }, { name: "cutoff" }, { name: "reso" }],
    description: "high pass filter",
    tags: ["fx", "filter"],
    examples: ["tri([220,331,442]).mix().hpf(sine(.5).range(0,.9)).out()"]
  });
  Wi = g("lpf", D, {
    ins: [{ name: "in" }, { name: "cutoff" }, { name: "reso" }],
    description: "low pass filter",
    tags: ["fx", "filter"],
    examples: ["saw(55).lpf( sine(1).range(.4,.8) ).out()"]
  });
  Yi = a("bpf", {
    ugen: "BPF",
    ins: [{ name: "in" }, { name: "cutoff" }, { name: "reso" }],
    description: "high pass filter",
    tags: ["fx", "filter"],
    compile: ({ vars: [e = 0, t = 1, i = 0], ...n }) => s[n.lang].defUgen(n, e, t, i)
  });
  Ni = g("lfnoise", (e) => O().hold($(e)), {
    ins: [{ name: "freq" }],
    description: "low frequency stepped noise.",
    tags: ["regular", "noise"],
    examples: ["lfnoise(4).range(200,800).sine().out()"]
  });
  Hi = g("bipolar", (e) => f(e).mul(2).sub(1), {
    ins: [{ name: "in" }],
    description: "convert unipolar [0,1] signal to bipolar [-1,1]",
    tags: ["math"]
  });
  Si = g("unipolar", (e) => f(e).add(1).div(2), {
    ins: [{ name: "in" }],
    description: "convert bipolar [-1,1] signal to unipolar [0,1]",
    tags: ["math"]
  });
  Ti = g("pan", (e, t) => (t = f(t).add(1).mul(ne, 0.25), e.mul([_(t), q(t)])), {
    ins: [
      { name: "in" },
      {
        name: "pos",
        description: "bipolar position: -1 = left, 0 = center, 1 = right"
      }
    ],
    description: "pans signal to stereo position. splits signal path in 2",
    tags: ["multi-channel"],
    examples: ["sine(220).pan(sine(.25)).out()"]
  });
  wi = a("pick", {
    tags: ["multi-channel"],
    ugen: "Pick",
    description: "Pick",
    ins: [{ name: "index" }, { name: "inputs", dynamic: true }],
    description: "picks input of given index",
    examples: [
      `sine(.25).range(0,2).round()
.pick(...sine([220,330,440]).ins)
.out()`
    ],
    compile: ({ vars: e, ...t }) => s[t.lang].defUgen(t, ...e)
  });
  Ki = a("clip", {
    tags: ["fx"],
    ugen: "Clip",
    description: "Hard limits the signal between lo and hi.",
    ins: [{ name: "input" }, { name: "lo" }, { name: "hi" }],
    compile: ({ vars: [e = 0, t = -1, i = 1], ...n }) => s[n.lang].defUgen(n, e, t, i)
  });
  Ci = a("trig", {
    tags: ["trigger"],
    ugen: "Trig",
    description: "Emits a trigger impulse whenever the signal becomes positive. Useful to turn gates into triggers.",
    ins: [
      { name: "input", default: 0 },
      { name: "lo", default: -1 },
      { name: "hi", default: 1 }
    ],
    compile: ({ vars: [e = 0, t = -1, i = 1], ...n }) => s[n.lang].defUgen(n, e, t, i),
    examples: [
      `pulse(2)
.trig() // comment out to hear difference
.ar(.01,.2)
.mul(sine(200)).out()`
    ]
  });
  vi = a("qf", {
    tags: ["fx", "filter"],
    ugen: "BiquadFilter",
    description: "biQuad Filter.",
    ins: [
      { name: "input", default: 0 },
      {
        name: "type",
        default: 0,
        description: "filter type: 0 = lowpass, 1 = highpass, 2 = band pass, 3 = notch, 4 = allpass, 5 = peaking, 6 = lowshelf, 7 = highshelf"
      },
      { name: "freq", default: 500, description: "filter cutoff in Hz" },
      { name: "q", default: 1, description: "q factor" },
      { name: "gain", default: 1 }
    ],
    compile: ({ vars: e, ...t }) => s[t.lang].defUgen(t, ...e),
    examples: [
      `pink()
.qf(
 impulse(.5).seq(0,1,2,3,4,5,6,7), // type
  tri(0.5).rangex(100, 8000),  // freq
 10, // Q
 1, // gain (only relevant for types 5-7)
).div(4).out();`
    ]
  });
  Ii = u("qlpf", (e, t, i = 10) => e.qf(0, t, i), {
    description: "biQuad Low Pass Filter",
    ins: [
      { name: "input" },
      { name: "freq" },
      { name: "q", description: "resonance" }
    ],
    tags: ["fx", "filter"],
    examples: [
      `pink().qlpf(
  tri(0.5).rangex(100, 8000), // cutoff freq
  10 // Q
).out()`
    ]
  });
  Ui = u("qhpf", (e, t, i = 10) => e.qf(1, t, i), {
    description: "biQuad High pass filter",
    ins: [
      { name: "input" },
      { name: "freq" },
      { name: "q", description: "resonance" }
    ],
    tags: ["fx", "filter"],
    examples: [
      `pink().qhpf(
  tri(0.5).rangex(100, 8000), // cutoff freq
  10 // Q
).out()`
    ]
  });
  ki = u("qbpf", (e, t, i = 10) => e.qf(2, t, i), {
    description: "biQuad Band Pass Filter",
    ins: [
      { name: "input" },
      { name: "freq" },
      { name: "q", description: "resonance" }
    ],
    tags: ["fx", "filter"],
    examples: [
      `pink().qbpf(
  tri(0.5).rangex(100, 8000), // cutoff freq
  10 // Q
).out()`
    ]
  });
  Pi = u("qnf", (e, t, i = 10) => e.qf(3, t, i), {
    description: "biQuad Notch Filter",
    ins: [
      { name: "input" },
      { name: "freq" },
      { name: "q", description: "resonance" }
    ],
    tags: ["fx", "filter"],
    examples: [
      `pink().qnf(
  tri(0.5).rangex(100, 8000), // cutoff freq
  10 // Q
).out()`
    ]
  });
  Fi = u("qapf", (e, t, i = 10) => e.qf(3, t, i), {
    description: "biQuad All Pass Filter",
    ins: [
      { name: "input" },
      { name: "freq" },
      { name: "q", description: "resonance" }
    ],
    tags: ["fx", "filter"],
    examples: [
      `impulse(1).qapf(
  tri(0.5).rangex(100, 8000), // cutoff freq
  10 // Q
).out()`
    ]
  });
  Ji = u("split", (e, t) => e.type !== "poly" ? t([e]) : t(e.ins), {
    ins: [{ name: "input" }, { name: "fn" }],
    tags: ["multi-channel"],
    description: "apply fn to an array of signals, one for each channel in input",
    examples: ["sine([220,330,550]).split(chs => add(...chs)).out()"]
  });
  ji = u("mix", (e, t = 1) => {
    if ([1, 2].includes(t) || (t = 2, console.warn("mix only supports 1 or 2 channels atm.. falling back to 2")), e.type !== "poly")
      return e;
    if (t === 2) {
      const i = e.ins.map((n, l, o) => {
        const G = (l / (o.length - 1) * 2 - 1 + 1) * Math.PI / 4;
        return n.mul([Math.cos(G), Math.sin(G)]).inherit(e);
      });
      return C(...i);
    }
    return e.ins = e.ins.map((i) => i.inherit(e)), x("mix").withIns(...e.ins);
  }, {
    compile: ({ vars: e, name: t, lang: i }) => s[i].def(t, `(${e.join(" + ")})`),
    description: `mixes down multiple channels. Useful to make sure you get a mono or stereo signal out at the end. 
When mixing down to 2 channels, the input channels are equally distributed over the stereo image, e.g. 3 channels are panned [-1,0,1]`,
    ins: [
      { name: "in" },
      {
        name: "channels",
        default: 1,
        description: "how many channels to mix down to. Only supports 1 and 2"
      }
    ],
    tags: ["multi-channel"],
    examples: ["sine([220,330,440]).mix(2).out()"]
  });
  c.prototype.feedback = function(e) {
    return this.add(e);
  };
  Bi = f;
  Ei = f;
  Oi = g("mouseX", () => K("mouseX"), {
    ins: [],
    description: "X position of mouse, bipolar range",
    tags: ["external"],
    examples: ["mouseX.range(100,800).sine().out()"]
  });
  $i = Oi();
  Di = g("mouseY", () => K("mouseY"), {
    ins: [],
    description: "Y position of mouse, bipolar range",
    tags: ["external"],
    examples: ["mouseY.range(800,100).sine().out()"]
  });
  Ai = Di();
  qi = u("scope", (e, t) => {
    let i = 1;
    e.type === "poly" && (i = e.ins.length);
    const n = getNode("scope", e, t, i);
    return n.type !== "poly" ? (n.ins.push({ type: "n", value: 0, ins: [] }), n) : (n.ins.forEach((l, o) => l.ins.push({ type: "n", value: o, ins: [] })), n);
  }, {
    ugen: "Scope",
    description: "renders an an oscilloscope of the current point in the graph. expects values between -1 and 1. warning: this feature is still experimental! when using it, make sure to not switch tabs, as it might fry your browser.",
    compile: ({ vars: [e, t, i, n], ...l }) => w(l, e, t, i, n)
  });
  P2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    B: Bi,
    PI: ne,
    _: Ei,
    abs: ei,
    acos: Et,
    ad: Zt,
    add: C,
    adsr: gt,
    and: ri,
    ar: Xt,
    argmax: ci,
    argmin: di,
    asin: Ot,
    atan: $t,
    audioin: jt,
    bipolar: Hi,
    bool: yi,
    bpf: Yi,
    brown: zt,
    bytebeat: yt,
    cc: K,
    ceil: si,
    clamp: ii,
    clip: Ki,
    clock: bt,
    clockdiv: xt,
    cos: _,
    delay: It,
    distort: Rt,
    div: At,
    dust: Vt,
    exp: A,
    feedback: Qi,
    filter: D,
    floatbeat: ft,
    floor: ni,
    fold: Ct,
    fork: Mi,
    greater: ee,
    gt: pi,
    hold: Ut,
    hpf: Vi,
    ifelse: fi,
    impulse: $,
    lag: wt,
    lfnoise: Ni,
    log: H,
    lower: te,
    lpf: Wi,
    lt: ui,
    max: oi,
    midicc: Jt,
    midifreq: kt,
    midigate: Pt,
    midinote: xi,
    midivel: Ft,
    min: ai,
    mix: ji,
    mod: _t,
    mouseX: $i,
    mouseY: Ai,
    mul: Dt,
    noise: O,
    not: Gi,
    or: hi,
    output: Li,
    pan: Ti,
    perc: zi,
    pick: wi,
    pink: Mt,
    poly: ie,
    pow: Qt,
    pulse: St,
    qapf: Fi,
    qbpf: ki,
    qf: vi,
    qhpf: Ui,
    qlpf: Ii,
    qnf: Pi,
    range: gi,
    rangex: bi,
    raw: Gt,
    registerUgen: E,
    remap: Xi,
    rng: Lt,
    round: ti,
    saw: Wt,
    scope: qi,
    seq: vt,
    sign: li,
    sin: q,
    sine: Nt,
    slew: Kt,
    slide: Tt,
    split: Ji,
    src: Ri,
    sub: qt,
    tan: Bt,
    thru: Zi,
    time: ht,
    tri: Ht,
    trig: Ci,
    unipolar: Si,
    xor: mi,
    zaw: Yt
  }, Symbol.toStringTag, { value: "Module" }));
});

// node_modules/@strudel/core/dist/index.mjs
var exports_dist = {};
__export(exports_dist, {
  ClockCollator: () => _n,
  Cyclist: () => hf,
  FXr: () => uf,
  FXrel: () => cf,
  FXrelease: () => of,
  Fraction: () => m,
  Hap: () => S2,
  Pattern: () => f2,
  State: () => ut2,
  TimeSpan: () => B2,
  __chooseWith: () => Me2,
  _brandBy: () => Oe2,
  _fitslice: () => Fn,
  _irand: () => ze2,
  _keyDown: () => je2,
  _match: () => In,
  _mod: () => bt2,
  _morph: () => de2,
  _polymeterListSteps: () => Hn,
  _retime: () => Yt2,
  _slices: () => Zt2,
  accelerate: () => Ys,
  activeLabel: () => va,
  ad: () => Bp,
  add: () => $h,
  adsr: () => xp,
  almostAlways: () => Jw,
  almostNever: () => jw,
  always: () => Nw,
  amp: () => sr,
  analyze: () => gc,
  anchor: () => Ua,
  and: () => nd,
  apply: () => Pd,
  applyN: () => Wn,
  ar: () => zp,
  arp: () => wh,
  arpWith: () => yh,
  arrange: () => kh,
  as: () => Kp,
  asym: () => py,
  att: () => or,
  attack: () => rr,
  averageArray: () => nn,
  backgroundImage: () => Hw,
  band: () => Ih,
  bandf: () => Cc,
  bandq: () => Oc,
  bank: () => yc,
  base64ToUnicode: () => gn,
  bbexpr: () => ti2,
  bbst: () => ni2,
  beat: () => oy,
  begin: () => Mc,
  berlin: () => qw,
  bgain: () => ja,
  binary: () => iw,
  binaryL: () => uw,
  binaryN: () => Jf,
  binaryNL: () => $f,
  bind: () => xh,
  binshift: () => Zl,
  bite: () => Ld,
  bjork: () => _y,
  bjorklund: () => ge2,
  blshift: () => Dh,
  bmod: () => sf,
  bor: () => Vh,
  bp: () => Bc,
  bpa: () => ji2,
  bpattack: () => Ei2,
  bpd: () => Wi2,
  bpdc: () => yu,
  bpdecay: () => Ri2,
  bpdepth: () => fu,
  bpdepthfreq: () => du,
  bpdepthfrequency: () => hu,
  bpe: () => Bi2,
  bpenv: () => xi2,
  bpf: () => xc,
  bpq: () => zc,
  bpr: () => Zi2,
  bprate: () => lu,
  bprelease: () => Yi2,
  bps: () => Gi2,
  bpshape: () => mu,
  bpskew: () => wu,
  bpsustain: () => Di2,
  bpsync: () => pu,
  brak: () => Ud,
  brand: () => mw,
  brandBy: () => dw,
  brshift: () => Gh,
  bus: () => Pa,
  busgain: () => Ea,
  bxor: () => Hh,
  bypass: () => Tm,
  byteBeatExpression: () => Zc,
  byteBeatStartTime: () => ei2,
  calculateSteps: () => dh,
  cat: () => mt2,
  ccn: () => $p,
  ccv: () => Np,
  ceil: () => id,
  ch: () => ri2,
  channel: () => gi2,
  channels: () => si2,
  chebyshev: () => dy,
  choose: () => Rf,
  chooseCycles: () => Wf,
  chooseIn: () => ww,
  chooseInWith: () => Pe2,
  chooseOut: () => gw,
  chooseWith: () => It2,
  chop: () => Xm,
  chord: () => Da,
  chorus: () => wc,
  chunk: () => mm,
  chunkBack: () => gm,
  chunkBackInto: () => Am,
  chunkInto: () => qm,
  chunkback: () => bm,
  chunkbackinto: () => Sm,
  chunkinto: () => km,
  clamp: () => an,
  cleanupUi: () => Dw,
  clip: () => pp,
  coarse: () => Rc,
  code2hash: () => ph,
  color: () => Ap,
  colour: () => Tp,
  comb: () => Xl,
  compose: () => oh,
  compress: () => dd,
  compressSpan: () => md,
  compressor: () => bl,
  compressorAttack: () => kl,
  compressorKnee: () => _l,
  compressorRatio: () => vl,
  compressorRelease: () => ql,
  compressspan: () => yd,
  constant: () => ch,
  contract: () => Kn,
  control: () => Jp,
  controls: () => gy,
  cosine: () => Qy,
  cosine2: () => Uy,
  cpm: () => Ed,
  cps: () => lp,
  createClock: () => ff,
  createParam: () => Nt2,
  createParams: () => Cp,
  crush: () => Lc,
  ctf: () => vi2,
  ctlNum: () => Lp,
  ctranspose: () => Aa,
  cubic: () => ay,
  curry: () => w2,
  curve: () => yp,
  cut: () => bi2,
  cutoff: () => _i2,
  cycleToSeconds: () => Kt2,
  cyclesPer: () => Ww,
  dec: () => vc,
  decay: () => _c,
  degrade: () => Tw,
  degradeBy: () => Aw,
  degradeByWith: () => Sw,
  degree: () => qa,
  delay: () => Ru,
  delayfb: () => Fu,
  delayfeedback: () => Wu,
  delayspeed: () => Vu,
  delaysync: () => Qu,
  delayt: () => Du,
  delaytime: () => Hu,
  deltaSlide: () => wp,
  det: () => Ku,
  detune: () => Xu,
  dfb: () => Iu,
  dict: () => Qa,
  dictionary: () => Ga,
  diode: () => ly,
  dist: () => yl,
  distort: () => ml,
  distorttype: () => gl,
  distortvol: () => wl,
  div: () => Rh,
  djf: () => Lu,
  drawLine: () => Cn,
  drive: () => Qc,
  drop: () => Qn,
  dry: () => ta,
  ds: () => Op,
  dt: () => Gu,
  duck: () => Uc,
  duckattack: () => Yc,
  duckdepth: () => Xc,
  duckonset: () => Kc,
  dur: () => dp,
  duration: () => hp,
  early: () => jd,
  echo: () => im,
  echoWith: () => sm,
  echowith: () => rm,
  eish: () => Ty,
  end: () => Pc,
  enhance: () => Ul,
  env: () => nf,
  eq: () => Yh,
  eqt: () => Zh,
  errorLogger: () => zt2,
  euclid: () => by,
  euclidLegato: () => qy,
  euclidLegatoRot: () => Sy,
  euclidRot: () => ky,
  euclidish: () => Ay,
  euclidrot: () => vy,
  evalScope: () => xn,
  evaluate: () => On,
  every: () => Md,
  expand: () => Xn,
  expression: () => Ol,
  extend: () => Un,
  fadeInTime: () => sa,
  fadeOutTime: () => na,
  fadeTime: () => ea,
  fanchor: () => eu,
  fast: () => qd,
  fastChunk: () => vm,
  fastGap: () => wd,
  fastcat: () => N2,
  fastchunk: () => _m,
  fastgap: () => gd,
  fft: () => bc,
  filter: () => zm,
  filterWhen: () => Mm,
  firstOf: () => zd,
  fit: () => ey,
  flatten: () => G,
  floor: () => cd,
  fm: () => Sr,
  fm1: () => Ar,
  fm2: () => Tr,
  fm3: () => Cr,
  fm4: () => xr,
  fm5: () => Br,
  fm6: () => Or,
  fm7: () => zr,
  fm8: () => Mr,
  fmatt: () => Kr,
  fmatt1: () => Yr,
  fmatt2: () => Zr,
  fmatt3: () => to,
  fmatt4: () => eo,
  fmatt5: () => no,
  fmatt6: () => so,
  fmatt7: () => ro,
  fmatt8: () => oo,
  fmattack: () => Fr,
  fmattack1: () => Ir,
  fmattack2: () => Vr,
  fmattack3: () => Hr,
  fmattack4: () => Dr,
  fmattack5: () => Gr,
  fmattack6: () => Qr,
  fmattack7: () => Ur,
  fmattack8: () => Xr,
  fmdec: () => Ao,
  fmdec1: () => To,
  fmdec2: () => Co,
  fmdec3: () => xo,
  fmdec4: () => Bo,
  fmdec5: () => Oo,
  fmdec6: () => zo,
  fmdec7: () => Mo,
  fmdec8: () => Po,
  fmdecay: () => yo,
  fmdecay1: () => wo,
  fmdecay2: () => go,
  fmdecay3: () => bo,
  fmdecay4: () => _o,
  fmdecay5: () => vo,
  fmdecay6: () => ko,
  fmdecay7: () => qo,
  fmdecay8: () => So,
  fmenv: () => Pr,
  fmenv1: () => Er,
  fmenv2: () => jr,
  fmenv3: () => Jr,
  fmenv4: () => $r,
  fmenv5: () => Nr,
  fmenv6: () => Lr,
  fmenv7: () => Rr,
  fmenv8: () => Wr,
  fmh: () => cr,
  fmh1: () => ir,
  fmh2: () => ur,
  fmh3: () => ar,
  fmh4: () => lr,
  fmh5: () => pr,
  fmh6: () => fr,
  fmh7: () => hr,
  fmh8: () => dr,
  fmi: () => mr,
  fmi1: () => yr,
  fmi2: () => wr,
  fmi3: () => gr,
  fmi4: () => br,
  fmi5: () => _r,
  fmi6: () => vr,
  fmi7: () => kr,
  fmi8: () => qr,
  fmrel: () => ic,
  fmrel1: () => uc,
  fmrel2: () => ac,
  fmrel3: () => lc,
  fmrel4: () => pc,
  fmrel5: () => fc,
  fmrel6: () => hc,
  fmrel7: () => dc,
  fmrel8: () => mc,
  fmrelease: () => Yo,
  fmrelease1: () => Zo,
  fmrelease2: () => tc,
  fmrelease3: () => ec,
  fmrelease4: () => nc,
  fmrelease5: () => sc,
  fmrelease6: () => rc,
  fmrelease7: () => oc,
  fmrelease8: () => cc,
  fmsus: () => Io,
  fmsus1: () => Vo,
  fmsus2: () => Ho,
  fmsus3: () => Do,
  fmsus4: () => Go,
  fmsus5: () => Qo,
  fmsus6: () => Uo,
  fmsus7: () => Xo,
  fmsus8: () => Ko,
  fmsustain: () => Eo,
  fmsustain1: () => jo,
  fmsustain2: () => Jo,
  fmsustain3: () => $o,
  fmsustain4: () => No,
  fmsustain5: () => Lo,
  fmsustain6: () => Ro,
  fmsustain7: () => Wo,
  fmsustain8: () => Fo,
  fmwave: () => co,
  fmwave1: () => io,
  fmwave2: () => uo,
  fmwave3: () => ao,
  fmwave4: () => lo,
  fmwave5: () => po,
  fmwave6: () => fo,
  fmwave7: () => ho,
  fmwave8: () => mo,
  focus: () => bd,
  focusSpan: () => _d,
  focusspan: () => vd,
  fold: () => fy,
  fractionalArgs: () => ih,
  frameRate: () => np,
  frames: () => sp,
  freeze: () => Vl,
  freq: () => ra,
  freqToMidi: () => Ze2,
  fromBipolar: () => ad,
  fshift: () => Ml,
  fshiftnote: () => Pl,
  fshiftphase: () => El,
  ftype: () => tu,
  func: () => rd,
  fxr: () => af,
  gain: () => er,
  gap: () => pt2,
  gat: () => wa,
  gate: () => ya,
  getAccidentalsOffset: () => Ye2,
  getControlName: () => yt2,
  getCps: () => Fy,
  getCurrentKeyboardState: () => qn,
  getEventOffsetMs: () => th,
  getFreq: () => tn,
  getFrequency: () => rh,
  getIsStarted: () => Hy,
  getPattern: () => Iy,
  getPerformanceTimeSeconds: () => hh,
  getPlayableNoteValue: () => sh,
  getRandsAtTime: () => K2,
  getSoundIndex: () => nh,
  getTime: () => Wy,
  getTrigger: () => Sf,
  getTriggerFunc: () => Vy,
  grow: () => jm,
  gt: () => Uh,
  gte: () => Kh,
  hard: () => uy,
  harmonic: () => Ta,
  hash2code: () => fh,
  hbrick: () => tp,
  hcutoff: () => Mu,
  hold: () => Tc,
  hours: () => rp,
  hp: () => Eu,
  hpa: () => Pi2,
  hpattack: () => Mi2,
  hpd: () => Li2,
  hpdc: () => Su,
  hpdecay: () => Ni2,
  hpdepth: () => _u,
  hpdepthfreq: () => ku,
  hpdepthfrequency: () => vu,
  hpe: () => Ci2,
  hpenv: () => Ti2,
  hpf: () => Pu,
  hpq: () => Ju,
  hpr: () => Ki2,
  hprate: () => gu,
  hprelease: () => Xi2,
  hps: () => Hi2,
  hpshape: () => qu,
  hpskew: () => Au,
  hpsustain: () => Vi2,
  hpsync: () => bu,
  hresonance: () => ju,
  hsl: () => Om,
  hsla: () => Bm,
  hurry: () => Ad,
  id: () => ot2,
  imag: () => Ql,
  inhabit: () => Jy,
  inhabitmod: () => Ny,
  innerBind: () => Bh,
  inside: () => xd,
  inv: () => Dd,
  invert: () => Hd,
  ir: () => cl,
  irand: () => yw,
  irbegin: () => al,
  iresponse: () => il,
  irspeed: () => ul,
  isControlName: () => is,
  isNote: () => Mt2,
  isNoteWithOctave: () => Yf,
  isPattern: () => pe2,
  isaw: () => Rt2,
  isaw2: () => Ae2,
  iter: () => pm,
  iterBack: () => fm,
  iterback: () => hm,
  itri: () => Zy,
  itri2: () => tw,
  jux: () => nm,
  juxBy: () => tm,
  juxby: () => em,
  kcutoff: () => $l,
  keep: () => jh,
  keepif: () => Jh,
  keyAlias: () => kn,
  keyDown: () => Rw,
  krush: () => Jl,
  label: () => ka,
  lastOf: () => Od,
  late: () => Ln,
  lbrick: () => ep,
  legato: () => fp,
  leslie: () => ga,
  lfo: () => ef,
  linger: () => Rd,
  listRange: () => _t2,
  lock: () => Uu,
  logKey: () => oe2,
  logger: () => E2,
  loop: () => Ec,
  loopAt: () => Zm,
  loopAtCps: () => ny,
  loopBegin: () => jc,
  loopEnd: () => $c,
  loopat: () => ty,
  loopatcps: () => sy,
  loopb: () => Jc,
  loope: () => Nc,
  lp: () => qi2,
  lpa: () => zi2,
  lpattack: () => Oi2,
  lpd: () => $i2,
  lpdc: () => uu,
  lpdecay: () => Ji2,
  lpdepth: () => ru,
  lpdepthfreq: () => cu,
  lpdepthfrequency: () => ou,
  lpe: () => Ai2,
  lpenv: () => Si2,
  lpf: () => ki2,
  lpq: () => Nu,
  lpr: () => Ui2,
  lprate: () => nu,
  lprelease: () => Qi2,
  lps: () => Ii2,
  lpshape: () => iu,
  lpskew: () => au,
  lpsustain: () => Fi2,
  lpsync: () => su,
  lrate: () => ba,
  lsize: () => _a,
  lt: () => Qh,
  lte: () => Xh,
  mapArgs: () => ie2,
  mask: () => Sh,
  midi2note: () => eh,
  midiToFreq: () => it2,
  midibend: () => Dp,
  midichan: () => Mp,
  midicmd: () => jp,
  midimap: () => Pp,
  midiport: () => Ep,
  miditouch: () => Gp,
  minutes: () => op,
  mod: () => Wh,
  mode: () => Ya,
  morph: () => cy,
  mouseX: () => ow,
  mouseY: () => sw,
  mousex: () => rw,
  mousey: () => nw,
  mtranspose: () => Sa,
  mul: () => Lh,
  n: () => Xs,
  nanFallback: () => sn,
  ne: () => td,
  net: () => ed,
  never: () => $w,
  noise: () => Bu,
  note: () => Ks,
  noteToMidi: () => gt2,
  nothing: () => R,
  nrpnn: () => Rp,
  nrpv: () => Wp,
  nudge: () => Ba,
  numeralArgs: () => L2,
  objectMap: () => bn,
  oct: () => za,
  octave: () => Oa,
  octaveR: () => xa,
  octaves: () => Ka,
  octer: () => Nl,
  octersub: () => Ll,
  octersubsub: () => Rl,
  off: () => Qd,
  offset: () => Xa,
  often: () => Pw,
  or: () => sd,
  orbit: () => Ma,
  oschost: () => Up,
  oscport: () => Xp,
  outerBind: () => Oh,
  outside: () => Bd,
  overgain: () => Ja,
  overshape: () => $a,
  pace: () => Vn,
  pairs: () => un,
  palindrome: () => Zd,
  pan: () => Na,
  panchor: () => ma,
  panorient: () => Fa,
  panspan: () => La,
  pansplay: () => Ra,
  panwidth: () => Wa,
  parray: () => me2,
  parseFractional: () => cn,
  parseNumeral: () => ce2,
  partials: () => my,
  patt: () => ca,
  pattack: () => oa,
  pcurve: () => da,
  pdec: () => ua,
  pdecay: () => ia,
  penv: () => ha,
  per: () => Df,
  perCycle: () => Fw,
  perlin: () => kw,
  perx: () => Iw,
  ph: () => ai2,
  phasdp: () => wi2,
  phaser: () => li2,
  phasercenter: () => hi2,
  phaserdepth: () => mi2,
  phaserrate: () => ui2,
  phasersweep: () => pi2,
  phases: () => yy,
  phc: () => di2,
  phd: () => yi2,
  phs: () => fi2,
  pick: () => yf,
  pickF: () => xy,
  pickOut: () => Oy,
  pickReset: () => Ey,
  pickRestart: () => My,
  pickSqueeze: () => $y,
  pickmod: () => gf,
  pickmodF: () => By,
  pickmodOut: () => zy,
  pickmodReset: () => jy,
  pickmodRestart: () => Py,
  pickmodSqueeze: () => Ly,
  pipe: () => on,
  pitchJump: () => gp,
  pitchJumpTime: () => bp,
  ply: () => kd,
  plyForEach: () => lm,
  plyWith: () => am,
  pm: () => _h,
  polyBind: () => Ph,
  polyTouch: () => Qp,
  polymeter: () => $t2,
  polyrhythm: () => gh,
  postgain: () => nr,
  pow: () => Fh,
  pr: () => bh,
  prel: () => fa,
  prelease: () => pa,
  press: () => Yd,
  pressBy: () => Kd,
  progNum: () => Fp,
  psus: () => la,
  psustain: () => aa,
  pure: () => C2,
  pw: () => oi2,
  pwrate: () => ci2,
  pwsweep: () => ii2,
  rand: () => W2,
  rand2: () => hw,
  randL: () => aw,
  randcat: () => bw,
  randrun: () => Nf,
  range: () => ld,
  range2: () => fd,
  rangex: () => pd,
  rarely: () => Ew,
  ratio: () => hd,
  rdim: () => sl,
  real: () => Gl,
  ref: () => ry,
  register: () => l,
  registerControl: () => c2,
  registerMultiControl: () => V2,
  reify: () => d,
  rel: () => Ac,
  release: () => Sc,
  removeUndefineds: () => lt2,
  repeatCycles: () => dm,
  repl: () => Dy,
  replicate: () => Em,
  reset_state: () => df,
  reset_timelines: () => mf,
  resonance: () => $u,
  rev: () => Rn,
  revv: () => Xd,
  rfade: () => ol,
  rib: () => xm,
  ribbon: () => Cm,
  ring: () => Wl,
  ringdf: () => Il,
  ringf: () => Fl,
  rlp: () => el,
  room: () => Za,
  roomdim: () => nl,
  roomfade: () => rl,
  roomlp: () => tl,
  roomsize: () => ll,
  rotate: () => rn,
  round: () => od,
  rsize: () => hl,
  run: () => jf,
  s: () => us,
  s_add: () => Fm,
  s_alt: () => Nm,
  s_cat: () => $m,
  s_contract: () => Dm,
  s_expand: () => Vm,
  s_extend: () => Hm,
  s_polymeter: () => Lm,
  s_sub: () => Im,
  s_taper: () => Rm,
  s_taperlist: () => Wm,
  s_tour: () => Gm,
  s_zip: () => Qm,
  saw: () => qt2,
  saw2: () => Se2,
  scram: () => Yl,
  scramble: () => pw,
  scrub: () => Yp,
  seconds: () => cp,
  seed: () => fw,
  seg: () => Fd,
  segment: () => Wd,
  semitone: () => Va,
  seq: () => Nn,
  seqPLoop: () => qh,
  sequence: () => Q2,
  sequenceP: () => En,
  set: () => Eh,
  setCpsFunc: () => _f,
  setIsStarted: () => qf,
  setPattern: () => vf,
  setStringParser: () => mh,
  setTime: () => ee2,
  setTriggerFunc: () => kf,
  shape: () => dl,
  shrink: () => Zn,
  shrinklist: () => Yn,
  shuffle: () => lw,
  signal: () => j2,
  silence: () => q2,
  sine: () => Af,
  sine2: () => Te2,
  sinefold: () => hy,
  size: () => pl,
  slice: () => ss,
  slide: () => Ia,
  slow: () => Td,
  slowChunk: () => wm,
  slowcat: () => Z2,
  slowcatPrime: () => fe2,
  slowchunk: () => ym,
  smear: () => Kl,
  soft: () => iy,
  sol2note: () => uh,
  someCycles: () => Mw,
  someCyclesBy: () => zw,
  sometimes: () => Ow,
  sometimesBy: () => Bw,
  songPtr: () => ip,
  sound: () => as,
  source: () => Qs,
  sparsity: () => Cd,
  speak: () => Vw,
  speed: () => ye2,
  splice: () => Ym,
  splitAt: () => ue2,
  spread: () => Zu,
  square: () => Tf,
  square2: () => Xy,
  squeeze: () => Ry,
  squeezeBind: () => zh,
  squiz: () => Tl,
  src: () => Us,
  stack: () => z,
  stackBy: () => vh,
  stackCentre: () => $n,
  stackLeft: () => jn,
  stackRight: () => Jn,
  steady: () => Gy,
  stepBind: () => Mh,
  stepalt: () => Dn,
  stepcat: () => $2,
  steps: () => Um,
  stepsPerOctave: () => Ca,
  stretch: () => Sl,
  striate: () => Km,
  stringifyValues: () => ae,
  struct: () => Ah,
  strudelScope: () => le,
  stut: () => um,
  stutWith: () => om,
  stutwith: () => cm,
  sub: () => Nh,
  superimpose: () => Th,
  sus: () => qc,
  sustain: () => kc,
  sustainpedal: () => zl,
  swing: () => Vd,
  swingBy: () => Id,
  sysex: () => Ip,
  sysexdata: () => Hp,
  sysexid: () => Vp,
  sz: () => fl,
  take: () => Gn,
  time: () => ew,
  timeCat: () => ns,
  timecat: () => Jm,
  timeline: () => Cy,
  toBipolar: () => ud,
  tokenizeNote: () => Ue2,
  tour: () => ts,
  transient: () => rf,
  trem: () => Fc,
  tremolo: () => Wc,
  tremolodepth: () => Vc,
  tremolophase: () => Dc,
  tremoloshape: () => Gc,
  tremoloskew: () => Hc,
  tremolosync: () => Ic,
  tri: () => Ky,
  tri2: () => Yy,
  triode: () => jl,
  tsdelay: () => Dl,
  uid: () => up,
  undegrade: () => xw,
  undegradeBy: () => Cw,
  unicodeToBase64: () => wn,
  uniq: () => ah,
  uniqsort: () => lh,
  uniqsortr: () => yn,
  unison: () => Yu,
  unit: () => Al,
  useRNG: () => cw,
  v: () => xu,
  val: () => ap,
  valueToMidi: () => Zf,
  vel: () => tr,
  velocity: () => Zs,
  vib: () => Tu,
  vibmod: () => Ou,
  vibrato: () => Cu,
  vmod: () => zu,
  voice: () => Ha,
  vowel: () => Cl,
  warp: () => Cs,
  warpatt: () => Os,
  warpattack: () => Bs,
  warpdc: () => Rs,
  warpdec: () => Ms,
  warpdecay: () => zs,
  warpdepth: () => Ns,
  warpenv: () => Ds,
  warpmode: () => Fs,
  warprate: () => $s,
  warprel: () => Js,
  warprelease: () => js,
  warpshape: () => Ls,
  warpskew: () => Ws,
  warpsus: () => Es,
  warpsustain: () => Ps,
  warpsync: () => Gs,
  waveloss: () => xl,
  wavetablePhaseRand: () => Hs,
  wavetablePosition: () => ps,
  wavetableWarp: () => xs,
  wavetableWarpMode: () => Is,
  wchoose: () => _w,
  wchooseCycles: () => If,
  when: () => Gd,
  whenKey: () => Lw,
  withSeed: () => Lf,
  withValue: () => Ch,
  within: () => Pm,
  worklet: () => wy,
  wrandcat: () => vw,
  wt: () => ls,
  wtatt: () => ds,
  wtattack: () => hs,
  wtdc: () => As,
  wtdec: () => ys,
  wtdecay: () => ms,
  wtdepth: () => qs,
  wtenv: () => fs,
  wtphaserand: () => Vs,
  wtrate: () => vs,
  wtrel: () => _s,
  wtrelease: () => bs,
  wtshape: () => Ss,
  wtskew: () => Ts,
  wtsus: () => gs,
  wtsustain: () => ws,
  wtsync: () => ks,
  xfade: () => rs,
  xsdelay: () => Hl,
  zcrush: () => kp,
  zdelay: () => qp,
  zip: () => es,
  zipWith: () => Pt2,
  zmod: () => vp,
  znoise: () => _p,
  zoom: () => Jd,
  zoomArc: () => $d,
  zoomarc: () => Nd,
  zrand: () => mp,
  zzfx: () => Sp
});
function zt2(t, e = "cyclist") {
  console.error(t), E2(`[${e}] error: ${t.message}`);
}
function E2(t, e, n = {}) {
  let s = performance.now();
  Ut2 === t && s - Xt2 < Qe2 || (Ut2 = t, Xt2 = s, console.log(`%c${t}`, "background-color: black;color:white;border-radius:15px"), typeof document < "u" && typeof CustomEvent < "u" && document.dispatchEvent(new CustomEvent(oe2, {
    detail: {
      message: t,
      type: e,
      data: n
    }
  })));
}
function sn(t, e = 0) {
  return isNaN(Number(t)) ? (E2(`"${t}" is not a number, falling back to ${e}`, "warning"), e) : t;
}
function w2(t, e, n = t.length) {
  const s = function r(...o) {
    if (o.length >= n)
      return t.apply(this, o);
    {
      const i = function(...a) {
        return r.apply(this, o.concat(a));
      };
      return e && e(i, o), i;
    }
  };
  return e && e(s, []), s;
}
function ce2(t) {
  const e = Number(t);
  if (!isNaN(e))
    return e;
  if (Mt2(t))
    return gt2(t);
  throw new Error(`cannot parse as numeral: "${t}"`);
}
function ie2(t, e) {
  return (...n) => t(...n.map(e));
}
function L2(t) {
  return ie2(t, ce2);
}
function cn(t) {
  const e = Number(t);
  if (!isNaN(e))
    return e;
  const n = {
    pi: Math.PI,
    w: 1,
    h: 0.5,
    q: 0.25,
    e: 0.125,
    s: 0.0625,
    t: 1 / 3,
    f: 0.2,
    x: 1 / 6
  }[t];
  if (typeof n < "u")
    return n;
  throw new Error(`cannot parse as fractional: "${t}"`);
}
function ah(t) {
  var e = {};
  return t.filter(function(n) {
    return e.hasOwn(n) ? false : e[n] = true;
  });
}
function lh(t) {
  return t.sort().filter(function(e, n, s) {
    return !n || e != s[n - 1];
  });
}
function yn(t) {
  return t.sort((e, n) => e.compare(n)).filter(function(e, n, s) {
    return !n || e.ne(s[n - 1]);
  });
}
function wn(t) {
  const e = new TextEncoder().encode(t);
  return btoa(String.fromCharCode(...e));
}
function gn(t) {
  const e = new Uint8Array(atob(t).split("").map((s) => s.charCodeAt(0)));
  return new TextDecoder().decode(e);
}
function ph(t) {
  return encodeURIComponent(wn(t));
}
function fh(t) {
  return gn(decodeURIComponent(t));
}
function bn(t, e) {
  return Array.isArray(t) ? t.map(e) : Object.fromEntries(Object.entries(t).map(([n, s], r) => [n, e(s, n, r)]));
}
function Kt2(t, e) {
  return t / e;
}

class _n {
  constructor({
    getTargetClockTime: e = vn,
    weight: n = 16,
    offsetDelta: s = 0.005,
    checkAfterTime: r = 2,
    resetAfterTime: o = 8
  }) {
    this.offsetTime, this.timeAtPrevOffsetSample, this.prevOffsetTimes = [], this.getTargetClockTime = e, this.weight = n, this.offsetDelta = s, this.checkAfterTime = r, this.resetAfterTime = o, this.reset = () => {
      this.prevOffsetTimes = [], this.offsetTime = null, this.timeAtPrevOffsetSample = null;
    };
  }
  calculateOffset(e) {
    const n = this.getTargetClockTime(), s = n - this.timeAtPrevOffsetSample, r = n - e;
    if (s > this.resetAfterTime && this.reset(), this.offsetTime == null && (this.offsetTime = r), this.prevOffsetTimes.push(r), this.prevOffsetTimes.length > this.weight && this.prevOffsetTimes.shift(), this.timeAtPrevOffsetSample == null || s > this.checkAfterTime) {
      this.timeAtPrevOffsetSample = n;
      const o = nn(this.prevOffsetTimes);
      Math.abs(o - this.offsetTime) > this.offsetDelta && (this.offsetTime = o);
    }
    return this.offsetTime;
  }
  calculateTimestamp(e, n) {
    return this.calculateOffset(e) + n;
  }
}
function hh() {
  return performance.now() * 0.001;
}
function vn() {
  return Date.now() * 0.001;
}
function qn() {
  if (rt2 == null) {
    if (typeof window > "u")
      return;
    rt2 = {}, window.addEventListener("keydown", (t) => {
      rt2[t.key] = true;
    }), window.addEventListener("keyup", (t) => {
      rt2[t.key] = false;
    });
  }
  return { ...rt2 };
}
function ae(t, e = false) {
  return typeof t == "object" ? e ? JSON.stringify(t).slice(1, -1).replaceAll('"', "").replaceAll(",", " ") : JSON.stringify(t) : t;
}

class B2 {
  constructor(e, n) {
    this.begin = m(e), this.end = m(n);
  }
  get spanCycles() {
    const e = [];
    var n = this.begin;
    const s = this.end, r = s.sam();
    if (n.equals(s))
      return [new B2(n, s)];
    for (;s.gt(n); ) {
      if (n.sam().equals(r)) {
        e.push(new B2(n, this.end));
        break;
      }
      const o = n.nextSam();
      e.push(new B2(n, o)), n = o;
    }
    return e;
  }
  get duration() {
    return this.end.sub(this.begin);
  }
  cycleArc() {
    const e = this.begin.cyclePos(), n = e.add(this.duration);
    return new B2(e, n);
  }
  withTime(e) {
    return new B2(e(this.begin), e(this.end));
  }
  withEnd(e) {
    return new B2(this.begin, e(this.end));
  }
  withCycle(e) {
    const n = this.begin.sam(), s = n.add(e(this.begin.sub(n))), r = n.add(e(this.end.sub(n)));
    return new B2(s, r);
  }
  intersection(e) {
    const n = this.begin.max(e.begin), s = this.end.min(e.end);
    if (!n.gt(s) && !(n.equals(s) && (n.equals(this.end) && this.begin.lt(this.end) || n.equals(e.end) && e.begin.lt(e.end))))
      return new B2(n, s);
  }
  intersection_e(e) {
    const n = this.intersection(e);
    if (n == null)
      throw "TimeSpans do not intersect";
    return n;
  }
  midpoint() {
    return this.begin.add(this.duration.div(m(2)));
  }
  equals(e) {
    return this.begin.equals(e.begin) && this.end.equals(e.end);
  }
  show() {
    return this.begin.show() + " \u2192 " + this.end.show();
  }
}

class S2 {
  constructor(e, n, s, r = {}, o = false) {
    this.whole = e, this.part = n, this.value = s, this.context = r, this.stateful = o, o && console.assert(typeof this.value == "function", "Stateful values must be functions");
  }
  get duration() {
    let e;
    return typeof this.value?.duration == "number" ? e = m(this.value.duration) : e = this.whole.end.sub(this.whole.begin), typeof this.value?.clip == "number" ? e.mul(this.value.clip) : e;
  }
  get endClipped() {
    return this.whole.begin.add(this.duration);
  }
  isActive(e) {
    return this.whole.begin <= e && this.endClipped >= e;
  }
  isInPast(e) {
    return e > this.endClipped;
  }
  isInNearPast(e, n) {
    return n - e <= this.endClipped;
  }
  isInFuture(e) {
    return e < this.whole.begin;
  }
  isInNearFuture(e, n) {
    return n < this.whole.begin && n > this.whole.begin - e;
  }
  isWithinTime(e, n) {
    return this.whole.begin <= n && this.endClipped >= e;
  }
  wholeOrPart() {
    return this.whole ? this.whole : this.part;
  }
  withSpan(e) {
    const n = this.whole ? e(this.whole) : undefined;
    return new S2(n, e(this.part), this.value, this.context);
  }
  withValue(e) {
    return new S2(this.whole, this.part, e(this.value), this.context);
  }
  hasOnset() {
    return this.whole != null && this.whole.begin.equals(this.part.begin);
  }
  hasTag(e) {
    return this.context.tags?.includes(e);
  }
  resolveState(e) {
    if (this.stateful && this.hasOnset()) {
      console.log("stateful");
      const n = this.value, [s, r] = n(e);
      return [s, new S2(this.whole, this.part, r, this.context, false)];
    }
    return [e, this];
  }
  spanEquals(e) {
    return this.whole == null && e.whole == null || this.whole.equals(e.whole);
  }
  equals(e) {
    return this.spanEquals(e) && this.part.equals(e.part) && this.value === e.value;
  }
  show(e = false) {
    const n = typeof this.value == "object" ? e ? JSON.stringify(this.value).slice(1, -1).replaceAll('"', "").replaceAll(",", " ") : JSON.stringify(this.value) : this.value;
    var s = "";
    if (this.whole == null)
      s = "~" + this.part.show;
    else {
      var r = this.whole.begin.equals(this.part.begin) && this.whole.end.equals(this.part.end);
      this.whole.begin.equals(this.part.begin) || (s = this.whole.begin.show() + " \u21DC "), r || (s += "("), s += this.part.show(), r || (s += ")"), this.whole.end.equals(this.part.end) || (s += " \u21DD " + this.whole.end.show());
    }
    return "[ " + s + " | " + n + " ]";
  }
  showWhole(e = false) {
    return `${this.whole == null ? "~" : this.whole.show()}: ${ae(this.value, e)}`;
  }
  combineContext(e) {
    const n = this;
    return { ...n.context, ...e.context, locations: (n.context.locations || []).concat(e.context.locations || []) };
  }
  setContext(e) {
    return new S2(this.whole, this.part, this.value, e);
  }
  ensureObjectValue() {
    if (typeof this.value != "object")
      throw new Error(`expected hap.value to be an object, but got "${this.value}". Hint: append .note() or .s() to the end`, "error");
  }
}

class ut2 {
  constructor(e, n = {}) {
    this.span = e, this.controls = n;
  }
  setSpan(e) {
    return new ut2(e, this.controls);
  }
  withSpan(e) {
    return this.setSpan(e(this.span));
  }
  setControls(e) {
    return new ut2(this.span, { ...this.controls, ...e });
  }
}
function Tn(t, e, n) {
  if (e?.value !== undefined && Object.keys(e).length === 1)
    return E2("[warn]: Can't do arithmetic on control pattern."), t;
  const s = Object.keys(t).filter((r) => Object.keys(e).includes(r));
  return Object.assign({}, t, e, Object.fromEntries(s.map((r) => [r, n(t[r], e[r])])));
}
function Cn(t, e = 60) {
  let n = 0, s = m(0), r = [""], o = "";
  for (;r[0].length < e; ) {
    const i = t.queryArc(n, n + 1), a = i.filter((h) => h.hasOnset()).map((h) => h.duration), u = Sn(...a), p = u.inverse();
    r = r.map((h) => h + "|"), o += "|";
    for (let h = 0;h < p; h++) {
      const [y, g] = [s, s.add(u)], v = i.filter((O) => O.whole.begin.lte(y) && O.whole.end.gte(g)), _ = v.length - r.length;
      _ > 0 && (r = r.concat(Array(_).fill(o))), r = r.map((O, A) => {
        const I = v[A];
        if (I) {
          const P = I.whole.begin.eq(y) ? "" + I.value : "-";
          return O + P;
        }
        return O + ".";
      }), o += ".", s = s.add(u);
    }
    n++;
  }
  return r.join(`
`);
}
function Bn(t, e = {}) {
  const { wrapExpression: n = true, wrapAsync: s = true } = e;
  n && (t = `{${t}}`), s && (t = `(async ()=>${t})()`);
  const r = `"use strict";return (${t})`;
  return Function(r)();
}

class f2 {
  constructor(e, n = undefined) {
    this.query = e, this._Pattern = true, this._steps = n;
  }
  get _steps() {
    return this.__steps;
  }
  set _steps(e) {
    this.__steps = e === undefined ? undefined : m(e);
  }
  setSteps(e) {
    return this._steps = e, this;
  }
  withSteps(e) {
    return J2 ? new f2(this.query, this._steps === undefined ? undefined : e(this._steps)) : this;
  }
  get hasSteps() {
    return this._steps !== undefined;
  }
  withValue(e) {
    const n = new f2((s) => this.query(s).map((r) => r.withValue(e)));
    return n._steps = this._steps, n;
  }
  withState(e) {
    return new f2((n) => this.query(e(n)));
  }
  fmap(e) {
    return this.withValue(e);
  }
  appWhole(e, n) {
    const s = this, r = function(o) {
      const i = s.query(o), a = n.query(o), u = function(p, h) {
        const y = p.part.intersection(h.part);
        if (y != null)
          return new S2(e(p.whole, h.whole), y, p.value(h.value), h.combineContext(p));
      };
      return G(i.map((p) => lt2(a.map((h) => u(p, h)))));
    };
    return new f2(r);
  }
  appBoth(e) {
    const n = this, s = function(o, i) {
      if (!(o == null || i == null))
        return o.intersection_e(i);
    }, r = n.appWhole(s, e);
    return J2 && (r._steps = Y2(e._steps, n._steps)), r;
  }
  appLeft(e) {
    const n = this, s = function(o) {
      const i = [];
      for (const a of n.query(o)) {
        const u = e.query(o.setSpan(a.wholeOrPart()));
        for (const p of u) {
          const h = a.whole, y = a.part.intersection(p.part);
          if (y) {
            const g = a.value(p.value), v = p.combineContext(a), _ = new S2(h, y, g, v);
            i.push(_);
          }
        }
      }
      return i;
    }, r = new f2(s);
    return r._steps = this._steps, r;
  }
  appRight(e) {
    const n = this, s = function(o) {
      const i = [];
      for (const a of e.query(o)) {
        const u = n.query(o.setSpan(a.wholeOrPart()));
        for (const p of u) {
          const h = a.whole, y = p.part.intersection(a.part);
          if (y) {
            const g = p.value(a.value), v = a.combineContext(p), _ = new S2(h, y, g, v);
            i.push(_);
          }
        }
      }
      return i;
    }, r = new f2(s);
    return r._steps = e._steps, r;
  }
  bindWhole(e, n) {
    const s = this, r = function(o) {
      const i = function(u, p) {
        return new S2(e(u.whole, p.whole), p.part, p.value, Object.assign({}, u.context, p.context, {
          locations: (u.context.locations || []).concat(p.context.locations || [])
        }));
      }, a = function(u) {
        return n(u.value).query(o.setSpan(u.part)).map((p) => i(u, p));
      };
      return G(s.query(o).map((u) => a(u)));
    };
    return new f2(r);
  }
  bind(e) {
    const n = function(s, r) {
      if (!(s == null || r == null))
        return s.intersection_e(r);
    };
    return this.bindWhole(n, e);
  }
  join() {
    return this.bind(ot2);
  }
  outerBind(e) {
    return this.bindWhole((n) => n, e).setSteps(this._steps);
  }
  outerJoin() {
    return this.outerBind(ot2);
  }
  innerBind(e) {
    return this.bindWhole((n, s) => s, e);
  }
  innerJoin() {
    return this.innerBind(ot2);
  }
  resetJoin(e = false) {
    const n = this;
    return new f2((s) => n.discreteOnly().query(s).map((r) => r.value.late(e ? r.whole.begin : r.whole.begin.cyclePos()).query(s).map((o) => new S2(o.whole ? o.whole.intersection(r.whole) : undefined, o.part.intersection(r.part), o.value).setContext(r.combineContext(o))).filter((o) => o.part)).flat());
  }
  restartJoin() {
    return this.resetJoin(true);
  }
  squeezeJoin() {
    const e = this;
    function n(s) {
      const r = e.discreteOnly().query(s);
      function o(a) {
        const p = a.value._focusSpan(a.wholeOrPart()).query(s.setSpan(a.part));
        function h(y, g) {
          let v;
          if (g.whole && y.whole && (v = g.whole.intersection(y.whole), !v))
            return;
          const _ = g.part.intersection(y.part);
          if (!_)
            return;
          const O = g.combineContext(y);
          return new S2(v, _, g.value, O);
        }
        return p.map((y) => h(a, y));
      }
      return G(r.map(o)).filter((a) => a);
    }
    return new f2(n);
  }
  squeezeBind(e) {
    return this.fmap(e).squeezeJoin();
  }
  polyJoin = function() {
    const e = this;
    return e.fmap((n) => n.extend(e._steps.div(n._steps))).outerJoin();
  };
  polyBind(e) {
    return this.fmap(e).polyJoin();
  }
  queryArc(e, n, s = {}) {
    try {
      return this.query(new ut2(new B2(e, n), s));
    } catch (r) {
      return zt2(r, "query"), [];
    }
  }
  splitQueries() {
    const e = this, n = (s) => G(s.span.spanCycles.map((r) => e.query(s.setSpan(r))));
    return new f2(n);
  }
  withQuerySpan(e) {
    return new f2((n) => this.query(n.withSpan(e)));
  }
  withQuerySpanMaybe(e) {
    const n = this;
    return new f2((s) => {
      const r = s.withSpan(e);
      return r.span ? n.query(r) : [];
    });
  }
  withQueryTime(e) {
    return new f2((n) => this.query(n.withSpan((s) => s.withTime(e))));
  }
  withHapSpan(e) {
    return new f2((n) => this.query(n).map((s) => s.withSpan(e)));
  }
  withHapTime(e) {
    return this.withHapSpan((n) => n.withTime(e));
  }
  withHaps(e) {
    const n = new f2((s) => e(this.query(s), s));
    return n._steps = this._steps, n;
  }
  withHap(e) {
    return this.withHaps((n) => n.map(e));
  }
  setContext(e) {
    return this.withHap((n) => n.setContext(e));
  }
  withContext(e) {
    const n = this.withHap((s) => s.setContext(e(s.context)));
    return this.__pure !== undefined && (n.__pure = this.__pure, n.__pure_loc = this.__pure_loc), n;
  }
  stripContext() {
    return this.withHap((e) => e.setContext({}));
  }
  withLoc(e, n) {
    const s = {
      start: e,
      end: n
    }, r = this.withContext((o) => {
      const i = (o.locations || []).concat([s]);
      return { ...o, locations: i };
    });
    return this.__pure && (r.__pure = this.__pure, r.__pure_loc = s), r;
  }
  filterHaps(e) {
    return new f2((n) => this.query(n).filter(e));
  }
  filterValues(e) {
    return new f2((n) => this.query(n).filter((s) => e(s.value))).setSteps(this._steps);
  }
  removeUndefineds() {
    return this.filterValues((e) => e != null);
  }
  onsetsOnly() {
    return this.filterHaps((e) => e.hasOnset());
  }
  discreteOnly() {
    return this.filterHaps((e) => e.whole);
  }
  defragmentHaps() {
    return this.discreteOnly().withHaps((n) => {
      const s = [];
      for (var r = 0;r < n.length; ++r) {
        for (var o = true, i = n[r];o; ) {
          const p = JSON.stringify(n[r].value);
          for (var a = false, u = r + 1;u < n.length; u++) {
            const h = n[u];
            if (i.whole.equals(h.whole)) {
              if (i.part.begin.eq(h.part.end)) {
                if (p === JSON.stringify(h.value)) {
                  i = new S2(i.whole, new B2(h.part.begin, i.part.end), i.value), n.splice(u, 1), a = true;
                  break;
                }
              } else if (h.part.begin.eq(i.part.end) && p == JSON.stringify(h.value)) {
                i = new S2(i.whole, new B2(i.part.begin, h.part.end), i.value), n.splice(u, 1), a = true;
                break;
              }
            }
          }
          o = a;
        }
        s.push(i);
      }
      return s;
    });
  }
  firstCycle(e = false) {
    var n = this;
    return e || (n = n.stripContext()), n.query(new ut2(new B2(m(0), m(1))));
  }
  get firstCycleValues() {
    return this.firstCycle().map((e) => e.value);
  }
  get showFirstCycle() {
    return this.firstCycle().map((e) => `${e.value}: ${e.whole.begin.toFraction()} - ${e.whole.end.toFraction()}`);
  }
  sortHapsByPart() {
    return this.withHaps((e) => e.sort((n, s) => n.part.begin.sub(s.part.begin).or(n.part.end.sub(s.part.end)).or(n.whole.begin.sub(s.whole.begin).or(n.whole.end.sub(s.whole.end)))));
  }
  asNumber() {
    return this.fmap(ce2);
  }
  _opIn(e, n) {
    return this.fmap(n).appLeft(d(e));
  }
  _opOut(e, n) {
    return this.fmap(n).appRight(d(e));
  }
  _opMix(e, n) {
    return this.fmap(n).appBoth(d(e));
  }
  _opSqueeze(e, n) {
    const s = d(e);
    return this.fmap((r) => s.fmap((o) => n(r)(o))).squeezeJoin();
  }
  _opSqueezeOut(e, n) {
    const s = this;
    return d(e).fmap((o) => s.fmap((i) => n(i)(o))).squeezeJoin();
  }
  _opReset(e, n) {
    return d(e).fmap((r) => this.fmap((o) => n(o)(r))).resetJoin();
  }
  _opRestart(e, n) {
    return d(e).fmap((r) => this.fmap((o) => n(o)(r))).restartJoin();
  }
  _opPoly(e, n) {
    const s = d(e);
    return this.fmap((r) => s.fmap((o) => n(o)(r))).polyJoin();
  }
  layer(...e) {
    return z(...e.map((n) => n(this)));
  }
  superimpose(...e) {
    return this.stack(...e.map((n) => n(this)));
  }
  stack(...e) {
    return z(this, ...e);
  }
  sequence(...e) {
    return Q2(this, ...e);
  }
  seq(...e) {
    return Q2(this, ...e);
  }
  cat(...e) {
    return mt2(this, ...e);
  }
  fastcat(...e) {
    return N2(this, ...e);
  }
  slowcat(...e) {
    return Z2(this, ...e);
  }
  onTrigger(e, n = true) {
    return this.withHap((s) => s.setContext({
      ...s.context,
      onTrigger: (...r) => {
        s.context.onTrigger?.(...r), e(...r);
      },
      dominantTrigger: s.context.dominantTrigger || n
    }));
  }
  log(e = (s) => `[hap] ${s.showWhole(true)}`, n = (s) => ({ hap: s })) {
    return this.onTrigger((...s) => {
      E2(e(...s), undefined, n(...s));
    }, false);
  }
  logValues(e = (n) => `[hap] ${ae(n, true)}`) {
    return this.log((n) => e(n.value));
  }
  drawLine() {
    return console.log(Cn(this)), this;
  }
  unjoin(e, n = ot2) {
    return e.withHap((s) => s.withValue((r) => r ? n(this.ribbon(s.whole.begin, s.whole.duration)) : this));
  }
  into(e, n) {
    return this.unjoin(e, n).innerJoin();
  }
}
function zn(t, e) {
  let n = [];
  return e.forEach((s) => {
    const r = n.findIndex(([o]) => t(s, o));
    r === -1 ? n.push([s]) : n[r].push(s);
  }), n;
}
function dt2(t) {
  return !Array.isArray(t) && typeof t == "object" && !An(t);
}
function Pn(t, e, n) {
  return dt2(t) || dt2(e) ? (dt2(t) || (t = { value: t }), dt2(e) || (e = { value: e }), Tn(t, e, n)) : n(t, e);
}
function C2(t) {
  function e(s) {
    return s.span.spanCycles.map((r) => new S2(m(r.begin).wholeCycle(), r, t));
  }
  const n = new f2(e, 1);
  return n.__pure = t, n;
}
function pe2(t) {
  return t instanceof f2 || t?._Pattern;
}
function d(t) {
  return pe2(t) ? t : Ct2 && typeof t == "string" ? Ct2(t) : C2(t);
}
function En(t) {
  let e = C2([]);
  for (const n of t)
    e = e.bind((s) => n.fmap((r) => s.concat([r])));
  return e;
}
function z(...t) {
  t = t.map((s) => Array.isArray(s) ? Q2(...s) : d(s));
  const e = (s) => G(t.map((r) => r.query(s))), n = new f2(e);
  return J2 && (n._steps = Y2(...t.map((s) => s._steps))), n;
}
function Et2(t, e) {
  if (e = e.map((o) => Array.isArray(o) ? Q2(...o) : d(o)), e.length === 0)
    return q2;
  if (e.length === 1)
    return e[0];
  const [n, ...s] = e.map((o) => o._steps), r = J2 ? n.maximum(...s) : undefined;
  return z(...t(r, e));
}
function jn(...t) {
  return Et2((e, n) => n.map((s) => s._steps.eq(e) ? s : $2(s, pt2(e.sub(s._steps)))), t);
}
function Jn(...t) {
  return Et2((e, n) => n.map((s) => s._steps.eq(e) ? s : $2(pt2(e.sub(s._steps)), s)), t);
}
function $n(...t) {
  return Et2((e, n) => n.map((s) => {
    if (s._steps.eq(e))
      return s;
    const r = pt2(e.sub(s._steps).div(2));
    return $2(r, s, r);
  }), t);
}
function vh(t, ...e) {
  const [n, ...s] = e.map((i) => i._steps), r = n.maximum(...s), o = {
    centre: $n,
    left: jn,
    right: Jn,
    expand: z,
    repeat: (...i) => $t2(...i).steps(r)
  };
  return t.inhabit(o).fmap((i) => i(...e)).innerJoin().setSteps(r);
}
function Z2(...t) {
  if (t = t.map((s) => Array.isArray(s) ? N2(...s) : d(s)), t.length == 1)
    return t[0];
  const e = function(s) {
    const r = s.span, o = bt2(r.begin.sam(), t.length), i = t[o];
    if (!i)
      return [];
    const a = r.begin.floor().sub(r.begin.div(t.length).floor());
    return i.withHapTime((u) => u.add(a)).query(s.setSpan(r.withTime((u) => u.sub(a))));
  }, n = J2 ? Y2(...t.map((s) => s._steps)) : undefined;
  return new f2(e).splitQueries().setSteps(n);
}
function fe2(...t) {
  t = t.map(d);
  const e = function(n) {
    const s = Math.floor(n.span.begin) % t.length;
    return t[s]?.query(n) || [];
  };
  return new f2(e).splitQueries();
}
function mt2(...t) {
  return Z2(...t);
}
function kh(...t) {
  const e = t.reduce((n, [s]) => n + s, 0);
  return t = t.map(([n, s]) => [n, s.fast(n)]), $2(...t).slow(e);
}
function qh(...t) {
  let e = m(0);
  for (let n of t)
    n.length == 2 && n.unshift(e), e = n[1];
  return z(...t.map(([n, s, r]) => C2(d(r)).compress(m(n).div(e), m(s).div(e)))).slow(e).innerJoin();
}
function N2(...t) {
  let e = Z2(...t);
  return t.length > 1 && (e = e._fast(t.length), e._steps = t.length), t.length == 1 && t[0].__steps_source && (t._steps = t[0]._steps), e;
}
function Q2(...t) {
  return N2(...t);
}
function Nn(...t) {
  return N2(...t);
}
function xt2(t) {
  return Array.isArray(t) ? t.length == 0 ? [q2, 0] : t.length == 1 ? xt2(t[0]) : [N2(...t.map((e) => xt2(e)[0])), t.length] : [d(t), 1];
}
function l(t, e, n = true, s = false, r = (o) => o.innerJoin()) {
  if (Array.isArray(t)) {
    const u = {};
    for (const p of t)
      u[p] = l(p, e, n, s, r);
    return u;
  }
  const o = e.length;
  var i;
  n ? i = function(...u) {
    u = u.map(d);
    const p = u[u.length - 1];
    let h;
    if (o === 1)
      h = e(p);
    else {
      const y = u.slice(0, -1);
      if (y.every((g) => g.__pure != null)) {
        const g = y.map((_) => _.__pure), v = y.filter((_) => _.__pure_loc).map((_) => _.__pure_loc);
        h = e(...g, p), h = h.withContext((_) => {
          const O = (_.locations || []).concat(v);
          return { ..._, locations: O };
        });
      } else {
        const [g, ...v] = y;
        let _ = (...O) => e(...O, p);
        _ = w2(_, null, o - 1), h = r(v.reduce((O, A) => O.appLeft(A), g.fmap(_)));
      }
    }
    return s && (h._steps = p._steps), h;
  } : i = function(...u) {
    u = u.map(d);
    const p = e(...u);
    return s && (p._steps = u[u.length - 1]._steps), p;
  }, f2.prototype[t] = function(...u) {
    if (o === 2 && u.length !== 1)
      u = [Q2(...u)];
    else if (o !== u.length + 1)
      throw new Error(`.${t}() expects ${o - 1} inputs but got ${u.length}.`);
    return u = u.map(d), i(...u, this);
  }, o > 1 && (f2.prototype["_" + t] = function(...u) {
    const p = e(...u, this);
    return s && p.setSteps(this._steps), p;
  });
  const a = w2(i, null, o);
  return le[t] = a, a;
}
function et2(t, e, n = true, s = false, r = (o) => o.stepJoin()) {
  return l(t, e, n, s, r);
}
function Yt2(t) {
  const e = t.filter((o, i) => i.hasSteps).reduce((o, i) => o.add(i), m(0)), n = lt2(t.map((o, i) => i._steps)).reduce((o, i) => o.add(i), m(0)), s = e.eq(0) ? undefined : n.div(e);
  function r(o, i) {
    return i._steps === undefined ? [o.mulmaybe(s), i] : [i._steps, i];
  }
  return t.map((o) => r(...o));
}
function Zt2(t) {
  const e = G(t.map((r) => [r.part.begin, r.part.end])), n = yn([m(0), m(1), ...e]);
  return un(n).map((r) => [
    r[1].sub(r[0]),
    z(...Fn(new B2(...r), t).map((o) => o.value.withHap((i) => i.setContext(i.combineContext(o)))))
  ]);
}
function Fn(t, e) {
  return lt2(e.map((n) => In(t, n)));
}
function In(t, e) {
  const n = t.intersection(e.part);
  if (n != null)
    return new S2(e.whole, n, e.value, e.context);
}
function Hn(t, ...e) {
  const n = e.map((r) => xt2(r));
  if (n.length == 0)
    return q2;
  t == 0 && (t = n[0][1]);
  const s = [];
  for (const r of n)
    r[1] != 0 && (t == r[1] ? s.push(r[0]) : s.push(r[0]._fast(m(t).div(m(r[1])))));
  return z(...s);
}
function $t2(...t) {
  if (Array.isArray(t[0]))
    return Hn(0, ...t);
  if (t = t.filter((s) => s.hasSteps), t.length == 0)
    return q2;
  const e = Y2(...t.map((s) => s._steps));
  if (e.eq(m(0)))
    return R;
  const n = z(...t.map((s) => s.pace(e)));
  return n._steps = e, n;
}
function $2(...t) {
  if (t.length === 0)
    return R;
  const e = (i) => Array.isArray(i) ? i : [i._steps ?? 1, i];
  if (t = t.map(e), t.find((i) => i[0] === undefined)) {
    const i = t.map((u) => u[0]).filter((u) => u !== undefined);
    if (i.length === 0)
      return N2(...t.map((u) => u[1]));
    if (i.length === t.length)
      return R;
    const a = i.reduce((u, p) => u.add(p), m(0)).div(i.length);
    for (let u of t)
      u[0] === undefined && (u[0] = a);
  }
  if (t.length == 1)
    return d(t[0][1]).withSteps((a) => t[0][0]);
  const n = t.map((i) => i[0]).reduce((i, a) => i.add(a), m(0));
  let s = m(0);
  const r = [];
  for (const [i, a] of t) {
    if (m(i).eq(0))
      continue;
    const u = s.add(i);
    r.push(d(a)._compress(s.div(n), u.div(n))), s = u;
  }
  const o = z(...r);
  return o._steps = n, o;
}
function Dn(...t) {
  t = t.map((r) => Array.isArray(r) ? r.map(d) : [d(r)]);
  const e = Y2(...t.map((r) => m(r.length)));
  let n = [];
  for (let r = 0;r < e; ++r)
    n.push(...t.map((o) => o.length == 0 ? q2 : o[r % o.length]));
  n = n.filter((r) => r.hasSteps && r._steps > 0);
  const s = n.reduce((r, o) => r.add(o._steps), m(0));
  return n = $2(...n), n._steps = s, n;
}
function Nt2(t) {
  let e = Array.isArray(t);
  t = e ? t : [t];
  const n = t[0], s = (o) => {
    let i;
    if (typeof o == "object" && o.value !== undefined && (i = { ...o }, o = o.value, delete i.value), e && Array.isArray(o)) {
      const a = i || {};
      return o.forEach((u, p) => {
        p < t.length && (a[t[p]] = u);
      }), a;
    } else
      return i ? (i[n] = o, i) : { [n]: o };
  }, r = function(o, i) {
    return i ? typeof o > "u" ? i.fmap(s) : i.set(d(o).withValue(s)) : d(o).withValue(s);
  };
  return f2.prototype[n] = function(o) {
    return r(o, this);
  }, r;
}
function is(t) {
  return at2.has(t);
}
function c2(t, ...e) {
  const n = Array.isArray(t) ? t[0] : t;
  let s = {};
  return s[n] = Nt2(t), at2.set(n, n), e.forEach((r) => {
    s[r] = s[n], at2.set(r, n), f2.prototype[r] = f2.prototype[n];
  }), s;
}
function V2(t, e, ...n) {
  t = Array.isArray(t) ? t : [t];
  let s = {};
  for (let r = 1;r <= e; r++) {
    let o = [...n], i = [...t];
    if (r === 1) {
      const u = o.map((h) => `${h}1`), p = i.map((h) => `${h}1`);
      o = o.concat(u).concat(p);
    } else
      o = o.map((u) => `${u}${r}`), i = i.map((u) => `${u}${r}`);
    const a = c2(i, ...o);
    s = { ...s, ...a };
  }
  return s;
}
function ff(t, e, n = 0.05, s = 0.1, r = 0.1, o = globalThis.setInterval, i = globalThis.clearInterval, a = true) {
  let u = 0, p = 0, h = 10 ** 4, y = 0.01;
  const g = (x) => n = x(n);
  r = r || s / 2;
  const v = () => {
    const x = t(), D = x + s + r;
    for (p === 0 && (p = x + y);p < D; )
      p = a ? Math.round(p * h) / h : p, e(p, n, u, x), p += n, u++;
  };
  let _;
  const O = () => {
    A(), v(), _ = o(v, s * 1000);
  }, A = () => {
    _ !== undefined && i(_), _ = undefined;
  };
  return { setDuration: g, start: O, stop: () => {
    u = 0, p = 0, A();
  }, pause: () => A(), duration: n, interval: s, getPhase: () => p, minLatency: y };
}

class hf {
  constructor({
    interval: e,
    onTrigger: n,
    onToggle: s,
    onError: r,
    getTime: o,
    latency: i = 0.1,
    setInterval: a,
    clearInterval: u,
    beforeStart: p
  }) {
    this.started = false, this.beforeStart = p, this.cps = 0.5, this.num_ticks_since_cps_change = 0, this.lastTick = 0, this.lastBegin = 0, this.lastEnd = 0, this.getTime = o, this.num_cycles_at_cps_change = 0, this.seconds_at_cps_change, this.onToggle = s, this.latency = i, this.clock = ff(o, (h, y, g, v) => {
      this.num_ticks_since_cps_change === 0 && (this.num_cycles_at_cps_change = this.lastEnd, this.seconds_at_cps_change = h), this.num_ticks_since_cps_change++;
      const O = this.num_ticks_since_cps_change * y * this.cps;
      try {
        const A = this.lastEnd;
        this.lastBegin = A;
        const I = this.num_cycles_at_cps_change + O;
        if (this.lastEnd = I, this.lastTick = h, h < v) {
          console.log("skip query: too late");
          return;
        }
        this.pattern.queryArc(A, I, { _cps: this.cps, cyclist: "cyclist" }).forEach((P) => {
          if (P.hasOnset()) {
            const x = (P.whole.begin - this.num_cycles_at_cps_change) / this.cps + this.seconds_at_cps_change + i, D = P.duration / this.cps, nt = x - h;
            n?.(P, nt, D, this.cps, x), P.value.cps !== undefined && this.cps != P.value.cps && (this.cps = P.value.cps, this.num_ticks_since_cps_change = 0);
          }
        });
      } catch (A) {
        zt2(A), r?.(A);
      }
    }, e, 0.1, 0.1, a, u);
  }
  now() {
    if (!this.started)
      return 0;
    const e = this.getTime() - this.lastTick - this.clock.duration;
    return this.lastBegin + e * this.cps;
  }
  setStarted(e) {
    this.started = e, this.onToggle?.(e);
  }
  async start() {
    if (await this.beforeStart?.(), this.num_ticks_since_cps_change = 0, this.num_cycles_at_cps_change = 0, !this.pattern)
      throw new Error("Scheduler: no pattern set! call .setPattern first.");
    E2("[cyclist] start"), this.clock.start(), this.setStarted(true);
  }
  pause() {
    E2("[cyclist] pause"), this.clock.pause(), this.setStarted(false);
  }
  stop() {
    E2("[cyclist] stop"), this.clock.stop(), this.lastEnd = 0, this.setStarted(false);
  }
  async setPattern(e, n = false) {
    this.pattern = e, n && !this.started && await this.start();
  }
  setCps(e = 0.5) {
    this.cps !== e && (this.cps = e, this.num_ticks_since_cps_change = 0);
  }
  log(e, n, s) {
    const r = s.filter((o) => o.hasOnset());
    console.log(`${e.toFixed(4)} - ${n.toFixed(4)} ${Array(r.length).fill("I").join("")}`);
  }
}

class bf {
  constructor({ onTrigger: e, onToggle: n, getTime: s }) {
    this.started = false, this.cps = 0.5, this.getTime = s, this.time_at_last_tick_message = 0, this.collator = new _n({ getTargetClockTime: s }), this.onToggle = n, this.latency = 0.1, this.cycle = 0, this.id = Math.round(Date.now() * Math.random()), this.worker = new SharedWorker(new URL("" + new URL("assets/clockworker-ZDiUtESR.js", import.meta.url).href, import.meta.url)), this.worker.port.start(), this.channel = new BroadcastChannel("strudeltick");
    const r = (i) => {
      const { cps: a, begin: u, end: p, cycle: h, time: y } = i;
      this.cps = a, this.cycle = h;
      const g = this.collator.calculateOffset(y) + y;
      o(u, p, g), this.time_at_last_tick_message = g;
    }, o = (i, a, u) => {
      if (this.started === false)
        return;
      this.pattern.queryArc(i, a, { _cps: this.cps, cyclist: "neocyclist" }).forEach((h) => {
        if (h.hasOnset()) {
          const g = Kt2(h.whole.begin - this.cycle, this.cps) + u + this.latency, v = Kt2(h.duration, this.cps);
          e?.(h, 0, v, this.cps, g);
        }
      });
    };
    this.channel.onmessage = (i) => {
      if (!this.started)
        return;
      const { payload: a, type: u } = i.data;
      switch (u) {
        case "tick":
          r(a);
      }
    };
  }
  sendMessage(e, n) {
    this.worker.port.postMessage({ type: e, payload: n, id: this.id });
  }
  now() {
    const e = (this.getTime() - this.time_at_last_tick_message) * this.cps;
    return this.cycle + e;
  }
  setCps(e = 1) {
    this.sendMessage("cpschange", { cps: e });
  }
  setCycle(e) {
    this.sendMessage("setcycle", { cycle: e });
  }
  setStarted(e) {
    this.sendMessage("toggle", { started: e }), this.started = e, this.onToggle?.(e);
  }
  start() {
    E2("[cyclist] start"), this.setStarted(true);
  }
  stop() {
    E2("[cyclist] stop"), this.collator.reset(), this.setStarted(false);
  }
  setPattern(e, n = false) {
    this.pattern = e, n && !this.started && this.start();
  }
  log(e, n, s) {
    const r = s.filter((o) => o.hasOnset());
    console.log(`${e.toFixed(4)} - ${n.toFixed(4)} ${Array(r.length).fill("I").join("")}`);
  }
}
function Wy() {
  if (!Ot2)
    throw new Error("no time set! use setTime to define a time source");
  return Ot2();
}
function ee2(t) {
  Ot2 = t;
}
function _f(t) {
  _e2 = t;
}
function Fy() {
  return _e2?.();
}
function vf(t) {
  ve2 = t;
}
function Iy() {
  return ve2;
}
function kf(t) {
  ke2 = t;
}
function Vy() {
  return ke2;
}
function qf(t) {
  qe2 = !!t;
}
function Hy() {
  return qe2;
}
function Dy({
  defaultOutput: t,
  onEvalError: e,
  beforeEval: n,
  beforeStart: s,
  afterEval: r,
  getTime: o,
  transpiler: i,
  onToggle: a,
  editPattern: u,
  onUpdateState: p,
  sync: h = false,
  setInterval: y,
  clearInterval: g,
  id: v,
  mondo: _ = false
}) {
  const O = new en({ localScope: true }), A = {
    schedulerError: undefined,
    evalError: undefined,
    code: "// LOADING",
    activeCode: "// LOADING",
    pattern: undefined,
    miniLocations: [],
    widgets: [],
    pending: false,
    started: false
  }, I = {
    id: v
  }, H = (b) => {
    Object.assign(A, b), A.isDirty = A.code !== A.activeCode, A.error = A.evalError || A.schedulerError, p?.(A);
  }, P = {
    onTrigger: Sf({ defaultOutput: t, getTime: o }),
    getTime: o,
    onToggle: (b) => {
      H({ started: b }), qf(b), a?.(b), b || df();
    },
    setInterval: y,
    clearInterval: g,
    beforeStart: s
  }, x = h && typeof SharedWorker < "u" ? new bf(P) : new hf(P);
  kf(P.onTrigger), _f(() => x.cps);
  let D = {}, nt = 0, tt;
  const Vt = function() {
    return D = {}, nt = 0, tt = undefined, q2;
  }, Je = (b) => O.evaluate(b).compile({ log: false });
  function Ht(b) {
    return b._Pattern ? b.__pure : b;
  }
  const Dt = async (b, k = true) => (b = u?.(b) || b, await x.setPattern(b, k), vf(b), b);
  ee2(() => x.now());
  const $e = () => x.stop(), Ne = () => x.start(), Le = () => x.pause(), Re = () => x.toggle(), St = (b) => (x.setCps(Ht(b)), q2), Gt = (b) => (x.setCps(Ht(b) / 60), q2);
  let ft = [];
  const We = function(b) {
    return ft.push(b), q2;
  }, Fe = function(b) {
    return tt = b, q2;
  }, Ie = () => {
    f2.prototype.p = function(k) {
      return typeof k == "string" && (k.startsWith("_") || k.endsWith("_")) ? q2 : (k.includes("$") && (k = `${k}${nt}`, nt++), D[k] = this, this);
    }, f2.prototype.q = function(k) {
      return q2;
    };
    try {
      for (let k = 1;k < 10; ++k)
        Object.defineProperty(f2.prototype, `d${k}`, {
          get() {
            return this.p(k);
          },
          configurable: true
        }), Object.defineProperty(f2.prototype, `p${k}`, {
          get() {
            return this.p(k);
          },
          configurable: true
        }), f2.prototype[`q${k}`] = q2;
    } catch (k) {
      console.warn("injectPatternMethods: error:", k);
    }
    const b = l("cpm", function(k, At) {
      return At._fast(k / 60 / x.cps);
    });
    return xn({
      all: We,
      each: Fe,
      hush: Vt,
      cpm: b,
      setCps: St,
      setcps: St,
      setCpm: Gt,
      setcpm: Gt,
      compileKabel: Je
    });
  };
  return { scheduler: x, evaluate: async (b, k = true, At = true) => {
    if (!b)
      throw new Error("no code to evaluate");
    try {
      H({ code: b, pending: true }), await Ie(), ee2(() => x.now()), await n?.({ code: b }), ft = [], At && Vt(), _ && (b = `mondolang\`${b}\``);
      let { pattern: M, meta: Tt } = await On(b, i, I);
      if (Object.keys(D).length) {
        let X = [], ht = false;
        for (const [st, Ve] of Object.entries(D)) {
          const Qt = st.length > 1 && st.startsWith("S");
          if (Qt && ht === false && (X = [], ht = true), !ht || ht && Qt) {
            const He = Ve.withState((De) => De.setControls({ id: st }));
            X.push(He);
          }
        }
        tt && (X = X.map((st) => tt(st))), M = z(...X);
      } else
        tt && (M = tt(M));
      if (ft.length)
        for (const X of ft)
          M = X(M);
      return pe2(M) || (M = q2), E2("[eval] code updated"), M = await Dt(M, k), H({
        miniLocations: Tt?.miniLocations || [],
        widgets: Tt?.widgets || [],
        activeCode: b,
        pattern: M,
        evalError: undefined,
        schedulerError: undefined,
        pending: false
      }), r?.({ code: b, pattern: M, meta: Tt }), M;
    } catch (M) {
      E2(`[eval] error: ${M.message}`, "error"), console.error(M), H({ evalError: M, pending: false }), e?.(M);
    }
  }, start: Ne, stop: $e, pause: Le, setCps: St, setPattern: Dt, setCode: (b) => H({ code: b }), toggle: Re, state: A };
}
function Gy(t) {
  return new f2((e) => [new S2(undefined, e.span, t)]);
}
function Vf(t, e = 0) {
  let n = Math.floor(t), s = n + 1;
  const r = (p) => 6 * p ** 5 - 15 * p ** 4 + 10 * p ** 3, o = (p) => (h) => (y) => h + r(p) * (y - h), i = K2(n, 1, e), a = K2(s, 1, e);
  return o(t - n)(i)(a);
}
function Hf(t, e = 0) {
  const n = Math.floor(t), s = n + 1, r = K2(n, 1, e), o = K2(s, 1, e), i = r + o, a = (t - n) / (s - n);
  return ((p, h, y) => p + y * (h - p))(r, i, a) / 2;
}
function je2(t) {
  Array.isArray(t) === false && (t = [t]);
  const e = qn();
  return t.every((n) => {
    const s = kn.get(n) ?? n;
    return e[s];
  });
}
function Gf(t, e, n) {
  wt2.cancel();
  const s = new SpeechSynthesisUtterance(t);
  s.lang = e, re2 = wt2.getVoices();
  const r = re2.filter((o) => o.lang.includes(e));
  typeof n == "number" ? s.voice = r[n % r.length] : typeof n == "string" && (s.voice = r.find((o) => o.name === o)), speechSynthesis.speak(s);
}
var oe2 = "strudel.log", Qe2 = 1000, Ut2, Xt2, Yf = (t) => /^[a-gA-G][#bsf]*[0-9]*$/.test(t), Mt2 = (t) => /^[a-gA-G][#bsf]*-?[0-9]*$/.test(t), Ue2 = (t) => {
  if (typeof t != "string")
    return [];
  const [e, n = "", s] = t.match(/^([a-gA-G])([#bsf]*)(-?[0-9]*)$/)?.slice(1) || [];
  return e ? [e, n, s ? Number(s) : undefined] : [];
}, Xe2, Ke2, Ye2 = (t) => t?.split("").reduce((e, n) => e + Ke2[n], 0) || 0, gt2 = (t, e = 3) => {
  const [n, s, r = e] = Ue2(t);
  if (!n)
    throw new Error('not a note: "' + t + '"');
  const o = Xe2[n.toLowerCase()], i = Ye2(s);
  return (Number(r) + 1) * 12 + o + i;
}, it2 = (t) => Math.pow(2, (t - 69) / 12) * 440, Ze2 = (t) => 12 * Math.log(t / 440) / Math.LN2 + 69, Zf = (t, e) => {
  if (typeof t != "object")
    throw new Error("valueToMidi: expected object value");
  let { freq: n, note: s } = t;
  if (typeof n == "number")
    return Ze2(n);
  if (typeof s == "string")
    return gt2(s);
  if (typeof s == "number")
    return s;
  if (!e)
    throw new Error("valueToMidi: expected freq or note to be set");
  return e;
}, th = (t, e) => (t - e) * 1000, tn = (t) => it2(typeof t == "number" ? t : gt2(t)), en2, eh = (t) => {
  const e = Math.floor(t / 12) - 1;
  return en2[t % 12] + e;
}, bt2 = (t, e) => (t % e + e) % e, nn = (t) => t.reduce((e, n) => e + n) / t.length, nh = (t, e) => bt2(Math.round(sn(t ?? 0, 0)), e), sh = (t) => {
  let { value: e, context: n } = t, s = e;
  if (typeof s == "object" && !Array.isArray(s) && (s = s.note || s.n || s.value, s === undefined))
    throw new Error(`cannot find a playable note for ${JSON.stringify(e)}`);
  if (typeof s == "number" && n.type !== "frequency")
    s = it2(t.value);
  else if (typeof s == "number" && n.type === "frequency")
    s = t.value;
  else if (typeof s != "string" || !Mt2(s))
    throw new Error("not a note: " + JSON.stringify(s));
  return s;
}, rh = (t) => {
  let { value: e, context: n } = t;
  if (typeof e == "object")
    return e.freq ? e.freq : tn(e.note || e.n || e.value);
  if (typeof e == "number" && n.type !== "frequency")
    e = it2(t.value);
  else if (typeof e == "string" && Mt2(e))
    e = it2(gt2(t.value));
  else if (typeof e != "number")
    throw new Error("not a note or frequency: " + e);
  return e;
}, rn = (t, e) => t.slice(e).concat(t.slice(0, e)), on = (...t) => t.reduce((e, n) => (...s) => e(n(...s)), (e) => e), oh = (...t) => on(...t.reverse()), lt2 = (t) => t.filter((e) => e != null), G = (t) => [].concat(...t), ot2 = (t) => t, ch = (t, e) => t, _t2 = (t, e) => Array.from({ length: e - t + 1 }, (n, s) => s + t), ih = (t) => ie2(t, cn), ue2 = function(t, e) {
  return [e.slice(0, t), e.slice(t)];
}, Pt2 = (t, e, n) => e.map((s, r) => t(s, n[r])), un = function(t) {
  const e = [];
  for (let n = 0;n < t.length - 1; ++n)
    e.push([t[n], t[n + 1]]);
  return e;
}, an = (t, e, n) => Math.min(Math.max(t, e), n), ln, pn, fn, hn, dn, mn, uh = (t, e = "letters") => {
  const s = (e === "solfeggio" ? ln : e === "indian" ? pn : e === "german" ? fn : e === "byzantine" ? hn : e === "japanese" ? dn : mn)[t % 12], r = Math.floor(t / 12) - 1;
  return s + r;
}, kn, rt2, m = (t) => Fraction(t), Sn = (...t) => {
  if (t = lt2(t), t.length !== 0)
    return t.reduce((e, n) => e.gcd(n), m(1));
}, Y2 = (...t) => {
  if (t = lt2(t), t.length === 0)
    return;
  const e = t.pop();
  return t.reduce((n, s) => n === undefined || s === undefined ? undefined : n.lcm(s), e);
}, An = (t) => t instanceof Fraction, le, xn = async (...t) => {
  const e = await Promise.allSettled(t), n = e.filter((s) => s.status === "fulfilled").map((s) => s.value);
  return e.forEach((s, r) => {
    s.status === "rejected" && console.warn(`evalScope: module with index ${r} could not be loaded:`, s.reason);
  }), n.forEach((s) => {
    Object.entries(s).forEach(([r, o]) => {
      globalThis[r] = o, le[r] = o;
    });
  }), n;
}, On = async (t, e, n) => {
  let s = {};
  if (e) {
    const i = e(t, n);
    t = i.output, s = i;
  }
  return { mode: "javascript", pattern: await Bn(t, { wrapExpression: !!e }), meta: s };
}, Ct2, J2 = true, dh = function(t) {
  J2 = !!t;
}, mh = (t) => Ct2 = t, Mn = (t, e) => t.spanEquals(e), yh, wh, gh, bh, _h, pt2 = (t) => new f2(() => [], t), q2, R, Sh, Ah, Th, Ch, xh, Bh, Oh, zh, Mh, Ph, Eh, jh, Jh, $h, Nh, Lh, Rh, Wh, Fh, Ih, Vh, Hh, Dh, Gh, Qh, Uh, Xh, Kh, Yh, Zh, td, ed, nd, sd, rd, od, cd, id, ud, ad, ld, pd, fd, hd, dd, md, yd, wd, gd, bd, _d, vd, kd, qd, Sd, Ad, Td, Cd, xd, Bd, Od, zd, Md, Pd, Ed, jd, Ln, Jd, $d, Nd, Ld, Rd, Wd, Fd, Id, Vd, Hd, Dd, Gd, Qd, Ud, Rn, Xd, Kd, Yd, Zd, tm, em, nm, sm, rm, om, cm, im, um, Wn, am, lm, jt2 = function(t, e, n = false) {
  return t = m(t), Z2(..._t2(0, t.sub(1)).map((s) => n ? e.late(m(s).div(t)) : e.early(m(s).div(t))));
}, pm, fm, hm, dm, Jt2 = function(t, e, n, s = false, r = false) {
  const o = Array(t - 1).fill(false);
  o.unshift(true);
  const i = jt2(t, Q2(...o), !s);
  return r || (n = n.repeatCycles(t)), n.when(i, e);
}, mm, ym, wm, gm, bm, _m, vm, km, qm, Sm, Am, Tm, Cm, xm, Bm, Om, zm, Mm, Pm, Vn, Gn, Qn, Un, Em, Xn, Kn, Yn = (t, e) => e.shrinklist(t), Zn, jm, ts = function(t, ...e) {
  return t.tour(...e);
}, es = function(...t) {
  t = t.filter((s) => s.hasSteps);
  const e = Z2(...t.map((s) => s._slow(s._steps))), n = Y2(...t.map((s) => s._steps));
  return e._fast(n).setSteps(n);
}, Jm, ns, $m, Nm, Lm, Rm, Wm, Fm, Im, Vm, Hm, Dm, Gm, Qm, Um, Xm, Km, he2 = function(t, e, n = 0.5) {
  return e.speed(1 / t * n).unit("c").slow(t);
}, ss, Ym, Zm, ty, ey, ny, sy, ry = (t) => C2(1).withValue(() => d(t())).innerJoin(), te2 = (t) => t < 0.5 ? 1 : 1 - (t - 0.5) / 0.5, rs = (t, e, n) => {
  e = d(e), t = d(t), n = d(n);
  let s = e.fmap((o) => ({ gain: te2(o) })), r = e.fmap((o) => ({ gain: te2(1 - o) }));
  return z(t.mul(s), n.mul(r));
}, os = (t) => (e, n, s) => {
  e = m(e).mod(n), n = m(n);
  const r = e.div(n), o = e.add(1).div(n);
  return t(s.fmap((i) => C2(i)._compress(r, o)));
}, oy, de2 = (t, e, n) => {
  n = m(n);
  const s = m(1).div(t.length), r = (a) => {
    const u = [];
    for (const [p, h] of a.entries())
      h && u.push([m(p).div(a.length), h]);
    return u;
  }, o = Pt2(([a, u], [p, h]) => {
    const y = n.mul(p - a).add(a), g = y.add(s);
    return new B2(y, g);
  }, r(t), r(e));
  function i(a) {
    const u = a.span.begin.sam(), p = a.span.cycleArc(), h = [];
    for (const y of o) {
      const g = y.intersection(p);
      g !== undefined && h.push(new S2(y.withTime((v) => v.add(u)), g.withTime((v) => v.add(u)), true));
    }
    return h;
  }
  return new f2(i).splitQueries();
}, cy = (t, e, n) => (t = d(t), e = d(e), n = d(n), t.innerBind((s) => e.innerBind((r) => n.innerBind((o) => de2(s, r, o))))), U2 = function(t) {
  const e = function(n, s) {
    const r = d(n).fmap((o) => Array.isArray(o) ? [...o, t] : [o, 1, t]);
    return s ? s.distort(r) : C2({}).distort(r);
  };
  return f2.prototype[t] = function(n) {
    return e(n, this);
  }, e;
}, iy, uy, ay, ly, py, fy, hy, dy, me2 = (t) => {
  let n = C2(w2((...s) => s, null, t.length));
  for (const s of t)
    n = n.appBoth(d(s));
  return n;
}, vt2 = (t) => Array.isArray(t) ? me2(t) : d(t), my = (t) => vt2(t).as("partials"), yy = (t) => vt2(t).as("phases"), cs = (t) => {
  let n = C2(w2((...s) => s, null, t.length));
  for (const s of t)
    n = n.appLeft(s);
  return n;
}, wy = (...t) => C2({}).worklet(...t), at2, us, as, ls, ps, fs, hs, ds, ms, ys, ws, gs, bs, _s, vs, ks, qs, Ss, As, Ts, Cs, xs, Bs, Os, zs, Ms, Ps, Es, js, Js, $s, Ns, Ls, Rs, Ws, Fs, Is, Vs, Hs, Ds, Gs, Qs, Us, Xs, Ks, Ys, Zs, tr, er, nr, sr, rr, or, cr, ir, ur, ar, lr, pr, fr, hr, dr, mr, yr, wr, gr, br, _r, vr, kr, qr, Sr, Ar, Tr, Cr, xr, Br, Or, zr, Mr, Pr, Er, jr, Jr, $r, Nr, Lr, Rr, Wr, Fr, Ir, Vr, Hr, Dr, Gr, Qr, Ur, Xr, Kr, Yr, Zr, to, eo, no, so, ro, oo, co, io, uo, ao, lo, po, fo, ho, mo, yo, wo, go, bo, _o, vo, ko, qo, So, Ao, To, Co, xo, Bo, Oo, zo, Mo, Po, Eo, jo, Jo, $o, No, Lo, Ro, Wo, Fo, Io, Vo, Ho, Do, Go, Qo, Uo, Xo, Ko, Yo, Zo, tc, ec, nc, sc, rc, oc, cc, ic, uc, ac, lc, pc, fc, hc, dc, mc, yc, wc, gc, bc, _c, vc, kc, qc, Sc, Ac, Tc, Cc, xc, Bc, Oc, zc, Mc, Pc, Ec, jc, Jc, $c, Nc, Lc, Rc, Wc, Fc, Ic, Vc, Hc, Dc, Gc, Qc, Uc, Xc, Kc, Yc, Zc, ti2, ei2, ni2, si2, ri2, oi2, ci2, ii2, ui2, ai2, li2, pi2, fi2, hi2, di2, mi2, yi2, wi2, gi2, bi2, _i2, vi2, ki2, qi2, Si2, Ai2, Ti2, Ci2, xi2, Bi2, Oi2, zi2, Mi2, Pi2, Ei2, ji2, Ji2, $i2, Ni2, Li2, Ri2, Wi2, Fi2, Ii2, Vi2, Hi2, Di2, Gi2, Qi2, Ui2, Xi2, Ki2, Yi2, Zi2, tu, eu, nu, su, ru, ou, cu, iu, uu, au, lu, pu, fu, hu, du, mu, yu, wu, gu, bu, _u, vu, ku, qu, Su, Au, Tu, Cu, xu, Bu, Ou, zu, Mu, Pu, Eu, ju, Ju, $u, Nu, Lu, Ru, Wu, Fu, Iu, Vu, Hu, Du, Gu, Qu, Uu, Xu, Ku, Yu, Zu, ta, ea, na, sa, ra, oa, ca, ia, ua, aa, la, pa, fa, ha, da, ma, ya, wa, ga, ba, _a, va, ka, qa, Sa, Aa, Ta, Ca, xa, Ba, Oa, za, Ma, Pa, Ea, ja, Ja, $a, Na, La, Ra, Wa, Fa, Ia, Va, Ha, Da, Ga, Qa, Ua, Xa, Ka, Ya, Za, tl, el, nl, sl, rl, ol, cl, il, ul, al, ll, pl, fl, hl, dl, ml, yl, wl, gl, bl, _l, vl, kl, ql, ye2, Sl, Al, Tl, Cl, xl, Bl, Ol, zl, Ml, Pl, El, jl, Jl, $l, Nl, Ll, Rl, Wl, Fl, Il, Vl, Hl, Dl, Gl, Ql, Ul, Xl, Kl, Yl, Zl, tp, ep, np, sp, rp, op, cp, ip, up, ap, lp, pp, fp, hp, dp, mp, yp, wp, gp, bp, _p, vp, kp, qp, Sp, Ap, Tp, Cp = (...t) => t.reduce((e, n) => Object.assign(e, { [n]: Nt2(n) }), {}), xp, Bp, Op, zp, Mp, Pp, Ep, jp, Jp, $p, Np, Lp, Rp, Wp, Fp, Ip, Vp, Hp, Dp, Gp, Qp, Up, Xp, yt2 = (t) => at2.has(t) ? at2.get(t) : t, Kp, Yp, Bt2, Zp = (t, e, ...n) => {
  const s = Bt2.get(t) ?? /* @__PURE__ */ new Map, r = /* @__PURE__ */ new Set([e, ...n]);
  for (const o of r)
    s.set(String(o).toLowerCase(), e);
  Bt2.set(t, s);
}, Lt2 = (t, e = []) => {
  for (const [n, ...s] of e)
    Zp(t, n, ...s);
}, tf = (t, e) => {
  const n = Bt2.get(t);
  return n ? n.get(String(e).toLowerCase()) ?? e : e;
}, ef = (t) => C2({}).lfo(t), nf = (t) => C2({}).env(t), sf = (t) => C2({}).bmod(t), rf, of, cf, uf, af, gy, lf = function(t, e) {
  const [n, s] = t, [r, o] = e, [i, a] = ue2(s, r);
  return [
    [s, n - s],
    [Pt2((u, p) => u.concat(p), i, o), a]
  ];
}, pf = function(t, e) {
  const [n, s] = t, [r, o] = e, [i, a] = ue2(n, o);
  return [
    [n, s - n],
    [Pt2((p, h) => p.concat(h), r, i), a]
  ];
}, we2 = function(t, e) {
  const [n, s] = t;
  return Math.min(n, s) <= 1 ? [t, e] : we2(...n > s ? lf(t, e) : pf(t, e));
}, ge2 = function(t, e) {
  const n = t < 0, s = Math.abs(t), r = e - s, o = Array(s).fill([1]), i = Array(r).fill([0]), a = we2([s, r], [o, i]), u = G(a[1][0]).concat(G(a[1][1]));
  return n ? u.map((p) => 1 - p) : u;
}, kt2 = function(t, e, n) {
  const s = ge2(t, e);
  return n ? rn(s, -n) : s;
}, by, _y, vy, ky, be2 = function(t, e, n, s) {
  if (t < 1)
    return q2;
  const o = kt2(t, e, 0).join("").split("1").slice(1).map((i) => [i.length + 1, true]);
  return s.struct(ns(...o)).late(m(n).div(e));
}, qy, Sy, Ay, Ty, ct2, df = function() {
  mf();
}, mf = function() {
  ct2 = {};
}, Cy, F2 = function(t, e, n = true) {
  const s = Array.isArray(t), r = Object.keys(t).length;
  return t = bn(t, d), r === 0 ? q2 : e.fmap((o) => {
    let i = o;
    return s && (i = n ? Math.round(i) % r : an(Math.round(i), 0, t.length - 1)), t[i];
  });
}, yf = function(t, e) {
  return Array.isArray(e) && ([e, t] = [t, e]), wf(t, e);
}, wf, gf, xy, By, Oy, zy, My, Py, Ey, jy, Jy, $y, Ny, Ly, Ry = (t, e) => (e = e.map(d), e.length == 0 ? q2 : t.fmap((n) => {
  const s = bt2(Math.round(n), e.length);
  return e[s];
}).squeezeJoin()), Ot2, _e2, ve2, ke2, qe2, Sf = ({ getTime: t, defaultOutput: e }) => async (n, s, r, o, i) => {
  try {
    (!n.context.onTrigger || !n.context.dominantTrigger) && await e(n, s, r, o, i), n.context.onTrigger && await n.context.onTrigger(n, t(), o, i);
  } catch (a) {
    zt2(a, "getTrigger");
  }
}, j2 = (t) => {
  const e = (n) => [new S2(undefined, n.span, t(n.span.begin, n.controls))];
  return new f2(e);
}, qt2, Se2, Rt2, Ae2, Te2, Af, Qy, Uy, Tf, Xy, Ky, Yy, Zy, tw, ew, Wt2 = 0, Ft2 = 0, nw, sw, rw, ow, Cf = (t) => (t |= 0, t ^= t >>> 16, t = Math.imul(t, 2246822507), t ^= t >>> 13, t = Math.imul(t, 3266489909), t ^= t >>> 16, t >>> 0), xf = (t) => Math.floor(t * 536870912), Bf = (t, e = 0, n = 0) => {
  const s = t >>> 0 >>> 0, r = Math.floor(t / 4294967296) >>> 0;
  let o = s ^ Math.imul(r ^ 2246822507, 3266489909);
  return o ^= Math.imul(e ^ 2135587861, 2654435769), o ^= Math.imul(n ^ 374761393, 668265261), o >>> 0;
}, ne2 = (t, e = 0, n = 0) => Cf(Bf(t, e, n)) / 4294967296, Of = (t, e, n = 0) => {
  const s = xf(t);
  if (e === 1)
    return ne2(s, 0, n);
  const r = new Array(e);
  for (let o = 0;o < e; o++)
    r[o] = ne2(s, o, n);
  return r;
}, Ce2 = (t) => {
  const e = t << 13 ^ t, n = e >> 17 ^ e;
  return n << 5 ^ n;
}, zf = (t) => t - Math.trunc(t), Mf = (t) => Ce2(Math.trunc(zf(t / 300) * 536870912)), se = (t) => t % 536870912 / 536870912, Pf = (t, e) => {
  if (e === 1)
    return Math.abs(se(t));
  const n = [];
  for (let s = 0;s < e; s++)
    n.push(se(t)), t = Ce2(t);
  return n;
}, Ef = (t, e) => Pf(Mf(t), e), xe2 = "legacy", K2 = (t, e = 1, n = 0) => xe2 === "legacy" ? Ef(t + n, e) : Of(t, e, n), cw = (t = "legacy") => xe2 = t, jf = (t) => qt2.range(0, t).round().segment(t), iw = (t) => {
  const e = d(t).log2(0).floor().add(1);
  return Jf(t, e);
}, Jf = (t, e = 16) => {
  e = d(e);
  const n = jf(e).mul(-1).add(e.sub(1));
  return d(t).segment(e).brshift(n).band(C2(1));
}, uw = (t) => {
  const e = d(t).log2(0).floor().add(1);
  return $f(t, e);
}, $f = (t, e = 16) => d(t).withValue((n) => (s) => {
  const r = [];
  for (let o = s - 1;o >= 0; o--)
    r.push(n >> o & 1);
  return r;
}).appLeft(d(e)), aw = (t) => j2((e) => (n) => K2(e, n).map(Math.abs)).appLeft(d(t)), Nf = (t) => j2((e, n) => {
  const r = K2(e.floor().add(0.5), t, n.randSeed).map((i, a) => [i, a]).sort((i, a) => (i[0] > a[0]) - (i[0] < a[0])).map((i) => i[1]), o = e.cyclePos().mul(t).floor() % t;
  return r[o];
})._segment(t), Be2 = (t, e, n) => {
  const s = [...Array(e).keys()].map((r) => n.zoom(m(r).div(e), m(r + 1).div(e)));
  return t.fmap((r) => s[r].repeatCycles(e)._fast(e)).innerJoin();
}, lw, pw, Lf = (t, e) => new f2((n) => {
  let { randSeed: s, ...r } = n.controls;
  return s = t(s), e.query(n.setControls({ ...r, randSeed: s }));
}, e._steps), fw, W2, hw, Oe2 = (t) => W2.fmap((e) => e < t), dw = (t) => d(t).fmap(Oe2).innerJoin(), mw, ze2 = (t) => W2.fmap((e) => Math.trunc(e * t)), yw = (t) => d(t).fmap(ze2).innerJoin(), Me2 = (t, e) => (e = e.map(d), e.length == 0 ? q2 : t.range(0, e.length).fmap((n) => {
  const s = Math.min(Math.max(Math.floor(n), 0), e.length - 1);
  return e[s];
})), It2 = (t, e) => Me2(t, e).outerJoin(), Pe2 = (t, e) => Me2(t, e).innerJoin(), Rf = (...t) => It2(W2, t), ww = (...t) => Pe2(W2, t), gw, Wf = (...t) => Pe2(W2.segment(1), t), bw, Ee2 = function(t, ...e) {
  const n = e.map((a) => d(a[0])), s = [];
  let r = C2(0);
  for (const a of e)
    r = r.add(a[1]), s.push(r);
  const o = En(s), i = function(a) {
    const u = r.mul(a);
    return o.fmap((p) => (h) => n[p.findIndex((y) => y > h, p)]).appLeft(u);
  };
  return t.bind(i);
}, Ff = (...t) => Ee2(...t).outerJoin(), _w = (...t) => Ff(W2, ...t), If = (...t) => Ee2(W2.segment(1), ...t).innerJoin(), vw, kw, qw, Sw, Aw, Tw, Cw, xw, Bw, Ow, zw, Mw, Pw, Ew, jw, Jw, $w, Nw, Lw, Rw, Ww, Df, Fw, Iw, wt2, re2, Vw, Hw = function(t, e = {}) {
  const n = document.getElementById("code"), s = "background-image:url(" + t + ");background-size:contain;";
  n.style = s;
  const { className: r } = n, o = (u, p) => {
    ({
      style: () => n.style = s + ";" + p,
      className: () => n.className = p + " " + r
    })[u]();
  }, i = Object.entries(e).filter(([u, p]) => typeof p == "function");
  Object.entries(e).filter(([u, p]) => typeof p == "string").forEach(([u, p]) => o(u, p)), i.length;
}, Dw = () => {
  const t = document.getElementById("code");
  t && (t.style = "");
};
var init_dist2 = __esm(() => {
  init_fraction();
  init_dist();
  E2.key = oe2;
  Xe2 = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  Ke2 = { "#": 1, b: -1, s: 1, f: -1 };
  en2 = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
  ln = ["Do", "Reb", "Re", "Mib", "Mi", "Fa", "Solb", "Sol", "Lab", "La", "Sib", "Si"];
  pn = [
    "Sa",
    "Re",
    "Ga",
    "Ma",
    "Pa",
    "Dha",
    "Ni"
  ];
  fn = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Hb", "H"];
  hn = [
    "Ni",
    "Pab",
    "Pa",
    "Voub",
    "Vou",
    "Ga",
    "Dib",
    "Di",
    "Keb",
    "Ke",
    "Zob",
    "Zo"
  ];
  dn = [
    "I",
    "Ro",
    "Ha",
    "Ni",
    "Ho",
    "He",
    "To"
  ];
  mn = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
  kn = /* @__PURE__ */ new Map([
    ["control", "Control"],
    ["ctrl", "Control"],
    ["alt", "Alt"],
    ["shift", "Shift"],
    ["down", "ArrowDown"],
    ["up", "ArrowUp"],
    ["left", "ArrowLeft"],
    ["right", "ArrowRight"]
  ]);
  Fraction.prototype.sam = function() {
    return this.floor();
  };
  Fraction.prototype.nextSam = function() {
    return this.sam().add(1);
  };
  Fraction.prototype.wholeCycle = function() {
    return new B2(this.sam(), this.nextSam());
  };
  Fraction.prototype.cyclePos = function() {
    return this.sub(this.sam());
  };
  Fraction.prototype.lt = function(t) {
    return this.compare(t) < 0;
  };
  Fraction.prototype.gt = function(t) {
    return this.compare(t) > 0;
  };
  Fraction.prototype.lte = function(t) {
    return this.compare(t) <= 0;
  };
  Fraction.prototype.gte = function(t) {
    return this.compare(t) >= 0;
  };
  Fraction.prototype.eq = function(t) {
    return this.compare(t) == 0;
  };
  Fraction.prototype.ne = function(t) {
    return this.compare(t) != 0;
  };
  Fraction.prototype.max = function(t) {
    return this.gt(t) ? this : t;
  };
  Fraction.prototype.maximum = function(...t) {
    return t = t.map((e) => new Fraction(e)), t.reduce((e, n) => n.max(e), this);
  };
  Fraction.prototype.min = function(t) {
    return this.lt(t) ? this : t;
  };
  Fraction.prototype.mulmaybe = function(t) {
    return t !== undefined ? this.mul(t) : undefined;
  };
  Fraction.prototype.divmaybe = function(t) {
    return t !== undefined ? this.div(t) : undefined;
  };
  Fraction.prototype.addmaybe = function(t) {
    return t !== undefined ? this.add(t) : undefined;
  };
  Fraction.prototype.submaybe = function(t) {
    return t !== undefined ? this.sub(t) : undefined;
  };
  Fraction.prototype.show = function() {
    return this.s * this.n + "/" + this.d;
  };
  Fraction.prototype.or = function(t) {
    return this.eq(0) ? t : this;
  };
  m._original = Fraction;
  w2((t, e) => t * e);
  w2((t, e) => e.map(t));
  le = {};
  f2.prototype.collect = function() {
    return this.withHaps((t) => zn(Mn, t).map((e) => new S2(e[0].whole, e[0].part, e, {})));
  };
  yh = l("arpWith", (t, e) => e.collect().fmap((n) => d(t(n))).innerJoin().withHap((n) => new S2(n.whole, n.part, n.value.value, n.combineContext(n.value))));
  wh = l("arp", (t, e) => e.arpWith((n) => d(t).fmap((s) => n[s % n.length])), false);
  (function() {
    const t = {
      set: [(n, s) => s],
      keep: [(n) => n],
      keepif: [(n, s) => s ? n : undefined],
      add: [L2((n, s) => n + s)],
      sub: [L2((n, s) => n - s)],
      mul: [L2((n, s) => n * s)],
      div: [L2((n, s) => n / s)],
      mod: [L2(bt2)],
      pow: [L2(Math.pow)],
      log2: [L2(Math.log2)],
      band: [L2((n, s) => n & s)],
      bor: [L2((n, s) => n | s)],
      bxor: [L2((n, s) => n ^ s)],
      blshift: [L2((n, s) => n << s)],
      brshift: [L2((n, s) => n >> s)],
      lt: [(n, s) => n < s],
      gt: [(n, s) => n > s],
      lte: [(n, s) => n <= s],
      gte: [(n, s) => n >= s],
      eq: [(n, s) => n == s],
      eqt: [(n, s) => n === s],
      ne: [(n, s) => n != s],
      net: [(n, s) => n !== s],
      and: [(n, s) => n && s],
      or: [(n, s) => n || s],
      func: [(n, s) => s(n)]
    }, e = ["In", "Out", "Mix", "Squeeze", "SqueezeOut", "Reset", "Restart", "Poly"];
    for (const [n, [s, r]] of Object.entries(t)) {
      f2.prototype["_" + n] = function(o) {
        return this.fmap((i) => s(i, o));
      }, Object.defineProperty(f2.prototype, n, {
        get: function() {
          const o = this, i = (...a) => o[n].in(...a);
          for (const a of e)
            i[a.toLowerCase()] = function(...u) {
              var p = o;
              u = Q2(u), r && (p = r(p), u = r(u));
              var h;
              return n === "keepif" ? (h = p["_op" + a](u, (y) => (g) => s(y, g)), h = h.removeUndefineds()) : h = p["_op" + a](u, (y) => (g) => Pn(y, g, s)), h;
            };
          return i.squeezein = i.squeeze, i;
        }
      });
      for (const o of e)
        f2.prototype[o.toLowerCase()] = function(...i) {
          return this.set[o.toLowerCase()](i);
        };
    }
    f2.prototype.struct = function(...n) {
      return this.keepif.out(...n);
    }, f2.prototype.structAll = function(...n) {
      return this.keep.out(...n);
    }, f2.prototype.mask = function(...n) {
      return this.keepif.in(...n);
    }, f2.prototype.maskAll = function(...n) {
      return this.keep.in(...n);
    }, f2.prototype.reset = function(...n) {
      return this.keepif.reset(...n);
    }, f2.prototype.resetAll = function(...n) {
      return this.keep.reset(...n);
    }, f2.prototype.restart = function(...n) {
      return this.keepif.restart(...n);
    }, f2.prototype.restartAll = function(...n) {
      return this.keep.restart(...n);
    };
  })();
  gh = z;
  bh = z;
  _h = $t2;
  q2 = pt2(1);
  R = pt2(0);
  Sh = w2((t, e) => d(e).mask(t));
  Ah = w2((t, e) => d(e).struct(t));
  Th = w2((t, e) => d(e).superimpose(...t));
  Ch = w2((t, e) => d(e).withValue(t));
  xh = w2((t, e) => d(e).bind(t));
  Bh = w2((t, e) => d(e).innerBind(t));
  Oh = w2((t, e) => d(e).outerBind(t));
  zh = w2((t, e) => d(e).squeezeBind(t));
  Mh = w2((t, e) => d(e).stepBind(t));
  Ph = w2((t, e) => d(e).polyBind(t));
  Eh = w2((t, e) => d(e).set(t));
  jh = w2((t, e) => d(e).keep(t));
  Jh = w2((t, e) => d(e).keepif(t));
  $h = w2((t, e) => d(e).add(t));
  Nh = w2((t, e) => d(e).sub(t));
  Lh = w2((t, e) => d(e).mul(t));
  Rh = w2((t, e) => d(e).div(t));
  Wh = w2((t, e) => d(e).mod(t));
  Fh = w2((t, e) => d(e).pow(t));
  Ih = w2((t, e) => d(e).band(t));
  Vh = w2((t, e) => d(e).bor(t));
  Hh = w2((t, e) => d(e).bxor(t));
  Dh = w2((t, e) => d(e).blshift(t));
  Gh = w2((t, e) => d(e).brshift(t));
  Qh = w2((t, e) => d(e).lt(t));
  Uh = w2((t, e) => d(e).gt(t));
  Xh = w2((t, e) => d(e).lte(t));
  Kh = w2((t, e) => d(e).gte(t));
  Yh = w2((t, e) => d(e).eq(t));
  Zh = w2((t, e) => d(e).eqt(t));
  td = w2((t, e) => d(e).ne(t));
  ed = w2((t, e) => d(e).net(t));
  nd = w2((t, e) => d(e).and(t));
  sd = w2((t, e) => d(e).or(t));
  rd = w2((t, e) => d(e).func(t));
  od = l("round", function(t) {
    return t.asNumber().fmap((e) => Math.round(e));
  });
  cd = l("floor", function(t) {
    return t.asNumber().fmap((e) => Math.floor(e));
  });
  id = l("ceil", function(t) {
    return t.asNumber().fmap((e) => Math.ceil(e));
  });
  ud = l("toBipolar", function(t) {
    return t.fmap((e) => e * 2 - 1);
  });
  ad = l("fromBipolar", function(t) {
    return t.fmap((e) => (e + 1) / 2);
  });
  ld = l("range", function(t, e, n) {
    return n.mul(e - t).add(t);
  });
  pd = l("rangex", function(t, e, n) {
    return n._range(Math.log(t), Math.log(e)).fmap(Math.exp);
  });
  fd = l("range2", function(t, e, n) {
    return n.fromBipolar()._range(t, e);
  });
  hd = l("ratio", (t) => t.fmap((e) => Array.isArray(e) ? e.slice(1).reduce((n, s) => n / s, e[0]) : e));
  dd = l("compress", function(t, e, n) {
    return t = m(t), e = m(e), t.gt(e) || t.gt(1) || e.gt(1) || t.lt(0) || e.lt(0) ? q2 : n._fastGap(m(1).div(e.sub(t)))._late(t);
  });
  ({ compressSpan: md, compressspan: yd } = l(["compressSpan", "compressspan"], function(t, e) {
    return e._compress(t.begin, t.end);
  }));
  ({ fastGap: wd, fastgap: gd } = l(["fastGap", "fastgap"], function(t, e) {
    const n = function(r) {
      const o = r.begin.sam(), i = r.begin.sub(o).mul(t).min(1), a = r.end.sub(o).mul(t).min(1);
      if (!(i >= 1))
        return new B2(o.add(i), o.add(a));
    }, s = function(r) {
      const o = r.part.begin, i = r.part.end, a = o.sam(), u = o.sub(a).div(t).min(1), p = i.sub(a).div(t).min(1), h = new B2(a.add(u), a.add(p)), y = r.whole ? new B2(h.begin.sub(o.sub(r.whole.begin).div(t)), h.end.add(r.whole.end.sub(i).div(t))) : undefined;
      return new S2(y, h, r.value, r.context);
    };
    return e.withQuerySpanMaybe(n).withHap(s).splitQueries();
  }));
  bd = l("focus", function(t, e, n) {
    return t = m(t), e = m(e), n._early(t.sam())._fast(m(1).div(e.sub(t)))._late(t);
  });
  ({ focusSpan: _d, focusspan: vd } = l(["focusSpan", "focusspan"], function(t, e) {
    return e._focus(t.begin, t.end);
  }));
  kd = l("ply", function(t, e) {
    const n = e.fmap((s) => C2(s)._fast(t)).squeezeJoin();
    return J2 && (n._steps = m(t).mulmaybe(e._steps)), n;
  });
  ({ fast: qd, density: Sd } = l(["fast", "density"], function(t, e) {
    return t === 0 ? q2 : (t = m(t), e.withQueryTime((s) => s.mul(t)).withHapTime((s) => s.div(t)).setSteps(e._steps));
  }, true, true));
  Ad = l("hurry", function(t, e) {
    return e._fast(t).mul(C2({ speed: t }));
  });
  ({ slow: Td, sparsity: Cd } = l(["slow", "sparsity"], function(t, e) {
    return t === 0 ? q2 : e._fast(m(1).div(t));
  }));
  xd = l("inside", function(t, e, n) {
    return e(n._slow(t))._fast(t);
  });
  Bd = l("outside", function(t, e, n) {
    return e(n._fast(t))._slow(t);
  });
  Od = l("lastOf", function(t, e, n) {
    const s = Array(t - 1).fill(n);
    return s.push(e(n)), fe2(...s);
  });
  ({ firstOf: zd, every: Md } = l(["firstOf", "every"], function(t, e, n) {
    const s = Array(t - 1).fill(n);
    return s.unshift(e(n)), fe2(...s);
  }));
  Pd = l("apply", function(t, e) {
    return t(e);
  });
  Ed = l("cpm", function(t, e) {
    return e._fast(t / 60 / 1);
  });
  jd = l("early", function(t, e) {
    return t = m(t), e.withQueryTime((n) => n.add(t)).withHapTime((n) => n.sub(t));
  }, true, true);
  Ln = l("late", function(t, e) {
    return t = m(t), e._early(m(0).sub(t));
  }, true, true);
  Jd = l("zoom", function(t, e, n) {
    if (e = m(e), t = m(t), t.gte(e))
      return R;
    const s = e.sub(t), r = J2 ? n._steps?.mulmaybe(s) : undefined;
    return n.withQuerySpan((o) => o.withCycle((i) => i.mul(s).add(t))).withHapSpan((o) => o.withCycle((i) => i.sub(t).div(s))).splitQueries().setSteps(r);
  });
  ({ zoomArc: $d, zoomarc: Nd } = l(["zoomArc", "zoomarc"], function(t, e) {
    return e.zoom(t.begin, t.end);
  }));
  Ld = l("bite", (t, e, n) => e.fmap((s) => (r) => {
    const o = m(s).div(r).mod(1), i = o.add(m(1).div(r));
    return n.zoom(o, i);
  }).appLeft(t).squeezeJoin(), false);
  Rd = l("linger", function(t, e) {
    return t == 0 ? q2 : t < 0 ? e._zoom(t.add(1), 1)._slow(t) : e._zoom(0, t)._slow(t);
  }, true, true);
  ({ segment: Wd, seg: Fd } = l(["segment", "seg"], function(t, e) {
    return e.struct(C2(true)._fast(t)).setSteps(t);
  }));
  Id = l("swingBy", (t, e, n) => n.inside(e, Ln(Nn(0, t / 2))));
  Vd = l("swing", (t, e) => e.swingBy(1 / 3, t));
  ({ invert: Hd, inv: Dd } = l(["invert", "inv"], function(t) {
    return t.fmap((e) => !e);
  }, true, true));
  Gd = l("when", function(t, e, n) {
    return t ? e(n) : n;
  });
  Qd = l("off", function(t, e, n) {
    return z(n, e(n.late(t)));
  });
  Ud = l("brak", function(t) {
    return t.when(Z2(false, true), (e) => N2(e, q2)._late(0.25));
  });
  Rn = l("rev", function(t) {
    const e = function(n) {
      const s = n.span, r = s.begin.sam(), o = s.begin.nextSam(), i = function(u) {
        const p = u.withTime((y) => r.add(o.sub(y))), h = p.begin;
        return p.begin = p.end, p.end = h, p;
      };
      return t.query(n.setSpan(i(s))).map((u) => u.withSpan(i));
    };
    return new f2(e).splitQueries();
  }, false, true);
  Xd = l("revv", function(t) {
    const e = (n) => new B2(m(0).sub(n.end), m(0).sub(n.begin));
    return t.withQuerySpan(e).withHapSpan(e);
  });
  Kd = l("pressBy", function(t, e) {
    return e.fmap((n) => C2(n).compress(t, 1)).squeezeJoin();
  });
  Yd = l("press", function(t) {
    return t._pressBy(0.5);
  });
  f2.prototype.hush = function() {
    return q2;
  };
  Zd = l("palindrome", function(t) {
    return t.lastOf(2, Rn);
  }, true, true);
  ({ juxBy: tm, juxby: em } = l(["juxBy", "juxby"], function(t, e, n) {
    t /= 2;
    const s = function(i, a, u) {
      return a in i ? i[a] : u;
    }, r = n.withValue((i) => Object.assign({}, i, { pan: s(i, "pan", 0.5) - t })), o = e(n.withValue((i) => Object.assign({}, i, { pan: s(i, "pan", 0.5) + t })));
    return z(r, o).setSteps(J2 ? Y2(r._steps, o._steps) : undefined);
  }));
  nm = l("jux", function(t, e) {
    return e._juxBy(1, t, e);
  });
  ({ echoWith: sm, echowith: rm, stutWith: om, stutwith: cm } = l(["echoWith", "echowith", "stutWith", "stutwith"], function(t, e, n, s) {
    return z(..._t2(0, t - 1).map((r) => n(s.late(m(e).mul(r)), r)));
  }));
  im = l("echo", function(t, e, n, s) {
    return s._echoWith(t, e, (r, o) => r.gain(Math.pow(n, o)));
  });
  um = l("stut", function(t, e, n, s) {
    return s._echoWith(t, n, (r, o) => r.gain(Math.pow(e, o)));
  });
  Wn = l("applyN", function(t, e, n) {
    let s = n;
    for (let r = 0;r < t; r++)
      s = e(s);
    return s;
  });
  am = l(["plyWith", "plywith"], function(t, e, n) {
    const s = n.fmap((r) => mt2(..._t2(0, t - 1).map((o) => Wn(o, e, r)))._fast(t)).squeezeJoin();
    return J2 && (s._steps = m(t).mulmaybe(n._steps)), s;
  });
  lm = l(["plyForEach", "plyforeach"], function(t, e, n) {
    const s = n.fmap((r) => mt2(mt2(C2(r), ..._t2(1, t - 1).map((o) => e(C2(r), o))))._fast(t)).squeezeJoin();
    return J2 && (s._steps = m(t).mulmaybe(n._steps)), s;
  });
  pm = l("iter", function(t, e) {
    return jt2(t, e, false);
  }, true, true);
  ({ iterBack: fm, iterback: hm } = l(["iterBack", "iterback"], function(t, e) {
    return jt2(t, e, true);
  }, true, true));
  ({ repeatCycles: dm } = l("repeatCycles", function(t, e) {
    return new f2(function(n) {
      const s = n.span.begin.sam(), r = s.div(t).sam(), o = s.sub(r);
      return n = n.withSpan((i) => i.withTime((a) => a.sub(o))), e.query(n).map((i) => i.withSpan((a) => a.withTime((u) => u.add(o))));
    }).splitQueries();
  }, true, true));
  ({ chunk: mm, slowchunk: ym, slowChunk: wm } = l(["chunk", "slowchunk", "slowChunk"], function(t, e, n) {
    return Jt2(t, e, n, false, false);
  }, true, true));
  ({ chunkBack: gm, chunkback: bm } = l(["chunkBack", "chunkback"], function(t, e, n) {
    return Jt2(t, e, n, true);
  }, true, true));
  ({ fastchunk: _m, fastChunk: vm } = l(["fastchunk", "fastChunk"], function(t, e, n) {
    return Jt2(t, e, n, false, true);
  }, true, true));
  ({ chunkinto: km, chunkInto: qm } = l(["chunkinto", "chunkInto"], function(t, e, n) {
    return n.into(N2(true, ...Array(t - 1).fill(false))._iterback(t), e);
  }));
  ({ chunkbackinto: Sm, chunkBackInto: Am } = l(["chunkbackinto", "chunkBackInto"], function(t, e, n) {
    return n.into(N2(true, ...Array(t - 1).fill(false))._iter(t)._early(1), e);
  }));
  Tm = l("bypass", function(t, e) {
    return t = !!parseInt(t), t ? q2 : e;
  }, true, true);
  ({ ribbon: Cm, rib: xm } = l(["ribbon", "rib"], (t, e, n) => n.early(t).restart(C2(1).slow(e))));
  Bm = l("hsla", (t, e, n, s, r) => r.color(`hsla(${t}turn,${e * 100}%,${n * 100}%,${s})`));
  Om = l("hsl", (t, e, n, s) => s.color(`hsl(${t}turn,${e * 100}%,${n * 100}%)`));
  f2.prototype.tag = function(t) {
    return this.withContext((e) => ({ ...e, tags: (e.tags || []).concat([t]) }));
  };
  zm = l("filter", (t, e) => e.withHaps((n) => n.filter(t)));
  Mm = l("filterWhen", (t, e) => e.filter((n) => t(n.whole.begin)));
  Pm = l("within", (t, e, n, s) => z(n(s.filterWhen((r) => r.cyclePos() >= t && r.cyclePos() <= e)), s.filterWhen((r) => r.cyclePos() < t || r.cyclePos() > e)));
  f2.prototype.stepJoin = function() {
    const t = this, e = $2(...Yt2(Zt2(t.queryArc(0, 1))))._steps, n = function(s) {
      const o = t.early(s.span.begin.sam()).query(s.setSpan(new B2(m(0), m(1))));
      return $2(...Yt2(Zt2(o))).query(s);
    };
    return new f2(n, e);
  };
  f2.prototype.stepBind = function(t) {
    return this.fmap(t).stepJoin();
  };
  Vn = l("pace", function(t, e) {
    return e._steps === undefined ? e : e._steps.eq(m(0)) ? R : e._fast(m(t).div(e._steps)).setSteps(t);
  });
  Gn = et2("take", function(t, e) {
    if (!e.hasSteps || e._steps.lte(0) || (t = m(t), t.eq(0)))
      return R;
    const n = t < 0;
    n && (t = t.abs());
    const s = t.div(e._steps);
    return s.lte(0) ? R : s.gte(1) ? e : n ? e.zoom(m(1).sub(s), 1) : e.zoom(0, s);
  });
  Qn = et2("drop", function(t, e) {
    return e.hasSteps ? (t = m(t), t.lt(0) ? e.take(e._steps.add(t)) : e.take(m(0).sub(e._steps.sub(t)))) : R;
  });
  Un = et2("extend", function(t, e) {
    return e.fast(t).expand(t);
  });
  Em = et2("replicate", function(t, e) {
    return e.repeatCycles(t).fast(t).expand(t);
  });
  Xn = et2("expand", function(t, e) {
    return e.withSteps((n) => n.mul(m(t)));
  });
  Kn = et2("contract", function(t, e) {
    return e.withSteps((n) => n.div(m(t)));
  });
  f2.prototype.shrinklist = function(t) {
    const e = this;
    if (!e.hasSteps)
      return [e];
    let [n, s] = Array.isArray(t) ? t : [t, e._steps];
    if (n = m(n), s === 0 || n === 0)
      return [e];
    const r = n > 0, o = [];
    if (r) {
      const i = m(1).div(e._steps).mul(n);
      for (let a = 0;a < s; ++a) {
        const u = i.mul(a);
        if (u.gt(1))
          break;
        o.push([u, 1]);
      }
    } else {
      n = m(0).sub(n);
      const i = m(1).div(e._steps).mul(n);
      for (let a = 0;a < s; ++a) {
        const u = m(1).sub(i.mul(a));
        if (u.lt(0))
          break;
        o.push([m(0), u]);
      }
    }
    return o.map((i) => e.zoom(...i));
  };
  Zn = l("shrink", function(t, e) {
    if (!e.hasSteps)
      return R;
    const n = e.shrinklist(t), s = $2(...n);
    return s._steps = n.reduce((r, o) => r.add(o._steps), m(0)), s;
  }, true, false, (t) => t.stepJoin());
  jm = l("grow", function(t, e) {
    if (!e.hasSteps)
      return R;
    const n = e.shrinklist(m(0).sub(t));
    n.reverse();
    const s = $2(...n);
    return s._steps = n.reduce((r, o) => r.add(o._steps), m(0)), s;
  }, true, false, (t) => t.stepJoin());
  f2.prototype.tour = function(...t) {
    return $2(...[].concat(...t.map((e, n) => [...t.slice(0, t.length - n), this, ...t.slice(t.length - n)]), this, ...t));
  };
  Jm = $2;
  ns = $2;
  $m = $2;
  Nm = Dn;
  Lm = $t2;
  f2.prototype.s_polymeter = f2.prototype.polymeter;
  Rm = Zn;
  f2.prototype.s_taper = f2.prototype.shrink;
  Wm = Yn;
  f2.prototype.s_taperlist = f2.prototype.shrinklist;
  Fm = Gn;
  f2.prototype.s_add = f2.prototype.take;
  Im = Qn;
  f2.prototype.s_sub = f2.prototype.drop;
  Vm = Xn;
  f2.prototype.s_expand = f2.prototype.expand;
  Hm = Un;
  f2.prototype.s_extend = f2.prototype.extend;
  Dm = Kn;
  f2.prototype.s_contract = f2.prototype.contract;
  Gm = ts;
  f2.prototype.s_tour = f2.prototype.tour;
  Qm = es;
  f2.prototype.s_zip = f2.prototype.zip;
  Um = Vn;
  f2.prototype.steps = f2.prototype.pace;
  Xm = l("chop", function(t, e) {
    const s = Array.from({ length: t }, (i, a) => a).map((i) => ({ begin: i / t, end: (i + 1) / t })), r = function(i, a) {
      if ("begin" in i && "end" in i && i.begin !== undefined && i.end !== undefined) {
        const u = i.end - i.begin;
        a = { begin: i.begin + a.begin * u, end: i.begin + a.end * u };
      }
      return Object.assign({}, i, a);
    }, o = function(i) {
      return Q2(s.map((a) => r(i, a)));
    };
    return e.squeezeBind(o).setSteps(J2 ? m(t).mulmaybe(e._steps) : undefined);
  });
  Km = l("striate", function(t, e) {
    const s = Array.from({ length: t }, (o, i) => i).map((o) => ({ begin: o / t, end: (o + 1) / t })), r = Z2(...s);
    return e.set(r)._fast(t).setSteps(J2 ? m(t).mulmaybe(e._steps) : undefined);
  });
  ss = l("slice", function(t, e, n) {
    return t.innerBind((s) => e.outerBind((r) => n.outerBind((o) => {
      o = o instanceof Object ? o : { s: o };
      const i = Array.isArray(s) ? s[r] : r / s, a = Array.isArray(s) ? s[r + 1] : (r + 1) / s;
      return C2({ begin: i, end: a, _slices: s, ...o });
    }))).setSteps(e._steps);
  }, false);
  f2.prototype.onTriggerTime = function(t) {
    return this.onTrigger((e, n, s, r) => {
      const o = r - n;
      window.setTimeout(() => {
        t(e);
      }, o * 1000);
    }, false);
  };
  Ym = l("splice", function(t, e, n) {
    const s = ss(t, e, n);
    return new f2((r) => {
      const o = r.controls._cps || 1;
      return s.query(r).map((a) => a.withValue((u) => ({
        speed: o / u._slices / a.whole.duration * (u.speed || 1),
        unit: "c",
        ...u
      })));
    }).setSteps(e._steps);
  }, false);
  ({ loopAt: Zm, loopat: ty } = l(["loopAt", "loopat"], function(t, e) {
    const n = e._steps ? e._steps.div(t) : undefined;
    return new f2((s) => he2(t, e, s.controls._cps).query(s), n);
  }));
  ey = l("fit", (t) => t.withHaps((e, n) => e.map((s) => s.withValue((r) => {
    const o = ("end" in r ? r.end : 1) - ("begin" in r ? r.begin : 0);
    return {
      ...r,
      speed: (n.controls._cps || 1) / s.whole.duration * o,
      unit: "c"
    };
  }))));
  ({ loopAtCps: ny, loopatcps: sy } = l(["loopAtCps", "loopatcps"], function(t, e, n) {
    return he2(t, n, e);
  }));
  f2.prototype.xfade = function(t, e) {
    return rs(this, t, e);
  };
  ({ beat: oy } = l(["beat"], os((t) => t.innerJoin())));
  iy = U2("soft");
  uy = U2("hard");
  ay = U2("cubic");
  ly = U2("diode");
  py = U2("asym");
  fy = U2("fold");
  hy = U2("sinefold");
  dy = U2("chebyshev");
  f2.prototype.partials = function(t) {
    return this.withValue((e) => (n) => ({ ...e, partials: n })).appLeft(vt2(t));
  };
  f2.prototype.phases = function(t) {
    return this.withValue((e) => (n) => ({ ...e, phases: n })).appLeft(vt2(t));
  };
  f2.prototype.FX = function(...t) {
    return t = t.map(d), this.withValue((e) => (n) => {
      const s = e.FX ?? [];
      return { ...e, FX: s.concat(n) };
    }).appLeft(me2(t));
  };
  f2.prototype.worklet = function(t, ...e) {
    return e = e.map(d), this.outerBind((n) => cs(e).withValue((s) => {
      const r = n.workletInputs ?? [];
      return { ...n, workletSrc: t, workletInputs: r.concat(s) };
    }));
  };
  at2 = /* @__PURE__ */ new Map;
  ({ s: us, sound: as } = c2(["s", "n", "gain"], "sound"));
  ({ wt: ls, wavetablePosition: ps } = c2("wt", "wavetablePosition"));
  ({ wtenv: fs } = c2("wtenv"));
  ({ wtattack: hs, wtatt: ds } = c2("wtattack", "wtatt"));
  ({ wtdecay: ms, wtdec: ys } = c2("wtdecay", "wtdec"));
  ({ wtsustain: ws, wtsus: gs } = c2("wtsustain", "wtsus"));
  ({ wtrelease: bs, wtrel: _s } = c2("wtrelease", "wtrel"));
  ({ wtrate: vs } = c2("wtrate"));
  ({ wtsync: ks } = c2("wtsync"));
  ({ wtdepth: qs } = c2("wtdepth"));
  ({ wtshape: Ss } = c2("wtshape"));
  ({ wtdc: As } = c2("wtdc"));
  ({ wtskew: Ts } = c2("wtskew"));
  ({ warp: Cs, wavetableWarp: xs } = c2("warp", "wavetableWarp"));
  ({ warpattack: Bs, warpatt: Os } = c2("warpattack", "warpatt"));
  ({ warpdecay: zs, warpdec: Ms } = c2("warpdecay", "warpdec"));
  ({ warpsustain: Ps, warpsus: Es } = c2("warpsustain", "warpsus"));
  ({ warprelease: js, warprel: Js } = c2("warprelease", "warprel"));
  ({ warprate: $s } = c2("warprate"));
  ({ warpdepth: Ns } = c2("warpdepth"));
  ({ warpshape: Ls } = c2("warpshape"));
  ({ warpdc: Rs } = c2("warpdc"));
  ({ warpskew: Ws } = c2("warpskew"));
  ({ warpmode: Fs, wavetableWarpMode: Is } = c2("warpmode", "wavetableWarpMode"));
  ({ wtphaserand: Vs, wavetablePhaseRand: Hs } = c2("wtphaserand", "wavetablePhaseRand"));
  ({ warpenv: Ds } = c2("warpenv"));
  ({ warpsync: Gs } = c2("warpsync"));
  ({ source: Qs, src: Us } = c2("source", "src"));
  ({ n: Xs } = c2("n"));
  ({ note: Ks } = c2(["note", "n"]));
  ({ accelerate: Ys } = c2("accelerate"));
  ({ velocity: Zs, vel: tr } = c2("velocity", "vel"));
  ({ gain: er } = c2("gain"));
  ({ postgain: nr } = c2("postgain"));
  ({ amp: sr } = c2("amp"));
  ({ attack: rr, att: or } = c2("attack", "att"));
  ({ fmh: cr, fmh1: ir, fmh2: ur, fmh3: ar, fmh4: lr, fmh5: pr, fmh6: fr, fmh7: hr, fmh8: dr } = V2(["fmh", "fmi"], 8, "fmh"));
  ({ fmi: mr, fmi1: yr, fmi2: wr, fmi3: gr, fmi4: br, fmi5: _r, fmi6: vr, fmi7: kr, fmi8: qr, fm: Sr, fm1: Ar, fm2: Tr, fm3: Cr, fm4: xr, fm5: Br, fm6: Or, fm7: zr, fm8: Mr } = V2(["fmi", "fmh"], 8, "fm"));
  ({ fmenv: Pr, fmenv1: Er, fmenv2: jr, fmenv3: Jr, fmenv4: $r, fmenv5: Nr, fmenv6: Lr, fmenv7: Rr, fmenv8: Wr } = V2("fmenv", 8));
  ({
    fmattack: Fr,
    fmattack1: Ir,
    fmattack2: Vr,
    fmattack3: Hr,
    fmattack4: Dr,
    fmattack5: Gr,
    fmattack6: Qr,
    fmattack7: Ur,
    fmattack8: Xr,
    fmatt: Kr,
    fmatt1: Yr,
    fmatt2: Zr,
    fmatt3: to,
    fmatt4: eo,
    fmatt5: no,
    fmatt6: so,
    fmatt7: ro,
    fmatt8: oo
  } = V2("fmattack", 8, "fmatt"));
  ({ fmwave: co, fmwave1: io, fmwave2: uo, fmwave3: ao, fmwave4: lo, fmwave5: po, fmwave6: fo, fmwave7: ho, fmwave8: mo } = V2("fmwave", 8));
  ({
    fmdecay: yo,
    fmdecay1: wo,
    fmdecay2: go,
    fmdecay3: bo,
    fmdecay4: _o,
    fmdecay5: vo,
    fmdecay6: ko,
    fmdecay7: qo,
    fmdecay8: So,
    fmdec: Ao,
    fmdec1: To,
    fmdec2: Co,
    fmdec3: xo,
    fmdec4: Bo,
    fmdec5: Oo,
    fmdec6: zo,
    fmdec7: Mo,
    fmdec8: Po
  } = V2("fmdecay", 8, "fmdec"));
  ({
    fmsustain: Eo,
    fmsustain1: jo,
    fmsustain2: Jo,
    fmsustain3: $o,
    fmsustain4: No,
    fmsustain5: Lo,
    fmsustain6: Ro,
    fmsustain7: Wo,
    fmsustain8: Fo,
    fmsus: Io,
    fmsus1: Vo,
    fmsus2: Ho,
    fmsus3: Do,
    fmsus4: Go,
    fmsus5: Qo,
    fmsus6: Uo,
    fmsus7: Xo,
    fmsus8: Ko
  } = V2("fmsustain", 8, "fmsus"));
  ({
    fmrelease: Yo,
    fmrelease1: Zo,
    fmrelease2: tc,
    fmrelease3: ec,
    fmrelease4: nc,
    fmrelease5: sc,
    fmrelease6: rc,
    fmrelease7: oc,
    fmrelease8: cc,
    fmrel: ic,
    fmrel1: uc,
    fmrel2: ac,
    fmrel3: lc,
    fmrel4: pc,
    fmrel5: fc,
    fmrel6: hc,
    fmrel7: dc,
    fmrel8: mc
  } = V2("fmrelease", 8, "fmrel"));
  for (let t = 0;t <= 8; t++)
    for (let e = 0;e <= 8; e++)
      c2(`fmi${t}${e}`, `fm${t}${e}`);
  ({ bank: yc } = c2("bank"));
  ({ chorus: wc } = c2("chorus"));
  ({ analyze: gc } = c2("analyze"));
  ({ fft: bc } = c2("fft"));
  ({ decay: _c, dec: vc } = c2("decay", "dec"));
  ({ sustain: kc, sus: qc } = c2("sustain", "sus"));
  ({ release: Sc, rel: Ac } = c2("release", "rel"));
  ({ hold: Tc } = c2("hold"));
  ({ bandf: Cc, bpf: xc, bp: Bc } = c2(["bandf", "bandq", "bpenv"], "bpf", "bp"));
  ({ bandq: Oc, bpq: zc } = c2("bandq", "bpq"));
  ({ begin: Mc } = c2("begin"));
  ({ end: Pc } = c2("end"));
  ({ loop: Ec } = c2("loop"));
  ({ loopBegin: jc, loopb: Jc } = c2("loopBegin", "loopb"));
  ({ loopEnd: $c, loope: Nc } = c2("loopEnd", "loope"));
  ({ crush: Lc } = c2("crush"));
  ({ coarse: Rc } = c2("coarse"));
  ({ tremolo: Wc, trem: Fc } = c2(["tremolo", "tremolodepth", "tremoloskew", "tremolophase"], "trem"));
  ({ tremolosync: Ic } = c2(["tremolosync", "tremolodepth", "tremoloskew", "tremolophase"], "tremsync"));
  ({ tremolodepth: Vc } = c2("tremolodepth", "tremdepth"));
  ({ tremoloskew: Hc } = c2("tremoloskew", "tremskew"));
  ({ tremolophase: Dc } = c2("tremolophase", "tremphase"));
  ({ tremoloshape: Gc } = c2("tremoloshape", "tremshape"));
  ({ drive: Qc } = c2("drive"));
  ({ duck: Uc } = c2("duckorbit", "duck"));
  ({ duckdepth: Xc } = c2("duckdepth"));
  ({ duckonset: Kc } = c2("duckonset", "duckons"));
  ({ duckattack: Yc } = c2("duckattack", "duckatt"));
  ({ byteBeatExpression: Zc, bbexpr: ti2 } = c2("byteBeatExpression", "bbexpr"));
  ({ byteBeatStartTime: ei2, bbst: ni2 } = c2("byteBeatStartTime", "bbst"));
  ({ channels: si2, ch: ri2 } = c2("channels", "ch"));
  ({ pw: oi2 } = c2(["pw", "pwrate", "pwsweep"]));
  ({ pwrate: ci2 } = c2("pwrate"));
  ({ pwsweep: ii2 } = c2("pwsweep"));
  ({ phaserrate: ui2, ph: ai2, phaser: li2 } = c2(["phaserrate", "phaserdepth", "phasercenter", "phasersweep"], "ph", "phaser"));
  ({ phasersweep: pi2, phs: fi2 } = c2("phasersweep", "phs"));
  ({ phasercenter: hi2, phc: di2 } = c2("phasercenter", "phc"));
  ({ phaserdepth: mi2, phd: yi2, phasdp: wi2 } = c2("phaserdepth", "phd", "phasdp"));
  ({ channel: gi2 } = c2("channel"));
  ({ cut: bi2 } = c2("cut"));
  ({ cutoff: _i2, ctf: vi2, lpf: ki2, lp: qi2 } = c2(["cutoff", "resonance", "lpenv"], "ctf", "lpf", "lp"));
  ({ lpenv: Si2, lpe: Ai2 } = c2("lpenv", "lpe"));
  ({ hpenv: Ti2, hpe: Ci2 } = c2("hpenv", "hpe"));
  ({ bpenv: xi2, bpe: Bi2 } = c2("bpenv", "bpe"));
  ({ lpattack: Oi2, lpa: zi2 } = c2("lpattack", "lpa"));
  ({ hpattack: Mi2, hpa: Pi2 } = c2("hpattack", "hpa"));
  ({ bpattack: Ei2, bpa: ji2 } = c2("bpattack", "bpa"));
  ({ lpdecay: Ji2, lpd: $i2 } = c2("lpdecay", "lpd"));
  ({ hpdecay: Ni2, hpd: Li2 } = c2("hpdecay", "hpd"));
  ({ bpdecay: Ri2, bpd: Wi2 } = c2("bpdecay", "bpd"));
  ({ lpsustain: Fi2, lps: Ii2 } = c2("lpsustain", "lps"));
  ({ hpsustain: Vi2, hps: Hi2 } = c2("hpsustain", "hps"));
  ({ bpsustain: Di2, bps: Gi2 } = c2("bpsustain", "bps"));
  ({ lprelease: Qi2, lpr: Ui2 } = c2("lprelease", "lpr"));
  ({ hprelease: Xi2, hpr: Ki2 } = c2("hprelease", "hpr"));
  ({ bprelease: Yi2, bpr: Zi2 } = c2("bprelease", "bpr"));
  ({ ftype: tu } = c2("ftype"));
  ({ fanchor: eu } = c2("fanchor"));
  ({ lprate: nu } = c2("lprate"));
  ({ lpsync: su } = c2("lpsync"));
  ({ lpdepth: ru } = c2("lpdepth"));
  ({ lpdepthfrequency: ou, lpdepthfreq: cu } = c2("lpdepthfrequency", "lpdepthfreq"));
  ({ lpshape: iu } = c2("lpshape"));
  ({ lpdc: uu } = c2("lpdc"));
  ({ lpskew: au } = c2("lpskew"));
  ({ bprate: lu } = c2("bprate"));
  ({ bpsync: pu } = c2("bpsync"));
  ({ bpdepth: fu } = c2("bpdepth"));
  ({ bpdepthfrequency: hu, bpdepthfreq: du } = c2("bpdepthfrequency", "bpdepthfreq"));
  ({ bpshape: mu } = c2("bpshape"));
  ({ bpdc: yu } = c2("bpdc"));
  ({ bpskew: wu } = c2("bpskew"));
  ({ hprate: gu } = c2("hprate"));
  ({ hpsync: bu } = c2("hpsync"));
  ({ hpdepth: _u } = c2("hpdepth"));
  ({ hpdepthfrequency: vu, hpdepthfreq: ku } = c2("hpdepthfrequency", "hpdepthfreq"));
  ({ hpshape: qu } = c2("hpshape"));
  ({ hpdc: Su } = c2("hpdc"));
  ({ hpskew: Au } = c2("hpskew"));
  ({ vib: Tu, vibrato: Cu, v: xu } = c2(["vib", "vibmod"], "vibrato", "v"));
  ({ noise: Bu } = c2("noise"));
  ({ vibmod: Ou, vmod: zu } = c2(["vibmod", "vib"], "vmod"));
  ({ hcutoff: Mu, hpf: Pu, hp: Eu } = c2(["hcutoff", "hresonance", "hpenv"], "hpf", "hp"));
  ({ hresonance: ju, hpq: Ju } = c2("hresonance", "hpq"));
  ({ resonance: $u, lpq: Nu } = c2("resonance", "lpq"));
  ({ djf: Lu } = c2("djf"));
  ({ delay: Ru } = c2(["delay", "delaytime", "delayfeedback"]));
  ({ delayfeedback: Wu, delayfb: Fu, dfb: Iu } = c2("delayfeedback", "delayfb", "dfb"));
  ({ delayspeed: Vu } = c2("delayspeed"));
  ({ delaytime: Hu, delayt: Du, dt: Gu } = c2("delaytime", "delayt", "dt"));
  ({ delaysync: Qu } = c2("delaysync"));
  ({ lock: Uu } = c2("lock"));
  ({ detune: Xu, det: Ku } = c2("detune", "det"));
  ({ unison: Yu } = c2("unison"));
  ({ spread: Zu } = c2("spread"));
  ({ dry: ta } = c2("dry"));
  ({ fadeTime: ea, fadeOutTime: na } = c2("fadeTime", "fadeOutTime"));
  ({ fadeInTime: sa } = c2("fadeInTime"));
  ({ freq: ra } = c2("freq"));
  ({ pattack: oa, patt: ca } = c2("pattack", "patt"));
  ({ pdecay: ia, pdec: ua } = c2("pdecay", "pdec"));
  ({ psustain: aa, psus: la } = c2("psustain", "psus"));
  ({ prelease: pa, prel: fa } = c2("prelease", "prel"));
  ({ penv: ha } = c2("penv"));
  ({ pcurve: da } = c2("pcurve"));
  ({ panchor: ma } = c2("panchor"));
  ({ gate: ya, gat: wa } = c2("gate", "gat"));
  ({ leslie: ga } = c2("leslie"));
  ({ lrate: ba } = c2("lrate"));
  ({ lsize: _a } = c2("lsize"));
  ({ activeLabel: va } = c2("activeLabel"));
  ({ label: ka } = c2(["label", "activeLabel"]));
  ({ degree: qa } = c2("degree"));
  ({ mtranspose: Sa } = c2("mtranspose"));
  ({ ctranspose: Aa } = c2("ctranspose"));
  ({ harmonic: Ta } = c2("harmonic"));
  ({ stepsPerOctave: Ca } = c2("stepsPerOctave"));
  ({ octaveR: xa } = c2("octaveR"));
  ({ nudge: Ba } = c2("nudge"));
  ({ octave: Oa, oct: za } = c2("octave", "oct"));
  ({ orbit: Ma } = c2("orbit", "o"));
  ({ bus: Pa } = c2("bus"));
  ({ busgain: Ea, bgain: ja } = c2("busgain", "bgain"));
  ({ overgain: Ja } = c2("overgain"));
  ({ overshape: $a } = c2("overshape"));
  ({ pan: Na } = c2("pan"));
  ({ panspan: La } = c2("panspan"));
  ({ pansplay: Ra } = c2("pansplay"));
  ({ panwidth: Wa } = c2("panwidth"));
  ({ panorient: Fa } = c2("panorient"));
  ({ slide: Ia } = c2("slide"));
  ({ semitone: Va } = c2("semitone"));
  ({ voice: Ha } = c2("voice"));
  ({ chord: Da } = c2("chord"));
  ({ dictionary: Ga, dict: Qa } = c2("dictionary", "dict"));
  ({ anchor: Ua } = c2("anchor"));
  ({ offset: Xa } = c2("offset"));
  ({ octaves: Ka } = c2("octaves"));
  ({ mode: Ya } = c2(["mode", "anchor"]));
  ({ room: Za } = c2(["room", "size"]));
  ({ roomlp: tl, rlp: el } = c2("roomlp", "rlp"));
  ({ roomdim: nl, rdim: sl } = c2("roomdim", "rdim"));
  ({ roomfade: rl, rfade: ol } = c2("roomfade", "rfade"));
  ({ ir: cl, iresponse: il } = c2(["ir", "i"], "iresponse"));
  ({ irspeed: ul } = c2("irspeed"));
  ({ irbegin: al } = c2("irbegin"));
  ({ roomsize: ll, size: pl, sz: fl, rsize: hl } = c2("roomsize", "size", "sz", "rsize"));
  ({ shape: dl } = c2(["shape", "shapevol"]));
  ({ distort: ml, dist: yl } = c2(["distort", "distortvol", "distorttype"], "dist"));
  ({ distortvol: wl } = c2("distortvol", "distvol"));
  ({ distorttype: gl } = c2("distorttype", "disttype"));
  ({ compressor: bl } = c2([
    "compressor",
    "compressorRatio",
    "compressorKnee",
    "compressorAttack",
    "compressorRelease"
  ]));
  ({ compressorKnee: _l } = c2("compressorKnee"));
  ({ compressorRatio: vl } = c2("compressorRatio"));
  ({ compressorAttack: kl } = c2("compressorAttack"));
  ({ compressorRelease: ql } = c2("compressorRelease"));
  ({ speed: ye2 } = c2("speed"));
  ({ stretch: Sl } = c2("stretch"));
  ({ unit: Al } = c2("unit"));
  ({ squiz: Tl } = c2("squiz"));
  ({ vowel: Cl } = c2("vowel"));
  ({ waveloss: xl } = c2("waveloss"));
  ({ density: Bl } = c2("density"));
  ({ expression: Ol } = c2("expression"));
  ({ sustainpedal: zl } = c2("sustainpedal"));
  ({ fshift: Ml } = c2("fshift"));
  ({ fshiftnote: Pl } = c2("fshiftnote"));
  ({ fshiftphase: El } = c2("fshiftphase"));
  ({ triode: jl } = c2("triode"));
  ({ krush: Jl } = c2("krush"));
  ({ kcutoff: $l } = c2("kcutoff"));
  ({ octer: Nl } = c2("octer"));
  ({ octersub: Ll } = c2("octersub"));
  ({ octersubsub: Rl } = c2("octersubsub"));
  ({ ring: Wl } = c2("ring"));
  ({ ringf: Fl } = c2("ringf"));
  ({ ringdf: Il } = c2("ringdf"));
  ({ freeze: Vl } = c2("freeze"));
  ({ xsdelay: Hl } = c2("xsdelay"));
  ({ tsdelay: Dl } = c2("tsdelay"));
  ({ real: Gl } = c2("real"));
  ({ imag: Ql } = c2("imag"));
  ({ enhance: Ul } = c2("enhance"));
  ({ comb: Xl } = c2("comb"));
  ({ smear: Kl } = c2("smear"));
  ({ scram: Yl } = c2("scram"));
  ({ binshift: Zl } = c2("binshift"));
  ({ hbrick: tp } = c2("hbrick"));
  ({ lbrick: ep } = c2("lbrick"));
  ({ frameRate: np } = c2("frameRate"));
  ({ frames: sp } = c2("frames"));
  ({ hours: rp } = c2("hours"));
  ({ minutes: op } = c2("minutes"));
  ({ seconds: cp } = c2("seconds"));
  ({ songPtr: ip } = c2("songPtr"));
  ({ uid: up } = c2("uid"));
  ({ val: ap } = c2("val"));
  ({ cps: lp } = c2("cps"));
  ({ clip: pp, legato: fp } = c2("clip", "legato"));
  ({ duration: hp, dur: dp } = c2("duration", "dur"));
  ({ zrand: mp } = c2("zrand"));
  ({ curve: yp } = c2("curve"));
  ({ deltaSlide: wp } = c2("deltaSlide"));
  ({ pitchJump: gp } = c2("pitchJump"));
  ({ pitchJumpTime: bp } = c2("pitchJumpTime"));
  ({ znoise: _p } = c2("znoise"));
  ({ zmod: vp } = c2("zmod"));
  ({ zcrush: kp } = c2("zcrush"));
  ({ zdelay: qp } = c2("zdelay"));
  ({ zzfx: Sp } = c2("zzfx"));
  ({ color: Ap, colour: Tp } = c2(["color", "colour"]));
  xp = l("adsr", (t, e) => {
    t = Array.isArray(t) ? t : [t];
    const [n, s, r, o] = t;
    return e.set({ attack: n, decay: s, sustain: r, release: o });
  });
  Bp = l("ad", (t, e) => {
    t = Array.isArray(t) ? t : [t];
    const [n, s = n] = t;
    return e.attack(n).decay(s);
  });
  Op = l("ds", (t, e) => {
    t = Array.isArray(t) ? t : [t];
    const [n, s = 0] = t;
    return e.set({ decay: n, sustain: s });
  });
  zp = l("ar", (t, e) => {
    t = Array.isArray(t) ? t : [t];
    const [n, s = n] = t;
    return e.set({ attack: n, release: s });
  });
  ({ midichan: Mp } = c2("midichan"));
  ({ midimap: Pp } = c2("midimap"));
  ({ midiport: Ep } = c2("midiport"));
  ({ midicmd: jp } = c2("midicmd"));
  Jp = l("control", (t, e) => {
    if (!Array.isArray(t))
      throw new Error("control expects an array of [ccn, ccv]");
    const [n, s] = t;
    return e.ccn(n).ccv(s);
  });
  ({ ccn: $p } = c2("ccn"));
  ({ ccv: Np } = c2("ccv"));
  ({ ctlNum: Lp } = c2("ctlNum"));
  ({ nrpnn: Rp } = c2("nrpnn"));
  ({ nrpv: Wp } = c2("nrpv"));
  ({ progNum: Fp } = c2("progNum"));
  Ip = l("sysex", (t, e) => {
    if (!Array.isArray(t))
      throw new Error("sysex expects an array of [id, data]");
    const [n, s] = t;
    return e.sysexid(n).sysexdata(s);
  });
  ({ sysexid: Vp } = c2("sysexid"));
  ({ sysexdata: Hp } = c2("sysexdata"));
  ({ midibend: Dp } = c2("midibend"));
  ({ miditouch: Gp } = c2("miditouch"));
  ({ polyTouch: Qp } = c2("polyTouch"));
  ({ oschost: Up } = c2("oschost"));
  ({ oscport: Xp } = c2("oscport"));
  Kp = l("as", (t, e) => (t = Array.isArray(t) ? t : [t], e.fmap((n) => {
    n = Array.isArray(n) ? n : [n];
    const s = [];
    for (let r = 0;r < t.length; ++r)
      n[r] !== undefined && s.push([yt2(t[r]), n[r]]);
    return Object.fromEntries(s);
  })));
  Yp = l("scrub", (t, e) => t.outerBind((n) => {
    Array.isArray(n) || (n = [n]);
    const [s, r = 1] = n;
    return e.begin(s).mul(ye2(r)).clip(1);
  }), false);
  Bt2 = /* @__PURE__ */ new Map;
  Lt2("lfo", [
    ["control", "c"],
    ["subControl", "sc"],
    ["rate", "r"],
    ["depth", "dep", "dr"],
    ["depthabs", "da"],
    ["dcoffset", "dc"],
    ["shape", "sh"],
    ["skew", "sk"],
    ["curve", "cu"],
    ["sync", "s"],
    ["fxi"]
  ]);
  Lt2("env", [
    ["control", "c"],
    ["subControl", "sc"],
    ["attack", "att", "a"],
    ["decay", "dec", "d"],
    ["sustain", "sus", "s"],
    ["release", "rel", "r"],
    ["depth", "dep", "dr"],
    ["depthabs", "da"],
    ["acurve", "ac"],
    ["dcurve", "dc"],
    ["rcurve", "rc"],
    ["fxi"]
  ]);
  Lt2("bmod", [
    ["bus", "b"],
    ["control", "c"],
    ["subControl", "sc"],
    ["depth", "dep", "dr"],
    ["depthabs", "da"],
    ["dc"],
    ["fxi"]
  ]);
  f2.prototype.modulate = function(t, e, n) {
    e = { control: undefined, ...e };
    const s = ["lfo", "env", "bmod"];
    if (!s.includes(t))
      return E2(`[core] Modulation type ${t} not found. Please use one of 'lfo', 'env', 'bmod'`), this;
    let r = this, o;
    r = r.fmap((i) => (a) => ({ v: i, id: a })).appLeft(d(n));
    for (const [i, a] of Object.entries(e)) {
      const u = tf(t, i), p = d(a);
      r = r.fmap(({ v: h, id: y }) => (g) => {
        if (o === undefined) {
          let _ = yt2(Object.keys(h).at(-1));
          s.includes(_) && (_ = `${_}_${[...h[_].__ids].at(-1)}`), o = _;
        }
        h[t] ??= { __ids: /* @__PURE__ */ new Set };
        const v = h[t];
        return y ??= v.__ids.size, v[y] ??= { control: o }, v.__ids.add(y), g === undefined ? { v: h, id: y } : (u === "control" || u === "subControl" ? v[y][u] = yt2(g) : v[y][u] = g, { v: h, id: y });
      }).appLeft(p);
    }
    return r.fmap(({ v: i }) => i);
  };
  f2.prototype.lfo = function(t, e) {
    return this.modulate("lfo", t, e);
  };
  f2.prototype.env = function(t, e) {
    return this.modulate("env", t, e);
  };
  f2.prototype.bmod = function(t, e) {
    return this.modulate("bmod", t, e);
  };
  ({ transient: rf } = c2(["transient", "transsustain"]));
  ({ FXrelease: of, FXrel: cf, FXr: uf, fxr: af } = c2("FXrelease", "FXrel", "FXr", "fxr"));
  gy = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    FXr: uf,
    FXrel: cf,
    FXrelease: of,
    accelerate: Ys,
    activeLabel: va,
    ad: Bp,
    adsr: xp,
    amp: sr,
    analyze: gc,
    anchor: Ua,
    ar: zp,
    as: Kp,
    att: or,
    attack: rr,
    bandf: Cc,
    bandq: Oc,
    bank: yc,
    bbexpr: ti2,
    bbst: ni2,
    begin: Mc,
    bgain: ja,
    binshift: Zl,
    bmod: sf,
    bp: Bc,
    bpa: ji2,
    bpattack: Ei2,
    bpd: Wi2,
    bpdc: yu,
    bpdecay: Ri2,
    bpdepth: fu,
    bpdepthfreq: du,
    bpdepthfrequency: hu,
    bpe: Bi2,
    bpenv: xi2,
    bpf: xc,
    bpq: zc,
    bpr: Zi2,
    bprate: lu,
    bprelease: Yi2,
    bps: Gi2,
    bpshape: mu,
    bpskew: wu,
    bpsustain: Di2,
    bpsync: pu,
    bus: Pa,
    busgain: Ea,
    byteBeatExpression: Zc,
    byteBeatStartTime: ei2,
    ccn: $p,
    ccv: Np,
    ch: ri2,
    channel: gi2,
    channels: si2,
    chord: Da,
    chorus: wc,
    clip: pp,
    coarse: Rc,
    color: Ap,
    colour: Tp,
    comb: Xl,
    compressor: bl,
    compressorAttack: kl,
    compressorKnee: _l,
    compressorRatio: vl,
    compressorRelease: ql,
    control: Jp,
    cps: lp,
    createParam: Nt2,
    createParams: Cp,
    crush: Lc,
    ctf: vi2,
    ctlNum: Lp,
    ctranspose: Aa,
    curve: yp,
    cut: bi2,
    cutoff: _i2,
    dec: vc,
    decay: _c,
    degree: qa,
    delay: Ru,
    delayfb: Fu,
    delayfeedback: Wu,
    delayspeed: Vu,
    delaysync: Qu,
    delayt: Du,
    delaytime: Hu,
    deltaSlide: wp,
    density: Bl,
    det: Ku,
    detune: Xu,
    dfb: Iu,
    dict: Qa,
    dictionary: Ga,
    dist: yl,
    distort: ml,
    distorttype: gl,
    distortvol: wl,
    djf: Lu,
    drive: Qc,
    dry: ta,
    ds: Op,
    dt: Gu,
    duck: Uc,
    duckattack: Yc,
    duckdepth: Xc,
    duckonset: Kc,
    dur: dp,
    duration: hp,
    end: Pc,
    enhance: Ul,
    env: nf,
    expression: Ol,
    fadeInTime: sa,
    fadeOutTime: na,
    fadeTime: ea,
    fanchor: eu,
    fft: bc,
    fm: Sr,
    fm1: Ar,
    fm2: Tr,
    fm3: Cr,
    fm4: xr,
    fm5: Br,
    fm6: Or,
    fm7: zr,
    fm8: Mr,
    fmatt: Kr,
    fmatt1: Yr,
    fmatt2: Zr,
    fmatt3: to,
    fmatt4: eo,
    fmatt5: no,
    fmatt6: so,
    fmatt7: ro,
    fmatt8: oo,
    fmattack: Fr,
    fmattack1: Ir,
    fmattack2: Vr,
    fmattack3: Hr,
    fmattack4: Dr,
    fmattack5: Gr,
    fmattack6: Qr,
    fmattack7: Ur,
    fmattack8: Xr,
    fmdec: Ao,
    fmdec1: To,
    fmdec2: Co,
    fmdec3: xo,
    fmdec4: Bo,
    fmdec5: Oo,
    fmdec6: zo,
    fmdec7: Mo,
    fmdec8: Po,
    fmdecay: yo,
    fmdecay1: wo,
    fmdecay2: go,
    fmdecay3: bo,
    fmdecay4: _o,
    fmdecay5: vo,
    fmdecay6: ko,
    fmdecay7: qo,
    fmdecay8: So,
    fmenv: Pr,
    fmenv1: Er,
    fmenv2: jr,
    fmenv3: Jr,
    fmenv4: $r,
    fmenv5: Nr,
    fmenv6: Lr,
    fmenv7: Rr,
    fmenv8: Wr,
    fmh: cr,
    fmh1: ir,
    fmh2: ur,
    fmh3: ar,
    fmh4: lr,
    fmh5: pr,
    fmh6: fr,
    fmh7: hr,
    fmh8: dr,
    fmi: mr,
    fmi1: yr,
    fmi2: wr,
    fmi3: gr,
    fmi4: br,
    fmi5: _r,
    fmi6: vr,
    fmi7: kr,
    fmi8: qr,
    fmrel: ic,
    fmrel1: uc,
    fmrel2: ac,
    fmrel3: lc,
    fmrel4: pc,
    fmrel5: fc,
    fmrel6: hc,
    fmrel7: dc,
    fmrel8: mc,
    fmrelease: Yo,
    fmrelease1: Zo,
    fmrelease2: tc,
    fmrelease3: ec,
    fmrelease4: nc,
    fmrelease5: sc,
    fmrelease6: rc,
    fmrelease7: oc,
    fmrelease8: cc,
    fmsus: Io,
    fmsus1: Vo,
    fmsus2: Ho,
    fmsus3: Do,
    fmsus4: Go,
    fmsus5: Qo,
    fmsus6: Uo,
    fmsus7: Xo,
    fmsus8: Ko,
    fmsustain: Eo,
    fmsustain1: jo,
    fmsustain2: Jo,
    fmsustain3: $o,
    fmsustain4: No,
    fmsustain5: Lo,
    fmsustain6: Ro,
    fmsustain7: Wo,
    fmsustain8: Fo,
    fmwave: co,
    fmwave1: io,
    fmwave2: uo,
    fmwave3: ao,
    fmwave4: lo,
    fmwave5: po,
    fmwave6: fo,
    fmwave7: ho,
    fmwave8: mo,
    frameRate: np,
    frames: sp,
    freeze: Vl,
    freq: ra,
    fshift: Ml,
    fshiftnote: Pl,
    fshiftphase: El,
    ftype: tu,
    fxr: af,
    gain: er,
    gat: wa,
    gate: ya,
    getControlName: yt2,
    harmonic: Ta,
    hbrick: tp,
    hcutoff: Mu,
    hold: Tc,
    hours: rp,
    hp: Eu,
    hpa: Pi2,
    hpattack: Mi2,
    hpd: Li2,
    hpdc: Su,
    hpdecay: Ni2,
    hpdepth: _u,
    hpdepthfreq: ku,
    hpdepthfrequency: vu,
    hpe: Ci2,
    hpenv: Ti2,
    hpf: Pu,
    hpq: Ju,
    hpr: Ki2,
    hprate: gu,
    hprelease: Xi2,
    hps: Hi2,
    hpshape: qu,
    hpskew: Au,
    hpsustain: Vi2,
    hpsync: bu,
    hresonance: ju,
    imag: Ql,
    ir: cl,
    irbegin: al,
    iresponse: il,
    irspeed: ul,
    isControlName: is,
    kcutoff: $l,
    krush: Jl,
    label: ka,
    lbrick: ep,
    legato: fp,
    leslie: ga,
    lfo: ef,
    lock: Uu,
    loop: Ec,
    loopBegin: jc,
    loopEnd: $c,
    loopb: Jc,
    loope: Nc,
    lp: qi2,
    lpa: zi2,
    lpattack: Oi2,
    lpd: $i2,
    lpdc: uu,
    lpdecay: Ji2,
    lpdepth: ru,
    lpdepthfreq: cu,
    lpdepthfrequency: ou,
    lpe: Ai2,
    lpenv: Si2,
    lpf: ki2,
    lpq: Nu,
    lpr: Ui2,
    lprate: nu,
    lprelease: Qi2,
    lps: Ii2,
    lpshape: iu,
    lpskew: au,
    lpsustain: Fi2,
    lpsync: su,
    lrate: ba,
    lsize: _a,
    midibend: Dp,
    midichan: Mp,
    midicmd: jp,
    midimap: Pp,
    midiport: Ep,
    miditouch: Gp,
    minutes: op,
    mode: Ya,
    mtranspose: Sa,
    n: Xs,
    noise: Bu,
    note: Ks,
    nrpnn: Rp,
    nrpv: Wp,
    nudge: Ba,
    oct: za,
    octave: Oa,
    octaveR: xa,
    octaves: Ka,
    octer: Nl,
    octersub: Ll,
    octersubsub: Rl,
    offset: Xa,
    orbit: Ma,
    oschost: Up,
    oscport: Xp,
    overgain: Ja,
    overshape: $a,
    pan: Na,
    panchor: ma,
    panorient: Fa,
    panspan: La,
    pansplay: Ra,
    panwidth: Wa,
    patt: ca,
    pattack: oa,
    pcurve: da,
    pdec: ua,
    pdecay: ia,
    penv: ha,
    ph: ai2,
    phasdp: wi2,
    phaser: li2,
    phasercenter: hi2,
    phaserdepth: mi2,
    phaserrate: ui2,
    phasersweep: pi2,
    phc: di2,
    phd: yi2,
    phs: fi2,
    pitchJump: gp,
    pitchJumpTime: bp,
    polyTouch: Qp,
    postgain: nr,
    prel: fa,
    prelease: pa,
    progNum: Fp,
    psus: la,
    psustain: aa,
    pw: oi2,
    pwrate: ci2,
    pwsweep: ii2,
    rdim: sl,
    real: Gl,
    registerControl: c2,
    registerMultiControl: V2,
    rel: Ac,
    release: Sc,
    resonance: $u,
    rfade: ol,
    ring: Wl,
    ringdf: Il,
    ringf: Fl,
    rlp: el,
    room: Za,
    roomdim: nl,
    roomfade: rl,
    roomlp: tl,
    roomsize: ll,
    rsize: hl,
    s: us,
    scram: Yl,
    scrub: Yp,
    seconds: cp,
    semitone: Va,
    shape: dl,
    size: pl,
    slide: Ia,
    smear: Kl,
    songPtr: ip,
    sound: as,
    source: Qs,
    speed: ye2,
    spread: Zu,
    squiz: Tl,
    src: Us,
    stepsPerOctave: Ca,
    stretch: Sl,
    sus: qc,
    sustain: kc,
    sustainpedal: zl,
    sysex: Ip,
    sysexdata: Hp,
    sysexid: Vp,
    sz: fl,
    transient: rf,
    trem: Fc,
    tremolo: Wc,
    tremolodepth: Vc,
    tremolophase: Dc,
    tremoloshape: Gc,
    tremoloskew: Hc,
    tremolosync: Ic,
    triode: jl,
    tsdelay: Dl,
    uid: up,
    unison: Yu,
    unit: Al,
    v: xu,
    val: ap,
    vel: tr,
    velocity: Zs,
    vib: Tu,
    vibmod: Ou,
    vibrato: Cu,
    vmod: zu,
    voice: Ha,
    vowel: Cl,
    warp: Cs,
    warpatt: Os,
    warpattack: Bs,
    warpdc: Rs,
    warpdec: Ms,
    warpdecay: zs,
    warpdepth: Ns,
    warpenv: Ds,
    warpmode: Fs,
    warprate: $s,
    warprel: Js,
    warprelease: js,
    warpshape: Ls,
    warpskew: Ws,
    warpsus: Es,
    warpsustain: Ps,
    warpsync: Gs,
    waveloss: xl,
    wavetablePhaseRand: Hs,
    wavetablePosition: ps,
    wavetableWarp: xs,
    wavetableWarpMode: Is,
    wt: ls,
    wtatt: ds,
    wtattack: hs,
    wtdc: As,
    wtdec: ys,
    wtdecay: ms,
    wtdepth: qs,
    wtenv: fs,
    wtphaserand: Vs,
    wtrate: vs,
    wtrel: _s,
    wtrelease: bs,
    wtshape: Ss,
    wtskew: Ts,
    wtsus: gs,
    wtsustain: ws,
    wtsync: ks,
    xsdelay: Hl,
    zcrush: kp,
    zdelay: qp,
    zmod: vp,
    znoise: _p,
    zrand: mp,
    zzfx: Sp
  }, Symbol.toStringTag, { value: "Module" }));
  by = l("euclid", function(t, e, n) {
    return n.struct(kt2(t, e, 0));
  });
  _y = l("bjork", function(t, e) {
    Array.isArray(t) || (t = [t]);
    const [n, s = n, r = 0] = t;
    return e.struct(kt2(n, s, r));
  });
  ({ euclidrot: vy, euclidRot: ky } = l(["euclidrot", "euclidRot"], function(t, e, n, s) {
    return s.struct(kt2(t, e, n));
  }));
  qy = l(["euclidLegato"], function(t, e, n) {
    return be2(t, e, 0, n);
  });
  Sy = l(["euclidLegatoRot"], function(t, e, n, s) {
    return be2(t, e, n, s);
  });
  ({ euclidish: Ay, eish: Ty } = l(["euclidish", "eish"], function(t, e, n, s) {
    const r = de2(ge2(t, e), new Array(t).fill(1), n);
    return s.struct(r).setSteps(e);
  }));
  ct2 = {};
  Cy = l("timeline", function(t, e) {
    t = d(t);
    const n = function(s) {
      const r = !!s.controls.cyclist, o = t.query(s), i = [];
      for (const a of o) {
        const u = a.value;
        let p;
        if (u === 0)
          p = 0;
        else if (u in ct2)
          p = ct2[u];
        else {
          const y = a.wholeOrPart();
          !r || s.span.begin.lt(y.midpoint()) ? p = y.begin : p = y.end;
        }
        r && (ct2[u] = p, u !== 0 && delete ct2[-u]);
        const h = e.late(p).query(s.setSpan(a.part)).map((y) => y.setContext(y.combineContext(a)));
        i.push(...h);
      }
      return i;
    };
    return new f2(n, e._steps);
  }, false);
  wf = l("pick", function(t, e) {
    return F2(t, e, false).innerJoin();
  });
  gf = l("pickmod", function(t, e) {
    return F2(t, e, true).innerJoin();
  });
  xy = l("pickF", function(t, e, n) {
    return n.apply(yf(t, e));
  });
  By = l("pickmodF", function(t, e, n) {
    return n.apply(gf(t, e));
  });
  Oy = l("pickOut", function(t, e) {
    return F2(t, e, false).outerJoin();
  });
  zy = l("pickmodOut", function(t, e) {
    return F2(t, e, true).outerJoin();
  });
  My = l("pickRestart", function(t, e) {
    return F2(t, e, false).restartJoin();
  });
  Py = l("pickmodRestart", function(t, e) {
    return F2(t, e, true).restartJoin();
  });
  Ey = l("pickReset", function(t, e) {
    return F2(t, e, false).resetJoin();
  });
  jy = l("pickmodReset", function(t, e) {
    return F2(t, e, true).resetJoin();
  });
  ({ inhabit: Jy, pickSqueeze: $y } = l(["inhabit", "pickSqueeze"], function(t, e) {
    return F2(t, e, false).squeezeJoin();
  }));
  ({ inhabitmod: Ny, pickmodSqueeze: Ly } = l(["inhabitmod", "pickmodSqueeze"], function(t, e) {
    return F2(t, e, true).squeezeJoin();
  }));
  qt2 = j2((t) => t % 1);
  Se2 = qt2.toBipolar();
  Rt2 = j2((t) => 1 - t % 1);
  Ae2 = Rt2.toBipolar();
  Te2 = j2((t) => Math.sin(Math.PI * 2 * t));
  Af = Te2.fromBipolar();
  Qy = Af._early(m(1).div(4));
  Uy = Te2._early(m(1).div(4));
  Tf = j2((t) => Math.floor(t * 2 % 2));
  Xy = Tf.toBipolar();
  Ky = N2(qt2, Rt2);
  Yy = N2(Se2, Ae2);
  Zy = N2(Rt2, qt2);
  tw = N2(Ae2, Se2);
  ew = j2(ot2);
  typeof window < "u" && document.addEventListener("mousemove", (t) => {
    Wt2 = t.clientY / document.body.clientHeight, Ft2 = t.clientX / document.body.clientWidth;
  });
  nw = j2(() => Wt2);
  sw = j2(() => Wt2);
  rw = j2(() => Ft2);
  ow = j2(() => Ft2);
  lw = l("shuffle", (t, e) => Be2(Nf(t), t, e));
  pw = l("scramble", (t, e) => Be2(ze2(t)._segment(t), t, e));
  fw = l("seed", (t, e) => Lf(() => t, e));
  W2 = j2((t, e) => K2(t, 1, e.randSeed));
  hw = W2.toBipolar();
  mw = Oe2(0.5);
  gw = Rf;
  f2.prototype.choose = function(...t) {
    return It2(this, t);
  };
  f2.prototype.choose2 = function(...t) {
    return It2(this.fromBipolar(), t);
  };
  bw = Wf;
  vw = If;
  kw = j2((t, e) => Vf(t, e.randSeed));
  qw = j2((t, e) => Hf(t, e.randSeed));
  Sw = l("degradeByWith", (t, e, n) => n.fmap((s) => (r) => s).appLeft(t.filterValues((s) => s > e)), true, true);
  Aw = l("degradeBy", function(t, e) {
    return e._degradeByWith(W2, t);
  }, true, true);
  Tw = l("degrade", (t) => t._degradeBy(0.5), true, true);
  Cw = l("undegradeBy", function(t, e) {
    return e._degradeByWith(W2.fmap((n) => 1 - n), t);
  }, true, true);
  xw = l("undegrade", (t) => t._undegradeBy(0.5), true, true);
  Bw = l("sometimesBy", function(t, e, n) {
    return d(t).fmap((s) => z(n._degradeBy(s), e(n._undegradeBy(1 - s)))).innerJoin();
  });
  Ow = l("sometimes", function(t, e) {
    return e._sometimesBy(0.5, t);
  });
  zw = l("someCyclesBy", function(t, e, n) {
    return d(t).fmap((s) => z(n._degradeByWith(W2._segment(1), s), e(n._degradeByWith(W2.fmap((r) => 1 - r)._segment(1), 1 - s)))).innerJoin();
  });
  Mw = l("someCycles", function(t, e) {
    return e._someCyclesBy(0.5, t);
  });
  Pw = l("often", function(t, e) {
    return e.sometimesBy(0.75, t);
  });
  Ew = l("rarely", function(t, e) {
    return e.sometimesBy(0.25, t);
  });
  jw = l("almostNever", function(t, e) {
    return e.sometimesBy(0.1, t);
  });
  Jw = l("almostAlways", function(t, e) {
    return e.sometimesBy(0.9, t);
  });
  $w = l("never", function(t, e) {
    return e;
  });
  Nw = l("always", function(t, e) {
    return t(e);
  });
  Lw = l("whenKey", function(t, e, n) {
    return n.when(je2(t), e);
  });
  Rw = l("keyDown", function(t) {
    return t.fmap(je2);
  });
  Ww = new f2(function(t) {
    return [new S2(undefined, t.span, t.span.duration)];
  });
  Df = new f2(function(t) {
    return [new S2(undefined, t.span, m(1).div(t.span.duration))];
  });
  Fw = Df;
  Iw = new f2(function(t) {
    const e = m(1).div(t.span.duration);
    return [new S2(undefined, t.span, Math.log(e) / Math.log(2) + 1)];
  });
  try {
    wt2 = window?.speechSynthesis;
  } catch {
    console.warn("cannot use window: not in browser?");
  }
  re2 = wt2?.getVoices();
  Vw = l("speak", function(t, e, n) {
    return n.onTrigger((s) => {
      Gf(s.value, t, e);
    });
  });
  E2("\uD83C\uDF00 @strudel/core loaded \uD83C\uDF00");
  globalThis._strudelLoaded && console.warn(`@strudel/core was loaded more than once...
This might happen when you have multiple versions of strudel installed. 
Please check with "npm ls @strudel/core".`);
  globalThis._strudelLoaded = true;
});

// node_modules/@strudel/mini/dist/index.mjs
var exports_dist2 = {};
__export(exports_dist2, {
  StartRules: () => Gr2,
  SyntaxError: () => uu2,
  getLeafLocation: () => ee3,
  getLeafLocations: () => Yr2,
  getLeaves: () => Xr2,
  h: () => Jr2,
  m: () => Hr2,
  mini: () => te3,
  mini2ast: () => Au2,
  miniAllStrings: () => Qr2,
  minify: () => Kr2,
  parse: () => Mr2,
  patternifyAST: () => nu2
});
function Or2(t, i) {
  function e() {
    this.constructor = t;
  }
  e.prototype = i.prototype, t.prototype = new e;
}
function uu2(t, i, e, f) {
  var l = Error.call(this, t);
  return Object.setPrototypeOf && Object.setPrototypeOf(l, uu2.prototype), l.expected = i, l.found = e, l.location = f, l.name = "SyntaxError", l;
}
function Cu2(t, i, e) {
  return e = e || " ", t.length > i ? t : (i -= t.length, e += e.repeat(i), t + e.slice(0, i));
}
function Mr2(t, i) {
  i = i !== undefined ? i : {};
  var e = {}, f = i.grammarSource, l = { start: Uu }, a = Uu, D = ".", v = "-", g = "0", c = ",", F = "|", p = "[", w = "]", P = "{", R = "}", su = "%", iu = "<", re = ">", ne = "!", se = "(", ie = ")", fe = "/", oe = "*", ae = "?", le = ":", Eu = "..", ce = "^", vu = "struct", $u = "target", mu = "euclid", _u = "slow", yu = "rotL", wu = "rotR", bu = "fast", xu = "scale", Iu = "//", ku = "cat", Ae = "$", Nu = "setcps", Pu = "setbpm", qu = "hush", pe = /^[1-9]/, ge = /^[eE]/, Fe = /^[+\-]/, he = /^[0-9]/, ju = /^[ \n\r\t\xA0]/, Be = /^["']/, Ce = /^[#\--.0-9A-Z\^-_a-z~\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376-\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E-\u066F\u0671-\u06D3\u06D5\u06E5-\u06E6\u06EE-\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4-\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F-\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC-\u09DD\u09DF-\u09E1\u09F0-\u09F1\u09FC\u0A05-\u0A0A\u0A0F-\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32-\u0A33\u0A35-\u0A36\u0A38-\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2-\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0-\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F-\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32-\u0B33\u0B35-\u0B39\u0B3D\u0B5C-\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99-\u0B9A\u0B9C\u0B9E-\u0B9F\u0BA3-\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60-\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0-\u0CE1\u0CF1-\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32-\u0E33\u0E40-\u0E46\u0E81-\u0E82\u0E84\u0E87-\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA-\u0EAB\u0EAD-\u0EB0\u0EB2-\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065-\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE-\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5-\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEF\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A-\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7B9\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD-\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5-\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40-\uFB41\uFB43-\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/, De = /^[@_]/, Su = /^[^\n]/, de = pu("number"), Ru = _(".", false), Ee = O([["1", "9"]], false, false), ve = O(["e", "E"], false, false), $e = O(["+", "-"], false, false), me = _("-", false), _e = _("0", false), ye = O([["0", "9"]], false, false), we = pu("whitespace"), Lu = O([" ", `
`, "\r", "\t", "\xA0"], false, false), be = _(",", false), xe = _("|", false), Ie = O(['"', "'"], false, false), ke = pu('a letter, a number, "-", "#", ".", "^", "_"'), Ne = O(["#", ["-", "."], ["0", "9"], ["A", "Z"], ["^", "_"], ["a", "z"], "~", "\xAA", "\xB5", "\xBA", ["\xC0", "\xD6"], ["\xD8", "\xF6"], ["\xF8", "\u02C1"], ["\u02C6", "\u02D1"], ["\u02E0", "\u02E4"], "\u02EC", "\u02EE", ["\u0370", "\u0374"], ["\u0376", "\u0377"], ["\u037A", "\u037D"], "\u037F", "\u0386", ["\u0388", "\u038A"], "\u038C", ["\u038E", "\u03A1"], ["\u03A3", "\u03F5"], ["\u03F7", "\u0481"], ["\u048A", "\u052F"], ["\u0531", "\u0556"], "\u0559", ["\u0560", "\u0588"], ["\u05D0", "\u05EA"], ["\u05EF", "\u05F2"], ["\u0620", "\u064A"], ["\u066E", "\u066F"], ["\u0671", "\u06D3"], "\u06D5", ["\u06E5", "\u06E6"], ["\u06EE", "\u06EF"], ["\u06FA", "\u06FC"], "\u06FF", "\u0710", ["\u0712", "\u072F"], ["\u074D", "\u07A5"], "\u07B1", ["\u07CA", "\u07EA"], ["\u07F4", "\u07F5"], "\u07FA", ["\u0800", "\u0815"], "\u081A", "\u0824", "\u0828", ["\u0840", "\u0858"], ["\u0860", "\u086A"], ["\u08A0", "\u08B4"], ["\u08B6", "\u08BD"], ["\u0904", "\u0939"], "\u093D", "\u0950", ["\u0958", "\u0961"], ["\u0971", "\u0980"], ["\u0985", "\u098C"], ["\u098F", "\u0990"], ["\u0993", "\u09A8"], ["\u09AA", "\u09B0"], "\u09B2", ["\u09B6", "\u09B9"], "\u09BD", "\u09CE", ["\u09DC", "\u09DD"], ["\u09DF", "\u09E1"], ["\u09F0", "\u09F1"], "\u09FC", ["\u0A05", "\u0A0A"], ["\u0A0F", "\u0A10"], ["\u0A13", "\u0A28"], ["\u0A2A", "\u0A30"], ["\u0A32", "\u0A33"], ["\u0A35", "\u0A36"], ["\u0A38", "\u0A39"], ["\u0A59", "\u0A5C"], "\u0A5E", ["\u0A72", "\u0A74"], ["\u0A85", "\u0A8D"], ["\u0A8F", "\u0A91"], ["\u0A93", "\u0AA8"], ["\u0AAA", "\u0AB0"], ["\u0AB2", "\u0AB3"], ["\u0AB5", "\u0AB9"], "\u0ABD", "\u0AD0", ["\u0AE0", "\u0AE1"], "\u0AF9", ["\u0B05", "\u0B0C"], ["\u0B0F", "\u0B10"], ["\u0B13", "\u0B28"], ["\u0B2A", "\u0B30"], ["\u0B32", "\u0B33"], ["\u0B35", "\u0B39"], "\u0B3D", ["\u0B5C", "\u0B5D"], ["\u0B5F", "\u0B61"], "\u0B71", "\u0B83", ["\u0B85", "\u0B8A"], ["\u0B8E", "\u0B90"], ["\u0B92", "\u0B95"], ["\u0B99", "\u0B9A"], "\u0B9C", ["\u0B9E", "\u0B9F"], ["\u0BA3", "\u0BA4"], ["\u0BA8", "\u0BAA"], ["\u0BAE", "\u0BB9"], "\u0BD0", ["\u0C05", "\u0C0C"], ["\u0C0E", "\u0C10"], ["\u0C12", "\u0C28"], ["\u0C2A", "\u0C39"], "\u0C3D", ["\u0C58", "\u0C5A"], ["\u0C60", "\u0C61"], "\u0C80", ["\u0C85", "\u0C8C"], ["\u0C8E", "\u0C90"], ["\u0C92", "\u0CA8"], ["\u0CAA", "\u0CB3"], ["\u0CB5", "\u0CB9"], "\u0CBD", "\u0CDE", ["\u0CE0", "\u0CE1"], ["\u0CF1", "\u0CF2"], ["\u0D05", "\u0D0C"], ["\u0D0E", "\u0D10"], ["\u0D12", "\u0D3A"], "\u0D3D", "\u0D4E", ["\u0D54", "\u0D56"], ["\u0D5F", "\u0D61"], ["\u0D7A", "\u0D7F"], ["\u0D85", "\u0D96"], ["\u0D9A", "\u0DB1"], ["\u0DB3", "\u0DBB"], "\u0DBD", ["\u0DC0", "\u0DC6"], ["\u0E01", "\u0E30"], ["\u0E32", "\u0E33"], ["\u0E40", "\u0E46"], ["\u0E81", "\u0E82"], "\u0E84", ["\u0E87", "\u0E88"], "\u0E8A", "\u0E8D", ["\u0E94", "\u0E97"], ["\u0E99", "\u0E9F"], ["\u0EA1", "\u0EA3"], "\u0EA5", "\u0EA7", ["\u0EAA", "\u0EAB"], ["\u0EAD", "\u0EB0"], ["\u0EB2", "\u0EB3"], "\u0EBD", ["\u0EC0", "\u0EC4"], "\u0EC6", ["\u0EDC", "\u0EDF"], "\u0F00", ["\u0F40", "\u0F47"], ["\u0F49", "\u0F6C"], ["\u0F88", "\u0F8C"], ["\u1000", "\u102A"], "\u103F", ["\u1050", "\u1055"], ["\u105A", "\u105D"], "\u1061", ["\u1065", "\u1066"], ["\u106E", "\u1070"], ["\u1075", "\u1081"], "\u108E", ["\u10A0", "\u10C5"], "\u10C7", "\u10CD", ["\u10D0", "\u10FA"], ["\u10FC", "\u1248"], ["\u124A", "\u124D"], ["\u1250", "\u1256"], "\u1258", ["\u125A", "\u125D"], ["\u1260", "\u1288"], ["\u128A", "\u128D"], ["\u1290", "\u12B0"], ["\u12B2", "\u12B5"], ["\u12B8", "\u12BE"], "\u12C0", ["\u12C2", "\u12C5"], ["\u12C8", "\u12D6"], ["\u12D8", "\u1310"], ["\u1312", "\u1315"], ["\u1318", "\u135A"], ["\u1380", "\u138F"], ["\u13A0", "\u13F5"], ["\u13F8", "\u13FD"], ["\u1401", "\u166C"], ["\u166F", "\u167F"], ["\u1681", "\u169A"], ["\u16A0", "\u16EA"], ["\u16EE", "\u16F8"], ["\u1700", "\u170C"], ["\u170E", "\u1711"], ["\u1720", "\u1731"], ["\u1740", "\u1751"], ["\u1760", "\u176C"], ["\u176E", "\u1770"], ["\u1780", "\u17B3"], "\u17D7", "\u17DC", ["\u1820", "\u1878"], ["\u1880", "\u1884"], ["\u1887", "\u18A8"], "\u18AA", ["\u18B0", "\u18F5"], ["\u1900", "\u191E"], ["\u1950", "\u196D"], ["\u1970", "\u1974"], ["\u1980", "\u19AB"], ["\u19B0", "\u19C9"], ["\u1A00", "\u1A16"], ["\u1A20", "\u1A54"], "\u1AA7", ["\u1B05", "\u1B33"], ["\u1B45", "\u1B4B"], ["\u1B83", "\u1BA0"], ["\u1BAE", "\u1BAF"], ["\u1BBA", "\u1BE5"], ["\u1C00", "\u1C23"], ["\u1C4D", "\u1C4F"], ["\u1C5A", "\u1C7D"], ["\u1C80", "\u1C88"], ["\u1C90", "\u1CBA"], ["\u1CBD", "\u1CBF"], ["\u1CE9", "\u1CEC"], ["\u1CEE", "\u1CF1"], ["\u1CF5", "\u1CF6"], ["\u1D00", "\u1DBF"], ["\u1E00", "\u1F15"], ["\u1F18", "\u1F1D"], ["\u1F20", "\u1F45"], ["\u1F48", "\u1F4D"], ["\u1F50", "\u1F57"], "\u1F59", "\u1F5B", "\u1F5D", ["\u1F5F", "\u1F7D"], ["\u1F80", "\u1FB4"], ["\u1FB6", "\u1FBC"], "\u1FBE", ["\u1FC2", "\u1FC4"], ["\u1FC6", "\u1FCC"], ["\u1FD0", "\u1FD3"], ["\u1FD6", "\u1FDB"], ["\u1FE0", "\u1FEC"], ["\u1FF2", "\u1FF4"], ["\u1FF6", "\u1FFC"], "\u2071", "\u207F", ["\u2090", "\u209C"], "\u2102", "\u2107", ["\u210A", "\u2113"], "\u2115", ["\u2119", "\u211D"], "\u2124", "\u2126", "\u2128", ["\u212A", "\u212D"], ["\u212F", "\u2139"], ["\u213C", "\u213F"], ["\u2145", "\u2149"], "\u214E", ["\u2160", "\u2188"], ["\u2C00", "\u2C2E"], ["\u2C30", "\u2C5E"], ["\u2C60", "\u2CE4"], ["\u2CEB", "\u2CEE"], ["\u2CF2", "\u2CF3"], ["\u2D00", "\u2D25"], "\u2D27", "\u2D2D", ["\u2D30", "\u2D67"], "\u2D6F", ["\u2D80", "\u2D96"], ["\u2DA0", "\u2DA6"], ["\u2DA8", "\u2DAE"], ["\u2DB0", "\u2DB6"], ["\u2DB8", "\u2DBE"], ["\u2DC0", "\u2DC6"], ["\u2DC8", "\u2DCE"], ["\u2DD0", "\u2DD6"], ["\u2DD8", "\u2DDE"], "\u2E2F", ["\u3005", "\u3007"], ["\u3021", "\u3029"], ["\u3031", "\u3035"], ["\u3038", "\u303C"], ["\u3041", "\u3096"], ["\u309D", "\u309F"], ["\u30A1", "\u30FA"], ["\u30FC", "\u30FF"], ["\u3105", "\u312F"], ["\u3131", "\u318E"], ["\u31A0", "\u31BA"], ["\u31F0", "\u31FF"], ["\u3400", "\u4DB5"], ["\u4E00", "\u9FEF"], ["\uA000", "\uA48C"], ["\uA4D0", "\uA4FD"], ["\uA500", "\uA60C"], ["\uA610", "\uA61F"], ["\uA62A", "\uA62B"], ["\uA640", "\uA66E"], ["\uA67F", "\uA69D"], ["\uA6A0", "\uA6EF"], ["\uA717", "\uA71F"], ["\uA722", "\uA788"], ["\uA78B", "\uA7B9"], ["\uA7F7", "\uA801"], ["\uA803", "\uA805"], ["\uA807", "\uA80A"], ["\uA80C", "\uA822"], ["\uA840", "\uA873"], ["\uA882", "\uA8B3"], ["\uA8F2", "\uA8F7"], "\uA8FB", ["\uA8FD", "\uA8FE"], ["\uA90A", "\uA925"], ["\uA930", "\uA946"], ["\uA960", "\uA97C"], ["\uA984", "\uA9B2"], "\uA9CF", ["\uA9E0", "\uA9E4"], ["\uA9E6", "\uA9EF"], ["\uA9FA", "\uA9FE"], ["\uAA00", "\uAA28"], ["\uAA40", "\uAA42"], ["\uAA44", "\uAA4B"], ["\uAA60", "\uAA76"], "\uAA7A", ["\uAA7E", "\uAAAF"], "\uAAB1", ["\uAAB5", "\uAAB6"], ["\uAAB9", "\uAABD"], "\uAAC0", "\uAAC2", ["\uAADB", "\uAADD"], ["\uAAE0", "\uAAEA"], ["\uAAF2", "\uAAF4"], ["\uAB01", "\uAB06"], ["\uAB09", "\uAB0E"], ["\uAB11", "\uAB16"], ["\uAB20", "\uAB26"], ["\uAB28", "\uAB2E"], ["\uAB30", "\uAB5A"], ["\uAB5C", "\uAB65"], ["\uAB70", "\uABE2"], ["\uAC00", "\uD7A3"], ["\uD7B0", "\uD7C6"], ["\uD7CB", "\uD7FB"], ["\uF900", "\uFA6D"], ["\uFA70", "\uFAD9"], ["\uFB00", "\uFB06"], ["\uFB13", "\uFB17"], "\uFB1D", ["\uFB1F", "\uFB28"], ["\uFB2A", "\uFB36"], ["\uFB38", "\uFB3C"], "\uFB3E", ["\uFB40", "\uFB41"], ["\uFB43", "\uFB44"], ["\uFB46", "\uFBB1"], ["\uFBD3", "\uFD3D"], ["\uFD50", "\uFD8F"], ["\uFD92", "\uFDC7"], ["\uFDF0", "\uFDFB"], ["\uFE70", "\uFE74"], ["\uFE76", "\uFEFC"], ["\uFF21", "\uFF3A"], ["\uFF41", "\uFF5A"], ["\uFF66", "\uFFBE"], ["\uFFC2", "\uFFC7"], ["\uFFCA", "\uFFCF"], ["\uFFD2", "\uFFD7"], ["\uFFDA", "\uFFDC"]], false, false), Ou = _("[", false), Mu = _("]", false), Pe = _("{", false), qe = _("}", false), je = _("%", false), Se = _("<", false), Re = _(">", false), Le = O(["@", "_"], false, false), Oe = _("!", false), Me = _("(", false), ze = _(")", false), Te = _("/", false), Ze = _("*", false), We = _("?", false), Ue = _(":", false), Ve = _("..", false), Xe = _("^", false), Ge = _("struct", false), Ye = _("target", false), He = _("euclid", false), Je = _("slow", false), Ke = _("rotL", false), Qe = _("rotR", false), ut = _("fast", false), et = _("scale", false), tt = _("//", false), zu = O([`
`], true, false), rt = _("cat", false), nt = _("$", false), st = _("setcps", false), it = _("setbpm", false), ft = _("hush", false), ot = function() {
    return parseFloat(Xt());
  }, at = function(u) {
    const r = u.join("");
    return r === "." || r === "_";
  }, lt = function(u) {
    return new Sr(u.join(""));
  }, ct = function(u) {
    return u;
  }, At = function(u, r) {
    return u.arguments_.stepsPerCycle = r, u;
  }, pt = function(u) {
    return u;
  }, gt = function(u) {
    return u.arguments_.alignment = "polymeter_slowcat", u;
  }, Ft = function(u) {
    return (r) => r.options_.weight = (r.options_.weight ?? 1) + (u ?? 2) - 1;
  }, ht = function(u) {
    return (r) => {
      const s = (r.options_.reps ?? 1) + (u ?? 2) - 1;
      r.options_.reps = s, r.options_.ops = r.options_.ops.filter((o) => o.type_ !== "replicate"), r.options_.ops.push({ type_: "replicate", arguments_: { amount: s } }), r.options_.weight = s;
    };
  }, Bt = function(u, r, s) {
    return (o) => o.options_.ops.push({ type_: "bjorklund", arguments_: { pulse: u, step: r, rotation: s } });
  }, Ct = function(u) {
    return (r) => r.options_.ops.push({ type_: "stretch", arguments_: { amount: u, type: "slow" } });
  }, Dt = function(u) {
    return (r) => r.options_.ops.push({ type_: "stretch", arguments_: { amount: u, type: "fast" } });
  }, dt = function(u) {
    return (r) => r.options_.ops.push({ type_: "degradeBy", arguments_: { amount: u, seed: Bu++ } });
  }, Et = function(u) {
    return (r) => r.options_.ops.push({ type_: "tail", arguments_: { element: u } });
  }, vt = function(u) {
    return (r) => r.options_.ops.push({ type_: "range", arguments_: { element: u } });
  }, $t = function(u, r) {
    const s = new Lr(u, { ops: [], weight: 1, reps: 1 });
    for (const o of r)
      o(s);
    return s;
  }, mt = function(u, r) {
    return new lu(r, "fastcat", undefined, !!u);
  }, _t = function(u) {
    return { alignment: "stack", list: u };
  }, yt = function(u) {
    return { alignment: "rand", list: u, seed: Bu++ };
  }, wt = function(u) {
    return { alignment: "feet", list: u, seed: Bu++ };
  }, bt = function(u, r) {
    return r && r.list.length > 0 ? new lu([u, ...r.list], r.alignment, r.seed) : u;
  }, xt = function(u, r) {
    return new lu(r ? [u, ...r.list] : [u], "polymeter");
  }, It = function(u) {
    return u;
  }, kt = function(u) {
    return { name: "struct", args: { mini: u } };
  }, Nt = function(u) {
    return { name: "target", args: { name: u } };
  }, Pt = function(u, r, s) {
    return { name: "bjorklund", args: { pulse: u, step: parseInt(r) } };
  }, qt = function(u) {
    return { name: "stretch", args: { amount: u } };
  }, jt = function(u) {
    return { name: "shift", args: { amount: "-" + u } };
  }, St = function(u) {
    return { name: "shift", args: { amount: u } };
  }, Rt = function(u) {
    return { name: "stretch", args: { amount: "1/" + u } };
  }, Lt = function(u) {
    return { name: "scale", args: { scale: u.join("") } };
  }, Tu = function(u, r) {
    return r;
  }, Ot = function(u, r) {
    return r.unshift(u), new lu(r, "slowcat");
  }, Mt = function(u) {
    return u;
  }, zt = function(u, r) {
    return new Rr(u.name, u.args, r);
  }, Tt = function(u) {
    return u;
  }, Zt = function(u) {
    return u;
  }, Wt = function(u) {
    return new hu("setcps", { value: u });
  }, Ut = function(u) {
    return new hu("setcps", { value: u / 120 / 2 });
  }, Vt = function() {
    return new hu("hush");
  }, n = i.peg$currPos | 0, $ = n, V = [{ line: 1, column: 1 }], q = n, fu = i.peg$maxFailExpected || [], h = i.peg$silentFails | 0, eu;
  if (i.startRule) {
    if (!(i.startRule in l))
      throw new Error(`Can't start parsing from rule "` + i.startRule + '".');
    a = l[i.startRule];
  }
  function Xt() {
    return t.substring($, n);
  }
  function Zu() {
    return gu($, n);
  }
  function _(u, r) {
    return { type: "literal", text: u, ignoreCase: r };
  }
  function O(u, r, s) {
    return { type: "class", parts: u, inverted: r, ignoreCase: s };
  }
  function Gt() {
    return { type: "end" };
  }
  function pu(u) {
    return { type: "other", description: u };
  }
  function Wu(u) {
    var r = V[u], s;
    if (r)
      return r;
    if (u >= V.length)
      s = V.length - 1;
    else
      for (s = u;!V[--s]; )
        ;
    for (r = V[s], r = {
      line: r.line,
      column: r.column
    };s < u; )
      t.charCodeAt(s) === 10 ? (r.line++, r.column = 1) : r.column++, s++;
    return V[u] = r, r;
  }
  function gu(u, r, s) {
    var o = Wu(u), B = Wu(r), x = {
      source: f,
      start: {
        offset: u,
        line: o.line,
        column: o.column
      },
      end: {
        offset: r,
        line: B.line,
        column: B.column
      }
    };
    return x;
  }
  function d(u) {
    n < q || (n > q && (q = n, fu = []), fu.push(u));
  }
  function Yt(u, r, s) {
    return new uu2(uu2.buildMessage(u, r), u, r, s);
  }
  function Uu() {
    var u;
    return u = jr(), u;
  }
  function M() {
    var u, r;
    return h++, u = n, er(), r = ou(), r !== e ? (ur(), Qt(), $ = u, u = ot()) : (n = u, u = e), h--, u === e && h === 0 && d(de), u;
  }
  function Ht() {
    var u;
    return t.charCodeAt(n) === 46 ? (u = D, n++) : (u = e, h === 0 && d(Ru)), u;
  }
  function Jt() {
    var u;
    return u = t.charAt(n), pe.test(u) ? n++ : (u = e, h === 0 && d(Ee)), u;
  }
  function Kt() {
    var u;
    return u = t.charAt(n), ge.test(u) ? n++ : (u = e, h === 0 && d(ve)), u;
  }
  function Qt() {
    var u, r, s, o, B;
    if (u = n, r = Kt(), r !== e) {
      if (s = t.charAt(n), Fe.test(s) ? n++ : (s = e, h === 0 && d($e)), s === e && (s = null), o = [], B = X(), B !== e)
        for (;B !== e; )
          o.push(B), B = X();
      else
        o = e;
      o !== e ? (r = [r, s, o], u = r) : (n = u, u = e);
    } else
      n = u, u = e;
    return u;
  }
  function ur() {
    var u, r, s, o;
    if (u = n, r = Ht(), r !== e) {
      if (s = [], o = X(), o !== e)
        for (;o !== e; )
          s.push(o), o = X();
      else
        s = e;
      s !== e ? (r = [r, s], u = r) : (n = u, u = e);
    } else
      n = u, u = e;
    return u;
  }
  function ou() {
    var u, r, s, o;
    if (u = tr(), u === e)
      if (u = n, r = Jt(), r !== e) {
        for (s = [], o = X();o !== e; )
          s.push(o), o = X();
        r = [r, s], u = r;
      } else
        n = u, u = e;
    return u;
  }
  function er() {
    var u;
    return t.charCodeAt(n) === 45 ? (u = v, n++) : (u = e, h === 0 && d(me)), u;
  }
  function tr() {
    var u;
    return t.charCodeAt(n) === 48 ? (u = g, n++) : (u = e, h === 0 && d(_e)), u;
  }
  function X() {
    var u;
    return u = t.charAt(n), he.test(u) ? n++ : (u = e, h === 0 && d(ye)), u;
  }
  function E() {
    var u, r;
    for (h++, u = [], r = t.charAt(n), ju.test(r) ? n++ : (r = e, h === 0 && d(Lu));r !== e; )
      u.push(r), r = t.charAt(n), ju.test(r) ? n++ : (r = e, h === 0 && d(Lu));
    return h--, r = e, h === 0 && d(we), u;
  }
  function G() {
    var u, r, s, o;
    return u = n, r = E(), t.charCodeAt(n) === 44 ? (s = c, n++) : (s = e, h === 0 && d(be)), s !== e ? (o = E(), r = [r, s, o], u = r) : (n = u, u = e), u;
  }
  function Vu() {
    var u, r, s, o;
    return u = n, r = E(), t.charCodeAt(n) === 124 ? (s = F, n++) : (s = e, h === 0 && d(xe)), s !== e ? (o = E(), r = [r, s, o], u = r) : (n = u, u = e), u;
  }
  function Xu() {
    var u, r, s, o;
    return u = n, r = E(), t.charCodeAt(n) === 46 ? (s = D, n++) : (s = e, h === 0 && d(Ru)), s !== e ? (o = E(), r = [r, s, o], u = r) : (n = u, u = e), u;
  }
  function Y() {
    var u;
    return u = t.charAt(n), Be.test(u) ? n++ : (u = e, h === 0 && d(Ie)), u;
  }
  function au() {
    var u;
    return h++, u = t.charAt(n), Ce.test(u) ? n++ : (u = e, h === 0 && d(Ne)), h--, u === e && h === 0 && d(ke), u;
  }
  function Gu() {
    var u, r, s, o;
    if (u = n, E(), r = [], s = au(), s !== e)
      for (;s !== e; )
        r.push(s), s = au();
    else
      r = e;
    return r !== e ? (s = E(), $ = n, o = at(r), o ? o = e : o = undefined, o !== e ? ($ = u, u = lt(r)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function rr() {
    var u, r, s, o;
    return u = n, E(), t.charCodeAt(n) === 91 ? (r = p, n++) : (r = e, h === 0 && d(Ou)), r !== e ? (E(), s = Ju(), s !== e ? (E(), t.charCodeAt(n) === 93 ? (o = w, n++) : (o = e, h === 0 && d(Mu)), o !== e ? (E(), $ = u, u = ct(s)) : (n = u, u = e)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function nr() {
    var u, r, s, o, B;
    return u = n, E(), t.charCodeAt(n) === 123 ? (r = P, n++) : (r = e, h === 0 && d(Pe)), r !== e ? (E(), s = Ku(), s !== e ? (E(), t.charCodeAt(n) === 125 ? (o = R, n++) : (o = e, h === 0 && d(qe)), o !== e ? (B = sr(), B === e && (B = null), E(), $ = u, u = At(s, B)) : (n = u, u = e)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function sr() {
    var u, r, s;
    return u = n, t.charCodeAt(n) === 37 ? (r = su, n++) : (r = e, h === 0 && d(je)), r !== e ? (s = H(), s !== e ? ($ = u, u = pt(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function ir() {
    var u, r, s, o;
    return u = n, E(), t.charCodeAt(n) === 60 ? (r = iu, n++) : (r = e, h === 0 && d(Se)), r !== e ? (E(), s = Ku(), s !== e ? (E(), t.charCodeAt(n) === 62 ? (o = re, n++) : (o = e, h === 0 && d(Re)), o !== e ? (E(), $ = u, u = gt(s)) : (n = u, u = e)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function H() {
    var u;
    return u = Gu(), u === e && (u = rr(), u === e && (u = nr(), u === e && (u = ir()))), u;
  }
  function Yu() {
    var u;
    return u = fr(), u === e && (u = ar(), u === e && (u = lr(), u === e && (u = cr(), u === e && (u = or(), u === e && (u = Ar(), u === e && (u = pr(), u === e && (u = gr()))))))), u;
  }
  function fr() {
    var u, r, s;
    return u = n, E(), r = t.charAt(n), De.test(r) ? n++ : (r = e, h === 0 && d(Le)), r !== e ? (s = M(), s === e && (s = null), $ = u, u = Ft(s)) : (n = u, u = e), u;
  }
  function or() {
    var u, r, s;
    return u = n, E(), t.charCodeAt(n) === 33 ? (r = ne, n++) : (r = e, h === 0 && d(Oe)), r !== e ? (s = M(), s === e && (s = null), $ = u, u = ht(s)) : (n = u, u = e), u;
  }
  function ar() {
    var u, r, s, o, B, x, j;
    return u = n, t.charCodeAt(n) === 40 ? (r = se, n++) : (r = e, h === 0 && d(Me)), r !== e ? (E(), s = tu(), s !== e ? (E(), o = G(), o !== e ? (E(), B = tu(), B !== e ? (E(), G(), E(), x = tu(), x === e && (x = null), E(), t.charCodeAt(n) === 41 ? (j = ie, n++) : (j = e, h === 0 && d(ze)), j !== e ? ($ = u, u = Bt(s, B, x)) : (n = u, u = e)) : (n = u, u = e)) : (n = u, u = e)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function lr() {
    var u, r, s;
    return u = n, t.charCodeAt(n) === 47 ? (r = fe, n++) : (r = e, h === 0 && d(Te)), r !== e ? (s = H(), s !== e ? ($ = u, u = Ct(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function cr() {
    var u, r, s;
    return u = n, t.charCodeAt(n) === 42 ? (r = oe, n++) : (r = e, h === 0 && d(Ze)), r !== e ? (s = H(), s !== e ? ($ = u, u = Dt(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function Ar() {
    var u, r, s;
    return u = n, t.charCodeAt(n) === 63 ? (r = ae, n++) : (r = e, h === 0 && d(We)), r !== e ? (s = M(), s === e && (s = null), $ = u, u = dt(s)) : (n = u, u = e), u;
  }
  function pr() {
    var u, r, s;
    return u = n, t.charCodeAt(n) === 58 ? (r = le, n++) : (r = e, h === 0 && d(Ue)), r !== e ? (s = H(), s !== e ? ($ = u, u = Et(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function gr() {
    var u, r, s;
    return u = n, t.substr(n, 2) === Eu ? (r = Eu, n += 2) : (r = e, h === 0 && d(Ve)), r !== e ? (s = H(), s !== e ? ($ = u, u = vt(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function tu() {
    var u, r, s, o;
    if (u = n, r = H(), r !== e) {
      for (s = [], o = Yu();o !== e; )
        s.push(o), o = Yu();
      $ = u, u = $t(r, s);
    } else
      n = u, u = e;
    return u;
  }
  function T() {
    var u, r, s, o;
    if (u = n, t.charCodeAt(n) === 94 ? (r = ce, n++) : (r = e, h === 0 && d(Xe)), r === e && (r = null), s = [], o = tu(), o !== e)
      for (;o !== e; )
        s.push(o), o = tu();
    else
      s = e;
    return s !== e ? ($ = u, u = mt(r, s)) : (n = u, u = e), u;
  }
  function Hu() {
    var u, r, s, o, B;
    if (u = n, r = [], s = n, o = G(), o !== e ? (B = T(), B !== e ? s = B : (n = s, s = e)) : (n = s, s = e), s !== e)
      for (;s !== e; )
        r.push(s), s = n, o = G(), o !== e ? (B = T(), B !== e ? s = B : (n = s, s = e)) : (n = s, s = e);
    else
      r = e;
    return r !== e && ($ = u, r = _t(r)), u = r, u;
  }
  function Fr() {
    var u, r, s, o, B;
    if (u = n, r = [], s = n, o = Vu(), o !== e ? (B = T(), B !== e ? s = B : (n = s, s = e)) : (n = s, s = e), s !== e)
      for (;s !== e; )
        r.push(s), s = n, o = Vu(), o !== e ? (B = T(), B !== e ? s = B : (n = s, s = e)) : (n = s, s = e);
    else
      r = e;
    return r !== e && ($ = u, r = yt(r)), u = r, u;
  }
  function hr() {
    var u, r, s, o, B;
    if (u = n, r = [], s = n, o = Xu(), o !== e ? (B = T(), B !== e ? s = B : (n = s, s = e)) : (n = s, s = e), s !== e)
      for (;s !== e; )
        r.push(s), s = n, o = Xu(), o !== e ? (B = T(), B !== e ? s = B : (n = s, s = e)) : (n = s, s = e);
    else
      r = e;
    return r !== e && ($ = u, r = wt(r)), u = r, u;
  }
  function Ju() {
    var u, r, s;
    return u = n, r = T(), r !== e ? (s = Hu(), s === e && (s = Fr(), s === e && (s = hr())), s === e && (s = null), $ = u, u = bt(r, s)) : (n = u, u = e), u;
  }
  function Ku() {
    var u, r, s;
    return u = n, r = T(), r !== e ? (s = Hu(), s === e && (s = null), $ = u, u = xt(r, s)) : (n = u, u = e), u;
  }
  function Br() {
    var u, r, s, o;
    return u = n, E(), r = Y(), r !== e ? (E(), s = Ju(), s !== e ? (E(), o = Y(), o !== e ? ($ = u, u = It(s)) : (n = u, u = e)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function Cr() {
    var u;
    return u = yr(), u === e && (u = vr(), u === e && (u = _r(), u === e && (u = dr(), u === e && (u = Er(), u === e && (u = Dr(), u === e && (u = mr(), u === e && (u = $r()))))))), u;
  }
  function Dr() {
    var u, r, s;
    return u = n, t.substr(n, 6) === vu ? (r = vu, n += 6) : (r = e, h === 0 && d(Ge)), r !== e ? (E(), s = J(), s !== e ? ($ = u, u = kt(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function dr() {
    var u, r, s, o, B;
    return u = n, t.substr(n, 6) === $u ? (r = $u, n += 6) : (r = e, h === 0 && d(Ye)), r !== e ? (E(), s = Y(), s !== e ? (o = Gu(), o !== e ? (B = Y(), B !== e ? ($ = u, u = Nt(o)) : (n = u, u = e)) : (n = u, u = e)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function Er() {
    var u, r, s, o;
    return u = n, t.substr(n, 6) === mu ? (r = mu, n += 6) : (r = e, h === 0 && d(He)), r !== e ? (E(), s = ou(), s !== e ? (E(), o = ou(), o !== e ? (E(), ou(), $ = u, u = Pt(s, o)) : (n = u, u = e)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function vr() {
    var u, r, s;
    return u = n, t.substr(n, 4) === _u ? (r = _u, n += 4) : (r = e, h === 0 && d(Je)), r !== e ? (E(), s = M(), s !== e ? ($ = u, u = qt(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function $r() {
    var u, r, s;
    return u = n, t.substr(n, 4) === yu ? (r = yu, n += 4) : (r = e, h === 0 && d(Ke)), r !== e ? (E(), s = M(), s !== e ? ($ = u, u = jt(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function mr() {
    var u, r, s;
    return u = n, t.substr(n, 4) === wu ? (r = wu, n += 4) : (r = e, h === 0 && d(Qe)), r !== e ? (E(), s = M(), s !== e ? ($ = u, u = St(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function _r() {
    var u, r, s;
    return u = n, t.substr(n, 4) === bu ? (r = bu, n += 4) : (r = e, h === 0 && d(ut)), r !== e ? (E(), s = M(), s !== e ? ($ = u, u = Rt(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function yr() {
    var u, r, s, o, B;
    if (u = n, t.substr(n, 5) === xu ? (r = xu, n += 5) : (r = e, h === 0 && d(et)), r !== e)
      if (E(), s = Y(), s !== e) {
        if (o = [], B = au(), B !== e)
          for (;B !== e; )
            o.push(B), B = au();
        else
          o = e;
        o !== e ? (B = Y(), B !== e ? ($ = u, u = Lt(o)) : (n = u, u = e)) : (n = u, u = e);
      } else
        n = u, u = e;
    else
      n = u, u = e;
    return u;
  }
  function Fu() {
    var u, r, s, o;
    if (u = n, t.substr(n, 2) === Iu ? (r = Iu, n += 2) : (r = e, h === 0 && d(tt)), r !== e) {
      for (s = [], o = t.charAt(n), Su.test(o) ? n++ : (o = e, h === 0 && d(zu));o !== e; )
        s.push(o), o = t.charAt(n), Su.test(o) ? n++ : (o = e, h === 0 && d(zu));
      r = [r, s], u = r;
    } else
      n = u, u = e;
    return u;
  }
  function wr() {
    var u, r, s, o, B, x, j, K;
    if (u = n, t.substr(n, 3) === ku ? (r = ku, n += 3) : (r = e, h === 0 && d(rt)), r !== e)
      if (E(), t.charCodeAt(n) === 91 ? (s = p, n++) : (s = e, h === 0 && d(Ou)), s !== e)
        if (E(), o = J(), o !== e) {
          for (B = [], x = n, j = G(), j !== e ? (K = J(), K !== e ? ($ = x, x = Tu(o, K)) : (n = x, x = e)) : (n = x, x = e);x !== e; )
            B.push(x), x = n, j = G(), j !== e ? (K = J(), K !== e ? ($ = x, x = Tu(o, K)) : (n = x, x = e)) : (n = x, x = e);
          x = E(), t.charCodeAt(n) === 93 ? (j = w, n++) : (j = e, h === 0 && d(Mu)), j !== e ? ($ = u, u = Ot(o, B)) : (n = u, u = e);
        } else
          n = u, u = e;
      else
        n = u, u = e;
    else
      n = u, u = e;
    return u;
  }
  function br() {
    var u;
    return u = wr(), u === e && (u = Br()), u;
  }
  function J() {
    var u, r, s, o, B;
    if (u = n, r = br(), r !== e) {
      for (E(), s = [], o = Fu();o !== e; )
        s.push(o), o = Fu();
      $ = u, u = Mt(r);
    } else
      n = u, u = e;
    return u === e && (u = n, r = Cr(), r !== e ? (E(), t.charCodeAt(n) === 36 ? (s = Ae, n++) : (s = e, h === 0 && d(nt)), s !== e ? (o = E(), B = J(), B !== e ? ($ = u, u = zt(r, B)) : (n = u, u = e)) : (n = u, u = e)) : (n = u, u = e)), u;
  }
  function xr() {
    var u, r;
    return u = n, r = J(), r !== e && ($ = u, r = Tt(r)), u = r, u === e && (u = Fu()), u;
  }
  function Ir() {
    var u;
    return u = xr(), u;
  }
  function kr() {
    var u, r;
    return u = n, E(), r = Nr(), r === e && (r = Pr(), r === e && (r = qr())), r !== e ? (E(), $ = u, u = Zt(r)) : (n = u, u = e), u;
  }
  function Nr() {
    var u, r, s;
    return u = n, t.substr(n, 6) === Nu ? (r = Nu, n += 6) : (r = e, h === 0 && d(st)), r !== e ? (E(), s = M(), s !== e ? ($ = u, u = Wt(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function Pr() {
    var u, r, s;
    return u = n, t.substr(n, 6) === Pu ? (r = Pu, n += 6) : (r = e, h === 0 && d(it)), r !== e ? (E(), s = M(), s !== e ? ($ = u, u = Ut(s)) : (n = u, u = e)) : (n = u, u = e), u;
  }
  function qr() {
    var u, r;
    return u = n, t.substr(n, 4) === qu ? (r = qu, n += 4) : (r = e, h === 0 && d(ft)), r !== e && ($ = u, r = Vt()), u = r, u;
  }
  function jr() {
    var u;
    return u = Ir(), u === e && (u = kr()), u;
  }
  var Sr = function(u) {
    this.type_ = "atom", this.source_ = u, this.location_ = Zu();
  }, lu = function(u, r, s, o) {
    this.type_ = "pattern", this.arguments_ = { alignment: r, _steps: o }, s !== undefined && (this.arguments_.seed = s), this.source_ = u;
  }, Rr = function(u, r, s) {
    this.type_ = u, this.arguments_ = r, this.source_ = s;
  }, Lr = function(u, r) {
    this.type_ = "element", this.source_ = u, this.options_ = r, this.location_ = Zu();
  }, hu = function(u, r) {
    this.type_ = "command", this.name_ = u, this.options_ = r;
  }, Bu = 0;
  if (eu = a(), i.peg$library)
    return {
      peg$result: eu,
      peg$currPos: n,
      peg$FAILED: e,
      peg$maxFailExpected: fu,
      peg$maxFailPos: q
    };
  if (eu !== e && n === t.length)
    return eu;
  throw eu !== e && n < t.length && d(Gt()), Yt(fu, q < t.length ? t.charAt(q) : null, q < t.length ? gu(q, q + 1) : gu(q, q));
}
function z2(t, i) {
  try {
    t = BigInt(t);
  } catch {
    throw Z3();
  }
  return t * i;
}
function S3(t) {
  return typeof t == "bigint" ? t : Math.floor(t);
}
function I(t, i) {
  if (i === C3)
    throw du2();
  const e = Object.create(b.prototype);
  e.s = t < C3 ? -m2 : m2, t = t < C3 ? -t : t;
  const f = U3(t, i);
  return e.n = t / f, e.d = i / f, e;
}
function Q3(t) {
  const i = {};
  let e = t, f = ru2, l = Du2 - m2;
  for (;l <= e; ) {
    for (;e % f === C3; )
      e /= f, i[f] = (i[f] || C3) + m2;
    l += m2 + ru2 * f++;
  }
  return e !== t ? e > 1 && (i[e] = (i[e] || C3) + m2) : i[t] = (i[t] || C3) + m2, i;
}
function Tr2(t, i, e) {
  let f = m2;
  for (;i > C3; t = t * t % e, i >>= m2)
    i & m2 && (f = f * t % e);
  return f;
}
function Zr2(t, i) {
  for (;i % ru2 === C3; i /= ru2)
    ;
  for (;i % Du2 === C3; i /= Du2)
    ;
  if (i === m2)
    return C3;
  let e = N3 % i, f = 1;
  for (;e !== m2; f++)
    if (e = e * N3 % i, f > zr2)
      return C3;
  return BigInt(f);
}
function Wr2(t, i, e) {
  let f = m2, l = Tr2(N3, e, i);
  for (let a = 0;a < 300; a++) {
    if (f === l)
      return BigInt(a);
    f = f * N3 % i, l = l * N3 % i;
  }
  return 0;
}
function U3(t, i) {
  if (!t)
    return i;
  if (!i)
    return t;
  for (;; ) {
    if (t %= i, !t)
      return i;
    if (i %= t, !i)
      return t;
  }
}
function b(t, i) {
  if (k2(t, i), this instanceof b)
    t = U3(A2.d, A2.n), this.s = A2.s, this.n = A2.n / t, this.d = A2.d / t;
  else
    return I(A2.s * A2.n, A2.d);
}

class L3 {
  constructor(i, e) {
    this.begin = W3(i), this.end = W3(e);
  }
  get spanCycles() {
    const i = [];
    var e = this.begin;
    const f = this.end, l = f.sam();
    if (e.equals(f))
      return [new L3(e, f)];
    for (;f.gt(e); ) {
      if (e.sam().equals(l)) {
        i.push(new L3(e, this.end));
        break;
      }
      const a = e.nextSam();
      i.push(new L3(e, a)), e = a;
    }
    return i;
  }
  get duration() {
    return this.end.sub(this.begin);
  }
  cycleArc() {
    const i = this.begin.cyclePos(), e = i.add(this.duration);
    return new L3(i, e);
  }
  withTime(i) {
    return new L3(i(this.begin), i(this.end));
  }
  withEnd(i) {
    return new L3(this.begin, i(this.end));
  }
  withCycle(i) {
    const e = this.begin.sam(), f = e.add(i(this.begin.sub(e))), l = e.add(i(this.end.sub(e)));
    return new L3(f, l);
  }
  intersection(i) {
    const e = this.begin.max(i.begin), f = this.end.min(i.end);
    if (!e.gt(f) && !(e.equals(f) && (e.equals(this.end) && this.begin.lt(this.end) || e.equals(i.end) && i.begin.lt(i.end))))
      return new L3(e, f);
  }
  intersection_e(i) {
    const e = this.intersection(i);
    if (e == null)
      throw "TimeSpans do not intersect";
    return e;
  }
  midpoint() {
    return this.begin.add(this.duration.div(W3(2)));
  }
  equals(i) {
    return this.begin.equals(i.begin) && this.end.equals(i.end);
  }
  show() {
    return this.begin.show() + " \u2192 " + this.end.show();
  }
}
function nu2(t, i, e, f = 0) {
  e?.(t);
  const l = (a) => nu2(a, i, e, f);
  switch (t.type_) {
    case "pattern": {
      const a = t.source_.map((c) => l(c)).map(Vr2(t, l)), D = t.arguments_.alignment, v = a.filter((c) => c.__steps_source);
      let g;
      switch (D) {
        case "stack": {
          g = z(...a), v.length && (g._steps = cu2(...v.map((c) => W3(c._steps))));
          break;
        }
        case "polymeter_slowcat": {
          g = z(...a.map((c) => c._slow(c.__weight))), v.length && (g._steps = cu2(...v.map((c) => W3(c._steps))));
          break;
        }
        case "polymeter": {
          const c = t.arguments_.stepsPerCycle ? l(t.arguments_.stepsPerCycle).fmap((p) => m(p)) : C2(m(a.length > 0 ? a[0].__weight : 1)), F = a.map((p) => p.fast(c.fmap((w) => w.div(p.__weight))));
          g = z(...F);
          break;
        }
        case "rand": {
          g = Pe2(W2.early(ue3 * t.arguments_.seed).segment(1), a), v.length && (g._steps = cu2(...v.map((c) => W3(c._steps))));
          break;
        }
        case "feet": {
          g = N2(...a);
          break;
        }
        default: {
          if (t.source_.some((F) => !!F.options_?.weight)) {
            const F = t.source_.reduce((p, w) => p.add(w.options_?.weight || m(1)), m(0));
            g = ns(...t.source_.map((p, w) => [p.options_?.weight || m(1), a[w]])), g.__weight = F, g._steps = F, v.length && (g._steps = g._steps.mul(cu2(...v.map((p) => W3(p._steps)))));
          } else
            g = Q2(...a), g._steps = a.length;
          t.arguments_._steps && (g.__steps_source = true);
        }
      }
      return v.length && (g.__steps_source = true), g;
    }
    case "element":
      return l(t.source_);
    case "atom": {
      if (t.source_ === "~" || t.source_ === "-")
        return q2;
      if (!t.location_)
        return console.warn("no location for", t), t.source_;
      const a = isNaN(Number(t.source_)) ? t.source_ : Number(t.source_);
      if (f === -1)
        return C2(a);
      const [D, v] = ee3(i, t, f);
      return C2(a).withLoc(D, v);
    }
    case "stretch":
      return l(t.source_).slow(l(t.arguments_.amount));
    default:
      return console.warn(`node type "${t.type_}" not implemented -> returning silence`), q2;
  }
}
function Kr2(t) {
  return typeof t == "string" ? te3(t) : d(t);
}
function Qr2() {
  mh(te3);
}
var Gr2, C3, m2, ru2, Du2, N3, zr2 = 2000, A2, k2 = function(t, i) {
  let e = C3, f = m2, l = m2;
  if (t != null)
    if (i !== undefined) {
      if (typeof t == "bigint")
        e = t;
      else {
        if (isNaN(t))
          throw Z3();
        if (t % 1 !== 0)
          throw Qu2();
        e = BigInt(t);
      }
      if (typeof i == "bigint")
        f = i;
      else {
        if (isNaN(i))
          throw Z3();
        if (i % 1 !== 0)
          throw Qu2();
        f = BigInt(i);
      }
      l = e * f;
    } else if (typeof t == "object") {
      if ("d" in t && "n" in t)
        e = BigInt(t.n), f = BigInt(t.d), "s" in t && (e *= BigInt(t.s));
      else if (0 in t)
        e = BigInt(t[0]), 1 in t && (f = BigInt(t[1]));
      else if (typeof t == "bigint")
        e = t;
      else
        throw Z3();
      l = e * f;
    } else if (typeof t == "number") {
      if (isNaN(t))
        throw Z3();
      if (t < 0 && (l = -m2, t = -t), t % 1 === 0)
        e = BigInt(t);
      else if (t > 0) {
        let a = 1, D = 0, v = 1, g = 1, c = 1, F = 1e7;
        for (t >= 1 && (a = 10 ** Math.floor(1 + Math.log10(t)), t /= a);v <= F && c <= F; ) {
          let p = (D + g) / (v + c);
          if (t === p) {
            v + c <= F ? (e = D + g, f = v + c) : c > v ? (e = g, f = c) : (e = D, f = v);
            break;
          } else
            t > p ? (D += g, v += c) : (g += D, c += v), v > F ? (e = g, f = c) : (e = D, f = v);
        }
        e = BigInt(e) * BigInt(a), f = BigInt(f);
      }
    } else if (typeof t == "string") {
      let a = 0, D = C3, v = C3, g = C3, c = m2, F = m2, p = t.replace(/_/g, "").match(/\d+|./g);
      if (p === null)
        throw Z3();
      if (p[a] === "-" ? (l = -m2, a++) : p[a] === "+" && a++, p.length === a + 1 ? v = z2(p[a++], l) : p[a + 1] === "." || p[a] === "." ? (p[a] !== "." && (D = z2(p[a++], l)), a++, (a + 1 === p.length || p[a + 1] === "(" && p[a + 3] === ")" || p[a + 1] === "'" && p[a + 3] === "'") && (v = z2(p[a], l), c = N3 ** BigInt(p[a].length), a++), (p[a] === "(" && p[a + 2] === ")" || p[a] === "'" && p[a + 2] === "'") && (g = z2(p[a + 1], l), F = N3 ** BigInt(p[a + 1].length) - m2, a += 3)) : p[a + 1] === "/" || p[a + 1] === ":" ? (v = z2(p[a], l), c = z2(p[a + 2], m2), a += 3) : p[a + 3] === "/" && p[a + 1] === " " && (D = z2(p[a], l), v = z2(p[a + 2], l), c = z2(p[a + 4], m2), a += 5), p.length <= a)
        f = c * F, l = e = g + f * D + F * v;
      else
        throw Z3();
    } else if (typeof t == "bigint")
      e = t, l = t, f = m2;
    else
      throw Z3();
  if (f === C3)
    throw du2();
  A2.s = l < C3 ? -m2 : m2, A2.n = e < C3 ? -e : e, A2.d = f < C3 ? -f : f;
}, du2 = function() {
  return new Error("Division by Zero");
}, Z3 = function() {
  return new Error("Invalid argument");
}, Qu2 = function() {
  return new Error("Parameters must be integer");
}, Ur2 = (t) => t.filter((i) => i != null), W3 = (t) => b(t), cu2 = (...t) => {
  if (t = Ur2(t), t.length === 0)
    return;
  const i = t.pop();
  return t.reduce((e, f) => e === undefined || f === undefined ? undefined : e.lcm(f), i);
}, ue3 = 0.0003, Vr2 = (t, i) => (e, f) => {
  const D = t.source_[f].options_?.ops, v = e.__steps_source;
  if (D)
    for (const g of D)
      switch (g.type_) {
        case "stretch": {
          const c = ["fast", "slow"], { type: F, amount: p } = g.arguments_;
          if (!c.includes(F))
            throw new Error(`mini: stretch: type must be one of ${c.join("|")} but got ${F}`);
          e = d(e)[F](i(p));
          break;
        }
        case "replicate": {
          const { amount: c } = g.arguments_;
          e = d(e), e = e._repeatCycles(c)._fast(c);
          break;
        }
        case "bjorklund": {
          g.arguments_.rotation ? e = e.euclidRot(i(g.arguments_.pulse), i(g.arguments_.step), i(g.arguments_.rotation)) : e = e.euclid(i(g.arguments_.pulse), i(g.arguments_.step));
          break;
        }
        case "degradeBy": {
          e = d(e)._degradeByWith(W2.early(ue3 * g.arguments_.seed), g.arguments_.amount ?? 0.5);
          break;
        }
        case "tail": {
          const c = i(g.arguments_.element);
          e = e.fmap((F) => (p) => Array.isArray(F) ? [...F, p] : [F, p]).appLeft(c);
          break;
        }
        case "range": {
          const c = i(g.arguments_.element);
          e = d(e);
          const F = (w, P, R = 1) => Array.from({ length: Math.abs(P - w) / R + 1 }, (su, iu) => w < P ? w + iu * R : w - iu * R);
          e = ((w, P) => w.squeezeBind((R) => P.bind((su) => N2(...F(R, su)))))(e, c);
          break;
        }
        default:
          console.warn(`operator "${g.type_}" not implemented`);
      }
  return e.__steps_source = e.__steps_source || v, e;
}, ee3 = (t, i, e = 0) => {
  const { start: f, end: l } = i.location_, a = t?.split("").slice(f.offset, l.offset).join(""), [D = 0, v = 0] = a ? a.split(i.source_).map((g) => g.split("").filter((c) => c === " ").length) : [];
  return [f.offset + D + e, l.offset - v + e];
}, Au2 = (t, i = 0, e = t) => {
  try {
    return Mr2(t);
  } catch (f) {
    const l = [f.location.start.offset + i, f.location.end.offset + i], a = e.slice(0, l[0]).split(`
`).length;
    throw new Error(`[mini] parse error at line ${a}: ${f.message}`);
  }
}, Xr2 = (t, i, e) => {
  const f = Au2(t, i, e);
  let l = [];
  return nu2(f, t, (a) => {
    a.type_ === "atom" && l.push(a);
  }, -1), l;
}, Yr2 = (t, i = 0, e) => Xr2(t, i, e).map((f) => ee3(t, f, i)), te3 = (...t) => {
  const i = t.map((e) => {
    const f = `"${e}"`, l = Au2(f);
    return nu2(l, f);
  });
  return Q2(...i);
}, Hr2 = (t, i) => {
  const e = `"${t}"`, f = Au2(e);
  return nu2(f, e, null, i);
}, Jr2 = (t) => {
  const i = Au2(t);
  return nu2(i, t);
};
var init_dist3 = __esm(() => {
  init_dist2();
  Or2(uu2, Error);
  uu2.prototype.format = function(t) {
    var i = "Error: " + this.message;
    if (this.location) {
      var e = null, f;
      for (f = 0;f < t.length; f++)
        if (t[f].source === this.location.source) {
          e = t[f].text.split(/\r\n|\n|\r/g);
          break;
        }
      var l = this.location.start, a = this.location.source && typeof this.location.source.offset == "function" ? this.location.source.offset(l) : l, D = this.location.source + ":" + a.line + ":" + a.column;
      if (e) {
        var v = this.location.end, g = Cu2("", a.line.toString().length, " "), c = e[l.line - 1], F = l.line === v.line ? v.column : c.length + 1, p = F - l.column || 1;
        i += `
 --> ` + D + `
` + g + ` |
` + a.line + " | " + c + `
` + g + " | " + Cu2("", l.column - 1, " ") + Cu2("", p, "^");
      } else
        i += `
 at ` + D;
    }
    return i;
  };
  uu2.buildMessage = function(t, i) {
    var e = {
      literal: function(c) {
        return '"' + l(c.text) + '"';
      },
      class: function(c) {
        var F = c.parts.map(function(p) {
          return Array.isArray(p) ? a(p[0]) + "-" + a(p[1]) : a(p);
        });
        return "[" + (c.inverted ? "^" : "") + F.join("") + "]";
      },
      any: function() {
        return "any character";
      },
      end: function() {
        return "end of input";
      },
      other: function(c) {
        return c.description;
      }
    };
    function f(c) {
      return c.charCodeAt(0).toString(16).toUpperCase();
    }
    function l(c) {
      return c.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(F) {
        return "\\x0" + f(F);
      }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(F) {
        return "\\x" + f(F);
      });
    }
    function a(c) {
      return c.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(F) {
        return "\\x0" + f(F);
      }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(F) {
        return "\\x" + f(F);
      });
    }
    function D(c) {
      return e[c.type](c);
    }
    function v(c) {
      var F = c.map(D), p, w;
      if (F.sort(), F.length > 0) {
        for (p = 1, w = 1;p < F.length; p++)
          F[p - 1] !== F[p] && (F[w] = F[p], w++);
        F.length = w;
      }
      switch (F.length) {
        case 1:
          return F[0];
        case 2:
          return F[0] + " or " + F[1];
        default:
          return F.slice(0, -1).join(", ") + ", or " + F[F.length - 1];
      }
    }
    function g(c) {
      return c ? '"' + l(c) + '"' : "end of input";
    }
    return "Expected " + v(t) + " but " + g(i) + " found.";
  };
  Gr2 = [
    "start"
  ];
  typeof BigInt > "u" && (BigInt = function(t) {
    if (isNaN(t))
      throw new Error("");
    return t;
  });
  C3 = BigInt(0);
  m2 = BigInt(1);
  ru2 = BigInt(2);
  Du2 = BigInt(5);
  N3 = BigInt(10);
  A2 = {
    s: m2,
    n: C3,
    d: m2
  };
  b.prototype = {
    s: m2,
    n: C3,
    d: m2,
    abs: function() {
      return I(this.n, this.d);
    },
    neg: function() {
      return I(-this.s * this.n, this.d);
    },
    add: function(t, i) {
      return k2(t, i), I(this.s * this.n * A2.d + A2.s * this.d * A2.n, this.d * A2.d);
    },
    sub: function(t, i) {
      return k2(t, i), I(this.s * this.n * A2.d - A2.s * this.d * A2.n, this.d * A2.d);
    },
    mul: function(t, i) {
      return k2(t, i), I(this.s * A2.s * this.n * A2.n, this.d * A2.d);
    },
    div: function(t, i) {
      return k2(t, i), I(this.s * A2.s * this.n * A2.d, this.d * A2.n);
    },
    clone: function() {
      return I(this.s * this.n, this.d);
    },
    mod: function(t, i) {
      if (t === undefined)
        return I(this.s * this.n % this.d, m2);
      if (k2(t, i), C3 === A2.n * this.d)
        throw du2();
      return I(this.s * (A2.d * this.n) % (A2.n * this.d), A2.d * this.d);
    },
    gcd: function(t, i) {
      return k2(t, i), I(U3(A2.n, this.n) * U3(A2.d, this.d), A2.d * this.d);
    },
    lcm: function(t, i) {
      return k2(t, i), A2.n === C3 && this.n === C3 ? I(C3, m2) : I(A2.n * this.n, U3(A2.n, this.n) * U3(A2.d, this.d));
    },
    inverse: function() {
      return I(this.s * this.d, this.n);
    },
    pow: function(t, i) {
      if (k2(t, i), A2.d === m2)
        return A2.s < C3 ? I((this.s * this.d) ** A2.n, this.n ** A2.n) : I((this.s * this.n) ** A2.n, this.d ** A2.n);
      if (this.s < C3)
        return null;
      let e = Q3(this.n), f = Q3(this.d), l = m2, a = m2;
      for (let D in e)
        if (D !== "1") {
          if (D === "0") {
            l = C3;
            break;
          }
          if (e[D] *= A2.n, e[D] % A2.d === C3)
            e[D] /= A2.d;
          else
            return null;
          l *= BigInt(D) ** e[D];
        }
      for (let D in f)
        if (D !== "1") {
          if (f[D] *= A2.n, f[D] % A2.d === C3)
            f[D] /= A2.d;
          else
            return null;
          a *= BigInt(D) ** f[D];
        }
      return A2.s < C3 ? I(a, l) : I(l, a);
    },
    log: function(t, i) {
      if (k2(t, i), this.s <= C3 || A2.s <= C3)
        return null;
      const e = {}, f = Q3(A2.n), l = Q3(A2.d), a = Q3(this.n), D = Q3(this.d);
      for (const c in l)
        f[c] = (f[c] || C3) - l[c];
      for (const c in D)
        a[c] = (a[c] || C3) - D[c];
      for (const c in f)
        c !== "1" && (e[c] = true);
      for (const c in a)
        c !== "1" && (e[c] = true);
      let v = null, g = null;
      for (const c in e) {
        const F = f[c] || C3, p = a[c] || C3;
        if (F === C3) {
          if (p !== C3)
            return null;
          continue;
        }
        let w = p, P = F;
        const R = U3(w, P);
        if (w /= R, P /= R, v === null && g === null)
          v = w, g = P;
        else if (w * g !== v * P)
          return null;
      }
      return v !== null && g !== null ? I(v, g) : null;
    },
    equals: function(t, i) {
      return k2(t, i), this.s * this.n * A2.d === A2.s * A2.n * this.d;
    },
    lt: function(t, i) {
      return k2(t, i), this.s * this.n * A2.d < A2.s * A2.n * this.d;
    },
    lte: function(t, i) {
      return k2(t, i), this.s * this.n * A2.d <= A2.s * A2.n * this.d;
    },
    gt: function(t, i) {
      return k2(t, i), this.s * this.n * A2.d > A2.s * A2.n * this.d;
    },
    gte: function(t, i) {
      return k2(t, i), this.s * this.n * A2.d >= A2.s * A2.n * this.d;
    },
    compare: function(t, i) {
      k2(t, i);
      let e = this.s * this.n * A2.d - A2.s * A2.n * this.d;
      return (C3 < e) - (e < C3);
    },
    ceil: function(t) {
      return t = N3 ** BigInt(t || 0), I(S3(this.s * t * this.n / this.d) + (t * this.n % this.d > C3 && this.s >= C3 ? m2 : C3), t);
    },
    floor: function(t) {
      return t = N3 ** BigInt(t || 0), I(S3(this.s * t * this.n / this.d) - (t * this.n % this.d > C3 && this.s < C3 ? m2 : C3), t);
    },
    round: function(t) {
      return t = N3 ** BigInt(t || 0), I(S3(this.s * t * this.n / this.d) + this.s * ((this.s >= C3 ? m2 : C3) + ru2 * (t * this.n % this.d) > this.d ? m2 : C3), t);
    },
    roundTo: function(t, i) {
      k2(t, i);
      const e = this.n * A2.d, f = this.d * A2.n, l = e % f;
      let a = S3(e / f);
      return l + l >= f && a++, I(this.s * a * A2.n, A2.d);
    },
    divisible: function(t, i) {
      return k2(t, i), !(!(A2.n * this.d) || this.n * A2.d % (A2.n * this.d));
    },
    valueOf: function() {
      return Number(this.s * this.n) / Number(this.d);
    },
    toString: function(t) {
      let i = this.n, e = this.d;
      t = t || 15;
      let f = Zr2(i, e), l = Wr2(i, e, f), a = this.s < C3 ? "-" : "";
      if (a += S3(i / e), i %= e, i *= N3, i && (a += "."), f) {
        for (let D = l;D--; )
          a += S3(i / e), i %= e, i *= N3;
        a += "(";
        for (let D = f;D--; )
          a += S3(i / e), i %= e, i *= N3;
        a += ")";
      } else
        for (let D = t;i && D--; )
          a += S3(i / e), i %= e, i *= N3;
      return a;
    },
    toFraction: function(t) {
      let i = this.n, e = this.d, f = this.s < C3 ? "-" : "";
      if (e === m2)
        f += i;
      else {
        let l = S3(i / e);
        t && l > C3 && (f += l, f += " ", i %= e), f += i, f += "/", f += e;
      }
      return f;
    },
    toLatex: function(t) {
      let i = this.n, e = this.d, f = this.s < C3 ? "-" : "";
      if (e === m2)
        f += i;
      else {
        let l = S3(i / e);
        t && l > C3 && (f += l, i %= e), f += "\\frac{", f += i, f += "}{", f += e, f += "}";
      }
      return f;
    },
    toContinued: function() {
      let t = this.n, i = this.d, e = [];
      do {
        e.push(S3(t / i));
        let f = t % i;
        t = i, i = f;
      } while (t !== m2);
      return e;
    },
    simplify: function(t) {
      const i = BigInt(1 / (t || 0.001) | 0), e = this.abs(), f = e.toContinued();
      for (let l = 1;l < f.length; l++) {
        let a = I(f[l - 1], m2);
        for (let v = l - 2;v >= 0; v--)
          a = a.inverse().add(f[v]);
        let D = a.sub(e);
        if (D.n * i < D.d)
          return a.mul(this.s);
      }
      return this;
    }
  };
  b.prototype.sam = function() {
    return this.floor();
  };
  b.prototype.nextSam = function() {
    return this.sam().add(1);
  };
  b.prototype.wholeCycle = function() {
    return new L3(this.sam(), this.nextSam());
  };
  b.prototype.cyclePos = function() {
    return this.sub(this.sam());
  };
  b.prototype.lt = function(t) {
    return this.compare(t) < 0;
  };
  b.prototype.gt = function(t) {
    return this.compare(t) > 0;
  };
  b.prototype.lte = function(t) {
    return this.compare(t) <= 0;
  };
  b.prototype.gte = function(t) {
    return this.compare(t) >= 0;
  };
  b.prototype.eq = function(t) {
    return this.compare(t) == 0;
  };
  b.prototype.ne = function(t) {
    return this.compare(t) != 0;
  };
  b.prototype.max = function(t) {
    return this.gt(t) ? this : t;
  };
  b.prototype.maximum = function(...t) {
    return t = t.map((i) => new b(i)), t.reduce((i, e) => e.max(i), this);
  };
  b.prototype.min = function(t) {
    return this.lt(t) ? this : t;
  };
  b.prototype.mulmaybe = function(t) {
    return t !== undefined ? this.mul(t) : undefined;
  };
  b.prototype.divmaybe = function(t) {
    return t !== undefined ? this.div(t) : undefined;
  };
  b.prototype.addmaybe = function(t) {
    return t !== undefined ? this.add(t) : undefined;
  };
  b.prototype.submaybe = function(t) {
    return t !== undefined ? this.sub(t) : undefined;
  };
  b.prototype.show = function() {
    return this.s * this.n + "/" + this.d;
  };
  b.prototype.or = function(t) {
    return this.eq(0) ? t : this;
  };
  W3._original = b;
});

// node_modules/acorn/dist/acorn.mjs
function isInAstralSet(code, set) {
  var pos = 65536;
  for (var i = 0;i < set.length; i += 2) {
    pos += set[i];
    if (pos > code) {
      return false;
    }
    pos += set[i + 1];
    if (pos >= code) {
      return true;
    }
  }
  return false;
}
function isIdentifierStart(code, astral) {
  if (code < 65) {
    return code === 36;
  }
  if (code < 91) {
    return true;
  }
  if (code < 97) {
    return code === 95;
  }
  if (code < 123) {
    return true;
  }
  if (code <= 65535) {
    return code >= 170 && nonASCIIidentifierStart.test(String.fromCharCode(code));
  }
  if (astral === false) {
    return false;
  }
  return isInAstralSet(code, astralIdentifierStartCodes);
}
function isIdentifierChar(code, astral) {
  if (code < 48) {
    return code === 36;
  }
  if (code < 58) {
    return true;
  }
  if (code < 65) {
    return false;
  }
  if (code < 91) {
    return true;
  }
  if (code < 97) {
    return code === 95;
  }
  if (code < 123) {
    return true;
  }
  if (code <= 65535) {
    return code >= 170 && nonASCIIidentifier.test(String.fromCharCode(code));
  }
  if (astral === false) {
    return false;
  }
  return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
}
function binop(name, prec) {
  return new TokenType(name, { beforeExpr: true, binop: prec });
}
function kw2(name, options) {
  if (options === undefined)
    options = {};
  options.keyword = name;
  return keywords[name] = new TokenType(name, options);
}
function isNewLine(code) {
  return code === 10 || code === 13 || code === 8232 || code === 8233;
}
function nextLineBreak(code, from, end) {
  if (end === undefined)
    end = code.length;
  for (var i = from;i < end; i++) {
    var next = code.charCodeAt(i);
    if (isNewLine(next)) {
      return i < end - 1 && next === 13 && code.charCodeAt(i + 1) === 10 ? i + 2 : i + 1;
    }
  }
  return -1;
}
function wordsRegexp(words) {
  return regexpCache[words] || (regexpCache[words] = new RegExp("^(?:" + words.replace(/ /g, "|") + ")$"));
}
function codePointToString(code) {
  if (code <= 65535) {
    return String.fromCharCode(code);
  }
  code -= 65536;
  return String.fromCharCode((code >> 10) + 55296, (code & 1023) + 56320);
}
function getLineInfo(input, offset) {
  for (var line = 1, cur = 0;; ) {
    var nextBreak = nextLineBreak(input, cur, offset);
    if (nextBreak < 0) {
      return new Position(line, offset - cur);
    }
    ++line;
    cur = nextBreak;
  }
}
function getOptions(opts) {
  var options = {};
  for (var opt in defaultOptions) {
    options[opt] = opts && hasOwn(opts, opt) ? opts[opt] : defaultOptions[opt];
  }
  if (options.ecmaVersion === "latest") {
    options.ecmaVersion = 1e8;
  } else if (options.ecmaVersion == null) {
    if (!warnedAboutEcmaVersion && typeof console === "object" && console.warn) {
      warnedAboutEcmaVersion = true;
      console.warn(`Since Acorn 8.0.0, options.ecmaVersion is required.
Defaulting to 2020, but this will stop working in the future.`);
    }
    options.ecmaVersion = 11;
  } else if (options.ecmaVersion >= 2015) {
    options.ecmaVersion -= 2009;
  }
  if (options.allowReserved == null) {
    options.allowReserved = options.ecmaVersion < 5;
  }
  if (!opts || opts.allowHashBang == null) {
    options.allowHashBang = options.ecmaVersion >= 14;
  }
  if (isArray(options.onToken)) {
    var tokens = options.onToken;
    options.onToken = function(token) {
      return tokens.push(token);
    };
  }
  if (isArray(options.onComment)) {
    options.onComment = pushComment(options, options.onComment);
  }
  if (options.sourceType === "commonjs" && options.allowAwaitOutsideFunction) {
    throw new Error("Cannot use allowAwaitOutsideFunction with sourceType: commonjs");
  }
  return options;
}
function pushComment(options, array) {
  return function(block, text, start, end, startLoc, endLoc) {
    var comment = {
      type: block ? "Block" : "Line",
      value: text,
      start,
      end
    };
    if (options.locations) {
      comment.loc = new SourceLocation(this, startLoc, endLoc);
    }
    if (options.ranges) {
      comment.range = [start, end];
    }
    array.push(comment);
  };
}
function functionFlags(async, generator) {
  return SCOPE_FUNCTION | (async ? SCOPE_ASYNC : 0) | (generator ? SCOPE_GENERATOR : 0);
}
function isPrivateNameConflicted(privateNameMap, element) {
  var name = element.key.name;
  var curr = privateNameMap[name];
  var next = "true";
  if (element.type === "MethodDefinition" && (element.kind === "get" || element.kind === "set")) {
    next = (element.static ? "s" : "i") + element.kind;
  }
  if (curr === "iget" && next === "iset" || curr === "iset" && next === "iget" || curr === "sget" && next === "sset" || curr === "sset" && next === "sget") {
    privateNameMap[name] = "true";
    return false;
  } else if (!curr) {
    privateNameMap[name] = next;
    return false;
  } else {
    return true;
  }
}
function checkKeyName(node, name) {
  var computed = node.computed;
  var key = node.key;
  return !computed && (key.type === "Identifier" && key.name === name || key.type === "Literal" && key.value === name);
}
function isLocalVariableAccess(node) {
  return node.type === "Identifier" || node.type === "ParenthesizedExpression" && isLocalVariableAccess(node.expression);
}
function isPrivateFieldAccess(node) {
  return node.type === "MemberExpression" && node.property.type === "PrivateIdentifier" || node.type === "ChainExpression" && isPrivateFieldAccess(node.expression) || node.type === "ParenthesizedExpression" && isPrivateFieldAccess(node.expression);
}
function finishNodeAt(node, type, pos, loc) {
  node.type = type;
  node.end = pos;
  if (this.options.locations) {
    node.loc.end = loc;
  }
  if (this.options.ranges) {
    node.range[1] = pos;
  }
  return node;
}
function buildUnicodeData(ecmaVersion) {
  var d = data[ecmaVersion] = {
    binary: wordsRegexp(unicodeBinaryProperties[ecmaVersion] + " " + unicodeGeneralCategoryValues),
    binaryOfStrings: wordsRegexp(unicodeBinaryPropertiesOfStrings[ecmaVersion]),
    nonBinary: {
      General_Category: wordsRegexp(unicodeGeneralCategoryValues),
      Script: wordsRegexp(unicodeScriptValues[ecmaVersion])
    }
  };
  d.nonBinary.Script_Extensions = d.nonBinary.Script;
  d.nonBinary.gc = d.nonBinary.General_Category;
  d.nonBinary.sc = d.nonBinary.Script;
  d.nonBinary.scx = d.nonBinary.Script_Extensions;
}
function hasProp(obj) {
  for (var _ in obj) {
    return true;
  }
  return false;
}
function isRegularExpressionModifier(ch) {
  return ch === 105 || ch === 109 || ch === 115;
}
function isSyntaxCharacter(ch) {
  return ch === 36 || ch >= 40 && ch <= 43 || ch === 46 || ch === 63 || ch >= 91 && ch <= 94 || ch >= 123 && ch <= 125;
}
function isRegExpIdentifierStart(ch) {
  return isIdentifierStart(ch, true) || ch === 36 || ch === 95;
}
function isRegExpIdentifierPart(ch) {
  return isIdentifierChar(ch, true) || ch === 36 || ch === 95 || ch === 8204 || ch === 8205;
}
function isControlLetter(ch) {
  return ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122;
}
function isValidUnicode(ch) {
  return ch >= 0 && ch <= 1114111;
}
function isCharacterClassEscape(ch) {
  return ch === 100 || ch === 68 || ch === 115 || ch === 83 || ch === 119 || ch === 87;
}
function isUnicodePropertyNameCharacter(ch) {
  return isControlLetter(ch) || ch === 95;
}
function isUnicodePropertyValueCharacter(ch) {
  return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch);
}
function isClassSetReservedDoublePunctuatorCharacter(ch) {
  return ch === 33 || ch >= 35 && ch <= 38 || ch >= 42 && ch <= 44 || ch === 46 || ch >= 58 && ch <= 64 || ch === 94 || ch === 96 || ch === 126;
}
function isClassSetSyntaxCharacter(ch) {
  return ch === 40 || ch === 41 || ch === 45 || ch === 47 || ch >= 91 && ch <= 93 || ch >= 123 && ch <= 125;
}
function isClassSetReservedPunctuator(ch) {
  return ch === 33 || ch === 35 || ch === 37 || ch === 38 || ch === 44 || ch === 45 || ch >= 58 && ch <= 62 || ch === 64 || ch === 96 || ch === 126;
}
function isDecimalDigit(ch) {
  return ch >= 48 && ch <= 57;
}
function isHexDigit(ch) {
  return ch >= 48 && ch <= 57 || ch >= 65 && ch <= 70 || ch >= 97 && ch <= 102;
}
function hexToInt(ch) {
  if (ch >= 65 && ch <= 70) {
    return 10 + (ch - 65);
  }
  if (ch >= 97 && ch <= 102) {
    return 10 + (ch - 97);
  }
  return ch - 48;
}
function isOctalDigit(ch) {
  return ch >= 48 && ch <= 55;
}
function stringToNumber(str, isLegacyOctalNumericLiteral) {
  if (isLegacyOctalNumericLiteral) {
    return parseInt(str, 8);
  }
  return parseFloat(str.replace(/_/g, ""));
}
function stringToBigInt(str) {
  if (typeof BigInt !== "function") {
    return null;
  }
  return BigInt(str.replace(/_/g, ""));
}
function parse2(input, options) {
  return Parser.parse(input, options);
}
var astralIdentifierCodes, astralIdentifierStartCodes, nonASCIIidentifierChars = "\u200C\u200D\xB7\u0300-\u036F\u0387\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u0669\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u06F0-\u06F9\u0711\u0730-\u074A\u07A6-\u07B0\u07C0-\u07C9\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u0897-\u089F\u08CA-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0966-\u096F\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09E6-\u09EF\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A66-\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AE6-\u0AEF\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B55-\u0B57\u0B62\u0B63\u0B66-\u0B6F\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0BE6-\u0BEF\u0C00-\u0C04\u0C3C\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0CE6-\u0CEF\u0CF3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D66-\u0D6F\u0D81-\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0E50-\u0E59\u0EB1\u0EB4-\u0EBC\u0EC8-\u0ECE\u0ED0-\u0ED9\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1040-\u1049\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109D\u135D-\u135F\u1369-\u1371\u1712-\u1715\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u17E0-\u17E9\u180B-\u180D\u180F-\u1819\u18A9\u1920-\u192B\u1930-\u193B\u1946-\u194F\u19D0-\u19DA\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AB0-\u1ABD\u1ABF-\u1ADD\u1AE0-\u1AEB\u1B00-\u1B04\u1B34-\u1B44\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BF3\u1C24-\u1C37\u1C40-\u1C49\u1C50-\u1C59\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DFF\u200C\u200D\u203F\u2040\u2054\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\u30FB\uA620-\uA629\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA82C\uA880\uA881\uA8B4-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F1\uA8FF-\uA909\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9D0-\uA9D9\uA9E5\uA9F0-\uA9F9\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA50-\uAA59\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uABF0-\uABF9\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFF10-\uFF19\uFF3F\uFF65", nonASCIIidentifierStartChars = "\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088F\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5C\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDC-\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7DC\uA7F1-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC", reservedWords, ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this", keywords$1, keywordRelationalOperator, nonASCIIidentifierStart, nonASCIIidentifier, TokenType = function TokenType(label, conf) {
  if (conf === undefined)
    conf = {};
  this.label = label;
  this.keyword = conf.keyword;
  this.beforeExpr = !!conf.beforeExpr;
  this.startsExpr = !!conf.startsExpr;
  this.isLoop = !!conf.isLoop;
  this.isAssign = !!conf.isAssign;
  this.prefix = !!conf.prefix;
  this.postfix = !!conf.postfix;
  this.binop = conf.binop || null;
  this.updateContext = null;
}, beforeExpr, startsExpr, keywords, types$1, lineBreak, lineBreakG, nonASCIIwhitespace, skipWhiteSpace, ref, hasOwnProperty, toString, hasOwn, isArray, regexpCache, loneSurrogate, Position = function Position(line, col) {
  this.line = line;
  this.column = col;
}, SourceLocation = function SourceLocation(p, start, end) {
  this.start = start;
  this.end = end;
  if (p.sourceFile !== null) {
    this.source = p.sourceFile;
  }
}, defaultOptions, warnedAboutEcmaVersion = false, SCOPE_TOP = 1, SCOPE_FUNCTION = 2, SCOPE_ASYNC = 4, SCOPE_GENERATOR = 8, SCOPE_ARROW = 16, SCOPE_SIMPLE_CATCH = 32, SCOPE_SUPER = 64, SCOPE_DIRECT_SUPER = 128, SCOPE_CLASS_STATIC_BLOCK = 256, SCOPE_CLASS_FIELD_INIT = 512, SCOPE_SWITCH = 1024, SCOPE_VAR, BIND_NONE = 0, BIND_VAR = 1, BIND_LEXICAL = 2, BIND_FUNCTION = 3, BIND_SIMPLE_CATCH = 4, BIND_OUTSIDE = 5, Parser = function Parser(options, input, startPos) {
  this.options = options = getOptions(options);
  this.sourceFile = options.sourceFile;
  this.keywords = wordsRegexp(keywords$1[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5]);
  var reserved = "";
  if (options.allowReserved !== true) {
    reserved = reservedWords[options.ecmaVersion >= 6 ? 6 : options.ecmaVersion === 5 ? 5 : 3];
    if (options.sourceType === "module") {
      reserved += " await";
    }
  }
  this.reservedWords = wordsRegexp(reserved);
  var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
  this.reservedWordsStrict = wordsRegexp(reservedStrict);
  this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
  this.input = String(input);
  this.containsEsc = false;
  this.pos = startPos || 0;
  this.curLine = 1;
  if (options.startLocation) {
    this.lineStart = this.pos - options.startLocation.column;
    this.curLine = options.startLocation.line;
  } else if (startPos) {
    this.lineStart = this.input.lastIndexOf(`
`, startPos - 1) + 1;
    if (this.options.locations) {
      this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
    }
  } else {
    this.lineStart = 0;
  }
  this.type = types$1.eof;
  this.value = null;
  this.start = this.end = this.pos;
  this.startLoc = this.endLoc = this.curPosition();
  this.lastTokEndLoc = this.lastTokStartLoc = null;
  this.lastTokStart = this.lastTokEnd = this.pos;
  this.context = this.initialContext();
  this.exprAllowed = true;
  this.inModule = options.sourceType === "module";
  this.strict = this.inModule || options.strict === true || this.strictDirective(this.pos);
  this.potentialArrowAt = -1;
  this.potentialArrowInForAwait = false;
  this.yieldPos = this.awaitPos = this.awaitIdentPos = 0;
  this.labels = [];
  this.undefinedExports = Object.create(null);
  if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!") {
    this.skipLineComment(2);
  }
  this.scopeStack = [];
  this.enterScope(this.options.sourceType === "commonjs" ? SCOPE_FUNCTION : SCOPE_TOP);
  this.regexpState = null;
  this.privateNameStack = [];
}, prototypeAccessors, pp$9, literal, DestructuringErrors = function DestructuringErrors() {
  this.shorthandAssign = this.trailingComma = this.parenthesizedAssign = this.parenthesizedBind = this.doubleProto = -1;
}, pp$8, loopLabel, switchLabel, empty$1, FUNC_STATEMENT = 1, FUNC_HANGING_STATEMENT = 2, FUNC_NULLABLE_ID = 4, pp$7, TokContext = function TokContext(token, isExpr, preserveSpace, override, generator) {
  this.token = token;
  this.isExpr = !!isExpr;
  this.preserveSpace = !!preserveSpace;
  this.override = override;
  this.generator = !!generator;
}, types, pp$6, pp$5, empty, pp$4, pp$3, Scope = function Scope(flags) {
  this.flags = flags;
  this.var = [];
  this.lexical = [];
  this.functions = [];
}, Node = function Node(parser, pos, loc) {
  this.type = "";
  this.start = pos;
  this.end = 0;
  if (parser.options.locations) {
    this.loc = new SourceLocation(parser, loc);
  }
  if (parser.options.directSourceFile) {
    this.sourceFile = parser.options.directSourceFile;
  }
  if (parser.options.ranges) {
    this.range = [pos, 0];
  }
}, pp$2, scriptValuesAddedInUnicode = "Berf Beria_Erfe Gara Garay Gukh Gurung_Khema Hrkt Katakana_Or_Hiragana Kawi Kirat_Rai Krai Nag_Mundari Nagm Ol_Onal Onao Sidetic Sidt Sunu Sunuwar Tai_Yo Tayo Todhri Todr Tolong_Siki Tols Tulu_Tigalari Tutg Unknown Zzzz", ecma9BinaryProperties = "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS", ecma10BinaryProperties, ecma11BinaryProperties, ecma12BinaryProperties, ecma13BinaryProperties, ecma14BinaryProperties, unicodeBinaryProperties, ecma14BinaryPropertiesOfStrings = "Basic_Emoji Emoji_Keycap_Sequence RGI_Emoji_Modifier_Sequence RGI_Emoji_Flag_Sequence RGI_Emoji_Tag_Sequence RGI_Emoji_ZWJ_Sequence RGI_Emoji", unicodeBinaryPropertiesOfStrings, unicodeGeneralCategoryValues = "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu", ecma9ScriptValues = "Adlam Adlm Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb", ecma10ScriptValues, ecma11ScriptValues, ecma12ScriptValues, ecma13ScriptValues, ecma14ScriptValues, unicodeScriptValues, data, ecmaVersion, i, list, pp$1, BranchID = function BranchID(parent, base) {
  this.parent = parent;
  this.base = base || this;
}, RegExpValidationState = function RegExpValidationState(parser) {
  this.parser = parser;
  this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "") + (parser.options.ecmaVersion >= 13 ? "d" : "") + (parser.options.ecmaVersion >= 15 ? "v" : "");
  this.unicodeProperties = data[parser.options.ecmaVersion >= 14 ? 14 : parser.options.ecmaVersion];
  this.source = "";
  this.flags = "";
  this.start = 0;
  this.switchU = false;
  this.switchV = false;
  this.switchN = false;
  this.pos = 0;
  this.lastIntValue = 0;
  this.lastStringValue = "";
  this.lastAssertionIsQuantifiable = false;
  this.numCapturingParens = 0;
  this.maxBackReference = 0;
  this.groupNames = Object.create(null);
  this.backReferenceNames = [];
  this.branchID = null;
}, CharSetNone = 0, CharSetOk = 1, CharSetString = 2, Token = function Token(p) {
  this.type = p.type;
  this.value = p.value;
  this.start = p.start;
  this.end = p.end;
  if (p.options.locations) {
    this.loc = new SourceLocation(p, p.startLoc, p.endLoc);
  }
  if (p.options.ranges) {
    this.range = [p.start, p.end];
  }
}, pp2, INVALID_TEMPLATE_ESCAPE_ERROR, version = "8.18.0";
var init_acorn = __esm(() => {
  astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 574, 3, 9, 9, 7, 9, 32, 4, 318, 1, 78, 5, 71, 10, 50, 3, 123, 2, 54, 14, 32, 10, 3, 1, 11, 3, 46, 10, 8, 0, 46, 9, 7, 2, 37, 13, 2, 9, 6, 1, 45, 0, 13, 2, 49, 13, 9, 3, 2, 11, 83, 11, 7, 0, 3, 0, 158, 11, 6, 9, 7, 3, 56, 1, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 68, 8, 2, 0, 3, 0, 2, 3, 2, 4, 2, 0, 15, 1, 83, 17, 10, 9, 5, 0, 82, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 7, 19, 58, 14, 5, 9, 243, 14, 166, 9, 71, 5, 2, 1, 3, 3, 2, 0, 2, 1, 13, 9, 120, 6, 3, 6, 4, 0, 29, 9, 41, 6, 2, 3, 9, 0, 10, 10, 47, 15, 199, 7, 137, 9, 54, 7, 2, 7, 17, 9, 57, 21, 2, 13, 123, 5, 4, 0, 2, 1, 2, 6, 2, 0, 9, 9, 49, 4, 2, 1, 2, 4, 9, 9, 55, 9, 266, 3, 10, 1, 2, 0, 49, 6, 4, 4, 14, 10, 5350, 0, 7, 14, 11465, 27, 2343, 9, 87, 9, 39, 4, 60, 6, 26, 9, 535, 9, 470, 0, 2, 54, 8, 3, 82, 0, 12, 1, 19628, 1, 4178, 9, 519, 45, 3, 22, 543, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 101, 0, 161, 6, 10, 9, 357, 0, 62, 13, 499, 13, 245, 1, 2, 9, 233, 0, 3, 0, 8, 1, 6, 0, 475, 6, 110, 6, 6, 9, 4759, 9, 787719, 239];
  astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 14, 29, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 13, 10, 2, 14, 2, 6, 2, 1, 2, 10, 2, 14, 2, 6, 2, 1, 4, 51, 13, 310, 10, 21, 11, 7, 25, 5, 2, 41, 2, 8, 70, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 7, 25, 39, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 28, 43, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 14, 35, 39, 27, 10, 22, 251, 41, 7, 1, 17, 5, 57, 28, 11, 0, 9, 21, 43, 17, 47, 20, 28, 22, 13, 52, 58, 1, 3, 0, 14, 44, 33, 24, 27, 35, 30, 0, 3, 0, 9, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 20, 1, 64, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 31, 9, 2, 0, 3, 0, 2, 37, 2, 0, 26, 0, 2, 0, 45, 52, 19, 3, 21, 2, 31, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 14, 0, 72, 26, 38, 6, 186, 43, 117, 63, 32, 7, 3, 0, 3, 7, 2, 1, 2, 23, 16, 0, 2, 0, 95, 7, 3, 38, 17, 0, 2, 0, 29, 0, 11, 39, 8, 0, 22, 0, 12, 45, 20, 0, 19, 72, 200, 32, 32, 8, 2, 36, 18, 0, 50, 29, 113, 6, 2, 1, 2, 37, 22, 0, 26, 5, 2, 1, 2, 31, 15, 0, 24, 43, 261, 18, 16, 0, 2, 12, 2, 33, 125, 0, 80, 921, 103, 110, 18, 195, 2637, 96, 16, 1071, 18, 5, 26, 3994, 6, 582, 6842, 29, 1763, 568, 8, 30, 18, 78, 18, 29, 19, 47, 17, 3, 32, 20, 6, 18, 433, 44, 212, 63, 33, 24, 3, 24, 45, 74, 6, 0, 67, 12, 65, 1, 2, 0, 15, 4, 10, 7381, 42, 31, 98, 114, 8702, 3, 2, 6, 2, 1, 2, 290, 16, 0, 30, 2, 3, 0, 15, 3, 9, 395, 2309, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 1845, 30, 7, 5, 262, 61, 147, 44, 11, 6, 17, 0, 322, 29, 19, 43, 485, 27, 229, 29, 3, 0, 208, 30, 2, 2, 2, 1, 2, 6, 3, 4, 10, 1, 225, 6, 2, 3, 2, 1, 2, 14, 2, 196, 60, 67, 8, 0, 1205, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42719, 33, 4381, 3, 5773, 3, 7472, 16, 621, 2467, 541, 1507, 4938, 6, 8489];
  reservedWords = {
    3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
    5: "class enum extends super const export import",
    6: "enum",
    strict: "implements interface let package private protected public static yield",
    strictBind: "eval arguments"
  };
  keywords$1 = {
    5: ecma5AndLessKeywords,
    "5module": ecma5AndLessKeywords + " export import",
    6: ecma5AndLessKeywords + " const class extends export import super"
  };
  keywordRelationalOperator = /^in(stanceof)?$/;
  nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
  nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");
  beforeExpr = { beforeExpr: true };
  startsExpr = { startsExpr: true };
  keywords = {};
  types$1 = {
    num: new TokenType("num", startsExpr),
    regexp: new TokenType("regexp", startsExpr),
    string: new TokenType("string", startsExpr),
    name: new TokenType("name", startsExpr),
    privateId: new TokenType("privateId", startsExpr),
    eof: new TokenType("eof"),
    bracketL: new TokenType("[", { beforeExpr: true, startsExpr: true }),
    bracketR: new TokenType("]"),
    braceL: new TokenType("{", { beforeExpr: true, startsExpr: true }),
    braceR: new TokenType("}"),
    parenL: new TokenType("(", { beforeExpr: true, startsExpr: true }),
    parenR: new TokenType(")"),
    comma: new TokenType(",", beforeExpr),
    semi: new TokenType(";", beforeExpr),
    colon: new TokenType(":", beforeExpr),
    dot: new TokenType("."),
    question: new TokenType("?", beforeExpr),
    questionDot: new TokenType("?."),
    arrow: new TokenType("=>", beforeExpr),
    template: new TokenType("template"),
    invalidTemplate: new TokenType("invalidTemplate"),
    ellipsis: new TokenType("...", beforeExpr),
    backQuote: new TokenType("`", startsExpr),
    dollarBraceL: new TokenType("${", { beforeExpr: true, startsExpr: true }),
    eq: new TokenType("=", { beforeExpr: true, isAssign: true }),
    assign: new TokenType("_=", { beforeExpr: true, isAssign: true }),
    incDec: new TokenType("++/--", { prefix: true, postfix: true, startsExpr: true }),
    prefix: new TokenType("!/~", { beforeExpr: true, prefix: true, startsExpr: true }),
    logicalOR: binop("||", 1),
    logicalAND: binop("&&", 2),
    bitwiseOR: binop("|", 3),
    bitwiseXOR: binop("^", 4),
    bitwiseAND: binop("&", 5),
    equality: binop("==/!=/===/!==", 6),
    relational: binop("</>/<=/>=", 7),
    bitShift: binop("<</>>/>>>", 8),
    plusMin: new TokenType("+/-", { beforeExpr: true, binop: 9, prefix: true, startsExpr: true }),
    modulo: binop("%", 10),
    star: binop("*", 10),
    slash: binop("/", 10),
    starstar: new TokenType("**", { beforeExpr: true }),
    coalesce: binop("??", 1),
    _break: kw2("break"),
    _case: kw2("case", beforeExpr),
    _catch: kw2("catch"),
    _continue: kw2("continue"),
    _debugger: kw2("debugger"),
    _default: kw2("default", beforeExpr),
    _do: kw2("do", { isLoop: true, beforeExpr: true }),
    _else: kw2("else", beforeExpr),
    _finally: kw2("finally"),
    _for: kw2("for", { isLoop: true }),
    _function: kw2("function", startsExpr),
    _if: kw2("if"),
    _return: kw2("return", beforeExpr),
    _switch: kw2("switch"),
    _throw: kw2("throw", beforeExpr),
    _try: kw2("try"),
    _var: kw2("var"),
    _const: kw2("const"),
    _while: kw2("while", { isLoop: true }),
    _with: kw2("with"),
    _new: kw2("new", { beforeExpr: true, startsExpr: true }),
    _this: kw2("this", startsExpr),
    _super: kw2("super", startsExpr),
    _class: kw2("class", startsExpr),
    _extends: kw2("extends", beforeExpr),
    _export: kw2("export"),
    _import: kw2("import", startsExpr),
    _null: kw2("null", startsExpr),
    _true: kw2("true", startsExpr),
    _false: kw2("false", startsExpr),
    _in: kw2("in", { beforeExpr: true, binop: 7 }),
    _instanceof: kw2("instanceof", { beforeExpr: true, binop: 7 }),
    _typeof: kw2("typeof", { beforeExpr: true, prefix: true, startsExpr: true }),
    _void: kw2("void", { beforeExpr: true, prefix: true, startsExpr: true }),
    _delete: kw2("delete", { beforeExpr: true, prefix: true, startsExpr: true })
  };
  lineBreak = /\r\n?|\n|\u2028|\u2029/;
  lineBreakG = new RegExp(lineBreak.source, "g");
  nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
  skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;
  ref = Object.prototype;
  hasOwnProperty = ref.hasOwnProperty;
  toString = ref.toString;
  hasOwn = Object.hasOwn || function(obj, propName) {
    return hasOwnProperty.call(obj, propName);
  };
  isArray = Array.isArray || function(obj) {
    return toString.call(obj) === "[object Array]";
  };
  regexpCache = Object.create(null);
  loneSurrogate = /(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/;
  Position.prototype.offset = function offset(n) {
    return new Position(this.line, this.column + n);
  };
  defaultOptions = {
    ecmaVersion: null,
    sourceType: "script",
    strict: false,
    onInsertedSemicolon: null,
    onTrailingComma: null,
    allowReserved: null,
    allowReturnOutsideFunction: false,
    allowImportExportEverywhere: false,
    allowAwaitOutsideFunction: null,
    allowSuperOutsideMethod: null,
    allowHashBang: false,
    checkPrivateFields: true,
    locations: false,
    startLocation: null,
    onToken: null,
    onComment: null,
    ranges: false,
    program: null,
    sourceFile: null,
    directSourceFile: null,
    preserveParens: false
  };
  SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION | SCOPE_CLASS_STATIC_BLOCK;
  prototypeAccessors = { inFunction: { configurable: true }, inGenerator: { configurable: true }, inAsync: { configurable: true }, canAwait: { configurable: true }, allowReturn: { configurable: true }, allowSuper: { configurable: true }, allowDirectSuper: { configurable: true }, treatFunctionsAsVar: { configurable: true }, allowNewDotTarget: { configurable: true }, allowUsing: { configurable: true }, inClassStaticBlock: { configurable: true } };
  Parser.prototype.parse = function parse() {
    var this$1$1 = this;
    var node = this.options.program || this.startNode();
    this.nextToken();
    return this.catchStackOverflow(function() {
      return this$1$1.parseTopLevel(node);
    });
  };
  prototypeAccessors.inFunction.get = function() {
    return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0;
  };
  prototypeAccessors.inGenerator.get = function() {
    return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0;
  };
  prototypeAccessors.inAsync.get = function() {
    return (this.currentVarScope().flags & SCOPE_ASYNC) > 0;
  };
  prototypeAccessors.canAwait.get = function() {
    for (var i = this.scopeStack.length - 1;i >= 0; i--) {
      var ref = this.scopeStack[i];
      var flags = ref.flags;
      if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT)) {
        return false;
      }
      if (flags & SCOPE_FUNCTION) {
        return (flags & SCOPE_ASYNC) > 0;
      }
    }
    return this.inModule && this.options.ecmaVersion >= 13 || this.options.allowAwaitOutsideFunction;
  };
  prototypeAccessors.allowReturn.get = function() {
    if (this.inFunction) {
      return true;
    }
    if (this.options.allowReturnOutsideFunction && this.currentVarScope().flags & SCOPE_TOP) {
      return true;
    }
    return false;
  };
  prototypeAccessors.allowSuper.get = function() {
    var ref = this.currentThisScope();
    var flags = ref.flags;
    return (flags & SCOPE_SUPER) > 0 || this.options.allowSuperOutsideMethod;
  };
  prototypeAccessors.allowDirectSuper.get = function() {
    return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0;
  };
  prototypeAccessors.treatFunctionsAsVar.get = function() {
    return this.treatFunctionsAsVarInScope(this.currentScope());
  };
  prototypeAccessors.allowNewDotTarget.get = function() {
    for (var i = this.scopeStack.length - 1;i >= 0; i--) {
      var ref = this.scopeStack[i];
      var flags = ref.flags;
      if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT) || flags & SCOPE_FUNCTION && !(flags & SCOPE_ARROW)) {
        return true;
      }
    }
    return false;
  };
  prototypeAccessors.allowUsing.get = function() {
    var ref = this.currentScope();
    var flags = ref.flags;
    if (flags & SCOPE_SWITCH) {
      return false;
    }
    if (!this.inModule && flags & SCOPE_TOP) {
      return false;
    }
    return true;
  };
  prototypeAccessors.inClassStaticBlock.get = function() {
    return (this.currentVarScope().flags & SCOPE_CLASS_STATIC_BLOCK) > 0;
  };
  Parser.extend = function extend() {
    var plugins = [], len = arguments.length;
    while (len--)
      plugins[len] = arguments[len];
    var cls = this;
    for (var i = 0;i < plugins.length; i++) {
      cls = plugins[i](cls);
    }
    return cls;
  };
  Parser.parse = function parse(input, options) {
    return new this(options, input).parse();
  };
  Parser.parseExpressionAt = function parseExpressionAt(input, pos, options) {
    var parser = new this(options, input, pos);
    parser.nextToken();
    return parser.parseExpression();
  };
  Parser.tokenizer = function tokenizer(input, options) {
    return new this(options, input);
  };
  Object.defineProperties(Parser.prototype, prototypeAccessors);
  pp$9 = Parser.prototype;
  literal = /^(?:'((?:\\[^]|[^'\\])*?)'|"((?:\\[^]|[^"\\])*?)")/;
  pp$9.strictDirective = function(start) {
    if (this.options.ecmaVersion < 5) {
      return false;
    }
    for (;; ) {
      skipWhiteSpace.lastIndex = start;
      start += skipWhiteSpace.exec(this.input)[0].length;
      var match = literal.exec(this.input.slice(start));
      if (!match) {
        return false;
      }
      if ((match[1] || match[2]) === "use strict") {
        skipWhiteSpace.lastIndex = start + match[0].length;
        var spaceAfter = skipWhiteSpace.exec(this.input), end = spaceAfter.index + spaceAfter[0].length;
        var next = this.input.charAt(end);
        return next === ";" || next === "}" || lineBreak.test(spaceAfter[0]) && !(/[(`.[+\-/*%<>=,?^&]/.test(next) || next === "!" && this.input.charAt(end + 1) === "=");
      }
      start += match[0].length;
      skipWhiteSpace.lastIndex = start;
      start += skipWhiteSpace.exec(this.input)[0].length;
      if (this.input[start] === ";") {
        start++;
      }
    }
  };
  pp$9.eat = function(type) {
    if (this.type === type) {
      this.next();
      return true;
    } else {
      return false;
    }
  };
  pp$9.isContextual = function(name) {
    return this.type === types$1.name && this.value === name && !this.containsEsc;
  };
  pp$9.eatContextual = function(name) {
    if (!this.isContextual(name)) {
      return false;
    }
    this.next();
    return true;
  };
  pp$9.catchStackOverflow = function(f) {
    try {
      return f();
    } catch (e) {
      if (e instanceof Error && (/\bstack\b.*\b(exceeded|overflow)\b/i.test(e.message) || /\btoo much recursion\b/i.test(e.message))) {
        this.raise(this.start, "Not enough stack space to parse input");
      } else {
        throw e;
      }
    }
  };
  pp$9.expectContextual = function(name) {
    if (!this.eatContextual(name)) {
      this.unexpected();
    }
  };
  pp$9.canInsertSemicolon = function() {
    return this.type === types$1.eof || this.type === types$1.braceR || lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
  };
  pp$9.insertSemicolon = function() {
    if (this.canInsertSemicolon()) {
      if (this.options.onInsertedSemicolon) {
        this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc);
      }
      return true;
    }
  };
  pp$9.semicolon = function() {
    if (!this.eat(types$1.semi) && !this.insertSemicolon()) {
      this.unexpected();
    }
  };
  pp$9.afterTrailingComma = function(tokType, notNext) {
    if (this.type === tokType) {
      if (this.options.onTrailingComma) {
        this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc);
      }
      if (!notNext) {
        this.next();
      }
      return true;
    }
  };
  pp$9.expect = function(type) {
    this.eat(type) || this.unexpected();
  };
  pp$9.unexpected = function(pos) {
    this.raise(pos != null ? pos : this.start, "Unexpected token");
  };
  pp$9.checkPatternErrors = function(refDestructuringErrors, isAssign) {
    if (!refDestructuringErrors) {
      return;
    }
    if (refDestructuringErrors.trailingComma > -1) {
      this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element");
    }
    var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
    if (parens > -1) {
      this.raiseRecoverable(parens, isAssign ? "Assigning to rvalue" : "Parenthesized pattern");
    }
  };
  pp$9.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
    if (!refDestructuringErrors) {
      return false;
    }
    var shorthandAssign = refDestructuringErrors.shorthandAssign;
    var doubleProto = refDestructuringErrors.doubleProto;
    if (!andThrow) {
      return shorthandAssign >= 0 || doubleProto >= 0;
    }
    if (shorthandAssign >= 0) {
      this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns");
    }
    if (doubleProto >= 0) {
      this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property");
    }
  };
  pp$9.checkYieldAwaitInDefaultParams = function() {
    if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos)) {
      this.raise(this.yieldPos, "Yield expression cannot be a default value");
    }
    if (this.awaitPos) {
      this.raise(this.awaitPos, "Await expression cannot be a default value");
    }
  };
  pp$9.isSimpleAssignTarget = function(expr) {
    if (expr.type === "ParenthesizedExpression") {
      return this.isSimpleAssignTarget(expr.expression);
    }
    return expr.type === "Identifier" || expr.type === "MemberExpression";
  };
  pp$8 = Parser.prototype;
  pp$8.parseTopLevel = function(node) {
    var exports$1 = Object.create(null);
    if (!node.body) {
      node.body = [];
    }
    while (this.type !== types$1.eof) {
      var stmt = this.parseStatement(null, true, exports$1);
      node.body.push(stmt);
    }
    if (this.inModule) {
      for (var i = 0, list = Object.keys(this.undefinedExports);i < list.length; i += 1) {
        var name = list[i];
        this.raiseRecoverable(this.undefinedExports[name].start, "Export '" + name + "' is not defined");
      }
    }
    this.adaptDirectivePrologue(node.body);
    this.next();
    node.sourceType = this.options.sourceType === "commonjs" ? "script" : this.options.sourceType;
    return this.finishNode(node, "Program");
  };
  loopLabel = { kind: "loop" };
  switchLabel = { kind: "switch" };
  pp$8.isLet = function(context) {
    if (this.options.ecmaVersion < 6 || !this.isContextual("let")) {
      return false;
    }
    skipWhiteSpace.lastIndex = this.pos;
    var skip = skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length, nextCh = this.fullCharCodeAt(next);
    if (nextCh === 91 || nextCh === 92) {
      return true;
    }
    if (context) {
      return false;
    }
    if (nextCh === 123) {
      return true;
    }
    if (isIdentifierStart(nextCh)) {
      var start = next;
      do {
        next += nextCh <= 65535 ? 1 : 2;
      } while (isIdentifierChar(nextCh = this.fullCharCodeAt(next)));
      if (nextCh === 92) {
        return true;
      }
      var ident = this.input.slice(start, next);
      if (!keywordRelationalOperator.test(ident)) {
        return true;
      }
    }
    return false;
  };
  pp$8.isAsyncFunction = function() {
    if (this.options.ecmaVersion < 8 || !this.isContextual("async")) {
      return false;
    }
    skipWhiteSpace.lastIndex = this.pos;
    var skip = skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length, after;
    return !lineBreak.test(this.input.slice(this.pos, next)) && this.input.slice(next, next + 8) === "function" && (next + 8 === this.input.length || !(isIdentifierChar(after = this.fullCharCodeAt(next + 8)) || after === 92));
  };
  pp$8.isUsingKeyword = function(isAwaitUsing, isFor) {
    if (this.options.ecmaVersion < 17 || !this.isContextual(isAwaitUsing ? "await" : "using")) {
      return false;
    }
    skipWhiteSpace.lastIndex = this.pos;
    var skip = skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length;
    if (lineBreak.test(this.input.slice(this.pos, next))) {
      return false;
    }
    if (isAwaitUsing) {
      var usingEndPos = next + 5, after;
      if (this.input.slice(next, usingEndPos) !== "using" || usingEndPos === this.input.length || isIdentifierChar(after = this.fullCharCodeAt(usingEndPos)) || after === 92) {
        return false;
      }
      skipWhiteSpace.lastIndex = usingEndPos;
      var skipAfterUsing = skipWhiteSpace.exec(this.input);
      next = usingEndPos + skipAfterUsing[0].length;
      if (skipAfterUsing && lineBreak.test(this.input.slice(usingEndPos, next))) {
        return false;
      }
    }
    var ch = this.fullCharCodeAt(next);
    if (!isIdentifierStart(ch) && ch !== 92) {
      return false;
    }
    var idStart = next;
    do {
      next += ch <= 65535 ? 1 : 2;
    } while (isIdentifierChar(ch = this.fullCharCodeAt(next)));
    if (ch === 92) {
      return true;
    }
    var id = this.input.slice(idStart, next);
    if (keywordRelationalOperator.test(id)) {
      return false;
    }
    if (isFor && !isAwaitUsing && id === "of") {
      skipWhiteSpace.lastIndex = next;
      var skipAfterOf = skipWhiteSpace.exec(this.input);
      next = next + skipAfterOf[0].length;
      if (this.input.charCodeAt(next) !== 61 || (ch = this.input.charCodeAt(next + 1)) === 61 || ch === 62) {
        return false;
      }
    }
    return true;
  };
  pp$8.isAwaitUsing = function(isFor) {
    return this.isUsingKeyword(true, isFor);
  };
  pp$8.isUsing = function(isFor) {
    return this.isUsingKeyword(false, isFor);
  };
  pp$8.parseStatement = function(context, topLevel, exports$1) {
    var starttype = this.type, node = this.startNode(), kind;
    if (this.isLet(context)) {
      starttype = types$1._var;
      kind = "let";
    }
    switch (starttype) {
      case types$1._break:
      case types$1._continue:
        return this.parseBreakContinueStatement(node, starttype.keyword);
      case types$1._debugger:
        return this.parseDebuggerStatement(node);
      case types$1._do:
        return this.parseDoStatement(node);
      case types$1._for:
        return this.parseForStatement(node);
      case types$1._function:
        if (context && (this.strict || context !== "if" && context !== "label") && this.options.ecmaVersion >= 6) {
          this.unexpected();
        }
        return this.parseFunctionStatement(node, false, !context);
      case types$1._class:
        if (context) {
          this.unexpected();
        }
        return this.parseClass(node, true);
      case types$1._if:
        return this.parseIfStatement(node);
      case types$1._return:
        return this.parseReturnStatement(node);
      case types$1._switch:
        return this.parseSwitchStatement(node);
      case types$1._throw:
        return this.parseThrowStatement(node);
      case types$1._try:
        return this.parseTryStatement(node);
      case types$1._const:
      case types$1._var:
        kind = kind || this.value;
        if (context && kind !== "var") {
          this.unexpected();
        }
        return this.parseVarStatement(node, kind);
      case types$1._while:
        return this.parseWhileStatement(node);
      case types$1._with:
        return this.parseWithStatement(node);
      case types$1.braceL:
        return this.parseBlock(true, node);
      case types$1.semi:
        return this.parseEmptyStatement(node);
      case types$1._export:
      case types$1._import:
        if (this.options.ecmaVersion > 10 && starttype === types$1._import) {
          skipWhiteSpace.lastIndex = this.pos;
          var skip = skipWhiteSpace.exec(this.input);
          var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
          if (nextCh === 40 || nextCh === 46) {
            return this.parseExpressionStatement(node, this.parseExpression());
          }
        }
        if (!this.options.allowImportExportEverywhere) {
          if (!topLevel) {
            this.raise(this.start, "'import' and 'export' may only appear at the top level");
          }
          if (!this.inModule) {
            this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'");
          }
        }
        return starttype === types$1._import ? this.parseImport(node) : this.parseExport(node, exports$1);
      default:
        if (this.isAsyncFunction()) {
          if (context) {
            this.unexpected();
          }
          this.next();
          return this.parseFunctionStatement(node, true, !context);
        }
        var usingKind = this.isAwaitUsing(false) ? "await using" : this.isUsing(false) ? "using" : null;
        if (usingKind) {
          if (!this.allowUsing) {
            this.raise(this.start, "Using declaration cannot appear in the top level when source type is `script` or in the bare case statement");
          }
          if (context) {
            this.raise(this.start, "Using declaration is not allowed in single-statement positions");
          }
          if (usingKind === "await using") {
            if (!this.canAwait) {
              this.raise(this.start, "Await using cannot appear outside of async function");
            }
            this.next();
          }
          this.next();
          this.parseVar(node, false, usingKind);
          this.semicolon();
          return this.finishNode(node, "VariableDeclaration");
        }
        var maybeName = this.value, expr = this.parseExpression();
        if (starttype === types$1.name && expr.type === "Identifier" && this.eat(types$1.colon)) {
          return this.parseLabeledStatement(node, maybeName, expr, context);
        } else {
          return this.parseExpressionStatement(node, expr);
        }
    }
  };
  pp$8.parseBreakContinueStatement = function(node, keyword) {
    var isBreak = keyword === "break";
    this.next();
    if (this.eat(types$1.semi) || this.insertSemicolon()) {
      node.label = null;
    } else if (this.type !== types$1.name) {
      this.unexpected();
    } else {
      node.label = this.parseIdent();
      this.semicolon();
    }
    var i = 0;
    for (;i < this.labels.length; ++i) {
      var lab = this.labels[i];
      if (node.label == null || lab.name === node.label.name) {
        if (lab.kind != null && (isBreak || lab.kind === "loop")) {
          break;
        }
        if (node.label && isBreak) {
          break;
        }
      }
    }
    if (i === this.labels.length) {
      this.raise(node.start, "Unsyntactic " + keyword);
    }
    return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
  };
  pp$8.parseDebuggerStatement = function(node) {
    this.next();
    this.semicolon();
    return this.finishNode(node, "DebuggerStatement");
  };
  pp$8.parseDoStatement = function(node) {
    this.next();
    this.labels.push(loopLabel);
    node.body = this.parseStatement("do");
    this.labels.pop();
    this.expect(types$1._while);
    node.test = this.parseParenExpression();
    if (this.options.ecmaVersion >= 6) {
      this.eat(types$1.semi);
    } else {
      this.semicolon();
    }
    return this.finishNode(node, "DoWhileStatement");
  };
  pp$8.parseForStatement = function(node) {
    this.next();
    var awaitAt = this.options.ecmaVersion >= 9 && this.canAwait && this.eatContextual("await") ? this.lastTokStart : -1;
    this.labels.push(loopLabel);
    this.enterScope(0);
    this.expect(types$1.parenL);
    if (this.type === types$1.semi) {
      if (awaitAt > -1) {
        this.unexpected(awaitAt);
      }
      return this.parseFor(node, null);
    }
    var isLet = this.isLet();
    if (this.type === types$1._var || this.type === types$1._const || isLet) {
      var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
      this.next();
      this.parseVar(init$1, true, kind);
      this.finishNode(init$1, "VariableDeclaration");
      return this.parseForAfterInit(node, init$1, awaitAt);
    }
    var startsWithLet = this.isContextual("let"), isForOf = false;
    var usingKind = this.isUsing(true) ? "using" : this.isAwaitUsing(true) ? "await using" : null;
    if (usingKind) {
      var init$2 = this.startNode();
      this.next();
      if (usingKind === "await using") {
        if (!this.canAwait) {
          this.raise(this.start, "Await using cannot appear outside of async function");
        }
        this.next();
      }
      this.parseVar(init$2, true, usingKind);
      this.finishNode(init$2, "VariableDeclaration");
      return this.parseForAfterInit(node, init$2, awaitAt);
    }
    var containsEsc = this.containsEsc;
    var refDestructuringErrors = new DestructuringErrors;
    var initPos = this.start;
    var init = awaitAt > -1 ? this.parseExprSubscripts(refDestructuringErrors, "await") : this.parseExpression(true, refDestructuringErrors);
    if (this.type === types$1._in || (isForOf = this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
      if (awaitAt > -1) {
        if (this.type === types$1._in) {
          this.unexpected(awaitAt);
        }
        node.await = true;
      } else if (isForOf && this.options.ecmaVersion >= 8) {
        if (init.start === initPos && !containsEsc && init.type === "Identifier" && init.name === "async") {
          this.unexpected();
        } else if (this.options.ecmaVersion >= 9) {
          node.await = false;
        }
      }
      if (startsWithLet && isForOf) {
        this.raise(init.start, "The left-hand side of a for-of loop may not start with 'let'.");
      }
      this.toAssignable(init, false, refDestructuringErrors);
      this.checkLValPattern(init);
      return this.parseForIn(node, init);
    } else {
      this.checkExpressionErrors(refDestructuringErrors, true);
    }
    if (awaitAt > -1) {
      this.unexpected(awaitAt);
    }
    return this.parseFor(node, init);
  };
  pp$8.parseForAfterInit = function(node, init, awaitAt) {
    if ((this.type === types$1._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) && init.declarations.length === 1) {
      if (this.type === types$1._in) {
        if ((init.kind === "using" || init.kind === "await using") && !init.declarations[0].init) {
          this.raise(this.start, "Using declaration is not allowed in for-in loops");
        }
        if (this.options.ecmaVersion >= 9 && awaitAt > -1) {
          this.unexpected(awaitAt);
        }
      } else if (this.options.ecmaVersion >= 9) {
        node.await = awaitAt > -1;
      }
      return this.parseForIn(node, init);
    }
    if (awaitAt > -1) {
      this.unexpected(awaitAt);
    }
    return this.parseFor(node, init);
  };
  pp$8.parseFunctionStatement = function(node, isAsync, declarationPosition) {
    this.next();
    return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync);
  };
  pp$8.parseIfStatement = function(node) {
    this.next();
    node.test = this.parseParenExpression();
    node.consequent = this.parseStatement("if");
    node.alternate = this.eat(types$1._else) ? this.parseStatement("if") : null;
    return this.finishNode(node, "IfStatement");
  };
  pp$8.parseReturnStatement = function(node) {
    if (!this.allowReturn) {
      this.raise(this.start, "'return' outside of function");
    }
    this.next();
    if (this.eat(types$1.semi) || this.insertSemicolon()) {
      node.argument = null;
    } else {
      node.argument = this.parseExpression();
      this.semicolon();
    }
    return this.finishNode(node, "ReturnStatement");
  };
  pp$8.parseSwitchStatement = function(node) {
    this.next();
    node.discriminant = this.parseParenExpression();
    node.cases = [];
    this.expect(types$1.braceL);
    this.labels.push(switchLabel);
    this.enterScope(SCOPE_SWITCH);
    var cur;
    for (var sawDefault = false;this.type !== types$1.braceR; ) {
      if (this.type === types$1._case || this.type === types$1._default) {
        var isCase = this.type === types$1._case;
        if (cur) {
          this.finishNode(cur, "SwitchCase");
        }
        node.cases.push(cur = this.startNode());
        cur.consequent = [];
        this.next();
        if (isCase) {
          cur.test = this.parseExpression();
        } else {
          if (sawDefault) {
            this.raiseRecoverable(this.lastTokStart, "Multiple default clauses");
          }
          sawDefault = true;
          cur.test = null;
        }
        this.expect(types$1.colon);
      } else {
        if (!cur) {
          this.unexpected();
        }
        cur.consequent.push(this.parseStatement(null));
      }
    }
    this.exitScope();
    if (cur) {
      this.finishNode(cur, "SwitchCase");
    }
    this.next();
    this.labels.pop();
    return this.finishNode(node, "SwitchStatement");
  };
  pp$8.parseThrowStatement = function(node) {
    this.next();
    if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) {
      this.raise(this.lastTokEnd, "Illegal newline after throw");
    }
    node.argument = this.parseExpression();
    this.semicolon();
    return this.finishNode(node, "ThrowStatement");
  };
  empty$1 = [];
  pp$8.parseCatchClauseParam = function() {
    var param = this.parseBindingAtom();
    var simple = param.type === "Identifier";
    this.enterScope(simple ? SCOPE_SIMPLE_CATCH : 0);
    this.checkLValPattern(param, simple ? BIND_SIMPLE_CATCH : BIND_LEXICAL);
    this.expect(types$1.parenR);
    return param;
  };
  pp$8.parseTryStatement = function(node) {
    this.next();
    node.block = this.parseBlock();
    node.handler = null;
    if (this.type === types$1._catch) {
      var clause = this.startNode();
      this.next();
      if (this.eat(types$1.parenL)) {
        clause.param = this.parseCatchClauseParam();
      } else {
        if (this.options.ecmaVersion < 10) {
          this.unexpected();
        }
        clause.param = null;
        this.enterScope(0);
      }
      clause.body = this.parseBlock(false);
      this.exitScope();
      node.handler = this.finishNode(clause, "CatchClause");
    }
    node.finalizer = this.eat(types$1._finally) ? this.parseBlock() : null;
    if (!node.handler && !node.finalizer) {
      this.raise(node.start, "Missing catch or finally clause");
    }
    return this.finishNode(node, "TryStatement");
  };
  pp$8.parseVarStatement = function(node, kind, allowMissingInitializer) {
    this.next();
    this.parseVar(node, false, kind, allowMissingInitializer);
    this.semicolon();
    return this.finishNode(node, "VariableDeclaration");
  };
  pp$8.parseWhileStatement = function(node) {
    this.next();
    node.test = this.parseParenExpression();
    this.labels.push(loopLabel);
    node.body = this.parseStatement("while");
    this.labels.pop();
    return this.finishNode(node, "WhileStatement");
  };
  pp$8.parseWithStatement = function(node) {
    if (this.strict) {
      this.raise(this.start, "'with' in strict mode");
    }
    this.next();
    node.object = this.parseParenExpression();
    node.body = this.parseStatement("with");
    return this.finishNode(node, "WithStatement");
  };
  pp$8.parseEmptyStatement = function(node) {
    this.next();
    return this.finishNode(node, "EmptyStatement");
  };
  pp$8.parseLabeledStatement = function(node, maybeName, expr, context) {
    for (var i$1 = 0, list = this.labels;i$1 < list.length; i$1 += 1) {
      var label = list[i$1];
      if (label.name === maybeName) {
        this.raise(expr.start, "Label '" + maybeName + "' is already declared");
      }
    }
    var kind = this.type.isLoop ? "loop" : this.type === types$1._switch ? "switch" : null;
    for (var i = this.labels.length - 1;i >= 0; i--) {
      var label$1 = this.labels[i];
      if (label$1.statementStart === node.start) {
        label$1.statementStart = this.start;
        label$1.kind = kind;
      } else {
        break;
      }
    }
    this.labels.push({ name: maybeName, kind, statementStart: this.start });
    node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? context + "label" : context : "label");
    this.labels.pop();
    node.label = expr;
    return this.finishNode(node, "LabeledStatement");
  };
  pp$8.parseExpressionStatement = function(node, expr) {
    node.expression = expr;
    this.semicolon();
    return this.finishNode(node, "ExpressionStatement");
  };
  pp$8.parseBlock = function(createNewLexicalScope, node, exitStrict) {
    if (createNewLexicalScope === undefined)
      createNewLexicalScope = true;
    if (node === undefined)
      node = this.startNode();
    node.body = [];
    this.expect(types$1.braceL);
    if (createNewLexicalScope) {
      this.enterScope(0);
    }
    while (this.type !== types$1.braceR) {
      var stmt = this.parseStatement(null);
      node.body.push(stmt);
    }
    if (exitStrict) {
      this.strict = false;
    }
    this.next();
    if (createNewLexicalScope) {
      this.exitScope();
    }
    return this.finishNode(node, "BlockStatement");
  };
  pp$8.parseFor = function(node, init) {
    node.init = init;
    this.expect(types$1.semi);
    node.test = this.type === types$1.semi ? null : this.parseExpression();
    this.expect(types$1.semi);
    node.update = this.type === types$1.parenR ? null : this.parseExpression();
    this.expect(types$1.parenR);
    node.body = this.parseStatement("for");
    this.exitScope();
    this.labels.pop();
    return this.finishNode(node, "ForStatement");
  };
  pp$8.parseForIn = function(node, init) {
    var isForIn = this.type === types$1._in;
    this.next();
    if (init.type === "VariableDeclaration" && init.declarations[0].init != null && (!isForIn || this.options.ecmaVersion < 8 || this.strict || init.kind !== "var" || init.declarations[0].id.type !== "Identifier")) {
      this.raise(init.start, (isForIn ? "for-in" : "for-of") + " loop variable declaration may not have an initializer");
    }
    node.left = init;
    node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign();
    this.expect(types$1.parenR);
    node.body = this.parseStatement("for");
    this.exitScope();
    this.labels.pop();
    return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement");
  };
  pp$8.parseVar = function(node, isFor, kind, allowMissingInitializer) {
    node.declarations = [];
    node.kind = kind;
    for (;; ) {
      var decl = this.startNode();
      this.parseVarId(decl, kind);
      if (this.eat(types$1.eq)) {
        decl.init = this.parseMaybeAssign(isFor);
      } else if (!allowMissingInitializer && kind === "const" && !(this.type === types$1._in || this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
        this.unexpected();
      } else if (!allowMissingInitializer && (kind === "using" || kind === "await using") && this.options.ecmaVersion >= 17 && this.type !== types$1._in && !this.isContextual("of")) {
        this.raise(this.lastTokEnd, "Missing initializer in " + kind + " declaration");
      } else if (!allowMissingInitializer && decl.id.type !== "Identifier" && !(isFor && (this.type === types$1._in || this.isContextual("of")))) {
        this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
      } else {
        decl.init = null;
      }
      node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
      if (!this.eat(types$1.comma)) {
        break;
      }
    }
    return node;
  };
  pp$8.parseVarId = function(decl, kind) {
    decl.id = kind === "using" || kind === "await using" ? this.parseIdent() : this.parseBindingAtom();
    this.checkLValPattern(decl.id, kind === "var" ? BIND_VAR : BIND_LEXICAL, false);
  };
  pp$8.parseFunction = function(node, statement, allowExpressionBody, isAsync, forInit) {
    this.initFunction(node);
    if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync) {
      if (this.type === types$1.star && statement & FUNC_HANGING_STATEMENT) {
        this.unexpected();
      }
      node.generator = this.eat(types$1.star);
    }
    if (this.options.ecmaVersion >= 8) {
      node.async = !!isAsync;
    }
    if (statement & FUNC_STATEMENT) {
      node.id = statement & FUNC_NULLABLE_ID && this.type !== types$1.name ? null : this.parseIdent();
      if (node.id && !(statement & FUNC_HANGING_STATEMENT)) {
        this.checkLValSimple(node.id, this.strict || node.generator || node.async ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION);
      }
    }
    var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    this.enterScope(functionFlags(node.async, node.generator));
    if (!(statement & FUNC_STATEMENT)) {
      node.id = this.type === types$1.name ? this.parseIdent() : null;
    }
    this.parseFunctionParams(node);
    this.parseFunctionBody(node, allowExpressionBody, false, forInit);
    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, statement & FUNC_STATEMENT ? "FunctionDeclaration" : "FunctionExpression");
  };
  pp$8.parseFunctionParams = function(node) {
    this.expect(types$1.parenL);
    node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
    this.checkYieldAwaitInDefaultParams();
  };
  pp$8.parseClass = function(node, isStatement) {
    this.next();
    var oldStrict = this.strict;
    this.strict = true;
    this.parseClassId(node, isStatement);
    this.parseClassSuper(node);
    var privateNameMap = this.enterClassBody();
    var classBody = this.startNode();
    var hadConstructor = false;
    classBody.body = [];
    this.expect(types$1.braceL);
    while (this.type !== types$1.braceR) {
      var element = this.parseClassElement(node.superClass !== null);
      if (element) {
        classBody.body.push(element);
        if (element.type === "MethodDefinition" && element.kind === "constructor") {
          if (hadConstructor) {
            this.raiseRecoverable(element.start, "Duplicate constructor in the same class");
          }
          hadConstructor = true;
        } else if (element.key && element.key.type === "PrivateIdentifier" && isPrivateNameConflicted(privateNameMap, element)) {
          this.raiseRecoverable(element.key.start, "Identifier '#" + element.key.name + "' has already been declared");
        }
      }
    }
    this.strict = oldStrict;
    this.next();
    node.body = this.finishNode(classBody, "ClassBody");
    this.exitClassBody();
    return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
  };
  pp$8.parseClassElement = function(constructorAllowsSuper) {
    if (this.eat(types$1.semi)) {
      return null;
    }
    var ecmaVersion = this.options.ecmaVersion;
    var node = this.startNode();
    var keyName = "";
    var isGenerator = false;
    var isAsync = false;
    var kind = "method";
    var isStatic = false;
    if (this.eatContextual("static")) {
      if (ecmaVersion >= 13 && this.eat(types$1.braceL)) {
        this.parseClassStaticBlock(node);
        return node;
      }
      if (this.isClassElementNameStart() || this.type === types$1.star) {
        isStatic = true;
      } else {
        keyName = "static";
      }
    }
    node.static = isStatic;
    if (!keyName && ecmaVersion >= 8 && this.eatContextual("async")) {
      if ((this.isClassElementNameStart() || this.type === types$1.star) && !this.canInsertSemicolon()) {
        isAsync = true;
      } else {
        keyName = "async";
      }
    }
    if (!keyName && (ecmaVersion >= 9 || !isAsync) && this.eat(types$1.star)) {
      isGenerator = true;
    }
    if (!keyName && !isAsync && !isGenerator) {
      var lastValue = this.value;
      if (this.eatContextual("get") || this.eatContextual("set")) {
        if (this.isClassElementNameStart()) {
          kind = lastValue;
        } else {
          keyName = lastValue;
        }
      }
    }
    if (keyName) {
      node.computed = false;
      node.key = this.startNodeAt(this.lastTokStart, this.lastTokStartLoc);
      node.key.name = keyName;
      this.finishNode(node.key, "Identifier");
    } else {
      this.parseClassElementName(node);
    }
    if (ecmaVersion < 13 || this.type === types$1.parenL || kind !== "method" || isGenerator || isAsync) {
      var isConstructor = !node.static && checkKeyName(node, "constructor");
      var allowsDirectSuper = isConstructor && constructorAllowsSuper;
      if (isConstructor && kind !== "method") {
        this.raise(node.key.start, "Constructor can't have get/set modifier");
      }
      node.kind = isConstructor ? "constructor" : kind;
      this.parseClassMethod(node, isGenerator, isAsync, allowsDirectSuper);
    } else {
      this.parseClassField(node);
    }
    return node;
  };
  pp$8.isClassElementNameStart = function() {
    return this.type === types$1.name || this.type === types$1.privateId || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword;
  };
  pp$8.parseClassElementName = function(element) {
    if (this.type === types$1.privateId) {
      if (this.value === "constructor") {
        this.raise(this.start, "Classes can't have an element named '#constructor'");
      }
      element.computed = false;
      element.key = this.parsePrivateIdent();
    } else {
      this.parsePropertyName(element);
    }
  };
  pp$8.parseClassMethod = function(method, isGenerator, isAsync, allowsDirectSuper) {
    var key = method.key;
    if (method.kind === "constructor") {
      if (isGenerator) {
        this.raise(key.start, "Constructor can't be a generator");
      }
      if (isAsync) {
        this.raise(key.start, "Constructor can't be an async method");
      }
    } else if (method.static && checkKeyName(method, "prototype")) {
      this.raise(key.start, "Classes may not have a static property named prototype");
    }
    var value = method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper);
    if (method.kind === "get" && value.params.length !== 0) {
      this.raiseRecoverable(value.start, "getter should have no params");
    }
    if (method.kind === "set" && value.params.length !== 1) {
      this.raiseRecoverable(value.start, "setter should have exactly one param");
    }
    if (method.kind === "set" && value.params[0].type === "RestElement") {
      this.raiseRecoverable(value.params[0].start, "Setter cannot use rest params");
    }
    return this.finishNode(method, "MethodDefinition");
  };
  pp$8.parseClassField = function(field) {
    if (checkKeyName(field, "constructor")) {
      this.raise(field.key.start, "Classes can't have a field named 'constructor'");
    } else if (field.static && checkKeyName(field, "prototype")) {
      this.raise(field.key.start, "Classes can't have a static field named 'prototype'");
    }
    if (this.eat(types$1.eq)) {
      this.enterScope(SCOPE_CLASS_FIELD_INIT | SCOPE_SUPER);
      field.value = this.parseMaybeAssign();
      this.exitScope();
    } else {
      field.value = null;
    }
    this.semicolon();
    return this.finishNode(field, "PropertyDefinition");
  };
  pp$8.parseClassStaticBlock = function(node) {
    node.body = [];
    var oldLabels = this.labels;
    this.labels = [];
    this.enterScope(SCOPE_CLASS_STATIC_BLOCK | SCOPE_SUPER);
    while (this.type !== types$1.braceR) {
      var stmt = this.parseStatement(null);
      node.body.push(stmt);
    }
    this.next();
    this.exitScope();
    this.labels = oldLabels;
    return this.finishNode(node, "StaticBlock");
  };
  pp$8.parseClassId = function(node, isStatement) {
    if (this.type === types$1.name) {
      node.id = this.parseIdent();
      if (isStatement) {
        this.checkLValSimple(node.id, BIND_LEXICAL, false);
      }
    } else {
      if (isStatement === true) {
        this.unexpected();
      }
      node.id = null;
    }
  };
  pp$8.parseClassSuper = function(node) {
    node.superClass = this.eat(types$1._extends) ? this.parseExprSubscripts(null, false) : null;
  };
  pp$8.enterClassBody = function() {
    var element = { declared: Object.create(null), used: [] };
    this.privateNameStack.push(element);
    return element.declared;
  };
  pp$8.exitClassBody = function() {
    var ref = this.privateNameStack.pop();
    var declared = ref.declared;
    var used = ref.used;
    if (!this.options.checkPrivateFields) {
      return;
    }
    var len = this.privateNameStack.length;
    var parent = len === 0 ? null : this.privateNameStack[len - 1];
    for (var i = 0;i < used.length; ++i) {
      var id = used[i];
      if (!hasOwn(declared, id.name)) {
        if (parent) {
          parent.used.push(id);
        } else {
          this.raiseRecoverable(id.start, "Private field '#" + id.name + "' must be declared in an enclosing class");
        }
      }
    }
  };
  pp$8.parseExportAllDeclaration = function(node, exports$1) {
    if (this.options.ecmaVersion >= 11) {
      if (this.eatContextual("as")) {
        node.exported = this.parseModuleExportName();
        this.checkExport(exports$1, node.exported, this.lastTokStart);
      } else {
        node.exported = null;
      }
    }
    this.expectContextual("from");
    if (this.type !== types$1.string) {
      this.unexpected();
    }
    node.source = this.parseExprAtom();
    if (this.options.ecmaVersion >= 16) {
      node.attributes = this.parseWithClause();
    }
    this.semicolon();
    return this.finishNode(node, "ExportAllDeclaration");
  };
  pp$8.parseExport = function(node, exports$1) {
    this.next();
    if (this.eat(types$1.star)) {
      return this.parseExportAllDeclaration(node, exports$1);
    }
    if (this.eat(types$1._default)) {
      this.checkExport(exports$1, "default", this.lastTokStart);
      node.declaration = this.parseExportDefaultDeclaration();
      return this.finishNode(node, "ExportDefaultDeclaration");
    }
    if (this.shouldParseExportStatement()) {
      node.declaration = this.parseExportDeclaration(node);
      if (node.declaration.type === "VariableDeclaration") {
        this.checkVariableExport(exports$1, node.declaration.declarations);
      } else {
        this.checkExport(exports$1, node.declaration.id, node.declaration.id.start);
      }
      node.specifiers = [];
      node.source = null;
      if (this.options.ecmaVersion >= 16) {
        node.attributes = [];
      }
    } else {
      node.declaration = null;
      node.specifiers = this.parseExportSpecifiers(exports$1);
      if (this.eatContextual("from")) {
        if (this.type !== types$1.string) {
          this.unexpected();
        }
        node.source = this.parseExprAtom();
        if (this.options.ecmaVersion >= 16) {
          node.attributes = this.parseWithClause();
        }
      } else {
        for (var i = 0, list = node.specifiers;i < list.length; i += 1) {
          var spec = list[i];
          this.checkUnreserved(spec.local);
          this.checkLocalExport(spec.local);
          if (spec.local.type === "Literal") {
            this.raise(spec.local.start, "A string literal cannot be used as an exported binding without `from`.");
          }
        }
        node.source = null;
        if (this.options.ecmaVersion >= 16) {
          node.attributes = [];
        }
      }
      this.semicolon();
    }
    return this.finishNode(node, "ExportNamedDeclaration");
  };
  pp$8.parseExportDeclaration = function(node) {
    return this.parseStatement(null);
  };
  pp$8.parseExportDefaultDeclaration = function() {
    var isAsync;
    if (this.type === types$1._function || (isAsync = this.isAsyncFunction())) {
      var fNode = this.startNode();
      this.next();
      if (isAsync) {
        this.next();
      }
      return this.parseFunction(fNode, FUNC_STATEMENT | FUNC_NULLABLE_ID, false, isAsync);
    } else if (this.type === types$1._class) {
      var cNode = this.startNode();
      return this.parseClass(cNode, "nullableID");
    } else {
      var declaration = this.parseMaybeAssign();
      this.semicolon();
      return declaration;
    }
  };
  pp$8.checkExport = function(exports$1, name, pos) {
    if (!exports$1) {
      return;
    }
    if (typeof name !== "string") {
      name = name.type === "Identifier" ? name.name : name.value;
    }
    if (hasOwn(exports$1, name)) {
      this.raiseRecoverable(pos, "Duplicate export '" + name + "'");
    }
    exports$1[name] = true;
  };
  pp$8.checkPatternExport = function(exports$1, pat) {
    var type = pat.type;
    if (type === "Identifier") {
      this.checkExport(exports$1, pat, pat.start);
    } else if (type === "ObjectPattern") {
      for (var i = 0, list = pat.properties;i < list.length; i += 1) {
        var prop = list[i];
        this.checkPatternExport(exports$1, prop);
      }
    } else if (type === "ArrayPattern") {
      for (var i$1 = 0, list$1 = pat.elements;i$1 < list$1.length; i$1 += 1) {
        var elt = list$1[i$1];
        if (elt) {
          this.checkPatternExport(exports$1, elt);
        }
      }
    } else if (type === "Property") {
      this.checkPatternExport(exports$1, pat.value);
    } else if (type === "AssignmentPattern") {
      this.checkPatternExport(exports$1, pat.left);
    } else if (type === "RestElement") {
      this.checkPatternExport(exports$1, pat.argument);
    }
  };
  pp$8.checkVariableExport = function(exports$1, decls) {
    if (!exports$1) {
      return;
    }
    for (var i = 0, list = decls;i < list.length; i += 1) {
      var decl = list[i];
      this.checkPatternExport(exports$1, decl.id);
    }
  };
  pp$8.shouldParseExportStatement = function() {
    return this.type.keyword === "var" || this.type.keyword === "const" || this.type.keyword === "class" || this.type.keyword === "function" || this.isLet() || this.isAsyncFunction();
  };
  pp$8.parseExportSpecifier = function(exports$1) {
    var node = this.startNode();
    node.local = this.parseModuleExportName();
    node.exported = this.eatContextual("as") ? this.parseModuleExportName() : node.local;
    this.checkExport(exports$1, node.exported, node.exported.start);
    return this.finishNode(node, "ExportSpecifier");
  };
  pp$8.parseExportSpecifiers = function(exports$1) {
    var nodes = [], first = true;
    this.expect(types$1.braceL);
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.afterTrailingComma(types$1.braceR)) {
          break;
        }
      } else {
        first = false;
      }
      nodes.push(this.parseExportSpecifier(exports$1));
    }
    return nodes;
  };
  pp$8.parseImport = function(node) {
    this.next();
    if (this.type === types$1.string) {
      node.specifiers = empty$1;
      node.source = this.parseExprAtom();
    } else {
      node.specifiers = this.parseImportSpecifiers();
      this.expectContextual("from");
      node.source = this.type === types$1.string ? this.parseExprAtom() : this.unexpected();
    }
    if (this.options.ecmaVersion >= 16) {
      node.attributes = this.parseWithClause();
    }
    this.semicolon();
    return this.finishNode(node, "ImportDeclaration");
  };
  pp$8.parseImportSpecifier = function() {
    var node = this.startNode();
    node.imported = this.parseModuleExportName();
    if (this.eatContextual("as")) {
      node.local = this.parseIdent();
    } else {
      this.checkUnreserved(node.imported);
      node.local = node.imported;
    }
    this.checkLValSimple(node.local, BIND_LEXICAL);
    return this.finishNode(node, "ImportSpecifier");
  };
  pp$8.parseImportDefaultSpecifier = function() {
    var node = this.startNode();
    node.local = this.parseIdent();
    this.checkLValSimple(node.local, BIND_LEXICAL);
    return this.finishNode(node, "ImportDefaultSpecifier");
  };
  pp$8.parseImportNamespaceSpecifier = function() {
    var node = this.startNode();
    this.next();
    this.expectContextual("as");
    node.local = this.parseIdent();
    this.checkLValSimple(node.local, BIND_LEXICAL);
    return this.finishNode(node, "ImportNamespaceSpecifier");
  };
  pp$8.parseImportSpecifiers = function() {
    var nodes = [], first = true;
    if (this.type === types$1.name) {
      nodes.push(this.parseImportDefaultSpecifier());
      if (!this.eat(types$1.comma)) {
        return nodes;
      }
    }
    if (this.type === types$1.star) {
      nodes.push(this.parseImportNamespaceSpecifier());
      return nodes;
    }
    this.expect(types$1.braceL);
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.afterTrailingComma(types$1.braceR)) {
          break;
        }
      } else {
        first = false;
      }
      nodes.push(this.parseImportSpecifier());
    }
    return nodes;
  };
  pp$8.parseWithClause = function() {
    var nodes = [];
    if (!this.eat(types$1._with)) {
      return nodes;
    }
    this.expect(types$1.braceL);
    var attributeKeys = {};
    var first = true;
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.afterTrailingComma(types$1.braceR)) {
          break;
        }
      } else {
        first = false;
      }
      var attr = this.parseImportAttribute();
      var keyName = attr.key.type === "Identifier" ? attr.key.name : attr.key.value;
      if (hasOwn(attributeKeys, keyName)) {
        this.raiseRecoverable(attr.key.start, "Duplicate attribute key '" + keyName + "'");
      }
      attributeKeys[keyName] = true;
      nodes.push(attr);
    }
    return nodes;
  };
  pp$8.parseImportAttribute = function() {
    var node = this.startNode();
    node.key = this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
    this.expect(types$1.colon);
    if (this.type !== types$1.string) {
      this.unexpected();
    }
    node.value = this.parseExprAtom();
    return this.finishNode(node, "ImportAttribute");
  };
  pp$8.parseModuleExportName = function() {
    if (this.options.ecmaVersion >= 13 && this.type === types$1.string) {
      var stringLiteral = this.parseLiteral(this.value);
      if (loneSurrogate.test(stringLiteral.value)) {
        this.raise(stringLiteral.start, "An export name cannot include a lone surrogate.");
      }
      return stringLiteral;
    }
    return this.parseIdent(true);
  };
  pp$8.adaptDirectivePrologue = function(statements) {
    for (var i = 0;i < statements.length && this.isDirectiveCandidate(statements[i]); ++i) {
      statements[i].directive = statements[i].expression.raw.slice(1, -1);
    }
  };
  pp$8.isDirectiveCandidate = function(statement) {
    return this.options.ecmaVersion >= 5 && statement.type === "ExpressionStatement" && statement.expression.type === "Literal" && typeof statement.expression.value === "string" && (this.input[statement.start] === '"' || this.input[statement.start] === "'");
  };
  pp$7 = Parser.prototype;
  pp$7.toAssignable = function(node, isBinding, refDestructuringErrors) {
    if (this.options.ecmaVersion >= 6 && node) {
      switch (node.type) {
        case "Identifier":
          if (this.inAsync && node.name === "await") {
            this.raise(node.start, "Cannot use 'await' as identifier inside an async function");
          }
          break;
        case "ObjectPattern":
        case "ArrayPattern":
        case "AssignmentPattern":
        case "RestElement":
          break;
        case "ObjectExpression":
          node.type = "ObjectPattern";
          if (refDestructuringErrors) {
            this.checkPatternErrors(refDestructuringErrors, true);
          }
          for (var i = 0, list = node.properties;i < list.length; i += 1) {
            var prop = list[i];
            this.toAssignable(prop, isBinding);
            if (prop.type === "RestElement" && (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")) {
              this.raise(prop.argument.start, "Unexpected token");
            }
          }
          break;
        case "Property":
          if (node.kind !== "init") {
            this.raise(node.key.start, "Object pattern can't contain getter or setter");
          }
          this.toAssignable(node.value, isBinding);
          break;
        case "ArrayExpression":
          node.type = "ArrayPattern";
          if (refDestructuringErrors) {
            this.checkPatternErrors(refDestructuringErrors, true);
          }
          this.toAssignableList(node.elements, isBinding);
          break;
        case "SpreadElement":
          node.type = "RestElement";
          this.toAssignable(node.argument, isBinding);
          if (node.argument.type === "AssignmentPattern") {
            this.raise(node.argument.start, "Rest elements cannot have a default value");
          }
          break;
        case "AssignmentExpression":
          if (node.operator !== "=") {
            this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
          }
          node.type = "AssignmentPattern";
          delete node.operator;
          this.toAssignable(node.left, isBinding);
          break;
        case "ParenthesizedExpression":
          this.toAssignable(node.expression, isBinding, refDestructuringErrors);
          break;
        case "ChainExpression":
          this.raiseRecoverable(node.start, "Optional chaining cannot appear in left-hand side");
          break;
        case "MemberExpression":
          if (!isBinding) {
            break;
          }
        default:
          this.raise(node.start, "Assigning to rvalue");
      }
    } else if (refDestructuringErrors) {
      this.checkPatternErrors(refDestructuringErrors, true);
    }
    return node;
  };
  pp$7.toAssignableList = function(exprList, isBinding) {
    var end = exprList.length;
    for (var i = 0;i < end; i++) {
      var elt = exprList[i];
      if (elt) {
        this.toAssignable(elt, isBinding);
      }
    }
    if (end) {
      var last = exprList[end - 1];
      if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier") {
        this.unexpected(last.argument.start);
      }
    }
    return exprList;
  };
  pp$7.parseSpread = function(refDestructuringErrors) {
    var node = this.startNode();
    this.next();
    node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
    return this.finishNode(node, "SpreadElement");
  };
  pp$7.parseRestBinding = function() {
    var node = this.startNode();
    this.next();
    if (this.options.ecmaVersion === 6 && this.type !== types$1.name) {
      this.unexpected();
    }
    node.argument = this.parseBindingAtom();
    return this.finishNode(node, "RestElement");
  };
  pp$7.parseBindingAtom = function() {
    if (this.options.ecmaVersion >= 6) {
      switch (this.type) {
        case types$1.bracketL:
          var node = this.startNode();
          this.next();
          node.elements = this.parseBindingList(types$1.bracketR, true, true);
          return this.finishNode(node, "ArrayPattern");
        case types$1.braceL:
          return this.parseObj(true);
      }
    }
    return this.parseIdent();
  };
  pp$7.parseBindingList = function(close, allowEmpty, allowTrailingComma, allowModifiers) {
    var elts = [], first = true;
    while (!this.eat(close)) {
      if (first) {
        first = false;
      } else {
        this.expect(types$1.comma);
      }
      if (allowEmpty && this.type === types$1.comma) {
        elts.push(null);
      } else if (allowTrailingComma && this.afterTrailingComma(close)) {
        break;
      } else if (this.type === types$1.ellipsis) {
        var rest = this.parseRestBinding();
        this.parseBindingListItem(rest);
        elts.push(rest);
        if (this.type === types$1.comma) {
          this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
        }
        this.expect(close);
        break;
      } else {
        elts.push(this.parseAssignableListItem(allowModifiers));
      }
    }
    return elts;
  };
  pp$7.parseAssignableListItem = function(allowModifiers) {
    var elem = this.parseMaybeDefault(this.start, this.startLoc);
    this.parseBindingListItem(elem);
    return elem;
  };
  pp$7.parseBindingListItem = function(param) {
    return param;
  };
  pp$7.parseMaybeDefault = function(startPos, startLoc, left) {
    left = left || this.parseBindingAtom();
    if (this.options.ecmaVersion < 6 || !this.eat(types$1.eq)) {
      return left;
    }
    var node = this.startNodeAt(startPos, startLoc);
    node.left = left;
    node.right = this.parseMaybeAssign();
    return this.finishNode(node, "AssignmentPattern");
  };
  pp$7.checkLValSimple = function(expr, bindingType, checkClashes) {
    if (bindingType === undefined)
      bindingType = BIND_NONE;
    var isBind = bindingType !== BIND_NONE;
    switch (expr.type) {
      case "Identifier":
        if (this.strict && this.reservedWordsStrictBind.test(expr.name)) {
          this.raiseRecoverable(expr.start, (isBind ? "Binding " : "Assigning to ") + expr.name + " in strict mode");
        }
        if (isBind) {
          if (bindingType === BIND_LEXICAL && expr.name === "let") {
            this.raiseRecoverable(expr.start, "let is disallowed as a lexically bound name");
          }
          if (checkClashes) {
            if (hasOwn(checkClashes, expr.name)) {
              this.raiseRecoverable(expr.start, "Argument name clash");
            }
            checkClashes[expr.name] = true;
          }
          if (bindingType !== BIND_OUTSIDE) {
            this.declareName(expr.name, bindingType, expr.start);
          }
        }
        break;
      case "ChainExpression":
        this.raiseRecoverable(expr.start, "Optional chaining cannot appear in left-hand side");
        break;
      case "MemberExpression":
        if (isBind) {
          this.raiseRecoverable(expr.start, "Binding member expression");
        }
        break;
      case "ParenthesizedExpression":
        if (isBind) {
          this.raiseRecoverable(expr.start, "Binding parenthesized expression");
        }
        return this.checkLValSimple(expr.expression, bindingType, checkClashes);
      default:
        this.raise(expr.start, (isBind ? "Binding" : "Assigning to") + " rvalue");
    }
  };
  pp$7.checkLValPattern = function(expr, bindingType, checkClashes) {
    if (bindingType === undefined)
      bindingType = BIND_NONE;
    switch (expr.type) {
      case "ObjectPattern":
        for (var i = 0, list = expr.properties;i < list.length; i += 1) {
          var prop = list[i];
          this.checkLValInnerPattern(prop, bindingType, checkClashes);
        }
        break;
      case "ArrayPattern":
        for (var i$1 = 0, list$1 = expr.elements;i$1 < list$1.length; i$1 += 1) {
          var elem = list$1[i$1];
          if (elem) {
            this.checkLValInnerPattern(elem, bindingType, checkClashes);
          }
        }
        break;
      default:
        this.checkLValSimple(expr, bindingType, checkClashes);
    }
  };
  pp$7.checkLValInnerPattern = function(expr, bindingType, checkClashes) {
    if (bindingType === undefined)
      bindingType = BIND_NONE;
    switch (expr.type) {
      case "Property":
        this.checkLValInnerPattern(expr.value, bindingType, checkClashes);
        break;
      case "AssignmentPattern":
        this.checkLValPattern(expr.left, bindingType, checkClashes);
        break;
      case "RestElement":
        this.checkLValPattern(expr.argument, bindingType, checkClashes);
        break;
      default:
        this.checkLValPattern(expr, bindingType, checkClashes);
    }
  };
  types = {
    b_stat: new TokContext("{", false),
    b_expr: new TokContext("{", true),
    b_tmpl: new TokContext("${", false),
    p_stat: new TokContext("(", false),
    p_expr: new TokContext("(", true),
    q_tmpl: new TokContext("`", true, true, function(p) {
      return p.tryReadTemplateToken();
    }),
    f_stat: new TokContext("function", false),
    f_expr: new TokContext("function", true),
    f_expr_gen: new TokContext("function", true, false, null, true),
    f_gen: new TokContext("function", false, false, null, true)
  };
  pp$6 = Parser.prototype;
  pp$6.initialContext = function() {
    return [types.b_stat];
  };
  pp$6.curContext = function() {
    return this.context[this.context.length - 1];
  };
  pp$6.braceIsBlock = function(prevType) {
    var parent = this.curContext();
    if (parent === types.f_expr || parent === types.f_stat) {
      return true;
    }
    if (prevType === types$1.colon && (parent === types.b_stat || parent === types.b_expr)) {
      return !parent.isExpr;
    }
    if (prevType === types$1._return || prevType === types$1.name && this.exprAllowed) {
      return lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
    }
    if (prevType === types$1._else || prevType === types$1.semi || prevType === types$1.eof || prevType === types$1.parenR || prevType === types$1.arrow) {
      return true;
    }
    if (prevType === types$1.braceL) {
      return parent === types.b_stat;
    }
    if (prevType === types$1._var || prevType === types$1._const || prevType === types$1.name) {
      return false;
    }
    return !this.exprAllowed;
  };
  pp$6.inGeneratorContext = function() {
    for (var i = this.context.length - 1;i >= 1; i--) {
      var context = this.context[i];
      if (context.token === "function") {
        return context.generator;
      }
    }
    return false;
  };
  pp$6.updateContext = function(prevType) {
    var update, type = this.type;
    if (type.keyword && prevType === types$1.dot) {
      this.exprAllowed = false;
    } else if (update = type.updateContext) {
      update.call(this, prevType);
    } else {
      this.exprAllowed = type.beforeExpr;
    }
  };
  pp$6.overrideContext = function(tokenCtx) {
    if (this.curContext() !== tokenCtx) {
      this.context[this.context.length - 1] = tokenCtx;
    }
  };
  types$1.parenR.updateContext = types$1.braceR.updateContext = function() {
    if (this.context.length === 1) {
      this.exprAllowed = true;
      return;
    }
    var out = this.context.pop();
    if (out === types.b_stat && this.curContext().token === "function") {
      out = this.context.pop();
    }
    this.exprAllowed = !out.isExpr;
  };
  types$1.braceL.updateContext = function(prevType) {
    this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
    this.exprAllowed = true;
  };
  types$1.dollarBraceL.updateContext = function() {
    this.context.push(types.b_tmpl);
    this.exprAllowed = true;
  };
  types$1.parenL.updateContext = function(prevType) {
    var statementParens = prevType === types$1._if || prevType === types$1._for || prevType === types$1._with || prevType === types$1._while;
    this.context.push(statementParens ? types.p_stat : types.p_expr);
    this.exprAllowed = true;
  };
  types$1.incDec.updateContext = function() {};
  types$1._function.updateContext = types$1._class.updateContext = function(prevType) {
    if (prevType.beforeExpr && prevType !== types$1._else && !(prevType === types$1.semi && this.curContext() !== types.p_stat) && !(prevType === types$1._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) && !((prevType === types$1.colon || prevType === types$1.braceL) && this.curContext() === types.b_stat)) {
      this.context.push(types.f_expr);
    } else {
      this.context.push(types.f_stat);
    }
    this.exprAllowed = false;
  };
  types$1.colon.updateContext = function() {
    if (this.curContext().token === "function") {
      this.context.pop();
    }
    this.exprAllowed = true;
  };
  types$1.backQuote.updateContext = function() {
    if (this.curContext() === types.q_tmpl) {
      this.context.pop();
    } else {
      this.context.push(types.q_tmpl);
    }
    this.exprAllowed = false;
  };
  types$1.star.updateContext = function(prevType) {
    if (prevType === types$1._function) {
      var index = this.context.length - 1;
      if (this.context[index] === types.f_expr) {
        this.context[index] = types.f_expr_gen;
      } else {
        this.context[index] = types.f_gen;
      }
    }
    this.exprAllowed = true;
  };
  types$1.name.updateContext = function(prevType) {
    var allowed = false;
    if (this.options.ecmaVersion >= 6 && prevType !== types$1.dot) {
      if (this.value === "of" && !this.exprAllowed || this.value === "yield" && this.inGeneratorContext()) {
        allowed = true;
      }
    }
    this.exprAllowed = allowed;
  };
  pp$5 = Parser.prototype;
  pp$5.checkPropClash = function(prop, propHash, refDestructuringErrors) {
    if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement") {
      return;
    }
    if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand)) {
      return;
    }
    var key = prop.key;
    var name;
    switch (key.type) {
      case "Identifier":
        name = key.name;
        break;
      case "Literal":
        name = String(key.value);
        break;
      default:
        return;
    }
    var kind = prop.kind;
    if (this.options.ecmaVersion >= 6) {
      if (name === "__proto__" && kind === "init") {
        if (propHash.proto) {
          if (refDestructuringErrors) {
            if (refDestructuringErrors.doubleProto < 0) {
              refDestructuringErrors.doubleProto = key.start;
            }
          } else {
            this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
          }
        }
        propHash.proto = true;
      }
      return;
    }
    name = "$" + name;
    var other = propHash[name];
    if (other) {
      var redefinition;
      if (kind === "init") {
        redefinition = this.strict && other.init || other.get || other.set;
      } else {
        redefinition = other.init || other[kind];
      }
      if (redefinition) {
        this.raiseRecoverable(key.start, "Redefinition of property");
      }
    } else {
      other = propHash[name] = {
        init: false,
        get: false,
        set: false
      };
    }
    other[kind] = true;
  };
  pp$5.parseExpression = function(forInit, refDestructuringErrors) {
    var this$1$1 = this;
    return this.catchStackOverflow(function() {
      var { start: startPos, startLoc } = this$1$1;
      var expr = this$1$1.parseMaybeAssign(forInit, refDestructuringErrors);
      if (this$1$1.type === types$1.comma) {
        var node = this$1$1.startNodeAt(startPos, startLoc);
        node.expressions = [expr];
        while (this$1$1.eat(types$1.comma)) {
          node.expressions.push(this$1$1.parseMaybeAssign(forInit, refDestructuringErrors));
        }
        return this$1$1.finishNode(node, "SequenceExpression");
      }
      return expr;
    });
  };
  pp$5.parseMaybeAssign = function(forInit, refDestructuringErrors, afterLeftParse) {
    if (this.isContextual("yield")) {
      if (this.inGenerator) {
        return this.parseYield(forInit);
      } else {
        this.exprAllowed = false;
      }
    }
    var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1, oldDoubleProto = -1;
    if (refDestructuringErrors) {
      oldParenAssign = refDestructuringErrors.parenthesizedAssign;
      oldTrailingComma = refDestructuringErrors.trailingComma;
      oldDoubleProto = refDestructuringErrors.doubleProto;
      refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
    } else {
      refDestructuringErrors = new DestructuringErrors;
      ownDestructuringErrors = true;
    }
    var startPos = this.start, startLoc = this.startLoc;
    if (this.type === types$1.parenL || this.type === types$1.name) {
      this.potentialArrowAt = this.start;
      this.potentialArrowInForAwait = forInit === "await";
    }
    var left = this.parseMaybeConditional(forInit, refDestructuringErrors);
    if (afterLeftParse) {
      left = afterLeftParse.call(this, left, startPos, startLoc);
    }
    if (this.type.isAssign) {
      var node = this.startNodeAt(startPos, startLoc);
      node.operator = this.value;
      if (this.type === types$1.eq) {
        left = this.toAssignable(left, false, refDestructuringErrors);
      }
      if (!ownDestructuringErrors) {
        refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.doubleProto = -1;
      }
      if (refDestructuringErrors.shorthandAssign >= left.start) {
        refDestructuringErrors.shorthandAssign = -1;
      }
      if (this.type === types$1.eq) {
        this.checkLValPattern(left);
      } else {
        this.checkLValSimple(left);
      }
      node.left = left;
      this.next();
      node.right = this.parseMaybeAssign(forInit);
      if (oldDoubleProto > -1) {
        refDestructuringErrors.doubleProto = oldDoubleProto;
      }
      return this.finishNode(node, "AssignmentExpression");
    } else {
      if (ownDestructuringErrors) {
        this.checkExpressionErrors(refDestructuringErrors, true);
      }
    }
    if (oldParenAssign > -1) {
      refDestructuringErrors.parenthesizedAssign = oldParenAssign;
    }
    if (oldTrailingComma > -1) {
      refDestructuringErrors.trailingComma = oldTrailingComma;
    }
    return left;
  };
  pp$5.parseMaybeConditional = function(forInit, refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseExprOps(forInit, refDestructuringErrors);
    if (this.checkExpressionErrors(refDestructuringErrors)) {
      return expr;
    }
    if (!(expr.type === "ArrowFunctionExpression" && expr.start === startPos) && this.eat(types$1.question)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.test = expr;
      node.consequent = this.parseMaybeAssign();
      this.expect(types$1.colon);
      node.alternate = this.parseMaybeAssign(forInit);
      return this.finishNode(node, "ConditionalExpression");
    }
    return expr;
  };
  pp$5.parseExprOps = function(forInit, refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseMaybeUnary(refDestructuringErrors, false, false, forInit);
    if (this.checkExpressionErrors(refDestructuringErrors)) {
      return expr;
    }
    return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, forInit);
  };
  pp$5.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, forInit) {
    var prec = this.type.binop;
    if (prec != null && (!forInit || this.type !== types$1._in)) {
      if (prec > minPrec) {
        var logical = this.type === types$1.logicalOR || this.type === types$1.logicalAND;
        var coalesce = this.type === types$1.coalesce;
        if (coalesce) {
          prec = types$1.logicalAND.binop;
        }
        var op = this.value;
        this.next();
        var startPos = this.start, startLoc = this.startLoc;
        var right = this.parseExprOp(this.parseMaybeUnary(null, false, false, forInit), startPos, startLoc, prec, forInit);
        var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical || coalesce);
        if (logical && this.type === types$1.coalesce || coalesce && (this.type === types$1.logicalOR || this.type === types$1.logicalAND)) {
          this.raiseRecoverable(this.start, "Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses");
        }
        return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, forInit);
      }
    }
    return left;
  };
  pp$5.buildBinary = function(startPos, startLoc, left, right, op, logical) {
    if (right.type === "PrivateIdentifier") {
      this.raise(right.start, "Private identifier can only be left side of binary expression");
    }
    var node = this.startNodeAt(startPos, startLoc);
    node.left = left;
    node.operator = op;
    node.right = right;
    return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression");
  };
  pp$5.parseMaybeUnary = function(refDestructuringErrors, sawUnary, incDec, forInit) {
    var startPos = this.start, startLoc = this.startLoc, expr;
    if (this.isContextual("await") && this.canAwait) {
      expr = this.parseAwait(forInit);
      sawUnary = true;
    } else if (this.type.prefix) {
      var node = this.startNode(), update = this.type === types$1.incDec;
      node.operator = this.value;
      node.prefix = true;
      this.next();
      node.argument = this.parseMaybeUnary(null, true, update, forInit);
      this.checkExpressionErrors(refDestructuringErrors, true);
      if (update) {
        this.checkLValSimple(node.argument);
      } else if (this.strict && node.operator === "delete" && isLocalVariableAccess(node.argument)) {
        this.raiseRecoverable(node.start, "Deleting local variable in strict mode");
      } else if (node.operator === "delete" && isPrivateFieldAccess(node.argument)) {
        this.raiseRecoverable(node.start, "Private fields can not be deleted");
      } else {
        sawUnary = true;
      }
      expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
    } else if (!sawUnary && this.type === types$1.privateId) {
      if ((forInit || this.privateNameStack.length === 0) && this.options.checkPrivateFields) {
        this.unexpected();
      }
      expr = this.parsePrivateIdent();
      if (this.type !== types$1._in) {
        this.unexpected();
      }
    } else {
      expr = this.parseExprSubscripts(refDestructuringErrors, forInit);
      if (this.checkExpressionErrors(refDestructuringErrors)) {
        return expr;
      }
      while (this.type.postfix && !this.canInsertSemicolon()) {
        var node$1 = this.startNodeAt(startPos, startLoc);
        node$1.operator = this.value;
        node$1.prefix = false;
        node$1.argument = expr;
        this.checkLValSimple(expr);
        this.next();
        expr = this.finishNode(node$1, "UpdateExpression");
      }
    }
    if (!incDec && !(expr.type === "ArrowFunctionExpression" && expr.start === startPos) && this.eat(types$1.starstar)) {
      if (sawUnary) {
        this.unexpected(this.lastTokStart);
      } else {
        return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false, false, forInit), "**", false);
      }
    } else {
      return expr;
    }
  };
  pp$5.parseExprSubscripts = function(refDestructuringErrors, forInit) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseExprAtom(refDestructuringErrors, forInit);
    if (expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")") {
      return expr;
    }
    var result = this.parseSubscripts(expr, startPos, startLoc, false, forInit);
    if (refDestructuringErrors && result.type === "MemberExpression") {
      if (refDestructuringErrors.parenthesizedAssign >= result.start) {
        refDestructuringErrors.parenthesizedAssign = -1;
      }
      if (refDestructuringErrors.parenthesizedBind >= result.start) {
        refDestructuringErrors.parenthesizedBind = -1;
      }
      if (refDestructuringErrors.trailingComma >= result.start) {
        refDestructuringErrors.trailingComma = -1;
      }
    }
    return result;
  };
  pp$5.parseSubscripts = function(base, startPos, startLoc, noCalls, forInit) {
    var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" && this.lastTokEnd === base.end && !this.canInsertSemicolon() && base.end - base.start === 5 && this.potentialArrowAt === base.start;
    var optionalChained = false;
    while (true) {
      var element = this.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit);
      if (element.optional) {
        optionalChained = true;
      }
      if (element === base || element.type === "ArrowFunctionExpression") {
        if (optionalChained) {
          var chainNode = this.startNodeAt(startPos, startLoc);
          chainNode.expression = element;
          element = this.finishNode(chainNode, "ChainExpression");
        }
        return element;
      }
      base = element;
    }
  };
  pp$5.shouldParseAsyncArrow = function() {
    return !this.canInsertSemicolon() && this.eat(types$1.arrow);
  };
  pp$5.parseSubscriptAsyncArrow = function(startPos, startLoc, exprList, forInit) {
    return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, true, forInit);
  };
  pp$5.parseSubscript = function(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit) {
    var optionalSupported = this.options.ecmaVersion >= 11;
    var optional = optionalSupported && this.eat(types$1.questionDot);
    if (noCalls && optional) {
      this.raise(this.lastTokStart, "Optional chaining cannot appear in the callee of new expressions");
    }
    var computed = this.eat(types$1.bracketL);
    if (computed || optional && this.type !== types$1.parenL && this.type !== types$1.backQuote || this.eat(types$1.dot)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.object = base;
      if (computed) {
        node.property = this.parseExpression();
        this.expect(types$1.bracketR);
      } else if (this.type === types$1.privateId && base.type !== "Super") {
        node.property = this.parsePrivateIdent();
      } else {
        node.property = this.parseIdent(this.options.allowReserved !== "never");
      }
      node.computed = !!computed;
      if (optionalSupported) {
        node.optional = optional;
      }
      base = this.finishNode(node, "MemberExpression");
    } else if (!noCalls && this.eat(types$1.parenL)) {
      var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
      this.yieldPos = 0;
      this.awaitPos = 0;
      this.awaitIdentPos = 0;
      var exprList = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors);
      if (maybeAsyncArrow && !optional && this.shouldParseAsyncArrow()) {
        this.checkPatternErrors(refDestructuringErrors, false);
        this.checkYieldAwaitInDefaultParams();
        if (this.awaitIdentPos > 0) {
          this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function");
        }
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        this.awaitIdentPos = oldAwaitIdentPos;
        return this.parseSubscriptAsyncArrow(startPos, startLoc, exprList, forInit);
      }
      this.checkExpressionErrors(refDestructuringErrors, true);
      this.yieldPos = oldYieldPos || this.yieldPos;
      this.awaitPos = oldAwaitPos || this.awaitPos;
      this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos;
      var node$1 = this.startNodeAt(startPos, startLoc);
      node$1.callee = base;
      node$1.arguments = exprList;
      if (optionalSupported) {
        node$1.optional = optional;
      }
      base = this.finishNode(node$1, "CallExpression");
    } else if (this.type === types$1.backQuote) {
      if (optional || optionalChained) {
        this.raise(this.start, "Optional chaining cannot appear in the tag of tagged template expressions");
      }
      var node$2 = this.startNodeAt(startPos, startLoc);
      node$2.tag = base;
      node$2.quasi = this.parseTemplate({ isTagged: true });
      base = this.finishNode(node$2, "TaggedTemplateExpression");
    }
    return base;
  };
  pp$5.parseExprAtom = function(refDestructuringErrors, forInit, forNew) {
    if (this.type === types$1.slash) {
      this.readRegexp();
    }
    var node, canBeArrow = this.potentialArrowAt === this.start;
    switch (this.type) {
      case types$1._super:
        if (!this.allowSuper) {
          this.raise(this.start, "'super' keyword outside a method");
        }
        node = this.startNode();
        this.next();
        if (this.type === types$1.parenL && !this.allowDirectSuper) {
          this.raise(node.start, "super() call outside constructor of a subclass");
        }
        if (this.type !== types$1.dot && this.type !== types$1.bracketL && this.type !== types$1.parenL) {
          this.unexpected();
        }
        return this.finishNode(node, "Super");
      case types$1._this:
        node = this.startNode();
        this.next();
        return this.finishNode(node, "ThisExpression");
      case types$1.name:
        var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
        var id = this.parseIdent(false);
        if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types$1._function)) {
          this.overrideContext(types.f_expr);
          return this.parseFunction(this.startNodeAt(startPos, startLoc), 0, false, true, forInit);
        }
        if (canBeArrow && !this.canInsertSemicolon()) {
          if (this.eat(types$1.arrow)) {
            return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false, forInit);
          }
          if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types$1.name && !containsEsc && (!this.potentialArrowInForAwait || this.value !== "of" || this.containsEsc)) {
            id = this.parseIdent(false);
            if (this.canInsertSemicolon() || !this.eat(types$1.arrow)) {
              this.unexpected();
            }
            return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true, forInit);
          }
        }
        return id;
      case types$1.regexp:
        var value = this.value;
        node = this.parseLiteral(value.value);
        node.regex = { pattern: value.pattern, flags: value.flags };
        return node;
      case types$1.num:
      case types$1.string:
        return this.parseLiteral(this.value);
      case types$1._null:
      case types$1._true:
      case types$1._false:
        node = this.startNode();
        node.value = this.type === types$1._null ? null : this.type === types$1._true;
        node.raw = this.type.keyword;
        this.next();
        return this.finishNode(node, "Literal");
      case types$1.parenL:
        var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow, forInit);
        if (refDestructuringErrors) {
          if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr)) {
            refDestructuringErrors.parenthesizedAssign = start;
          }
          if (refDestructuringErrors.parenthesizedBind < 0) {
            refDestructuringErrors.parenthesizedBind = start;
          }
        }
        return expr;
      case types$1.bracketL:
        node = this.startNode();
        this.next();
        node.elements = this.parseExprList(types$1.bracketR, true, true, refDestructuringErrors);
        return this.finishNode(node, "ArrayExpression");
      case types$1.braceL:
        this.overrideContext(types.b_expr);
        return this.parseObj(false, refDestructuringErrors);
      case types$1._function:
        node = this.startNode();
        this.next();
        return this.parseFunction(node, 0);
      case types$1._class:
        return this.parseClass(this.startNode(), false);
      case types$1._new:
        return this.parseNew();
      case types$1.backQuote:
        return this.parseTemplate();
      case types$1._import:
        if (this.options.ecmaVersion >= 11) {
          return this.parseExprImport(forNew);
        } else {
          return this.unexpected();
        }
      default:
        return this.parseExprAtomDefault();
    }
  };
  pp$5.parseExprAtomDefault = function() {
    this.unexpected();
  };
  pp$5.parseExprImport = function(forNew) {
    var node = this.startNode();
    if (this.containsEsc) {
      this.raiseRecoverable(this.start, "Escape sequence in keyword import");
    }
    this.next();
    if (this.type === types$1.parenL && !forNew) {
      return this.parseDynamicImport(node);
    } else if (this.type === types$1.dot) {
      var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
      meta.name = "import";
      node.meta = this.finishNode(meta, "Identifier");
      return this.parseImportMeta(node);
    } else {
      this.unexpected();
    }
  };
  pp$5.parseDynamicImport = function(node) {
    this.next();
    node.source = this.parseMaybeAssign();
    if (this.options.ecmaVersion >= 16) {
      if (!this.eat(types$1.parenR)) {
        this.expect(types$1.comma);
        if (!this.afterTrailingComma(types$1.parenR)) {
          node.options = this.parseMaybeAssign();
          if (!this.eat(types$1.parenR)) {
            this.expect(types$1.comma);
            if (!this.afterTrailingComma(types$1.parenR)) {
              this.unexpected();
            }
          }
        } else {
          node.options = null;
        }
      } else {
        node.options = null;
      }
    } else {
      if (!this.eat(types$1.parenR)) {
        var errorPos = this.start;
        if (this.eat(types$1.comma) && this.eat(types$1.parenR)) {
          this.raiseRecoverable(errorPos, "Trailing comma is not allowed in import()");
        } else {
          this.unexpected(errorPos);
        }
      }
    }
    return this.finishNode(node, "ImportExpression");
  };
  pp$5.parseImportMeta = function(node) {
    this.next();
    var containsEsc = this.containsEsc;
    node.property = this.parseIdent(true);
    if (node.property.name !== "meta") {
      this.raiseRecoverable(node.property.start, "The only valid meta property for import is 'import.meta'");
    }
    if (containsEsc) {
      this.raiseRecoverable(node.start, "'import.meta' must not contain escaped characters");
    }
    if (this.options.sourceType !== "module" && !this.options.allowImportExportEverywhere) {
      this.raiseRecoverable(node.start, "Cannot use 'import.meta' outside a module");
    }
    return this.finishNode(node, "MetaProperty");
  };
  pp$5.parseLiteral = function(value) {
    var node = this.startNode();
    node.value = value;
    node.raw = this.input.slice(this.start, this.end);
    if (node.raw.charCodeAt(node.raw.length - 1) === 110) {
      node.bigint = node.value != null ? node.value.toString() : node.raw.slice(0, -1).replace(/_/g, "");
    }
    this.next();
    return this.finishNode(node, "Literal");
  };
  pp$5.parseParenExpression = function() {
    this.expect(types$1.parenL);
    var val = this.parseExpression();
    this.expect(types$1.parenR);
    return val;
  };
  pp$5.shouldParseArrow = function(exprList) {
    return !this.canInsertSemicolon();
  };
  pp$5.parseParenAndDistinguishExpression = function(canBeArrow, forInit) {
    var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
    if (this.options.ecmaVersion >= 6) {
      this.next();
      var innerStartPos = this.start, innerStartLoc = this.startLoc;
      var exprList = [], first = true, lastIsComma = false;
      var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
      this.yieldPos = 0;
      this.awaitPos = 0;
      while (this.type !== types$1.parenR) {
        first ? first = false : this.expect(types$1.comma);
        if (allowTrailingComma && this.afterTrailingComma(types$1.parenR, true)) {
          lastIsComma = true;
          break;
        } else if (this.type === types$1.ellipsis) {
          spreadStart = this.start;
          exprList.push(this.parseParenItem(this.parseRestBinding()));
          if (this.type === types$1.comma) {
            this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
          }
          break;
        } else {
          exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
        }
      }
      var innerEndPos = this.lastTokEnd, innerEndLoc = this.lastTokEndLoc;
      this.expect(types$1.parenR);
      if (canBeArrow && this.shouldParseArrow(exprList) && this.eat(types$1.arrow)) {
        this.checkPatternErrors(refDestructuringErrors, false);
        this.checkYieldAwaitInDefaultParams();
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        return this.parseParenArrowList(startPos, startLoc, exprList, forInit);
      }
      if (!exprList.length || lastIsComma) {
        this.unexpected(this.lastTokStart);
      }
      if (spreadStart) {
        this.unexpected(spreadStart);
      }
      this.checkExpressionErrors(refDestructuringErrors, true);
      this.yieldPos = oldYieldPos || this.yieldPos;
      this.awaitPos = oldAwaitPos || this.awaitPos;
      if (exprList.length > 1) {
        val = this.startNodeAt(innerStartPos, innerStartLoc);
        val.expressions = exprList;
        this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
      } else {
        val = exprList[0];
      }
    } else {
      val = this.parseParenExpression();
    }
    if (this.options.preserveParens) {
      var par = this.startNodeAt(startPos, startLoc);
      par.expression = val;
      return this.finishNode(par, "ParenthesizedExpression");
    } else {
      return val;
    }
  };
  pp$5.parseParenItem = function(item) {
    return item;
  };
  pp$5.parseParenArrowList = function(startPos, startLoc, exprList, forInit) {
    return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, false, forInit);
  };
  empty = [];
  pp$5.parseNew = function() {
    if (this.containsEsc) {
      this.raiseRecoverable(this.start, "Escape sequence in keyword new");
    }
    var node = this.startNode();
    this.next();
    if (this.options.ecmaVersion >= 6 && this.type === types$1.dot) {
      var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
      meta.name = "new";
      node.meta = this.finishNode(meta, "Identifier");
      this.next();
      var containsEsc = this.containsEsc;
      node.property = this.parseIdent(true);
      if (node.property.name !== "target") {
        this.raiseRecoverable(node.property.start, "The only valid meta property for new is 'new.target'");
      }
      if (containsEsc) {
        this.raiseRecoverable(node.start, "'new.target' must not contain escaped characters");
      }
      if (!this.allowNewDotTarget) {
        this.raiseRecoverable(node.start, "'new.target' can only be used in functions and class static block");
      }
      return this.finishNode(node, "MetaProperty");
    }
    var startPos = this.start, startLoc = this.startLoc;
    node.callee = this.parseSubscripts(this.parseExprAtom(null, false, true), startPos, startLoc, true, false);
    if (node.callee.type === "Super") {
      this.raiseRecoverable(startPos, "Invalid use of 'super'");
    }
    if (this.eat(types$1.parenL)) {
      node.arguments = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false);
    } else {
      node.arguments = empty;
    }
    return this.finishNode(node, "NewExpression");
  };
  pp$5.parseTemplateElement = function(ref) {
    var isTagged = ref.isTagged;
    var elem = this.startNode();
    if (this.type === types$1.invalidTemplate) {
      if (!isTagged) {
        this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
      }
      elem.value = {
        raw: this.value.replace(/\r\n?/g, `
`),
        cooked: null
      };
    } else {
      elem.value = {
        raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, `
`),
        cooked: this.value
      };
    }
    this.next();
    elem.tail = this.type === types$1.backQuote;
    return this.finishNode(elem, "TemplateElement");
  };
  pp$5.parseTemplate = function(ref) {
    if (ref === undefined)
      ref = {};
    var isTagged = ref.isTagged;
    if (isTagged === undefined)
      isTagged = false;
    var node = this.startNode();
    this.next();
    node.expressions = [];
    var curElt = this.parseTemplateElement({ isTagged });
    node.quasis = [curElt];
    while (!curElt.tail) {
      if (this.type === types$1.eof) {
        this.raise(this.pos, "Unterminated template literal");
      }
      this.expect(types$1.dollarBraceL);
      node.expressions.push(this.parseExpression());
      this.expect(types$1.braceR);
      node.quasis.push(curElt = this.parseTemplateElement({ isTagged }));
    }
    this.next();
    return this.finishNode(node, "TemplateLiteral");
  };
  pp$5.isAsyncProp = function(prop) {
    return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" && (this.type === types$1.name || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword || this.options.ecmaVersion >= 9 && this.type === types$1.star) && !lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
  };
  pp$5.parseObj = function(isPattern, refDestructuringErrors) {
    var node = this.startNode(), first = true, propHash = {};
    node.properties = [];
    this.next();
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.options.ecmaVersion >= 5 && this.afterTrailingComma(types$1.braceR)) {
          break;
        }
      } else {
        first = false;
      }
      var prop = this.parseProperty(isPattern, refDestructuringErrors);
      if (!isPattern) {
        this.checkPropClash(prop, propHash, refDestructuringErrors);
      }
      node.properties.push(prop);
    }
    return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression");
  };
  pp$5.parseProperty = function(isPattern, refDestructuringErrors) {
    var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
    if (this.options.ecmaVersion >= 9 && this.eat(types$1.ellipsis)) {
      if (isPattern) {
        prop.argument = this.parseIdent(false);
        if (this.type === types$1.comma) {
          this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
        }
        return this.finishNode(prop, "RestElement");
      }
      prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
      if (this.type === types$1.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
        refDestructuringErrors.trailingComma = this.start;
      }
      return this.finishNode(prop, "SpreadElement");
    }
    if (this.options.ecmaVersion >= 6) {
      prop.method = false;
      prop.shorthand = false;
      if (isPattern || refDestructuringErrors) {
        startPos = this.start;
        startLoc = this.startLoc;
      }
      if (!isPattern) {
        isGenerator = this.eat(types$1.star);
      }
    }
    var containsEsc = this.containsEsc;
    this.parsePropertyName(prop);
    if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
      isAsync = true;
      isGenerator = this.options.ecmaVersion >= 9 && this.eat(types$1.star);
      this.parsePropertyName(prop);
    } else {
      isAsync = false;
    }
    this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
    return this.finishNode(prop, "Property");
  };
  pp$5.parseGetterSetter = function(prop) {
    var kind = prop.key.name;
    this.parsePropertyName(prop);
    prop.value = this.parseMethod(false);
    prop.kind = kind;
    var paramCount = prop.kind === "get" ? 0 : 1;
    if (prop.value.params.length !== paramCount) {
      var start = prop.value.start;
      if (prop.kind === "get") {
        this.raiseRecoverable(start, "getter should have no params");
      } else {
        this.raiseRecoverable(start, "setter should have exactly one param");
      }
    } else {
      if (prop.kind === "set" && prop.value.params[0].type === "RestElement") {
        this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params");
      }
    }
  };
  pp$5.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
    if ((isGenerator || isAsync) && this.type === types$1.colon) {
      this.unexpected();
    }
    if (this.eat(types$1.colon)) {
      prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
      prop.kind = "init";
    } else if (this.options.ecmaVersion >= 6 && this.type === types$1.parenL) {
      if (isPattern) {
        this.unexpected();
      }
      prop.method = true;
      prop.value = this.parseMethod(isGenerator, isAsync);
      prop.kind = "init";
    } else if (!isPattern && !containsEsc && this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" && (prop.key.name === "get" || prop.key.name === "set") && (this.type !== types$1.comma && this.type !== types$1.braceR && this.type !== types$1.eq)) {
      if (isGenerator || isAsync) {
        this.unexpected();
      }
      this.parseGetterSetter(prop);
    } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
      if (isGenerator || isAsync) {
        this.unexpected();
      }
      this.checkUnreserved(prop.key);
      if (prop.key.name === "await" && !this.awaitIdentPos) {
        this.awaitIdentPos = startPos;
      }
      if (isPattern) {
        prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
      } else if (this.type === types$1.eq && refDestructuringErrors) {
        if (refDestructuringErrors.shorthandAssign < 0) {
          refDestructuringErrors.shorthandAssign = this.start;
        }
        prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
      } else {
        prop.value = this.copyNode(prop.key);
      }
      prop.kind = "init";
      prop.shorthand = true;
    } else {
      this.unexpected();
    }
  };
  pp$5.parsePropertyName = function(prop) {
    if (this.options.ecmaVersion >= 6) {
      if (this.eat(types$1.bracketL)) {
        prop.computed = true;
        prop.key = this.parseMaybeAssign();
        this.expect(types$1.bracketR);
        return prop.key;
      } else {
        prop.computed = false;
      }
    }
    return prop.key = this.type === types$1.num || this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
  };
  pp$5.initFunction = function(node) {
    node.id = null;
    if (this.options.ecmaVersion >= 6) {
      node.generator = node.expression = false;
    }
    if (this.options.ecmaVersion >= 8) {
      node.async = false;
    }
  };
  pp$5.parseMethod = function(isGenerator, isAsync, allowDirectSuper) {
    var node = this.startNode(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
    this.initFunction(node);
    if (this.options.ecmaVersion >= 6) {
      node.generator = isGenerator;
    }
    if (this.options.ecmaVersion >= 8) {
      node.async = !!isAsync;
    }
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    this.enterScope(functionFlags(isAsync, node.generator) | SCOPE_SUPER | (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0));
    this.expect(types$1.parenL);
    node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
    this.checkYieldAwaitInDefaultParams();
    this.parseFunctionBody(node, false, true, false);
    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, "FunctionExpression");
  };
  pp$5.parseArrowExpression = function(node, params, isAsync, forInit) {
    var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
    this.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW);
    this.initFunction(node);
    if (this.options.ecmaVersion >= 8) {
      node.async = !!isAsync;
    }
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    node.params = this.toAssignableList(params, true);
    this.parseFunctionBody(node, true, false, forInit);
    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, "ArrowFunctionExpression");
  };
  pp$5.parseFunctionBody = function(node, isArrowFunction, isMethod, forInit) {
    var isExpression = isArrowFunction && this.type !== types$1.braceL;
    var oldStrict = this.strict, useStrict = false;
    if (isExpression) {
      node.body = this.parseMaybeAssign(forInit);
      node.expression = true;
      this.checkParams(node, false);
    } else {
      var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
      if (!oldStrict || nonSimple) {
        useStrict = this.strictDirective(this.end);
        if (useStrict && nonSimple) {
          this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list");
        }
      }
      var oldLabels = this.labels;
      this.labels = [];
      if (useStrict) {
        this.strict = true;
      }
      this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params));
      if (this.strict && node.id) {
        this.checkLValSimple(node.id, BIND_OUTSIDE);
      }
      node.body = this.parseBlock(false, undefined, useStrict && !oldStrict);
      node.expression = false;
      this.adaptDirectivePrologue(node.body.body);
      this.labels = oldLabels;
    }
    this.exitScope();
  };
  pp$5.isSimpleParamList = function(params) {
    for (var i = 0, list = params;i < list.length; i += 1) {
      var param = list[i];
      if (param.type !== "Identifier") {
        return false;
      }
    }
    return true;
  };
  pp$5.checkParams = function(node, allowDuplicates) {
    var nameHash = Object.create(null);
    for (var i = 0, list = node.params;i < list.length; i += 1) {
      var param = list[i];
      this.checkLValInnerPattern(param, BIND_VAR, allowDuplicates ? null : nameHash);
    }
  };
  pp$5.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
    var elts = [], first = true;
    while (!this.eat(close)) {
      if (!first) {
        this.expect(types$1.comma);
        if (allowTrailingComma && this.afterTrailingComma(close)) {
          break;
        }
      } else {
        first = false;
      }
      var elt = undefined;
      if (allowEmpty && this.type === types$1.comma) {
        elt = null;
      } else if (this.type === types$1.ellipsis) {
        elt = this.parseSpread(refDestructuringErrors);
        if (refDestructuringErrors && this.type === types$1.comma && refDestructuringErrors.trailingComma < 0) {
          refDestructuringErrors.trailingComma = this.start;
        }
      } else {
        elt = this.parseMaybeAssign(false, refDestructuringErrors);
      }
      elts.push(elt);
    }
    return elts;
  };
  pp$5.checkUnreserved = function(ref) {
    var start = ref.start;
    var end = ref.end;
    var name = ref.name;
    if (this.inGenerator && name === "yield") {
      this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator");
    }
    if (this.inAsync && name === "await") {
      this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function");
    }
    if (!(this.currentThisScope().flags & SCOPE_VAR) && name === "arguments") {
      this.raiseRecoverable(start, "Cannot use 'arguments' in class field initializer");
    }
    if (this.inClassStaticBlock && (name === "arguments" || name === "await")) {
      this.raise(start, "Cannot use " + name + " in class static initialization block");
    }
    if (this.keywords.test(name)) {
      this.raise(start, "Unexpected keyword '" + name + "'");
    }
    if (this.options.ecmaVersion < 6 && this.input.slice(start, end).indexOf("\\") !== -1) {
      return;
    }
    var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
    if (re.test(name)) {
      if (!this.inAsync && name === "await") {
        this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function");
      }
      this.raiseRecoverable(start, "The keyword '" + name + "' is reserved");
    }
  };
  pp$5.parseIdent = function(liberal) {
    var node = this.parseIdentNode();
    this.next(!!liberal);
    this.finishNode(node, "Identifier");
    if (!liberal) {
      this.checkUnreserved(node);
      if (node.name === "await" && !this.awaitIdentPos) {
        this.awaitIdentPos = node.start;
      }
    }
    return node;
  };
  pp$5.parseIdentNode = function() {
    var node = this.startNode();
    if (this.type === types$1.name) {
      node.name = this.value;
    } else if (this.type.keyword) {
      node.name = this.type.keyword;
      if ((node.name === "class" || node.name === "function") && (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
        this.context.pop();
      }
      this.type = types$1.name;
    } else {
      this.unexpected();
    }
    return node;
  };
  pp$5.parsePrivateIdent = function() {
    var node = this.startNode();
    if (this.type === types$1.privateId) {
      node.name = this.value;
    } else {
      this.unexpected();
    }
    this.next();
    this.finishNode(node, "PrivateIdentifier");
    if (this.options.checkPrivateFields) {
      if (this.privateNameStack.length === 0) {
        this.raise(node.start, "Private field '#" + node.name + "' must be declared in an enclosing class");
      } else {
        this.privateNameStack[this.privateNameStack.length - 1].used.push(node);
      }
    }
    return node;
  };
  pp$5.parseYield = function(forInit) {
    if (!this.yieldPos) {
      this.yieldPos = this.start;
    }
    var node = this.startNode();
    this.next();
    if (this.type === types$1.semi || this.canInsertSemicolon() || this.type !== types$1.star && !this.type.startsExpr) {
      node.delegate = false;
      node.argument = null;
    } else {
      node.delegate = this.eat(types$1.star);
      node.argument = this.parseMaybeAssign(forInit);
    }
    return this.finishNode(node, "YieldExpression");
  };
  pp$5.parseAwait = function(forInit) {
    if (!this.awaitPos) {
      this.awaitPos = this.start;
    }
    var node = this.startNode();
    this.next();
    node.argument = this.parseMaybeUnary(null, true, false, forInit);
    return this.finishNode(node, "AwaitExpression");
  };
  pp$4 = Parser.prototype;
  pp$4.raise = function(pos, message) {
    var loc = getLineInfo(this.input, pos);
    message += " (" + loc.line + ":" + loc.column + ")";
    if (this.sourceFile) {
      message += " in " + this.sourceFile;
    }
    var err = new SyntaxError(message);
    err.pos = pos;
    err.loc = loc;
    err.raisedAt = this.pos;
    throw err;
  };
  pp$4.raiseRecoverable = pp$4.raise;
  pp$4.curPosition = function() {
    if (this.options.locations) {
      return new Position(this.curLine, this.pos - this.lineStart);
    }
  };
  pp$3 = Parser.prototype;
  pp$3.enterScope = function(flags) {
    this.scopeStack.push(new Scope(flags));
  };
  pp$3.exitScope = function() {
    this.scopeStack.pop();
  };
  pp$3.treatFunctionsAsVarInScope = function(scope) {
    return scope.flags & SCOPE_FUNCTION || !this.inModule && scope.flags & SCOPE_TOP;
  };
  pp$3.declareName = function(name, bindingType, pos) {
    var redeclared = false;
    if (bindingType === BIND_LEXICAL) {
      var scope = this.currentScope();
      redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
      scope.lexical.push(name);
      if (this.inModule && scope.flags & SCOPE_TOP) {
        delete this.undefinedExports[name];
      }
    } else if (bindingType === BIND_SIMPLE_CATCH) {
      var scope$1 = this.currentScope();
      scope$1.lexical.push(name);
    } else if (bindingType === BIND_FUNCTION) {
      var scope$2 = this.currentScope();
      if (this.treatFunctionsAsVar) {
        redeclared = scope$2.lexical.indexOf(name) > -1;
      } else {
        redeclared = scope$2.lexical.indexOf(name) > -1 || scope$2.var.indexOf(name) > -1;
      }
      scope$2.functions.push(name);
    } else {
      for (var i = this.scopeStack.length - 1;i >= 0; --i) {
        var scope$3 = this.scopeStack[i];
        if (scope$3.lexical.indexOf(name) > -1 && !(scope$3.flags & SCOPE_SIMPLE_CATCH && scope$3.lexical[0] === name) || !this.treatFunctionsAsVarInScope(scope$3) && scope$3.functions.indexOf(name) > -1) {
          redeclared = true;
          break;
        }
        scope$3.var.push(name);
        if (this.inModule && scope$3.flags & SCOPE_TOP) {
          delete this.undefinedExports[name];
        }
        if (scope$3.flags & SCOPE_VAR) {
          break;
        }
      }
    }
    if (redeclared) {
      this.raiseRecoverable(pos, "Identifier '" + name + "' has already been declared");
    }
  };
  pp$3.checkLocalExport = function(id) {
    if (this.scopeStack[0].lexical.indexOf(id.name) === -1 && this.scopeStack[0].var.indexOf(id.name) === -1) {
      this.undefinedExports[id.name] = id;
    }
  };
  pp$3.currentScope = function() {
    return this.scopeStack[this.scopeStack.length - 1];
  };
  pp$3.currentVarScope = function() {
    for (var i = this.scopeStack.length - 1;; i--) {
      var scope = this.scopeStack[i];
      if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK)) {
        return scope;
      }
    }
  };
  pp$3.currentThisScope = function() {
    for (var i = this.scopeStack.length - 1;; i--) {
      var scope = this.scopeStack[i];
      if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK) && !(scope.flags & SCOPE_ARROW)) {
        return scope;
      }
    }
  };
  pp$2 = Parser.prototype;
  pp$2.startNode = function() {
    return new Node(this, this.start, this.startLoc);
  };
  pp$2.startNodeAt = function(pos, loc) {
    return new Node(this, pos, loc);
  };
  pp$2.finishNode = function(node, type) {
    return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc);
  };
  pp$2.finishNodeAt = function(node, type, pos, loc) {
    return finishNodeAt.call(this, node, type, pos, loc);
  };
  pp$2.copyNode = function(node) {
    var newNode = new Node(this, node.start, this.startLoc);
    for (var prop in node) {
      newNode[prop] = node[prop];
    }
    return newNode;
  };
  ecma10BinaryProperties = ecma9BinaryProperties + " Extended_Pictographic";
  ecma11BinaryProperties = ecma10BinaryProperties;
  ecma12BinaryProperties = ecma11BinaryProperties + " EBase EComp EMod EPres ExtPict";
  ecma13BinaryProperties = ecma12BinaryProperties;
  ecma14BinaryProperties = ecma13BinaryProperties;
  unicodeBinaryProperties = {
    9: ecma9BinaryProperties,
    10: ecma10BinaryProperties,
    11: ecma11BinaryProperties,
    12: ecma12BinaryProperties,
    13: ecma13BinaryProperties,
    14: ecma14BinaryProperties
  };
  unicodeBinaryPropertiesOfStrings = {
    9: "",
    10: "",
    11: "",
    12: "",
    13: "",
    14: ecma14BinaryPropertiesOfStrings
  };
  ecma10ScriptValues = ecma9ScriptValues + " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd";
  ecma11ScriptValues = ecma10ScriptValues + " Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho";
  ecma12ScriptValues = ecma11ScriptValues + " Chorasmian Chrs Diak Dives_Akuru Khitan_Small_Script Kits Yezi Yezidi";
  ecma13ScriptValues = ecma12ScriptValues + " Cypro_Minoan Cpmn Old_Uyghur Ougr Tangsa Tnsa Toto Vithkuqi Vith";
  ecma14ScriptValues = ecma13ScriptValues + " " + scriptValuesAddedInUnicode;
  unicodeScriptValues = {
    9: ecma9ScriptValues,
    10: ecma10ScriptValues,
    11: ecma11ScriptValues,
    12: ecma12ScriptValues,
    13: ecma13ScriptValues,
    14: ecma14ScriptValues
  };
  data = {};
  for (i = 0, list = [9, 10, 11, 12, 13, 14];i < list.length; i += 1) {
    ecmaVersion = list[i];
    buildUnicodeData(ecmaVersion);
  }
  pp$1 = Parser.prototype;
  BranchID.prototype.separatedFrom = function separatedFrom(alt) {
    for (var self = this;self; self = self.parent) {
      for (var other = alt;other; other = other.parent) {
        if (self.base === other.base && self !== other) {
          return true;
        }
      }
    }
    return false;
  };
  BranchID.prototype.sibling = function sibling() {
    return new BranchID(this.parent, this.base);
  };
  RegExpValidationState.prototype.reset = function reset(start, pattern, flags) {
    var unicodeSets = flags.indexOf("v") !== -1;
    var unicode = flags.indexOf("u") !== -1;
    this.start = start | 0;
    this.source = pattern + "";
    this.flags = flags;
    if (unicodeSets && this.parser.options.ecmaVersion >= 15) {
      this.switchU = true;
      this.switchV = true;
      this.switchN = true;
    } else {
      this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
      this.switchV = false;
      this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
    }
  };
  RegExpValidationState.prototype.raise = function raise(message) {
    this.parser.raiseRecoverable(this.start, "Invalid regular expression: /" + this.source + "/: " + message);
  };
  RegExpValidationState.prototype.at = function at(i, forceU) {
    if (forceU === undefined)
      forceU = false;
    var s = this.source;
    var l = s.length;
    if (i >= l) {
      return -1;
    }
    var c = s.charCodeAt(i);
    if (!(forceU || this.switchU) || c <= 55295 || c >= 57344 || i + 1 >= l) {
      return c;
    }
    var next = s.charCodeAt(i + 1);
    return next >= 56320 && next <= 57343 ? (c << 10) + next - 56613888 : c;
  };
  RegExpValidationState.prototype.nextIndex = function nextIndex(i, forceU) {
    if (forceU === undefined)
      forceU = false;
    var s = this.source;
    var l = s.length;
    if (i >= l) {
      return l;
    }
    var c = s.charCodeAt(i), next;
    if (!(forceU || this.switchU) || c <= 55295 || c >= 57344 || i + 1 >= l || (next = s.charCodeAt(i + 1)) < 56320 || next > 57343) {
      return i + 1;
    }
    return i + 2;
  };
  RegExpValidationState.prototype.current = function current(forceU) {
    if (forceU === undefined)
      forceU = false;
    return this.at(this.pos, forceU);
  };
  RegExpValidationState.prototype.lookahead = function lookahead(forceU) {
    if (forceU === undefined)
      forceU = false;
    return this.at(this.nextIndex(this.pos, forceU), forceU);
  };
  RegExpValidationState.prototype.advance = function advance(forceU) {
    if (forceU === undefined)
      forceU = false;
    this.pos = this.nextIndex(this.pos, forceU);
  };
  RegExpValidationState.prototype.eat = function eat(ch, forceU) {
    if (forceU === undefined)
      forceU = false;
    if (this.current(forceU) === ch) {
      this.advance(forceU);
      return true;
    }
    return false;
  };
  RegExpValidationState.prototype.eatChars = function eatChars(chs, forceU) {
    if (forceU === undefined)
      forceU = false;
    var pos = this.pos;
    for (var i = 0, list = chs;i < list.length; i += 1) {
      var ch = list[i];
      var current = this.at(pos, forceU);
      if (current === -1 || current !== ch) {
        return false;
      }
      pos = this.nextIndex(pos, forceU);
    }
    this.pos = pos;
    return true;
  };
  pp$1.validateRegExpFlags = function(state) {
    var validFlags = state.validFlags;
    var flags = state.flags;
    var u = false;
    var v = false;
    for (var i = 0;i < flags.length; i++) {
      var flag = flags.charAt(i);
      if (validFlags.indexOf(flag) === -1) {
        this.raise(state.start, "Invalid regular expression flag");
      }
      if (flags.indexOf(flag, i + 1) > -1) {
        this.raise(state.start, "Duplicate regular expression flag");
      }
      if (flag === "u") {
        u = true;
      }
      if (flag === "v") {
        v = true;
      }
    }
    if (this.options.ecmaVersion >= 15 && u && v) {
      this.raise(state.start, "Invalid regular expression flag");
    }
  };
  pp$1.validateRegExpPattern = function(state) {
    this.regexp_pattern(state);
    if (!state.switchN && this.options.ecmaVersion >= 9 && hasProp(state.groupNames)) {
      state.switchN = true;
      this.regexp_pattern(state);
    }
  };
  pp$1.regexp_pattern = function(state) {
    state.pos = 0;
    state.lastIntValue = 0;
    state.lastStringValue = "";
    state.lastAssertionIsQuantifiable = false;
    state.numCapturingParens = 0;
    state.maxBackReference = 0;
    state.groupNames = Object.create(null);
    state.backReferenceNames.length = 0;
    state.branchID = null;
    this.regexp_disjunction(state);
    if (state.pos !== state.source.length) {
      if (state.eat(41)) {
        state.raise("Unmatched ')'");
      }
      if (state.eat(93) || state.eat(125)) {
        state.raise("Lone quantifier brackets");
      }
    }
    if (state.maxBackReference > state.numCapturingParens) {
      state.raise("Invalid escape");
    }
    for (var i = 0, list = state.backReferenceNames;i < list.length; i += 1) {
      var name = list[i];
      if (!state.groupNames[name]) {
        state.raise("Invalid named capture referenced");
      }
    }
  };
  pp$1.regexp_disjunction = function(state) {
    var trackDisjunction = this.options.ecmaVersion >= 16;
    if (trackDisjunction) {
      state.branchID = new BranchID(state.branchID, null);
    }
    this.regexp_alternative(state);
    while (state.eat(124)) {
      if (trackDisjunction) {
        state.branchID = state.branchID.sibling();
      }
      this.regexp_alternative(state);
    }
    if (trackDisjunction) {
      state.branchID = state.branchID.parent;
    }
    if (this.regexp_eatQuantifier(state, true)) {
      state.raise("Nothing to repeat");
    }
    if (state.eat(123)) {
      state.raise("Lone quantifier brackets");
    }
  };
  pp$1.regexp_alternative = function(state) {
    while (state.pos < state.source.length && this.regexp_eatTerm(state)) {}
  };
  pp$1.regexp_eatTerm = function(state) {
    if (this.regexp_eatAssertion(state)) {
      if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
        if (state.switchU) {
          state.raise("Invalid quantifier");
        }
      }
      return true;
    }
    if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
      this.regexp_eatQuantifier(state);
      return true;
    }
    return false;
  };
  pp$1.regexp_eatAssertion = function(state) {
    var start = state.pos;
    state.lastAssertionIsQuantifiable = false;
    if (state.eat(94) || state.eat(36)) {
      return true;
    }
    if (state.eat(92)) {
      if (state.eat(66) || state.eat(98)) {
        return true;
      }
      state.pos = start;
    }
    if (state.eat(40) && state.eat(63)) {
      var lookbehind = false;
      if (this.options.ecmaVersion >= 9) {
        lookbehind = state.eat(60);
      }
      if (state.eat(61) || state.eat(33)) {
        this.regexp_disjunction(state);
        if (!state.eat(41)) {
          state.raise("Unterminated group");
        }
        state.lastAssertionIsQuantifiable = !lookbehind;
        return true;
      }
    }
    state.pos = start;
    return false;
  };
  pp$1.regexp_eatQuantifier = function(state, noError) {
    if (noError === undefined)
      noError = false;
    if (this.regexp_eatQuantifierPrefix(state, noError)) {
      state.eat(63);
      return true;
    }
    return false;
  };
  pp$1.regexp_eatQuantifierPrefix = function(state, noError) {
    return state.eat(42) || state.eat(43) || state.eat(63) || this.regexp_eatBracedQuantifier(state, noError);
  };
  pp$1.regexp_eatBracedQuantifier = function(state, noError) {
    var start = state.pos;
    if (state.eat(123)) {
      var min = 0, max = -1;
      if (this.regexp_eatDecimalDigits(state)) {
        min = state.lastIntValue;
        if (state.eat(44) && this.regexp_eatDecimalDigits(state)) {
          max = state.lastIntValue;
        }
        if (state.eat(125)) {
          if (max !== -1 && max < min && !noError) {
            state.raise("numbers out of order in {} quantifier");
          }
          return true;
        }
      }
      if (state.switchU && !noError) {
        state.raise("Incomplete quantifier");
      }
      state.pos = start;
    }
    return false;
  };
  pp$1.regexp_eatAtom = function(state) {
    return this.regexp_eatPatternCharacters(state) || state.eat(46) || this.regexp_eatReverseSolidusAtomEscape(state) || this.regexp_eatCharacterClass(state) || this.regexp_eatUncapturingGroup(state) || this.regexp_eatCapturingGroup(state);
  };
  pp$1.regexp_eatReverseSolidusAtomEscape = function(state) {
    var start = state.pos;
    if (state.eat(92)) {
      if (this.regexp_eatAtomEscape(state)) {
        return true;
      }
      state.pos = start;
    }
    return false;
  };
  pp$1.regexp_eatUncapturingGroup = function(state) {
    var start = state.pos;
    if (state.eat(40)) {
      if (state.eat(63)) {
        if (this.options.ecmaVersion >= 16) {
          var addModifiers = this.regexp_eatModifiers(state);
          var hasHyphen = state.eat(45);
          if (addModifiers || hasHyphen) {
            for (var i = 0;i < addModifiers.length; i++) {
              var modifier = addModifiers.charAt(i);
              if (addModifiers.indexOf(modifier, i + 1) > -1) {
                state.raise("Duplicate regular expression modifiers");
              }
            }
            if (hasHyphen) {
              var removeModifiers = this.regexp_eatModifiers(state);
              if (!addModifiers && !removeModifiers && state.current() === 58) {
                state.raise("Invalid regular expression modifiers");
              }
              for (var i$1 = 0;i$1 < removeModifiers.length; i$1++) {
                var modifier$1 = removeModifiers.charAt(i$1);
                if (removeModifiers.indexOf(modifier$1, i$1 + 1) > -1 || addModifiers.indexOf(modifier$1) > -1) {
                  state.raise("Duplicate regular expression modifiers");
                }
              }
            }
          }
        }
        if (state.eat(58)) {
          this.regexp_disjunction(state);
          if (state.eat(41)) {
            return true;
          }
          state.raise("Unterminated group");
        }
      }
      state.pos = start;
    }
    return false;
  };
  pp$1.regexp_eatCapturingGroup = function(state) {
    if (state.eat(40)) {
      if (this.options.ecmaVersion >= 9) {
        this.regexp_groupSpecifier(state);
      } else if (state.current() === 63) {
        state.raise("Invalid group");
      }
      this.regexp_disjunction(state);
      if (state.eat(41)) {
        state.numCapturingParens += 1;
        return true;
      }
      state.raise("Unterminated group");
    }
    return false;
  };
  pp$1.regexp_eatModifiers = function(state) {
    var modifiers = "";
    var ch = 0;
    while ((ch = state.current()) !== -1 && isRegularExpressionModifier(ch)) {
      modifiers += codePointToString(ch);
      state.advance();
    }
    return modifiers;
  };
  pp$1.regexp_eatExtendedAtom = function(state) {
    return state.eat(46) || this.regexp_eatReverseSolidusAtomEscape(state) || this.regexp_eatCharacterClass(state) || this.regexp_eatUncapturingGroup(state) || this.regexp_eatCapturingGroup(state) || this.regexp_eatInvalidBracedQuantifier(state) || this.regexp_eatExtendedPatternCharacter(state);
  };
  pp$1.regexp_eatInvalidBracedQuantifier = function(state) {
    if (this.regexp_eatBracedQuantifier(state, true)) {
      state.raise("Nothing to repeat");
    }
    return false;
  };
  pp$1.regexp_eatSyntaxCharacter = function(state) {
    var ch = state.current();
    if (isSyntaxCharacter(ch)) {
      state.lastIntValue = ch;
      state.advance();
      return true;
    }
    return false;
  };
  pp$1.regexp_eatPatternCharacters = function(state) {
    var start = state.pos;
    var ch = 0;
    while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) {
      state.advance();
    }
    return state.pos !== start;
  };
  pp$1.regexp_eatExtendedPatternCharacter = function(state) {
    var ch = state.current();
    if (ch !== -1 && ch !== 36 && !(ch >= 40 && ch <= 43) && ch !== 46 && ch !== 63 && ch !== 91 && ch !== 94 && ch !== 124) {
      state.advance();
      return true;
    }
    return false;
  };
  pp$1.regexp_groupSpecifier = function(state) {
    if (state.eat(63)) {
      if (!this.regexp_eatGroupName(state)) {
        state.raise("Invalid group");
      }
      var trackDisjunction = this.options.ecmaVersion >= 16;
      var known = state.groupNames[state.lastStringValue];
      if (known) {
        if (trackDisjunction) {
          for (var i = 0, list = known;i < list.length; i += 1) {
            var altID = list[i];
            if (!altID.separatedFrom(state.branchID)) {
              state.raise("Duplicate capture group name");
            }
          }
        } else {
          state.raise("Duplicate capture group name");
        }
      }
      if (trackDisjunction) {
        (known || (state.groupNames[state.lastStringValue] = [])).push(state.branchID);
      } else {
        state.groupNames[state.lastStringValue] = true;
      }
    }
  };
  pp$1.regexp_eatGroupName = function(state) {
    state.lastStringValue = "";
    if (state.eat(60)) {
      if (this.regexp_eatRegExpIdentifierName(state) && state.eat(62)) {
        return true;
      }
      state.raise("Invalid capture group name");
    }
    return false;
  };
  pp$1.regexp_eatRegExpIdentifierName = function(state) {
    state.lastStringValue = "";
    if (this.regexp_eatRegExpIdentifierStart(state)) {
      state.lastStringValue += codePointToString(state.lastIntValue);
      while (this.regexp_eatRegExpIdentifierPart(state)) {
        state.lastStringValue += codePointToString(state.lastIntValue);
      }
      return true;
    }
    return false;
  };
  pp$1.regexp_eatRegExpIdentifierStart = function(state) {
    var start = state.pos;
    var forceU = this.options.ecmaVersion >= 11;
    var ch = state.current(forceU);
    state.advance(forceU);
    if (ch === 92 && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
      ch = state.lastIntValue;
    }
    if (isRegExpIdentifierStart(ch)) {
      state.lastIntValue = ch;
      return true;
    }
    state.pos = start;
    return false;
  };
  pp$1.regexp_eatRegExpIdentifierPart = function(state) {
    var start = state.pos;
    var forceU = this.options.ecmaVersion >= 11;
    var ch = state.current(forceU);
    state.advance(forceU);
    if (ch === 92 && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
      ch = state.lastIntValue;
    }
    if (isRegExpIdentifierPart(ch)) {
      state.lastIntValue = ch;
      return true;
    }
    state.pos = start;
    return false;
  };
  pp$1.regexp_eatAtomEscape = function(state) {
    if (this.regexp_eatBackReference(state) || this.regexp_eatCharacterClassEscape(state) || this.regexp_eatCharacterEscape(state) || state.switchN && this.regexp_eatKGroupName(state)) {
      return true;
    }
    if (state.switchU) {
      if (state.current() === 99) {
        state.raise("Invalid unicode escape");
      }
      state.raise("Invalid escape");
    }
    return false;
  };
  pp$1.regexp_eatBackReference = function(state) {
    var start = state.pos;
    if (this.regexp_eatDecimalEscape(state)) {
      var n = state.lastIntValue;
      if (state.switchU) {
        if (n > state.maxBackReference) {
          state.maxBackReference = n;
        }
        return true;
      }
      if (n <= state.numCapturingParens) {
        return true;
      }
      state.pos = start;
    }
    return false;
  };
  pp$1.regexp_eatKGroupName = function(state) {
    if (state.eat(107)) {
      if (this.regexp_eatGroupName(state)) {
        state.backReferenceNames.push(state.lastStringValue);
        return true;
      }
      state.raise("Invalid named reference");
    }
    return false;
  };
  pp$1.regexp_eatCharacterEscape = function(state) {
    return this.regexp_eatControlEscape(state) || this.regexp_eatCControlLetter(state) || this.regexp_eatZero(state) || this.regexp_eatHexEscapeSequence(state) || this.regexp_eatRegExpUnicodeEscapeSequence(state, false) || !state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state) || this.regexp_eatIdentityEscape(state);
  };
  pp$1.regexp_eatCControlLetter = function(state) {
    var start = state.pos;
    if (state.eat(99)) {
      if (this.regexp_eatControlLetter(state)) {
        return true;
      }
      state.pos = start;
    }
    return false;
  };
  pp$1.regexp_eatZero = function(state) {
    if (state.current() === 48 && !isDecimalDigit(state.lookahead())) {
      state.lastIntValue = 0;
      state.advance();
      return true;
    }
    return false;
  };
  pp$1.regexp_eatControlEscape = function(state) {
    var ch = state.current();
    if (ch === 116) {
      state.lastIntValue = 9;
      state.advance();
      return true;
    }
    if (ch === 110) {
      state.lastIntValue = 10;
      state.advance();
      return true;
    }
    if (ch === 118) {
      state.lastIntValue = 11;
      state.advance();
      return true;
    }
    if (ch === 102) {
      state.lastIntValue = 12;
      state.advance();
      return true;
    }
    if (ch === 114) {
      state.lastIntValue = 13;
      state.advance();
      return true;
    }
    return false;
  };
  pp$1.regexp_eatControlLetter = function(state) {
    var ch = state.current();
    if (isControlLetter(ch)) {
      state.lastIntValue = ch % 32;
      state.advance();
      return true;
    }
    return false;
  };
  pp$1.regexp_eatRegExpUnicodeEscapeSequence = function(state, forceU) {
    if (forceU === undefined)
      forceU = false;
    var start = state.pos;
    var switchU = forceU || state.switchU;
    if (state.eat(117)) {
      if (this.regexp_eatFixedHexDigits(state, 4)) {
        var lead = state.lastIntValue;
        if (switchU && lead >= 55296 && lead <= 56319) {
          var leadSurrogateEnd = state.pos;
          if (state.eat(92) && state.eat(117) && this.regexp_eatFixedHexDigits(state, 4)) {
            var trail = state.lastIntValue;
            if (trail >= 56320 && trail <= 57343) {
              state.lastIntValue = (lead - 55296) * 1024 + (trail - 56320) + 65536;
              return true;
            }
          }
          state.pos = leadSurrogateEnd;
          state.lastIntValue = lead;
        }
        return true;
      }
      if (switchU && state.eat(123) && this.regexp_eatHexDigits(state) && state.eat(125) && isValidUnicode(state.lastIntValue)) {
        return true;
      }
      if (switchU) {
        state.raise("Invalid unicode escape");
      }
      state.pos = start;
    }
    return false;
  };
  pp$1.regexp_eatIdentityEscape = function(state) {
    if (state.switchU) {
      if (this.regexp_eatSyntaxCharacter(state)) {
        return true;
      }
      if (state.eat(47)) {
        state.lastIntValue = 47;
        return true;
      }
      return false;
    }
    var ch = state.current();
    if (ch !== 99 && (!state.switchN || ch !== 107)) {
      state.lastIntValue = ch;
      state.advance();
      return true;
    }
    return false;
  };
  pp$1.regexp_eatDecimalEscape = function(state) {
    state.lastIntValue = 0;
    var ch = state.current();
    if (ch >= 49 && ch <= 57) {
      do {
        state.lastIntValue = 10 * state.lastIntValue + (ch - 48);
        state.advance();
      } while ((ch = state.current()) >= 48 && ch <= 57);
      return true;
    }
    return false;
  };
  pp$1.regexp_eatCharacterClassEscape = function(state) {
    var ch = state.current();
    if (isCharacterClassEscape(ch)) {
      state.lastIntValue = -1;
      state.advance();
      return CharSetOk;
    }
    var negate = false;
    if (state.switchU && this.options.ecmaVersion >= 9 && ((negate = ch === 80) || ch === 112)) {
      state.lastIntValue = -1;
      state.advance();
      var result;
      if (state.eat(123) && (result = this.regexp_eatUnicodePropertyValueExpression(state)) && state.eat(125)) {
        if (negate && result === CharSetString) {
          state.raise("Invalid property name");
        }
        return result;
      }
      state.raise("Invalid property name");
    }
    return CharSetNone;
  };
  pp$1.regexp_eatUnicodePropertyValueExpression = function(state) {
    var start = state.pos;
    if (this.regexp_eatUnicodePropertyName(state) && state.eat(61)) {
      var name = state.lastStringValue;
      if (this.regexp_eatUnicodePropertyValue(state)) {
        var value = state.lastStringValue;
        this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
        return CharSetOk;
      }
    }
    state.pos = start;
    if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
      var nameOrValue = state.lastStringValue;
      return this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue);
    }
    return CharSetNone;
  };
  pp$1.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
    if (!hasOwn(state.unicodeProperties.nonBinary, name)) {
      state.raise("Invalid property name");
    }
    if (!state.unicodeProperties.nonBinary[name].test(value)) {
      state.raise("Invalid property value");
    }
  };
  pp$1.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
    if (state.unicodeProperties.binary.test(nameOrValue)) {
      return CharSetOk;
    }
    if (state.switchV && state.unicodeProperties.binaryOfStrings.test(nameOrValue)) {
      return CharSetString;
    }
    state.raise("Invalid property name");
  };
  pp$1.regexp_eatUnicodePropertyName = function(state) {
    var ch = 0;
    state.lastStringValue = "";
    while (isUnicodePropertyNameCharacter(ch = state.current())) {
      state.lastStringValue += codePointToString(ch);
      state.advance();
    }
    return state.lastStringValue !== "";
  };
  pp$1.regexp_eatUnicodePropertyValue = function(state) {
    var ch = 0;
    state.lastStringValue = "";
    while (isUnicodePropertyValueCharacter(ch = state.current())) {
      state.lastStringValue += codePointToString(ch);
      state.advance();
    }
    return state.lastStringValue !== "";
  };
  pp$1.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
    return this.regexp_eatUnicodePropertyValue(state);
  };
  pp$1.regexp_eatCharacterClass = function(state) {
    if (state.eat(91)) {
      var negate = state.eat(94);
      var result = this.regexp_classContents(state);
      if (!state.eat(93)) {
        state.raise("Unterminated character class");
      }
      if (negate && result === CharSetString) {
        state.raise("Negated character class may contain strings");
      }
      return true;
    }
    return false;
  };
  pp$1.regexp_classContents = function(state) {
    if (state.current() === 93) {
      return CharSetOk;
    }
    if (state.switchV) {
      return this.regexp_classSetExpression(state);
    }
    this.regexp_nonEmptyClassRanges(state);
    return CharSetOk;
  };
  pp$1.regexp_nonEmptyClassRanges = function(state) {
    while (this.regexp_eatClassAtom(state)) {
      var left = state.lastIntValue;
      if (state.eat(45) && this.regexp_eatClassAtom(state)) {
        var right = state.lastIntValue;
        if (state.switchU && (left === -1 || right === -1)) {
          state.raise("Invalid character class");
        }
        if (left !== -1 && right !== -1 && left > right) {
          state.raise("Range out of order in character class");
        }
      }
    }
  };
  pp$1.regexp_eatClassAtom = function(state) {
    var start = state.pos;
    if (state.eat(92)) {
      if (this.regexp_eatClassEscape(state)) {
        return true;
      }
      if (state.switchU) {
        var ch$1 = state.current();
        if (ch$1 === 99 || isOctalDigit(ch$1)) {
          state.raise("Invalid class escape");
        }
        state.raise("Invalid escape");
      }
      state.pos = start;
    }
    var ch = state.current();
    if (ch !== 93) {
      state.lastIntValue = ch;
      state.advance();
      return true;
    }
    return false;
  };
  pp$1.regexp_eatClassEscape = function(state) {
    var start = state.pos;
    if (state.eat(98)) {
      state.lastIntValue = 8;
      return true;
    }
    if (state.switchU && state.eat(45)) {
      state.lastIntValue = 45;
      return true;
    }
    if (!state.switchU && state.eat(99)) {
      if (this.regexp_eatClassControlLetter(state)) {
        return true;
      }
      state.pos = start;
    }
    return this.regexp_eatCharacterClassEscape(state) || this.regexp_eatCharacterEscape(state);
  };
  pp$1.regexp_classSetExpression = function(state) {
    var result = CharSetOk, subResult;
    if (this.regexp_eatClassSetRange(state))
      ;
    else if (subResult = this.regexp_eatClassSetOperand(state)) {
      if (subResult === CharSetString) {
        result = CharSetString;
      }
      var start = state.pos;
      while (state.eatChars([38, 38])) {
        if (state.current() !== 38 && (subResult = this.regexp_eatClassSetOperand(state))) {
          if (subResult !== CharSetString) {
            result = CharSetOk;
          }
          continue;
        }
        state.raise("Invalid character in character class");
      }
      if (start !== state.pos) {
        return result;
      }
      while (state.eatChars([45, 45])) {
        if (this.regexp_eatClassSetOperand(state)) {
          continue;
        }
        state.raise("Invalid character in character class");
      }
      if (start !== state.pos) {
        return result;
      }
    } else {
      state.raise("Invalid character in character class");
    }
    for (;; ) {
      if (this.regexp_eatClassSetRange(state)) {
        continue;
      }
      subResult = this.regexp_eatClassSetOperand(state);
      if (!subResult) {
        return result;
      }
      if (subResult === CharSetString) {
        result = CharSetString;
      }
    }
  };
  pp$1.regexp_eatClassSetRange = function(state) {
    var start = state.pos;
    if (this.regexp_eatClassSetCharacter(state)) {
      var left = state.lastIntValue;
      if (state.eat(45) && this.regexp_eatClassSetCharacter(state)) {
        var right = state.lastIntValue;
        if (left !== -1 && right !== -1 && left > right) {
          state.raise("Range out of order in character class");
        }
        return true;
      }
      state.pos = start;
    }
    return false;
  };
  pp$1.regexp_eatClassSetOperand = function(state) {
    if (this.regexp_eatClassSetCharacter(state)) {
      return CharSetOk;
    }
    return this.regexp_eatClassStringDisjunction(state) || this.regexp_eatNestedClass(state);
  };
  pp$1.regexp_eatNestedClass = function(state) {
    var start = state.pos;
    if (state.eat(91)) {
      var negate = state.eat(94);
      var result = this.regexp_classContents(state);
      if (state.eat(93)) {
        if (negate && result === CharSetString) {
          state.raise("Negated character class may contain strings");
        }
        return result;
      }
      state.pos = start;
    }
    if (state.eat(92)) {
      var result$1 = this.regexp_eatCharacterClassEscape(state);
      if (result$1) {
        return result$1;
      }
      state.pos = start;
    }
    return null;
  };
  pp$1.regexp_eatClassStringDisjunction = function(state) {
    var start = state.pos;
    if (state.eatChars([92, 113])) {
      if (state.eat(123)) {
        var result = this.regexp_classStringDisjunctionContents(state);
        if (state.eat(125)) {
          return result;
        }
      } else {
        state.raise("Invalid escape");
      }
      state.pos = start;
    }
    return null;
  };
  pp$1.regexp_classStringDisjunctionContents = function(state) {
    var result = this.regexp_classString(state);
    while (state.eat(124)) {
      if (this.regexp_classString(state) === CharSetString) {
        result = CharSetString;
      }
    }
    return result;
  };
  pp$1.regexp_classString = function(state) {
    var count = 0;
    while (this.regexp_eatClassSetCharacter(state)) {
      count++;
    }
    return count === 1 ? CharSetOk : CharSetString;
  };
  pp$1.regexp_eatClassSetCharacter = function(state) {
    var start = state.pos;
    if (state.eat(92)) {
      if (this.regexp_eatCharacterEscape(state) || this.regexp_eatClassSetReservedPunctuator(state)) {
        return true;
      }
      if (state.eat(98)) {
        state.lastIntValue = 8;
        return true;
      }
      state.pos = start;
      return false;
    }
    var ch = state.current();
    if (ch < 0 || ch === state.lookahead() && isClassSetReservedDoublePunctuatorCharacter(ch)) {
      return false;
    }
    if (isClassSetSyntaxCharacter(ch)) {
      return false;
    }
    state.advance();
    state.lastIntValue = ch;
    return true;
  };
  pp$1.regexp_eatClassSetReservedPunctuator = function(state) {
    var ch = state.current();
    if (isClassSetReservedPunctuator(ch)) {
      state.lastIntValue = ch;
      state.advance();
      return true;
    }
    return false;
  };
  pp$1.regexp_eatClassControlLetter = function(state) {
    var ch = state.current();
    if (isDecimalDigit(ch) || ch === 95) {
      state.lastIntValue = ch % 32;
      state.advance();
      return true;
    }
    return false;
  };
  pp$1.regexp_eatHexEscapeSequence = function(state) {
    var start = state.pos;
    if (state.eat(120)) {
      if (this.regexp_eatFixedHexDigits(state, 2)) {
        return true;
      }
      if (state.switchU) {
        state.raise("Invalid escape");
      }
      state.pos = start;
    }
    return false;
  };
  pp$1.regexp_eatDecimalDigits = function(state) {
    var start = state.pos;
    var ch = 0;
    state.lastIntValue = 0;
    while (isDecimalDigit(ch = state.current())) {
      state.lastIntValue = 10 * state.lastIntValue + (ch - 48);
      state.advance();
    }
    return state.pos !== start;
  };
  pp$1.regexp_eatHexDigits = function(state) {
    var start = state.pos;
    var ch = 0;
    state.lastIntValue = 0;
    while (isHexDigit(ch = state.current())) {
      state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
      state.advance();
    }
    return state.pos !== start;
  };
  pp$1.regexp_eatLegacyOctalEscapeSequence = function(state) {
    if (this.regexp_eatOctalDigit(state)) {
      var n1 = state.lastIntValue;
      if (this.regexp_eatOctalDigit(state)) {
        var n2 = state.lastIntValue;
        if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
          state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
        } else {
          state.lastIntValue = n1 * 8 + n2;
        }
      } else {
        state.lastIntValue = n1;
      }
      return true;
    }
    return false;
  };
  pp$1.regexp_eatOctalDigit = function(state) {
    var ch = state.current();
    if (isOctalDigit(ch)) {
      state.lastIntValue = ch - 48;
      state.advance();
      return true;
    }
    state.lastIntValue = 0;
    return false;
  };
  pp$1.regexp_eatFixedHexDigits = function(state, length) {
    var start = state.pos;
    state.lastIntValue = 0;
    for (var i = 0;i < length; ++i) {
      var ch = state.current();
      if (!isHexDigit(ch)) {
        state.pos = start;
        return false;
      }
      state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
      state.advance();
    }
    return true;
  };
  pp2 = Parser.prototype;
  pp2.next = function(ignoreEscapeSequenceInKeyword) {
    if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc) {
      this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword);
    }
    if (this.options.onToken) {
      this.options.onToken(new Token(this));
    }
    this.lastTokEnd = this.end;
    this.lastTokStart = this.start;
    this.lastTokEndLoc = this.endLoc;
    this.lastTokStartLoc = this.startLoc;
    this.nextToken();
  };
  pp2.getToken = function() {
    this.next();
    return new Token(this);
  };
  if (typeof Symbol !== "undefined") {
    pp2[Symbol.iterator] = function() {
      var this$1$1 = this;
      return {
        next: function() {
          var token = this$1$1.getToken();
          return {
            done: token.type === types$1.eof,
            value: token
          };
        }
      };
    };
  }
  pp2.nextToken = function() {
    var curContext = this.curContext();
    if (!curContext || !curContext.preserveSpace) {
      this.skipSpace();
    }
    this.start = this.pos;
    if (this.options.locations) {
      this.startLoc = this.curPosition();
    }
    if (this.pos >= this.input.length) {
      return this.finishToken(types$1.eof);
    }
    if (curContext.override) {
      return curContext.override(this);
    } else {
      this.readToken(this.fullCharCodeAtPos());
    }
  };
  pp2.readToken = function(code) {
    if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92) {
      return this.readWord();
    }
    return this.getTokenFromCode(code);
  };
  pp2.fullCharCodeAt = function(pos) {
    var code = this.input.charCodeAt(pos);
    if (code <= 55295 || code >= 56320) {
      return code;
    }
    var next = this.input.charCodeAt(pos + 1);
    return next <= 56319 || next >= 57344 ? code : (code << 10) + next - 56613888;
  };
  pp2.fullCharCodeAtPos = function() {
    return this.fullCharCodeAt(this.pos);
  };
  pp2.skipBlockComment = function() {
    var startLoc = this.options.onComment && this.curPosition();
    var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
    if (end === -1) {
      this.raise(this.pos - 2, "Unterminated comment");
    }
    this.pos = end + 2;
    if (this.options.locations) {
      for (var nextBreak = undefined, pos = start;(nextBreak = nextLineBreak(this.input, pos, this.pos)) > -1; ) {
        ++this.curLine;
        pos = this.lineStart = nextBreak;
      }
    }
    if (this.options.onComment) {
      this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos, startLoc, this.curPosition());
    }
  };
  pp2.skipLineComment = function(startSkip) {
    var start = this.pos;
    var startLoc = this.options.onComment && this.curPosition();
    var ch = this.input.charCodeAt(this.pos += startSkip);
    while (this.pos < this.input.length && !isNewLine(ch)) {
      ch = this.input.charCodeAt(++this.pos);
    }
    if (this.options.onComment) {
      this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos, startLoc, this.curPosition());
    }
  };
  pp2.skipSpace = function() {
    loop:
      while (this.pos < this.input.length) {
        var ch = this.input.charCodeAt(this.pos);
        switch (ch) {
          case 32:
          case 160:
            ++this.pos;
            break;
          case 13:
            if (this.input.charCodeAt(this.pos + 1) === 10) {
              ++this.pos;
            }
          case 10:
          case 8232:
          case 8233:
            ++this.pos;
            if (this.options.locations) {
              ++this.curLine;
              this.lineStart = this.pos;
            }
            break;
          case 47:
            switch (this.input.charCodeAt(this.pos + 1)) {
              case 42:
                this.skipBlockComment();
                break;
              case 47:
                this.skipLineComment(2);
                break;
              default:
                break loop;
            }
            break;
          default:
            if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
              ++this.pos;
            } else {
              break loop;
            }
        }
      }
  };
  pp2.finishToken = function(type, val) {
    this.end = this.pos;
    if (this.options.locations) {
      this.endLoc = this.curPosition();
    }
    var prevType = this.type;
    this.type = type;
    this.value = val;
    this.updateContext(prevType);
  };
  pp2.readToken_dot = function() {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next >= 48 && next <= 57) {
      return this.readNumber(true);
    }
    var next2 = this.input.charCodeAt(this.pos + 2);
    if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) {
      this.pos += 3;
      return this.finishToken(types$1.ellipsis);
    } else {
      ++this.pos;
      return this.finishToken(types$1.dot);
    }
  };
  pp2.readToken_slash = function() {
    var next = this.input.charCodeAt(this.pos + 1);
    if (this.exprAllowed) {
      ++this.pos;
      return this.readRegexp();
    }
    if (next === 61) {
      return this.finishOp(types$1.assign, 2);
    }
    return this.finishOp(types$1.slash, 1);
  };
  pp2.readToken_mult_modulo_exp = function(code) {
    var next = this.input.charCodeAt(this.pos + 1);
    var size = 1;
    var tokentype = code === 42 ? types$1.star : types$1.modulo;
    if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
      ++size;
      tokentype = types$1.starstar;
      next = this.input.charCodeAt(this.pos + 2);
    }
    if (next === 61) {
      return this.finishOp(types$1.assign, size + 1);
    }
    return this.finishOp(tokentype, size);
  };
  pp2.readToken_pipe_amp = function(code) {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === code) {
      if (this.options.ecmaVersion >= 12) {
        var next2 = this.input.charCodeAt(this.pos + 2);
        if (next2 === 61) {
          return this.finishOp(types$1.assign, 3);
        }
      }
      return this.finishOp(code === 124 ? types$1.logicalOR : types$1.logicalAND, 2);
    }
    if (next === 61) {
      return this.finishOp(types$1.assign, 2);
    }
    return this.finishOp(code === 124 ? types$1.bitwiseOR : types$1.bitwiseAND, 1);
  };
  pp2.readToken_caret = function() {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 61) {
      return this.finishOp(types$1.assign, 2);
    }
    return this.finishOp(types$1.bitwiseXOR, 1);
  };
  pp2.readToken_plus_min = function(code) {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === code) {
      if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 && (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
        this.skipLineComment(3);
        this.skipSpace();
        return this.nextToken();
      }
      return this.finishOp(types$1.incDec, 2);
    }
    if (next === 61) {
      return this.finishOp(types$1.assign, 2);
    }
    return this.finishOp(types$1.plusMin, 1);
  };
  pp2.readToken_lt_gt = function(code) {
    var next = this.input.charCodeAt(this.pos + 1);
    var size = 1;
    if (next === code) {
      size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
      if (this.input.charCodeAt(this.pos + size) === 61) {
        return this.finishOp(types$1.assign, size + 1);
      }
      return this.finishOp(types$1.bitShift, size);
    }
    if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 && this.input.charCodeAt(this.pos + 3) === 45) {
      this.skipLineComment(4);
      this.skipSpace();
      return this.nextToken();
    }
    if (next === 61) {
      size = 2;
    }
    return this.finishOp(types$1.relational, size);
  };
  pp2.readToken_eq_excl = function(code) {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 61) {
      return this.finishOp(types$1.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2);
    }
    if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) {
      this.pos += 2;
      return this.finishToken(types$1.arrow);
    }
    return this.finishOp(code === 61 ? types$1.eq : types$1.prefix, 1);
  };
  pp2.readToken_question = function() {
    var ecmaVersion = this.options.ecmaVersion;
    if (ecmaVersion >= 11) {
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 46) {
        var next2 = this.input.charCodeAt(this.pos + 2);
        if (next2 < 48 || next2 > 57) {
          return this.finishOp(types$1.questionDot, 2);
        }
      }
      if (next === 63) {
        if (ecmaVersion >= 12) {
          var next2$1 = this.input.charCodeAt(this.pos + 2);
          if (next2$1 === 61) {
            return this.finishOp(types$1.assign, 3);
          }
        }
        return this.finishOp(types$1.coalesce, 2);
      }
    }
    return this.finishOp(types$1.question, 1);
  };
  pp2.readToken_numberSign = function() {
    var ecmaVersion = this.options.ecmaVersion;
    var code = 35;
    if (ecmaVersion >= 13) {
      ++this.pos;
      code = this.fullCharCodeAtPos();
      if (isIdentifierStart(code, true) || code === 92) {
        return this.finishToken(types$1.privateId, this.readWord1());
      }
    }
    this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
  };
  pp2.getTokenFromCode = function(code) {
    switch (code) {
      case 46:
        return this.readToken_dot();
      case 40:
        ++this.pos;
        return this.finishToken(types$1.parenL);
      case 41:
        ++this.pos;
        return this.finishToken(types$1.parenR);
      case 59:
        ++this.pos;
        return this.finishToken(types$1.semi);
      case 44:
        ++this.pos;
        return this.finishToken(types$1.comma);
      case 91:
        ++this.pos;
        return this.finishToken(types$1.bracketL);
      case 93:
        ++this.pos;
        return this.finishToken(types$1.bracketR);
      case 123:
        ++this.pos;
        return this.finishToken(types$1.braceL);
      case 125:
        ++this.pos;
        return this.finishToken(types$1.braceR);
      case 58:
        ++this.pos;
        return this.finishToken(types$1.colon);
      case 96:
        if (this.options.ecmaVersion < 6) {
          break;
        }
        ++this.pos;
        return this.finishToken(types$1.backQuote);
      case 48:
        var next = this.input.charCodeAt(this.pos + 1);
        if (next === 120 || next === 88) {
          return this.readRadixNumber(16);
        }
        if (this.options.ecmaVersion >= 6) {
          if (next === 111 || next === 79) {
            return this.readRadixNumber(8);
          }
          if (next === 98 || next === 66) {
            return this.readRadixNumber(2);
          }
        }
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        return this.readNumber(false);
      case 34:
      case 39:
        return this.readString(code);
      case 47:
        return this.readToken_slash();
      case 37:
      case 42:
        return this.readToken_mult_modulo_exp(code);
      case 124:
      case 38:
        return this.readToken_pipe_amp(code);
      case 94:
        return this.readToken_caret();
      case 43:
      case 45:
        return this.readToken_plus_min(code);
      case 60:
      case 62:
        return this.readToken_lt_gt(code);
      case 61:
      case 33:
        return this.readToken_eq_excl(code);
      case 63:
        return this.readToken_question();
      case 126:
        return this.finishOp(types$1.prefix, 1);
      case 35:
        return this.readToken_numberSign();
    }
    this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
  };
  pp2.finishOp = function(type, size) {
    var str = this.input.slice(this.pos, this.pos + size);
    this.pos += size;
    return this.finishToken(type, str);
  };
  pp2.readRegexp = function() {
    var escaped, inClass, start = this.pos;
    for (;; ) {
      if (this.pos >= this.input.length) {
        this.raise(start, "Unterminated regular expression");
      }
      var ch = this.input.charAt(this.pos);
      if (lineBreak.test(ch)) {
        this.raise(start, "Unterminated regular expression");
      }
      if (!escaped) {
        if (ch === "[") {
          inClass = true;
        } else if (ch === "]" && inClass) {
          inClass = false;
        } else if (ch === "/" && !inClass) {
          break;
        }
        escaped = ch === "\\";
      } else {
        escaped = false;
      }
      ++this.pos;
    }
    var pattern = this.input.slice(start, this.pos);
    ++this.pos;
    var flagsStart = this.pos;
    var flags = this.readWord1();
    if (this.containsEsc) {
      this.unexpected(flagsStart);
    }
    var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
    state.reset(start, pattern, flags);
    this.validateRegExpFlags(state);
    this.validateRegExpPattern(state);
    var value = null;
    try {
      value = new RegExp(pattern, flags);
    } catch (e) {}
    return this.finishToken(types$1.regexp, { pattern, flags, value });
  };
  pp2.readInt = function(radix, len, maybeLegacyOctalNumericLiteral) {
    var allowSeparators = this.options.ecmaVersion >= 12 && len === undefined;
    var isLegacyOctalNumericLiteral = maybeLegacyOctalNumericLiteral && this.input.charCodeAt(this.pos) === 48;
    var start = this.pos, total = 0, lastCode = 0;
    for (var i = 0, e = len == null ? Infinity : len;i < e; ++i, ++this.pos) {
      var code = this.input.charCodeAt(this.pos), val = undefined;
      if (allowSeparators && code === 95) {
        if (isLegacyOctalNumericLiteral) {
          this.raiseRecoverable(this.pos, "Numeric separator is not allowed in legacy octal numeric literals");
        }
        if (lastCode === 95) {
          this.raiseRecoverable(this.pos, "Numeric separator must be exactly one underscore");
        }
        if (i === 0) {
          this.raiseRecoverable(this.pos, "Numeric separator is not allowed at the first of digits");
        }
        lastCode = code;
        continue;
      }
      if (code >= 97) {
        val = code - 97 + 10;
      } else if (code >= 65) {
        val = code - 65 + 10;
      } else if (code >= 48 && code <= 57) {
        val = code - 48;
      } else {
        val = Infinity;
      }
      if (val >= radix) {
        break;
      }
      lastCode = code;
      total = total * radix + val;
    }
    if (allowSeparators && lastCode === 95) {
      this.raiseRecoverable(this.pos - 1, "Numeric separator is not allowed at the last of digits");
    }
    if (this.pos === start || len != null && this.pos - start !== len) {
      return null;
    }
    return total;
  };
  pp2.readRadixNumber = function(radix) {
    var start = this.pos;
    this.pos += 2;
    var val = this.readInt(radix);
    if (val == null) {
      this.raise(this.start + 2, "Expected number in radix " + radix);
    }
    if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
      val = stringToBigInt(this.input.slice(start, this.pos));
      ++this.pos;
    } else if (isIdentifierStart(this.fullCharCodeAtPos())) {
      this.raise(this.pos, "Identifier directly after number");
    }
    return this.finishToken(types$1.num, val);
  };
  pp2.readNumber = function(startsWithDot) {
    var start = this.pos;
    if (!startsWithDot && this.readInt(10, undefined, true) === null) {
      this.raise(start, "Invalid number");
    }
    var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
    if (octal && this.strict) {
      this.raise(start, "Invalid number");
    }
    var next = this.input.charCodeAt(this.pos);
    if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
      var val$1 = stringToBigInt(this.input.slice(start, this.pos));
      ++this.pos;
      if (isIdentifierStart(this.fullCharCodeAtPos())) {
        this.raise(this.pos, "Identifier directly after number");
      }
      return this.finishToken(types$1.num, val$1);
    }
    if (octal && /[89]/.test(this.input.slice(start, this.pos))) {
      octal = false;
    }
    if (next === 46 && !octal) {
      ++this.pos;
      this.readInt(10);
      next = this.input.charCodeAt(this.pos);
    }
    if ((next === 69 || next === 101) && !octal) {
      next = this.input.charCodeAt(++this.pos);
      if (next === 43 || next === 45) {
        ++this.pos;
      }
      if (this.readInt(10) === null) {
        this.raise(start, "Invalid number");
      }
    }
    if (isIdentifierStart(this.fullCharCodeAtPos())) {
      this.raise(this.pos, "Identifier directly after number");
    }
    var val = stringToNumber(this.input.slice(start, this.pos), octal);
    return this.finishToken(types$1.num, val);
  };
  pp2.readCodePoint = function() {
    var ch = this.input.charCodeAt(this.pos), code;
    if (ch === 123) {
      if (this.options.ecmaVersion < 6) {
        this.unexpected();
      }
      var codePos = ++this.pos;
      code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
      ++this.pos;
      if (code > 1114111) {
        this.invalidStringToken(codePos, "Code point out of bounds");
      }
    } else {
      code = this.readHexChar(4);
    }
    return code;
  };
  pp2.readString = function(quote) {
    var out = "", chunkStart = ++this.pos;
    for (;; ) {
      if (this.pos >= this.input.length) {
        this.raise(this.start, "Unterminated string constant");
      }
      var ch = this.input.charCodeAt(this.pos);
      if (ch === quote) {
        break;
      }
      if (ch === 92) {
        out += this.input.slice(chunkStart, this.pos);
        out += this.readEscapedChar(false);
        chunkStart = this.pos;
      } else if (ch === 8232 || ch === 8233) {
        if (this.options.ecmaVersion < 10) {
          this.raise(this.start, "Unterminated string constant");
        }
        ++this.pos;
        if (this.options.locations) {
          this.curLine++;
          this.lineStart = this.pos;
        }
      } else {
        if (isNewLine(ch)) {
          this.raise(this.start, "Unterminated string constant");
        }
        ++this.pos;
      }
    }
    out += this.input.slice(chunkStart, this.pos++);
    return this.finishToken(types$1.string, out);
  };
  INVALID_TEMPLATE_ESCAPE_ERROR = {};
  pp2.tryReadTemplateToken = function() {
    this.inTemplateElement = true;
    try {
      this.readTmplToken();
    } catch (err) {
      if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
        this.readInvalidTemplateToken();
      } else {
        throw err;
      }
    }
    this.inTemplateElement = false;
  };
  pp2.invalidStringToken = function(position, message) {
    if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
      throw INVALID_TEMPLATE_ESCAPE_ERROR;
    } else {
      this.raise(position, message);
    }
  };
  pp2.readTmplToken = function() {
    var out = "", chunkStart = this.pos;
    for (;; ) {
      if (this.pos >= this.input.length) {
        this.raise(this.start, "Unterminated template");
      }
      var ch = this.input.charCodeAt(this.pos);
      if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) {
        if (this.pos === this.start && (this.type === types$1.template || this.type === types$1.invalidTemplate)) {
          if (ch === 36) {
            this.pos += 2;
            return this.finishToken(types$1.dollarBraceL);
          } else {
            ++this.pos;
            return this.finishToken(types$1.backQuote);
          }
        }
        out += this.input.slice(chunkStart, this.pos);
        return this.finishToken(types$1.template, out);
      }
      if (ch === 92) {
        out += this.input.slice(chunkStart, this.pos);
        out += this.readEscapedChar(true);
        chunkStart = this.pos;
      } else if (isNewLine(ch)) {
        out += this.input.slice(chunkStart, this.pos);
        ++this.pos;
        switch (ch) {
          case 13:
            if (this.input.charCodeAt(this.pos) === 10) {
              ++this.pos;
            }
          case 10:
            out += `
`;
            break;
          default:
            out += String.fromCharCode(ch);
            break;
        }
        if (this.options.locations) {
          ++this.curLine;
          this.lineStart = this.pos;
        }
        chunkStart = this.pos;
      } else {
        ++this.pos;
      }
    }
  };
  pp2.readInvalidTemplateToken = function() {
    for (;this.pos < this.input.length; this.pos++) {
      switch (this.input[this.pos]) {
        case "\\":
          ++this.pos;
          break;
        case "$":
          if (this.input[this.pos + 1] !== "{") {
            break;
          }
        case "`":
          return this.finishToken(types$1.invalidTemplate, this.input.slice(this.start, this.pos));
        case "\r":
          if (this.input[this.pos + 1] === `
`) {
            ++this.pos;
          }
        case `
`:
        case "\u2028":
        case "\u2029":
          ++this.curLine;
          this.lineStart = this.pos + 1;
          break;
      }
    }
    this.raise(this.start, "Unterminated template");
  };
  pp2.readEscapedChar = function(inTemplate) {
    var ch = this.input.charCodeAt(++this.pos);
    ++this.pos;
    switch (ch) {
      case 110:
        return `
`;
      case 114:
        return "\r";
      case 120:
        return String.fromCharCode(this.readHexChar(2));
      case 117:
        return codePointToString(this.readCodePoint());
      case 116:
        return "\t";
      case 98:
        return "\b";
      case 118:
        return "\v";
      case 102:
        return "\f";
      case 13:
        if (this.input.charCodeAt(this.pos) === 10) {
          ++this.pos;
        }
      case 10:
        if (this.options.locations) {
          this.lineStart = this.pos;
          ++this.curLine;
        }
        return "";
      case 56:
      case 57:
        if (this.strict) {
          this.invalidStringToken(this.pos - 1, "Invalid escape sequence");
        }
        if (inTemplate) {
          var codePos = this.pos - 1;
          this.invalidStringToken(codePos, "Invalid escape sequence in template string");
        }
      default:
        if (ch >= 48 && ch <= 55) {
          var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
          var octal = parseInt(octalStr, 8);
          if (octal > 255) {
            octalStr = octalStr.slice(0, -1);
            octal = parseInt(octalStr, 8);
          }
          this.pos += octalStr.length - 1;
          ch = this.input.charCodeAt(this.pos);
          if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
            this.invalidStringToken(this.pos - 1 - octalStr.length, inTemplate ? "Octal literal in template string" : "Octal literal in strict mode");
          }
          return String.fromCharCode(octal);
        }
        if (isNewLine(ch)) {
          if (this.options.locations) {
            this.lineStart = this.pos;
            ++this.curLine;
          }
          return "";
        }
        return String.fromCharCode(ch);
    }
  };
  pp2.readHexChar = function(len) {
    var codePos = this.pos;
    var n = this.readInt(16, len);
    if (n === null) {
      this.invalidStringToken(codePos, "Bad character escape sequence");
    }
    return n;
  };
  pp2.readWord1 = function() {
    this.containsEsc = false;
    var word = "", first = true, chunkStart = this.pos;
    var astral = this.options.ecmaVersion >= 6;
    while (this.pos < this.input.length) {
      var ch = this.fullCharCodeAtPos();
      if (isIdentifierChar(ch, astral)) {
        this.pos += ch <= 65535 ? 1 : 2;
      } else if (ch === 92) {
        this.containsEsc = true;
        word += this.input.slice(chunkStart, this.pos);
        var escStart = this.pos;
        if (this.input.charCodeAt(++this.pos) !== 117) {
          this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX");
        }
        ++this.pos;
        var esc = this.readCodePoint();
        if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral)) {
          this.invalidStringToken(escStart, "Invalid Unicode escape");
        }
        word += codePointToString(esc);
        chunkStart = this.pos;
      } else {
        break;
      }
      first = false;
    }
    return word + this.input.slice(chunkStart, this.pos);
  };
  pp2.readWord = function() {
    var word = this.readWord1();
    var type = types$1.name;
    if (this.keywords.test(word)) {
      type = keywords[word];
    }
    return this.finishToken(type, word);
  };
  Parser.acorn = {
    Parser,
    version,
    defaultOptions,
    Position,
    SourceLocation,
    getLineInfo,
    Node,
    TokenType,
    tokTypes: types$1,
    keywordTypes: keywords,
    TokContext,
    tokContexts: types,
    isIdentifierChar,
    isIdentifierStart,
    Token,
    isNewLine,
    lineBreak,
    lineBreakG,
    nonASCIIwhitespace
  };
});

// node_modules/estraverse/estraverse.js
var require_estraverse = __commonJS(function(exports) {
  (function clone(exports2) {
    var Syntax, VisitorOption, VisitorKeys, BREAK, SKIP, REMOVE;
    function deepCopy(obj) {
      var ret = {}, key, val;
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          val = obj[key];
          if (typeof val === "object" && val !== null) {
            ret[key] = deepCopy(val);
          } else {
            ret[key] = val;
          }
        }
      }
      return ret;
    }
    function upperBound(array, func) {
      var diff, len, i, current;
      len = array.length;
      i = 0;
      while (len) {
        diff = len >>> 1;
        current = i + diff;
        if (func(array[current])) {
          len = diff;
        } else {
          i = current + 1;
          len -= diff + 1;
        }
      }
      return i;
    }
    Syntax = {
      AssignmentExpression: "AssignmentExpression",
      AssignmentPattern: "AssignmentPattern",
      ArrayExpression: "ArrayExpression",
      ArrayPattern: "ArrayPattern",
      ArrowFunctionExpression: "ArrowFunctionExpression",
      AwaitExpression: "AwaitExpression",
      BlockStatement: "BlockStatement",
      BinaryExpression: "BinaryExpression",
      BreakStatement: "BreakStatement",
      CallExpression: "CallExpression",
      CatchClause: "CatchClause",
      ChainExpression: "ChainExpression",
      ClassBody: "ClassBody",
      ClassDeclaration: "ClassDeclaration",
      ClassExpression: "ClassExpression",
      ComprehensionBlock: "ComprehensionBlock",
      ComprehensionExpression: "ComprehensionExpression",
      ConditionalExpression: "ConditionalExpression",
      ContinueStatement: "ContinueStatement",
      DebuggerStatement: "DebuggerStatement",
      DirectiveStatement: "DirectiveStatement",
      DoWhileStatement: "DoWhileStatement",
      EmptyStatement: "EmptyStatement",
      ExportAllDeclaration: "ExportAllDeclaration",
      ExportDefaultDeclaration: "ExportDefaultDeclaration",
      ExportNamedDeclaration: "ExportNamedDeclaration",
      ExportSpecifier: "ExportSpecifier",
      ExpressionStatement: "ExpressionStatement",
      ForStatement: "ForStatement",
      ForInStatement: "ForInStatement",
      ForOfStatement: "ForOfStatement",
      FunctionDeclaration: "FunctionDeclaration",
      FunctionExpression: "FunctionExpression",
      GeneratorExpression: "GeneratorExpression",
      Identifier: "Identifier",
      IfStatement: "IfStatement",
      ImportExpression: "ImportExpression",
      ImportDeclaration: "ImportDeclaration",
      ImportDefaultSpecifier: "ImportDefaultSpecifier",
      ImportNamespaceSpecifier: "ImportNamespaceSpecifier",
      ImportSpecifier: "ImportSpecifier",
      Literal: "Literal",
      LabeledStatement: "LabeledStatement",
      LogicalExpression: "LogicalExpression",
      MemberExpression: "MemberExpression",
      MetaProperty: "MetaProperty",
      MethodDefinition: "MethodDefinition",
      ModuleSpecifier: "ModuleSpecifier",
      NewExpression: "NewExpression",
      ObjectExpression: "ObjectExpression",
      ObjectPattern: "ObjectPattern",
      PrivateIdentifier: "PrivateIdentifier",
      Program: "Program",
      Property: "Property",
      PropertyDefinition: "PropertyDefinition",
      RestElement: "RestElement",
      ReturnStatement: "ReturnStatement",
      SequenceExpression: "SequenceExpression",
      SpreadElement: "SpreadElement",
      Super: "Super",
      SwitchStatement: "SwitchStatement",
      SwitchCase: "SwitchCase",
      TaggedTemplateExpression: "TaggedTemplateExpression",
      TemplateElement: "TemplateElement",
      TemplateLiteral: "TemplateLiteral",
      ThisExpression: "ThisExpression",
      ThrowStatement: "ThrowStatement",
      TryStatement: "TryStatement",
      UnaryExpression: "UnaryExpression",
      UpdateExpression: "UpdateExpression",
      VariableDeclaration: "VariableDeclaration",
      VariableDeclarator: "VariableDeclarator",
      WhileStatement: "WhileStatement",
      WithStatement: "WithStatement",
      YieldExpression: "YieldExpression"
    };
    VisitorKeys = {
      AssignmentExpression: ["left", "right"],
      AssignmentPattern: ["left", "right"],
      ArrayExpression: ["elements"],
      ArrayPattern: ["elements"],
      ArrowFunctionExpression: ["params", "body"],
      AwaitExpression: ["argument"],
      BlockStatement: ["body"],
      BinaryExpression: ["left", "right"],
      BreakStatement: ["label"],
      CallExpression: ["callee", "arguments"],
      CatchClause: ["param", "body"],
      ChainExpression: ["expression"],
      ClassBody: ["body"],
      ClassDeclaration: ["id", "superClass", "body"],
      ClassExpression: ["id", "superClass", "body"],
      ComprehensionBlock: ["left", "right"],
      ComprehensionExpression: ["blocks", "filter", "body"],
      ConditionalExpression: ["test", "consequent", "alternate"],
      ContinueStatement: ["label"],
      DebuggerStatement: [],
      DirectiveStatement: [],
      DoWhileStatement: ["body", "test"],
      EmptyStatement: [],
      ExportAllDeclaration: ["source"],
      ExportDefaultDeclaration: ["declaration"],
      ExportNamedDeclaration: ["declaration", "specifiers", "source"],
      ExportSpecifier: ["exported", "local"],
      ExpressionStatement: ["expression"],
      ForStatement: ["init", "test", "update", "body"],
      ForInStatement: ["left", "right", "body"],
      ForOfStatement: ["left", "right", "body"],
      FunctionDeclaration: ["id", "params", "body"],
      FunctionExpression: ["id", "params", "body"],
      GeneratorExpression: ["blocks", "filter", "body"],
      Identifier: [],
      IfStatement: ["test", "consequent", "alternate"],
      ImportExpression: ["source"],
      ImportDeclaration: ["specifiers", "source"],
      ImportDefaultSpecifier: ["local"],
      ImportNamespaceSpecifier: ["local"],
      ImportSpecifier: ["imported", "local"],
      Literal: [],
      LabeledStatement: ["label", "body"],
      LogicalExpression: ["left", "right"],
      MemberExpression: ["object", "property"],
      MetaProperty: ["meta", "property"],
      MethodDefinition: ["key", "value"],
      ModuleSpecifier: [],
      NewExpression: ["callee", "arguments"],
      ObjectExpression: ["properties"],
      ObjectPattern: ["properties"],
      PrivateIdentifier: [],
      Program: ["body"],
      Property: ["key", "value"],
      PropertyDefinition: ["key", "value"],
      RestElement: ["argument"],
      ReturnStatement: ["argument"],
      SequenceExpression: ["expressions"],
      SpreadElement: ["argument"],
      Super: [],
      SwitchStatement: ["discriminant", "cases"],
      SwitchCase: ["test", "consequent"],
      TaggedTemplateExpression: ["tag", "quasi"],
      TemplateElement: [],
      TemplateLiteral: ["quasis", "expressions"],
      ThisExpression: [],
      ThrowStatement: ["argument"],
      TryStatement: ["block", "handler", "finalizer"],
      UnaryExpression: ["argument"],
      UpdateExpression: ["argument"],
      VariableDeclaration: ["declarations"],
      VariableDeclarator: ["id", "init"],
      WhileStatement: ["test", "body"],
      WithStatement: ["object", "body"],
      YieldExpression: ["argument"]
    };
    BREAK = {};
    SKIP = {};
    REMOVE = {};
    VisitorOption = {
      Break: BREAK,
      Skip: SKIP,
      Remove: REMOVE
    };
    function Reference(parent, key) {
      this.parent = parent;
      this.key = key;
    }
    Reference.prototype.replace = function replace(node) {
      this.parent[this.key] = node;
    };
    Reference.prototype.remove = function remove() {
      if (Array.isArray(this.parent)) {
        this.parent.splice(this.key, 1);
        return true;
      } else {
        this.replace(null);
        return false;
      }
    };
    function Element(node, path, wrap, ref) {
      this.node = node;
      this.path = path;
      this.wrap = wrap;
      this.ref = ref;
    }
    function Controller() {}
    Controller.prototype.path = function path() {
      var i, iz, j, jz, result, element;
      function addToPath(result, path) {
        if (Array.isArray(path)) {
          for (j = 0, jz = path.length;j < jz; ++j) {
            result.push(path[j]);
          }
        } else {
          result.push(path);
        }
      }
      if (!this.__current.path) {
        return null;
      }
      result = [];
      for (i = 2, iz = this.__leavelist.length;i < iz; ++i) {
        element = this.__leavelist[i];
        addToPath(result, element.path);
      }
      addToPath(result, this.__current.path);
      return result;
    };
    Controller.prototype.type = function() {
      var node = this.current();
      return node.type || this.__current.wrap;
    };
    Controller.prototype.parents = function parents() {
      var i, iz, result;
      result = [];
      for (i = 1, iz = this.__leavelist.length;i < iz; ++i) {
        result.push(this.__leavelist[i].node);
      }
      return result;
    };
    Controller.prototype.current = function current() {
      return this.__current.node;
    };
    Controller.prototype.__execute = function __execute(callback, element) {
      var previous, result;
      result = undefined;
      previous = this.__current;
      this.__current = element;
      this.__state = null;
      if (callback) {
        result = callback.call(this, element.node, this.__leavelist[this.__leavelist.length - 1].node);
      }
      this.__current = previous;
      return result;
    };
    Controller.prototype.notify = function notify(flag) {
      this.__state = flag;
    };
    Controller.prototype.skip = function() {
      this.notify(SKIP);
    };
    Controller.prototype["break"] = function() {
      this.notify(BREAK);
    };
    Controller.prototype.remove = function() {
      this.notify(REMOVE);
    };
    Controller.prototype.__initialize = function(root, visitor) {
      this.visitor = visitor;
      this.root = root;
      this.__worklist = [];
      this.__leavelist = [];
      this.__current = null;
      this.__state = null;
      this.__fallback = null;
      if (visitor.fallback === "iteration") {
        this.__fallback = Object.keys;
      } else if (typeof visitor.fallback === "function") {
        this.__fallback = visitor.fallback;
      }
      this.__keys = VisitorKeys;
      if (visitor.keys) {
        this.__keys = Object.assign(Object.create(this.__keys), visitor.keys);
      }
    };
    function isNode(node) {
      if (node == null) {
        return false;
      }
      return typeof node === "object" && typeof node.type === "string";
    }
    function isProperty(nodeType, key) {
      return (nodeType === Syntax.ObjectExpression || nodeType === Syntax.ObjectPattern) && key === "properties";
    }
    function candidateExistsInLeaveList(leavelist, candidate) {
      for (var i = leavelist.length - 1;i >= 0; --i) {
        if (leavelist[i].node === candidate) {
          return true;
        }
      }
      return false;
    }
    Controller.prototype.traverse = function traverse(root, visitor) {
      var worklist, leavelist, element, node, nodeType, ret, key, current, current2, candidates, candidate, sentinel;
      this.__initialize(root, visitor);
      sentinel = {};
      worklist = this.__worklist;
      leavelist = this.__leavelist;
      worklist.push(new Element(root, null, null, null));
      leavelist.push(new Element(null, null, null, null));
      while (worklist.length) {
        element = worklist.pop();
        if (element === sentinel) {
          element = leavelist.pop();
          ret = this.__execute(visitor.leave, element);
          if (this.__state === BREAK || ret === BREAK) {
            return;
          }
          continue;
        }
        if (element.node) {
          ret = this.__execute(visitor.enter, element);
          if (this.__state === BREAK || ret === BREAK) {
            return;
          }
          worklist.push(sentinel);
          leavelist.push(element);
          if (this.__state === SKIP || ret === SKIP) {
            continue;
          }
          node = element.node;
          nodeType = node.type || element.wrap;
          candidates = this.__keys[nodeType];
          if (!candidates) {
            if (this.__fallback) {
              candidates = this.__fallback(node);
            } else {
              throw new Error("Unknown node type " + nodeType + ".");
            }
          }
          current = candidates.length;
          while ((current -= 1) >= 0) {
            key = candidates[current];
            candidate = node[key];
            if (!candidate) {
              continue;
            }
            if (Array.isArray(candidate)) {
              current2 = candidate.length;
              while ((current2 -= 1) >= 0) {
                if (!candidate[current2]) {
                  continue;
                }
                if (candidateExistsInLeaveList(leavelist, candidate[current2])) {
                  continue;
                }
                if (isProperty(nodeType, candidates[current])) {
                  element = new Element(candidate[current2], [key, current2], "Property", null);
                } else if (isNode(candidate[current2])) {
                  element = new Element(candidate[current2], [key, current2], null, null);
                } else {
                  continue;
                }
                worklist.push(element);
              }
            } else if (isNode(candidate)) {
              if (candidateExistsInLeaveList(leavelist, candidate)) {
                continue;
              }
              worklist.push(new Element(candidate, key, null, null));
            }
          }
        }
      }
    };
    Controller.prototype.replace = function replace(root, visitor) {
      var worklist, leavelist, node, nodeType, target, element, current, current2, candidates, candidate, sentinel, outer, key;
      function removeElem(element) {
        var i, key, nextElem, parent;
        if (element.ref.remove()) {
          key = element.ref.key;
          parent = element.ref.parent;
          i = worklist.length;
          while (i--) {
            nextElem = worklist[i];
            if (nextElem.ref && nextElem.ref.parent === parent) {
              if (nextElem.ref.key < key) {
                break;
              }
              --nextElem.ref.key;
            }
          }
        }
      }
      this.__initialize(root, visitor);
      sentinel = {};
      worklist = this.__worklist;
      leavelist = this.__leavelist;
      outer = {
        root
      };
      element = new Element(root, null, null, new Reference(outer, "root"));
      worklist.push(element);
      leavelist.push(element);
      while (worklist.length) {
        element = worklist.pop();
        if (element === sentinel) {
          element = leavelist.pop();
          target = this.__execute(visitor.leave, element);
          if (target !== undefined && target !== BREAK && target !== SKIP && target !== REMOVE) {
            element.ref.replace(target);
          }
          if (this.__state === REMOVE || target === REMOVE) {
            removeElem(element);
          }
          if (this.__state === BREAK || target === BREAK) {
            return outer.root;
          }
          continue;
        }
        target = this.__execute(visitor.enter, element);
        if (target !== undefined && target !== BREAK && target !== SKIP && target !== REMOVE) {
          element.ref.replace(target);
          element.node = target;
        }
        if (this.__state === REMOVE || target === REMOVE) {
          removeElem(element);
          element.node = null;
        }
        if (this.__state === BREAK || target === BREAK) {
          return outer.root;
        }
        node = element.node;
        if (!node) {
          continue;
        }
        worklist.push(sentinel);
        leavelist.push(element);
        if (this.__state === SKIP || target === SKIP) {
          continue;
        }
        nodeType = node.type || element.wrap;
        candidates = this.__keys[nodeType];
        if (!candidates) {
          if (this.__fallback) {
            candidates = this.__fallback(node);
          } else {
            throw new Error("Unknown node type " + nodeType + ".");
          }
        }
        current = candidates.length;
        while ((current -= 1) >= 0) {
          key = candidates[current];
          candidate = node[key];
          if (!candidate) {
            continue;
          }
          if (Array.isArray(candidate)) {
            current2 = candidate.length;
            while ((current2 -= 1) >= 0) {
              if (!candidate[current2]) {
                continue;
              }
              if (isProperty(nodeType, candidates[current])) {
                element = new Element(candidate[current2], [key, current2], "Property", new Reference(candidate, current2));
              } else if (isNode(candidate[current2])) {
                element = new Element(candidate[current2], [key, current2], null, new Reference(candidate, current2));
              } else {
                continue;
              }
              worklist.push(element);
            }
          } else if (isNode(candidate)) {
            worklist.push(new Element(candidate, key, null, new Reference(node, key)));
          }
        }
      }
      return outer.root;
    };
    function traverse(root, visitor) {
      var controller = new Controller;
      return controller.traverse(root, visitor);
    }
    function replace(root, visitor) {
      var controller = new Controller;
      return controller.replace(root, visitor);
    }
    function extendCommentRange(comment, tokens) {
      var target;
      target = upperBound(tokens, function search(token) {
        return token.range[0] > comment.range[0];
      });
      comment.extendedRange = [comment.range[0], comment.range[1]];
      if (target !== tokens.length) {
        comment.extendedRange[1] = tokens[target].range[0];
      }
      target -= 1;
      if (target >= 0) {
        comment.extendedRange[0] = tokens[target].range[1];
      }
      return comment;
    }
    function attachComments(tree, providedComments, tokens) {
      var comments = [], comment, len, i, cursor;
      if (!tree.range) {
        throw new Error("attachComments needs range information");
      }
      if (!tokens.length) {
        if (providedComments.length) {
          for (i = 0, len = providedComments.length;i < len; i += 1) {
            comment = deepCopy(providedComments[i]);
            comment.extendedRange = [0, tree.range[0]];
            comments.push(comment);
          }
          tree.leadingComments = comments;
        }
        return tree;
      }
      for (i = 0, len = providedComments.length;i < len; i += 1) {
        comments.push(extendCommentRange(deepCopy(providedComments[i]), tokens));
      }
      cursor = 0;
      traverse(tree, {
        enter: function(node) {
          var comment;
          while (cursor < comments.length) {
            comment = comments[cursor];
            if (comment.extendedRange[1] > node.range[0]) {
              break;
            }
            if (comment.extendedRange[1] === node.range[0]) {
              if (!node.leadingComments) {
                node.leadingComments = [];
              }
              node.leadingComments.push(comment);
              comments.splice(cursor, 1);
            } else {
              cursor += 1;
            }
          }
          if (cursor === comments.length) {
            return VisitorOption.Break;
          }
          if (comments[cursor].extendedRange[0] > node.range[1]) {
            return VisitorOption.Skip;
          }
        }
      });
      cursor = 0;
      traverse(tree, {
        leave: function(node) {
          var comment;
          while (cursor < comments.length) {
            comment = comments[cursor];
            if (node.range[1] < comment.extendedRange[0]) {
              break;
            }
            if (node.range[1] === comment.extendedRange[0]) {
              if (!node.trailingComments) {
                node.trailingComments = [];
              }
              node.trailingComments.push(comment);
              comments.splice(cursor, 1);
            } else {
              cursor += 1;
            }
          }
          if (cursor === comments.length) {
            return VisitorOption.Break;
          }
          if (comments[cursor].extendedRange[0] > node.range[1]) {
            return VisitorOption.Skip;
          }
        }
      });
      return tree;
    }
    exports2.Syntax = Syntax;
    exports2.traverse = traverse;
    exports2.replace = replace;
    exports2.attachComments = attachComments;
    exports2.VisitorKeys = VisitorKeys;
    exports2.VisitorOption = VisitorOption;
    exports2.Controller = Controller;
    exports2.cloneEnvironment = function() {
      return clone({});
    };
    return exports2;
  })(exports);
});

// node_modules/esutils/lib/ast.js
var require_ast = __commonJS(function(exports, module) {
  (function() {
    function isExpression(node) {
      if (node == null) {
        return false;
      }
      switch (node.type) {
        case "ArrayExpression":
        case "AssignmentExpression":
        case "BinaryExpression":
        case "CallExpression":
        case "ConditionalExpression":
        case "FunctionExpression":
        case "Identifier":
        case "Literal":
        case "LogicalExpression":
        case "MemberExpression":
        case "NewExpression":
        case "ObjectExpression":
        case "SequenceExpression":
        case "ThisExpression":
        case "UnaryExpression":
        case "UpdateExpression":
          return true;
      }
      return false;
    }
    function isIterationStatement(node) {
      if (node == null) {
        return false;
      }
      switch (node.type) {
        case "DoWhileStatement":
        case "ForInStatement":
        case "ForStatement":
        case "WhileStatement":
          return true;
      }
      return false;
    }
    function isStatement(node) {
      if (node == null) {
        return false;
      }
      switch (node.type) {
        case "BlockStatement":
        case "BreakStatement":
        case "ContinueStatement":
        case "DebuggerStatement":
        case "DoWhileStatement":
        case "EmptyStatement":
        case "ExpressionStatement":
        case "ForInStatement":
        case "ForStatement":
        case "IfStatement":
        case "LabeledStatement":
        case "ReturnStatement":
        case "SwitchStatement":
        case "ThrowStatement":
        case "TryStatement":
        case "VariableDeclaration":
        case "WhileStatement":
        case "WithStatement":
          return true;
      }
      return false;
    }
    function isSourceElement(node) {
      return isStatement(node) || node != null && node.type === "FunctionDeclaration";
    }
    function trailingStatement(node) {
      switch (node.type) {
        case "IfStatement":
          if (node.alternate != null) {
            return node.alternate;
          }
          return node.consequent;
        case "LabeledStatement":
        case "ForStatement":
        case "ForInStatement":
        case "WhileStatement":
        case "WithStatement":
          return node.body;
      }
      return null;
    }
    function isProblematicIfStatement(node) {
      var current;
      if (node.type !== "IfStatement") {
        return false;
      }
      if (node.alternate == null) {
        return false;
      }
      current = node.consequent;
      do {
        if (current.type === "IfStatement") {
          if (current.alternate == null) {
            return true;
          }
        }
        current = trailingStatement(current);
      } while (current);
      return false;
    }
    module.exports = {
      isExpression,
      isStatement,
      isIterationStatement,
      isSourceElement,
      isProblematicIfStatement,
      trailingStatement
    };
  })();
});

// node_modules/esutils/lib/code.js
var require_code = __commonJS(function(exports, module) {
  (function() {
    var ES6Regex, ES5Regex, NON_ASCII_WHITESPACES, IDENTIFIER_START, IDENTIFIER_PART, ch;
    ES5Regex = {
      NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
      NonAsciiIdentifierPart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/
    };
    ES6Regex = {
      NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]/,
      NonAsciiIdentifierPart: /[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F\uDFE0]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4A\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/
    };
    function isDecimalDigit(ch) {
      return 48 <= ch && ch <= 57;
    }
    function isHexDigit(ch) {
      return 48 <= ch && ch <= 57 || 97 <= ch && ch <= 102 || 65 <= ch && ch <= 70;
    }
    function isOctalDigit(ch) {
      return ch >= 48 && ch <= 55;
    }
    NON_ASCII_WHITESPACES = [
      5760,
      8192,
      8193,
      8194,
      8195,
      8196,
      8197,
      8198,
      8199,
      8200,
      8201,
      8202,
      8239,
      8287,
      12288,
      65279
    ];
    function isWhiteSpace(ch) {
      return ch === 32 || ch === 9 || ch === 11 || ch === 12 || ch === 160 || ch >= 5760 && NON_ASCII_WHITESPACES.indexOf(ch) >= 0;
    }
    function isLineTerminator(ch) {
      return ch === 10 || ch === 13 || ch === 8232 || ch === 8233;
    }
    function fromCodePoint(cp) {
      if (cp <= 65535) {
        return String.fromCharCode(cp);
      }
      var cu1 = String.fromCharCode(Math.floor((cp - 65536) / 1024) + 55296);
      var cu2 = String.fromCharCode((cp - 65536) % 1024 + 56320);
      return cu1 + cu2;
    }
    IDENTIFIER_START = new Array(128);
    for (ch = 0;ch < 128; ++ch) {
      IDENTIFIER_START[ch] = ch >= 97 && ch <= 122 || ch >= 65 && ch <= 90 || ch === 36 || ch === 95;
    }
    IDENTIFIER_PART = new Array(128);
    for (ch = 0;ch < 128; ++ch) {
      IDENTIFIER_PART[ch] = ch >= 97 && ch <= 122 || ch >= 65 && ch <= 90 || ch >= 48 && ch <= 57 || ch === 36 || ch === 95;
    }
    function isIdentifierStartES5(ch) {
      return ch < 128 ? IDENTIFIER_START[ch] : ES5Regex.NonAsciiIdentifierStart.test(fromCodePoint(ch));
    }
    function isIdentifierPartES5(ch) {
      return ch < 128 ? IDENTIFIER_PART[ch] : ES5Regex.NonAsciiIdentifierPart.test(fromCodePoint(ch));
    }
    function isIdentifierStartES6(ch) {
      return ch < 128 ? IDENTIFIER_START[ch] : ES6Regex.NonAsciiIdentifierStart.test(fromCodePoint(ch));
    }
    function isIdentifierPartES6(ch) {
      return ch < 128 ? IDENTIFIER_PART[ch] : ES6Regex.NonAsciiIdentifierPart.test(fromCodePoint(ch));
    }
    module.exports = {
      isDecimalDigit,
      isHexDigit,
      isOctalDigit,
      isWhiteSpace,
      isLineTerminator,
      isIdentifierStartES5,
      isIdentifierPartES5,
      isIdentifierStartES6,
      isIdentifierPartES6
    };
  })();
});

// node_modules/esutils/lib/keyword.js
var require_keyword = __commonJS(function(exports, module) {
  (function() {
    var code = require_code();
    function isStrictModeReservedWordES6(id) {
      switch (id) {
        case "implements":
        case "interface":
        case "package":
        case "private":
        case "protected":
        case "public":
        case "static":
        case "let":
          return true;
        default:
          return false;
      }
    }
    function isKeywordES5(id, strict) {
      if (!strict && id === "yield") {
        return false;
      }
      return isKeywordES6(id, strict);
    }
    function isKeywordES6(id, strict) {
      if (strict && isStrictModeReservedWordES6(id)) {
        return true;
      }
      switch (id.length) {
        case 2:
          return id === "if" || id === "in" || id === "do";
        case 3:
          return id === "var" || id === "for" || id === "new" || id === "try";
        case 4:
          return id === "this" || id === "else" || id === "case" || id === "void" || id === "with" || id === "enum";
        case 5:
          return id === "while" || id === "break" || id === "catch" || id === "throw" || id === "const" || id === "yield" || id === "class" || id === "super";
        case 6:
          return id === "return" || id === "typeof" || id === "delete" || id === "switch" || id === "export" || id === "import";
        case 7:
          return id === "default" || id === "finally" || id === "extends";
        case 8:
          return id === "function" || id === "continue" || id === "debugger";
        case 10:
          return id === "instanceof";
        default:
          return false;
      }
    }
    function isReservedWordES5(id, strict) {
      return id === "null" || id === "true" || id === "false" || isKeywordES5(id, strict);
    }
    function isReservedWordES6(id, strict) {
      return id === "null" || id === "true" || id === "false" || isKeywordES6(id, strict);
    }
    function isRestrictedWord(id) {
      return id === "eval" || id === "arguments";
    }
    function isIdentifierNameES5(id) {
      var i, iz, ch;
      if (id.length === 0) {
        return false;
      }
      ch = id.charCodeAt(0);
      if (!code.isIdentifierStartES5(ch)) {
        return false;
      }
      for (i = 1, iz = id.length;i < iz; ++i) {
        ch = id.charCodeAt(i);
        if (!code.isIdentifierPartES5(ch)) {
          return false;
        }
      }
      return true;
    }
    function decodeUtf16(lead, trail) {
      return (lead - 55296) * 1024 + (trail - 56320) + 65536;
    }
    function isIdentifierNameES6(id) {
      var i, iz, ch, lowCh, check;
      if (id.length === 0) {
        return false;
      }
      check = code.isIdentifierStartES6;
      for (i = 0, iz = id.length;i < iz; ++i) {
        ch = id.charCodeAt(i);
        if (55296 <= ch && ch <= 56319) {
          ++i;
          if (i >= iz) {
            return false;
          }
          lowCh = id.charCodeAt(i);
          if (!(56320 <= lowCh && lowCh <= 57343)) {
            return false;
          }
          ch = decodeUtf16(ch, lowCh);
        }
        if (!check(ch)) {
          return false;
        }
        check = code.isIdentifierPartES6;
      }
      return true;
    }
    function isIdentifierES5(id, strict) {
      return isIdentifierNameES5(id) && !isReservedWordES5(id, strict);
    }
    function isIdentifierES6(id, strict) {
      return isIdentifierNameES6(id) && !isReservedWordES6(id, strict);
    }
    module.exports = {
      isKeywordES5,
      isKeywordES6,
      isReservedWordES5,
      isReservedWordES6,
      isRestrictedWord,
      isIdentifierNameES5,
      isIdentifierNameES6,
      isIdentifierES5,
      isIdentifierES6
    };
  })();
});

// node_modules/esutils/lib/utils.js
var require_utils = __commonJS(function(exports) {
  (function() {
    exports.ast = require_ast();
    exports.code = require_code();
    exports.keyword = require_keyword();
  })();
});

// node_modules/source-map/lib/base64.js
var require_base64 = __commonJS(function(exports) {
  var intToCharMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
  exports.encode = function(number) {
    if (0 <= number && number < intToCharMap.length) {
      return intToCharMap[number];
    }
    throw new TypeError("Must be between 0 and 63: " + number);
  };
  exports.decode = function(charCode) {
    var bigA = 65;
    var bigZ = 90;
    var littleA = 97;
    var littleZ = 122;
    var zero = 48;
    var nine = 57;
    var plus = 43;
    var slash = 47;
    var littleOffset = 26;
    var numberOffset = 52;
    if (bigA <= charCode && charCode <= bigZ) {
      return charCode - bigA;
    }
    if (littleA <= charCode && charCode <= littleZ) {
      return charCode - littleA + littleOffset;
    }
    if (zero <= charCode && charCode <= nine) {
      return charCode - zero + numberOffset;
    }
    if (charCode == plus) {
      return 62;
    }
    if (charCode == slash) {
      return 63;
    }
    return -1;
  };
});

// node_modules/source-map/lib/base64-vlq.js
var require_base64_vlq = __commonJS(function(exports) {
  var base64 = require_base64();
  var VLQ_BASE_SHIFT = 5;
  var VLQ_BASE = 1 << VLQ_BASE_SHIFT;
  var VLQ_BASE_MASK = VLQ_BASE - 1;
  var VLQ_CONTINUATION_BIT = VLQ_BASE;
  function toVLQSigned(aValue) {
    return aValue < 0 ? (-aValue << 1) + 1 : (aValue << 1) + 0;
  }
  function fromVLQSigned(aValue) {
    var isNegative = (aValue & 1) === 1;
    var shifted = aValue >> 1;
    return isNegative ? -shifted : shifted;
  }
  exports.encode = function base64VLQ_encode(aValue) {
    var encoded = "";
    var digit;
    var vlq = toVLQSigned(aValue);
    do {
      digit = vlq & VLQ_BASE_MASK;
      vlq >>>= VLQ_BASE_SHIFT;
      if (vlq > 0) {
        digit |= VLQ_CONTINUATION_BIT;
      }
      encoded += base64.encode(digit);
    } while (vlq > 0);
    return encoded;
  };
  exports.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
    var strLen = aStr.length;
    var result = 0;
    var shift = 0;
    var continuation, digit;
    do {
      if (aIndex >= strLen) {
        throw new Error("Expected more digits in base 64 VLQ value.");
      }
      digit = base64.decode(aStr.charCodeAt(aIndex++));
      if (digit === -1) {
        throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
      }
      continuation = !!(digit & VLQ_CONTINUATION_BIT);
      digit &= VLQ_BASE_MASK;
      result = result + (digit << shift);
      shift += VLQ_BASE_SHIFT;
    } while (continuation);
    aOutParam.value = fromVLQSigned(result);
    aOutParam.rest = aIndex;
  };
});

// node_modules/source-map/lib/util.js
var require_util = __commonJS(function(exports) {
  function getArg(aArgs, aName, aDefaultValue) {
    if (aName in aArgs) {
      return aArgs[aName];
    } else if (arguments.length === 3) {
      return aDefaultValue;
    } else {
      throw new Error('"' + aName + '" is a required argument.');
    }
  }
  exports.getArg = getArg;
  var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
  var dataUrlRegexp = /^data:.+\,.+$/;
  function urlParse(aUrl) {
    var match = aUrl.match(urlRegexp);
    if (!match) {
      return null;
    }
    return {
      scheme: match[1],
      auth: match[2],
      host: match[3],
      port: match[4],
      path: match[5]
    };
  }
  exports.urlParse = urlParse;
  function urlGenerate(aParsedUrl) {
    var url = "";
    if (aParsedUrl.scheme) {
      url += aParsedUrl.scheme + ":";
    }
    url += "//";
    if (aParsedUrl.auth) {
      url += aParsedUrl.auth + "@";
    }
    if (aParsedUrl.host) {
      url += aParsedUrl.host;
    }
    if (aParsedUrl.port) {
      url += ":" + aParsedUrl.port;
    }
    if (aParsedUrl.path) {
      url += aParsedUrl.path;
    }
    return url;
  }
  exports.urlGenerate = urlGenerate;
  function normalize(aPath) {
    var path = aPath;
    var url = urlParse(aPath);
    if (url) {
      if (!url.path) {
        return aPath;
      }
      path = url.path;
    }
    var isAbsolute = exports.isAbsolute(path);
    var parts = path.split(/\/+/);
    for (var part, up = 0, i = parts.length - 1;i >= 0; i--) {
      part = parts[i];
      if (part === ".") {
        parts.splice(i, 1);
      } else if (part === "..") {
        up++;
      } else if (up > 0) {
        if (part === "") {
          parts.splice(i + 1, up);
          up = 0;
        } else {
          parts.splice(i, 2);
          up--;
        }
      }
    }
    path = parts.join("/");
    if (path === "") {
      path = isAbsolute ? "/" : ".";
    }
    if (url) {
      url.path = path;
      return urlGenerate(url);
    }
    return path;
  }
  exports.normalize = normalize;
  function join(aRoot, aPath) {
    if (aRoot === "") {
      aRoot = ".";
    }
    if (aPath === "") {
      aPath = ".";
    }
    var aPathUrl = urlParse(aPath);
    var aRootUrl = urlParse(aRoot);
    if (aRootUrl) {
      aRoot = aRootUrl.path || "/";
    }
    if (aPathUrl && !aPathUrl.scheme) {
      if (aRootUrl) {
        aPathUrl.scheme = aRootUrl.scheme;
      }
      return urlGenerate(aPathUrl);
    }
    if (aPathUrl || aPath.match(dataUrlRegexp)) {
      return aPath;
    }
    if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
      aRootUrl.host = aPath;
      return urlGenerate(aRootUrl);
    }
    var joined = aPath.charAt(0) === "/" ? aPath : normalize(aRoot.replace(/\/+$/, "") + "/" + aPath);
    if (aRootUrl) {
      aRootUrl.path = joined;
      return urlGenerate(aRootUrl);
    }
    return joined;
  }
  exports.join = join;
  exports.isAbsolute = function(aPath) {
    return aPath.charAt(0) === "/" || urlRegexp.test(aPath);
  };
  function relative(aRoot, aPath) {
    if (aRoot === "") {
      aRoot = ".";
    }
    aRoot = aRoot.replace(/\/$/, "");
    var level = 0;
    while (aPath.indexOf(aRoot + "/") !== 0) {
      var index = aRoot.lastIndexOf("/");
      if (index < 0) {
        return aPath;
      }
      aRoot = aRoot.slice(0, index);
      if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
        return aPath;
      }
      ++level;
    }
    return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
  }
  exports.relative = relative;
  var supportsNullProto = function() {
    var obj = Object.create(null);
    return !("__proto__" in obj);
  }();
  function identity(s) {
    return s;
  }
  function toSetString(aStr) {
    if (isProtoString(aStr)) {
      return "$" + aStr;
    }
    return aStr;
  }
  exports.toSetString = supportsNullProto ? identity : toSetString;
  function fromSetString(aStr) {
    if (isProtoString(aStr)) {
      return aStr.slice(1);
    }
    return aStr;
  }
  exports.fromSetString = supportsNullProto ? identity : fromSetString;
  function isProtoString(s) {
    if (!s) {
      return false;
    }
    var length = s.length;
    if (length < 9) {
      return false;
    }
    if (s.charCodeAt(length - 1) !== 95 || s.charCodeAt(length - 2) !== 95 || s.charCodeAt(length - 3) !== 111 || s.charCodeAt(length - 4) !== 116 || s.charCodeAt(length - 5) !== 111 || s.charCodeAt(length - 6) !== 114 || s.charCodeAt(length - 7) !== 112 || s.charCodeAt(length - 8) !== 95 || s.charCodeAt(length - 9) !== 95) {
      return false;
    }
    for (var i = length - 10;i >= 0; i--) {
      if (s.charCodeAt(i) !== 36) {
        return false;
      }
    }
    return true;
  }
  function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
    var cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp !== 0) {
      return cmp;
    }
    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp !== 0) {
      return cmp;
    }
    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp !== 0 || onlyCompareOriginal) {
      return cmp;
    }
    cmp = mappingA.generatedColumn - mappingB.generatedColumn;
    if (cmp !== 0) {
      return cmp;
    }
    cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp !== 0) {
      return cmp;
    }
    return strcmp(mappingA.name, mappingB.name);
  }
  exports.compareByOriginalPositions = compareByOriginalPositions;
  function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
    var cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp !== 0) {
      return cmp;
    }
    cmp = mappingA.generatedColumn - mappingB.generatedColumn;
    if (cmp !== 0 || onlyCompareGenerated) {
      return cmp;
    }
    cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp !== 0) {
      return cmp;
    }
    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp !== 0) {
      return cmp;
    }
    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp !== 0) {
      return cmp;
    }
    return strcmp(mappingA.name, mappingB.name);
  }
  exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;
  function strcmp(aStr1, aStr2) {
    if (aStr1 === aStr2) {
      return 0;
    }
    if (aStr1 === null) {
      return 1;
    }
    if (aStr2 === null) {
      return -1;
    }
    if (aStr1 > aStr2) {
      return 1;
    }
    return -1;
  }
  function compareByGeneratedPositionsInflated(mappingA, mappingB) {
    var cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp !== 0) {
      return cmp;
    }
    cmp = mappingA.generatedColumn - mappingB.generatedColumn;
    if (cmp !== 0) {
      return cmp;
    }
    cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp !== 0) {
      return cmp;
    }
    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp !== 0) {
      return cmp;
    }
    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp !== 0) {
      return cmp;
    }
    return strcmp(mappingA.name, mappingB.name);
  }
  exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;
  function parseSourceMapInput(str) {
    return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ""));
  }
  exports.parseSourceMapInput = parseSourceMapInput;
  function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
    sourceURL = sourceURL || "";
    if (sourceRoot) {
      if (sourceRoot[sourceRoot.length - 1] !== "/" && sourceURL[0] !== "/") {
        sourceRoot += "/";
      }
      sourceURL = sourceRoot + sourceURL;
    }
    if (sourceMapURL) {
      var parsed = urlParse(sourceMapURL);
      if (!parsed) {
        throw new Error("sourceMapURL could not be parsed");
      }
      if (parsed.path) {
        var index = parsed.path.lastIndexOf("/");
        if (index >= 0) {
          parsed.path = parsed.path.substring(0, index + 1);
        }
      }
      sourceURL = join(urlGenerate(parsed), sourceURL);
    }
    return normalize(sourceURL);
  }
  exports.computeSourceURL = computeSourceURL;
});

// node_modules/source-map/lib/array-set.js
var require_array_set = __commonJS(function(exports) {
  var util = require_util();
  var has = Object.prototype.hasOwnProperty;
  var hasNativeMap = typeof Map !== "undefined";
  function ArraySet() {
    this._array = [];
    this._set = hasNativeMap ? new Map : Object.create(null);
  }
  ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
    var set = new ArraySet;
    for (var i = 0, len = aArray.length;i < len; i++) {
      set.add(aArray[i], aAllowDuplicates);
    }
    return set;
  };
  ArraySet.prototype.size = function ArraySet_size() {
    return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
  };
  ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
    var sStr = hasNativeMap ? aStr : util.toSetString(aStr);
    var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
    var idx = this._array.length;
    if (!isDuplicate || aAllowDuplicates) {
      this._array.push(aStr);
    }
    if (!isDuplicate) {
      if (hasNativeMap) {
        this._set.set(aStr, idx);
      } else {
        this._set[sStr] = idx;
      }
    }
  };
  ArraySet.prototype.has = function ArraySet_has(aStr) {
    if (hasNativeMap) {
      return this._set.has(aStr);
    } else {
      var sStr = util.toSetString(aStr);
      return has.call(this._set, sStr);
    }
  };
  ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
    if (hasNativeMap) {
      var idx = this._set.get(aStr);
      if (idx >= 0) {
        return idx;
      }
    } else {
      var sStr = util.toSetString(aStr);
      if (has.call(this._set, sStr)) {
        return this._set[sStr];
      }
    }
    throw new Error('"' + aStr + '" is not in the set.');
  };
  ArraySet.prototype.at = function ArraySet_at(aIdx) {
    if (aIdx >= 0 && aIdx < this._array.length) {
      return this._array[aIdx];
    }
    throw new Error("No element indexed by " + aIdx);
  };
  ArraySet.prototype.toArray = function ArraySet_toArray() {
    return this._array.slice();
  };
  exports.ArraySet = ArraySet;
});

// node_modules/source-map/lib/mapping-list.js
var require_mapping_list = __commonJS(function(exports) {
  var util = require_util();
  function generatedPositionAfter(mappingA, mappingB) {
    var lineA = mappingA.generatedLine;
    var lineB = mappingB.generatedLine;
    var columnA = mappingA.generatedColumn;
    var columnB = mappingB.generatedColumn;
    return lineB > lineA || lineB == lineA && columnB >= columnA || util.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
  }
  function MappingList() {
    this._array = [];
    this._sorted = true;
    this._last = { generatedLine: -1, generatedColumn: 0 };
  }
  MappingList.prototype.unsortedForEach = function MappingList_forEach(aCallback, aThisArg) {
    this._array.forEach(aCallback, aThisArg);
  };
  MappingList.prototype.add = function MappingList_add(aMapping) {
    if (generatedPositionAfter(this._last, aMapping)) {
      this._last = aMapping;
      this._array.push(aMapping);
    } else {
      this._sorted = false;
      this._array.push(aMapping);
    }
  };
  MappingList.prototype.toArray = function MappingList_toArray() {
    if (!this._sorted) {
      this._array.sort(util.compareByGeneratedPositionsInflated);
      this._sorted = true;
    }
    return this._array;
  };
  exports.MappingList = MappingList;
});

// node_modules/source-map/lib/source-map-generator.js
var require_source_map_generator = __commonJS(function(exports) {
  var base64VLQ = require_base64_vlq();
  var util = require_util();
  var ArraySet = require_array_set().ArraySet;
  var MappingList = require_mapping_list().MappingList;
  function SourceMapGenerator(aArgs) {
    if (!aArgs) {
      aArgs = {};
    }
    this._file = util.getArg(aArgs, "file", null);
    this._sourceRoot = util.getArg(aArgs, "sourceRoot", null);
    this._skipValidation = util.getArg(aArgs, "skipValidation", false);
    this._sources = new ArraySet;
    this._names = new ArraySet;
    this._mappings = new MappingList;
    this._sourcesContents = null;
  }
  SourceMapGenerator.prototype._version = 3;
  SourceMapGenerator.fromSourceMap = function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
    var sourceRoot = aSourceMapConsumer.sourceRoot;
    var generator = new SourceMapGenerator({
      file: aSourceMapConsumer.file,
      sourceRoot
    });
    aSourceMapConsumer.eachMapping(function(mapping) {
      var newMapping = {
        generated: {
          line: mapping.generatedLine,
          column: mapping.generatedColumn
        }
      };
      if (mapping.source != null) {
        newMapping.source = mapping.source;
        if (sourceRoot != null) {
          newMapping.source = util.relative(sourceRoot, newMapping.source);
        }
        newMapping.original = {
          line: mapping.originalLine,
          column: mapping.originalColumn
        };
        if (mapping.name != null) {
          newMapping.name = mapping.name;
        }
      }
      generator.addMapping(newMapping);
    });
    aSourceMapConsumer.sources.forEach(function(sourceFile) {
      var sourceRelative = sourceFile;
      if (sourceRoot !== null) {
        sourceRelative = util.relative(sourceRoot, sourceFile);
      }
      if (!generator._sources.has(sourceRelative)) {
        generator._sources.add(sourceRelative);
      }
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        generator.setSourceContent(sourceFile, content);
      }
    });
    return generator;
  };
  SourceMapGenerator.prototype.addMapping = function SourceMapGenerator_addMapping(aArgs) {
    var generated = util.getArg(aArgs, "generated");
    var original = util.getArg(aArgs, "original", null);
    var source = util.getArg(aArgs, "source", null);
    var name = util.getArg(aArgs, "name", null);
    if (!this._skipValidation) {
      this._validateMapping(generated, original, source, name);
    }
    if (source != null) {
      source = String(source);
      if (!this._sources.has(source)) {
        this._sources.add(source);
      }
    }
    if (name != null) {
      name = String(name);
      if (!this._names.has(name)) {
        this._names.add(name);
      }
    }
    this._mappings.add({
      generatedLine: generated.line,
      generatedColumn: generated.column,
      originalLine: original != null && original.line,
      originalColumn: original != null && original.column,
      source,
      name
    });
  };
  SourceMapGenerator.prototype.setSourceContent = function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
    var source = aSourceFile;
    if (this._sourceRoot != null) {
      source = util.relative(this._sourceRoot, source);
    }
    if (aSourceContent != null) {
      if (!this._sourcesContents) {
        this._sourcesContents = Object.create(null);
      }
      this._sourcesContents[util.toSetString(source)] = aSourceContent;
    } else if (this._sourcesContents) {
      delete this._sourcesContents[util.toSetString(source)];
      if (Object.keys(this._sourcesContents).length === 0) {
        this._sourcesContents = null;
      }
    }
  };
  SourceMapGenerator.prototype.applySourceMap = function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
    var sourceFile = aSourceFile;
    if (aSourceFile == null) {
      if (aSourceMapConsumer.file == null) {
        throw new Error("SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, " + `or the source map's "file" property. Both were omitted.`);
      }
      sourceFile = aSourceMapConsumer.file;
    }
    var sourceRoot = this._sourceRoot;
    if (sourceRoot != null) {
      sourceFile = util.relative(sourceRoot, sourceFile);
    }
    var newSources = new ArraySet;
    var newNames = new ArraySet;
    this._mappings.unsortedForEach(function(mapping) {
      if (mapping.source === sourceFile && mapping.originalLine != null) {
        var original = aSourceMapConsumer.originalPositionFor({
          line: mapping.originalLine,
          column: mapping.originalColumn
        });
        if (original.source != null) {
          mapping.source = original.source;
          if (aSourceMapPath != null) {
            mapping.source = util.join(aSourceMapPath, mapping.source);
          }
          if (sourceRoot != null) {
            mapping.source = util.relative(sourceRoot, mapping.source);
          }
          mapping.originalLine = original.line;
          mapping.originalColumn = original.column;
          if (original.name != null) {
            mapping.name = original.name;
          }
        }
      }
      var source = mapping.source;
      if (source != null && !newSources.has(source)) {
        newSources.add(source);
      }
      var name = mapping.name;
      if (name != null && !newNames.has(name)) {
        newNames.add(name);
      }
    }, this);
    this._sources = newSources;
    this._names = newNames;
    aSourceMapConsumer.sources.forEach(function(sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aSourceMapPath != null) {
          sourceFile = util.join(aSourceMapPath, sourceFile);
        }
        if (sourceRoot != null) {
          sourceFile = util.relative(sourceRoot, sourceFile);
        }
        this.setSourceContent(sourceFile, content);
      }
    }, this);
  };
  SourceMapGenerator.prototype._validateMapping = function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource, aName) {
    if (aOriginal && typeof aOriginal.line !== "number" && typeof aOriginal.column !== "number") {
      throw new Error("original.line and original.column are not numbers -- you probably meant to omit " + "the original mapping entirely and only map the generated position. If so, pass " + "null for the original mapping instead of an object with empty or null values.");
    }
    if (aGenerated && "line" in aGenerated && "column" in aGenerated && aGenerated.line > 0 && aGenerated.column >= 0 && !aOriginal && !aSource && !aName) {
      return;
    } else if (aGenerated && "line" in aGenerated && "column" in aGenerated && aOriginal && "line" in aOriginal && "column" in aOriginal && aGenerated.line > 0 && aGenerated.column >= 0 && aOriginal.line > 0 && aOriginal.column >= 0 && aSource) {
      return;
    } else {
      throw new Error("Invalid mapping: " + JSON.stringify({
        generated: aGenerated,
        source: aSource,
        original: aOriginal,
        name: aName
      }));
    }
  };
  SourceMapGenerator.prototype._serializeMappings = function SourceMapGenerator_serializeMappings() {
    var previousGeneratedColumn = 0;
    var previousGeneratedLine = 1;
    var previousOriginalColumn = 0;
    var previousOriginalLine = 0;
    var previousName = 0;
    var previousSource = 0;
    var result = "";
    var next;
    var mapping;
    var nameIdx;
    var sourceIdx;
    var mappings = this._mappings.toArray();
    for (var i = 0, len = mappings.length;i < len; i++) {
      mapping = mappings[i];
      next = "";
      if (mapping.generatedLine !== previousGeneratedLine) {
        previousGeneratedColumn = 0;
        while (mapping.generatedLine !== previousGeneratedLine) {
          next += ";";
          previousGeneratedLine++;
        }
      } else {
        if (i > 0) {
          if (!util.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
            continue;
          }
          next += ",";
        }
      }
      next += base64VLQ.encode(mapping.generatedColumn - previousGeneratedColumn);
      previousGeneratedColumn = mapping.generatedColumn;
      if (mapping.source != null) {
        sourceIdx = this._sources.indexOf(mapping.source);
        next += base64VLQ.encode(sourceIdx - previousSource);
        previousSource = sourceIdx;
        next += base64VLQ.encode(mapping.originalLine - 1 - previousOriginalLine);
        previousOriginalLine = mapping.originalLine - 1;
        next += base64VLQ.encode(mapping.originalColumn - previousOriginalColumn);
        previousOriginalColumn = mapping.originalColumn;
        if (mapping.name != null) {
          nameIdx = this._names.indexOf(mapping.name);
          next += base64VLQ.encode(nameIdx - previousName);
          previousName = nameIdx;
        }
      }
      result += next;
    }
    return result;
  };
  SourceMapGenerator.prototype._generateSourcesContent = function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
    return aSources.map(function(source) {
      if (!this._sourcesContents) {
        return null;
      }
      if (aSourceRoot != null) {
        source = util.relative(aSourceRoot, source);
      }
      var key = util.toSetString(source);
      return Object.prototype.hasOwnProperty.call(this._sourcesContents, key) ? this._sourcesContents[key] : null;
    }, this);
  };
  SourceMapGenerator.prototype.toJSON = function SourceMapGenerator_toJSON() {
    var map = {
      version: this._version,
      sources: this._sources.toArray(),
      names: this._names.toArray(),
      mappings: this._serializeMappings()
    };
    if (this._file != null) {
      map.file = this._file;
    }
    if (this._sourceRoot != null) {
      map.sourceRoot = this._sourceRoot;
    }
    if (this._sourcesContents) {
      map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
    }
    return map;
  };
  SourceMapGenerator.prototype.toString = function SourceMapGenerator_toString() {
    return JSON.stringify(this.toJSON());
  };
  exports.SourceMapGenerator = SourceMapGenerator;
});

// node_modules/source-map/lib/binary-search.js
var require_binary_search = __commonJS(function(exports) {
  exports.GREATEST_LOWER_BOUND = 1;
  exports.LEAST_UPPER_BOUND = 2;
  function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
    var mid = Math.floor((aHigh - aLow) / 2) + aLow;
    var cmp = aCompare(aNeedle, aHaystack[mid], true);
    if (cmp === 0) {
      return mid;
    } else if (cmp > 0) {
      if (aHigh - mid > 1) {
        return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
      }
      if (aBias == exports.LEAST_UPPER_BOUND) {
        return aHigh < aHaystack.length ? aHigh : -1;
      } else {
        return mid;
      }
    } else {
      if (mid - aLow > 1) {
        return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
      }
      if (aBias == exports.LEAST_UPPER_BOUND) {
        return mid;
      } else {
        return aLow < 0 ? -1 : aLow;
      }
    }
  }
  exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
    if (aHaystack.length === 0) {
      return -1;
    }
    var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare, aBias || exports.GREATEST_LOWER_BOUND);
    if (index < 0) {
      return -1;
    }
    while (index - 1 >= 0) {
      if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
        break;
      }
      --index;
    }
    return index;
  };
});

// node_modules/source-map/lib/quick-sort.js
var require_quick_sort = __commonJS(function(exports) {
  function swap(ary, x, y) {
    var temp = ary[x];
    ary[x] = ary[y];
    ary[y] = temp;
  }
  function randomIntInRange(low, high) {
    return Math.round(low + Math.random() * (high - low));
  }
  function doQuickSort(ary, comparator, p, r) {
    if (p < r) {
      var pivotIndex = randomIntInRange(p, r);
      var i = p - 1;
      swap(ary, pivotIndex, r);
      var pivot = ary[r];
      for (var j = p;j < r; j++) {
        if (comparator(ary[j], pivot) <= 0) {
          i += 1;
          swap(ary, i, j);
        }
      }
      swap(ary, i + 1, j);
      var q = i + 1;
      doQuickSort(ary, comparator, p, q - 1);
      doQuickSort(ary, comparator, q + 1, r);
    }
  }
  exports.quickSort = function(ary, comparator) {
    doQuickSort(ary, comparator, 0, ary.length - 1);
  };
});

// node_modules/source-map/lib/source-map-consumer.js
var require_source_map_consumer = __commonJS(function(exports) {
  var util = require_util();
  var binarySearch = require_binary_search();
  var ArraySet = require_array_set().ArraySet;
  var base64VLQ = require_base64_vlq();
  var quickSort = require_quick_sort().quickSort;
  function SourceMapConsumer(aSourceMap, aSourceMapURL) {
    var sourceMap = aSourceMap;
    if (typeof aSourceMap === "string") {
      sourceMap = util.parseSourceMapInput(aSourceMap);
    }
    return sourceMap.sections != null ? new IndexedSourceMapConsumer(sourceMap, aSourceMapURL) : new BasicSourceMapConsumer(sourceMap, aSourceMapURL);
  }
  SourceMapConsumer.fromSourceMap = function(aSourceMap, aSourceMapURL) {
    return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
  };
  SourceMapConsumer.prototype._version = 3;
  SourceMapConsumer.prototype.__generatedMappings = null;
  Object.defineProperty(SourceMapConsumer.prototype, "_generatedMappings", {
    configurable: true,
    enumerable: true,
    get: function() {
      if (!this.__generatedMappings) {
        this._parseMappings(this._mappings, this.sourceRoot);
      }
      return this.__generatedMappings;
    }
  });
  SourceMapConsumer.prototype.__originalMappings = null;
  Object.defineProperty(SourceMapConsumer.prototype, "_originalMappings", {
    configurable: true,
    enumerable: true,
    get: function() {
      if (!this.__originalMappings) {
        this._parseMappings(this._mappings, this.sourceRoot);
      }
      return this.__originalMappings;
    }
  });
  SourceMapConsumer.prototype._charIsMappingSeparator = function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
    var c = aStr.charAt(index);
    return c === ";" || c === ",";
  };
  SourceMapConsumer.prototype._parseMappings = function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    throw new Error("Subclasses must implement _parseMappings");
  };
  SourceMapConsumer.GENERATED_ORDER = 1;
  SourceMapConsumer.ORIGINAL_ORDER = 2;
  SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
  SourceMapConsumer.LEAST_UPPER_BOUND = 2;
  SourceMapConsumer.prototype.eachMapping = function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
    var context = aContext || null;
    var order = aOrder || SourceMapConsumer.GENERATED_ORDER;
    var mappings;
    switch (order) {
      case SourceMapConsumer.GENERATED_ORDER:
        mappings = this._generatedMappings;
        break;
      case SourceMapConsumer.ORIGINAL_ORDER:
        mappings = this._originalMappings;
        break;
      default:
        throw new Error("Unknown order of iteration.");
    }
    var sourceRoot = this.sourceRoot;
    mappings.map(function(mapping) {
      var source = mapping.source === null ? null : this._sources.at(mapping.source);
      source = util.computeSourceURL(sourceRoot, source, this._sourceMapURL);
      return {
        source,
        generatedLine: mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: mapping.name === null ? null : this._names.at(mapping.name)
      };
    }, this).forEach(aCallback, context);
  };
  SourceMapConsumer.prototype.allGeneratedPositionsFor = function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
    var line = util.getArg(aArgs, "line");
    var needle = {
      source: util.getArg(aArgs, "source"),
      originalLine: line,
      originalColumn: util.getArg(aArgs, "column", 0)
    };
    needle.source = this._findSourceIndex(needle.source);
    if (needle.source < 0) {
      return [];
    }
    var mappings = [];
    var index = this._findMapping(needle, this._originalMappings, "originalLine", "originalColumn", util.compareByOriginalPositions, binarySearch.LEAST_UPPER_BOUND);
    if (index >= 0) {
      var mapping = this._originalMappings[index];
      if (aArgs.column === undefined) {
        var originalLine = mapping.originalLine;
        while (mapping && mapping.originalLine === originalLine) {
          mappings.push({
            line: util.getArg(mapping, "generatedLine", null),
            column: util.getArg(mapping, "generatedColumn", null),
            lastColumn: util.getArg(mapping, "lastGeneratedColumn", null)
          });
          mapping = this._originalMappings[++index];
        }
      } else {
        var originalColumn = mapping.originalColumn;
        while (mapping && mapping.originalLine === line && mapping.originalColumn == originalColumn) {
          mappings.push({
            line: util.getArg(mapping, "generatedLine", null),
            column: util.getArg(mapping, "generatedColumn", null),
            lastColumn: util.getArg(mapping, "lastGeneratedColumn", null)
          });
          mapping = this._originalMappings[++index];
        }
      }
    }
    return mappings;
  };
  exports.SourceMapConsumer = SourceMapConsumer;
  function BasicSourceMapConsumer(aSourceMap, aSourceMapURL) {
    var sourceMap = aSourceMap;
    if (typeof aSourceMap === "string") {
      sourceMap = util.parseSourceMapInput(aSourceMap);
    }
    var version = util.getArg(sourceMap, "version");
    var sources = util.getArg(sourceMap, "sources");
    var names = util.getArg(sourceMap, "names", []);
    var sourceRoot = util.getArg(sourceMap, "sourceRoot", null);
    var sourcesContent = util.getArg(sourceMap, "sourcesContent", null);
    var mappings = util.getArg(sourceMap, "mappings");
    var file = util.getArg(sourceMap, "file", null);
    if (version != this._version) {
      throw new Error("Unsupported version: " + version);
    }
    if (sourceRoot) {
      sourceRoot = util.normalize(sourceRoot);
    }
    sources = sources.map(String).map(util.normalize).map(function(source) {
      return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source) ? util.relative(sourceRoot, source) : source;
    });
    this._names = ArraySet.fromArray(names.map(String), true);
    this._sources = ArraySet.fromArray(sources, true);
    this._absoluteSources = this._sources.toArray().map(function(s) {
      return util.computeSourceURL(sourceRoot, s, aSourceMapURL);
    });
    this.sourceRoot = sourceRoot;
    this.sourcesContent = sourcesContent;
    this._mappings = mappings;
    this._sourceMapURL = aSourceMapURL;
    this.file = file;
  }
  BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
  BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;
  BasicSourceMapConsumer.prototype._findSourceIndex = function(aSource) {
    var relativeSource = aSource;
    if (this.sourceRoot != null) {
      relativeSource = util.relative(this.sourceRoot, relativeSource);
    }
    if (this._sources.has(relativeSource)) {
      return this._sources.indexOf(relativeSource);
    }
    var i;
    for (i = 0;i < this._absoluteSources.length; ++i) {
      if (this._absoluteSources[i] == aSource) {
        return i;
      }
    }
    return -1;
  };
  BasicSourceMapConsumer.fromSourceMap = function SourceMapConsumer_fromSourceMap(aSourceMap, aSourceMapURL) {
    var smc = Object.create(BasicSourceMapConsumer.prototype);
    var names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
    var sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
    smc.sourceRoot = aSourceMap._sourceRoot;
    smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(), smc.sourceRoot);
    smc.file = aSourceMap._file;
    smc._sourceMapURL = aSourceMapURL;
    smc._absoluteSources = smc._sources.toArray().map(function(s) {
      return util.computeSourceURL(smc.sourceRoot, s, aSourceMapURL);
    });
    var generatedMappings = aSourceMap._mappings.toArray().slice();
    var destGeneratedMappings = smc.__generatedMappings = [];
    var destOriginalMappings = smc.__originalMappings = [];
    for (var i = 0, length = generatedMappings.length;i < length; i++) {
      var srcMapping = generatedMappings[i];
      var destMapping = new Mapping;
      destMapping.generatedLine = srcMapping.generatedLine;
      destMapping.generatedColumn = srcMapping.generatedColumn;
      if (srcMapping.source) {
        destMapping.source = sources.indexOf(srcMapping.source);
        destMapping.originalLine = srcMapping.originalLine;
        destMapping.originalColumn = srcMapping.originalColumn;
        if (srcMapping.name) {
          destMapping.name = names.indexOf(srcMapping.name);
        }
        destOriginalMappings.push(destMapping);
      }
      destGeneratedMappings.push(destMapping);
    }
    quickSort(smc.__originalMappings, util.compareByOriginalPositions);
    return smc;
  };
  BasicSourceMapConsumer.prototype._version = 3;
  Object.defineProperty(BasicSourceMapConsumer.prototype, "sources", {
    get: function() {
      return this._absoluteSources.slice();
    }
  });
  function Mapping() {
    this.generatedLine = 0;
    this.generatedColumn = 0;
    this.source = null;
    this.originalLine = null;
    this.originalColumn = null;
    this.name = null;
  }
  BasicSourceMapConsumer.prototype._parseMappings = function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    var generatedLine = 1;
    var previousGeneratedColumn = 0;
    var previousOriginalLine = 0;
    var previousOriginalColumn = 0;
    var previousSource = 0;
    var previousName = 0;
    var length = aStr.length;
    var index = 0;
    var cachedSegments = {};
    var temp = {};
    var originalMappings = [];
    var generatedMappings = [];
    var mapping, str, segment, end, value;
    while (index < length) {
      if (aStr.charAt(index) === ";") {
        generatedLine++;
        index++;
        previousGeneratedColumn = 0;
      } else if (aStr.charAt(index) === ",") {
        index++;
      } else {
        mapping = new Mapping;
        mapping.generatedLine = generatedLine;
        for (end = index;end < length; end++) {
          if (this._charIsMappingSeparator(aStr, end)) {
            break;
          }
        }
        str = aStr.slice(index, end);
        segment = cachedSegments[str];
        if (segment) {
          index += str.length;
        } else {
          segment = [];
          while (index < end) {
            base64VLQ.decode(aStr, index, temp);
            value = temp.value;
            index = temp.rest;
            segment.push(value);
          }
          if (segment.length === 2) {
            throw new Error("Found a source, but no line and column");
          }
          if (segment.length === 3) {
            throw new Error("Found a source and line, but no column");
          }
          cachedSegments[str] = segment;
        }
        mapping.generatedColumn = previousGeneratedColumn + segment[0];
        previousGeneratedColumn = mapping.generatedColumn;
        if (segment.length > 1) {
          mapping.source = previousSource + segment[1];
          previousSource += segment[1];
          mapping.originalLine = previousOriginalLine + segment[2];
          previousOriginalLine = mapping.originalLine;
          mapping.originalLine += 1;
          mapping.originalColumn = previousOriginalColumn + segment[3];
          previousOriginalColumn = mapping.originalColumn;
          if (segment.length > 4) {
            mapping.name = previousName + segment[4];
            previousName += segment[4];
          }
        }
        generatedMappings.push(mapping);
        if (typeof mapping.originalLine === "number") {
          originalMappings.push(mapping);
        }
      }
    }
    quickSort(generatedMappings, util.compareByGeneratedPositionsDeflated);
    this.__generatedMappings = generatedMappings;
    quickSort(originalMappings, util.compareByOriginalPositions);
    this.__originalMappings = originalMappings;
  };
  BasicSourceMapConsumer.prototype._findMapping = function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName, aColumnName, aComparator, aBias) {
    if (aNeedle[aLineName] <= 0) {
      throw new TypeError("Line must be greater than or equal to 1, got " + aNeedle[aLineName]);
    }
    if (aNeedle[aColumnName] < 0) {
      throw new TypeError("Column must be greater than or equal to 0, got " + aNeedle[aColumnName]);
    }
    return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
  };
  BasicSourceMapConsumer.prototype.computeColumnSpans = function SourceMapConsumer_computeColumnSpans() {
    for (var index = 0;index < this._generatedMappings.length; ++index) {
      var mapping = this._generatedMappings[index];
      if (index + 1 < this._generatedMappings.length) {
        var nextMapping = this._generatedMappings[index + 1];
        if (mapping.generatedLine === nextMapping.generatedLine) {
          mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
          continue;
        }
      }
      mapping.lastGeneratedColumn = Infinity;
    }
  };
  BasicSourceMapConsumer.prototype.originalPositionFor = function SourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, "line"),
      generatedColumn: util.getArg(aArgs, "column")
    };
    var index = this._findMapping(needle, this._generatedMappings, "generatedLine", "generatedColumn", util.compareByGeneratedPositionsDeflated, util.getArg(aArgs, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND));
    if (index >= 0) {
      var mapping = this._generatedMappings[index];
      if (mapping.generatedLine === needle.generatedLine) {
        var source = util.getArg(mapping, "source", null);
        if (source !== null) {
          source = this._sources.at(source);
          source = util.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
        }
        var name = util.getArg(mapping, "name", null);
        if (name !== null) {
          name = this._names.at(name);
        }
        return {
          source,
          line: util.getArg(mapping, "originalLine", null),
          column: util.getArg(mapping, "originalColumn", null),
          name
        };
      }
    }
    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  };
  BasicSourceMapConsumer.prototype.hasContentsOfAllSources = function BasicSourceMapConsumer_hasContentsOfAllSources() {
    if (!this.sourcesContent) {
      return false;
    }
    return this.sourcesContent.length >= this._sources.size() && !this.sourcesContent.some(function(sc) {
      return sc == null;
    });
  };
  BasicSourceMapConsumer.prototype.sourceContentFor = function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    if (!this.sourcesContent) {
      return null;
    }
    var index = this._findSourceIndex(aSource);
    if (index >= 0) {
      return this.sourcesContent[index];
    }
    var relativeSource = aSource;
    if (this.sourceRoot != null) {
      relativeSource = util.relative(this.sourceRoot, relativeSource);
    }
    var url;
    if (this.sourceRoot != null && (url = util.urlParse(this.sourceRoot))) {
      var fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
      if (url.scheme == "file" && this._sources.has(fileUriAbsPath)) {
        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)];
      }
      if ((!url.path || url.path == "/") && this._sources.has("/" + relativeSource)) {
        return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
      }
    }
    if (nullOnMissing) {
      return null;
    } else {
      throw new Error('"' + relativeSource + '" is not in the SourceMap.');
    }
  };
  BasicSourceMapConsumer.prototype.generatedPositionFor = function SourceMapConsumer_generatedPositionFor(aArgs) {
    var source = util.getArg(aArgs, "source");
    source = this._findSourceIndex(source);
    if (source < 0) {
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    }
    var needle = {
      source,
      originalLine: util.getArg(aArgs, "line"),
      originalColumn: util.getArg(aArgs, "column")
    };
    var index = this._findMapping(needle, this._originalMappings, "originalLine", "originalColumn", util.compareByOriginalPositions, util.getArg(aArgs, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND));
    if (index >= 0) {
      var mapping = this._originalMappings[index];
      if (mapping.source === needle.source) {
        return {
          line: util.getArg(mapping, "generatedLine", null),
          column: util.getArg(mapping, "generatedColumn", null),
          lastColumn: util.getArg(mapping, "lastGeneratedColumn", null)
        };
      }
    }
    return {
      line: null,
      column: null,
      lastColumn: null
    };
  };
  exports.BasicSourceMapConsumer = BasicSourceMapConsumer;
  function IndexedSourceMapConsumer(aSourceMap, aSourceMapURL) {
    var sourceMap = aSourceMap;
    if (typeof aSourceMap === "string") {
      sourceMap = util.parseSourceMapInput(aSourceMap);
    }
    var version = util.getArg(sourceMap, "version");
    var sections = util.getArg(sourceMap, "sections");
    if (version != this._version) {
      throw new Error("Unsupported version: " + version);
    }
    this._sources = new ArraySet;
    this._names = new ArraySet;
    var lastOffset = {
      line: -1,
      column: 0
    };
    this._sections = sections.map(function(s) {
      if (s.url) {
        throw new Error("Support for url field in sections not implemented.");
      }
      var offset = util.getArg(s, "offset");
      var offsetLine = util.getArg(offset, "line");
      var offsetColumn = util.getArg(offset, "column");
      if (offsetLine < lastOffset.line || offsetLine === lastOffset.line && offsetColumn < lastOffset.column) {
        throw new Error("Section offsets must be ordered and non-overlapping.");
      }
      lastOffset = offset;
      return {
        generatedOffset: {
          generatedLine: offsetLine + 1,
          generatedColumn: offsetColumn + 1
        },
        consumer: new SourceMapConsumer(util.getArg(s, "map"), aSourceMapURL)
      };
    });
  }
  IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
  IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;
  IndexedSourceMapConsumer.prototype._version = 3;
  Object.defineProperty(IndexedSourceMapConsumer.prototype, "sources", {
    get: function() {
      var sources = [];
      for (var i = 0;i < this._sections.length; i++) {
        for (var j = 0;j < this._sections[i].consumer.sources.length; j++) {
          sources.push(this._sections[i].consumer.sources[j]);
        }
      }
      return sources;
    }
  });
  IndexedSourceMapConsumer.prototype.originalPositionFor = function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, "line"),
      generatedColumn: util.getArg(aArgs, "column")
    };
    var sectionIndex = binarySearch.search(needle, this._sections, function(needle, section) {
      var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
      if (cmp) {
        return cmp;
      }
      return needle.generatedColumn - section.generatedOffset.generatedColumn;
    });
    var section = this._sections[sectionIndex];
    if (!section) {
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    }
    return section.consumer.originalPositionFor({
      line: needle.generatedLine - (section.generatedOffset.generatedLine - 1),
      column: needle.generatedColumn - (section.generatedOffset.generatedLine === needle.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
      bias: aArgs.bias
    });
  };
  IndexedSourceMapConsumer.prototype.hasContentsOfAllSources = function IndexedSourceMapConsumer_hasContentsOfAllSources() {
    return this._sections.every(function(s) {
      return s.consumer.hasContentsOfAllSources();
    });
  };
  IndexedSourceMapConsumer.prototype.sourceContentFor = function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    for (var i = 0;i < this._sections.length; i++) {
      var section = this._sections[i];
      var content = section.consumer.sourceContentFor(aSource, true);
      if (content) {
        return content;
      }
    }
    if (nullOnMissing) {
      return null;
    } else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };
  IndexedSourceMapConsumer.prototype.generatedPositionFor = function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
    for (var i = 0;i < this._sections.length; i++) {
      var section = this._sections[i];
      if (section.consumer._findSourceIndex(util.getArg(aArgs, "source")) === -1) {
        continue;
      }
      var generatedPosition = section.consumer.generatedPositionFor(aArgs);
      if (generatedPosition) {
        var ret = {
          line: generatedPosition.line + (section.generatedOffset.generatedLine - 1),
          column: generatedPosition.column + (section.generatedOffset.generatedLine === generatedPosition.line ? section.generatedOffset.generatedColumn - 1 : 0)
        };
        return ret;
      }
    }
    return {
      line: null,
      column: null
    };
  };
  IndexedSourceMapConsumer.prototype._parseMappings = function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    this.__generatedMappings = [];
    this.__originalMappings = [];
    for (var i = 0;i < this._sections.length; i++) {
      var section = this._sections[i];
      var sectionMappings = section.consumer._generatedMappings;
      for (var j = 0;j < sectionMappings.length; j++) {
        var mapping = sectionMappings[j];
        var source = section.consumer._sources.at(mapping.source);
        source = util.computeSourceURL(section.consumer.sourceRoot, source, this._sourceMapURL);
        this._sources.add(source);
        source = this._sources.indexOf(source);
        var name = null;
        if (mapping.name) {
          name = section.consumer._names.at(mapping.name);
          this._names.add(name);
          name = this._names.indexOf(name);
        }
        var adjustedMapping = {
          source,
          generatedLine: mapping.generatedLine + (section.generatedOffset.generatedLine - 1),
          generatedColumn: mapping.generatedColumn + (section.generatedOffset.generatedLine === mapping.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name
        };
        this.__generatedMappings.push(adjustedMapping);
        if (typeof adjustedMapping.originalLine === "number") {
          this.__originalMappings.push(adjustedMapping);
        }
      }
    }
    quickSort(this.__generatedMappings, util.compareByGeneratedPositionsDeflated);
    quickSort(this.__originalMappings, util.compareByOriginalPositions);
  };
  exports.IndexedSourceMapConsumer = IndexedSourceMapConsumer;
});

// node_modules/source-map/lib/source-node.js
var require_source_node = __commonJS(function(exports) {
  var SourceMapGenerator = require_source_map_generator().SourceMapGenerator;
  var util = require_util();
  var REGEX_NEWLINE = /(\r?\n)/;
  var NEWLINE_CODE = 10;
  var isSourceNode = "$$$isSourceNode$$$";
  function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
    this.children = [];
    this.sourceContents = {};
    this.line = aLine == null ? null : aLine;
    this.column = aColumn == null ? null : aColumn;
    this.source = aSource == null ? null : aSource;
    this.name = aName == null ? null : aName;
    this[isSourceNode] = true;
    if (aChunks != null)
      this.add(aChunks);
  }
  SourceNode.fromStringWithSourceMap = function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
    var node = new SourceNode;
    var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
    var remainingLinesIndex = 0;
    var shiftNextLine = function() {
      var lineContents = getNextLine();
      var newLine = getNextLine() || "";
      return lineContents + newLine;
      function getNextLine() {
        return remainingLinesIndex < remainingLines.length ? remainingLines[remainingLinesIndex++] : undefined;
      }
    };
    var lastGeneratedLine = 1, lastGeneratedColumn = 0;
    var lastMapping = null;
    aSourceMapConsumer.eachMapping(function(mapping) {
      if (lastMapping !== null) {
        if (lastGeneratedLine < mapping.generatedLine) {
          addMappingWithCode(lastMapping, shiftNextLine());
          lastGeneratedLine++;
          lastGeneratedColumn = 0;
        } else {
          var nextLine = remainingLines[remainingLinesIndex] || "";
          var code = nextLine.substr(0, mapping.generatedColumn - lastGeneratedColumn);
          remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn - lastGeneratedColumn);
          lastGeneratedColumn = mapping.generatedColumn;
          addMappingWithCode(lastMapping, code);
          lastMapping = mapping;
          return;
        }
      }
      while (lastGeneratedLine < mapping.generatedLine) {
        node.add(shiftNextLine());
        lastGeneratedLine++;
      }
      if (lastGeneratedColumn < mapping.generatedColumn) {
        var nextLine = remainingLines[remainingLinesIndex] || "";
        node.add(nextLine.substr(0, mapping.generatedColumn));
        remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn);
        lastGeneratedColumn = mapping.generatedColumn;
      }
      lastMapping = mapping;
    }, this);
    if (remainingLinesIndex < remainingLines.length) {
      if (lastMapping) {
        addMappingWithCode(lastMapping, shiftNextLine());
      }
      node.add(remainingLines.splice(remainingLinesIndex).join(""));
    }
    aSourceMapConsumer.sources.forEach(function(sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aRelativePath != null) {
          sourceFile = util.join(aRelativePath, sourceFile);
        }
        node.setSourceContent(sourceFile, content);
      }
    });
    return node;
    function addMappingWithCode(mapping, code) {
      if (mapping === null || mapping.source === undefined) {
        node.add(code);
      } else {
        var source = aRelativePath ? util.join(aRelativePath, mapping.source) : mapping.source;
        node.add(new SourceNode(mapping.originalLine, mapping.originalColumn, source, code, mapping.name));
      }
    }
  };
  SourceNode.prototype.add = function SourceNode_add(aChunk) {
    if (Array.isArray(aChunk)) {
      aChunk.forEach(function(chunk) {
        this.add(chunk);
      }, this);
    } else if (aChunk[isSourceNode] || typeof aChunk === "string") {
      if (aChunk) {
        this.children.push(aChunk);
      }
    } else {
      throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk);
    }
    return this;
  };
  SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
    if (Array.isArray(aChunk)) {
      for (var i = aChunk.length - 1;i >= 0; i--) {
        this.prepend(aChunk[i]);
      }
    } else if (aChunk[isSourceNode] || typeof aChunk === "string") {
      this.children.unshift(aChunk);
    } else {
      throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk);
    }
    return this;
  };
  SourceNode.prototype.walk = function SourceNode_walk(aFn) {
    var chunk;
    for (var i = 0, len = this.children.length;i < len; i++) {
      chunk = this.children[i];
      if (chunk[isSourceNode]) {
        chunk.walk(aFn);
      } else {
        if (chunk !== "") {
          aFn(chunk, {
            source: this.source,
            line: this.line,
            column: this.column,
            name: this.name
          });
        }
      }
    }
  };
  SourceNode.prototype.join = function SourceNode_join(aSep) {
    var newChildren;
    var i;
    var len = this.children.length;
    if (len > 0) {
      newChildren = [];
      for (i = 0;i < len - 1; i++) {
        newChildren.push(this.children[i]);
        newChildren.push(aSep);
      }
      newChildren.push(this.children[i]);
      this.children = newChildren;
    }
    return this;
  };
  SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
    var lastChild = this.children[this.children.length - 1];
    if (lastChild[isSourceNode]) {
      lastChild.replaceRight(aPattern, aReplacement);
    } else if (typeof lastChild === "string") {
      this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
    } else {
      this.children.push("".replace(aPattern, aReplacement));
    }
    return this;
  };
  SourceNode.prototype.setSourceContent = function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
    this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
  };
  SourceNode.prototype.walkSourceContents = function SourceNode_walkSourceContents(aFn) {
    for (var i = 0, len = this.children.length;i < len; i++) {
      if (this.children[i][isSourceNode]) {
        this.children[i].walkSourceContents(aFn);
      }
    }
    var sources = Object.keys(this.sourceContents);
    for (var i = 0, len = sources.length;i < len; i++) {
      aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
    }
  };
  SourceNode.prototype.toString = function SourceNode_toString() {
    var str = "";
    this.walk(function(chunk) {
      str += chunk;
    });
    return str;
  };
  SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
    var generated = {
      code: "",
      line: 1,
      column: 0
    };
    var map = new SourceMapGenerator(aArgs);
    var sourceMappingActive = false;
    var lastOriginalSource = null;
    var lastOriginalLine = null;
    var lastOriginalColumn = null;
    var lastOriginalName = null;
    this.walk(function(chunk, original) {
      generated.code += chunk;
      if (original.source !== null && original.line !== null && original.column !== null) {
        if (lastOriginalSource !== original.source || lastOriginalLine !== original.line || lastOriginalColumn !== original.column || lastOriginalName !== original.name) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
        lastOriginalSource = original.source;
        lastOriginalLine = original.line;
        lastOriginalColumn = original.column;
        lastOriginalName = original.name;
        sourceMappingActive = true;
      } else if (sourceMappingActive) {
        map.addMapping({
          generated: {
            line: generated.line,
            column: generated.column
          }
        });
        lastOriginalSource = null;
        sourceMappingActive = false;
      }
      for (var idx = 0, length = chunk.length;idx < length; idx++) {
        if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
          generated.line++;
          generated.column = 0;
          if (idx + 1 === length) {
            lastOriginalSource = null;
            sourceMappingActive = false;
          } else if (sourceMappingActive) {
            map.addMapping({
              source: original.source,
              original: {
                line: original.line,
                column: original.column
              },
              generated: {
                line: generated.line,
                column: generated.column
              },
              name: original.name
            });
          }
        } else {
          generated.column++;
        }
      }
    });
    this.walkSourceContents(function(sourceFile, sourceContent) {
      map.setSourceContent(sourceFile, sourceContent);
    });
    return { code: generated.code, map };
  };
  exports.SourceNode = SourceNode;
});

// node_modules/source-map/source-map.js
var require_source_map = __commonJS(function(exports) {
  exports.SourceMapGenerator = require_source_map_generator().SourceMapGenerator;
  exports.SourceMapConsumer = require_source_map_consumer().SourceMapConsumer;
  exports.SourceNode = require_source_node().SourceNode;
});

// node_modules/escodegen/package.json
var require_package = __commonJS(function(exports, module) {
  module.exports = {
    name: "escodegen",
    description: "ECMAScript code generator",
    homepage: "http://github.com/estools/escodegen",
    main: "escodegen.js",
    bin: {
      esgenerate: "./bin/esgenerate.js",
      escodegen: "./bin/escodegen.js"
    },
    files: [
      "LICENSE.BSD",
      "README.md",
      "bin",
      "escodegen.js",
      "package.json"
    ],
    version: "2.1.0",
    engines: {
      node: ">=6.0"
    },
    maintainers: [
      {
        name: "Yusuke Suzuki",
        email: "utatane.tea@gmail.com",
        web: "http://github.com/Constellation"
      }
    ],
    repository: {
      type: "git",
      url: "http://github.com/estools/escodegen.git"
    },
    dependencies: {
      estraverse: "^5.2.0",
      esutils: "^2.0.2",
      esprima: "^4.0.1"
    },
    optionalDependencies: {
      "source-map": "~0.6.1"
    },
    devDependencies: {
      acorn: "^8.0.4",
      bluebird: "^3.4.7",
      "bower-registry-client": "^1.0.0",
      chai: "^4.2.0",
      "chai-exclude": "^2.0.2",
      "commonjs-everywhere": "^0.9.7",
      gulp: "^4.0.2",
      "gulp-eslint": "^6.0.0",
      "gulp-mocha": "^7.0.2",
      minimist: "^1.2.5",
      optionator: "^0.9.1",
      semver: "^7.3.4"
    },
    license: "BSD-2-Clause",
    scripts: {
      test: "gulp travis",
      "unit-test": "gulp test",
      lint: "gulp lint",
      release: "node tools/release.js",
      "build-min": "./node_modules/.bin/cjsify -ma path: tools/entry-point.js > escodegen.browser.min.js",
      build: "./node_modules/.bin/cjsify -a path: tools/entry-point.js > escodegen.browser.js"
    }
  };
});

// node_modules/escodegen/escodegen.js
var require_escodegen = __commonJS(function(exports) {
  (function() {
    var Syntax, Precedence, BinaryPrecedence, SourceNode, estraverse, esutils, base, indent, json, renumber, hexadecimal, quotes, escapeless, newline, space, parentheses, semicolons, safeConcatenation, directive, extra, parse, sourceMap, sourceCode, preserveBlankLines, FORMAT_MINIFY, FORMAT_DEFAULTS;
    estraverse = require_estraverse();
    esutils = require_utils();
    Syntax = estraverse.Syntax;
    function isExpression(node) {
      return CodeGenerator.Expression.hasOwnProperty(node.type);
    }
    function isStatement(node) {
      return CodeGenerator.Statement.hasOwnProperty(node.type);
    }
    Precedence = {
      Sequence: 0,
      Yield: 1,
      Assignment: 1,
      Conditional: 2,
      ArrowFunction: 2,
      Coalesce: 3,
      LogicalOR: 4,
      LogicalAND: 5,
      BitwiseOR: 6,
      BitwiseXOR: 7,
      BitwiseAND: 8,
      Equality: 9,
      Relational: 10,
      BitwiseSHIFT: 11,
      Additive: 12,
      Multiplicative: 13,
      Exponentiation: 14,
      Await: 15,
      Unary: 15,
      Postfix: 16,
      OptionalChaining: 17,
      Call: 18,
      New: 19,
      TaggedTemplate: 20,
      Member: 21,
      Primary: 22
    };
    BinaryPrecedence = {
      "??": Precedence.Coalesce,
      "||": Precedence.LogicalOR,
      "&&": Precedence.LogicalAND,
      "|": Precedence.BitwiseOR,
      "^": Precedence.BitwiseXOR,
      "&": Precedence.BitwiseAND,
      "==": Precedence.Equality,
      "!=": Precedence.Equality,
      "===": Precedence.Equality,
      "!==": Precedence.Equality,
      is: Precedence.Equality,
      isnt: Precedence.Equality,
      "<": Precedence.Relational,
      ">": Precedence.Relational,
      "<=": Precedence.Relational,
      ">=": Precedence.Relational,
      in: Precedence.Relational,
      instanceof: Precedence.Relational,
      "<<": Precedence.BitwiseSHIFT,
      ">>": Precedence.BitwiseSHIFT,
      ">>>": Precedence.BitwiseSHIFT,
      "+": Precedence.Additive,
      "-": Precedence.Additive,
      "*": Precedence.Multiplicative,
      "%": Precedence.Multiplicative,
      "/": Precedence.Multiplicative,
      "**": Precedence.Exponentiation
    };
    var F_ALLOW_IN = 1, F_ALLOW_CALL = 1 << 1, F_ALLOW_UNPARATH_NEW = 1 << 2, F_FUNC_BODY = 1 << 3, F_DIRECTIVE_CTX = 1 << 4, F_SEMICOLON_OPT = 1 << 5, F_FOUND_COALESCE = 1 << 6;
    var E_FTT = F_ALLOW_CALL | F_ALLOW_UNPARATH_NEW, E_TTF = F_ALLOW_IN | F_ALLOW_CALL, E_TTT = F_ALLOW_IN | F_ALLOW_CALL | F_ALLOW_UNPARATH_NEW, E_TFF = F_ALLOW_IN, E_FFT = F_ALLOW_UNPARATH_NEW, E_TFT = F_ALLOW_IN | F_ALLOW_UNPARATH_NEW;
    var S_TFFF = F_ALLOW_IN, S_TFFT = F_ALLOW_IN | F_SEMICOLON_OPT, S_FFFF = 0, S_TFTF = F_ALLOW_IN | F_DIRECTIVE_CTX, S_TTFF = F_ALLOW_IN | F_FUNC_BODY;
    function getDefaultOptions() {
      return {
        indent: null,
        base: null,
        parse: null,
        comment: false,
        format: {
          indent: {
            style: "    ",
            base: 0,
            adjustMultilineComment: false
          },
          newline: `
`,
          space: " ",
          json: false,
          renumber: false,
          hexadecimal: false,
          quotes: "single",
          escapeless: false,
          compact: false,
          parentheses: true,
          semicolons: true,
          safeConcatenation: false,
          preserveBlankLines: false
        },
        moz: {
          comprehensionExpressionStartsWithAssignment: false,
          starlessGenerator: false
        },
        sourceMap: null,
        sourceMapRoot: null,
        sourceMapWithCode: false,
        directive: false,
        raw: true,
        verbatim: null,
        sourceCode: null
      };
    }
    function stringRepeat(str, num) {
      var result = "";
      for (num |= 0;num > 0; num >>>= 1, str += str) {
        if (num & 1) {
          result += str;
        }
      }
      return result;
    }
    function hasLineTerminator(str) {
      return /[\r\n]/g.test(str);
    }
    function endsWithLineTerminator(str) {
      var len = str.length;
      return len && esutils.code.isLineTerminator(str.charCodeAt(len - 1));
    }
    function merge(target, override) {
      var key;
      for (key in override) {
        if (override.hasOwnProperty(key)) {
          target[key] = override[key];
        }
      }
      return target;
    }
    function updateDeeply(target, override) {
      var key, val;
      function isHashObject(target) {
        return typeof target === "object" && target instanceof Object && !(target instanceof RegExp);
      }
      for (key in override) {
        if (override.hasOwnProperty(key)) {
          val = override[key];
          if (isHashObject(val)) {
            if (isHashObject(target[key])) {
              updateDeeply(target[key], val);
            } else {
              target[key] = updateDeeply({}, val);
            }
          } else {
            target[key] = val;
          }
        }
      }
      return target;
    }
    function generateNumber(value) {
      var result, point, temp, exponent, pos;
      if (value !== value) {
        throw new Error("Numeric literal whose value is NaN");
      }
      if (value < 0 || value === 0 && 1 / value < 0) {
        throw new Error("Numeric literal whose value is negative");
      }
      if (value === 1 / 0) {
        return json ? "null" : renumber ? "1e400" : "1e+400";
      }
      result = "" + value;
      if (!renumber || result.length < 3) {
        return result;
      }
      point = result.indexOf(".");
      if (!json && result.charCodeAt(0) === 48 && point === 1) {
        point = 0;
        result = result.slice(1);
      }
      temp = result;
      result = result.replace("e+", "e");
      exponent = 0;
      if ((pos = temp.indexOf("e")) > 0) {
        exponent = +temp.slice(pos + 1);
        temp = temp.slice(0, pos);
      }
      if (point >= 0) {
        exponent -= temp.length - point - 1;
        temp = +(temp.slice(0, point) + temp.slice(point + 1)) + "";
      }
      pos = 0;
      while (temp.charCodeAt(temp.length + pos - 1) === 48) {
        --pos;
      }
      if (pos !== 0) {
        exponent -= pos;
        temp = temp.slice(0, pos);
      }
      if (exponent !== 0) {
        temp += "e" + exponent;
      }
      if ((temp.length < result.length || hexadecimal && value > 1000000000000 && Math.floor(value) === value && (temp = "0x" + value.toString(16)).length < result.length) && +temp === value) {
        result = temp;
      }
      return result;
    }
    function escapeRegExpCharacter(ch, previousIsBackslash) {
      if ((ch & ~1) === 8232) {
        return (previousIsBackslash ? "u" : "\\u") + (ch === 8232 ? "2028" : "2029");
      } else if (ch === 10 || ch === 13) {
        return (previousIsBackslash ? "" : "\\") + (ch === 10 ? "n" : "r");
      }
      return String.fromCharCode(ch);
    }
    function generateRegExp(reg) {
      var match, result, flags, i, iz, ch, characterInBrack, previousIsBackslash;
      result = reg.toString();
      if (reg.source) {
        match = result.match(/\/([^/]*)$/);
        if (!match) {
          return result;
        }
        flags = match[1];
        result = "";
        characterInBrack = false;
        previousIsBackslash = false;
        for (i = 0, iz = reg.source.length;i < iz; ++i) {
          ch = reg.source.charCodeAt(i);
          if (!previousIsBackslash) {
            if (characterInBrack) {
              if (ch === 93) {
                characterInBrack = false;
              }
            } else {
              if (ch === 47) {
                result += "\\";
              } else if (ch === 91) {
                characterInBrack = true;
              }
            }
            result += escapeRegExpCharacter(ch, previousIsBackslash);
            previousIsBackslash = ch === 92;
          } else {
            result += escapeRegExpCharacter(ch, previousIsBackslash);
            previousIsBackslash = false;
          }
        }
        return "/" + result + "/" + flags;
      }
      return result;
    }
    function escapeAllowedCharacter(code, next) {
      var hex;
      if (code === 8) {
        return "\\b";
      }
      if (code === 12) {
        return "\\f";
      }
      if (code === 9) {
        return "\\t";
      }
      hex = code.toString(16).toUpperCase();
      if (json || code > 255) {
        return "\\u" + "0000".slice(hex.length) + hex;
      } else if (code === 0 && !esutils.code.isDecimalDigit(next)) {
        return "\\0";
      } else if (code === 11) {
        return "\\x0B";
      } else {
        return "\\x" + "00".slice(hex.length) + hex;
      }
    }
    function escapeDisallowedCharacter(code) {
      if (code === 92) {
        return "\\\\";
      }
      if (code === 10) {
        return "\\n";
      }
      if (code === 13) {
        return "\\r";
      }
      if (code === 8232) {
        return "\\u2028";
      }
      if (code === 8233) {
        return "\\u2029";
      }
      throw new Error("Incorrectly classified character");
    }
    function escapeDirective(str) {
      var i, iz, code, quote;
      quote = quotes === "double" ? '"' : "'";
      for (i = 0, iz = str.length;i < iz; ++i) {
        code = str.charCodeAt(i);
        if (code === 39) {
          quote = '"';
          break;
        } else if (code === 34) {
          quote = "'";
          break;
        } else if (code === 92) {
          ++i;
        }
      }
      return quote + str + quote;
    }
    function escapeString(str) {
      var result = "", i, len, code, singleQuotes = 0, doubleQuotes = 0, single, quote;
      for (i = 0, len = str.length;i < len; ++i) {
        code = str.charCodeAt(i);
        if (code === 39) {
          ++singleQuotes;
        } else if (code === 34) {
          ++doubleQuotes;
        } else if (code === 47 && json) {
          result += "\\";
        } else if (esutils.code.isLineTerminator(code) || code === 92) {
          result += escapeDisallowedCharacter(code);
          continue;
        } else if (!esutils.code.isIdentifierPartES5(code) && (json && code < 32 || !json && !escapeless && (code < 32 || code > 126))) {
          result += escapeAllowedCharacter(code, str.charCodeAt(i + 1));
          continue;
        }
        result += String.fromCharCode(code);
      }
      single = !(quotes === "double" || quotes === "auto" && doubleQuotes < singleQuotes);
      quote = single ? "'" : '"';
      if (!(single ? singleQuotes : doubleQuotes)) {
        return quote + result + quote;
      }
      str = result;
      result = quote;
      for (i = 0, len = str.length;i < len; ++i) {
        code = str.charCodeAt(i);
        if (code === 39 && single || code === 34 && !single) {
          result += "\\";
        }
        result += String.fromCharCode(code);
      }
      return result + quote;
    }
    function flattenToString(arr) {
      var i, iz, elem, result = "";
      for (i = 0, iz = arr.length;i < iz; ++i) {
        elem = arr[i];
        result += Array.isArray(elem) ? flattenToString(elem) : elem;
      }
      return result;
    }
    function toSourceNodeWhenNeeded(generated, node) {
      if (!sourceMap) {
        if (Array.isArray(generated)) {
          return flattenToString(generated);
        } else {
          return generated;
        }
      }
      if (node == null) {
        if (generated instanceof SourceNode) {
          return generated;
        } else {
          node = {};
        }
      }
      if (node.loc == null) {
        return new SourceNode(null, null, sourceMap, generated, node.name || null);
      }
      return new SourceNode(node.loc.start.line, node.loc.start.column, sourceMap === true ? node.loc.source || null : sourceMap, generated, node.name || null);
    }
    function noEmptySpace() {
      return space ? space : " ";
    }
    function join(left, right) {
      var leftSource, rightSource, leftCharCode, rightCharCode;
      leftSource = toSourceNodeWhenNeeded(left).toString();
      if (leftSource.length === 0) {
        return [right];
      }
      rightSource = toSourceNodeWhenNeeded(right).toString();
      if (rightSource.length === 0) {
        return [left];
      }
      leftCharCode = leftSource.charCodeAt(leftSource.length - 1);
      rightCharCode = rightSource.charCodeAt(0);
      if ((leftCharCode === 43 || leftCharCode === 45) && leftCharCode === rightCharCode || esutils.code.isIdentifierPartES5(leftCharCode) && esutils.code.isIdentifierPartES5(rightCharCode) || leftCharCode === 47 && rightCharCode === 105) {
        return [left, noEmptySpace(), right];
      } else if (esutils.code.isWhiteSpace(leftCharCode) || esutils.code.isLineTerminator(leftCharCode) || esutils.code.isWhiteSpace(rightCharCode) || esutils.code.isLineTerminator(rightCharCode)) {
        return [left, right];
      }
      return [left, space, right];
    }
    function addIndent(stmt) {
      return [base, stmt];
    }
    function withIndent(fn) {
      var previousBase;
      previousBase = base;
      base += indent;
      fn(base);
      base = previousBase;
    }
    function calculateSpaces(str) {
      var i;
      for (i = str.length - 1;i >= 0; --i) {
        if (esutils.code.isLineTerminator(str.charCodeAt(i))) {
          break;
        }
      }
      return str.length - 1 - i;
    }
    function adjustMultilineComment(value, specialBase) {
      var array, i, len, line, j, spaces, previousBase, sn;
      array = value.split(/\r\n|[\r\n]/);
      spaces = Number.MAX_VALUE;
      for (i = 1, len = array.length;i < len; ++i) {
        line = array[i];
        j = 0;
        while (j < line.length && esutils.code.isWhiteSpace(line.charCodeAt(j))) {
          ++j;
        }
        if (spaces > j) {
          spaces = j;
        }
      }
      if (typeof specialBase !== "undefined") {
        previousBase = base;
        if (array[1][spaces] === "*") {
          specialBase += " ";
        }
        base = specialBase;
      } else {
        if (spaces & 1) {
          --spaces;
        }
        previousBase = base;
      }
      for (i = 1, len = array.length;i < len; ++i) {
        sn = toSourceNodeWhenNeeded(addIndent(array[i].slice(spaces)));
        array[i] = sourceMap ? sn.join("") : sn;
      }
      base = previousBase;
      return array.join(`
`);
    }
    function generateComment(comment, specialBase) {
      if (comment.type === "Line") {
        if (endsWithLineTerminator(comment.value)) {
          return "//" + comment.value;
        } else {
          var result = "//" + comment.value;
          if (!preserveBlankLines) {
            result += `
`;
          }
          return result;
        }
      }
      if (extra.format.indent.adjustMultilineComment && /[\n\r]/.test(comment.value)) {
        return adjustMultilineComment("/*" + comment.value + "*/", specialBase);
      }
      return "/*" + comment.value + "*/";
    }
    function addComments(stmt, result) {
      var i, len, comment, save, tailingToStatement, specialBase, fragment, extRange, range, prevRange, prefix, infix, suffix, count;
      if (stmt.leadingComments && stmt.leadingComments.length > 0) {
        save = result;
        if (preserveBlankLines) {
          comment = stmt.leadingComments[0];
          result = [];
          extRange = comment.extendedRange;
          range = comment.range;
          prefix = sourceCode.substring(extRange[0], range[0]);
          count = (prefix.match(/\n/g) || []).length;
          if (count > 0) {
            result.push(stringRepeat(`
`, count));
            result.push(addIndent(generateComment(comment)));
          } else {
            result.push(prefix);
            result.push(generateComment(comment));
          }
          prevRange = range;
          for (i = 1, len = stmt.leadingComments.length;i < len; i++) {
            comment = stmt.leadingComments[i];
            range = comment.range;
            infix = sourceCode.substring(prevRange[1], range[0]);
            count = (infix.match(/\n/g) || []).length;
            result.push(stringRepeat(`
`, count));
            result.push(addIndent(generateComment(comment)));
            prevRange = range;
          }
          suffix = sourceCode.substring(range[1], extRange[1]);
          count = (suffix.match(/\n/g) || []).length;
          result.push(stringRepeat(`
`, count));
        } else {
          comment = stmt.leadingComments[0];
          result = [];
          if (safeConcatenation && stmt.type === Syntax.Program && stmt.body.length === 0) {
            result.push(`
`);
          }
          result.push(generateComment(comment));
          if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
            result.push(`
`);
          }
          for (i = 1, len = stmt.leadingComments.length;i < len; ++i) {
            comment = stmt.leadingComments[i];
            fragment = [generateComment(comment)];
            if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
              fragment.push(`
`);
            }
            result.push(addIndent(fragment));
          }
        }
        result.push(addIndent(save));
      }
      if (stmt.trailingComments) {
        if (preserveBlankLines) {
          comment = stmt.trailingComments[0];
          extRange = comment.extendedRange;
          range = comment.range;
          prefix = sourceCode.substring(extRange[0], range[0]);
          count = (prefix.match(/\n/g) || []).length;
          if (count > 0) {
            result.push(stringRepeat(`
`, count));
            result.push(addIndent(generateComment(comment)));
          } else {
            result.push(prefix);
            result.push(generateComment(comment));
          }
        } else {
          tailingToStatement = !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString());
          specialBase = stringRepeat(" ", calculateSpaces(toSourceNodeWhenNeeded([base, result, indent]).toString()));
          for (i = 0, len = stmt.trailingComments.length;i < len; ++i) {
            comment = stmt.trailingComments[i];
            if (tailingToStatement) {
              if (i === 0) {
                result = [result, indent];
              } else {
                result = [result, specialBase];
              }
              result.push(generateComment(comment, specialBase));
            } else {
              result = [result, addIndent(generateComment(comment))];
            }
            if (i !== len - 1 && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
              result = [result, `
`];
            }
          }
        }
      }
      return result;
    }
    function generateBlankLines(start, end, result) {
      var j, newlineCount = 0;
      for (j = start;j < end; j++) {
        if (sourceCode[j] === `
`) {
          newlineCount++;
        }
      }
      for (j = 1;j < newlineCount; j++) {
        result.push(newline);
      }
    }
    function parenthesize(text, current, should) {
      if (current < should) {
        return ["(", text, ")"];
      }
      return text;
    }
    function generateVerbatimString(string) {
      var i, iz, result;
      result = string.split(/\r\n|\n/);
      for (i = 1, iz = result.length;i < iz; i++) {
        result[i] = newline + base + result[i];
      }
      return result;
    }
    function generateVerbatim(expr, precedence) {
      var verbatim, result, prec;
      verbatim = expr[extra.verbatim];
      if (typeof verbatim === "string") {
        result = parenthesize(generateVerbatimString(verbatim), Precedence.Sequence, precedence);
      } else {
        result = generateVerbatimString(verbatim.content);
        prec = verbatim.precedence != null ? verbatim.precedence : Precedence.Sequence;
        result = parenthesize(result, prec, precedence);
      }
      return toSourceNodeWhenNeeded(result, expr);
    }
    function CodeGenerator() {}
    CodeGenerator.prototype.maybeBlock = function(stmt, flags) {
      var result, noLeadingComment, that = this;
      noLeadingComment = !extra.comment || !stmt.leadingComments;
      if (stmt.type === Syntax.BlockStatement && noLeadingComment) {
        return [space, this.generateStatement(stmt, flags)];
      }
      if (stmt.type === Syntax.EmptyStatement && noLeadingComment) {
        return ";";
      }
      withIndent(function() {
        result = [
          newline,
          addIndent(that.generateStatement(stmt, flags))
        ];
      });
      return result;
    };
    CodeGenerator.prototype.maybeBlockSuffix = function(stmt, result) {
      var ends = endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString());
      if (stmt.type === Syntax.BlockStatement && (!extra.comment || !stmt.leadingComments) && !ends) {
        return [result, space];
      }
      if (ends) {
        return [result, base];
      }
      return [result, newline, base];
    };
    function generateIdentifier(node) {
      return toSourceNodeWhenNeeded(node.name, node);
    }
    function generateAsyncPrefix(node, spaceRequired) {
      return node.async ? "async" + (spaceRequired ? noEmptySpace() : space) : "";
    }
    function generateStarSuffix(node) {
      var isGenerator = node.generator && !extra.moz.starlessGenerator;
      return isGenerator ? "*" + space : "";
    }
    function generateMethodPrefix(prop) {
      var func = prop.value, prefix = "";
      if (func.async) {
        prefix += generateAsyncPrefix(func, !prop.computed);
      }
      if (func.generator) {
        prefix += generateStarSuffix(func) ? "*" : "";
      }
      return prefix;
    }
    CodeGenerator.prototype.generatePattern = function(node, precedence, flags) {
      if (node.type === Syntax.Identifier) {
        return generateIdentifier(node);
      }
      return this.generateExpression(node, precedence, flags);
    };
    CodeGenerator.prototype.generateFunctionParams = function(node) {
      var i, iz, result, hasDefault;
      hasDefault = false;
      if (node.type === Syntax.ArrowFunctionExpression && !node.rest && (!node.defaults || node.defaults.length === 0) && node.params.length === 1 && node.params[0].type === Syntax.Identifier) {
        result = [generateAsyncPrefix(node, true), generateIdentifier(node.params[0])];
      } else {
        result = node.type === Syntax.ArrowFunctionExpression ? [generateAsyncPrefix(node, false)] : [];
        result.push("(");
        if (node.defaults) {
          hasDefault = true;
        }
        for (i = 0, iz = node.params.length;i < iz; ++i) {
          if (hasDefault && node.defaults[i]) {
            result.push(this.generateAssignment(node.params[i], node.defaults[i], "=", Precedence.Assignment, E_TTT));
          } else {
            result.push(this.generatePattern(node.params[i], Precedence.Assignment, E_TTT));
          }
          if (i + 1 < iz) {
            result.push("," + space);
          }
        }
        if (node.rest) {
          if (node.params.length) {
            result.push("," + space);
          }
          result.push("...");
          result.push(generateIdentifier(node.rest));
        }
        result.push(")");
      }
      return result;
    };
    CodeGenerator.prototype.generateFunctionBody = function(node) {
      var result, expr;
      result = this.generateFunctionParams(node);
      if (node.type === Syntax.ArrowFunctionExpression) {
        result.push(space);
        result.push("=>");
      }
      if (node.expression) {
        result.push(space);
        expr = this.generateExpression(node.body, Precedence.Assignment, E_TTT);
        if (expr.toString().charAt(0) === "{") {
          expr = ["(", expr, ")"];
        }
        result.push(expr);
      } else {
        result.push(this.maybeBlock(node.body, S_TTFF));
      }
      return result;
    };
    CodeGenerator.prototype.generateIterationForStatement = function(operator, stmt, flags) {
      var result = ["for" + (stmt.await ? noEmptySpace() + "await" : "") + space + "("], that = this;
      withIndent(function() {
        if (stmt.left.type === Syntax.VariableDeclaration) {
          withIndent(function() {
            result.push(stmt.left.kind + noEmptySpace());
            result.push(that.generateStatement(stmt.left.declarations[0], S_FFFF));
          });
        } else {
          result.push(that.generateExpression(stmt.left, Precedence.Call, E_TTT));
        }
        result = join(result, operator);
        result = [join(result, that.generateExpression(stmt.right, Precedence.Assignment, E_TTT)), ")"];
      });
      result.push(this.maybeBlock(stmt.body, flags));
      return result;
    };
    CodeGenerator.prototype.generatePropertyKey = function(expr, computed) {
      var result = [];
      if (computed) {
        result.push("[");
      }
      result.push(this.generateExpression(expr, Precedence.Assignment, E_TTT));
      if (computed) {
        result.push("]");
      }
      return result;
    };
    CodeGenerator.prototype.generateAssignment = function(left, right, operator, precedence, flags) {
      if (Precedence.Assignment < precedence) {
        flags |= F_ALLOW_IN;
      }
      return parenthesize([
        this.generateExpression(left, Precedence.Call, flags),
        space + operator + space,
        this.generateExpression(right, Precedence.Assignment, flags)
      ], Precedence.Assignment, precedence);
    };
    CodeGenerator.prototype.semicolon = function(flags) {
      if (!semicolons && flags & F_SEMICOLON_OPT) {
        return "";
      }
      return ";";
    };
    CodeGenerator.Statement = {
      BlockStatement: function(stmt, flags) {
        var range, content, result = ["{", newline], that = this;
        withIndent(function() {
          if (stmt.body.length === 0 && preserveBlankLines) {
            range = stmt.range;
            if (range[1] - range[0] > 2) {
              content = sourceCode.substring(range[0] + 1, range[1] - 1);
              if (content[0] === `
`) {
                result = ["{"];
              }
              result.push(content);
            }
          }
          var i, iz, fragment, bodyFlags;
          bodyFlags = S_TFFF;
          if (flags & F_FUNC_BODY) {
            bodyFlags |= F_DIRECTIVE_CTX;
          }
          for (i = 0, iz = stmt.body.length;i < iz; ++i) {
            if (preserveBlankLines) {
              if (i === 0) {
                if (stmt.body[0].leadingComments) {
                  range = stmt.body[0].leadingComments[0].extendedRange;
                  content = sourceCode.substring(range[0], range[1]);
                  if (content[0] === `
`) {
                    result = ["{"];
                  }
                }
                if (!stmt.body[0].leadingComments) {
                  generateBlankLines(stmt.range[0], stmt.body[0].range[0], result);
                }
              }
              if (i > 0) {
                if (!stmt.body[i - 1].trailingComments && !stmt.body[i].leadingComments) {
                  generateBlankLines(stmt.body[i - 1].range[1], stmt.body[i].range[0], result);
                }
              }
            }
            if (i === iz - 1) {
              bodyFlags |= F_SEMICOLON_OPT;
            }
            if (stmt.body[i].leadingComments && preserveBlankLines) {
              fragment = that.generateStatement(stmt.body[i], bodyFlags);
            } else {
              fragment = addIndent(that.generateStatement(stmt.body[i], bodyFlags));
            }
            result.push(fragment);
            if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
              if (preserveBlankLines && i < iz - 1) {
                if (!stmt.body[i + 1].leadingComments) {
                  result.push(newline);
                }
              } else {
                result.push(newline);
              }
            }
            if (preserveBlankLines) {
              if (i === iz - 1) {
                if (!stmt.body[i].trailingComments) {
                  generateBlankLines(stmt.body[i].range[1], stmt.range[1], result);
                }
              }
            }
          }
        });
        result.push(addIndent("}"));
        return result;
      },
      BreakStatement: function(stmt, flags) {
        if (stmt.label) {
          return "break " + stmt.label.name + this.semicolon(flags);
        }
        return "break" + this.semicolon(flags);
      },
      ContinueStatement: function(stmt, flags) {
        if (stmt.label) {
          return "continue " + stmt.label.name + this.semicolon(flags);
        }
        return "continue" + this.semicolon(flags);
      },
      ClassBody: function(stmt, flags) {
        var result = ["{", newline], that = this;
        withIndent(function(indent) {
          var i, iz;
          for (i = 0, iz = stmt.body.length;i < iz; ++i) {
            result.push(indent);
            result.push(that.generateExpression(stmt.body[i], Precedence.Sequence, E_TTT));
            if (i + 1 < iz) {
              result.push(newline);
            }
          }
        });
        if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
          result.push(newline);
        }
        result.push(base);
        result.push("}");
        return result;
      },
      ClassDeclaration: function(stmt, flags) {
        var result, fragment;
        result = ["class"];
        if (stmt.id) {
          result = join(result, this.generateExpression(stmt.id, Precedence.Sequence, E_TTT));
        }
        if (stmt.superClass) {
          fragment = join("extends", this.generateExpression(stmt.superClass, Precedence.Unary, E_TTT));
          result = join(result, fragment);
        }
        result.push(space);
        result.push(this.generateStatement(stmt.body, S_TFFT));
        return result;
      },
      DirectiveStatement: function(stmt, flags) {
        if (extra.raw && stmt.raw) {
          return stmt.raw + this.semicolon(flags);
        }
        return escapeDirective(stmt.directive) + this.semicolon(flags);
      },
      DoWhileStatement: function(stmt, flags) {
        var result = join("do", this.maybeBlock(stmt.body, S_TFFF));
        result = this.maybeBlockSuffix(stmt.body, result);
        return join(result, [
          "while" + space + "(",
          this.generateExpression(stmt.test, Precedence.Sequence, E_TTT),
          ")" + this.semicolon(flags)
        ]);
      },
      CatchClause: function(stmt, flags) {
        var result, that = this;
        withIndent(function() {
          var guard;
          if (stmt.param) {
            result = [
              "catch" + space + "(",
              that.generateExpression(stmt.param, Precedence.Sequence, E_TTT),
              ")"
            ];
            if (stmt.guard) {
              guard = that.generateExpression(stmt.guard, Precedence.Sequence, E_TTT);
              result.splice(2, 0, " if ", guard);
            }
          } else {
            result = ["catch"];
          }
        });
        result.push(this.maybeBlock(stmt.body, S_TFFF));
        return result;
      },
      DebuggerStatement: function(stmt, flags) {
        return "debugger" + this.semicolon(flags);
      },
      EmptyStatement: function(stmt, flags) {
        return ";";
      },
      ExportDefaultDeclaration: function(stmt, flags) {
        var result = ["export"], bodyFlags;
        bodyFlags = flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF;
        result = join(result, "default");
        if (isStatement(stmt.declaration)) {
          result = join(result, this.generateStatement(stmt.declaration, bodyFlags));
        } else {
          result = join(result, this.generateExpression(stmt.declaration, Precedence.Assignment, E_TTT) + this.semicolon(flags));
        }
        return result;
      },
      ExportNamedDeclaration: function(stmt, flags) {
        var result = ["export"], bodyFlags, that = this;
        bodyFlags = flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF;
        if (stmt.declaration) {
          return join(result, this.generateStatement(stmt.declaration, bodyFlags));
        }
        if (stmt.specifiers) {
          if (stmt.specifiers.length === 0) {
            result = join(result, "{" + space + "}");
          } else if (stmt.specifiers[0].type === Syntax.ExportBatchSpecifier) {
            result = join(result, this.generateExpression(stmt.specifiers[0], Precedence.Sequence, E_TTT));
          } else {
            result = join(result, "{");
            withIndent(function(indent) {
              var i, iz;
              result.push(newline);
              for (i = 0, iz = stmt.specifiers.length;i < iz; ++i) {
                result.push(indent);
                result.push(that.generateExpression(stmt.specifiers[i], Precedence.Sequence, E_TTT));
                if (i + 1 < iz) {
                  result.push("," + newline);
                }
              }
            });
            if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
              result.push(newline);
            }
            result.push(base + "}");
          }
          if (stmt.source) {
            result = join(result, [
              "from" + space,
              this.generateExpression(stmt.source, Precedence.Sequence, E_TTT),
              this.semicolon(flags)
            ]);
          } else {
            result.push(this.semicolon(flags));
          }
        }
        return result;
      },
      ExportAllDeclaration: function(stmt, flags) {
        return [
          "export" + space,
          "*" + space,
          "from" + space,
          this.generateExpression(stmt.source, Precedence.Sequence, E_TTT),
          this.semicolon(flags)
        ];
      },
      ExpressionStatement: function(stmt, flags) {
        var result, fragment;
        function isClassPrefixed(fragment) {
          var code;
          if (fragment.slice(0, 5) !== "class") {
            return false;
          }
          code = fragment.charCodeAt(5);
          return code === 123 || esutils.code.isWhiteSpace(code) || esutils.code.isLineTerminator(code);
        }
        function isFunctionPrefixed(fragment) {
          var code;
          if (fragment.slice(0, 8) !== "function") {
            return false;
          }
          code = fragment.charCodeAt(8);
          return code === 40 || esutils.code.isWhiteSpace(code) || code === 42 || esutils.code.isLineTerminator(code);
        }
        function isAsyncPrefixed(fragment) {
          var code, i, iz;
          if (fragment.slice(0, 5) !== "async") {
            return false;
          }
          if (!esutils.code.isWhiteSpace(fragment.charCodeAt(5))) {
            return false;
          }
          for (i = 6, iz = fragment.length;i < iz; ++i) {
            if (!esutils.code.isWhiteSpace(fragment.charCodeAt(i))) {
              break;
            }
          }
          if (i === iz) {
            return false;
          }
          if (fragment.slice(i, i + 8) !== "function") {
            return false;
          }
          code = fragment.charCodeAt(i + 8);
          return code === 40 || esutils.code.isWhiteSpace(code) || code === 42 || esutils.code.isLineTerminator(code);
        }
        result = [this.generateExpression(stmt.expression, Precedence.Sequence, E_TTT)];
        fragment = toSourceNodeWhenNeeded(result).toString();
        if (fragment.charCodeAt(0) === 123 || isClassPrefixed(fragment) || isFunctionPrefixed(fragment) || isAsyncPrefixed(fragment) || directive && flags & F_DIRECTIVE_CTX && stmt.expression.type === Syntax.Literal && typeof stmt.expression.value === "string") {
          result = ["(", result, ")" + this.semicolon(flags)];
        } else {
          result.push(this.semicolon(flags));
        }
        return result;
      },
      ImportDeclaration: function(stmt, flags) {
        var result, cursor, that = this;
        if (stmt.specifiers.length === 0) {
          return [
            "import",
            space,
            this.generateExpression(stmt.source, Precedence.Sequence, E_TTT),
            this.semicolon(flags)
          ];
        }
        result = [
          "import"
        ];
        cursor = 0;
        if (stmt.specifiers[cursor].type === Syntax.ImportDefaultSpecifier) {
          result = join(result, [
            this.generateExpression(stmt.specifiers[cursor], Precedence.Sequence, E_TTT)
          ]);
          ++cursor;
        }
        if (stmt.specifiers[cursor]) {
          if (cursor !== 0) {
            result.push(",");
          }
          if (stmt.specifiers[cursor].type === Syntax.ImportNamespaceSpecifier) {
            result = join(result, [
              space,
              this.generateExpression(stmt.specifiers[cursor], Precedence.Sequence, E_TTT)
            ]);
          } else {
            result.push(space + "{");
            if (stmt.specifiers.length - cursor === 1) {
              result.push(space);
              result.push(this.generateExpression(stmt.specifiers[cursor], Precedence.Sequence, E_TTT));
              result.push(space + "}" + space);
            } else {
              withIndent(function(indent) {
                var i, iz;
                result.push(newline);
                for (i = cursor, iz = stmt.specifiers.length;i < iz; ++i) {
                  result.push(indent);
                  result.push(that.generateExpression(stmt.specifiers[i], Precedence.Sequence, E_TTT));
                  if (i + 1 < iz) {
                    result.push("," + newline);
                  }
                }
              });
              if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                result.push(newline);
              }
              result.push(base + "}" + space);
            }
          }
        }
        result = join(result, [
          "from" + space,
          this.generateExpression(stmt.source, Precedence.Sequence, E_TTT),
          this.semicolon(flags)
        ]);
        return result;
      },
      VariableDeclarator: function(stmt, flags) {
        var itemFlags = flags & F_ALLOW_IN ? E_TTT : E_FTT;
        if (stmt.init) {
          return [
            this.generateExpression(stmt.id, Precedence.Assignment, itemFlags),
            space,
            "=",
            space,
            this.generateExpression(stmt.init, Precedence.Assignment, itemFlags)
          ];
        }
        return this.generatePattern(stmt.id, Precedence.Assignment, itemFlags);
      },
      VariableDeclaration: function(stmt, flags) {
        var result, i, iz, node, bodyFlags, that = this;
        result = [stmt.kind];
        bodyFlags = flags & F_ALLOW_IN ? S_TFFF : S_FFFF;
        function block() {
          node = stmt.declarations[0];
          if (extra.comment && node.leadingComments) {
            result.push(`
`);
            result.push(addIndent(that.generateStatement(node, bodyFlags)));
          } else {
            result.push(noEmptySpace());
            result.push(that.generateStatement(node, bodyFlags));
          }
          for (i = 1, iz = stmt.declarations.length;i < iz; ++i) {
            node = stmt.declarations[i];
            if (extra.comment && node.leadingComments) {
              result.push("," + newline);
              result.push(addIndent(that.generateStatement(node, bodyFlags)));
            } else {
              result.push("," + space);
              result.push(that.generateStatement(node, bodyFlags));
            }
          }
        }
        if (stmt.declarations.length > 1) {
          withIndent(block);
        } else {
          block();
        }
        result.push(this.semicolon(flags));
        return result;
      },
      ThrowStatement: function(stmt, flags) {
        return [join("throw", this.generateExpression(stmt.argument, Precedence.Sequence, E_TTT)), this.semicolon(flags)];
      },
      TryStatement: function(stmt, flags) {
        var result, i, iz, guardedHandlers;
        result = ["try", this.maybeBlock(stmt.block, S_TFFF)];
        result = this.maybeBlockSuffix(stmt.block, result);
        if (stmt.handlers) {
          for (i = 0, iz = stmt.handlers.length;i < iz; ++i) {
            result = join(result, this.generateStatement(stmt.handlers[i], S_TFFF));
            if (stmt.finalizer || i + 1 !== iz) {
              result = this.maybeBlockSuffix(stmt.handlers[i].body, result);
            }
          }
        } else {
          guardedHandlers = stmt.guardedHandlers || [];
          for (i = 0, iz = guardedHandlers.length;i < iz; ++i) {
            result = join(result, this.generateStatement(guardedHandlers[i], S_TFFF));
            if (stmt.finalizer || i + 1 !== iz) {
              result = this.maybeBlockSuffix(guardedHandlers[i].body, result);
            }
          }
          if (stmt.handler) {
            if (Array.isArray(stmt.handler)) {
              for (i = 0, iz = stmt.handler.length;i < iz; ++i) {
                result = join(result, this.generateStatement(stmt.handler[i], S_TFFF));
                if (stmt.finalizer || i + 1 !== iz) {
                  result = this.maybeBlockSuffix(stmt.handler[i].body, result);
                }
              }
            } else {
              result = join(result, this.generateStatement(stmt.handler, S_TFFF));
              if (stmt.finalizer) {
                result = this.maybeBlockSuffix(stmt.handler.body, result);
              }
            }
          }
        }
        if (stmt.finalizer) {
          result = join(result, ["finally", this.maybeBlock(stmt.finalizer, S_TFFF)]);
        }
        return result;
      },
      SwitchStatement: function(stmt, flags) {
        var result, fragment, i, iz, bodyFlags, that = this;
        withIndent(function() {
          result = [
            "switch" + space + "(",
            that.generateExpression(stmt.discriminant, Precedence.Sequence, E_TTT),
            ")" + space + "{" + newline
          ];
        });
        if (stmt.cases) {
          bodyFlags = S_TFFF;
          for (i = 0, iz = stmt.cases.length;i < iz; ++i) {
            if (i === iz - 1) {
              bodyFlags |= F_SEMICOLON_OPT;
            }
            fragment = addIndent(this.generateStatement(stmt.cases[i], bodyFlags));
            result.push(fragment);
            if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
              result.push(newline);
            }
          }
        }
        result.push(addIndent("}"));
        return result;
      },
      SwitchCase: function(stmt, flags) {
        var result, fragment, i, iz, bodyFlags, that = this;
        withIndent(function() {
          if (stmt.test) {
            result = [
              join("case", that.generateExpression(stmt.test, Precedence.Sequence, E_TTT)),
              ":"
            ];
          } else {
            result = ["default:"];
          }
          i = 0;
          iz = stmt.consequent.length;
          if (iz && stmt.consequent[0].type === Syntax.BlockStatement) {
            fragment = that.maybeBlock(stmt.consequent[0], S_TFFF);
            result.push(fragment);
            i = 1;
          }
          if (i !== iz && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
            result.push(newline);
          }
          bodyFlags = S_TFFF;
          for (;i < iz; ++i) {
            if (i === iz - 1 && flags & F_SEMICOLON_OPT) {
              bodyFlags |= F_SEMICOLON_OPT;
            }
            fragment = addIndent(that.generateStatement(stmt.consequent[i], bodyFlags));
            result.push(fragment);
            if (i + 1 !== iz && !endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
              result.push(newline);
            }
          }
        });
        return result;
      },
      IfStatement: function(stmt, flags) {
        var result, bodyFlags, semicolonOptional, that = this;
        withIndent(function() {
          result = [
            "if" + space + "(",
            that.generateExpression(stmt.test, Precedence.Sequence, E_TTT),
            ")"
          ];
        });
        semicolonOptional = flags & F_SEMICOLON_OPT;
        bodyFlags = S_TFFF;
        if (semicolonOptional) {
          bodyFlags |= F_SEMICOLON_OPT;
        }
        if (stmt.alternate) {
          result.push(this.maybeBlock(stmt.consequent, S_TFFF));
          result = this.maybeBlockSuffix(stmt.consequent, result);
          if (stmt.alternate.type === Syntax.IfStatement) {
            result = join(result, ["else ", this.generateStatement(stmt.alternate, bodyFlags)]);
          } else {
            result = join(result, join("else", this.maybeBlock(stmt.alternate, bodyFlags)));
          }
        } else {
          result.push(this.maybeBlock(stmt.consequent, bodyFlags));
        }
        return result;
      },
      ForStatement: function(stmt, flags) {
        var result, that = this;
        withIndent(function() {
          result = ["for" + space + "("];
          if (stmt.init) {
            if (stmt.init.type === Syntax.VariableDeclaration) {
              result.push(that.generateStatement(stmt.init, S_FFFF));
            } else {
              result.push(that.generateExpression(stmt.init, Precedence.Sequence, E_FTT));
              result.push(";");
            }
          } else {
            result.push(";");
          }
          if (stmt.test) {
            result.push(space);
            result.push(that.generateExpression(stmt.test, Precedence.Sequence, E_TTT));
            result.push(";");
          } else {
            result.push(";");
          }
          if (stmt.update) {
            result.push(space);
            result.push(that.generateExpression(stmt.update, Precedence.Sequence, E_TTT));
            result.push(")");
          } else {
            result.push(")");
          }
        });
        result.push(this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF));
        return result;
      },
      ForInStatement: function(stmt, flags) {
        return this.generateIterationForStatement("in", stmt, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF);
      },
      ForOfStatement: function(stmt, flags) {
        return this.generateIterationForStatement("of", stmt, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF);
      },
      LabeledStatement: function(stmt, flags) {
        return [stmt.label.name + ":", this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF)];
      },
      Program: function(stmt, flags) {
        var result, fragment, i, iz, bodyFlags;
        iz = stmt.body.length;
        result = [safeConcatenation && iz > 0 ? `
` : ""];
        bodyFlags = S_TFTF;
        for (i = 0;i < iz; ++i) {
          if (!safeConcatenation && i === iz - 1) {
            bodyFlags |= F_SEMICOLON_OPT;
          }
          if (preserveBlankLines) {
            if (i === 0) {
              if (!stmt.body[0].leadingComments) {
                generateBlankLines(stmt.range[0], stmt.body[i].range[0], result);
              }
            }
            if (i > 0) {
              if (!stmt.body[i - 1].trailingComments && !stmt.body[i].leadingComments) {
                generateBlankLines(stmt.body[i - 1].range[1], stmt.body[i].range[0], result);
              }
            }
          }
          fragment = addIndent(this.generateStatement(stmt.body[i], bodyFlags));
          result.push(fragment);
          if (i + 1 < iz && !endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
            if (preserveBlankLines) {
              if (!stmt.body[i + 1].leadingComments) {
                result.push(newline);
              }
            } else {
              result.push(newline);
            }
          }
          if (preserveBlankLines) {
            if (i === iz - 1) {
              if (!stmt.body[i].trailingComments) {
                generateBlankLines(stmt.body[i].range[1], stmt.range[1], result);
              }
            }
          }
        }
        return result;
      },
      FunctionDeclaration: function(stmt, flags) {
        return [
          generateAsyncPrefix(stmt, true),
          "function",
          generateStarSuffix(stmt) || noEmptySpace(),
          stmt.id ? generateIdentifier(stmt.id) : "",
          this.generateFunctionBody(stmt)
        ];
      },
      ReturnStatement: function(stmt, flags) {
        if (stmt.argument) {
          return [join("return", this.generateExpression(stmt.argument, Precedence.Sequence, E_TTT)), this.semicolon(flags)];
        }
        return ["return" + this.semicolon(flags)];
      },
      WhileStatement: function(stmt, flags) {
        var result, that = this;
        withIndent(function() {
          result = [
            "while" + space + "(",
            that.generateExpression(stmt.test, Precedence.Sequence, E_TTT),
            ")"
          ];
        });
        result.push(this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF));
        return result;
      },
      WithStatement: function(stmt, flags) {
        var result, that = this;
        withIndent(function() {
          result = [
            "with" + space + "(",
            that.generateExpression(stmt.object, Precedence.Sequence, E_TTT),
            ")"
          ];
        });
        result.push(this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF));
        return result;
      }
    };
    merge(CodeGenerator.prototype, CodeGenerator.Statement);
    CodeGenerator.Expression = {
      SequenceExpression: function(expr, precedence, flags) {
        var result, i, iz;
        if (Precedence.Sequence < precedence) {
          flags |= F_ALLOW_IN;
        }
        result = [];
        for (i = 0, iz = expr.expressions.length;i < iz; ++i) {
          result.push(this.generateExpression(expr.expressions[i], Precedence.Assignment, flags));
          if (i + 1 < iz) {
            result.push("," + space);
          }
        }
        return parenthesize(result, Precedence.Sequence, precedence);
      },
      AssignmentExpression: function(expr, precedence, flags) {
        return this.generateAssignment(expr.left, expr.right, expr.operator, precedence, flags);
      },
      ArrowFunctionExpression: function(expr, precedence, flags) {
        return parenthesize(this.generateFunctionBody(expr), Precedence.ArrowFunction, precedence);
      },
      ConditionalExpression: function(expr, precedence, flags) {
        if (Precedence.Conditional < precedence) {
          flags |= F_ALLOW_IN;
        }
        return parenthesize([
          this.generateExpression(expr.test, Precedence.Coalesce, flags),
          space + "?" + space,
          this.generateExpression(expr.consequent, Precedence.Assignment, flags),
          space + ":" + space,
          this.generateExpression(expr.alternate, Precedence.Assignment, flags)
        ], Precedence.Conditional, precedence);
      },
      LogicalExpression: function(expr, precedence, flags) {
        if (expr.operator === "??") {
          flags |= F_FOUND_COALESCE;
        }
        return this.BinaryExpression(expr, precedence, flags);
      },
      BinaryExpression: function(expr, precedence, flags) {
        var result, leftPrecedence, rightPrecedence, currentPrecedence, fragment, leftSource;
        currentPrecedence = BinaryPrecedence[expr.operator];
        leftPrecedence = expr.operator === "**" ? Precedence.Postfix : currentPrecedence;
        rightPrecedence = expr.operator === "**" ? currentPrecedence : currentPrecedence + 1;
        if (currentPrecedence < precedence) {
          flags |= F_ALLOW_IN;
        }
        fragment = this.generateExpression(expr.left, leftPrecedence, flags);
        leftSource = fragment.toString();
        if (leftSource.charCodeAt(leftSource.length - 1) === 47 && esutils.code.isIdentifierPartES5(expr.operator.charCodeAt(0))) {
          result = [fragment, noEmptySpace(), expr.operator];
        } else {
          result = join(fragment, expr.operator);
        }
        fragment = this.generateExpression(expr.right, rightPrecedence, flags);
        if (expr.operator === "/" && fragment.toString().charAt(0) === "/" || expr.operator.slice(-1) === "<" && fragment.toString().slice(0, 3) === "!--") {
          result.push(noEmptySpace());
          result.push(fragment);
        } else {
          result = join(result, fragment);
        }
        if (expr.operator === "in" && !(flags & F_ALLOW_IN)) {
          return ["(", result, ")"];
        }
        if ((expr.operator === "||" || expr.operator === "&&") && flags & F_FOUND_COALESCE) {
          return ["(", result, ")"];
        }
        return parenthesize(result, currentPrecedence, precedence);
      },
      CallExpression: function(expr, precedence, flags) {
        var result, i, iz;
        result = [this.generateExpression(expr.callee, Precedence.Call, E_TTF)];
        if (expr.optional) {
          result.push("?.");
        }
        result.push("(");
        for (i = 0, iz = expr["arguments"].length;i < iz; ++i) {
          result.push(this.generateExpression(expr["arguments"][i], Precedence.Assignment, E_TTT));
          if (i + 1 < iz) {
            result.push("," + space);
          }
        }
        result.push(")");
        if (!(flags & F_ALLOW_CALL)) {
          return ["(", result, ")"];
        }
        return parenthesize(result, Precedence.Call, precedence);
      },
      ChainExpression: function(expr, precedence, flags) {
        if (Precedence.OptionalChaining < precedence) {
          flags |= F_ALLOW_CALL;
        }
        var result = this.generateExpression(expr.expression, Precedence.OptionalChaining, flags);
        return parenthesize(result, Precedence.OptionalChaining, precedence);
      },
      NewExpression: function(expr, precedence, flags) {
        var result, length, i, iz, itemFlags;
        length = expr["arguments"].length;
        itemFlags = flags & F_ALLOW_UNPARATH_NEW && !parentheses && length === 0 ? E_TFT : E_TFF;
        result = join("new", this.generateExpression(expr.callee, Precedence.New, itemFlags));
        if (!(flags & F_ALLOW_UNPARATH_NEW) || parentheses || length > 0) {
          result.push("(");
          for (i = 0, iz = length;i < iz; ++i) {
            result.push(this.generateExpression(expr["arguments"][i], Precedence.Assignment, E_TTT));
            if (i + 1 < iz) {
              result.push("," + space);
            }
          }
          result.push(")");
        }
        return parenthesize(result, Precedence.New, precedence);
      },
      MemberExpression: function(expr, precedence, flags) {
        var result, fragment;
        result = [this.generateExpression(expr.object, Precedence.Call, flags & F_ALLOW_CALL ? E_TTF : E_TFF)];
        if (expr.computed) {
          if (expr.optional) {
            result.push("?.");
          }
          result.push("[");
          result.push(this.generateExpression(expr.property, Precedence.Sequence, flags & F_ALLOW_CALL ? E_TTT : E_TFT));
          result.push("]");
        } else {
          if (!expr.optional && expr.object.type === Syntax.Literal && typeof expr.object.value === "number") {
            fragment = toSourceNodeWhenNeeded(result).toString();
            if (fragment.indexOf(".") < 0 && !/[eExX]/.test(fragment) && esutils.code.isDecimalDigit(fragment.charCodeAt(fragment.length - 1)) && !(fragment.length >= 2 && fragment.charCodeAt(0) === 48)) {
              result.push(" ");
            }
          }
          result.push(expr.optional ? "?." : ".");
          result.push(generateIdentifier(expr.property));
        }
        return parenthesize(result, Precedence.Member, precedence);
      },
      MetaProperty: function(expr, precedence, flags) {
        var result;
        result = [];
        result.push(typeof expr.meta === "string" ? expr.meta : generateIdentifier(expr.meta));
        result.push(".");
        result.push(typeof expr.property === "string" ? expr.property : generateIdentifier(expr.property));
        return parenthesize(result, Precedence.Member, precedence);
      },
      UnaryExpression: function(expr, precedence, flags) {
        var result, fragment, rightCharCode, leftSource, leftCharCode;
        fragment = this.generateExpression(expr.argument, Precedence.Unary, E_TTT);
        if (space === "") {
          result = join(expr.operator, fragment);
        } else {
          result = [expr.operator];
          if (expr.operator.length > 2) {
            result = join(result, fragment);
          } else {
            leftSource = toSourceNodeWhenNeeded(result).toString();
            leftCharCode = leftSource.charCodeAt(leftSource.length - 1);
            rightCharCode = fragment.toString().charCodeAt(0);
            if ((leftCharCode === 43 || leftCharCode === 45) && leftCharCode === rightCharCode || esutils.code.isIdentifierPartES5(leftCharCode) && esutils.code.isIdentifierPartES5(rightCharCode)) {
              result.push(noEmptySpace());
              result.push(fragment);
            } else {
              result.push(fragment);
            }
          }
        }
        return parenthesize(result, Precedence.Unary, precedence);
      },
      YieldExpression: function(expr, precedence, flags) {
        var result;
        if (expr.delegate) {
          result = "yield*";
        } else {
          result = "yield";
        }
        if (expr.argument) {
          result = join(result, this.generateExpression(expr.argument, Precedence.Yield, E_TTT));
        }
        return parenthesize(result, Precedence.Yield, precedence);
      },
      AwaitExpression: function(expr, precedence, flags) {
        var result = join(expr.all ? "await*" : "await", this.generateExpression(expr.argument, Precedence.Await, E_TTT));
        return parenthesize(result, Precedence.Await, precedence);
      },
      UpdateExpression: function(expr, precedence, flags) {
        if (expr.prefix) {
          return parenthesize([
            expr.operator,
            this.generateExpression(expr.argument, Precedence.Unary, E_TTT)
          ], Precedence.Unary, precedence);
        }
        return parenthesize([
          this.generateExpression(expr.argument, Precedence.Postfix, E_TTT),
          expr.operator
        ], Precedence.Postfix, precedence);
      },
      FunctionExpression: function(expr, precedence, flags) {
        var result = [
          generateAsyncPrefix(expr, true),
          "function"
        ];
        if (expr.id) {
          result.push(generateStarSuffix(expr) || noEmptySpace());
          result.push(generateIdentifier(expr.id));
        } else {
          result.push(generateStarSuffix(expr) || space);
        }
        result.push(this.generateFunctionBody(expr));
        return result;
      },
      ArrayPattern: function(expr, precedence, flags) {
        return this.ArrayExpression(expr, precedence, flags, true);
      },
      ArrayExpression: function(expr, precedence, flags, isPattern) {
        var result, multiline, that = this;
        if (!expr.elements.length) {
          return "[]";
        }
        multiline = isPattern ? false : expr.elements.length > 1;
        result = ["[", multiline ? newline : ""];
        withIndent(function(indent) {
          var i, iz;
          for (i = 0, iz = expr.elements.length;i < iz; ++i) {
            if (!expr.elements[i]) {
              if (multiline) {
                result.push(indent);
              }
              if (i + 1 === iz) {
                result.push(",");
              }
            } else {
              result.push(multiline ? indent : "");
              result.push(that.generateExpression(expr.elements[i], Precedence.Assignment, E_TTT));
            }
            if (i + 1 < iz) {
              result.push("," + (multiline ? newline : space));
            }
          }
        });
        if (multiline && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
          result.push(newline);
        }
        result.push(multiline ? base : "");
        result.push("]");
        return result;
      },
      RestElement: function(expr, precedence, flags) {
        return "..." + this.generatePattern(expr.argument);
      },
      ClassExpression: function(expr, precedence, flags) {
        var result, fragment;
        result = ["class"];
        if (expr.id) {
          result = join(result, this.generateExpression(expr.id, Precedence.Sequence, E_TTT));
        }
        if (expr.superClass) {
          fragment = join("extends", this.generateExpression(expr.superClass, Precedence.Unary, E_TTT));
          result = join(result, fragment);
        }
        result.push(space);
        result.push(this.generateStatement(expr.body, S_TFFT));
        return result;
      },
      MethodDefinition: function(expr, precedence, flags) {
        var result, fragment;
        if (expr["static"]) {
          result = ["static" + space];
        } else {
          result = [];
        }
        if (expr.kind === "get" || expr.kind === "set") {
          fragment = [
            join(expr.kind, this.generatePropertyKey(expr.key, expr.computed)),
            this.generateFunctionBody(expr.value)
          ];
        } else {
          fragment = [
            generateMethodPrefix(expr),
            this.generatePropertyKey(expr.key, expr.computed),
            this.generateFunctionBody(expr.value)
          ];
        }
        return join(result, fragment);
      },
      Property: function(expr, precedence, flags) {
        if (expr.kind === "get" || expr.kind === "set") {
          return [
            expr.kind,
            noEmptySpace(),
            this.generatePropertyKey(expr.key, expr.computed),
            this.generateFunctionBody(expr.value)
          ];
        }
        if (expr.shorthand) {
          if (expr.value.type === "AssignmentPattern") {
            return this.AssignmentPattern(expr.value, Precedence.Sequence, E_TTT);
          }
          return this.generatePropertyKey(expr.key, expr.computed);
        }
        if (expr.method) {
          return [
            generateMethodPrefix(expr),
            this.generatePropertyKey(expr.key, expr.computed),
            this.generateFunctionBody(expr.value)
          ];
        }
        return [
          this.generatePropertyKey(expr.key, expr.computed),
          ":" + space,
          this.generateExpression(expr.value, Precedence.Assignment, E_TTT)
        ];
      },
      ObjectExpression: function(expr, precedence, flags) {
        var multiline, result, fragment, that = this;
        if (!expr.properties.length) {
          return "{}";
        }
        multiline = expr.properties.length > 1;
        withIndent(function() {
          fragment = that.generateExpression(expr.properties[0], Precedence.Sequence, E_TTT);
        });
        if (!multiline) {
          if (!hasLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
            return ["{", space, fragment, space, "}"];
          }
        }
        withIndent(function(indent) {
          var i, iz;
          result = ["{", newline, indent, fragment];
          if (multiline) {
            result.push("," + newline);
            for (i = 1, iz = expr.properties.length;i < iz; ++i) {
              result.push(indent);
              result.push(that.generateExpression(expr.properties[i], Precedence.Sequence, E_TTT));
              if (i + 1 < iz) {
                result.push("," + newline);
              }
            }
          }
        });
        if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
          result.push(newline);
        }
        result.push(base);
        result.push("}");
        return result;
      },
      AssignmentPattern: function(expr, precedence, flags) {
        return this.generateAssignment(expr.left, expr.right, "=", precedence, flags);
      },
      ObjectPattern: function(expr, precedence, flags) {
        var result, i, iz, multiline, property, that = this;
        if (!expr.properties.length) {
          return "{}";
        }
        multiline = false;
        if (expr.properties.length === 1) {
          property = expr.properties[0];
          if (property.type === Syntax.Property && property.value.type !== Syntax.Identifier) {
            multiline = true;
          }
        } else {
          for (i = 0, iz = expr.properties.length;i < iz; ++i) {
            property = expr.properties[i];
            if (property.type === Syntax.Property && !property.shorthand) {
              multiline = true;
              break;
            }
          }
        }
        result = ["{", multiline ? newline : ""];
        withIndent(function(indent) {
          var i, iz;
          for (i = 0, iz = expr.properties.length;i < iz; ++i) {
            result.push(multiline ? indent : "");
            result.push(that.generateExpression(expr.properties[i], Precedence.Sequence, E_TTT));
            if (i + 1 < iz) {
              result.push("," + (multiline ? newline : space));
            }
          }
        });
        if (multiline && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
          result.push(newline);
        }
        result.push(multiline ? base : "");
        result.push("}");
        return result;
      },
      ThisExpression: function(expr, precedence, flags) {
        return "this";
      },
      Super: function(expr, precedence, flags) {
        return "super";
      },
      Identifier: function(expr, precedence, flags) {
        return generateIdentifier(expr);
      },
      ImportDefaultSpecifier: function(expr, precedence, flags) {
        return generateIdentifier(expr.id || expr.local);
      },
      ImportNamespaceSpecifier: function(expr, precedence, flags) {
        var result = ["*"];
        var id = expr.id || expr.local;
        if (id) {
          result.push(space + "as" + noEmptySpace() + generateIdentifier(id));
        }
        return result;
      },
      ImportSpecifier: function(expr, precedence, flags) {
        var imported = expr.imported;
        var result = [imported.name];
        var local = expr.local;
        if (local && local.name !== imported.name) {
          result.push(noEmptySpace() + "as" + noEmptySpace() + generateIdentifier(local));
        }
        return result;
      },
      ExportSpecifier: function(expr, precedence, flags) {
        var local = expr.local;
        var result = [local.name];
        var exported = expr.exported;
        if (exported && exported.name !== local.name) {
          result.push(noEmptySpace() + "as" + noEmptySpace() + generateIdentifier(exported));
        }
        return result;
      },
      Literal: function(expr, precedence, flags) {
        var raw;
        if (expr.hasOwnProperty("raw") && parse && extra.raw) {
          try {
            raw = parse(expr.raw).body[0].expression;
            if (raw.type === Syntax.Literal) {
              if (raw.value === expr.value) {
                return expr.raw;
              }
            }
          } catch (e) {}
        }
        if (expr.regex) {
          return "/" + expr.regex.pattern + "/" + expr.regex.flags;
        }
        if (typeof expr.value === "bigint") {
          return expr.value.toString() + "n";
        }
        if (expr.bigint) {
          return expr.bigint + "n";
        }
        if (expr.value === null) {
          return "null";
        }
        if (typeof expr.value === "string") {
          return escapeString(expr.value);
        }
        if (typeof expr.value === "number") {
          return generateNumber(expr.value);
        }
        if (typeof expr.value === "boolean") {
          return expr.value ? "true" : "false";
        }
        return generateRegExp(expr.value);
      },
      GeneratorExpression: function(expr, precedence, flags) {
        return this.ComprehensionExpression(expr, precedence, flags);
      },
      ComprehensionExpression: function(expr, precedence, flags) {
        var result, i, iz, fragment, that = this;
        result = expr.type === Syntax.GeneratorExpression ? ["("] : ["["];
        if (extra.moz.comprehensionExpressionStartsWithAssignment) {
          fragment = this.generateExpression(expr.body, Precedence.Assignment, E_TTT);
          result.push(fragment);
        }
        if (expr.blocks) {
          withIndent(function() {
            for (i = 0, iz = expr.blocks.length;i < iz; ++i) {
              fragment = that.generateExpression(expr.blocks[i], Precedence.Sequence, E_TTT);
              if (i > 0 || extra.moz.comprehensionExpressionStartsWithAssignment) {
                result = join(result, fragment);
              } else {
                result.push(fragment);
              }
            }
          });
        }
        if (expr.filter) {
          result = join(result, "if" + space);
          fragment = this.generateExpression(expr.filter, Precedence.Sequence, E_TTT);
          result = join(result, ["(", fragment, ")"]);
        }
        if (!extra.moz.comprehensionExpressionStartsWithAssignment) {
          fragment = this.generateExpression(expr.body, Precedence.Assignment, E_TTT);
          result = join(result, fragment);
        }
        result.push(expr.type === Syntax.GeneratorExpression ? ")" : "]");
        return result;
      },
      ComprehensionBlock: function(expr, precedence, flags) {
        var fragment;
        if (expr.left.type === Syntax.VariableDeclaration) {
          fragment = [
            expr.left.kind,
            noEmptySpace(),
            this.generateStatement(expr.left.declarations[0], S_FFFF)
          ];
        } else {
          fragment = this.generateExpression(expr.left, Precedence.Call, E_TTT);
        }
        fragment = join(fragment, expr.of ? "of" : "in");
        fragment = join(fragment, this.generateExpression(expr.right, Precedence.Sequence, E_TTT));
        return ["for" + space + "(", fragment, ")"];
      },
      SpreadElement: function(expr, precedence, flags) {
        return [
          "...",
          this.generateExpression(expr.argument, Precedence.Assignment, E_TTT)
        ];
      },
      TaggedTemplateExpression: function(expr, precedence, flags) {
        var itemFlags = E_TTF;
        if (!(flags & F_ALLOW_CALL)) {
          itemFlags = E_TFF;
        }
        var result = [
          this.generateExpression(expr.tag, Precedence.Call, itemFlags),
          this.generateExpression(expr.quasi, Precedence.Primary, E_FFT)
        ];
        return parenthesize(result, Precedence.TaggedTemplate, precedence);
      },
      TemplateElement: function(expr, precedence, flags) {
        return expr.value.raw;
      },
      TemplateLiteral: function(expr, precedence, flags) {
        var result, i, iz;
        result = ["`"];
        for (i = 0, iz = expr.quasis.length;i < iz; ++i) {
          result.push(this.generateExpression(expr.quasis[i], Precedence.Primary, E_TTT));
          if (i + 1 < iz) {
            result.push("${" + space);
            result.push(this.generateExpression(expr.expressions[i], Precedence.Sequence, E_TTT));
            result.push(space + "}");
          }
        }
        result.push("`");
        return result;
      },
      ModuleSpecifier: function(expr, precedence, flags) {
        return this.Literal(expr, precedence, flags);
      },
      ImportExpression: function(expr, precedence, flag) {
        return parenthesize([
          "import(",
          this.generateExpression(expr.source, Precedence.Assignment, E_TTT),
          ")"
        ], Precedence.Call, precedence);
      }
    };
    merge(CodeGenerator.prototype, CodeGenerator.Expression);
    CodeGenerator.prototype.generateExpression = function(expr, precedence, flags) {
      var result, type;
      type = expr.type || Syntax.Property;
      if (extra.verbatim && expr.hasOwnProperty(extra.verbatim)) {
        return generateVerbatim(expr, precedence);
      }
      result = this[type](expr, precedence, flags);
      if (extra.comment) {
        result = addComments(expr, result);
      }
      return toSourceNodeWhenNeeded(result, expr);
    };
    CodeGenerator.prototype.generateStatement = function(stmt, flags) {
      var result, fragment;
      result = this[stmt.type](stmt, flags);
      if (extra.comment) {
        result = addComments(stmt, result);
      }
      fragment = toSourceNodeWhenNeeded(result).toString();
      if (stmt.type === Syntax.Program && !safeConcatenation && newline === "" && fragment.charAt(fragment.length - 1) === `
`) {
        result = sourceMap ? toSourceNodeWhenNeeded(result).replaceRight(/\s+$/, "") : fragment.replace(/\s+$/, "");
      }
      return toSourceNodeWhenNeeded(result, stmt);
    };
    function generateInternal(node) {
      var codegen;
      codegen = new CodeGenerator;
      if (isStatement(node)) {
        return codegen.generateStatement(node, S_TFFF);
      }
      if (isExpression(node)) {
        return codegen.generateExpression(node, Precedence.Sequence, E_TTT);
      }
      throw new Error("Unknown node type: " + node.type);
    }
    function generate(node, options) {
      var defaultOptions = getDefaultOptions(), result, pair;
      if (options != null) {
        if (typeof options.indent === "string") {
          defaultOptions.format.indent.style = options.indent;
        }
        if (typeof options.base === "number") {
          defaultOptions.format.indent.base = options.base;
        }
        options = updateDeeply(defaultOptions, options);
        indent = options.format.indent.style;
        if (typeof options.base === "string") {
          base = options.base;
        } else {
          base = stringRepeat(indent, options.format.indent.base);
        }
      } else {
        options = defaultOptions;
        indent = options.format.indent.style;
        base = stringRepeat(indent, options.format.indent.base);
      }
      json = options.format.json;
      renumber = options.format.renumber;
      hexadecimal = json ? false : options.format.hexadecimal;
      quotes = json ? "double" : options.format.quotes;
      escapeless = options.format.escapeless;
      newline = options.format.newline;
      space = options.format.space;
      if (options.format.compact) {
        newline = space = indent = base = "";
      }
      parentheses = options.format.parentheses;
      semicolons = options.format.semicolons;
      safeConcatenation = options.format.safeConcatenation;
      directive = options.directive;
      parse = json ? null : options.parse;
      sourceMap = options.sourceMap;
      sourceCode = options.sourceCode;
      preserveBlankLines = options.format.preserveBlankLines && sourceCode !== null;
      extra = options;
      if (sourceMap) {
        if (!exports.browser) {
          SourceNode = require_source_map().SourceNode;
        } else {
          SourceNode = global.sourceMap.SourceNode;
        }
      }
      result = generateInternal(node);
      if (!sourceMap) {
        pair = { code: result.toString(), map: null };
        return options.sourceMapWithCode ? pair : pair.code;
      }
      pair = result.toStringWithSourceMap({
        file: options.file,
        sourceRoot: options.sourceMapRoot
      });
      if (options.sourceContent) {
        pair.map.setSourceContent(options.sourceMap, options.sourceContent);
      }
      if (options.sourceMapWithCode) {
        return pair;
      }
      return pair.map.toString();
    }
    FORMAT_MINIFY = {
      indent: {
        style: "",
        base: 0
      },
      renumber: true,
      hexadecimal: true,
      quotes: "auto",
      escapeless: true,
      compact: true,
      parentheses: false,
      semicolons: false
    };
    FORMAT_DEFAULTS = getDefaultOptions().format;
    exports.version = require_package().version;
    exports.generate = generate;
    exports.attachComments = estraverse.attachComments;
    exports.Precedence = updateDeeply({}, Precedence);
    exports.browser = false;
    exports.FORMAT_MINIFY = FORMAT_MINIFY;
    exports.FORMAT_DEFAULTS = FORMAT_DEFAULTS;
  })();
});

// node_modules/estree-walker/src/walker.js
class WalkerBase {
  constructor() {
    this.should_skip = false;
    this.should_remove = false;
    this.replacement = null;
    this.context = {
      skip: () => this.should_skip = true,
      remove: () => this.should_remove = true,
      replace: (node) => this.replacement = node
    };
  }
  replace(parent, prop, index, node) {
    if (parent && prop) {
      if (index != null) {
        parent[prop][index] = node;
      } else {
        parent[prop] = node;
      }
    }
  }
  remove(parent, prop, index) {
    if (parent && prop) {
      if (index !== null && index !== undefined) {
        parent[prop].splice(index, 1);
      } else {
        delete parent[prop];
      }
    }
  }
}

// node_modules/estree-walker/src/sync.js
function isNode(value) {
  return value !== null && typeof value === "object" && "type" in value && typeof value.type === "string";
}
var SyncWalker;
var init_sync = __esm(() => {
  SyncWalker = class SyncWalker extends WalkerBase {
    constructor(enter, leave) {
      super();
      this.should_skip = false;
      this.should_remove = false;
      this.replacement = null;
      this.context = {
        skip: () => this.should_skip = true,
        remove: () => this.should_remove = true,
        replace: (node) => this.replacement = node
      };
      this.enter = enter;
      this.leave = leave;
    }
    visit(node, parent, prop, index) {
      if (node) {
        if (this.enter) {
          const _should_skip = this.should_skip;
          const _should_remove = this.should_remove;
          const _replacement = this.replacement;
          this.should_skip = false;
          this.should_remove = false;
          this.replacement = null;
          this.enter.call(this.context, node, parent, prop, index);
          if (this.replacement) {
            node = this.replacement;
            this.replace(parent, prop, index, node);
          }
          if (this.should_remove) {
            this.remove(parent, prop, index);
          }
          const skipped = this.should_skip;
          const removed = this.should_remove;
          this.should_skip = _should_skip;
          this.should_remove = _should_remove;
          this.replacement = _replacement;
          if (skipped)
            return node;
          if (removed)
            return null;
        }
        let key;
        for (key in node) {
          const value = node[key];
          if (value && typeof value === "object") {
            if (Array.isArray(value)) {
              const nodes = value;
              for (let i = 0;i < nodes.length; i += 1) {
                const item = nodes[i];
                if (isNode(item)) {
                  if (!this.visit(item, node, key, i)) {
                    i--;
                  }
                }
              }
            } else if (isNode(value)) {
              this.visit(value, node, key, null);
            }
          }
        }
        if (this.leave) {
          const _replacement = this.replacement;
          const _should_remove = this.should_remove;
          this.replacement = null;
          this.should_remove = false;
          this.leave.call(this.context, node, parent, prop, index);
          if (this.replacement) {
            node = this.replacement;
            this.replace(parent, prop, index, node);
          }
          if (this.should_remove) {
            this.remove(parent, prop, index);
          }
          const removed = this.should_remove;
          this.replacement = _replacement;
          this.should_remove = _should_remove;
          if (removed)
            return null;
        }
      }
      return node;
    }
  };
});

// node_modules/estree-walker/src/async.js
var init_async = () => {};

// node_modules/estree-walker/src/index.js
function walk(ast, { enter, leave }) {
  const instance = new SyncWalker(enter, leave);
  return instance.visit(ast, null);
}
var init_src = __esm(() => {
  init_sync();
  init_async();
});

// node_modules/@strudel/transpiler/dist/index.mjs
function F3(e, t = {}) {
  const { wrapAsync: n = false, addReturn: a = true, emitMiniLocations: i = true, emitWidgets: p = true } = t, f = [];
  let l = parse2(e, {
    ecmaVersion: 2022,
    allowAwaitOutsideFunction: true,
    locations: true,
    onComment: f
  });
  const m = ce3(f, e.length);
  let c = [];
  const b = (r, x) => {
    const s = E3.get("minilang");
    if (s) {
      const u = `[${r}]`, o = s.getLocations(u, x.start);
      c = c.concat(o);
    } else {
      const u = Yr2(`"${r}"`, x.start, e);
      c = c.concat(u);
    }
  };
  let y = [];
  walk(l, {
    enter(r, x) {
      if (se2(r)) {
        const { name: s } = r.tag, u = E3.get(s), o = r.quasi.quasis[0].value.raw, h = r.quasi.start + 1;
        if (i) {
          const C = u.getLocations(o, h);
          c = c.concat(C);
        }
        return this.skip(), this.replace(ue4(s, o, h));
      }
      if (le2(r, "tidal")) {
        const s = r.quasi.quasis[0].value.raw, u = r.quasi.start + 1;
        if (i) {
          const o = oe3(s, u);
          c = c.concat(o);
        }
        return this.skip(), this.replace(pe3(s, u));
      }
      if (U4(r, x)) {
        if (q3(r.start, m))
          return;
        const { quasis: s } = r, { raw: u } = s[0].value;
        return this.skip(), i && b(u, r), this.replace(T2(u, r));
      }
      if (G2(r)) {
        if (q3(r.start, m))
          return;
        const { value: s } = r;
        return this.skip(), i && b(s, r), this.replace(T2(s, r));
      }
      if (X(r))
        return p && y.push({
          from: r.arguments[0].start,
          to: r.arguments[0].end,
          value: r.arguments[0].raw,
          min: r.arguments[1]?.value ?? 0,
          max: r.arguments[2]?.value ?? 1,
          step: r.arguments[3]?.value,
          type: "slider"
        }), this.replace(Z4(r));
      if (Y3(r)) {
        const s = r.callee.property.name, u = y.filter((h) => h.type === s).length, o = {
          to: r.end,
          index: u,
          type: s,
          id: t.id
        };
        return p && y.push(o), this.replace(te4(r, o));
      }
      if (re3(r, x))
        return this.replace(ne3(r));
      if (ie3(r))
        return this.replace(ae2(r));
    },
    leave(r, x, s, u) {
      if (!R2(r))
        return;
      let [o, ...h] = r.arguments;
      if (!o)
        throw new Error("K(...) requires an expression");
      _2(o) && (o = {
        type: "CallExpression",
        callee: o,
        arguments: [],
        optional: false
      });
      const { template: C, patternExprs: k } = B3(o);
      if (k.length) {
        const d = [{ type: "Literal", value: C }, ...k, ...h];
        let L = r.callee;
        return L.type === "ChainExpression" && (L = L.expression), L.type === "MemberExpression" ? this.replace({
          type: "CallExpression",
          callee: W4(L.object),
          arguments: d,
          optional: false
        }) : this.replace({
          type: "CallExpression",
          callee: { type: "Identifier", name: "worklet" },
          arguments: d,
          optional: false
        });
      }
      const M = [{ type: "Literal", value: S4(o) }, ...h];
      let w = r.callee;
      return w.type === "ChainExpression" && (w = w.expression), w.type === "MemberExpression" ? this.replace({
        type: "CallExpression",
        callee: W4(w.object),
        arguments: M,
        optional: false
      }) : this.replace({
        type: "CallExpression",
        callee: { type: "Identifier", name: "worklet" },
        arguments: M,
        optional: false
      });
    }
  });
  let { body: g } = l;
  if (!g.length)
    console.warn("empty body -> fallback to silence"), g.push({
      type: "ExpressionStatement",
      expression: {
        type: "Identifier",
        name: "silence"
      }
    });
  else if (!g?.[g.length - 1]?.expression)
    throw new Error("unexpected ast format without body expression");
  if (a) {
    const { expression: r } = g[g.length - 1];
    g[g.length - 1] = {
      type: "ReturnStatement",
      argument: r
    };
  }
  let v = import_escodegen.default.generate(l);
  return n && (v = `(async ()=>{${v}})()`), i ? { output: v, miniLocations: c, widgets: y } : { output: v };
}
function R2(e) {
  if (e.type !== "CallExpression")
    return false;
  let t = e.callee;
  return t.type === "ChainExpression" && (t = t.expression), t.type === "MemberExpression" ? !t.computed && t.property?.name === "K" : t.type === "Identifier" && t.name === "K";
}
function _2(e) {
  return e.type !== "ArrowFunctionExpression" && e.type !== "FunctionExpression" || e.params.length ? false : e.body?.type === "BlockStatement";
}
function S4(e) {
  return import_escodegen.default.generate(e, { format: { semicolons: false } });
}
function B3(e) {
  const t = I2(e), n = /* @__PURE__ */ new Map, a = [];
  if (walk(t, {
    enter(l, m, c, b) {
      n.set(l, { parent: m, prop: c, index: b });
      const y = J3(l);
      y && (a.push({ node: l, patternExpr: y }), this.skip());
    }
  }), !a.length)
    return { template: S4(t), patternExprs: [] };
  a.sort((l, m) => A3(l.node) - A3(m.node));
  const i = a.map(({ patternExpr: l }) => I2(l));
  let p = t;
  return a.forEach(({ node: l }, m) => {
    p = z3(l, V3(m), n, p);
  }), { template: S4(p), patternExprs: i };
}
function J3(e) {
  if (H2(e)) {
    const t = e.arguments?.[0];
    if (!t)
      throw new Error("S(...) requires an argument");
    return t;
  }
  return j3(e) ? e : null;
}
function H2(e) {
  if (e.type !== "CallExpression")
    return false;
  const t = e.callee;
  return t.type === "Identifier" ? t.name === "S" : t.type === "MemberExpression" && !t.computed ? t.property?.name === "S" : false;
}
function Q4() {
  return E3.get("minilang")?.name || "m";
}
function j3(e) {
  if (e.type !== "CallExpression")
    return false;
  const t = e.callee;
  if (t.type !== "Identifier" || t.name !== Q4())
    return false;
  const n = e.arguments?.[0];
  return n?.type === "Literal" && typeof n.value == "string";
}
function A3(e) {
  if (typeof e.start == "number")
    return e.start;
  if (j3(e)) {
    const t = e.arguments?.[1];
    if (t?.type === "Literal" && typeof t.value == "number")
      return t.value;
  }
  return 0;
}
function V3(e) {
  return {
    type: "MemberExpression",
    object: { type: "Identifier", name: "pat" },
    property: { type: "Literal", value: e },
    computed: true,
    optional: false
  };
}
function z3(e, t, n, a) {
  const i = n.get(e);
  if (!i || !i.parent)
    return t;
  const { parent: p, prop: f, index: l } = i;
  return Array.isArray(p[f]) ? p[f][l] = t : p[f] = t, n.set(t, { parent: p, prop: f, index: l }), a;
}
function I2(e) {
  return JSON.parse(JSON.stringify(e));
}
function W4(e) {
  return {
    type: "MemberExpression",
    object: e,
    property: { type: "Identifier", name: "worklet" },
    computed: false,
    optional: false
  };
}
function G2(e, t, n) {
  return e.type !== "Literal" ? false : e.raw[0] === '"';
}
function U4(e, t) {
  return e.type === "TemplateLiteral" && t.type !== "TaggedTemplateExpression";
}
function T2(e, t) {
  const { start: n } = t, a = E3.get("minilang");
  let i = "m";
  return a && a.name && (i = a.name), {
    type: "CallExpression",
    callee: {
      type: "Identifier",
      name: i
    },
    arguments: [
      { type: "Literal", value: e },
      { type: "Literal", value: n }
    ],
    optional: false
  };
}
function X(e) {
  return e.type === "CallExpression" && e.callee.name === "slider";
}
function Y3(e) {
  return e.type === "CallExpression" && P3.includes(e.callee.property?.name);
}
function Z4(e) {
  const t = "slider_" + e.arguments[0].start;
  return e.arguments.unshift({
    type: "Literal",
    value: t,
    raw: t
  }), e.callee.name = "sliderWithID", e;
}
function ee4(e) {
  return `${e.id || ""}_widget_${e.type}_${e.index}`;
}
function te4(e, t) {
  const n = ee4(t);
  return e.arguments.unshift({
    type: "Literal",
    value: n,
    raw: n
  }), e;
}
function re3(e, t) {
  return e.type === "CallExpression" && e.callee.name === "samples" && t.type !== "AwaitExpression";
}
function ne3(e) {
  return {
    type: "AwaitExpression",
    argument: e
  };
}
function ie3(e) {
  return e.type === "LabeledStatement";
}
function ae2(e) {
  return {
    type: "ExpressionStatement",
    expression: {
      type: "CallExpression",
      callee: {
        type: "MemberExpression",
        object: e.body.expression,
        property: {
          type: "Identifier",
          name: "p"
        }
      },
      arguments: [
        {
          type: "Literal",
          value: e.label.name,
          raw: `'${e.label.name}'`
        }
      ]
    }
  };
}
function se2(e) {
  return e.type === "TaggedTemplateExpression" && E3.has(e.tag.name);
}
function le2(e, t) {
  return e.type === "TaggedTemplateExpression" && e.tag.name === t;
}
function oe3(e, t) {
  return e.split("").reduce((n, a, i) => (a !== '"' || (!n.length || n[n.length - 1].length > 1 ? n.push([i + 1]) : n[n.length - 1].push(i)), n), []).map(([n, a]) => {
    const i = e.slice(n, a);
    return Yr2(`"${i}"`, t + n - 1);
  }).flat();
}
function pe3(e, t) {
  return {
    type: "CallExpression",
    callee: {
      type: "Identifier",
      name: "tidal"
    },
    arguments: [
      { type: "Literal", value: e },
      { type: "Literal", value: t }
    ],
    optional: false
  };
}
function ue4(e, t, n) {
  return {
    type: "CallExpression",
    callee: {
      type: "Identifier",
      name: e
    },
    arguments: [
      { type: "Literal", value: t },
      { type: "Literal", value: n }
    ],
    optional: false
  };
}
function ce3(e, t) {
  const n = [], a = [];
  for (const i of e) {
    const p = i.value.trim();
    if (p.startsWith("mini-off"))
      a.push(i.start);
    else if (p.startsWith("mini-on")) {
      const f = a.pop();
      n.push([f, i.end]);
    }
  }
  for (;a.length; ) {
    const i = a.pop();
    n.push([i, t]);
  }
  return n;
}
function q3(e, t) {
  for (const [n, a] of t)
    if (e >= n && e < a)
      return true;
  return false;
}
var import_escodegen, P3, E3;
var init_dist4 = __esm(() => {
  init_dist2();
  init_dist3();
  init_acorn();
  init_src();
  import_escodegen = __toESM(require_escodegen(), 1);
  P3 = [];
  E3 = /* @__PURE__ */ new Map;
});

// node_modules/@tonaljs/pitch-distance/node_modules/@tonaljs/pitch/dist/index.js
var require_dist = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var pitch_exports = {};
  __export(pitch_exports, {
    chroma: () => chroma,
    coordinates: () => coordinates,
    height: () => height,
    isNamedPitch: () => isNamedPitch,
    isPitch: () => isPitch,
    midi: () => midi2,
    pitch: () => pitch
  });
  module.exports = __toCommonJS(pitch_exports);
  function isNamedPitch(src) {
    return src !== null && typeof src === "object" && "name" in src && typeof src.name === "string" ? true : false;
  }
  var SIZES = [0, 2, 4, 5, 7, 9, 11];
  var chroma = ({ step, alt }) => (SIZES[step] + alt + 120) % 12;
  var height = ({ step, alt, oct, dir = 1 }) => dir * (SIZES[step] + alt + 12 * (oct === undefined ? -100 : oct));
  var midi2 = (pitch2) => {
    const h = height(pitch2);
    return pitch2.oct !== undefined && h >= -12 && h <= 115 ? h + 12 : null;
  };
  function isPitch(pitch2) {
    return pitch2 !== null && typeof pitch2 === "object" && "step" in pitch2 && typeof pitch2.step === "number" && "alt" in pitch2 && typeof pitch2.alt === "number" && !isNaN(pitch2.step) && !isNaN(pitch2.alt) ? true : false;
  }
  var FIFTHS = [0, 2, 4, -1, 1, 3, 5];
  var STEPS_TO_OCTS = FIFTHS.map((fifths) => Math.floor(fifths * 7 / 12));
  function coordinates(pitch2) {
    const { step, alt, oct, dir = 1 } = pitch2;
    const f = FIFTHS[step] + 7 * alt;
    if (oct === undefined) {
      return [dir * f];
    }
    const o = oct - STEPS_TO_OCTS[step] - 4 * alt;
    return [dir * f, dir * o];
  }
  var FIFTHS_TO_STEPS = [3, 0, 4, 1, 5, 2, 6];
  function pitch(coord) {
    const [f, o, dir] = coord;
    const step = FIFTHS_TO_STEPS[unaltered(f)];
    const alt = Math.floor((f + 1) / 7);
    if (o === undefined) {
      return { step, alt, dir };
    }
    const oct = o + 4 * alt + STEPS_TO_OCTS[step];
    return { step, alt, oct, dir };
  }
  function unaltered(f) {
    const i = (f + 1) % 7;
    return i < 0 ? 7 + i : i;
  }
});

// node_modules/@tonaljs/pitch-distance/node_modules/@tonaljs/pitch-interval/dist/index.js
var require_dist2 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var pitch_interval_exports = {};
  __export(pitch_interval_exports, {
    coordToInterval: () => coordToInterval,
    interval: () => interval,
    tokenizeInterval: () => tokenizeInterval
  });
  module.exports = __toCommonJS(pitch_interval_exports);
  var import_pitch = require_dist();
  var fillStr = (s, n) => Array(Math.abs(n) + 1).join(s);
  var NoInterval = Object.freeze({
    empty: true,
    name: "",
    num: NaN,
    q: "",
    type: "",
    step: NaN,
    alt: NaN,
    dir: NaN,
    simple: NaN,
    semitones: NaN,
    chroma: NaN,
    coord: [],
    oct: NaN
  });
  var INTERVAL_TONAL_REGEX = "([-+]?\\d+)(d{1,4}|m|M|P|A{1,4})";
  var INTERVAL_SHORTHAND_REGEX = "(AA|A|P|M|m|d|dd)([-+]?\\d+)";
  var REGEX = new RegExp("^" + INTERVAL_TONAL_REGEX + "|" + INTERVAL_SHORTHAND_REGEX + "$");
  function tokenizeInterval(str) {
    const m = REGEX.exec(`${str}`);
    if (m === null) {
      return ["", ""];
    }
    return m[1] ? [m[1], m[2]] : [m[4], m[3]];
  }
  var cache = {};
  function interval(src) {
    return typeof src === "string" ? cache[src] || (cache[src] = parse(src)) : (0, import_pitch.isPitch)(src) ? interval(pitchName(src)) : (0, import_pitch.isNamedPitch)(src) ? interval(src.name) : NoInterval;
  }
  var SIZES = [0, 2, 4, 5, 7, 9, 11];
  var TYPES = "PMMPPMM";
  function parse(str) {
    const tokens = tokenizeInterval(str);
    if (tokens[0] === "") {
      return NoInterval;
    }
    const num = +tokens[0];
    const q = tokens[1];
    const step = (Math.abs(num) - 1) % 7;
    const t = TYPES[step];
    if (t === "M" && q === "P") {
      return NoInterval;
    }
    const type = t === "M" ? "majorable" : "perfectable";
    const name = "" + num + q;
    const dir = num < 0 ? -1 : 1;
    const simple = num === 8 || num === -8 ? num : dir * (step + 1);
    const alt = qToAlt(type, q);
    const oct = Math.floor((Math.abs(num) - 1) / 7);
    const semitones = dir * (SIZES[step] + alt + 12 * oct);
    const chroma = (dir * (SIZES[step] + alt) % 12 + 12) % 12;
    const coord = (0, import_pitch.coordinates)({ step, alt, oct, dir });
    return {
      empty: false,
      name,
      num,
      q,
      step,
      alt,
      dir,
      type,
      simple,
      semitones,
      chroma,
      coord,
      oct
    };
  }
  function coordToInterval(coord, forceDescending) {
    const [f, o = 0] = coord;
    const isDescending = f * 7 + o * 12 < 0;
    const ivl = forceDescending || isDescending ? [-f, -o, -1] : [f, o, 1];
    return interval((0, import_pitch.pitch)(ivl));
  }
  function qToAlt(type, q) {
    return q === "M" && type === "majorable" || q === "P" && type === "perfectable" ? 0 : q === "m" && type === "majorable" ? -1 : /^A+$/.test(q) ? q.length : /^d+$/.test(q) ? -1 * (type === "perfectable" ? q.length : q.length + 1) : 0;
  }
  function pitchName(props) {
    const { step, alt, oct = 0, dir } = props;
    if (!dir) {
      return "";
    }
    const calcNum = step + 1 + 7 * oct;
    const num = calcNum === 0 ? step + 1 : calcNum;
    const d = dir < 0 ? "-" : "";
    const type = TYPES[step] === "M" ? "majorable" : "perfectable";
    const name = d + num + altToQ(type, alt);
    return name;
  }
  function altToQ(type, alt) {
    if (alt === 0) {
      return type === "majorable" ? "M" : "P";
    } else if (alt === -1 && type === "majorable") {
      return "m";
    } else if (alt > 0) {
      return fillStr("A", alt);
    } else {
      return fillStr("d", type === "perfectable" ? alt : alt + 1);
    }
  }
});

// node_modules/@tonaljs/pitch-note/node_modules/@tonaljs/pitch/dist/index.js
var require_dist3 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var pitch_exports = {};
  __export(pitch_exports, {
    chroma: () => chroma,
    coordinates: () => coordinates,
    height: () => height,
    isNamedPitch: () => isNamedPitch,
    isPitch: () => isPitch,
    midi: () => midi2,
    pitch: () => pitch
  });
  module.exports = __toCommonJS(pitch_exports);
  function isNamedPitch(src) {
    return src !== null && typeof src === "object" && "name" in src && typeof src.name === "string" ? true : false;
  }
  var SIZES = [0, 2, 4, 5, 7, 9, 11];
  var chroma = ({ step, alt }) => (SIZES[step] + alt + 120) % 12;
  var height = ({ step, alt, oct, dir = 1 }) => dir * (SIZES[step] + alt + 12 * (oct === undefined ? -100 : oct));
  var midi2 = (pitch2) => {
    const h = height(pitch2);
    return pitch2.oct !== undefined && h >= -12 && h <= 115 ? h + 12 : null;
  };
  function isPitch(pitch2) {
    return pitch2 !== null && typeof pitch2 === "object" && "step" in pitch2 && typeof pitch2.step === "number" && "alt" in pitch2 && typeof pitch2.alt === "number" && !isNaN(pitch2.step) && !isNaN(pitch2.alt) ? true : false;
  }
  var FIFTHS = [0, 2, 4, -1, 1, 3, 5];
  var STEPS_TO_OCTS = FIFTHS.map((fifths) => Math.floor(fifths * 7 / 12));
  function coordinates(pitch2) {
    const { step, alt, oct, dir = 1 } = pitch2;
    const f = FIFTHS[step] + 7 * alt;
    if (oct === undefined) {
      return [dir * f];
    }
    const o = oct - STEPS_TO_OCTS[step] - 4 * alt;
    return [dir * f, dir * o];
  }
  var FIFTHS_TO_STEPS = [3, 0, 4, 1, 5, 2, 6];
  function pitch(coord) {
    const [f, o, dir] = coord;
    const step = FIFTHS_TO_STEPS[unaltered(f)];
    const alt = Math.floor((f + 1) / 7);
    if (o === undefined) {
      return { step, alt, dir };
    }
    const oct = o + 4 * alt + STEPS_TO_OCTS[step];
    return { step, alt, oct, dir };
  }
  function unaltered(f) {
    const i = (f + 1) % 7;
    return i < 0 ? 7 + i : i;
  }
});

// node_modules/@tonaljs/pitch-note/dist/index.js
var require_dist4 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod2) => __copyProps(__defProp({}, "__esModule", { value: true }), mod2);
  var pitch_note_exports = {};
  __export(pitch_note_exports, {
    accToAlt: () => accToAlt,
    altToAcc: () => altToAcc,
    coordToNote: () => coordToNote,
    note: () => note,
    stepToLetter: () => stepToLetter,
    tokenizeNote: () => tokenizeNote
  });
  module.exports = __toCommonJS(pitch_note_exports);
  var import_pitch = require_dist3();
  var fillStr = (s, n) => Array(Math.abs(n) + 1).join(s);
  var NoNote = Object.freeze({
    empty: true,
    name: "",
    letter: "",
    acc: "",
    pc: "",
    step: NaN,
    alt: NaN,
    chroma: NaN,
    height: NaN,
    coord: [],
    midi: null,
    freq: null
  });
  var cache = /* @__PURE__ */ new Map;
  var stepToLetter = (step) => "CDEFGAB".charAt(step);
  var altToAcc = (alt) => alt < 0 ? fillStr("b", -alt) : fillStr("#", alt);
  var accToAlt = (acc) => acc[0] === "b" ? -acc.length : acc.length;
  function note(src) {
    const stringSrc = JSON.stringify(src);
    const cached = cache.get(stringSrc);
    if (cached) {
      return cached;
    }
    const value = typeof src === "string" ? parse(src) : (0, import_pitch.isPitch)(src) ? note(pitchName(src)) : (0, import_pitch.isNamedPitch)(src) ? note(src.name) : NoNote;
    cache.set(stringSrc, value);
    return value;
  }
  var REGEX = /^([a-gA-G]?)(#{1,}|b{1,}|x{1,}|)(-?\d*)\s*(.*)$/;
  function tokenizeNote(str) {
    const m = REGEX.exec(str);
    return m ? [m[1].toUpperCase(), m[2].replace(/x/g, "##"), m[3], m[4]] : ["", "", "", ""];
  }
  function coordToNote(noteCoord) {
    return note((0, import_pitch.pitch)(noteCoord));
  }
  var mod = (n, m) => (n % m + m) % m;
  var SEMI = [0, 2, 4, 5, 7, 9, 11];
  function parse(noteName) {
    const tokens = tokenizeNote(noteName);
    if (tokens[0] === "" || tokens[3] !== "") {
      return NoNote;
    }
    const letter = tokens[0];
    const acc = tokens[1];
    const octStr = tokens[2];
    const step = (letter.charCodeAt(0) + 3) % 7;
    const alt = accToAlt(acc);
    const oct = octStr.length ? +octStr : undefined;
    const coord = (0, import_pitch.coordinates)({ step, alt, oct });
    const name = letter + acc + octStr;
    const pc = letter + acc;
    const chroma = (SEMI[step] + alt + 120) % 12;
    const height = oct === undefined ? mod(SEMI[step] + alt, 12) - 12 * 99 : SEMI[step] + alt + 12 * (oct + 1);
    const midi2 = height >= 0 && height <= 127 ? height : null;
    const freq = oct === undefined ? null : Math.pow(2, (height - 69) / 12) * 440;
    return {
      empty: false,
      acc,
      alt,
      chroma,
      coord,
      freq,
      height,
      letter,
      midi: midi2,
      name,
      oct,
      pc,
      step
    };
  }
  function pitchName(props) {
    const { step, alt, oct } = props;
    const letter = stepToLetter(step);
    if (!letter) {
      return "";
    }
    const pc = letter + altToAcc(alt);
    return oct || oct === 0 ? pc + oct : pc;
  }
});

// node_modules/@tonaljs/pitch-distance/dist/index.js
var require_dist5 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var pitch_distance_exports = {};
  __export(pitch_distance_exports, {
    distance: () => distance,
    tonicIntervalsTransposer: () => tonicIntervalsTransposer,
    transpose: () => transpose
  });
  module.exports = __toCommonJS(pitch_distance_exports);
  var import_pitch_interval = require_dist2();
  var import_pitch_note = require_dist4();
  function transpose(noteName, intervalName) {
    const note = (0, import_pitch_note.note)(noteName);
    const intervalCoord = Array.isArray(intervalName) ? intervalName : (0, import_pitch_interval.interval)(intervalName).coord;
    if (note.empty || !intervalCoord || intervalCoord.length < 2) {
      return "";
    }
    const noteCoord = note.coord;
    const tr = noteCoord.length === 1 ? [noteCoord[0] + intervalCoord[0]] : [noteCoord[0] + intervalCoord[0], noteCoord[1] + intervalCoord[1]];
    return (0, import_pitch_note.coordToNote)(tr).name;
  }
  function tonicIntervalsTransposer(intervals, tonic) {
    const len = intervals.length;
    return (normalized) => {
      if (!tonic)
        return "";
      const index = normalized < 0 ? (len - -normalized % len) % len : normalized % len;
      const octaves = Math.floor(normalized / len);
      const root = transpose(tonic, [0, octaves]);
      return transpose(root, intervals[index]);
    };
  }
  function distance(fromNote, toNote) {
    const from = (0, import_pitch_note.note)(fromNote);
    const to = (0, import_pitch_note.note)(toNote);
    if (from.empty || to.empty) {
      return "";
    }
    const fcoord = from.coord;
    const tcoord = to.coord;
    const fifths = tcoord[0] - fcoord[0];
    const octs = fcoord.length === 2 && tcoord.length === 2 ? tcoord[1] - fcoord[1] : -Math.floor(fifths * 7 / 12);
    const forceDescending = to.height === from.height && to.midi !== null && from.oct === to.oct && from.step > to.step;
    return (0, import_pitch_interval.coordToInterval)([fifths, octs], forceDescending).name;
  }
});

// node_modules/@tonaljs/abc-notation/dist/index.js
var require_dist6 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var abc_notation_exports = {};
  __export(abc_notation_exports, {
    abcToScientificNotation: () => abcToScientificNotation,
    default: () => abc_notation_default,
    distance: () => distance,
    scientificToAbcNotation: () => scientificToAbcNotation,
    tokenize: () => tokenize,
    transpose: () => transpose
  });
  module.exports = __toCommonJS(abc_notation_exports);
  var import_pitch_distance = require_dist5();
  var import_pitch_note = require_dist4();
  var fillStr = (character, times) => Array(times + 1).join(character);
  var REGEX = /^(_{1,}|=|\^{1,}|)([abcdefgABCDEFG])([,']*)$/;
  function tokenize(str) {
    const m = REGEX.exec(str);
    if (!m) {
      return ["", "", ""];
    }
    return [m[1], m[2], m[3]];
  }
  function abcToScientificNotation(str) {
    const [acc, letter, oct] = tokenize(str);
    if (letter === "") {
      return "";
    }
    let o = 4;
    for (let i = 0;i < oct.length; i++) {
      o += oct.charAt(i) === "," ? -1 : 1;
    }
    const a = acc[0] === "_" ? acc.replace(/_/g, "b") : acc[0] === "^" ? acc.replace(/\^/g, "#") : "";
    return letter.charCodeAt(0) > 96 ? letter.toUpperCase() + a + (o + 1) : letter + a + o;
  }
  function scientificToAbcNotation(str) {
    const n = (0, import_pitch_note.note)(str);
    if (n.empty || !n.oct && n.oct !== 0) {
      return "";
    }
    const { letter, acc, oct } = n;
    const a = acc[0] === "b" ? acc.replace(/b/g, "_") : acc.replace(/#/g, "^");
    const l = oct > 4 ? letter.toLowerCase() : letter;
    const o = oct === 5 ? "" : oct > 4 ? fillStr("'", oct - 5) : fillStr(",", 4 - oct);
    return a + l + o;
  }
  function transpose(note2, interval) {
    return scientificToAbcNotation((0, import_pitch_distance.transpose)(abcToScientificNotation(note2), interval));
  }
  function distance(from, to) {
    return (0, import_pitch_distance.distance)(abcToScientificNotation(from), abcToScientificNotation(to));
  }
  var abc_notation_default = {
    abcToScientificNotation,
    scientificToAbcNotation,
    tokenize,
    transpose,
    distance
  };
});

// node_modules/@tonaljs/array/dist/index.js
var require_dist7 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var array_exports = {};
  __export(array_exports, {
    compact: () => compact,
    permutations: () => permutations,
    range: () => range,
    rotate: () => rotate,
    shuffle: () => shuffle,
    sortedNoteNames: () => sortedNoteNames,
    sortedUniqNoteNames: () => sortedUniqNoteNames
  });
  module.exports = __toCommonJS(array_exports);
  var import_pitch_note = require_dist4();
  function ascR(b, n) {
    const a = [];
    for (;n--; a[n] = n + b)
      ;
    return a;
  }
  function descR(b, n) {
    const a = [];
    for (;n--; a[n] = b - n)
      ;
    return a;
  }
  function range(from, to) {
    return from < to ? ascR(from, to - from + 1) : descR(from, from - to + 1);
  }
  function rotate(times, arr) {
    const len = arr.length;
    const n = (times % len + len) % len;
    return arr.slice(n, len).concat(arr.slice(0, n));
  }
  function compact(arr) {
    return arr.filter((n) => n === 0 || n);
  }
  function sortedNoteNames(notes) {
    const valid = notes.map((n) => (0, import_pitch_note.note)(n)).filter((n) => !n.empty);
    return valid.sort((a, b) => a.height - b.height).map((n) => n.name);
  }
  function sortedUniqNoteNames(arr) {
    return sortedNoteNames(arr).filter((n, i, a) => i === 0 || n !== a[i - 1]);
  }
  function shuffle(arr, rnd = Math.random) {
    let i;
    let t;
    let m = arr.length;
    while (m) {
      i = Math.floor(rnd() * m--);
      t = arr[m];
      arr[m] = arr[i];
      arr[i] = t;
    }
    return arr;
  }
  function permutations(arr) {
    if (arr.length === 0) {
      return [[]];
    }
    return permutations(arr.slice(1)).reduce((acc, perm) => {
      return acc.concat(arr.map((e, pos) => {
        const newPerm = perm.slice();
        newPerm.splice(pos, 0, arr[0]);
        return newPerm;
      }));
    }, []);
  }
});

// node_modules/@tonaljs/collection/dist/index.js
var require_dist8 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var collection_exports = {};
  __export(collection_exports, {
    compact: () => compact,
    default: () => collection_default,
    permutations: () => permutations,
    range: () => range,
    rotate: () => rotate,
    shuffle: () => shuffle
  });
  module.exports = __toCommonJS(collection_exports);
  function ascR(b, n) {
    const a = [];
    for (;n--; a[n] = n + b)
      ;
    return a;
  }
  function descR(b, n) {
    const a = [];
    for (;n--; a[n] = b - n)
      ;
    return a;
  }
  function range(from, to) {
    return from < to ? ascR(from, to - from + 1) : descR(from, from - to + 1);
  }
  function rotate(times, arr) {
    const len = arr.length;
    const n = (times % len + len) % len;
    return arr.slice(n, len).concat(arr.slice(0, n));
  }
  function compact(arr) {
    return arr.filter((n) => n === 0 || n);
  }
  function shuffle(arr, rnd = Math.random) {
    let i;
    let t;
    let m = arr.length;
    while (m) {
      i = Math.floor(rnd() * m--);
      t = arr[m];
      arr[m] = arr[i];
      arr[i] = t;
    }
    return arr;
  }
  function permutations(arr) {
    if (arr.length === 0) {
      return [[]];
    }
    return permutations(arr.slice(1)).reduce((acc, perm) => {
      return acc.concat(arr.map((e, pos) => {
        const newPerm = perm.slice();
        newPerm.splice(pos, 0, arr[0]);
        return newPerm;
      }));
    }, []);
  }
  var collection_default = {
    compact,
    permutations,
    range,
    rotate,
    shuffle
  };
});

// node_modules/@tonaljs/pcset/node_modules/@tonaljs/pitch/dist/index.js
var require_dist9 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var pitch_exports = {};
  __export(pitch_exports, {
    chroma: () => chroma,
    coordinates: () => coordinates,
    height: () => height,
    isNamedPitch: () => isNamedPitch,
    isPitch: () => isPitch,
    midi: () => midi2,
    pitch: () => pitch
  });
  module.exports = __toCommonJS(pitch_exports);
  function isNamedPitch(src) {
    return src !== null && typeof src === "object" && "name" in src && typeof src.name === "string" ? true : false;
  }
  var SIZES = [0, 2, 4, 5, 7, 9, 11];
  var chroma = ({ step, alt }) => (SIZES[step] + alt + 120) % 12;
  var height = ({ step, alt, oct, dir = 1 }) => dir * (SIZES[step] + alt + 12 * (oct === undefined ? -100 : oct));
  var midi2 = (pitch2) => {
    const h = height(pitch2);
    return pitch2.oct !== undefined && h >= -12 && h <= 115 ? h + 12 : null;
  };
  function isPitch(pitch2) {
    return pitch2 !== null && typeof pitch2 === "object" && "step" in pitch2 && typeof pitch2.step === "number" && "alt" in pitch2 && typeof pitch2.alt === "number" && !isNaN(pitch2.step) && !isNaN(pitch2.alt) ? true : false;
  }
  var FIFTHS = [0, 2, 4, -1, 1, 3, 5];
  var STEPS_TO_OCTS = FIFTHS.map((fifths) => Math.floor(fifths * 7 / 12));
  function coordinates(pitch2) {
    const { step, alt, oct, dir = 1 } = pitch2;
    const f = FIFTHS[step] + 7 * alt;
    if (oct === undefined) {
      return [dir * f];
    }
    const o = oct - STEPS_TO_OCTS[step] - 4 * alt;
    return [dir * f, dir * o];
  }
  var FIFTHS_TO_STEPS = [3, 0, 4, 1, 5, 2, 6];
  function pitch(coord) {
    const [f, o, dir] = coord;
    const step = FIFTHS_TO_STEPS[unaltered(f)];
    const alt = Math.floor((f + 1) / 7);
    if (o === undefined) {
      return { step, alt, dir };
    }
    const oct = o + 4 * alt + STEPS_TO_OCTS[step];
    return { step, alt, oct, dir };
  }
  function unaltered(f) {
    const i = (f + 1) % 7;
    return i < 0 ? 7 + i : i;
  }
});

// node_modules/@tonaljs/pcset/node_modules/@tonaljs/pitch-interval/dist/index.js
var require_dist10 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var pitch_interval_exports = {};
  __export(pitch_interval_exports, {
    coordToInterval: () => coordToInterval,
    interval: () => interval,
    tokenizeInterval: () => tokenizeInterval
  });
  module.exports = __toCommonJS(pitch_interval_exports);
  var import_pitch = require_dist9();
  var fillStr = (s, n) => Array(Math.abs(n) + 1).join(s);
  var NoInterval = Object.freeze({
    empty: true,
    name: "",
    num: NaN,
    q: "",
    type: "",
    step: NaN,
    alt: NaN,
    dir: NaN,
    simple: NaN,
    semitones: NaN,
    chroma: NaN,
    coord: [],
    oct: NaN
  });
  var INTERVAL_TONAL_REGEX = "([-+]?\\d+)(d{1,4}|m|M|P|A{1,4})";
  var INTERVAL_SHORTHAND_REGEX = "(AA|A|P|M|m|d|dd)([-+]?\\d+)";
  var REGEX = new RegExp("^" + INTERVAL_TONAL_REGEX + "|" + INTERVAL_SHORTHAND_REGEX + "$");
  function tokenizeInterval(str) {
    const m = REGEX.exec(`${str}`);
    if (m === null) {
      return ["", ""];
    }
    return m[1] ? [m[1], m[2]] : [m[4], m[3]];
  }
  var cache = {};
  function interval(src) {
    return typeof src === "string" ? cache[src] || (cache[src] = parse(src)) : (0, import_pitch.isPitch)(src) ? interval(pitchName(src)) : (0, import_pitch.isNamedPitch)(src) ? interval(src.name) : NoInterval;
  }
  var SIZES = [0, 2, 4, 5, 7, 9, 11];
  var TYPES = "PMMPPMM";
  function parse(str) {
    const tokens = tokenizeInterval(str);
    if (tokens[0] === "") {
      return NoInterval;
    }
    const num = +tokens[0];
    const q = tokens[1];
    const step = (Math.abs(num) - 1) % 7;
    const t = TYPES[step];
    if (t === "M" && q === "P") {
      return NoInterval;
    }
    const type = t === "M" ? "majorable" : "perfectable";
    const name = "" + num + q;
    const dir = num < 0 ? -1 : 1;
    const simple = num === 8 || num === -8 ? num : dir * (step + 1);
    const alt = qToAlt(type, q);
    const oct = Math.floor((Math.abs(num) - 1) / 7);
    const semitones = dir * (SIZES[step] + alt + 12 * oct);
    const chroma = (dir * (SIZES[step] + alt) % 12 + 12) % 12;
    const coord = (0, import_pitch.coordinates)({ step, alt, oct, dir });
    return {
      empty: false,
      name,
      num,
      q,
      step,
      alt,
      dir,
      type,
      simple,
      semitones,
      chroma,
      coord,
      oct
    };
  }
  function coordToInterval(coord, forceDescending) {
    const [f, o = 0] = coord;
    const isDescending = f * 7 + o * 12 < 0;
    const ivl = forceDescending || isDescending ? [-f, -o, -1] : [f, o, 1];
    return interval((0, import_pitch.pitch)(ivl));
  }
  function qToAlt(type, q) {
    return q === "M" && type === "majorable" || q === "P" && type === "perfectable" ? 0 : q === "m" && type === "majorable" ? -1 : /^A+$/.test(q) ? q.length : /^d+$/.test(q) ? -1 * (type === "perfectable" ? q.length : q.length + 1) : 0;
  }
  function pitchName(props) {
    const { step, alt, oct = 0, dir } = props;
    if (!dir) {
      return "";
    }
    const calcNum = step + 1 + 7 * oct;
    const num = calcNum === 0 ? step + 1 : calcNum;
    const d = dir < 0 ? "-" : "";
    const type = TYPES[step] === "M" ? "majorable" : "perfectable";
    const name = d + num + altToQ(type, alt);
    return name;
  }
  function altToQ(type, alt) {
    if (alt === 0) {
      return type === "majorable" ? "M" : "P";
    } else if (alt === -1 && type === "majorable") {
      return "m";
    } else if (alt > 0) {
      return fillStr("A", alt);
    } else {
      return fillStr("d", type === "perfectable" ? alt : alt + 1);
    }
  }
});

// node_modules/@tonaljs/pcset/dist/index.js
var require_dist11 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var pcset_exports = {};
  __export(pcset_exports, {
    EmptyPcset: () => EmptyPcset,
    chroma: () => chroma,
    chromas: () => chromas,
    default: () => pcset_default,
    filter: () => filter,
    get: () => get,
    includes: () => includes,
    intervals: () => intervals,
    isChroma: () => isChroma,
    isEqual: () => isEqual,
    isNoteIncludedIn: () => isNoteIncludedIn,
    isSubsetOf: () => isSubsetOf,
    isSupersetOf: () => isSupersetOf,
    modes: () => modes,
    notes: () => notes,
    num: () => num,
    pcset: () => pcset
  });
  module.exports = __toCommonJS(pcset_exports);
  var import_collection = require_dist8();
  var import_pitch_distance = require_dist5();
  var import_pitch_interval = require_dist10();
  var import_pitch_note = require_dist4();
  var EmptyPcset = {
    empty: true,
    name: "",
    setNum: 0,
    chroma: "000000000000",
    normalized: "000000000000",
    intervals: []
  };
  var setNumToChroma = (num2) => Number(num2).toString(2).padStart(12, "0");
  var chromaToNumber = (chroma2) => parseInt(chroma2, 2);
  var REGEX = /^[01]{12}$/;
  function isChroma(set) {
    return REGEX.test(set);
  }
  var isPcsetNum = (set) => typeof set === "number" && set >= 0 && set <= 4095;
  var isPcset = (set) => set && isChroma(set.chroma);
  var cache = { [EmptyPcset.chroma]: EmptyPcset };
  function get(src) {
    const chroma2 = isChroma(src) ? src : isPcsetNum(src) ? setNumToChroma(src) : Array.isArray(src) ? listToChroma(src) : isPcset(src) ? src.chroma : EmptyPcset.chroma;
    return cache[chroma2] = cache[chroma2] || chromaToPcset(chroma2);
  }
  var pcset = get;
  var chroma = (set) => get(set).chroma;
  var intervals = (set) => get(set).intervals;
  var num = (set) => get(set).setNum;
  var IVLS = [
    "1P",
    "2m",
    "2M",
    "3m",
    "3M",
    "4P",
    "5d",
    "5P",
    "6m",
    "6M",
    "7m",
    "7M"
  ];
  function chromaToIntervals(chroma2) {
    const intervals2 = [];
    for (let i = 0;i < 12; i++) {
      if (chroma2.charAt(i) === "1")
        intervals2.push(IVLS[i]);
    }
    return intervals2;
  }
  function notes(set) {
    return get(set).intervals.map((ivl) => (0, import_pitch_distance.transpose)("C", ivl));
  }
  function chromas() {
    return (0, import_collection.range)(2048, 4095).map(setNumToChroma);
  }
  function modes(set, normalize = true) {
    const pcs = get(set);
    const binary = pcs.chroma.split("");
    return (0, import_collection.compact)(binary.map((_, i) => {
      const r = (0, import_collection.rotate)(i, binary);
      return normalize && r[0] === "0" ? null : r.join("");
    }));
  }
  function isEqual(s1, s2) {
    return get(s1).setNum === get(s2).setNum;
  }
  function isSubsetOf(set) {
    const s = get(set).setNum;
    return (notes2) => {
      const o = get(notes2).setNum;
      return s && s !== o && (o & s) === o;
    };
  }
  function isSupersetOf(set) {
    const s = get(set).setNum;
    return (notes2) => {
      const o = get(notes2).setNum;
      return s && s !== o && (o | s) === o;
    };
  }
  function isNoteIncludedIn(set) {
    const s = get(set);
    return (noteName) => {
      const n = (0, import_pitch_note.note)(noteName);
      return s && !n.empty && s.chroma.charAt(n.chroma) === "1";
    };
  }
  var includes = isNoteIncludedIn;
  function filter(set) {
    const isIncluded = isNoteIncludedIn(set);
    return (notes2) => {
      return notes2.filter(isIncluded);
    };
  }
  var pcset_default = {
    get,
    chroma,
    num,
    intervals,
    chromas,
    isSupersetOf,
    isSubsetOf,
    isNoteIncludedIn,
    isEqual,
    filter,
    modes,
    notes,
    pcset
  };
  function chromaRotations(chroma2) {
    const binary = chroma2.split("");
    return binary.map((_, i) => (0, import_collection.rotate)(i, binary).join(""));
  }
  function chromaToPcset(chroma2) {
    const setNum = chromaToNumber(chroma2);
    const normalizedNum = chromaRotations(chroma2).map(chromaToNumber).filter((n) => n >= 2048).sort()[0];
    const normalized = setNumToChroma(normalizedNum);
    const intervals2 = chromaToIntervals(chroma2);
    return {
      empty: false,
      name: "",
      setNum,
      chroma: chroma2,
      normalized,
      intervals: intervals2
    };
  }
  function listToChroma(set) {
    if (set.length === 0) {
      return EmptyPcset.chroma;
    }
    let pitch;
    const binary = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0;i < set.length; i++) {
      pitch = (0, import_pitch_note.note)(set[i]);
      if (pitch.empty)
        pitch = (0, import_pitch_interval.interval)(set[i]);
      if (!pitch.empty)
        binary[pitch.chroma] = 1;
    }
    return binary.join("");
  }
});

// node_modules/@tonaljs/chord-detect/node_modules/@tonaljs/chord-type/dist/index.js
var require_dist12 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all2) => {
    for (var name in all2)
      __defProp(target, name, { get: all2[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var chord_type_exports = {};
  __export(chord_type_exports, {
    add: () => add2,
    addAlias: () => addAlias,
    all: () => all,
    chordType: () => chordType,
    default: () => chord_type_default,
    entries: () => entries,
    get: () => get,
    keys: () => keys,
    names: () => names,
    removeAll: () => removeAll,
    symbols: () => symbols
  });
  module.exports = __toCommonJS(chord_type_exports);
  var import_pcset = require_dist11();
  var CHORDS = [
    ["1P 3M 5P", "major", "M ^  maj"],
    ["1P 3M 5P 7M", "major seventh", "maj7 \u0394 ma7 M7 Maj7 ^7"],
    ["1P 3M 5P 7M 9M", "major ninth", "maj9 \u03949 ^9"],
    ["1P 3M 5P 7M 9M 13M", "major thirteenth", "maj13 Maj13 ^13"],
    ["1P 3M 5P 6M", "sixth", "6 add6 add13 M6"],
    ["1P 3M 5P 6M 9M", "sixth added ninth", "6add9 6/9 69 M69"],
    ["1P 3M 6m 7M", "major seventh flat sixth", "M7b6 ^7b6"],
    [
      "1P 3M 5P 7M 11A",
      "major seventh sharp eleventh",
      "maj#4 \u0394#4 \u0394#11 M7#11 ^7#11 maj7#11"
    ],
    ["1P 3m 5P", "minor", "m min -"],
    ["1P 3m 5P 7m", "minor seventh", "m7 min7 mi7 -7"],
    [
      "1P 3m 5P 7M",
      "minor/major seventh",
      "m/ma7 m/maj7 mM7 mMaj7 m/M7 -\u03947 m\u0394 -^7 -maj7"
    ],
    ["1P 3m 5P 6M", "minor sixth", "m6 -6"],
    ["1P 3m 5P 7m 9M", "minor ninth", "m9 -9"],
    ["1P 3m 5P 7M 9M", "minor/major ninth", "mM9 mMaj9 -^9"],
    ["1P 3m 5P 7m 9M 11P", "minor eleventh", "m11 -11"],
    ["1P 3m 5P 7m 9M 13M", "minor thirteenth", "m13 -13"],
    ["1P 3m 5d", "diminished", "dim \xB0 o"],
    ["1P 3m 5d 7d", "diminished seventh", "dim7 \xB07 o7"],
    ["1P 3m 5d 7m", "half-diminished", "m7b5 \xF8 -7b5 h7 h"],
    ["1P 3M 5P 7m", "dominant seventh", "7 dom"],
    ["1P 3M 5P 7m 9M", "dominant ninth", "9"],
    ["1P 3M 5P 7m 9M 13M", "dominant thirteenth", "13"],
    ["1P 3M 5P 7m 11A", "lydian dominant seventh", "7#11 7#4"],
    ["1P 3M 5P 7m 9m", "dominant flat ninth", "7b9"],
    ["1P 3M 5P 7m 9A", "dominant sharp ninth", "7#9"],
    ["1P 3M 7m 9m", "altered", "alt7"],
    ["1P 4P 5P", "suspended fourth", "sus4 sus"],
    ["1P 2M 5P", "suspended second", "sus2"],
    ["1P 4P 5P 7m", "suspended fourth seventh", "7sus4 7sus"],
    ["1P 5P 7m 9M 11P", "eleventh", "11"],
    [
      "1P 4P 5P 7m 9m",
      "suspended fourth flat ninth",
      "b9sus phryg 7b9sus 7b9sus4"
    ],
    ["1P 5P", "fifth", "5"],
    ["1P 3M 5A", "augmented", "aug + +5 ^#5"],
    ["1P 3m 5A", "minor augmented", "m#5 -#5 m+"],
    ["1P 3M 5A 7M", "augmented seventh", "maj7#5 maj7+5 +maj7 ^7#5"],
    [
      "1P 3M 5P 7M 9M 11A",
      "major sharp eleventh (lydian)",
      "maj9#11 \u03949#11 ^9#11"
    ],
    ["1P 2M 4P 5P", "", "sus24 sus4add9"],
    ["1P 3M 5A 7M 9M", "", "maj9#5 Maj9#5"],
    ["1P 3M 5A 7m", "", "7#5 +7 7+ 7aug aug7"],
    ["1P 3M 5A 7m 9A", "", "7#5#9 7#9#5 7alt"],
    ["1P 3M 5A 7m 9M", "", "9#5 9+"],
    ["1P 3M 5A 7m 9M 11A", "", "9#5#11"],
    ["1P 3M 5A 7m 9m", "", "7#5b9 7b9#5"],
    ["1P 3M 5A 7m 9m 11A", "", "7#5b9#11"],
    ["1P 3M 5A 9A", "", "+add#9"],
    ["1P 3M 5A 9M", "", "M#5add9 +add9"],
    ["1P 3M 5P 6M 11A", "", "M6#11 M6b5 6#11 6b5"],
    ["1P 3M 5P 6M 7M 9M", "", "M7add13"],
    ["1P 3M 5P 6M 9M 11A", "", "69#11"],
    ["1P 3m 5P 6M 9M", "", "m69 -69"],
    ["1P 3M 5P 6m 7m", "", "7b6"],
    ["1P 3M 5P 7M 9A 11A", "", "maj7#9#11"],
    ["1P 3M 5P 7M 9M 11A 13M", "", "M13#11 maj13#11 M13+4 M13#4"],
    ["1P 3M 5P 7M 9m", "", "M7b9"],
    ["1P 3M 5P 7m 11A 13m", "", "7#11b13 7b5b13"],
    ["1P 3M 5P 7m 13M", "", "7add6 67 7add13"],
    ["1P 3M 5P 7m 9A 11A", "", "7#9#11 7b5#9 7#9b5"],
    ["1P 3M 5P 7m 9A 11A 13M", "", "13#9#11"],
    ["1P 3M 5P 7m 9A 11A 13m", "", "7#9#11b13"],
    ["1P 3M 5P 7m 9A 13M", "", "13#9"],
    ["1P 3M 5P 7m 9A 13m", "", "7#9b13"],
    ["1P 3M 5P 7m 9M 11A", "", "9#11 9+4 9#4"],
    ["1P 3M 5P 7m 9M 11A 13M", "", "13#11 13+4 13#4"],
    ["1P 3M 5P 7m 9M 11A 13m", "", "9#11b13 9b5b13"],
    ["1P 3M 5P 7m 9m 11A", "", "7b9#11 7b5b9 7b9b5"],
    ["1P 3M 5P 7m 9m 11A 13M", "", "13b9#11"],
    ["1P 3M 5P 7m 9m 11A 13m", "", "7b9b13#11 7b9#11b13 7b5b9b13"],
    ["1P 3M 5P 7m 9m 13M", "", "13b9"],
    ["1P 3M 5P 7m 9m 13m", "", "7b9b13"],
    ["1P 3M 5P 7m 9m 9A", "", "7b9#9"],
    ["1P 3M 5P 9M", "", "Madd9 2 add9 add2"],
    ["1P 3M 5P 9m", "", "Maddb9"],
    ["1P 3M 5d", "", "Mb5"],
    ["1P 3M 5d 6M 7m 9M", "", "13b5"],
    ["1P 3M 5d 7M", "", "M7b5"],
    ["1P 3M 5d 7M 9M", "", "M9b5"],
    ["1P 3M 5d 7m", "", "7b5"],
    ["1P 3M 5d 7m 9M", "", "9b5"],
    ["1P 3M 7m", "", "7no5"],
    ["1P 3M 7m 13m", "", "7b13"],
    ["1P 3M 7m 9M", "", "9no5"],
    ["1P 3M 7m 9M 13M", "", "13no5"],
    ["1P 3M 7m 9M 13m", "", "9b13"],
    ["1P 3m 4P 5P", "", "madd4"],
    ["1P 3m 5P 6m 7M", "", "mMaj7b6"],
    ["1P 3m 5P 6m 7M 9M", "", "mMaj9b6"],
    ["1P 3m 5P 7m 11P", "", "m7add11 m7add4"],
    ["1P 3m 5P 9M", "", "madd9"],
    ["1P 3m 5d 6M 7M", "", "o7M7"],
    ["1P 3m 5d 7M", "", "oM7"],
    ["1P 3m 6m 7M", "", "mb6M7"],
    ["1P 3m 6m 7m", "", "m7#5"],
    ["1P 3m 6m 7m 9M", "", "m9#5"],
    ["1P 3m 5A 7m 9M 11P", "", "m11A"],
    ["1P 3m 6m 9m", "", "mb6b9"],
    ["1P 2M 3m 5d 7m", "", "m9b5"],
    ["1P 4P 5A 7M", "", "M7#5sus4"],
    ["1P 4P 5A 7M 9M", "", "M9#5sus4"],
    ["1P 4P 5A 7m", "", "7#5sus4"],
    ["1P 4P 5P 7M", "", "M7sus4"],
    ["1P 4P 5P 7M 9M", "", "M9sus4"],
    ["1P 4P 5P 7m 9M", "", "9sus4 9sus"],
    ["1P 4P 5P 7m 9M 13M", "", "13sus4 13sus"],
    ["1P 4P 5P 7m 9m 13m", "", "7sus4b9b13 7b9b13sus4"],
    ["1P 4P 7m 10m", "", "4 quartal"],
    ["1P 5P 7m 9m 11P", "", "11b9"]
  ];
  var data_default = CHORDS;
  var NoChordType = {
    ...import_pcset.EmptyPcset,
    name: "",
    quality: "Unknown",
    intervals: [],
    aliases: []
  };
  var dictionary = [];
  var index = {};
  function get(type) {
    return index[type] || NoChordType;
  }
  var chordType = get;
  function names() {
    return dictionary.map((chord) => chord.name).filter((x) => x);
  }
  function symbols() {
    return dictionary.map((chord) => chord.aliases[0]).filter((x) => x);
  }
  function keys() {
    return Object.keys(index);
  }
  function all() {
    return dictionary.slice();
  }
  var entries = all;
  function removeAll() {
    dictionary = [];
    index = {};
  }
  function add2(intervals, aliases, fullName) {
    const quality = getQuality(intervals);
    const chord = {
      ...(0, import_pcset.get)(intervals),
      name: fullName || "",
      quality,
      intervals,
      aliases
    };
    dictionary.push(chord);
    if (chord.name) {
      index[chord.name] = chord;
    }
    index[chord.setNum] = chord;
    index[chord.chroma] = chord;
    chord.aliases.forEach((alias) => addAlias(chord, alias));
  }
  function addAlias(chord, alias) {
    index[alias] = chord;
  }
  function getQuality(intervals) {
    const has = (interval) => intervals.indexOf(interval) !== -1;
    return has("5A") ? "Augmented" : has("3M") ? "Major" : has("5d") ? "Diminished" : has("3m") ? "Minor" : "Unknown";
  }
  data_default.forEach(([ivls, fullName, names2]) => add2(ivls.split(" "), names2.split(" "), fullName));
  dictionary.sort((a, b) => a.setNum - b.setNum);
  var chord_type_default = {
    names,
    symbols,
    get,
    all,
    add: add2,
    removeAll,
    keys,
    entries,
    chordType
  };
});

// node_modules/@tonaljs/chord-detect/dist/index.js
var require_dist13 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all2) => {
    for (var name in all2)
      __defProp(target, name, { get: all2[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var chord_detect_exports = {};
  __export(chord_detect_exports, {
    default: () => chord_detect_default,
    detect: () => detect2
  });
  module.exports = __toCommonJS(chord_detect_exports);
  var import_chord_type = require_dist12();
  var import_pcset = require_dist11();
  var import_pitch_note = require_dist4();
  var namedSet = (notes) => {
    const pcToName = notes.reduce((record, n) => {
      const chroma = (0, import_pitch_note.note)(n).chroma;
      if (chroma !== undefined) {
        record[chroma] = record[chroma] || (0, import_pitch_note.note)(n).name;
      }
      return record;
    }, {});
    return (chroma) => pcToName[chroma];
  };
  function detect2(source, options = {}) {
    const notes = source.map((n) => (0, import_pitch_note.note)(n).pc).filter((x) => x);
    if (import_pitch_note.note.length === 0) {
      return [];
    }
    const found = findMatches(notes, 1, options);
    return found.filter((chord) => chord.weight).sort((a, b) => b.weight - a.weight).map((chord) => chord.name);
  }
  var BITMASK = {
    anyThirds: 384,
    perfectFifth: 16,
    nonPerfectFifths: 40,
    anySeventh: 3
  };
  var testChromaNumber = (bitmask) => (chromaNumber) => Boolean(chromaNumber & bitmask);
  var hasAnyThird = testChromaNumber(BITMASK.anyThirds);
  var hasPerfectFifth = testChromaNumber(BITMASK.perfectFifth);
  var hasAnySeventh = testChromaNumber(BITMASK.anySeventh);
  var hasNonPerfectFifth = testChromaNumber(BITMASK.nonPerfectFifths);
  function hasAnyThirdAndPerfectFifthAndAnySeventh(chordType) {
    const chromaNumber = parseInt(chordType.chroma, 2);
    return hasAnyThird(chromaNumber) && hasPerfectFifth(chromaNumber) && hasAnySeventh(chromaNumber);
  }
  function withPerfectFifth(chroma) {
    const chromaNumber = parseInt(chroma, 2);
    return hasNonPerfectFifth(chromaNumber) ? chroma : (chromaNumber | 16).toString(2);
  }
  function findMatches(notes, weight, options) {
    const tonic = notes[0];
    const tonicChroma = (0, import_pitch_note.note)(tonic).chroma;
    const noteName = namedSet(notes);
    const allModes = (0, import_pcset.modes)(notes, false);
    const found = [];
    allModes.forEach((mode, index) => {
      const modeWithPerfectFifth = options.assumePerfectFifth && withPerfectFifth(mode);
      const chordTypes = (0, import_chord_type.all)().filter((chordType) => {
        if (options.assumePerfectFifth && hasAnyThirdAndPerfectFifthAndAnySeventh(chordType)) {
          return chordType.chroma === modeWithPerfectFifth;
        }
        return chordType.chroma === mode;
      });
      chordTypes.forEach((chordType) => {
        const chordName = chordType.aliases[0];
        const baseNote = noteName(index);
        const isInversion = index !== tonicChroma;
        if (isInversion) {
          found.push({
            weight: 0.5 * weight,
            name: `${baseNote}${chordName}/${tonic}`
          });
        } else {
          found.push({ weight: 1 * weight, name: `${baseNote}${chordName}` });
        }
      });
    });
    return found;
  }
  var chord_detect_default = { detect: detect2 };
});

// node_modules/@tonaljs/pitch/dist/index.js
var require_dist14 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var pitch_exports = {};
  __export(pitch_exports, {
    chroma: () => chroma,
    coordinates: () => coordinates,
    height: () => height,
    isNamedPitch: () => isNamedPitch,
    isPitch: () => isPitch,
    midi: () => midi2,
    pitch: () => pitch
  });
  module.exports = __toCommonJS(pitch_exports);
  function isNamedPitch(src) {
    return src !== null && typeof src === "object" && "name" in src && typeof src.name === "string" ? true : false;
  }
  var SIZES = [0, 2, 4, 5, 7, 9, 11];
  var chroma = ({ step, alt }) => (SIZES[step] + alt + 120) % 12;
  var height = ({ step, alt, oct, dir = 1 }) => dir * (SIZES[step] + alt + 12 * (oct === undefined ? -100 : oct));
  var midi2 = (pitch2) => {
    const h = height(pitch2);
    return pitch2.oct !== undefined && h >= -12 && h <= 115 ? h + 12 : null;
  };
  function isPitch(pitch2) {
    return pitch2 !== null && typeof pitch2 === "object" && "step" in pitch2 && typeof pitch2.step === "number" && "alt" in pitch2 && typeof pitch2.alt === "number" ? true : false;
  }
  var FIFTHS = [0, 2, 4, -1, 1, 3, 5];
  var STEPS_TO_OCTS = FIFTHS.map((fifths) => Math.floor(fifths * 7 / 12));
  function coordinates(pitch2) {
    const { step, alt, oct, dir = 1 } = pitch2;
    const f = FIFTHS[step] + 7 * alt;
    if (oct === undefined) {
      return [dir * f];
    }
    const o = oct - STEPS_TO_OCTS[step] - 4 * alt;
    return [dir * f, dir * o];
  }
  var FIFTHS_TO_STEPS = [3, 0, 4, 1, 5, 2, 6];
  function pitch(coord) {
    const [f, o, dir] = coord;
    const step = FIFTHS_TO_STEPS[unaltered(f)];
    const alt = Math.floor((f + 1) / 7);
    if (o === undefined) {
      return { step, alt, dir };
    }
    const oct = o + 4 * alt + STEPS_TO_OCTS[step];
    return { step, alt, oct, dir };
  }
  function unaltered(f) {
    const i = (f + 1) % 7;
    return i < 0 ? 7 + i : i;
  }
});

// node_modules/@tonaljs/pitch-interval/dist/index.js
var require_dist15 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var pitch_interval_exports = {};
  __export(pitch_interval_exports, {
    coordToInterval: () => coordToInterval,
    interval: () => interval,
    tokenizeInterval: () => tokenizeInterval
  });
  module.exports = __toCommonJS(pitch_interval_exports);
  var import_pitch = require_dist14();
  var fillStr = (s, n) => Array(Math.abs(n) + 1).join(s);
  var NoInterval = { empty: true, name: "", acc: "" };
  var INTERVAL_TONAL_REGEX = "([-+]?\\d+)(d{1,4}|m|M|P|A{1,4})";
  var INTERVAL_SHORTHAND_REGEX = "(AA|A|P|M|m|d|dd)([-+]?\\d+)";
  var REGEX = new RegExp("^" + INTERVAL_TONAL_REGEX + "|" + INTERVAL_SHORTHAND_REGEX + "$");
  function tokenizeInterval(str) {
    const m = REGEX.exec(`${str}`);
    if (m === null) {
      return ["", ""];
    }
    return m[1] ? [m[1], m[2]] : [m[4], m[3]];
  }
  var cache = {};
  function interval(src) {
    return typeof src === "string" ? cache[src] || (cache[src] = parse(src)) : (0, import_pitch.isPitch)(src) ? interval(pitchName(src)) : (0, import_pitch.isNamedPitch)(src) ? interval(src.name) : NoInterval;
  }
  var SIZES = [0, 2, 4, 5, 7, 9, 11];
  var TYPES = "PMMPPMM";
  function parse(str) {
    const tokens = tokenizeInterval(str);
    if (tokens[0] === "") {
      return NoInterval;
    }
    const num = +tokens[0];
    const q = tokens[1];
    const step = (Math.abs(num) - 1) % 7;
    const t = TYPES[step];
    if (t === "M" && q === "P") {
      return NoInterval;
    }
    const type = t === "M" ? "majorable" : "perfectable";
    const name = "" + num + q;
    const dir = num < 0 ? -1 : 1;
    const simple = num === 8 || num === -8 ? num : dir * (step + 1);
    const alt = qToAlt(type, q);
    const oct = Math.floor((Math.abs(num) - 1) / 7);
    const semitones = dir * (SIZES[step] + alt + 12 * oct);
    const chroma = (dir * (SIZES[step] + alt) % 12 + 12) % 12;
    const coord = (0, import_pitch.coordinates)({ step, alt, oct, dir });
    return {
      empty: false,
      name,
      num,
      q,
      step,
      alt,
      dir,
      type,
      simple,
      semitones,
      chroma,
      coord,
      oct
    };
  }
  function coordToInterval(coord, forceDescending) {
    const [f, o = 0] = coord;
    const isDescending = f * 7 + o * 12 < 0;
    const ivl = forceDescending || isDescending ? [-f, -o, -1] : [f, o, 1];
    return interval((0, import_pitch.pitch)(ivl));
  }
  function qToAlt(type, q) {
    return q === "M" && type === "majorable" || q === "P" && type === "perfectable" ? 0 : q === "m" && type === "majorable" ? -1 : /^A+$/.test(q) ? q.length : /^d+$/.test(q) ? -1 * (type === "perfectable" ? q.length : q.length + 1) : 0;
  }
  function pitchName(props) {
    const { step, alt, oct = 0, dir } = props;
    if (!dir) {
      return "";
    }
    const calcNum = step + 1 + 7 * oct;
    const num = calcNum === 0 ? step + 1 : calcNum;
    const d = dir < 0 ? "-" : "";
    const type = TYPES[step] === "M" ? "majorable" : "perfectable";
    const name = d + num + altToQ(type, alt);
    return name;
  }
  function altToQ(type, alt) {
    if (alt === 0) {
      return type === "majorable" ? "M" : "P";
    } else if (alt === -1 && type === "majorable") {
      return "m";
    } else if (alt > 0) {
      return fillStr("A", alt);
    } else {
      return fillStr("d", type === "perfectable" ? alt : alt + 1);
    }
  }
});

// node_modules/@tonaljs/core/node_modules/@tonaljs/pitch-note/dist/index.js
var require_dist16 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod2) => __copyProps(__defProp({}, "__esModule", { value: true }), mod2);
  var pitch_note_exports = {};
  __export(pitch_note_exports, {
    accToAlt: () => accToAlt,
    altToAcc: () => altToAcc,
    coordToNote: () => coordToNote,
    note: () => note,
    stepToLetter: () => stepToLetter,
    tokenizeNote: () => tokenizeNote
  });
  module.exports = __toCommonJS(pitch_note_exports);
  var import_pitch = require_dist14();
  var fillStr = (s, n) => Array(Math.abs(n) + 1).join(s);
  var NoNote = { empty: true, name: "", pc: "", acc: "" };
  var cache = /* @__PURE__ */ new Map;
  var stepToLetter = (step) => "CDEFGAB".charAt(step);
  var altToAcc = (alt) => alt < 0 ? fillStr("b", -alt) : fillStr("#", alt);
  var accToAlt = (acc) => acc[0] === "b" ? -acc.length : acc.length;
  function note(src) {
    const stringSrc = JSON.stringify(src);
    const cached = cache.get(stringSrc);
    if (cached) {
      return cached;
    }
    const value = typeof src === "string" ? parse(src) : (0, import_pitch.isPitch)(src) ? note(pitchName(src)) : (0, import_pitch.isNamedPitch)(src) ? note(src.name) : NoNote;
    cache.set(stringSrc, value);
    return value;
  }
  var REGEX = /^([a-gA-G]?)(#{1,}|b{1,}|x{1,}|)(-?\d*)\s*(.*)$/;
  function tokenizeNote(str) {
    const m = REGEX.exec(str);
    return m ? [m[1].toUpperCase(), m[2].replace(/x/g, "##"), m[3], m[4]] : ["", "", "", ""];
  }
  function coordToNote(noteCoord) {
    return note((0, import_pitch.pitch)(noteCoord));
  }
  var mod = (n, m) => (n % m + m) % m;
  var SEMI = [0, 2, 4, 5, 7, 9, 11];
  function parse(noteName) {
    const tokens = tokenizeNote(noteName);
    if (tokens[0] === "" || tokens[3] !== "") {
      return NoNote;
    }
    const letter = tokens[0];
    const acc = tokens[1];
    const octStr = tokens[2];
    const step = (letter.charCodeAt(0) + 3) % 7;
    const alt = accToAlt(acc);
    const oct = octStr.length ? +octStr : undefined;
    const coord = (0, import_pitch.coordinates)({ step, alt, oct });
    const name = letter + acc + octStr;
    const pc = letter + acc;
    const chroma = (SEMI[step] + alt + 120) % 12;
    const height = oct === undefined ? mod(SEMI[step] + alt, 12) - 12 * 99 : SEMI[step] + alt + 12 * (oct + 1);
    const midi2 = height >= 0 && height <= 127 ? height : null;
    const freq = oct === undefined ? null : Math.pow(2, (height - 69) / 12) * 440;
    return {
      empty: false,
      acc,
      alt,
      chroma,
      coord,
      freq,
      height,
      letter,
      midi: midi2,
      name,
      oct,
      pc,
      step
    };
  }
  function pitchName(props) {
    const { step, alt, oct } = props;
    const letter = stepToLetter(step);
    if (!letter) {
      return "";
    }
    const pc = letter + altToAcc(alt);
    return oct || oct === 0 ? pc + oct : pc;
  }
});

// node_modules/@tonaljs/core/node_modules/@tonaljs/pitch-distance/dist/index.js
var require_dist17 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var pitch_distance_exports = {};
  __export(pitch_distance_exports, {
    distance: () => distance,
    tonicIntervalsTransposer: () => tonicIntervalsTransposer,
    transpose: () => transpose
  });
  module.exports = __toCommonJS(pitch_distance_exports);
  var import_pitch_interval = require_dist15();
  var import_pitch_note = require_dist16();
  function transpose(noteName, intervalName) {
    const note = (0, import_pitch_note.note)(noteName);
    const intervalCoord = Array.isArray(intervalName) ? intervalName : (0, import_pitch_interval.interval)(intervalName).coord;
    if (note.empty || !intervalCoord || intervalCoord.length < 2) {
      return "";
    }
    const noteCoord = note.coord;
    const tr = noteCoord.length === 1 ? [noteCoord[0] + intervalCoord[0]] : [noteCoord[0] + intervalCoord[0], noteCoord[1] + intervalCoord[1]];
    return (0, import_pitch_note.coordToNote)(tr).name;
  }
  function tonicIntervalsTransposer(intervals, tonic) {
    const len = intervals.length;
    return (normalized) => {
      if (!tonic)
        return "";
      const index = normalized < 0 ? (len - -normalized % len) % len : normalized % len;
      const octaves = Math.floor(normalized / len);
      const root = transpose(tonic, [0, octaves]);
      return transpose(root, intervals[index]);
    };
  }
  function distance(fromNote, toNote) {
    const from = (0, import_pitch_note.note)(fromNote);
    const to = (0, import_pitch_note.note)(toNote);
    if (from.empty || to.empty) {
      return "";
    }
    const fcoord = from.coord;
    const tcoord = to.coord;
    const fifths = tcoord[0] - fcoord[0];
    const octs = fcoord.length === 2 && tcoord.length === 2 ? tcoord[1] - fcoord[1] : -Math.floor(fifths * 7 / 12);
    const forceDescending = to.height === from.height && to.midi !== null && from.midi !== null && from.step > to.step;
    return (0, import_pitch_interval.coordToInterval)([fifths, octs], forceDescending).name;
  }
});

// node_modules/@tonaljs/core/dist/index.js
var require_dist18 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var core_exports = {};
  __export(core_exports, {
    deprecate: () => deprecate,
    fillStr: () => fillStr,
    isNamed: () => isNamed
  });
  module.exports = __toCommonJS(core_exports);
  var import_pitch = require_dist14();
  __reExport(core_exports, require_dist14(), module.exports);
  __reExport(core_exports, require_dist17(), module.exports);
  __reExport(core_exports, require_dist15(), module.exports);
  __reExport(core_exports, require_dist16(), module.exports);
  var fillStr = (s, n) => Array(Math.abs(n) + 1).join(s);
  function deprecate(original, alternative, fn) {
    return function(...args) {
      console.warn(`${original} is deprecated. Use ${alternative}.`);
      return fn.apply(this, args);
    };
  }
  var isNamed = deprecate("isNamed", "isNamedPitch", import_pitch.isNamedPitch);
});

// node_modules/@tonaljs/chord-type/dist/index.js
var require_dist19 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all2) => {
    for (var name in all2)
      __defProp(target, name, { get: all2[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var chord_type_exports = {};
  __export(chord_type_exports, {
    add: () => add2,
    addAlias: () => addAlias,
    all: () => all,
    chordType: () => chordType,
    default: () => chord_type_default,
    entries: () => entries,
    get: () => get,
    keys: () => keys,
    names: () => names,
    removeAll: () => removeAll,
    symbols: () => symbols
  });
  module.exports = __toCommonJS(chord_type_exports);
  var import_core = require_dist18();
  var import_pcset = require_dist11();
  var CHORDS = [
    ["1P 3M 5P", "major", "M ^  maj"],
    ["1P 3M 5P 7M", "major seventh", "maj7 \u0394 ma7 M7 Maj7 ^7"],
    ["1P 3M 5P 7M 9M", "major ninth", "maj9 \u03949 ^9"],
    ["1P 3M 5P 7M 9M 13M", "major thirteenth", "maj13 Maj13 ^13"],
    ["1P 3M 5P 6M", "sixth", "6 add6 add13 M6"],
    ["1P 3M 5P 6M 9M", "sixth added ninth", "6add9 6/9 69 M69"],
    ["1P 3M 6m 7M", "major seventh flat sixth", "M7b6 ^7b6"],
    [
      "1P 3M 5P 7M 11A",
      "major seventh sharp eleventh",
      "maj#4 \u0394#4 \u0394#11 M7#11 ^7#11 maj7#11"
    ],
    ["1P 3m 5P", "minor", "m min -"],
    ["1P 3m 5P 7m", "minor seventh", "m7 min7 mi7 -7"],
    [
      "1P 3m 5P 7M",
      "minor/major seventh",
      "m/ma7 m/maj7 mM7 mMaj7 m/M7 -\u03947 m\u0394 -^7"
    ],
    ["1P 3m 5P 6M", "minor sixth", "m6 -6"],
    ["1P 3m 5P 7m 9M", "minor ninth", "m9 -9"],
    ["1P 3m 5P 7M 9M", "minor/major ninth", "mM9 mMaj9 -^9"],
    ["1P 3m 5P 7m 9M 11P", "minor eleventh", "m11 -11"],
    ["1P 3m 5P 7m 9M 13M", "minor thirteenth", "m13 -13"],
    ["1P 3m 5d", "diminished", "dim \xB0 o"],
    ["1P 3m 5d 7d", "diminished seventh", "dim7 \xB07 o7"],
    ["1P 3m 5d 7m", "half-diminished", "m7b5 \xF8 -7b5 h7 h"],
    ["1P 3M 5P 7m", "dominant seventh", "7 dom"],
    ["1P 3M 5P 7m 9M", "dominant ninth", "9"],
    ["1P 3M 5P 7m 9M 13M", "dominant thirteenth", "13"],
    ["1P 3M 5P 7m 11A", "lydian dominant seventh", "7#11 7#4"],
    ["1P 3M 5P 7m 9m", "dominant flat ninth", "7b9"],
    ["1P 3M 5P 7m 9A", "dominant sharp ninth", "7#9"],
    ["1P 3M 7m 9m", "altered", "alt7"],
    ["1P 4P 5P", "suspended fourth", "sus4 sus"],
    ["1P 2M 5P", "suspended second", "sus2"],
    ["1P 4P 5P 7m", "suspended fourth seventh", "7sus4 7sus"],
    ["1P 5P 7m 9M 11P", "eleventh", "11"],
    [
      "1P 4P 5P 7m 9m",
      "suspended fourth flat ninth",
      "b9sus phryg 7b9sus 7b9sus4"
    ],
    ["1P 5P", "fifth", "5"],
    ["1P 3M 5A", "augmented", "aug + +5 ^#5"],
    ["1P 3m 5A", "minor augmented", "m#5 -#5 m+"],
    ["1P 3M 5A 7M", "augmented seventh", "maj7#5 maj7+5 +maj7 ^7#5"],
    [
      "1P 3M 5P 7M 9M 11A",
      "major sharp eleventh (lydian)",
      "maj9#11 \u03949#11 ^9#11"
    ],
    ["1P 2M 4P 5P", "", "sus24 sus4add9"],
    ["1P 3M 5A 7M 9M", "", "maj9#5 Maj9#5"],
    ["1P 3M 5A 7m", "", "7#5 +7 7+ 7aug aug7"],
    ["1P 3M 5A 7m 9A", "", "7#5#9 7#9#5 7alt"],
    ["1P 3M 5A 7m 9M", "", "9#5 9+"],
    ["1P 3M 5A 7m 9M 11A", "", "9#5#11"],
    ["1P 3M 5A 7m 9m", "", "7#5b9 7b9#5"],
    ["1P 3M 5A 7m 9m 11A", "", "7#5b9#11"],
    ["1P 3M 5A 9A", "", "+add#9"],
    ["1P 3M 5A 9M", "", "M#5add9 +add9"],
    ["1P 3M 5P 6M 11A", "", "M6#11 M6b5 6#11 6b5"],
    ["1P 3M 5P 6M 7M 9M", "", "M7add13"],
    ["1P 3M 5P 6M 9M 11A", "", "69#11"],
    ["1P 3m 5P 6M 9M", "", "m69 -69"],
    ["1P 3M 5P 6m 7m", "", "7b6"],
    ["1P 3M 5P 7M 9A 11A", "", "maj7#9#11"],
    ["1P 3M 5P 7M 9M 11A 13M", "", "M13#11 maj13#11 M13+4 M13#4"],
    ["1P 3M 5P 7M 9m", "", "M7b9"],
    ["1P 3M 5P 7m 11A 13m", "", "7#11b13 7b5b13"],
    ["1P 3M 5P 7m 13M", "", "7add6 67 7add13"],
    ["1P 3M 5P 7m 9A 11A", "", "7#9#11 7b5#9 7#9b5"],
    ["1P 3M 5P 7m 9A 11A 13M", "", "13#9#11"],
    ["1P 3M 5P 7m 9A 11A 13m", "", "7#9#11b13"],
    ["1P 3M 5P 7m 9A 13M", "", "13#9"],
    ["1P 3M 5P 7m 9A 13m", "", "7#9b13"],
    ["1P 3M 5P 7m 9M 11A", "", "9#11 9+4 9#4"],
    ["1P 3M 5P 7m 9M 11A 13M", "", "13#11 13+4 13#4"],
    ["1P 3M 5P 7m 9M 11A 13m", "", "9#11b13 9b5b13"],
    ["1P 3M 5P 7m 9m 11A", "", "7b9#11 7b5b9 7b9b5"],
    ["1P 3M 5P 7m 9m 11A 13M", "", "13b9#11"],
    ["1P 3M 5P 7m 9m 11A 13m", "", "7b9b13#11 7b9#11b13 7b5b9b13"],
    ["1P 3M 5P 7m 9m 13M", "", "13b9"],
    ["1P 3M 5P 7m 9m 13m", "", "7b9b13"],
    ["1P 3M 5P 7m 9m 9A", "", "7b9#9"],
    ["1P 3M 5P 9M", "", "Madd9 2 add9 add2"],
    ["1P 3M 5P 9m", "", "Maddb9"],
    ["1P 3M 5d", "", "Mb5"],
    ["1P 3M 5d 6M 7m 9M", "", "13b5"],
    ["1P 3M 5d 7M", "", "M7b5"],
    ["1P 3M 5d 7M 9M", "", "M9b5"],
    ["1P 3M 5d 7m", "", "7b5"],
    ["1P 3M 5d 7m 9M", "", "9b5"],
    ["1P 3M 7m", "", "7no5"],
    ["1P 3M 7m 13m", "", "7b13"],
    ["1P 3M 7m 9M", "", "9no5"],
    ["1P 3M 7m 9M 13M", "", "13no5"],
    ["1P 3M 7m 9M 13m", "", "9b13"],
    ["1P 3m 4P 5P", "", "madd4"],
    ["1P 3m 5P 6m 7M", "", "mMaj7b6"],
    ["1P 3m 5P 6m 7M 9M", "", "mMaj9b6"],
    ["1P 3m 5P 7m 11P", "", "m7add11 m7add4"],
    ["1P 3m 5P 9M", "", "madd9"],
    ["1P 3m 5d 6M 7M", "", "o7M7"],
    ["1P 3m 5d 7M", "", "oM7"],
    ["1P 3m 6m 7M", "", "mb6M7"],
    ["1P 3m 6m 7m", "", "m7#5"],
    ["1P 3m 6m 7m 9M", "", "m9#5"],
    ["1P 3m 5A 7m 9M 11P", "", "m11A"],
    ["1P 3m 6m 9m", "", "mb6b9"],
    ["1P 2M 3m 5d 7m", "", "m9b5"],
    ["1P 4P 5A 7M", "", "M7#5sus4"],
    ["1P 4P 5A 7M 9M", "", "M9#5sus4"],
    ["1P 4P 5A 7m", "", "7#5sus4"],
    ["1P 4P 5P 7M", "", "M7sus4"],
    ["1P 4P 5P 7M 9M", "", "M9sus4"],
    ["1P 4P 5P 7m 9M", "", "9sus4 9sus"],
    ["1P 4P 5P 7m 9M 13M", "", "13sus4 13sus"],
    ["1P 4P 5P 7m 9m 13m", "", "7sus4b9b13 7b9b13sus4"],
    ["1P 4P 7m 10m", "", "4 quartal"],
    ["1P 5P 7m 9m 11P", "", "11b9"]
  ];
  var data_default = CHORDS;
  var NoChordType = {
    ...import_pcset.EmptyPcset,
    name: "",
    quality: "Unknown",
    intervals: [],
    aliases: []
  };
  var dictionary = [];
  var index = {};
  function get(type) {
    return index[type] || NoChordType;
  }
  var chordType = (0, import_core.deprecate)("ChordType.chordType", "ChordType.get", get);
  function names() {
    return dictionary.map((chord) => chord.name).filter((x) => x);
  }
  function symbols() {
    return dictionary.map((chord) => chord.aliases[0]).filter((x) => x);
  }
  function keys() {
    return Object.keys(index);
  }
  function all() {
    return dictionary.slice();
  }
  var entries = (0, import_core.deprecate)("ChordType.entries", "ChordType.all", all);
  function removeAll() {
    dictionary = [];
    index = {};
  }
  function add2(intervals, aliases, fullName) {
    const quality = getQuality(intervals);
    const chord = {
      ...(0, import_pcset.get)(intervals),
      name: fullName || "",
      quality,
      intervals,
      aliases
    };
    dictionary.push(chord);
    if (chord.name) {
      index[chord.name] = chord;
    }
    index[chord.setNum] = chord;
    index[chord.chroma] = chord;
    chord.aliases.forEach((alias) => addAlias(chord, alias));
  }
  function addAlias(chord, alias) {
    index[alias] = chord;
  }
  function getQuality(intervals) {
    const has = (interval) => intervals.indexOf(interval) !== -1;
    return has("5A") ? "Augmented" : has("3M") ? "Major" : has("5d") ? "Diminished" : has("3m") ? "Minor" : "Unknown";
  }
  data_default.forEach(([ivls, fullName, names2]) => add2(ivls.split(" "), names2.split(" "), fullName));
  dictionary.sort((a, b) => a.setNum - b.setNum);
  var chord_type_default = {
    names,
    symbols,
    get,
    all,
    add: add2,
    removeAll,
    keys,
    entries,
    chordType
  };
});

// node_modules/@tonaljs/scale-type/dist/index.js
var require_dist20 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all2) => {
    for (var name in all2)
      __defProp(target, name, { get: all2[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var index_exports = {};
  __export(index_exports, {
    NoScaleType: () => NoScaleType,
    add: () => add2,
    addAlias: () => addAlias,
    all: () => all,
    default: () => index_default,
    entries: () => entries,
    get: () => get,
    keys: () => keys,
    names: () => names,
    removeAll: () => removeAll,
    scaleType: () => scaleType
  });
  module.exports = __toCommonJS(index_exports);
  var import_pcset = require_dist11();
  var SCALES = [
    ["1P 2M 3M 5P 6M", "major pentatonic", "pentatonic"],
    ["1P 2M 3M 4P 5P 6M 7M", "major", "ionian"],
    ["1P 2M 3m 4P 5P 6m 7m", "minor", "aeolian"],
    ["1P 2M 3m 3M 5P 6M", "major blues"],
    ["1P 3m 4P 5d 5P 7m", "minor blues", "blues"],
    ["1P 2M 3m 4P 5P 6M 7M", "melodic minor"],
    ["1P 2M 3m 4P 5P 6m 7M", "harmonic minor"],
    ["1P 2M 3M 4P 5P 6M 7m 7M", "bebop"],
    ["1P 2M 3m 4P 5d 6m 6M 7M", "diminished", "whole-half diminished"],
    ["1P 2M 3m 4P 5P 6M 7m", "dorian"],
    ["1P 2M 3M 4A 5P 6M 7M", "lydian"],
    ["1P 2M 3M 4P 5P 6M 7m", "mixolydian", "dominant"],
    ["1P 2m 3m 4P 5P 6m 7m", "phrygian"],
    ["1P 2m 3m 4P 5d 6m 7m", "locrian"],
    ["1P 3M 4P 5P 7M", "ionian pentatonic"],
    ["1P 3M 4P 5P 7m", "mixolydian pentatonic", "indian"],
    ["1P 2M 4P 5P 6M", "ritusen"],
    ["1P 2M 4P 5P 7m", "egyptian"],
    ["1P 3M 4P 5d 7m", "neapolitan major pentatonic"],
    ["1P 3m 4P 5P 6m", "vietnamese 1"],
    ["1P 2m 3m 5P 6m", "pelog"],
    ["1P 2m 4P 5P 6m", "kumoijoshi"],
    ["1P 2M 3m 5P 6m", "hirajoshi"],
    ["1P 2m 4P 5d 7m", "iwato"],
    ["1P 2m 4P 5P 7m", "in-sen"],
    ["1P 3M 4A 5P 7M", "lydian pentatonic", "chinese"],
    ["1P 3m 4P 6m 7m", "malkos raga"],
    ["1P 3m 4P 5d 7m", "locrian pentatonic", "minor seven flat five pentatonic"],
    ["1P 3m 4P 5P 7m", "minor pentatonic", "vietnamese 2"],
    ["1P 3m 4P 5P 6M", "minor six pentatonic"],
    ["1P 2M 3m 5P 6M", "flat three pentatonic", "kumoi"],
    ["1P 2M 3M 5P 6m", "flat six pentatonic"],
    ["1P 2m 3M 5P 6M", "scriabin"],
    ["1P 3M 5d 6m 7m", "whole tone pentatonic"],
    ["1P 3M 4A 5A 7M", "lydian #5p pentatonic"],
    ["1P 3M 4A 5P 7m", "lydian dominant pentatonic"],
    ["1P 3m 4P 5P 7M", "minor #7m pentatonic"],
    ["1P 3m 4d 5d 7m", "super locrian pentatonic"],
    ["1P 2M 3m 4P 5P 7M", "minor hexatonic"],
    ["1P 2A 3M 5P 5A 7M", "augmented"],
    ["1P 2M 4P 5P 6M 7m", "piongio"],
    ["1P 2m 3M 4A 6M 7m", "prometheus neapolitan"],
    ["1P 2M 3M 4A 6M 7m", "prometheus"],
    ["1P 2m 3M 5d 6m 7m", "mystery #1"],
    ["1P 2m 3M 4P 5A 6M", "six tone symmetric"],
    ["1P 2M 3M 4A 5A 6A", "whole tone", "messiaen's mode #1"],
    ["1P 2m 4P 4A 5P 7M", "messiaen's mode #5"],
    ["1P 2M 3M 4P 5d 6m 7m", "locrian major", "arabian"],
    ["1P 2m 3M 4A 5P 6m 7M", "double harmonic lydian"],
    [
      "1P 2m 2A 3M 4A 6m 7m",
      "altered",
      "super locrian",
      "diminished whole tone",
      "pomeroy"
    ],
    ["1P 2M 3m 4P 5d 6m 7m", "locrian #2", "half-diminished", "aeolian b5"],
    [
      "1P 2M 3M 4P 5P 6m 7m",
      "mixolydian b6",
      "melodic minor fifth mode",
      "hindu"
    ],
    ["1P 2M 3M 4A 5P 6M 7m", "lydian dominant", "lydian b7", "overtone"],
    ["1P 2M 3M 4A 5A 6M 7M", "lydian augmented"],
    [
      "1P 2m 3m 4P 5P 6M 7m",
      "dorian b2",
      "phrygian #6",
      "melodic minor second mode"
    ],
    [
      "1P 2m 3m 4d 5d 6m 7d",
      "ultralocrian",
      "superlocrian bb7",
      "superlocrian diminished"
    ],
    ["1P 2m 3m 4P 5d 6M 7m", "locrian 6", "locrian natural 6", "locrian sharp 6"],
    ["1P 2A 3M 4P 5P 5A 7M", "augmented heptatonic"],
    [
      "1P 2M 3m 4A 5P 6M 7m",
      "dorian #4",
      "ukrainian dorian",
      "romanian minor",
      "altered dorian"
    ],
    ["1P 2M 3m 4A 5P 6M 7M", "lydian diminished"],
    ["1P 2M 3M 4A 5A 7m 7M", "leading whole tone"],
    ["1P 2M 3M 4A 5P 6m 7m", "lydian minor"],
    ["1P 2m 3M 4P 5P 6m 7m", "phrygian dominant", "spanish", "phrygian major"],
    ["1P 2m 3m 4P 5P 6m 7M", "balinese"],
    ["1P 2m 3m 4P 5P 6M 7M", "neapolitan major"],
    ["1P 2M 3M 4P 5P 6m 7M", "harmonic major"],
    ["1P 2m 3M 4P 5P 6m 7M", "double harmonic major", "gypsy"],
    ["1P 2M 3m 4A 5P 6m 7M", "hungarian minor"],
    ["1P 2A 3M 4A 5P 6M 7m", "hungarian major"],
    ["1P 2m 3M 4P 5d 6M 7m", "oriental"],
    ["1P 2m 3m 3M 4A 5P 7m", "flamenco"],
    ["1P 2m 3m 4A 5P 6m 7M", "todi raga"],
    ["1P 2m 3M 4P 5d 6m 7M", "persian"],
    ["1P 2m 3M 5d 6m 7m 7M", "enigmatic"],
    [
      "1P 2M 3M 4P 5A 6M 7M",
      "major augmented",
      "major #5",
      "ionian augmented",
      "ionian #5"
    ],
    ["1P 2A 3M 4A 5P 6M 7M", "lydian #9"],
    ["1P 2m 2M 4P 4A 5P 6m 7M", "messiaen's mode #4"],
    ["1P 2m 3M 4P 4A 5P 6m 7M", "purvi raga"],
    ["1P 2m 3m 3M 4P 5P 6m 7m", "spanish heptatonic"],
    ["1P 2M 3m 3M 4P 5P 6M 7m", "bebop minor"],
    ["1P 2M 3M 4P 5P 5A 6M 7M", "bebop major"],
    ["1P 2m 3m 4P 5d 5P 6m 7m", "bebop locrian"],
    ["1P 2M 3m 4P 5P 6m 7m 7M", "minor bebop"],
    ["1P 2M 3M 4P 5d 5P 6M 7M", "ichikosucho"],
    ["1P 2M 3m 4P 5P 6m 6M 7M", "minor six diminished"],
    [
      "1P 2m 3m 3M 4A 5P 6M 7m",
      "half-whole diminished",
      "dominant diminished",
      "messiaen's mode #2"
    ],
    ["1P 3m 3M 4P 5P 6M 7m 7M", "kafi raga"],
    ["1P 2M 3M 4P 4A 5A 6A 7M", "messiaen's mode #6"],
    ["1P 2M 3m 3M 4P 5d 5P 6M 7m", "composite blues"],
    ["1P 2M 3m 3M 4A 5P 6m 7m 7M", "messiaen's mode #3"],
    ["1P 2m 2M 3m 4P 4A 5P 6m 6M 7M", "messiaen's mode #7"],
    ["1P 2m 2M 3m 3M 4P 5d 5P 6m 6M 7m 7M", "chromatic"]
  ];
  var data_default = SCALES;
  var NoScaleType = {
    ...import_pcset.EmptyPcset,
    intervals: [],
    aliases: []
  };
  var dictionary = [];
  var index = {};
  function names() {
    return dictionary.map((scale) => scale.name);
  }
  function get(type) {
    return index[type] || NoScaleType;
  }
  var scaleType = get;
  function all() {
    return dictionary.slice();
  }
  var entries = all;
  function keys() {
    return Object.keys(index);
  }
  function removeAll() {
    dictionary = [];
    index = {};
  }
  function add2(intervals, name, aliases = []) {
    const scale = { ...(0, import_pcset.get)(intervals), name, intervals, aliases };
    dictionary.push(scale);
    index[scale.name] = scale;
    index[scale.setNum] = scale;
    index[scale.chroma] = scale;
    scale.aliases.forEach((alias) => addAlias(scale, alias));
    return scale;
  }
  function addAlias(scale, alias) {
    index[alias] = scale;
  }
  data_default.forEach(([ivls, name, ...aliases]) => add2(ivls.split(" "), name, aliases));
  var index_default = {
    names,
    get,
    all,
    add: add2,
    removeAll,
    keys,
    entries,
    scaleType
  };
});

// node_modules/@tonaljs/chord/dist/index.js
var require_dist21 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var chord_exports = {};
  __export(chord_exports, {
    chord: () => chord,
    chordScales: () => chordScales,
    default: () => chord_default,
    degrees: () => degrees,
    detect: () => import_chord_detect2.detect,
    extended: () => extended,
    get: () => get,
    getChord: () => getChord,
    reduced: () => reduced,
    steps: () => steps,
    tokenize: () => tokenize,
    transpose: () => transpose
  });
  module.exports = __toCommonJS(chord_exports);
  var import_chord_detect = require_dist13();
  var import_chord_type = require_dist19();
  var import_core = require_dist18();
  var import_core2 = require_dist18();
  var import_pcset = require_dist11();
  var import_scale_type = require_dist20();
  var import_chord_detect2 = require_dist13();
  var NoChord = {
    empty: true,
    name: "",
    symbol: "",
    root: "",
    rootDegree: 0,
    type: "",
    tonic: null,
    setNum: NaN,
    quality: "Unknown",
    chroma: "",
    normalized: "",
    aliases: [],
    notes: [],
    intervals: []
  };
  function tokenize(name) {
    const [letter, acc, oct, type] = (0, import_core2.tokenizeNote)(name);
    if (letter === "") {
      return ["", name];
    }
    if (letter === "A" && type === "ug") {
      return ["", "aug"];
    }
    return [letter + acc, oct + type];
  }
  function get(src) {
    if (src === "") {
      return NoChord;
    }
    if (Array.isArray(src) && src.length === 2) {
      return getChord(src[1], src[0]);
    } else {
      const [tonic, type] = tokenize(src);
      const chord2 = getChord(type, tonic);
      return chord2.empty ? getChord(src) : chord2;
    }
  }
  function getChord(typeName, optionalTonic, optionalRoot) {
    const type = (0, import_chord_type.get)(typeName);
    const tonic = (0, import_core2.note)(optionalTonic || "");
    const root = (0, import_core2.note)(optionalRoot || "");
    if (type.empty || optionalTonic && tonic.empty || optionalRoot && root.empty) {
      return NoChord;
    }
    const rootInterval = (0, import_core2.distance)(tonic.pc, root.pc);
    const rootDegree = type.intervals.indexOf(rootInterval) + 1;
    if (!root.empty && !rootDegree) {
      return NoChord;
    }
    const intervals = Array.from(type.intervals);
    for (let i = 1;i < rootDegree; i++) {
      const num = intervals[0][0];
      const quality = intervals[0][1];
      const newNum = parseInt(num, 10) + 7;
      intervals.push(`${newNum}${quality}`);
      intervals.shift();
    }
    const notes = tonic.empty ? [] : intervals.map((i) => (0, import_core2.transpose)(tonic, i));
    typeName = type.aliases.indexOf(typeName) !== -1 ? typeName : type.aliases[0];
    const symbol = `${tonic.empty ? "" : tonic.pc}${typeName}${root.empty || rootDegree <= 1 ? "" : "/" + root.pc}`;
    const name = `${optionalTonic ? tonic.pc + " " : ""}${type.name}${rootDegree > 1 && optionalRoot ? " over " + root.pc : ""}`;
    return {
      ...type,
      name,
      symbol,
      type: type.name,
      root: root.name,
      intervals,
      rootDegree,
      tonic: tonic.name,
      notes
    };
  }
  var chord = (0, import_core2.deprecate)("Chord.chord", "Chord.get", get);
  function transpose(chordName, interval) {
    const [tonic, type] = tokenize(chordName);
    if (!tonic) {
      return chordName;
    }
    return (0, import_core2.transpose)(tonic, interval) + type;
  }
  function chordScales(name) {
    const s = get(name);
    const isChordIncluded = (0, import_pcset.isSupersetOf)(s.chroma);
    return (0, import_scale_type.all)().filter((scale) => isChordIncluded(scale.chroma)).map((scale) => scale.name);
  }
  function extended(chordName) {
    const s = get(chordName);
    const isSuperset = (0, import_pcset.isSupersetOf)(s.chroma);
    return (0, import_chord_type.all)().filter((chord2) => isSuperset(chord2.chroma)).map((chord2) => s.tonic + chord2.aliases[0]);
  }
  function reduced(chordName) {
    const s = get(chordName);
    const isSubset = (0, import_pcset.isSubsetOf)(s.chroma);
    return (0, import_chord_type.all)().filter((chord2) => isSubset(chord2.chroma)).map((chord2) => s.tonic + chord2.aliases[0]);
  }
  function degrees(chordName) {
    const { intervals, tonic } = get(chordName);
    const transpose2 = (0, import_core.tonicIntervalsTransposer)(intervals, tonic);
    return (degree) => degree ? transpose2(degree > 0 ? degree - 1 : degree) : "";
  }
  function steps(chordName) {
    const { intervals, tonic } = get(chordName);
    return (0, import_core.tonicIntervalsTransposer)(intervals, tonic);
  }
  var chord_default = {
    getChord,
    get,
    detect: import_chord_detect.detect,
    chordScales,
    extended,
    reduced,
    tokenize,
    transpose,
    degrees,
    steps,
    chord
  };
});

// node_modules/@tonaljs/duration-value/dist/index.js
var require_dist22 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var duration_value_exports = {};
  __export(duration_value_exports, {
    default: () => duration_value_default,
    fraction: () => fraction,
    get: () => get,
    names: () => names,
    shorthands: () => shorthands,
    value: () => value
  });
  module.exports = __toCommonJS(duration_value_exports);
  var DATA = [
    [
      0.125,
      "dl",
      ["large", "duplex longa", "maxima", "octuple", "octuple whole"]
    ],
    [0.25, "l", ["long", "longa"]],
    [0.5, "d", ["double whole", "double", "breve"]],
    [1, "w", ["whole", "semibreve"]],
    [2, "h", ["half", "minim"]],
    [4, "q", ["quarter", "crotchet"]],
    [8, "e", ["eighth", "quaver"]],
    [16, "s", ["sixteenth", "semiquaver"]],
    [32, "t", ["thirty-second", "demisemiquaver"]],
    [64, "sf", ["sixty-fourth", "hemidemisemiquaver"]],
    [128, "h", ["hundred twenty-eighth"]],
    [256, "th", ["two hundred fifty-sixth"]]
  ];
  var data_default = DATA;
  var VALUES = [];
  data_default.forEach(([denominator, shorthand, names2]) => add2(denominator, shorthand, names2));
  var NoDuration = {
    empty: true,
    name: "",
    value: 0,
    fraction: [0, 0],
    shorthand: "",
    dots: "",
    names: []
  };
  function names() {
    return VALUES.reduce((names2, duration) => {
      duration.names.forEach((name) => names2.push(name));
      return names2;
    }, []);
  }
  function shorthands() {
    return VALUES.map((dur) => dur.shorthand);
  }
  var REGEX = /^([^.]+)(\.*)$/;
  function get(name) {
    const [_, simple, dots] = REGEX.exec(name) || [];
    const base = VALUES.find((dur) => dur.shorthand === simple || dur.names.includes(simple));
    if (!base) {
      return NoDuration;
    }
    const fraction2 = calcDots(base.fraction, dots.length);
    const value2 = fraction2[0] / fraction2[1];
    return { ...base, name, dots, value: value2, fraction: fraction2 };
  }
  var value = (name) => get(name).value;
  var fraction = (name) => get(name).fraction;
  var duration_value_default = { names, shorthands, get, value, fraction };
  function add2(denominator, shorthand, names2) {
    VALUES.push({
      empty: false,
      dots: "",
      name: "",
      value: 1 / denominator,
      fraction: denominator < 1 ? [1 / denominator, 1] : [1, denominator],
      shorthand,
      names: names2
    });
  }
  function calcDots(fraction2, dots) {
    const pow = Math.pow(2, dots);
    let numerator = fraction2[0] * pow;
    let denominator = fraction2[1] * pow;
    const base = numerator;
    for (let i = 0;i < dots; i++) {
      numerator += base / Math.pow(2, i + 1);
    }
    while (numerator % 2 === 0 && denominator % 2 === 0) {
      numerator /= 2;
      denominator /= 2;
    }
    return [numerator, denominator];
  }
});

// node_modules/@tonaljs/interval/dist/index.js
var require_dist23 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name2 in all)
      __defProp(target, name2, { get: all[name2], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var interval_exports = {};
  __export(interval_exports, {
    add: () => add2,
    addTo: () => addTo,
    default: () => interval_default,
    distance: () => distance,
    fromSemitones: () => fromSemitones,
    get: () => get,
    invert: () => invert,
    name: () => name,
    names: () => names,
    num: () => num,
    quality: () => quality,
    semitones: () => semitones,
    simplify: () => simplify,
    substract: () => substract,
    transposeFifths: () => transposeFifths
  });
  module.exports = __toCommonJS(interval_exports);
  var import_pitch_distance = require_dist5();
  var import_pitch_interval = require_dist15();
  function names() {
    return "1P 2M 3M 4P 5P 6m 7m".split(" ");
  }
  var get = import_pitch_interval.interval;
  var name = (name2) => (0, import_pitch_interval.interval)(name2).name;
  var semitones = (name2) => (0, import_pitch_interval.interval)(name2).semitones;
  var quality = (name2) => (0, import_pitch_interval.interval)(name2).q;
  var num = (name2) => (0, import_pitch_interval.interval)(name2).num;
  function simplify(name2) {
    const i = (0, import_pitch_interval.interval)(name2);
    return i.empty ? "" : i.simple + i.q;
  }
  function invert(name2) {
    const i = (0, import_pitch_interval.interval)(name2);
    if (i.empty) {
      return "";
    }
    const step = (7 - i.step) % 7;
    const alt = i.type === "perfectable" ? -i.alt : -(i.alt + 1);
    return (0, import_pitch_interval.interval)({ step, alt, oct: i.oct, dir: i.dir }).name;
  }
  var IN = [1, 2, 2, 3, 3, 4, 5, 5, 6, 6, 7, 7];
  var IQ = "P m M m M P d P m M m M".split(" ");
  function fromSemitones(semitones2) {
    const d = semitones2 < 0 ? -1 : 1;
    const n = Math.abs(semitones2);
    const c = n % 12;
    const o = Math.floor(n / 12);
    return d * (IN[c] + 7 * o) + IQ[c];
  }
  var distance = import_pitch_distance.distance;
  var add2 = combinator((a, b) => [a[0] + b[0], a[1] + b[1]]);
  var addTo = (interval) => (other) => add2(interval, other);
  var substract = combinator((a, b) => [a[0] - b[0], a[1] - b[1]]);
  function transposeFifths(interval, fifths) {
    const ivl = get(interval);
    if (ivl.empty)
      return "";
    const [nFifths, nOcts, dir] = ivl.coord;
    return (0, import_pitch_interval.coordToInterval)([nFifths + fifths, nOcts, dir]).name;
  }
  var interval_default = {
    names,
    get,
    name,
    num,
    semitones,
    quality,
    fromSemitones,
    distance,
    invert,
    simplify,
    add: add2,
    addTo,
    substract,
    transposeFifths
  };
  function combinator(fn) {
    return (a, b) => {
      const coordA = (0, import_pitch_interval.interval)(a).coord;
      const coordB = (0, import_pitch_interval.interval)(b).coord;
      if (coordA && coordB) {
        const coord = fn(coordA, coordB);
        return (0, import_pitch_interval.coordToInterval)(coord).name;
      }
    };
  }
});

// node_modules/@tonaljs/midi/dist/index.js
var require_dist24 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var index_exports = {};
  __export(index_exports, {
    chroma: () => chroma,
    default: () => index_default,
    freqToMidi: () => freqToMidi,
    isMidi: () => isMidi,
    midiToFreq: () => midiToFreq,
    midiToNoteName: () => midiToNoteName,
    pcset: () => pcset,
    pcsetDegrees: () => pcsetDegrees,
    pcsetNearest: () => pcsetNearest,
    pcsetSteps: () => pcsetSteps,
    toMidi: () => toMidi
  });
  module.exports = __toCommonJS(index_exports);
  var import_pitch_note = require_dist4();
  function isMidi(arg) {
    return +arg >= 0 && +arg <= 127;
  }
  function toMidi(note) {
    if (isMidi(note)) {
      return +note;
    }
    const n = (0, import_pitch_note.note)(note);
    return n.empty ? null : n.midi;
  }
  function midiToFreq(midi2, tuning = 440) {
    return Math.pow(2, (midi2 - 69) / 12) * tuning;
  }
  var L2 = Math.log(2);
  var L440 = Math.log(440);
  function freqToMidi(freq) {
    const v = 12 * (Math.log(freq) - L440) / L2 + 69;
    return Math.round(v * 100) / 100;
  }
  var SHARPS = "C C# D D# E F F# G G# A A# B".split(" ");
  var FLATS = "C Db D Eb E F Gb G Ab A Bb B".split(" ");
  function midiToNoteName(midi2, options = {}) {
    if (isNaN(midi2) || midi2 === -Infinity || midi2 === Infinity)
      return "";
    midi2 = Math.round(midi2);
    const pcs = options.sharps === true ? SHARPS : FLATS;
    const pc = pcs[midi2 % 12];
    if (options.pitchClass) {
      return pc;
    }
    const o = Math.floor(midi2 / 12) - 1;
    return pc + o;
  }
  function chroma(midi2) {
    return midi2 % 12;
  }
  function pcsetFromChroma(chroma2) {
    return chroma2.split("").reduce((pcset2, val, index) => {
      if (index < 12 && val === "1")
        pcset2.push(index);
      return pcset2;
    }, []);
  }
  function pcsetFromMidi(midi2) {
    return midi2.map(chroma).sort((a, b) => a - b).filter((n, i, a) => i === 0 || n !== a[i - 1]);
  }
  function pcset(notes) {
    return Array.isArray(notes) ? pcsetFromMidi(notes) : pcsetFromChroma(notes);
  }
  function pcsetNearest(notes) {
    const set = pcset(notes);
    return (midi2) => {
      const ch = chroma(midi2);
      for (let i = 0;i < 12; i++) {
        if (set.includes(ch + i))
          return midi2 + i;
        if (set.includes(ch - i))
          return midi2 - i;
      }
      return;
    };
  }
  function pcsetSteps(notes, tonic) {
    const set = pcset(notes);
    const len = set.length;
    return (step) => {
      const index = step < 0 ? (len - -step % len) % len : step % len;
      const octaves = Math.floor(step / len);
      return set[index] + octaves * 12 + tonic;
    };
  }
  function pcsetDegrees(notes, tonic) {
    const steps = pcsetSteps(notes, tonic);
    return (degree) => {
      if (degree === 0)
        return;
      return steps(degree > 0 ? degree - 1 : degree);
    };
  }
  var index_default = {
    chroma,
    freqToMidi,
    isMidi,
    midiToFreq,
    midiToNoteName,
    pcsetNearest,
    pcset,
    pcsetDegrees,
    pcsetSteps,
    toMidi
  };
});

// node_modules/@tonaljs/note/dist/index.js
var require_dist25 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name2 in all)
      __defProp(target, name2, { get: all[name2], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var index_exports = {};
  __export(index_exports, {
    accidentals: () => accidentals,
    ascending: () => ascending,
    chroma: () => chroma,
    default: () => index_default,
    descending: () => descending,
    distance: () => distance,
    enharmonic: () => enharmonic,
    freq: () => freq,
    fromFreq: () => fromFreq,
    fromFreqSharps: () => fromFreqSharps,
    fromMidi: () => fromMidi,
    fromMidiSharps: () => fromMidiSharps,
    get: () => get,
    midi: () => midi2,
    name: () => name,
    names: () => names,
    octave: () => octave,
    pitchClass: () => pitchClass,
    simplify: () => simplify,
    sortedNames: () => sortedNames,
    sortedUniqNames: () => sortedUniqNames,
    tr: () => tr,
    trBy: () => trBy,
    trFifths: () => trFifths,
    trFrom: () => trFrom,
    transpose: () => transpose,
    transposeBy: () => transposeBy,
    transposeFifths: () => transposeFifths,
    transposeFrom: () => transposeFrom,
    transposeOctaves: () => transposeOctaves
  });
  module.exports = __toCommonJS(index_exports);
  var import_midi = require_dist24();
  var import_pitch_distance = require_dist5();
  var import_pitch_note = require_dist4();
  var NAMES = ["C", "D", "E", "F", "G", "A", "B"];
  var toName = (n) => n.name;
  var onlyNotes = (array) => array.map(import_pitch_note.note).filter((n) => !n.empty);
  function names(array) {
    if (array === undefined) {
      return NAMES.slice();
    } else if (!Array.isArray(array)) {
      return [];
    } else {
      return onlyNotes(array).map(toName);
    }
  }
  var get = import_pitch_note.note;
  var name = (note) => get(note).name;
  var pitchClass = (note) => get(note).pc;
  var accidentals = (note) => get(note).acc;
  var octave = (note) => get(note).oct;
  var midi2 = (note) => get(note).midi;
  var freq = (note) => get(note).freq;
  var chroma = (note) => get(note).chroma;
  function fromMidi(midi2) {
    return (0, import_midi.midiToNoteName)(midi2);
  }
  function fromFreq(freq2) {
    return (0, import_midi.midiToNoteName)((0, import_midi.freqToMidi)(freq2));
  }
  function fromFreqSharps(freq2) {
    return (0, import_midi.midiToNoteName)((0, import_midi.freqToMidi)(freq2), { sharps: true });
  }
  function fromMidiSharps(midi2) {
    return (0, import_midi.midiToNoteName)(midi2, { sharps: true });
  }
  var distance = import_pitch_distance.distance;
  var transpose = import_pitch_distance.transpose;
  var tr = import_pitch_distance.transpose;
  var transposeBy = (interval) => (note) => transpose(note, interval);
  var trBy = transposeBy;
  var transposeFrom = (note) => (interval) => transpose(note, interval);
  var trFrom = transposeFrom;
  function transposeFifths(noteName, fifths) {
    return transpose(noteName, [fifths, 0]);
  }
  var trFifths = transposeFifths;
  function transposeOctaves(noteName, octaves) {
    return transpose(noteName, [0, octaves]);
  }
  var ascending = (a, b) => a.height - b.height;
  var descending = (a, b) => b.height - a.height;
  function sortedNames(notes, comparator) {
    comparator = comparator || ascending;
    return onlyNotes(notes).sort(comparator).map(toName);
  }
  function sortedUniqNames(notes) {
    return sortedNames(notes, ascending).filter((n, i, a) => i === 0 || n !== a[i - 1]);
  }
  var simplify = (noteName) => {
    const note = get(noteName);
    if (note.empty) {
      return "";
    }
    return (0, import_midi.midiToNoteName)(note.midi || note.chroma, {
      sharps: note.alt > 0,
      pitchClass: note.midi === null
    });
  };
  function enharmonic(noteName, destName) {
    const src = get(noteName);
    if (src.empty) {
      return "";
    }
    const dest = get(destName || (0, import_midi.midiToNoteName)(src.midi || src.chroma, {
      sharps: src.alt < 0,
      pitchClass: true
    }));
    if (dest.empty || dest.chroma !== src.chroma) {
      return "";
    }
    if (src.oct === undefined) {
      return dest.pc;
    }
    const srcChroma = src.chroma - src.alt;
    const destChroma = dest.chroma - dest.alt;
    const destOctOffset = srcChroma > 11 || destChroma < 0 ? -1 : srcChroma < 0 || destChroma > 11 ? 1 : 0;
    const destOct = src.oct + destOctOffset;
    return dest.pc + destOct;
  }
  var index_default = {
    names,
    get,
    name,
    pitchClass,
    accidentals,
    octave,
    midi: midi2,
    ascending,
    descending,
    distance,
    sortedNames,
    sortedUniqNames,
    fromMidi,
    fromMidiSharps,
    freq,
    fromFreq,
    fromFreqSharps,
    chroma,
    transpose,
    tr,
    transposeBy,
    trBy,
    transposeFrom,
    trFrom,
    transposeFifths,
    transposeOctaves,
    trFifths,
    simplify,
    enharmonic
  };
});

// node_modules/@tonaljs/roman-numeral/node_modules/@tonaljs/pitch/dist/index.js
var require_dist26 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var pitch_exports = {};
  __export(pitch_exports, {
    chroma: () => chroma,
    coordinates: () => coordinates,
    height: () => height,
    isNamedPitch: () => isNamedPitch,
    isPitch: () => isPitch,
    midi: () => midi2,
    pitch: () => pitch
  });
  module.exports = __toCommonJS(pitch_exports);
  function isNamedPitch(src) {
    return src !== null && typeof src === "object" && "name" in src && typeof src.name === "string" ? true : false;
  }
  var SIZES = [0, 2, 4, 5, 7, 9, 11];
  var chroma = ({ step, alt }) => (SIZES[step] + alt + 120) % 12;
  var height = ({ step, alt, oct, dir = 1 }) => dir * (SIZES[step] + alt + 12 * (oct === undefined ? -100 : oct));
  var midi2 = (pitch2) => {
    const h = height(pitch2);
    return pitch2.oct !== undefined && h >= -12 && h <= 115 ? h + 12 : null;
  };
  function isPitch(pitch2) {
    return pitch2 !== null && typeof pitch2 === "object" && "step" in pitch2 && typeof pitch2.step === "number" && "alt" in pitch2 && typeof pitch2.alt === "number" && !isNaN(pitch2.step) && !isNaN(pitch2.alt) ? true : false;
  }
  var FIFTHS = [0, 2, 4, -1, 1, 3, 5];
  var STEPS_TO_OCTS = FIFTHS.map((fifths) => Math.floor(fifths * 7 / 12));
  function coordinates(pitch2) {
    const { step, alt, oct, dir = 1 } = pitch2;
    const f = FIFTHS[step] + 7 * alt;
    if (oct === undefined) {
      return [dir * f];
    }
    const o = oct - STEPS_TO_OCTS[step] - 4 * alt;
    return [dir * f, dir * o];
  }
  var FIFTHS_TO_STEPS = [3, 0, 4, 1, 5, 2, 6];
  function pitch(coord) {
    const [f, o, dir] = coord;
    const step = FIFTHS_TO_STEPS[unaltered(f)];
    const alt = Math.floor((f + 1) / 7);
    if (o === undefined) {
      return { step, alt, dir };
    }
    const oct = o + 4 * alt + STEPS_TO_OCTS[step];
    return { step, alt, oct, dir };
  }
  function unaltered(f) {
    const i = (f + 1) % 7;
    return i < 0 ? 7 + i : i;
  }
});

// node_modules/@tonaljs/roman-numeral/node_modules/@tonaljs/pitch-interval/dist/index.js
var require_dist27 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var pitch_interval_exports = {};
  __export(pitch_interval_exports, {
    coordToInterval: () => coordToInterval,
    interval: () => interval,
    tokenizeInterval: () => tokenizeInterval
  });
  module.exports = __toCommonJS(pitch_interval_exports);
  var import_pitch = require_dist26();
  var fillStr = (s, n) => Array(Math.abs(n) + 1).join(s);
  var NoInterval = Object.freeze({
    empty: true,
    name: "",
    num: NaN,
    q: "",
    type: "",
    step: NaN,
    alt: NaN,
    dir: NaN,
    simple: NaN,
    semitones: NaN,
    chroma: NaN,
    coord: [],
    oct: NaN
  });
  var INTERVAL_TONAL_REGEX = "([-+]?\\d+)(d{1,4}|m|M|P|A{1,4})";
  var INTERVAL_SHORTHAND_REGEX = "(AA|A|P|M|m|d|dd)([-+]?\\d+)";
  var REGEX = new RegExp("^" + INTERVAL_TONAL_REGEX + "|" + INTERVAL_SHORTHAND_REGEX + "$");
  function tokenizeInterval(str) {
    const m = REGEX.exec(`${str}`);
    if (m === null) {
      return ["", ""];
    }
    return m[1] ? [m[1], m[2]] : [m[4], m[3]];
  }
  var cache = {};
  function interval(src) {
    return typeof src === "string" ? cache[src] || (cache[src] = parse(src)) : (0, import_pitch.isPitch)(src) ? interval(pitchName(src)) : (0, import_pitch.isNamedPitch)(src) ? interval(src.name) : NoInterval;
  }
  var SIZES = [0, 2, 4, 5, 7, 9, 11];
  var TYPES = "PMMPPMM";
  function parse(str) {
    const tokens = tokenizeInterval(str);
    if (tokens[0] === "") {
      return NoInterval;
    }
    const num = +tokens[0];
    const q = tokens[1];
    const step = (Math.abs(num) - 1) % 7;
    const t = TYPES[step];
    if (t === "M" && q === "P") {
      return NoInterval;
    }
    const type = t === "M" ? "majorable" : "perfectable";
    const name = "" + num + q;
    const dir = num < 0 ? -1 : 1;
    const simple = num === 8 || num === -8 ? num : dir * (step + 1);
    const alt = qToAlt(type, q);
    const oct = Math.floor((Math.abs(num) - 1) / 7);
    const semitones = dir * (SIZES[step] + alt + 12 * oct);
    const chroma = (dir * (SIZES[step] + alt) % 12 + 12) % 12;
    const coord = (0, import_pitch.coordinates)({ step, alt, oct, dir });
    return {
      empty: false,
      name,
      num,
      q,
      step,
      alt,
      dir,
      type,
      simple,
      semitones,
      chroma,
      coord,
      oct
    };
  }
  function coordToInterval(coord, forceDescending) {
    const [f, o = 0] = coord;
    const isDescending = f * 7 + o * 12 < 0;
    const ivl = forceDescending || isDescending ? [-f, -o, -1] : [f, o, 1];
    return interval((0, import_pitch.pitch)(ivl));
  }
  function qToAlt(type, q) {
    return q === "M" && type === "majorable" || q === "P" && type === "perfectable" ? 0 : q === "m" && type === "majorable" ? -1 : /^A+$/.test(q) ? q.length : /^d+$/.test(q) ? -1 * (type === "perfectable" ? q.length : q.length + 1) : 0;
  }
  function pitchName(props) {
    const { step, alt, oct = 0, dir } = props;
    if (!dir) {
      return "";
    }
    const calcNum = step + 1 + 7 * oct;
    const num = calcNum === 0 ? step + 1 : calcNum;
    const d = dir < 0 ? "-" : "";
    const type = TYPES[step] === "M" ? "majorable" : "perfectable";
    const name = d + num + altToQ(type, alt);
    return name;
  }
  function altToQ(type, alt) {
    if (alt === 0) {
      return type === "majorable" ? "M" : "P";
    } else if (alt === -1 && type === "majorable") {
      return "m";
    } else if (alt > 0) {
      return fillStr("A", alt);
    } else {
      return fillStr("d", type === "perfectable" ? alt : alt + 1);
    }
  }
});

// node_modules/@tonaljs/roman-numeral/dist/index.js
var require_dist28 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var roman_numeral_exports = {};
  __export(roman_numeral_exports, {
    default: () => roman_numeral_default,
    get: () => get,
    names: () => names,
    romanNumeral: () => romanNumeral,
    tokenize: () => tokenize
  });
  module.exports = __toCommonJS(roman_numeral_exports);
  var import_pitch = require_dist26();
  var import_pitch_interval = require_dist27();
  var import_pitch_note = require_dist4();
  var NoRomanNumeral = { empty: true, name: "", chordType: "" };
  var cache = {};
  function get(src) {
    return typeof src === "string" ? cache[src] || (cache[src] = parse(src)) : typeof src === "number" ? get(NAMES[src] || "") : (0, import_pitch.isPitch)(src) ? fromPitch(src) : (0, import_pitch.isNamedPitch)(src) ? get(src.name) : NoRomanNumeral;
  }
  var romanNumeral = get;
  function names(major = true) {
    return (major ? NAMES : NAMES_MINOR).slice();
  }
  function fromPitch(pitch) {
    return get((0, import_pitch_note.altToAcc)(pitch.alt) + NAMES[pitch.step]);
  }
  var REGEX = /^(#{1,}|b{1,}|x{1,}|)(IV|I{1,3}|VI{0,2}|iv|i{1,3}|vi{0,2})([^IViv]*)$/;
  function tokenize(str) {
    return REGEX.exec(str) || ["", "", "", ""];
  }
  var ROMANS = "I II III IV V VI VII";
  var NAMES = ROMANS.split(" ");
  var NAMES_MINOR = ROMANS.toLowerCase().split(" ");
  function parse(src) {
    const [name, acc, roman, chordType] = tokenize(src);
    if (!roman) {
      return NoRomanNumeral;
    }
    const upperRoman = roman.toUpperCase();
    const step = NAMES.indexOf(upperRoman);
    const alt = (0, import_pitch_note.accToAlt)(acc);
    const dir = 1;
    return {
      empty: false,
      name,
      roman,
      interval: (0, import_pitch_interval.interval)({ step, alt, dir }).name,
      acc,
      chordType,
      alt,
      step,
      major: roman === upperRoman,
      oct: 0,
      dir
    };
  }
  var roman_numeral_default = {
    names,
    get,
    romanNumeral
  };
});

// node_modules/@tonaljs/key/dist/index.js
var require_dist29 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var index_exports = {};
  __export(index_exports, {
    default: () => index_default,
    majorKey: () => majorKey,
    majorKeyChords: () => majorKeyChords,
    majorTonicFromKeySignature: () => majorTonicFromKeySignature,
    minorKey: () => minorKey,
    minorKeyChords: () => minorKeyChords
  });
  module.exports = __toCommonJS(index_exports);
  var import_note = require_dist25();
  var import_pitch_note = require_dist4();
  var import_roman_numeral = require_dist28();
  var Empty = Object.freeze([]);
  var NoKey = {
    type: "major",
    tonic: "",
    alteration: 0,
    keySignature: ""
  };
  var NoKeyScale = {
    tonic: "",
    grades: Empty,
    intervals: Empty,
    scale: Empty,
    triads: Empty,
    chords: Empty,
    chordsHarmonicFunction: Empty,
    chordScales: Empty,
    secondaryDominants: Empty,
    secondaryDominantSupertonics: Empty,
    substituteDominantsMinorRelative: Empty,
    substituteDominants: Empty,
    substituteDominantSupertonics: Empty,
    secondaryDominantsMinorRelative: Empty
  };
  var NoMajorKey = {
    ...NoKey,
    ...NoKeyScale,
    type: "major",
    minorRelative: "",
    scale: Empty,
    substituteDominants: Empty,
    secondaryDominantSupertonics: Empty,
    substituteDominantsMinorRelative: Empty
  };
  var NoMinorKey = {
    ...NoKey,
    type: "minor",
    relativeMajor: "",
    natural: NoKeyScale,
    harmonic: NoKeyScale,
    melodic: NoKeyScale
  };
  var mapScaleToType = (scale, list, sep = "") => list.map((type, i) => `${scale[i]}${sep}${type}`);
  function keyScale(grades, triads, chordTypes, harmonicFunctions, chordScales) {
    return (tonic) => {
      const intervals = grades.map((gr) => (0, import_roman_numeral.get)(gr).interval || "");
      const scale = intervals.map((interval) => (0, import_note.transpose)(tonic, interval));
      const chords = mapScaleToType(scale, chordTypes);
      const secondaryDominants = scale.map((note2) => (0, import_note.transpose)(note2, "5P")).map((note2) => scale.includes(note2) && !chords.includes(note2 + "7") ? note2 + "7" : "");
      const secondaryDominantSupertonics = supertonics(secondaryDominants, triads);
      const substituteDominants = secondaryDominants.map((chord) => {
        if (!chord)
          return "";
        const domRoot = chord.slice(0, -1);
        const subRoot = (0, import_note.transpose)(domRoot, "5d");
        return subRoot + "7";
      });
      const substituteDominantSupertonics = supertonics(substituteDominants, triads);
      return {
        tonic,
        grades,
        intervals,
        scale,
        triads: mapScaleToType(scale, triads),
        chords,
        chordsHarmonicFunction: harmonicFunctions.slice(),
        chordScales: mapScaleToType(scale, chordScales, " "),
        secondaryDominants,
        secondaryDominantSupertonics,
        substituteDominants,
        substituteDominantSupertonics,
        secondaryDominantsMinorRelative: secondaryDominantSupertonics,
        substituteDominantsMinorRelative: substituteDominantSupertonics
      };
    };
  }
  var supertonics = (dominants, targetTriads) => {
    return dominants.map((chord, index) => {
      if (!chord)
        return "";
      const domRoot = chord.slice(0, -1);
      const minorRoot = (0, import_note.transpose)(domRoot, "5P");
      const target = targetTriads[index];
      const isMinor = target.endsWith("m");
      return isMinor ? minorRoot + "m7" : minorRoot + "m7b5";
    });
  };
  var distInFifths = (from, to) => {
    const f = (0, import_pitch_note.note)(from);
    const t = (0, import_pitch_note.note)(to);
    return f.empty || t.empty ? 0 : t.coord[0] - f.coord[0];
  };
  var MajorScale = keyScale("I II III IV V VI VII".split(" "), " m m   m dim".split(" "), "maj7 m7 m7 maj7 7 m7 m7b5".split(" "), "T SD T SD D T D".split(" "), "major,dorian,phrygian,lydian,mixolydian,minor,locrian".split(","));
  var NaturalScale = keyScale("I II bIII IV V bVI bVII".split(" "), "m dim  m m  ".split(" "), "m7 m7b5 maj7 m7 m7 maj7 7".split(" "), "T SD T SD D SD SD".split(" "), "minor,locrian,major,dorian,phrygian,lydian,mixolydian".split(","));
  var HarmonicScale = keyScale("I II bIII IV V bVI VII".split(" "), "m dim aug m   dim".split(" "), "mMaj7 m7b5 +maj7 m7 7 maj7 o7".split(" "), "T SD T SD D SD D".split(" "), "harmonic minor,locrian 6,major augmented,lydian diminished,phrygian dominant,lydian #9,ultralocrian".split(","));
  var MelodicScale = keyScale("I II bIII IV V VI VII".split(" "), "m m aug   dim dim".split(" "), "m6 m7 +maj7 7 7 m7b5 m7b5".split(" "), "T SD T SD D  ".split(" "), "melodic minor,dorian b2,lydian augmented,lydian dominant,mixolydian b6,locrian #2,altered".split(","));
  function majorKey(tonic) {
    const pc = (0, import_pitch_note.note)(tonic).pc;
    if (!pc)
      return NoMajorKey;
    const keyScale2 = MajorScale(pc);
    const alteration = distInFifths("C", pc);
    return {
      ...keyScale2,
      type: "major",
      minorRelative: (0, import_note.transpose)(pc, "-3m"),
      alteration,
      keySignature: (0, import_pitch_note.altToAcc)(alteration)
    };
  }
  function majorKeyChords(tonic) {
    const key = majorKey(tonic);
    const chords = [];
    keyChordsOf(key, chords);
    return chords;
  }
  function minorKeyChords(tonic) {
    const key = minorKey(tonic);
    const chords = [];
    keyChordsOf(key.natural, chords);
    keyChordsOf(key.harmonic, chords);
    keyChordsOf(key.melodic, chords);
    return chords;
  }
  function keyChordsOf(key, chords) {
    const updateChord = (name, newRole) => {
      if (!name)
        return;
      let keyChord = chords.find((chord) => chord.name === name);
      if (!keyChord) {
        keyChord = { name, roles: [] };
        chords.push(keyChord);
      }
      if (newRole && !keyChord.roles.includes(newRole)) {
        keyChord.roles.push(newRole);
      }
    };
    key.chords.forEach((chordName, index) => updateChord(chordName, key.chordsHarmonicFunction[index]));
    key.secondaryDominants.forEach((chordName, index) => updateChord(chordName, `V/${key.grades[index]}`));
    key.secondaryDominantSupertonics.forEach((chordName, index) => updateChord(chordName, `ii/${key.grades[index]}`));
    key.substituteDominants.forEach((chordName, index) => updateChord(chordName, `subV/${key.grades[index]}`));
    key.substituteDominantSupertonics.forEach((chordName, index) => updateChord(chordName, `subii/${key.grades[index]}`));
  }
  function minorKey(tnc) {
    const pc = (0, import_pitch_note.note)(tnc).pc;
    if (!pc)
      return NoMinorKey;
    const alteration = distInFifths("C", pc) - 3;
    return {
      type: "minor",
      tonic: pc,
      relativeMajor: (0, import_note.transpose)(pc, "3m"),
      alteration,
      keySignature: (0, import_pitch_note.altToAcc)(alteration),
      natural: NaturalScale(pc),
      harmonic: HarmonicScale(pc),
      melodic: MelodicScale(pc)
    };
  }
  function majorTonicFromKeySignature(sig) {
    if (typeof sig === "number") {
      return (0, import_note.transposeFifths)("C", sig);
    } else if (typeof sig === "string" && /^b+|#+$/.test(sig)) {
      return (0, import_note.transposeFifths)("C", (0, import_pitch_note.accToAlt)(sig));
    }
    return null;
  }
  var index_default = { majorKey, majorTonicFromKeySignature, minorKey };
});

// node_modules/@tonaljs/mode/node_modules/@tonaljs/interval/node_modules/@tonaljs/pitch/dist/index.js
var require_dist30 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var pitch_exports = {};
  __export(pitch_exports, {
    chroma: () => chroma,
    coordinates: () => coordinates,
    height: () => height,
    isNamedPitch: () => isNamedPitch,
    isPitch: () => isPitch,
    midi: () => midi2,
    pitch: () => pitch
  });
  module.exports = __toCommonJS(pitch_exports);
  function isNamedPitch(src) {
    return src !== null && typeof src === "object" && "name" in src && typeof src.name === "string" ? true : false;
  }
  var SIZES = [0, 2, 4, 5, 7, 9, 11];
  var chroma = ({ step, alt }) => (SIZES[step] + alt + 120) % 12;
  var height = ({ step, alt, oct, dir = 1 }) => dir * (SIZES[step] + alt + 12 * (oct === undefined ? -100 : oct));
  var midi2 = (pitch2) => {
    const h = height(pitch2);
    return pitch2.oct !== undefined && h >= -12 && h <= 115 ? h + 12 : null;
  };
  function isPitch(pitch2) {
    return pitch2 !== null && typeof pitch2 === "object" && "step" in pitch2 && typeof pitch2.step === "number" && "alt" in pitch2 && typeof pitch2.alt === "number" && !isNaN(pitch2.step) && !isNaN(pitch2.alt) ? true : false;
  }
  var FIFTHS = [0, 2, 4, -1, 1, 3, 5];
  var STEPS_TO_OCTS = FIFTHS.map((fifths) => Math.floor(fifths * 7 / 12));
  function coordinates(pitch2) {
    const { step, alt, oct, dir = 1 } = pitch2;
    const f = FIFTHS[step] + 7 * alt;
    if (oct === undefined) {
      return [dir * f];
    }
    const o = oct - STEPS_TO_OCTS[step] - 4 * alt;
    return [dir * f, dir * o];
  }
  var FIFTHS_TO_STEPS = [3, 0, 4, 1, 5, 2, 6];
  function pitch(coord) {
    const [f, o, dir] = coord;
    const step = FIFTHS_TO_STEPS[unaltered(f)];
    const alt = Math.floor((f + 1) / 7);
    if (o === undefined) {
      return { step, alt, dir };
    }
    const oct = o + 4 * alt + STEPS_TO_OCTS[step];
    return { step, alt, oct, dir };
  }
  function unaltered(f) {
    const i = (f + 1) % 7;
    return i < 0 ? 7 + i : i;
  }
});

// node_modules/@tonaljs/mode/node_modules/@tonaljs/interval/node_modules/@tonaljs/pitch-interval/dist/index.js
var require_dist31 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var pitch_interval_exports = {};
  __export(pitch_interval_exports, {
    coordToInterval: () => coordToInterval,
    interval: () => interval,
    tokenizeInterval: () => tokenizeInterval
  });
  module.exports = __toCommonJS(pitch_interval_exports);
  var import_pitch = require_dist30();
  var fillStr = (s, n) => Array(Math.abs(n) + 1).join(s);
  var NoInterval = Object.freeze({
    empty: true,
    name: "",
    num: NaN,
    q: "",
    type: "",
    step: NaN,
    alt: NaN,
    dir: NaN,
    simple: NaN,
    semitones: NaN,
    chroma: NaN,
    coord: [],
    oct: NaN
  });
  var INTERVAL_TONAL_REGEX = "([-+]?\\d+)(d{1,4}|m|M|P|A{1,4})";
  var INTERVAL_SHORTHAND_REGEX = "(AA|A|P|M|m|d|dd)([-+]?\\d+)";
  var REGEX = new RegExp("^" + INTERVAL_TONAL_REGEX + "|" + INTERVAL_SHORTHAND_REGEX + "$");
  function tokenizeInterval(str) {
    const m = REGEX.exec(`${str}`);
    if (m === null) {
      return ["", ""];
    }
    return m[1] ? [m[1], m[2]] : [m[4], m[3]];
  }
  var cache = {};
  function interval(src) {
    return typeof src === "string" ? cache[src] || (cache[src] = parse(src)) : (0, import_pitch.isPitch)(src) ? interval(pitchName(src)) : (0, import_pitch.isNamedPitch)(src) ? interval(src.name) : NoInterval;
  }
  var SIZES = [0, 2, 4, 5, 7, 9, 11];
  var TYPES = "PMMPPMM";
  function parse(str) {
    const tokens = tokenizeInterval(str);
    if (tokens[0] === "") {
      return NoInterval;
    }
    const num = +tokens[0];
    const q = tokens[1];
    const step = (Math.abs(num) - 1) % 7;
    const t = TYPES[step];
    if (t === "M" && q === "P") {
      return NoInterval;
    }
    const type = t === "M" ? "majorable" : "perfectable";
    const name = "" + num + q;
    const dir = num < 0 ? -1 : 1;
    const simple = num === 8 || num === -8 ? num : dir * (step + 1);
    const alt = qToAlt(type, q);
    const oct = Math.floor((Math.abs(num) - 1) / 7);
    const semitones = dir * (SIZES[step] + alt + 12 * oct);
    const chroma = (dir * (SIZES[step] + alt) % 12 + 12) % 12;
    const coord = (0, import_pitch.coordinates)({ step, alt, oct, dir });
    return {
      empty: false,
      name,
      num,
      q,
      step,
      alt,
      dir,
      type,
      simple,
      semitones,
      chroma,
      coord,
      oct
    };
  }
  function coordToInterval(coord, forceDescending) {
    const [f, o = 0] = coord;
    const isDescending = f * 7 + o * 12 < 0;
    const ivl = forceDescending || isDescending ? [-f, -o, -1] : [f, o, 1];
    return interval((0, import_pitch.pitch)(ivl));
  }
  function qToAlt(type, q) {
    return q === "M" && type === "majorable" || q === "P" && type === "perfectable" ? 0 : q === "m" && type === "majorable" ? -1 : /^A+$/.test(q) ? q.length : /^d+$/.test(q) ? -1 * (type === "perfectable" ? q.length : q.length + 1) : 0;
  }
  function pitchName(props) {
    const { step, alt, oct = 0, dir } = props;
    if (!dir) {
      return "";
    }
    const calcNum = step + 1 + 7 * oct;
    const num = calcNum === 0 ? step + 1 : calcNum;
    const d = dir < 0 ? "-" : "";
    const type = TYPES[step] === "M" ? "majorable" : "perfectable";
    const name = d + num + altToQ(type, alt);
    return name;
  }
  function altToQ(type, alt) {
    if (alt === 0) {
      return type === "majorable" ? "M" : "P";
    } else if (alt === -1 && type === "majorable") {
      return "m";
    } else if (alt > 0) {
      return fillStr("A", alt);
    } else {
      return fillStr("d", type === "perfectable" ? alt : alt + 1);
    }
  }
});

// node_modules/@tonaljs/mode/node_modules/@tonaljs/interval/dist/index.js
var require_dist32 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name2 in all)
      __defProp(target, name2, { get: all[name2], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var interval_exports = {};
  __export(interval_exports, {
    add: () => add2,
    addTo: () => addTo,
    default: () => interval_default,
    distance: () => distance,
    fromSemitones: () => fromSemitones,
    get: () => get,
    invert: () => invert,
    name: () => name,
    names: () => names,
    num: () => num,
    quality: () => quality,
    semitones: () => semitones,
    simplify: () => simplify,
    subtract: () => subtract,
    transposeFifths: () => transposeFifths
  });
  module.exports = __toCommonJS(interval_exports);
  var import_pitch_distance = require_dist5();
  var import_pitch_interval = require_dist31();
  function names() {
    return "1P 2M 3M 4P 5P 6m 7m".split(" ");
  }
  var get = import_pitch_interval.interval;
  var name = (name2) => (0, import_pitch_interval.interval)(name2).name;
  var semitones = (name2) => (0, import_pitch_interval.interval)(name2).semitones;
  var quality = (name2) => (0, import_pitch_interval.interval)(name2).q;
  var num = (name2) => (0, import_pitch_interval.interval)(name2).num;
  function simplify(name2) {
    const i = (0, import_pitch_interval.interval)(name2);
    return i.empty ? "" : i.simple + i.q;
  }
  function invert(name2) {
    const i = (0, import_pitch_interval.interval)(name2);
    if (i.empty) {
      return "";
    }
    const step = (7 - i.step) % 7;
    const alt = i.type === "perfectable" ? -i.alt : -(i.alt + 1);
    return (0, import_pitch_interval.interval)({ step, alt, oct: i.oct, dir: i.dir }).name;
  }
  var IN = [1, 2, 2, 3, 3, 4, 5, 5, 6, 6, 7, 7];
  var IQ = "P m M m M P d P m M m M".split(" ");
  function fromSemitones(semitones2) {
    const d = semitones2 < 0 ? -1 : 1;
    const n = Math.abs(semitones2);
    const c = n % 12;
    const o = Math.floor(n / 12);
    return d * (IN[c] + 7 * o) + IQ[c];
  }
  var distance = import_pitch_distance.distance;
  var add2 = combinator((a, b) => [a[0] + b[0], a[1] + b[1]]);
  var addTo = (interval) => (other) => add2(interval, other);
  var subtract = combinator((a, b) => [a[0] - b[0], a[1] - b[1]]);
  function transposeFifths(interval, fifths) {
    const ivl = get(interval);
    if (ivl.empty)
      return "";
    const [nFifths, nOcts, dir] = ivl.coord;
    return (0, import_pitch_interval.coordToInterval)([nFifths + fifths, nOcts, dir]).name;
  }
  var interval_default = {
    names,
    get,
    name,
    num,
    semitones,
    quality,
    fromSemitones,
    distance,
    invert,
    simplify,
    add: add2,
    addTo,
    subtract,
    transposeFifths
  };
  function combinator(fn) {
    return (a, b) => {
      const coordA = (0, import_pitch_interval.interval)(a).coord;
      const coordB = (0, import_pitch_interval.interval)(b).coord;
      if (coordA && coordB) {
        const coord = fn(coordA, coordB);
        return (0, import_pitch_interval.coordToInterval)(coord).name;
      }
    };
  }
});

// node_modules/@tonaljs/mode/dist/index.js
var require_dist33 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all2) => {
    for (var name in all2)
      __defProp(target, name, { get: all2[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var index_exports = {};
  __export(index_exports, {
    all: () => all,
    default: () => index_default,
    distance: () => distance,
    entries: () => entries,
    get: () => get,
    mode: () => mode,
    names: () => names,
    notes: () => notes,
    relativeTonic: () => relativeTonic,
    seventhChords: () => seventhChords,
    triads: () => triads
  });
  module.exports = __toCommonJS(index_exports);
  var import_collection = require_dist8();
  var import_interval = require_dist32();
  var import_pcset = require_dist11();
  var import_pitch_distance = require_dist5();
  var import_scale_type = require_dist20();
  var MODES = [
    [0, 2773, 0, "ionian", "", "Maj7", "major"],
    [1, 2902, 2, "dorian", "m", "m7"],
    [2, 3418, 4, "phrygian", "m", "m7"],
    [3, 2741, -1, "lydian", "", "Maj7"],
    [4, 2774, 1, "mixolydian", "", "7"],
    [5, 2906, 3, "aeolian", "m", "m7", "minor"],
    [6, 3434, 5, "locrian", "dim", "m7b5"]
  ];
  var NoMode = {
    ...import_pcset.EmptyPcset,
    name: "",
    alt: 0,
    modeNum: NaN,
    triad: "",
    seventh: "",
    aliases: []
  };
  var modes = MODES.map(toMode);
  var index = {};
  modes.forEach((mode2) => {
    index[mode2.name] = mode2;
    mode2.aliases.forEach((alias) => {
      index[alias] = mode2;
    });
  });
  function get(name) {
    return typeof name === "string" ? index[name.toLowerCase()] || NoMode : name && name.name ? get(name.name) : NoMode;
  }
  var mode = get;
  function all() {
    return modes.slice();
  }
  var entries = all;
  function names() {
    return modes.map((mode2) => mode2.name);
  }
  function toMode(mode2) {
    const [modeNum, setNum, alt, name, triad, seventh, alias] = mode2;
    const aliases = alias ? [alias] : [];
    const chroma = Number(setNum).toString(2);
    const intervals = (0, import_scale_type.get)(name).intervals;
    return {
      empty: false,
      intervals,
      modeNum,
      chroma,
      normalized: chroma,
      name,
      setNum,
      alt,
      triad,
      seventh,
      aliases
    };
  }
  function notes(modeName, tonic) {
    return get(modeName).intervals.map((ivl) => (0, import_pitch_distance.transpose)(tonic, ivl));
  }
  function chords(chords2) {
    return (modeName, tonic) => {
      const mode2 = get(modeName);
      if (mode2.empty)
        return [];
      const triads2 = (0, import_collection.rotate)(mode2.modeNum, chords2);
      const tonics = mode2.intervals.map((i) => (0, import_pitch_distance.transpose)(tonic, i));
      return triads2.map((triad, i) => tonics[i] + triad);
    };
  }
  var triads = chords(MODES.map((x) => x[4]));
  var seventhChords = chords(MODES.map((x) => x[5]));
  function distance(destination, source) {
    const from = get(source);
    const to = get(destination);
    if (from.empty || to.empty)
      return "";
    return (0, import_interval.simplify)((0, import_interval.transposeFifths)("1P", to.alt - from.alt));
  }
  function relativeTonic(destination, source, tonic) {
    return (0, import_pitch_distance.transpose)(tonic, distance(destination, source));
  }
  var index_default = {
    get,
    names,
    all,
    distance,
    relativeTonic,
    notes,
    triads,
    seventhChords,
    entries,
    mode
  };
});

// node_modules/@tonaljs/progression/node_modules/@tonaljs/chord/node_modules/@tonaljs/chord-type/dist/index.js
var require_dist34 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all2) => {
    for (var name in all2)
      __defProp(target, name, { get: all2[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var chord_type_exports = {};
  __export(chord_type_exports, {
    add: () => add2,
    addAlias: () => addAlias,
    all: () => all,
    chordType: () => chordType,
    default: () => chord_type_default,
    entries: () => entries,
    get: () => get,
    keys: () => keys,
    names: () => names,
    removeAll: () => removeAll,
    symbols: () => symbols
  });
  module.exports = __toCommonJS(chord_type_exports);
  var import_pcset = require_dist11();
  var CHORDS = [
    ["1P 3M 5P", "major", "M ^  maj"],
    ["1P 3M 5P 7M", "major seventh", "maj7 \u0394 ma7 M7 Maj7 ^7"],
    ["1P 3M 5P 7M 9M", "major ninth", "maj9 \u03949 ^9"],
    ["1P 3M 5P 7M 9M 13M", "major thirteenth", "maj13 Maj13 ^13"],
    ["1P 3M 5P 6M", "sixth", "6 add6 add13 M6"],
    ["1P 3M 5P 6M 9M", "sixth added ninth", "6add9 6/9 69 M69"],
    ["1P 3M 6m 7M", "major seventh flat sixth", "M7b6 ^7b6"],
    [
      "1P 3M 5P 7M 11A",
      "major seventh sharp eleventh",
      "maj#4 \u0394#4 \u0394#11 M7#11 ^7#11 maj7#11"
    ],
    ["1P 3m 5P", "minor", "m min -"],
    ["1P 3m 5P 7m", "minor seventh", "m7 min7 mi7 -7"],
    [
      "1P 3m 5P 7M",
      "minor/major seventh",
      "m/ma7 m/maj7 mM7 mMaj7 m/M7 -\u03947 m\u0394 -^7 -maj7"
    ],
    ["1P 3m 5P 6M", "minor sixth", "m6 -6"],
    ["1P 3m 5P 7m 9M", "minor ninth", "m9 -9"],
    ["1P 3m 5P 7M 9M", "minor/major ninth", "mM9 mMaj9 -^9"],
    ["1P 3m 5P 7m 9M 11P", "minor eleventh", "m11 -11"],
    ["1P 3m 5P 7m 9M 13M", "minor thirteenth", "m13 -13"],
    ["1P 3m 5d", "diminished", "dim \xB0 o"],
    ["1P 3m 5d 7d", "diminished seventh", "dim7 \xB07 o7"],
    ["1P 3m 5d 7m", "half-diminished", "m7b5 \xF8 -7b5 h7 h"],
    ["1P 3M 5P 7m", "dominant seventh", "7 dom"],
    ["1P 3M 5P 7m 9M", "dominant ninth", "9"],
    ["1P 3M 5P 7m 9M 13M", "dominant thirteenth", "13"],
    ["1P 3M 5P 7m 11A", "lydian dominant seventh", "7#11 7#4"],
    ["1P 3M 5P 7m 9m", "dominant flat ninth", "7b9"],
    ["1P 3M 5P 7m 9A", "dominant sharp ninth", "7#9"],
    ["1P 3M 7m 9m", "altered", "alt7"],
    ["1P 4P 5P", "suspended fourth", "sus4 sus"],
    ["1P 2M 5P", "suspended second", "sus2"],
    ["1P 4P 5P 7m", "suspended fourth seventh", "7sus4 7sus"],
    ["1P 5P 7m 9M 11P", "eleventh", "11"],
    [
      "1P 4P 5P 7m 9m",
      "suspended fourth flat ninth",
      "b9sus phryg 7b9sus 7b9sus4"
    ],
    ["1P 5P", "fifth", "5"],
    ["1P 3M 5A", "augmented", "aug + +5 ^#5"],
    ["1P 3m 5A", "minor augmented", "m#5 -#5 m+"],
    ["1P 3M 5A 7M", "augmented seventh", "maj7#5 maj7+5 +maj7 ^7#5"],
    [
      "1P 3M 5P 7M 9M 11A",
      "major sharp eleventh (lydian)",
      "maj9#11 \u03949#11 ^9#11"
    ],
    ["1P 2M 4P 5P", "", "sus24 sus4add9"],
    ["1P 3M 5A 7M 9M", "", "maj9#5 Maj9#5"],
    ["1P 3M 5A 7m", "", "7#5 +7 7+ 7aug aug7"],
    ["1P 3M 5A 7m 9A", "", "7#5#9 7#9#5 7alt"],
    ["1P 3M 5A 7m 9M", "", "9#5 9+"],
    ["1P 3M 5A 7m 9M 11A", "", "9#5#11"],
    ["1P 3M 5A 7m 9m", "", "7#5b9 7b9#5"],
    ["1P 3M 5A 7m 9m 11A", "", "7#5b9#11"],
    ["1P 3M 5A 9A", "", "+add#9"],
    ["1P 3M 5A 9M", "", "M#5add9 +add9"],
    ["1P 3M 5P 6M 11A", "", "M6#11 M6b5 6#11 6b5"],
    ["1P 3M 5P 6M 7M 9M", "", "M7add13"],
    ["1P 3M 5P 6M 9M 11A", "", "69#11"],
    ["1P 3m 5P 6M 9M", "", "m69 -69"],
    ["1P 3M 5P 6m 7m", "", "7b6"],
    ["1P 3M 5P 7M 9A 11A", "", "maj7#9#11"],
    ["1P 3M 5P 7M 9M 11A 13M", "", "M13#11 maj13#11 M13+4 M13#4"],
    ["1P 3M 5P 7M 9m", "", "M7b9"],
    ["1P 3M 5P 7m 11A 13m", "", "7#11b13 7b5b13"],
    ["1P 3M 5P 7m 13M", "", "7add6 67 7add13"],
    ["1P 3M 5P 7m 9A 11A", "", "7#9#11 7b5#9 7#9b5"],
    ["1P 3M 5P 7m 9A 11A 13M", "", "13#9#11"],
    ["1P 3M 5P 7m 9A 11A 13m", "", "7#9#11b13"],
    ["1P 3M 5P 7m 9A 13M", "", "13#9"],
    ["1P 3M 5P 7m 9A 13m", "", "7#9b13"],
    ["1P 3M 5P 7m 9M 11A", "", "9#11 9+4 9#4"],
    ["1P 3M 5P 7m 9M 11A 13M", "", "13#11 13+4 13#4"],
    ["1P 3M 5P 7m 9M 11A 13m", "", "9#11b13 9b5b13"],
    ["1P 3M 5P 7m 9m 11A", "", "7b9#11 7b5b9 7b9b5"],
    ["1P 3M 5P 7m 9m 11A 13M", "", "13b9#11"],
    ["1P 3M 5P 7m 9m 11A 13m", "", "7b9b13#11 7b9#11b13 7b5b9b13"],
    ["1P 3M 5P 7m 9m 13M", "", "13b9"],
    ["1P 3M 5P 7m 9m 13m", "", "7b9b13"],
    ["1P 3M 5P 7m 9m 9A", "", "7b9#9"],
    ["1P 3M 5P 9M", "", "Madd9 2 add9 add2"],
    ["1P 3M 5P 9m", "", "Maddb9"],
    ["1P 3M 5d", "", "Mb5"],
    ["1P 3M 5d 6M 7m 9M", "", "13b5"],
    ["1P 3M 5d 7M", "", "M7b5"],
    ["1P 3M 5d 7M 9M", "", "M9b5"],
    ["1P 3M 5d 7m", "", "7b5"],
    ["1P 3M 5d 7m 9M", "", "9b5"],
    ["1P 3M 7m", "", "7no5"],
    ["1P 3M 7m 13m", "", "7b13"],
    ["1P 3M 7m 9M", "", "9no5"],
    ["1P 3M 7m 9M 13M", "", "13no5"],
    ["1P 3M 7m 9M 13m", "", "9b13"],
    ["1P 3m 4P 5P", "", "madd4"],
    ["1P 3m 5P 6m 7M", "", "mMaj7b6"],
    ["1P 3m 5P 6m 7M 9M", "", "mMaj9b6"],
    ["1P 3m 5P 7m 11P", "", "m7add11 m7add4"],
    ["1P 3m 5P 9M", "", "madd9"],
    ["1P 3m 5d 6M 7M", "", "o7M7"],
    ["1P 3m 5d 7M", "", "oM7"],
    ["1P 3m 6m 7M", "", "mb6M7"],
    ["1P 3m 6m 7m", "", "m7#5"],
    ["1P 3m 6m 7m 9M", "", "m9#5"],
    ["1P 3m 5A 7m 9M 11P", "", "m11A"],
    ["1P 3m 6m 9m", "", "mb6b9"],
    ["1P 2M 3m 5d 7m", "", "m9b5"],
    ["1P 4P 5A 7M", "", "M7#5sus4"],
    ["1P 4P 5A 7M 9M", "", "M9#5sus4"],
    ["1P 4P 5A 7m", "", "7#5sus4"],
    ["1P 4P 5P 7M", "", "M7sus4"],
    ["1P 4P 5P 7M 9M", "", "M9sus4"],
    ["1P 4P 5P 7m 9M", "", "9sus4 9sus"],
    ["1P 4P 5P 7m 9M 13M", "", "13sus4 13sus"],
    ["1P 4P 5P 7m 9m 13m", "", "7sus4b9b13 7b9b13sus4"],
    ["1P 4P 7m 10m", "", "4 quartal"],
    ["1P 5P 7m 9m 11P", "", "11b9"]
  ];
  var data_default = CHORDS;
  var NoChordType = {
    ...import_pcset.EmptyPcset,
    name: "",
    quality: "Unknown",
    intervals: [],
    aliases: []
  };
  var dictionary = [];
  var index = {};
  function get(type) {
    return index[type] || NoChordType;
  }
  var chordType = get;
  function names() {
    return dictionary.map((chord) => chord.name).filter((x) => x);
  }
  function symbols() {
    return dictionary.map((chord) => chord.aliases[0]).filter((x) => x);
  }
  function keys() {
    return Object.keys(index);
  }
  function all() {
    return dictionary.slice();
  }
  var entries = all;
  function removeAll() {
    dictionary = [];
    index = {};
  }
  function add2(intervals, aliases, fullName) {
    const quality = getQuality(intervals);
    const chord = {
      ...(0, import_pcset.get)(intervals),
      name: fullName || "",
      quality,
      intervals,
      aliases
    };
    dictionary.push(chord);
    if (chord.name) {
      index[chord.name] = chord;
    }
    index[chord.setNum] = chord;
    index[chord.chroma] = chord;
    chord.aliases.forEach((alias) => addAlias(chord, alias));
  }
  function addAlias(chord, alias) {
    index[alias] = chord;
  }
  function getQuality(intervals) {
    const has = (interval) => intervals.indexOf(interval) !== -1;
    return has("5A") ? "Augmented" : has("3M") ? "Major" : has("5d") ? "Diminished" : has("3m") ? "Minor" : "Unknown";
  }
  data_default.forEach(([ivls, fullName, names2]) => add2(ivls.split(" "), names2.split(" "), fullName));
  dictionary.sort((a, b) => a.setNum - b.setNum);
  var chord_type_default = {
    names,
    symbols,
    get,
    all,
    add: add2,
    removeAll,
    keys,
    entries,
    chordType
  };
});

// node_modules/@tonaljs/progression/node_modules/@tonaljs/pitch-interval/node_modules/@tonaljs/pitch/dist/index.js
var require_dist35 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var pitch_exports = {};
  __export(pitch_exports, {
    chroma: () => chroma,
    coordinates: () => coordinates,
    height: () => height,
    isNamedPitch: () => isNamedPitch,
    isPitch: () => isPitch,
    midi: () => midi2,
    pitch: () => pitch
  });
  module.exports = __toCommonJS(pitch_exports);
  function isNamedPitch(src) {
    return src !== null && typeof src === "object" && "name" in src && typeof src.name === "string" ? true : false;
  }
  var SIZES = [0, 2, 4, 5, 7, 9, 11];
  var chroma = ({ step, alt }) => (SIZES[step] + alt + 120) % 12;
  var height = ({ step, alt, oct, dir = 1 }) => dir * (SIZES[step] + alt + 12 * (oct === undefined ? -100 : oct));
  var midi2 = (pitch2) => {
    const h = height(pitch2);
    return pitch2.oct !== undefined && h >= -12 && h <= 115 ? h + 12 : null;
  };
  function isPitch(pitch2) {
    return pitch2 !== null && typeof pitch2 === "object" && "step" in pitch2 && typeof pitch2.step === "number" && "alt" in pitch2 && typeof pitch2.alt === "number" && !isNaN(pitch2.step) && !isNaN(pitch2.alt) ? true : false;
  }
  var FIFTHS = [0, 2, 4, -1, 1, 3, 5];
  var STEPS_TO_OCTS = FIFTHS.map((fifths) => Math.floor(fifths * 7 / 12));
  function coordinates(pitch2) {
    const { step, alt, oct, dir = 1 } = pitch2;
    const f = FIFTHS[step] + 7 * alt;
    if (oct === undefined) {
      return [dir * f];
    }
    const o = oct - STEPS_TO_OCTS[step] - 4 * alt;
    return [dir * f, dir * o];
  }
  var FIFTHS_TO_STEPS = [3, 0, 4, 1, 5, 2, 6];
  function pitch(coord) {
    const [f, o, dir] = coord;
    const step = FIFTHS_TO_STEPS[unaltered(f)];
    const alt = Math.floor((f + 1) / 7);
    if (o === undefined) {
      return { step, alt, dir };
    }
    const oct = o + 4 * alt + STEPS_TO_OCTS[step];
    return { step, alt, oct, dir };
  }
  function unaltered(f) {
    const i = (f + 1) % 7;
    return i < 0 ? 7 + i : i;
  }
});

// node_modules/@tonaljs/progression/node_modules/@tonaljs/pitch-interval/dist/index.js
var require_dist36 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var pitch_interval_exports = {};
  __export(pitch_interval_exports, {
    coordToInterval: () => coordToInterval,
    interval: () => interval,
    tokenizeInterval: () => tokenizeInterval
  });
  module.exports = __toCommonJS(pitch_interval_exports);
  var import_pitch = require_dist35();
  var fillStr = (s, n) => Array(Math.abs(n) + 1).join(s);
  var NoInterval = Object.freeze({
    empty: true,
    name: "",
    num: NaN,
    q: "",
    type: "",
    step: NaN,
    alt: NaN,
    dir: NaN,
    simple: NaN,
    semitones: NaN,
    chroma: NaN,
    coord: [],
    oct: NaN
  });
  var INTERVAL_TONAL_REGEX = "([-+]?\\d+)(d{1,4}|m|M|P|A{1,4})";
  var INTERVAL_SHORTHAND_REGEX = "(AA|A|P|M|m|d|dd)([-+]?\\d+)";
  var REGEX = new RegExp("^" + INTERVAL_TONAL_REGEX + "|" + INTERVAL_SHORTHAND_REGEX + "$");
  function tokenizeInterval(str) {
    const m = REGEX.exec(`${str}`);
    if (m === null) {
      return ["", ""];
    }
    return m[1] ? [m[1], m[2]] : [m[4], m[3]];
  }
  var cache = {};
  function interval(src) {
    return typeof src === "string" ? cache[src] || (cache[src] = parse(src)) : (0, import_pitch.isPitch)(src) ? interval(pitchName(src)) : (0, import_pitch.isNamedPitch)(src) ? interval(src.name) : NoInterval;
  }
  var SIZES = [0, 2, 4, 5, 7, 9, 11];
  var TYPES = "PMMPPMM";
  function parse(str) {
    const tokens = tokenizeInterval(str);
    if (tokens[0] === "") {
      return NoInterval;
    }
    const num = +tokens[0];
    const q = tokens[1];
    const step = (Math.abs(num) - 1) % 7;
    const t = TYPES[step];
    if (t === "M" && q === "P") {
      return NoInterval;
    }
    const type = t === "M" ? "majorable" : "perfectable";
    const name = "" + num + q;
    const dir = num < 0 ? -1 : 1;
    const simple = num === 8 || num === -8 ? num : dir * (step + 1);
    const alt = qToAlt(type, q);
    const oct = Math.floor((Math.abs(num) - 1) / 7);
    const semitones = dir * (SIZES[step] + alt + 12 * oct);
    const chroma = (dir * (SIZES[step] + alt) % 12 + 12) % 12;
    const coord = (0, import_pitch.coordinates)({ step, alt, oct, dir });
    return {
      empty: false,
      name,
      num,
      q,
      step,
      alt,
      dir,
      type,
      simple,
      semitones,
      chroma,
      coord,
      oct
    };
  }
  function coordToInterval(coord, forceDescending) {
    const [f, o = 0] = coord;
    const isDescending = f * 7 + o * 12 < 0;
    const ivl = forceDescending || isDescending ? [-f, -o, -1] : [f, o, 1];
    return interval((0, import_pitch.pitch)(ivl));
  }
  function qToAlt(type, q) {
    return q === "M" && type === "majorable" || q === "P" && type === "perfectable" ? 0 : q === "m" && type === "majorable" ? -1 : /^A+$/.test(q) ? q.length : /^d+$/.test(q) ? -1 * (type === "perfectable" ? q.length : q.length + 1) : 0;
  }
  function pitchName(props) {
    const { step, alt, oct = 0, dir } = props;
    if (!dir) {
      return "";
    }
    const calcNum = step + 1 + 7 * oct;
    const num = calcNum === 0 ? step + 1 : calcNum;
    const d = dir < 0 ? "-" : "";
    const type = TYPES[step] === "M" ? "majorable" : "perfectable";
    const name = d + num + altToQ(type, alt);
    return name;
  }
  function altToQ(type, alt) {
    if (alt === 0) {
      return type === "majorable" ? "M" : "P";
    } else if (alt === -1 && type === "majorable") {
      return "m";
    } else if (alt > 0) {
      return fillStr("A", alt);
    } else {
      return fillStr("d", type === "perfectable" ? alt : alt + 1);
    }
  }
});

// node_modules/@tonaljs/progression/node_modules/@tonaljs/chord/node_modules/@tonaljs/interval/dist/index.js
var require_dist37 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name2 in all)
      __defProp(target, name2, { get: all[name2], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var interval_exports = {};
  __export(interval_exports, {
    add: () => add2,
    addTo: () => addTo,
    default: () => interval_default,
    distance: () => distance,
    fromSemitones: () => fromSemitones,
    get: () => get,
    invert: () => invert,
    name: () => name,
    names: () => names,
    num: () => num,
    quality: () => quality,
    semitones: () => semitones,
    simplify: () => simplify,
    subtract: () => subtract,
    transposeFifths: () => transposeFifths
  });
  module.exports = __toCommonJS(interval_exports);
  var import_pitch_distance = require_dist5();
  var import_pitch_interval = require_dist36();
  function names() {
    return "1P 2M 3M 4P 5P 6m 7m".split(" ");
  }
  var get = import_pitch_interval.interval;
  var name = (name2) => (0, import_pitch_interval.interval)(name2).name;
  var semitones = (name2) => (0, import_pitch_interval.interval)(name2).semitones;
  var quality = (name2) => (0, import_pitch_interval.interval)(name2).q;
  var num = (name2) => (0, import_pitch_interval.interval)(name2).num;
  function simplify(name2) {
    const i = (0, import_pitch_interval.interval)(name2);
    return i.empty ? "" : i.simple + i.q;
  }
  function invert(name2) {
    const i = (0, import_pitch_interval.interval)(name2);
    if (i.empty) {
      return "";
    }
    const step = (7 - i.step) % 7;
    const alt = i.type === "perfectable" ? -i.alt : -(i.alt + 1);
    return (0, import_pitch_interval.interval)({ step, alt, oct: i.oct, dir: i.dir }).name;
  }
  var IN = [1, 2, 2, 3, 3, 4, 5, 5, 6, 6, 7, 7];
  var IQ = "P m M m M P d P m M m M".split(" ");
  function fromSemitones(semitones2) {
    const d = semitones2 < 0 ? -1 : 1;
    const n = Math.abs(semitones2);
    const c = n % 12;
    const o = Math.floor(n / 12);
    return d * (IN[c] + 7 * o) + IQ[c];
  }
  var distance = import_pitch_distance.distance;
  var add2 = combinator((a, b) => [a[0] + b[0], a[1] + b[1]]);
  var addTo = (interval) => (other) => add2(interval, other);
  var subtract = combinator((a, b) => [a[0] - b[0], a[1] - b[1]]);
  function transposeFifths(interval, fifths) {
    const ivl = get(interval);
    if (ivl.empty)
      return "";
    const [nFifths, nOcts, dir] = ivl.coord;
    return (0, import_pitch_interval.coordToInterval)([nFifths + fifths, nOcts, dir]).name;
  }
  var interval_default = {
    names,
    get,
    name,
    num,
    semitones,
    quality,
    fromSemitones,
    distance,
    invert,
    simplify,
    add: add2,
    addTo,
    subtract,
    transposeFifths
  };
  function combinator(fn) {
    return (a, b) => {
      const coordA = (0, import_pitch_interval.interval)(a).coord;
      const coordB = (0, import_pitch_interval.interval)(b).coord;
      if (coordA && coordB) {
        const coord = fn(coordA, coordB);
        return (0, import_pitch_interval.coordToInterval)(coord).name;
      }
    };
  }
});

// node_modules/@tonaljs/progression/node_modules/@tonaljs/chord/dist/index.js
var require_dist38 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var index_exports = {};
  __export(index_exports, {
    chord: () => chord,
    chordScales: () => chordScales,
    default: () => index_default,
    degrees: () => degrees,
    detect: () => import_chord_detect2.detect,
    extended: () => extended,
    get: () => get,
    getChord: () => getChord,
    notes: () => notes,
    reduced: () => reduced,
    steps: () => steps,
    tokenize: () => tokenize,
    transpose: () => transpose
  });
  module.exports = __toCommonJS(index_exports);
  var import_chord_detect = require_dist13();
  var import_chord_type = require_dist34();
  var import_interval = require_dist37();
  var import_pcset = require_dist11();
  var import_pitch_distance = require_dist5();
  var import_pitch_note = require_dist4();
  var import_scale_type = require_dist20();
  var import_chord_detect2 = require_dist13();
  var NoChord = {
    empty: true,
    name: "",
    symbol: "",
    root: "",
    bass: "",
    rootDegree: 0,
    type: "",
    tonic: null,
    setNum: NaN,
    quality: "Unknown",
    chroma: "",
    normalized: "",
    aliases: [],
    notes: [],
    intervals: []
  };
  function tokenize(name) {
    const [letter, acc, oct, type] = (0, import_pitch_note.tokenizeNote)(name);
    if (letter === "") {
      return tokenizeBass("", name);
    } else if (letter === "A" && type === "ug") {
      return tokenizeBass("", "aug");
    } else {
      return tokenizeBass(letter + acc, oct + type);
    }
  }
  function tokenizeBass(note2, chord2) {
    const split = chord2.split("/");
    if (split.length === 1) {
      return [note2, split[0], ""];
    }
    const [letter, acc, oct, type] = (0, import_pitch_note.tokenizeNote)(split[1]);
    if (letter !== "" && oct === "" && type === "") {
      return [note2, split[0], letter + acc];
    } else {
      return [note2, chord2, ""];
    }
  }
  function get(src) {
    if (Array.isArray(src)) {
      return getChord(src[1] || "", src[0], src[2]);
    } else if (src === "") {
      return NoChord;
    } else {
      const [tonic, type, bass] = tokenize(src);
      const chord2 = getChord(type, tonic, bass);
      return chord2.empty ? getChord(src) : chord2;
    }
  }
  function getChord(typeName, optionalTonic, optionalBass) {
    const type = (0, import_chord_type.get)(typeName);
    const tonic = (0, import_pitch_note.note)(optionalTonic || "");
    const bass = (0, import_pitch_note.note)(optionalBass || "");
    if (type.empty || optionalTonic && tonic.empty || optionalBass && bass.empty) {
      return NoChord;
    }
    const bassInterval = (0, import_pitch_distance.distance)(tonic.pc, bass.pc);
    const bassIndex = type.intervals.indexOf(bassInterval);
    const hasRoot = bassIndex >= 0;
    const root = hasRoot ? bass : (0, import_pitch_note.note)("");
    const rootDegree = bassIndex === -1 ? NaN : bassIndex + 1;
    const hasBass = bass.pc && bass.pc !== tonic.pc;
    const intervals = Array.from(type.intervals);
    if (hasRoot) {
      for (let i = 1;i < rootDegree; i++) {
        const num = intervals[0][0];
        const quality = intervals[0][1];
        const newNum = parseInt(num, 10) + 7;
        intervals.push(`${newNum}${quality}`);
        intervals.shift();
      }
    } else if (hasBass) {
      const ivl = (0, import_interval.subtract)((0, import_pitch_distance.distance)(tonic.pc, bass.pc), "8P");
      if (ivl)
        intervals.unshift(ivl);
    }
    const notes2 = tonic.empty ? [] : intervals.map((i) => (0, import_pitch_distance.transpose)(tonic.pc, i));
    typeName = type.aliases.indexOf(typeName) !== -1 ? typeName : type.aliases[0];
    const symbol = `${tonic.empty ? "" : tonic.pc}${typeName}${hasRoot && rootDegree > 1 ? "/" + root.pc : hasBass ? "/" + bass.pc : ""}`;
    const name = `${optionalTonic ? tonic.pc + " " : ""}${type.name}${hasRoot && rootDegree > 1 ? " over " + root.pc : hasBass ? " over " + bass.pc : ""}`;
    return {
      ...type,
      name,
      symbol,
      tonic: tonic.pc,
      type: type.name,
      root: root.pc,
      bass: hasBass ? bass.pc : "",
      intervals,
      rootDegree,
      notes: notes2
    };
  }
  var chord = get;
  function transpose(chordName, interval) {
    const [tonic, type, bass] = tokenize(chordName);
    if (!tonic) {
      return chordName;
    }
    const tr = (0, import_pitch_distance.transpose)(bass, interval);
    const slash = tr ? "/" + tr : "";
    return (0, import_pitch_distance.transpose)(tonic, interval) + type + slash;
  }
  function chordScales(name) {
    const s = get(name);
    const isChordIncluded = (0, import_pcset.isSupersetOf)(s.chroma);
    return (0, import_scale_type.all)().filter((scale) => isChordIncluded(scale.chroma)).map((scale) => scale.name);
  }
  function extended(chordName) {
    const s = get(chordName);
    const isSuperset = (0, import_pcset.isSupersetOf)(s.chroma);
    return (0, import_chord_type.all)().filter((chord2) => isSuperset(chord2.chroma)).map((chord2) => s.tonic + chord2.aliases[0]);
  }
  function reduced(chordName) {
    const s = get(chordName);
    const isSubset = (0, import_pcset.isSubsetOf)(s.chroma);
    return (0, import_chord_type.all)().filter((chord2) => isSubset(chord2.chroma)).map((chord2) => s.tonic + chord2.aliases[0]);
  }
  function notes(chordName, tonic) {
    const chord2 = get(chordName);
    const note2 = tonic || chord2.tonic;
    if (!note2 || chord2.empty)
      return [];
    return chord2.intervals.map((ivl) => (0, import_pitch_distance.transpose)(note2, ivl));
  }
  function degrees(chordName, tonic) {
    const chord2 = get(chordName);
    const note2 = tonic || chord2.tonic;
    const transpose2 = (0, import_pitch_distance.tonicIntervalsTransposer)(chord2.intervals, note2);
    return (degree) => degree ? transpose2(degree > 0 ? degree - 1 : degree) : "";
  }
  function steps(chordName, tonic) {
    const chord2 = get(chordName);
    const note2 = tonic || chord2.tonic;
    return (0, import_pitch_distance.tonicIntervalsTransposer)(chord2.intervals, note2);
  }
  var index_default = {
    getChord,
    get,
    detect: import_chord_detect.detect,
    chordScales,
    extended,
    reduced,
    tokenize,
    transpose,
    degrees,
    steps,
    notes,
    chord
  };
});

// node_modules/@tonaljs/progression/dist/index.js
var require_dist39 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var index_exports = {};
  __export(index_exports, {
    default: () => index_default,
    fromRomanNumerals: () => fromRomanNumerals,
    toRomanNumerals: () => toRomanNumerals
  });
  module.exports = __toCommonJS(index_exports);
  var import_chord = require_dist38();
  var import_pitch_distance = require_dist5();
  var import_pitch_interval = require_dist36();
  var import_roman_numeral = require_dist28();
  function fromRomanNumerals(tonic, chords) {
    const romanNumerals = chords.map(import_roman_numeral.get);
    return romanNumerals.map((rn) => (0, import_pitch_distance.transpose)(tonic, (0, import_pitch_interval.interval)(rn)) + rn.chordType);
  }
  function toRomanNumerals(tonic, chords) {
    return chords.map((chord) => {
      const [note, chordType] = (0, import_chord.tokenize)(chord);
      const intervalName = (0, import_pitch_distance.distance)(tonic, note);
      const roman = (0, import_roman_numeral.get)((0, import_pitch_interval.interval)(intervalName));
      return roman.name + chordType;
    });
  }
  var index_default = { fromRomanNumerals, toRomanNumerals };
});

// node_modules/@tonaljs/range/dist/index.js
var require_dist40 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var index_exports = {};
  __export(index_exports, {
    chromatic: () => chromatic,
    default: () => index_default,
    numeric: () => numeric
  });
  module.exports = __toCommonJS(index_exports);
  var import_collection = require_dist8();
  var import_midi = require_dist24();
  function numeric(notes) {
    const midi2 = (0, import_collection.compact)(notes.map((note) => typeof note === "number" ? note : (0, import_midi.toMidi)(note)));
    if (!notes.length || midi2.length !== notes.length) {
      return [];
    }
    return midi2.reduce((result, note) => {
      const last = result[result.length - 1];
      return result.concat((0, import_collection.range)(last, note).slice(1));
    }, [midi2[0]]);
  }
  function chromatic(notes, options) {
    return numeric(notes).map((midi2) => (0, import_midi.midiToNoteName)(midi2, options));
  }
  var index_default = { numeric, chromatic };
});

// node_modules/@tonaljs/scale/node_modules/@tonaljs/chord-type/dist/index.js
var require_dist41 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all2) => {
    for (var name in all2)
      __defProp(target, name, { get: all2[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var chord_type_exports = {};
  __export(chord_type_exports, {
    add: () => add2,
    addAlias: () => addAlias,
    all: () => all,
    chordType: () => chordType,
    default: () => chord_type_default,
    entries: () => entries,
    get: () => get,
    keys: () => keys,
    names: () => names,
    removeAll: () => removeAll,
    symbols: () => symbols
  });
  module.exports = __toCommonJS(chord_type_exports);
  var import_pcset = require_dist11();
  var CHORDS = [
    ["1P 3M 5P", "major", "M ^  maj"],
    ["1P 3M 5P 7M", "major seventh", "maj7 \u0394 ma7 M7 Maj7 ^7"],
    ["1P 3M 5P 7M 9M", "major ninth", "maj9 \u03949 ^9"],
    ["1P 3M 5P 7M 9M 13M", "major thirteenth", "maj13 Maj13 ^13"],
    ["1P 3M 5P 6M", "sixth", "6 add6 add13 M6"],
    ["1P 3M 5P 6M 9M", "sixth added ninth", "6add9 6/9 69 M69"],
    ["1P 3M 6m 7M", "major seventh flat sixth", "M7b6 ^7b6"],
    [
      "1P 3M 5P 7M 11A",
      "major seventh sharp eleventh",
      "maj#4 \u0394#4 \u0394#11 M7#11 ^7#11 maj7#11"
    ],
    ["1P 3m 5P", "minor", "m min -"],
    ["1P 3m 5P 7m", "minor seventh", "m7 min7 mi7 -7"],
    [
      "1P 3m 5P 7M",
      "minor/major seventh",
      "m/ma7 m/maj7 mM7 mMaj7 m/M7 -\u03947 m\u0394 -^7 -maj7"
    ],
    ["1P 3m 5P 6M", "minor sixth", "m6 -6"],
    ["1P 3m 5P 7m 9M", "minor ninth", "m9 -9"],
    ["1P 3m 5P 7M 9M", "minor/major ninth", "mM9 mMaj9 -^9"],
    ["1P 3m 5P 7m 9M 11P", "minor eleventh", "m11 -11"],
    ["1P 3m 5P 7m 9M 13M", "minor thirteenth", "m13 -13"],
    ["1P 3m 5d", "diminished", "dim \xB0 o"],
    ["1P 3m 5d 7d", "diminished seventh", "dim7 \xB07 o7"],
    ["1P 3m 5d 7m", "half-diminished", "m7b5 \xF8 -7b5 h7 h"],
    ["1P 3M 5P 7m", "dominant seventh", "7 dom"],
    ["1P 3M 5P 7m 9M", "dominant ninth", "9"],
    ["1P 3M 5P 7m 9M 13M", "dominant thirteenth", "13"],
    ["1P 3M 5P 7m 11A", "lydian dominant seventh", "7#11 7#4"],
    ["1P 3M 5P 7m 9m", "dominant flat ninth", "7b9"],
    ["1P 3M 5P 7m 9A", "dominant sharp ninth", "7#9"],
    ["1P 3M 7m 9m", "altered", "alt7"],
    ["1P 4P 5P", "suspended fourth", "sus4 sus"],
    ["1P 2M 5P", "suspended second", "sus2"],
    ["1P 4P 5P 7m", "suspended fourth seventh", "7sus4 7sus"],
    ["1P 5P 7m 9M 11P", "eleventh", "11"],
    [
      "1P 4P 5P 7m 9m",
      "suspended fourth flat ninth",
      "b9sus phryg 7b9sus 7b9sus4"
    ],
    ["1P 5P", "fifth", "5"],
    ["1P 3M 5A", "augmented", "aug + +5 ^#5"],
    ["1P 3m 5A", "minor augmented", "m#5 -#5 m+"],
    ["1P 3M 5A 7M", "augmented seventh", "maj7#5 maj7+5 +maj7 ^7#5"],
    [
      "1P 3M 5P 7M 9M 11A",
      "major sharp eleventh (lydian)",
      "maj9#11 \u03949#11 ^9#11"
    ],
    ["1P 2M 4P 5P", "", "sus24 sus4add9"],
    ["1P 3M 5A 7M 9M", "", "maj9#5 Maj9#5"],
    ["1P 3M 5A 7m", "", "7#5 +7 7+ 7aug aug7"],
    ["1P 3M 5A 7m 9A", "", "7#5#9 7#9#5 7alt"],
    ["1P 3M 5A 7m 9M", "", "9#5 9+"],
    ["1P 3M 5A 7m 9M 11A", "", "9#5#11"],
    ["1P 3M 5A 7m 9m", "", "7#5b9 7b9#5"],
    ["1P 3M 5A 7m 9m 11A", "", "7#5b9#11"],
    ["1P 3M 5A 9A", "", "+add#9"],
    ["1P 3M 5A 9M", "", "M#5add9 +add9"],
    ["1P 3M 5P 6M 11A", "", "M6#11 M6b5 6#11 6b5"],
    ["1P 3M 5P 6M 7M 9M", "", "M7add13"],
    ["1P 3M 5P 6M 9M 11A", "", "69#11"],
    ["1P 3m 5P 6M 9M", "", "m69 -69"],
    ["1P 3M 5P 6m 7m", "", "7b6"],
    ["1P 3M 5P 7M 9A 11A", "", "maj7#9#11"],
    ["1P 3M 5P 7M 9M 11A 13M", "", "M13#11 maj13#11 M13+4 M13#4"],
    ["1P 3M 5P 7M 9m", "", "M7b9"],
    ["1P 3M 5P 7m 11A 13m", "", "7#11b13 7b5b13"],
    ["1P 3M 5P 7m 13M", "", "7add6 67 7add13"],
    ["1P 3M 5P 7m 9A 11A", "", "7#9#11 7b5#9 7#9b5"],
    ["1P 3M 5P 7m 9A 11A 13M", "", "13#9#11"],
    ["1P 3M 5P 7m 9A 11A 13m", "", "7#9#11b13"],
    ["1P 3M 5P 7m 9A 13M", "", "13#9"],
    ["1P 3M 5P 7m 9A 13m", "", "7#9b13"],
    ["1P 3M 5P 7m 9M 11A", "", "9#11 9+4 9#4"],
    ["1P 3M 5P 7m 9M 11A 13M", "", "13#11 13+4 13#4"],
    ["1P 3M 5P 7m 9M 11A 13m", "", "9#11b13 9b5b13"],
    ["1P 3M 5P 7m 9m 11A", "", "7b9#11 7b5b9 7b9b5"],
    ["1P 3M 5P 7m 9m 11A 13M", "", "13b9#11"],
    ["1P 3M 5P 7m 9m 11A 13m", "", "7b9b13#11 7b9#11b13 7b5b9b13"],
    ["1P 3M 5P 7m 9m 13M", "", "13b9"],
    ["1P 3M 5P 7m 9m 13m", "", "7b9b13"],
    ["1P 3M 5P 7m 9m 9A", "", "7b9#9"],
    ["1P 3M 5P 9M", "", "Madd9 2 add9 add2"],
    ["1P 3M 5P 9m", "", "Maddb9"],
    ["1P 3M 5d", "", "Mb5"],
    ["1P 3M 5d 6M 7m 9M", "", "13b5"],
    ["1P 3M 5d 7M", "", "M7b5"],
    ["1P 3M 5d 7M 9M", "", "M9b5"],
    ["1P 3M 5d 7m", "", "7b5"],
    ["1P 3M 5d 7m 9M", "", "9b5"],
    ["1P 3M 7m", "", "7no5"],
    ["1P 3M 7m 13m", "", "7b13"],
    ["1P 3M 7m 9M", "", "9no5"],
    ["1P 3M 7m 9M 13M", "", "13no5"],
    ["1P 3M 7m 9M 13m", "", "9b13"],
    ["1P 3m 4P 5P", "", "madd4"],
    ["1P 3m 5P 6m 7M", "", "mMaj7b6"],
    ["1P 3m 5P 6m 7M 9M", "", "mMaj9b6"],
    ["1P 3m 5P 7m 11P", "", "m7add11 m7add4"],
    ["1P 3m 5P 9M", "", "madd9"],
    ["1P 3m 5d 6M 7M", "", "o7M7"],
    ["1P 3m 5d 7M", "", "oM7"],
    ["1P 3m 6m 7M", "", "mb6M7"],
    ["1P 3m 6m 7m", "", "m7#5"],
    ["1P 3m 6m 7m 9M", "", "m9#5"],
    ["1P 3m 5A 7m 9M 11P", "", "m11A"],
    ["1P 3m 6m 9m", "", "mb6b9"],
    ["1P 2M 3m 5d 7m", "", "m9b5"],
    ["1P 4P 5A 7M", "", "M7#5sus4"],
    ["1P 4P 5A 7M 9M", "", "M9#5sus4"],
    ["1P 4P 5A 7m", "", "7#5sus4"],
    ["1P 4P 5P 7M", "", "M7sus4"],
    ["1P 4P 5P 7M 9M", "", "M9sus4"],
    ["1P 4P 5P 7m 9M", "", "9sus4 9sus"],
    ["1P 4P 5P 7m 9M 13M", "", "13sus4 13sus"],
    ["1P 4P 5P 7m 9m 13m", "", "7sus4b9b13 7b9b13sus4"],
    ["1P 4P 7m 10m", "", "4 quartal"],
    ["1P 5P 7m 9m 11P", "", "11b9"]
  ];
  var data_default = CHORDS;
  var NoChordType = {
    ...import_pcset.EmptyPcset,
    name: "",
    quality: "Unknown",
    intervals: [],
    aliases: []
  };
  var dictionary = [];
  var index = {};
  function get(type) {
    return index[type] || NoChordType;
  }
  var chordType = get;
  function names() {
    return dictionary.map((chord) => chord.name).filter((x) => x);
  }
  function symbols() {
    return dictionary.map((chord) => chord.aliases[0]).filter((x) => x);
  }
  function keys() {
    return Object.keys(index);
  }
  function all() {
    return dictionary.slice();
  }
  var entries = all;
  function removeAll() {
    dictionary = [];
    index = {};
  }
  function add2(intervals, aliases, fullName) {
    const quality = getQuality(intervals);
    const chord = {
      ...(0, import_pcset.get)(intervals),
      name: fullName || "",
      quality,
      intervals,
      aliases
    };
    dictionary.push(chord);
    if (chord.name) {
      index[chord.name] = chord;
    }
    index[chord.setNum] = chord;
    index[chord.chroma] = chord;
    chord.aliases.forEach((alias) => addAlias(chord, alias));
  }
  function addAlias(chord, alias) {
    index[alias] = chord;
  }
  function getQuality(intervals) {
    const has = (interval) => intervals.indexOf(interval) !== -1;
    return has("5A") ? "Augmented" : has("3M") ? "Major" : has("5d") ? "Diminished" : has("3m") ? "Minor" : "Unknown";
  }
  data_default.forEach(([ivls, fullName, names2]) => add2(ivls.split(" "), names2.split(" "), fullName));
  dictionary.sort((a, b) => a.setNum - b.setNum);
  var chord_type_default = {
    names,
    symbols,
    get,
    all,
    add: add2,
    removeAll,
    keys,
    entries,
    chordType
  };
});

// node_modules/@tonaljs/scale/dist/index.js
var require_dist42 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all2) => {
    for (var name in all2)
      __defProp(target, name, { get: all2[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var index_exports = {};
  __export(index_exports, {
    default: () => index_default,
    degrees: () => degrees,
    detect: () => detect2,
    extended: () => extended,
    get: () => get,
    modeNames: () => modeNames,
    names: () => names,
    rangeOf: () => rangeOf,
    reduced: () => reduced,
    scale: () => scale,
    scaleChords: () => scaleChords,
    scaleNotes: () => scaleNotes,
    steps: () => steps,
    tokenize: () => tokenize
  });
  module.exports = __toCommonJS(index_exports);
  var import_chord_type = require_dist41();
  var import_collection = require_dist8();
  var import_note = require_dist25();
  var import_pcset = require_dist11();
  var import_pitch_distance = require_dist5();
  var import_pitch_note = require_dist4();
  var import_scale_type = require_dist20();
  var NoScale = {
    empty: true,
    name: "",
    type: "",
    tonic: null,
    setNum: NaN,
    chroma: "",
    normalized: "",
    aliases: [],
    notes: [],
    intervals: []
  };
  function tokenize(name) {
    if (typeof name !== "string") {
      return ["", ""];
    }
    const i = name.indexOf(" ");
    const tonic = (0, import_pitch_note.note)(name.substring(0, i));
    if (tonic.empty) {
      const n = (0, import_pitch_note.note)(name);
      return n.empty ? ["", name.toLowerCase()] : [n.name, ""];
    }
    const type = name.substring(tonic.name.length + 1).toLowerCase();
    return [tonic.name, type.length ? type : ""];
  }
  var names = import_scale_type.names;
  function get(src) {
    const tokens = Array.isArray(src) ? src : tokenize(src);
    const tonic = (0, import_pitch_note.note)(tokens[0]).name;
    const st = (0, import_scale_type.get)(tokens[1]);
    if (st.empty) {
      return NoScale;
    }
    const type = st.name;
    const notes = tonic ? st.intervals.map((i) => (0, import_pitch_distance.transpose)(tonic, i)) : [];
    const name = tonic ? tonic + " " + type : type;
    return { ...st, name, type, tonic, notes };
  }
  var scale = get;
  function detect2(notes, options = {}) {
    const notesChroma = (0, import_pcset.chroma)(notes);
    const tonic = (0, import_pitch_note.note)(options.tonic ?? notes[0] ?? "");
    const tonicChroma = tonic.chroma;
    if (tonicChroma === undefined) {
      return [];
    }
    const pitchClasses = notesChroma.split("");
    pitchClasses[tonicChroma] = "1";
    const scaleChroma = (0, import_collection.rotate)(tonicChroma, pitchClasses).join("");
    const match = (0, import_scale_type.all)().find((scaleType) => scaleType.chroma === scaleChroma);
    const results = [];
    if (match) {
      results.push(tonic.name + " " + match.name);
    }
    if (options.match === "exact") {
      return results;
    }
    extended(scaleChroma).forEach((scaleName) => {
      results.push(tonic.name + " " + scaleName);
    });
    return results;
  }
  function scaleChords(name) {
    const s = get(name);
    const inScale = (0, import_pcset.isSubsetOf)(s.chroma);
    return (0, import_chord_type.all)().filter((chord) => inScale(chord.chroma)).map((chord) => chord.aliases[0]);
  }
  function extended(name) {
    const chroma2 = (0, import_pcset.isChroma)(name) ? name : get(name).chroma;
    const isSuperset = (0, import_pcset.isSupersetOf)(chroma2);
    return (0, import_scale_type.all)().filter((scale2) => isSuperset(scale2.chroma)).map((scale2) => scale2.name);
  }
  function reduced(name) {
    const isSubset = (0, import_pcset.isSubsetOf)(get(name).chroma);
    return (0, import_scale_type.all)().filter((scale2) => isSubset(scale2.chroma)).map((scale2) => scale2.name);
  }
  function scaleNotes(notes) {
    const pcset = notes.map((n) => (0, import_pitch_note.note)(n).pc).filter((x) => x);
    const tonic = pcset[0];
    const scale2 = (0, import_note.sortedUniqNames)(pcset);
    return (0, import_collection.rotate)(scale2.indexOf(tonic), scale2);
  }
  function modeNames(name) {
    const s = get(name);
    if (s.empty) {
      return [];
    }
    const tonics = s.tonic ? s.notes : s.intervals;
    return (0, import_pcset.modes)(s.chroma).map((chroma2, i) => {
      const modeName = get(chroma2).name;
      return modeName ? [tonics[i], modeName] : ["", ""];
    }).filter((x) => x[0]);
  }
  function getNoteNameOf(scale2) {
    const names2 = Array.isArray(scale2) ? scaleNotes(scale2) : get(scale2).notes;
    const chromas = names2.map((name) => (0, import_pitch_note.note)(name).chroma);
    return (noteOrMidi) => {
      const currNote = typeof noteOrMidi === "number" ? (0, import_pitch_note.note)((0, import_note.fromMidi)(noteOrMidi)) : (0, import_pitch_note.note)(noteOrMidi);
      const height = currNote.height;
      if (height === undefined)
        return;
      const chroma2 = height % 12;
      const position = chromas.indexOf(chroma2);
      if (position === -1)
        return;
      return (0, import_note.enharmonic)(currNote.name, names2[position]);
    };
  }
  function rangeOf(scale2) {
    const getName = getNoteNameOf(scale2);
    return (fromNote, toNote) => {
      const from = (0, import_pitch_note.note)(fromNote).height;
      const to = (0, import_pitch_note.note)(toNote).height;
      if (from === undefined || to === undefined)
        return [];
      return (0, import_collection.range)(from, to).map(getName).filter((x) => x);
    };
  }
  function degrees(scaleName) {
    const { intervals, tonic } = get(scaleName);
    const transpose2 = (0, import_pitch_distance.tonicIntervalsTransposer)(intervals, tonic);
    return (degree) => degree ? transpose2(degree > 0 ? degree - 1 : degree) : "";
  }
  function steps(scaleName) {
    const { intervals, tonic } = get(scaleName);
    return (0, import_pitch_distance.tonicIntervalsTransposer)(intervals, tonic);
  }
  var index_default = {
    degrees,
    detect: detect2,
    extended,
    get,
    modeNames,
    names,
    rangeOf,
    reduced,
    scaleChords,
    scaleNotes,
    steps,
    tokenize,
    scale
  };
});

// node_modules/@tonaljs/time-signature/dist/index.js
var require_dist43 = __commonJS(function(exports, module) {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var time_signature_exports = {};
  __export(time_signature_exports, {
    default: () => time_signature_default,
    get: () => get,
    names: () => names,
    parse: () => parse
  });
  module.exports = __toCommonJS(time_signature_exports);
  var NONE = {
    empty: true,
    name: "",
    upper: undefined,
    lower: undefined,
    type: undefined,
    additive: []
  };
  var NAMES = ["4/4", "3/4", "2/4", "2/2", "12/8", "9/8", "6/8", "3/8"];
  function names() {
    return NAMES.slice();
  }
  var REGEX = /^(\d*\d(?:\+\d)*)\/(\d+)$/;
  var CACHE = /* @__PURE__ */ new Map;
  function get(literal) {
    const stringifiedLiteral = JSON.stringify(literal);
    const cached = CACHE.get(stringifiedLiteral);
    if (cached) {
      return cached;
    }
    const ts = build(parse(literal));
    CACHE.set(stringifiedLiteral, ts);
    return ts;
  }
  function parse(literal) {
    if (typeof literal === "string") {
      const [_, up2, low] = REGEX.exec(literal) || [];
      return parse([up2, low]);
    }
    const [up, down] = literal;
    const denominator = +down;
    if (typeof up === "number") {
      return [up, denominator];
    }
    const list = up.split("+").map((n) => +n);
    return list.length === 1 ? [list[0], denominator] : [list, denominator];
  }
  var time_signature_default = { names, parse, get };
  var isPowerOfTwo = (x) => Math.log(x) / Math.log(2) % 1 === 0;
  function build([up, down]) {
    const upper = Array.isArray(up) ? up.reduce((a, b) => a + b, 0) : up;
    const lower = down;
    if (upper === 0 || lower === 0) {
      return NONE;
    }
    const name = Array.isArray(up) ? `${up.join("+")}/${down}` : `${up}/${down}`;
    const additive = Array.isArray(up) ? up : [];
    const type = lower === 4 || lower === 2 ? "simple" : lower === 8 && upper % 3 === 0 ? "compound" : isPowerOfTwo(lower) ? "irregular" : "irrational";
    return {
      empty: false,
      name,
      type,
      upper,
      lower,
      additive
    };
  }
});

// node_modules/@tonaljs/tonal/dist/index.js
var require_dist44 = __commonJS(function(exports, module) {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var tonal_tonal_exports = {};
  __export(tonal_tonal_exports, {
    AbcNotation: () => import_abc_notation.default,
    Array: () => Array2,
    Chord: () => import_chord.default,
    ChordDictionary: () => ChordDictionary,
    ChordType: () => import_chord_type.default,
    Collection: () => import_collection.default,
    Core: () => Core,
    DurationValue: () => import_duration_value.default,
    Interval: () => import_interval.default,
    Key: () => import_key.default,
    Midi: () => import_midi.default,
    Mode: () => import_mode.default,
    Note: () => import_note.default,
    PcSet: () => PcSet,
    Pcset: () => import_pcset.default,
    Progression: () => import_progression.default,
    Range: () => import_range.default,
    RomanNumeral: () => import_roman_numeral.default,
    Scale: () => import_scale.default,
    ScaleDictionary: () => ScaleDictionary,
    ScaleType: () => import_scale_type.default,
    TimeSignature: () => import_time_signature.default,
    Tonal: () => Tonal
  });
  module.exports = __toCommonJS(tonal_tonal_exports);
  var import_abc_notation = __toESM(require_dist6());
  var Array2 = __toESM(require_dist7());
  var import_chord = __toESM(require_dist21());
  var import_chord_type = __toESM(require_dist19());
  var import_collection = __toESM(require_dist8());
  var Core = __toESM(require_dist18());
  var import_duration_value = __toESM(require_dist22());
  var import_interval = __toESM(require_dist23());
  var import_key = __toESM(require_dist29());
  var import_midi = __toESM(require_dist24());
  var import_mode = __toESM(require_dist33());
  var import_note = __toESM(require_dist25());
  var import_pcset = __toESM(require_dist11());
  var import_progression = __toESM(require_dist39());
  var import_range = __toESM(require_dist40());
  var import_roman_numeral = __toESM(require_dist28());
  var import_scale = __toESM(require_dist42());
  var import_scale_type = __toESM(require_dist20());
  var import_time_signature = __toESM(require_dist43());
  __reExport(tonal_tonal_exports, require_dist18(), module.exports);
  var Tonal = Core;
  var PcSet = import_pcset.default;
  var ChordDictionary = import_chord_type.default;
  var ScaleDictionary = import_scale_type.default;
});

// node_modules/chord-voicings/dist/getBestVoicing.js
var require_getBestVoicing = __commonJS(function(exports) {
  exports.__esModule = true;
  exports.getBestVoicing = undefined;
  function getBestVoicing(voicingOptions) {
    var { chord, range, finder, picker, lastVoicing } = voicingOptions;
    var voicings = finder(chord, range);
    if (!voicings.length) {
      return [];
    }
    return picker(voicings, lastVoicing);
  }
  exports.getBestVoicing = getBestVoicing;
});

// node_modules/chord-voicings/dist/tokenizeChord.js
var require_tokenizeChord = __commonJS(function(exports) {
  exports.__esModule = true;
  exports.tokenizeChord = undefined;
  function tokenizeChord(chord) {
    var match = (chord || "").match(/^([A-G][b#]*)([^\/]*)[\/]?([A-G][b#]*)?$/);
    if (!match) {
      return [];
    }
    return match.slice(1);
  }
  exports.tokenizeChord = tokenizeChord;
});

// node_modules/chord-voicings/dist/voicingsInRange.js
var require_voicingsInRange = __commonJS(function(exports) {
  exports.__esModule = true;
  exports.voicingsInRange = undefined;
  var tonal_1 = require_dist44();
  var dictionaryVoicing_1 = require_dictionaryVoicing();
  var tokenizeChord_1 = require_tokenizeChord();
  function voicingsInRange(chord, dictionary, range) {
    if (dictionary === undefined) {
      dictionary = dictionaryVoicing_1.lefthand;
    }
    if (range === undefined) {
      range = ["D3", "A4"];
    }
    var _a = (0, tokenizeChord_1.tokenizeChord)(chord), tonic = _a[0], symbol = _a[1];
    if (!dictionary[symbol]) {
      return [];
    }
    var voicings = dictionary[symbol].map(function(intervals) {
      return intervals.split(" ");
    });
    var notesInRange = tonal_1.Range.chromatic(range);
    return voicings.reduce(function(voiced, voicing) {
      var relativeIntervals = voicing.map(function(interval) {
        return tonal_1.Interval.substract(interval, voicing[0]);
      });
      var bottomPitchClass = tonal_1.Note.transpose(tonic, voicing[0]);
      var starts = notesInRange.filter(function(note) {
        return tonal_1.Note.chroma(note) === tonal_1.Note.chroma(bottomPitchClass);
      }).filter(function(note) {
        return tonal_1.Note.midi(tonal_1.Note.transpose(note, relativeIntervals[relativeIntervals.length - 1])) <= tonal_1.Note.midi(range[1]);
      }).map(function(note) {
        return tonal_1.Note.enharmonic(note, bottomPitchClass);
      });
      var notes = starts.map(function(start) {
        return relativeIntervals.map(function(interval) {
          return tonal_1.Note.transpose(start, interval);
        });
      });
      return voiced.concat(notes);
    }, []);
  }
  exports.voicingsInRange = voicingsInRange;
});

// node_modules/chord-voicings/dist/dictionaryVoicing.js
var require_dictionaryVoicing = __commonJS(function(exports) {
  var __assign = exports && exports.__assign || function() {
    __assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length;i < n; i++) {
        s = arguments[i];
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  var __rest = exports && exports.__rest || function(s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s);i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
  exports.__esModule = true;
  exports.dictionaryVoicing = exports.dictionaryVoicingFinder = exports.triads = exports.guidetones = exports.lefthand = undefined;
  var getBestVoicing_1 = require_getBestVoicing();
  var voicingsInRange_1 = require_voicingsInRange();
  exports.lefthand = {
    m7: ["3m 5P 7m 9M", "7m 9M 10m 12P"],
    "7": ["3M 6M 7m 9M", "7m 9M 10M 13M"],
    "^7": ["3M 5P 7M 9M", "7M 9M 10M 12P"],
    "69": ["3M 5P 6A 9M"],
    m7b5: ["3m 5d 7m 8P", "7m 8P 10m 12d"],
    "7b9": ["3M 6m 7m 9m", "7m 9m 10M 13m"],
    "7b13": ["3M 6m 7m 9m", "7m 9m 10M 13m"],
    o7: ["1P 3m 5d 6M", "5d 6M 8P 10m"],
    "7#11": ["7m 9M 11A 13A"],
    "7#9": ["3M 7m 9A"],
    mM7: ["3m 5P 7M 9M", "7M 9M 10m 12P"],
    m6: ["3m 5P 6M 9M", "6M 9M 10m 12P"]
  };
  exports.guidetones = {
    m7: ["3m 7m", "7m 10m"],
    m9: ["3m 7m", "7m 10m"],
    "7": ["3M 7m", "7m 10M"],
    "^7": ["3M 7M", "7M 10M"],
    "^9": ["3M 7M", "7M 10M"],
    "69": ["3M 6M"],
    "6": ["3M 6M", "6M 10M"],
    m7b5: ["3m 7m", "7m 10m"],
    "7b9": ["3M 7m", "7m 10M"],
    "7b13": ["3M 7m", "7m 10M"],
    o7: ["3m 6M", "6M 10m"],
    "7#11": ["3M 7m", "7m 10M"],
    "7#9": ["3M 7m", "7m 10M"],
    mM7: ["3m 7M", "7M 10m"],
    m6: ["3m 6M", "6M 10m"]
  };
  exports.triads = {
    M: ["1P 3M 5P", "3M 5P 8P", "5P 8P 10M"],
    m: ["1P 3m 5P", "3m 5P 8P", "5P 8P 10m"],
    o: ["1P 3m 5d", "3m 5d 8P", "5d 8P 10m"],
    aug: ["1P 3m 5A", "3m 5A 8P", "5A 8P 10m"]
  };
  var dictionaryVoicingFinder = function(dictionary) {
    return function(chordSymbol, range) {
      return (0, voicingsInRange_1.voicingsInRange)(chordSymbol, dictionary, range);
    };
  };
  exports.dictionaryVoicingFinder = dictionaryVoicingFinder;
  var dictionaryVoicing = function(props) {
    var { dictionary, range } = props, rest = __rest(props, ["dictionary", "range"]);
    return (0, getBestVoicing_1.getBestVoicing)(__assign(__assign({}, rest), { range, finder: (0, exports.dictionaryVoicingFinder)(dictionary) }));
  };
  exports.dictionaryVoicing = dictionaryVoicing;
});

// node_modules/chord-voicings/dist/minTopNoteDiff.js
var require_minTopNoteDiff = __commonJS(function(exports) {
  exports.__esModule = true;
  exports.minTopNoteDiff = undefined;
  var tonal_1 = require_dist44();
  function minTopNoteDiff(voicings, lastVoicing) {
    if (!lastVoicing) {
      return voicings[0];
    }
    var diff = function(voicing) {
      return Math.abs(tonal_1.Note.midi(lastVoicing[lastVoicing.length - 1]) - tonal_1.Note.midi(voicing[voicing.length - 1]));
    };
    return voicings.reduce(function(best, current) {
      return diff(current) < diff(best) ? current : best;
    }, voicings[0]);
  }
  exports.minTopNoteDiff = minTopNoteDiff;
});

// node_modules/chord-voicings/dist/index.js
var exports_dist3 = {};
__exportCjs(exports_dist3, {
  __esModule: () => $__esModule,
  default: () => $default
}, {
  __esModule: (value) => $__esModule = value,
  default: (value) => $default = value
});
var $__esModule = true, dictionaryVoicing_1, minTopNoteDiff_1, getBestVoicing_1, tokenizeChord_1, $default;
var init_dist5 = __esm(() => {
  dictionaryVoicing_1 = require_dictionaryVoicing();
  minTopNoteDiff_1 = require_minTopNoteDiff();
  getBestVoicing_1 = require_getBestVoicing();
  tokenizeChord_1 = require_tokenizeChord();
  $default = {
    tokenizeChord: tokenizeChord_1.tokenizeChord,
    getBestVoicing: getBestVoicing_1.getBestVoicing,
    dictionaryVoicing: dictionaryVoicing_1.dictionaryVoicing,
    dictionaryVoicingFinder: dictionaryVoicing_1.dictionaryVoicingFinder,
    lefthand: dictionaryVoicing_1.lefthand,
    guidetones: dictionaryVoicing_1.guidetones,
    triads: dictionaryVoicing_1.triads,
    minTopNoteDiff: minTopNoteDiff_1.minTopNoteDiff
  };
});

// node_modules/@strudel/tonal/dist/index.mjs
function d1(m) {
  const M = (m || "").match(/^([A-G][b#]*)([^/]*)[/]?([A-G][b#]*)?$/);
  return M ? M.slice(1) : [];
}
function s1(m, M, P = 1) {
  m = m.map((e) => typeof e == "string" ? gt2(e) : e);
  const t = Math.floor(M / m.length) * P * 12;
  return M = bt2(M, m.length), m[M] + t;
}
function U5(m, M, P) {
  let t = 0, e = 1 / 0;
  return M.forEach((n, s) => {
    const o = Math.abs(n - m);
    (!P && o < e || P && o <= e) && (t = s, e = o);
  }), t;
}
function c1(m, M, P, t) {
  const [e, n] = import_tonal.Scale.tokenize(M), s = G3(e), o = S5(s);
  if (!j4[n]) {
    const { intervals: a } = import_tonal.Scale.get(`C ${n}`);
    j4[n] = a.map(R3);
  }
  const d = j4[n];
  if (!d)
    return null;
  let i = s;
  if (P) {
    P = G3(P, 3);
    const a = S5(P), l = bt2(a - o, 12), y = U5(l, d, t);
    m = m + y, i = P - l;
  }
  const c = Math.floor(m / d.length) * 12;
  return m = bt2(m, d.length), d[m] + i + c;
}
function i1({ chord: m, dictionary: M, offset: P = 0, n: t, mode: e = "below", anchor: n = "c5", octaves: s = 1 }) {
  const [o, d] = d1(m), i = o1(o);
  n = G3(n?.note || n, 4);
  const c = S5(n), r = M[d].map((u) => (typeof u == "string" ? u.split(" ") : u).map(R3));
  let a, l, y = r.map((u, $) => {
    const X = H3[e](u), E = bt2(c - X - i, 12);
    return (a === undefined || E < a) && (a = E, l = $), E;
  });
  e === "root" && (l = 0);
  const A = Math.ceil(P / r.length) * 12, N = bt2(l + P, r.length), x = r[N], K = H3[e](x), Q = n - y[N] + A, z = x.map((u) => Q - K + u);
  let V = z.map((u) => r1(u));
  return e === "duck" && (V = V.filter((u, $) => z[$] !== n)), t !== undefined ? [s1(V, t, s)] : V;
}
function _3(m) {
  m = m.replaceAll(":", " ");
  const M = import_tonal.Scale.get(m), { tonic: P, empty: t } = M;
  if (t && Mt2(m) || t && !P)
    throw new Error(`Scale name ${m} is incomplete. Make sure to use ":" instead of spaces, example: .scale("C:major")`);
  if (t)
    throw new Error(`Invalid scale name "${m}"`);
  return M;
}
function l1(m, M) {
  m = Math.ceil(m);
  let { intervals: P, tonic: t } = _3(M);
  t = t || "C";
  const { pc: e, oct: n = 3 } = import_tonal.Note.get(t), s = Math.floor(m / P.length), o = bt2(m, P.length), d = import_tonal.Interval.add(P[o], a1(s));
  return import_tonal.Note.transpose(e + n, d);
}
function J4(m, M, P) {
  let { notes: t } = _3(m);
  if (t = t.map((r) => import_tonal.Note.get(r).pc), M = Number(M), isNaN(M))
    throw new Error(`scale offset "${M}" not a number`);
  const { pc: e, oct: n = 3 } = import_tonal.Note.get(P), s = t.indexOf(e);
  if (s === -1)
    throw new Error(`note "${P}" is not in scale "${m}"`);
  let o = s, d = n, i = e;
  const c = Math.sign(M);
  for (;Math.abs(o - s) < Math.abs(M); ) {
    o += c;
    const r = bt2(o, t.length);
    c < 0 && i[0] === "C" && (d += c), i = t[r], c > 0 && i[0] === "C" && (d += c);
  }
  return i + d;
}
function u1(m) {
  let M = Number(m), P = 0;
  if (isNaN(M)) {
    m = String(m);
    const t = /^(-?\d+)([#bsf]*)$/.exec(m);
    if (!t)
      throw new Error(`invalid scale step "${m}", expected number or integer with optional # b suffixes`);
    M = Number(t[1]);
    const e = t[2] || "";
    P = Ye2(e);
  }
  return [M, P];
}
function f1(m, M, P = true) {
  let t = typeof M == "string" ? gt2(M) : M;
  if (k3[m] === undefined) {
    const { intervals: r, tonic: a } = _3(m), { pc: l } = import_tonal.Note.get(a), A = r.concat("8P").map((x) => import_tonal.Note.transpose(l + "0", x)), N = A.map(gt2);
    k3[m] = [N, A];
  }
  const [e, n] = k3[m], s = e[0], o = Math.floor((t - s) / 12), d = e.map((r) => r + 12 * o), i = U5(t, d, P), c = n[i];
  return import_tonal.Note.transpose(c, import_tonal.Interval.fromSemitones(12 * o));
}
function D3(m, M, P) {
  P = Array.isArray(P) ? P : [P], P.forEach((t) => {
    t[M] = t[m];
  });
}
var import_tonal, P1, t1, e1, n1, o1 = (m) => {
  const [M, ...P] = m.split("");
  return t1.indexOf(M.toLowerCase()) + P.reduce((t, e) => t + n1[e], 0);
}, S5 = (m) => m % 12, R3 = (m) => {
  let M = Number(m);
  return isNaN(M) ? import_tonal.Interval.semitones(m) : M;
}, G3 = (m, M) => {
  if (typeof m == "number")
    return m;
  if (typeof m == "string")
    return gt2(m, M);
}, r1 = (m, M = false) => {
  const P = Math.floor(m / 12) - 1;
  return (M ? e1 : P1)[m % 12] + P;
}, j4, H3, a1 = (m) => (m <= 0 ? -1 : 1) + m * 7 + "P", D1, I1, $1, E1, j1, k3, k1, g2, w3, b1, g1, p1, h1, w1, v1, v, W5 = "ireal", q4 = (m, M, P = {}) => {
  Object.assign(v, { [m]: { dictionary: M, ...P } });
}, N1 = (m, M, P) => {
  const { dictionary: t, range: e } = v[M];
  return b1({
    chord: m,
    dictionary: t,
    range: e,
    picker: g1,
    lastVoicing: P
  });
}, C4, S1, G1, F1;
var init_dist6 = __esm(() => {
  init_dist2();
  init_dist5();
  import_tonal = __toESM(require_dist44(), 1);
  P1 = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
  t1 = ["c", "db", "d", "eb", "e", "f", "gb", "g", "ab", "a", "bb", "b"];
  e1 = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  n1 = { b: -1, "#": 1 };
  j4 = {};
  H3 = {
    below: (m) => m.slice(-1)[0],
    duck: (m) => m.slice(-1)[0],
    above: (m) => m[0],
    root: (m) => m[0]
  };
  ({ transpose: D1, trans: I1 } = l(["transpose", "trans"], function(M, P) {
    return P.withHap((t) => {
      const e = t.value.note ?? t.value;
      if (typeof e == "number") {
        let o;
        typeof M == "number" ? o = M : typeof M == "string" && (o = import_tonal.Interval.semitones(M) || 0);
        const d = e + o;
        return typeof t.value == "object" ? t.withValue(() => ({ ...t.value, note: d })) : t.withValue(() => d);
      }
      if (typeof e != "string" || !Mt2(e))
        return E2(`[tonal] transpose: not a note "${e}"`, "warning"), t;
      const n = isNaN(Number(M)) ? String(M) : import_tonal.Interval.fromSemitones(M), s = import_tonal.Note.transpose(e, n);
      return typeof t.value == "object" ? t.withValue(() => ({ ...t.value, note: s })) : t.withValue(() => s);
    });
  }));
  ({ scaleTranspose: $1, scaleTrans: E1, strans: j1 } = l(["scaleTranspose", "scaleTrans", "strans"], function(m, M) {
    return M.withHap((P) => {
      if (!P.context.scale)
        throw new Error("can only use scaleTranspose after .scale");
      if (typeof P.value == "object")
        return P.withValue(() => ({
          ...P.value,
          note: J4(P.context.scale, Number(m), P.value.note)
        }));
      if (typeof P.value != "string")
        throw new Error("can only use scaleTranspose with notes");
      return P.withValue(() => J4(P.context.scale, Number(m), P.value));
    });
  }));
  k3 = {};
  k1 = l("scale", function(m, M) {
    return Array.isArray(m) && (m = m.flat().join(" ")), M.withHaps((P) => (P = P.map((t) => {
      let e = t.value;
      const n = typeof e == "object";
      e = n ? e : { n: e };
      const { note: s, n: o, value: d, ...i } = e, c = s ?? o ?? d;
      if (c === undefined)
        return E2(`[tonal] Invalid value format for 'scale'. Value must contain n, note, or value but received keys [${Object.keys(e).join(", ")}]`, "error"), t;
      let r;
      if (Mt2(c))
        r = f1(m, c), t.value = { ...i, note: r };
      else
        try {
          const [a, l] = u1(c);
          i.anchor ? r = c1(a, m, i.anchor) : r = l1(a, m), l != 0 && (r = import_tonal.Note.transpose(r, import_tonal.Interval.fromSemitones(l)));
        } catch (a) {
          zt2(a, "tonal");
          return;
        }
      return t.value = n ? { ...i, note: r } : r, t.setContext({ ...t.context, scale: m });
    }), lt2(P)));
  }, true, true);
  g2 = {
    2: ["1P 5P 8P 9M", "1P 5P 8P 9M 12P", "5P 8P 9M 12P"],
    5: ["1P 5P 8P 12P", "5P 8P 12P 15P"],
    6: ["1P 5P 6M 8P 10M", "1P 5P 8P 10M 13M", "3M 5P 8P 10M 13M", "5P 8P 10M 12P 13M"],
    7: [
      "1P 5P 7m 8P 10M",
      "1P 7m 8P 10M 12P",
      "3M 7m 8P 10M 12P",
      "3M 7m 8P 10M 14m",
      "3M 7m 10M 12P 15P",
      "7m 10M 12P 14m 15P",
      "7m 10M 12P 15P 17M"
    ],
    9: [
      "1P 5P 7m 9M 10M",
      "1P 7m 9M 10M 12P",
      "3M 7m 8P 9M 12P",
      "7m 9M 10M 14m 15P",
      "3M 7m 8P 12P 16M",
      "7m 10M 12P 15P 16M"
    ],
    11: ["1P 5P 7m 9M 11P", "5P 7m 8P 9M 11P", "7m 8P 9M 11P 12P", "7m 8P 11P 12P 16M"],
    13: ["1P 6M 7m 9M 10M", "1P 7m 9M 10M 13M", "3M 7m 8P 9M 13M", "7m 8P 9M 10M 13M", "7m 9M 10M 13M 15P"],
    69: ["1P 5P 6M 9M 10M", "1P 5P 9M 10M 13M", "3M 5P 8P 9M 13M", "5P 8P 9M 10M 13M"],
    add9: ["1P 5P 8P 9M 10M", "1P 5P 9M 10M 12P", "3M 8P 9M 10M 12P", "3M 8P 9M 12P 15P", "5P 8P 9M 12P 17M"],
    "+": [
      "1P 3M 6m 8P 10M",
      "1P 6m 8P 10M 13m",
      "3M 6m 8P 10M 13m",
      "3M 8P 10M 13m 15P",
      "6m 8P 10M 13m 15P",
      "6m 10M 13m 15P 17M"
    ],
    o: ["1P 5d 8P 10m 12d", "3m 8P 10m 12d 15P", "5d 8P 10m 12d 15P"],
    h: [
      "3m 5d 7m 8P 10m",
      "1P 5d 7m 10m 12d",
      "3m 7m 8P 10m 12d",
      "3m 7m 8P 12d 14m",
      "5d 7m 8P 10m 14m",
      "5d 8P 10m 12d 14m",
      "7m 10m 12d 14m 15P",
      "5d 8P 10m 14m 17m"
    ],
    sus: ["1P 4P 5P 8P", "1P 4P 5P 8P 11P", "5P 8P 11P 12P", "5P 8P 11P 12P 15P"],
    "^": ["1P 5P 8P 10M", "1P 5P 8P 10M 12P", "3M 5P 8P 10M 12P", "3M 8P 10M 12P 15P", "5P 8P 10M 12P 15P"],
    "-": ["1P 3m 5P 8P 10m", "1P 5P 8P 10m 12P", "3m 5P 8P 10m 12P", "5P 8P 10m 12P 15P"],
    "^7": ["1P 5P 7M 10M 12P", "1P 10M 12P 14M", "3M 8P 10M 12P 14M", "5P 8P 10M 12P 14M", "5P 8P 10M 14M 17M"],
    "-7": [
      "1P 3m 5P 7m 10m",
      "1P 5P 7m 10m 12P",
      "3m 7m 8P 10m 12P",
      "3m 7m 8P 10m 14m",
      "5P 7m 8P 10m 14m",
      "7m 10m 12P 14m 15P",
      "5P 8P 10m 14m 17m",
      "7m 10m 12P 15P 17m"
    ],
    "7sus": ["1P 5P 7m 8P 11P", "5P 8P 11P 12P 14m", "7m 8P 11P 12P 14m", "7m 11P 12P 14m 18P"],
    h7: [
      "3m 5d 7m 8P 10m",
      "1P 5d 7m 10m 12d",
      "1P 7m 10m 12d",
      "3m 7m 8P 10m 12d",
      "3m 7m 8P 12d 14m",
      "5d 7m 8P 10m 14m",
      "5d 8P 10m 12d 14m",
      "7m 10m 12d 14m 15P",
      "5d 8P 10m 14m 17m"
    ],
    o7: [
      "1P 6M 8P 10m 12d",
      "1P 6M 10m 12d 13M",
      "3m 8P 10m 12d 13M",
      "3m 8P 12d 13M 15P",
      "5d 10m 12d 13M 15P",
      "5d 10m 13M 15P 17m",
      "6M 12d 13M 15P 17m",
      "6M 12d 15P 17m 19d"
    ],
    "^9": [
      "1P 5P 7M 9M 10M",
      "1P 7M 9M 10M 12P",
      "3M 7M 8P 9M 12P",
      "3M 7M 8P 12P 16M",
      "5P 8P 10M 14M 16M",
      "7M 8P 10M 12P 16M"
    ],
    "^13": ["1P 6M 7M 9M 10M", "1P 7M 9M 10M 13M", "3M 7M 8P 9M 13M", "3M 7M 8P 13M 16M", "7M 8P 10M 13M 16M"],
    "^7#11": ["1P 5P 7M 10M 12d", "3M 7M 8P 10M 12d", "1P 7M 10M 12d 14M", "3M 7M 8P 12d 14M", "5P 8P 10M 12d 14M"],
    "^9#11": ["1P 3M 5d 7M 9M", "1P 7M 9M 10M 12d", "3M 7M 8P 9M 12d", "3M 8P 9M 12d 14M"],
    "^7#5": ["1P 6m 7M 10M 13m", "3M 7M 8P 10M 13m", "6m 7M 8P 10M 13m"],
    "-6": [
      "1P 3m 5P 6M 8P",
      "1P 5P 6M 8P 10m",
      "3m 5P 6M 8P 10m",
      "1P 5P 8P 10m 13M",
      "3m 5P 8P 10m 13M",
      "5P 8P 10m 12P 13M",
      "5P 8P 10m 13M 15P"
    ],
    "-69": [
      "1P 3m 5P 6M 9M",
      "3m 5P 6M 8P 9M",
      "3m 6M 9M 10m 12P",
      "1P 5P 9M 10m 13M",
      "3m 5P 8P 9M 13M",
      "5P 8P 9M 10m 13M",
      "5P 8P 10m 13M 16M"
    ],
    "-^7": ["1P 3m 5P 7M 10m", "1P 5P 7M 10m 12P", "3m 7M 8P 10m 12P", "5P 7M 8P 10m 14M", "5P 8P 10m 14M 17m"],
    "-^9": ["1P 3m 5P 7M 9M", "1P 7M 9M 10m 12P", "3m 7M 8P 9M 12P", "5P 8P 9M 10m 14M"],
    "-9": [
      "1P 3m 5P 7m 9M",
      "3m 5P 7m 8P 9M",
      "3m 7m 8P 9M 12P",
      "5P 8P 9M 10m 14m",
      "3m 7m 9M 12P 15P",
      "7m 10m 12P 15P 16M"
    ],
    "-add9": ["1P 2M 3m 5P 8P", "1P 3m 5P 9M", "3m 5P 8P 9M 12P", "5P 8P 9M 10m 12P"],
    "-11": [
      "1P 3m 7m 9M 11P",
      "3m 7m 8P 9M 11P",
      "1P 4P 7m 10m 12P",
      "5P 8P 11P 14m",
      "3m 7m 9M 11P 15P",
      "5P 8P 11P 14m 16M",
      "7m 10m 12P 15P 18P"
    ],
    "-7b5": [
      "3m 5d 7m 8P 10m",
      "1P 7m 10m 12d",
      "1P 5d 7m 10m 12d",
      "3m 7m 8P 10m 12d",
      "3m 7m 8P 12d 14m",
      "5d 7m 8P 10m 14m",
      "5d 8P 10m 12d 14m",
      "7m 10m 12d 14m 15P",
      "5d 8P 10m 14m 17m"
    ],
    h9: ["1P 7m 9M 10m 12d", "3m 7m 8P 9M 12d", "5d 8P 9M 10m 14m", "7m 10m 12d 15P 16M"],
    "-b6": ["1P 5P 6m 8P 10m", "1P 5P 8P 10m 13m", "3m 5P 8P 10m 13m", "5P 8P 10m 13m", "5P 8P 10m 13m 15P"],
    "-#5": ["1P 6m 8P 10m 13m", "3m 6m 8P 10m 13m", "6m 8P 10m 13m 15P"],
    "7b9": ["1P 3M 7m 9m 10M", "3M 7m 8P 9m 10M", "3M 7m 8P 9m 14m", "7m 9m 10M 14m 15P"],
    "7#9": ["1P 3M 7m 10m", "3M 7m 8P 10m 14m", "7m 10m 10M 14m 15P"],
    "7#11": ["1P 3M 7m 10M 12d", "3M 7m 8P 10M 12d", "7m 10M 12d 14m 15P"],
    "7b5": ["1P 3M 7m 10M 12d", "3M 7m 8P 10M 12d", "7m 10M 12d 14m 15P"],
    "7#5": ["1P 3M 7m 10M 13m", "3M 7m 8P 10M 13m", "3M 7m 8P 13m 14m", "7m 10M 13m 14m 15P"],
    "9#11": ["1P 7m 9M 10M 12d", "3M 7m 8P 9M 12d", "7m 10M 12d 15P 16M"],
    "9b5": ["1P 7m 9M 10M 12d", "3M 7m 8P 9M 12d", "7m 10M 12d 15P 16M"],
    "9#5": ["1P 7m 9M 10M 13m", "3M 7m 9M 10M 13m", "3M 7m 9M 13m 14m", "7m 10M 13m 14m 16M", "7m 10M 13m 16M 17M"],
    "7b13": ["1P 3M 7m 10M 13m", "3M 7m 8P 10M 13m", "3M 7m 8P 13m 14m", "7m 10M 13m 14m 15P"],
    "7#9#5": ["1P 3M 7m 10m 13m", "3M 7m 10m 13m 15P", "7m 10M 13m 15P 17m"],
    "7#9b5": ["1P 3M 7m 10m 12d", "3M 7m 10m 12d 15P", "7m 10M 12d 15P 17m"],
    "7#9#11": ["1P 3M 7m 10m 12d", "3M 7m 10m 12d 15P", "7m 10M 12d 15P 17m"],
    "7b9#11": ["1P 7m 9m 10M 12d", "3M 7m 8P 9m 12d", "7m 8P 10M 12d 16m"],
    "7b9b5": ["1P 7m 9m 10M 12d", "3M 7m 8P 9m 12d", "7m 8P 10M 12d 16m"],
    "7b9#5": ["1P 7m 9m 10M 13m", "3M 7m 8P 9m 13m", "7m 9m 10M 13m 15P"],
    "7b9#9": ["1P 3M 7m 9m 10m", "3M 7m 8P 9m 10m", "7m 8P 10M 16m 17m"],
    "7b9b13": ["1P 7m 9m 10M 13m", "3M 7m 8P 9m 13m", "7m 9m 10M 13m 15P"],
    "7alt": [
      "3M 7m 8P 9m 12d",
      "1P 7m 10m 10M 13m",
      "3M 7m 8P 10m 13m",
      "3M 7m 9m 12d 15P",
      "3M 7m 10m 13m 15P",
      "7m 10M 12d 15P 17m",
      "7m 10M 13m 15P 17m"
    ],
    "13#11": ["1P 6M 7m 10M 12d", "3M 7m 9M 12d 13M", "7m 10M 12d 13M 16M"],
    "13b9": ["1P 3M 6M 7m 9m", "1P 6M 7m 9m 10M", "3M 7m 9m 10M 13M", "3M 7m 10M 13M 16m", "7m 10M 13M 16m 17M"],
    "13#9": ["1P 3M 6M 7m 10m", "3M 7m 8P 10m 13M", "7m 10M 13M 14m 17m"],
    "7b9sus": ["1P 5P 7m 9m 11P", "5P 7m 8P 9m 11P", "7m 8P 11P 14m 16m"],
    "7susadd3": ["1P 4P 5P 7m 10M", "5P 8P 10M 11P 14m", "7m 11P 12P 15P 17M"],
    "9sus": ["1P 5P 7m 9M 11P", "5P 7m 8P 9M 11P", "7m 8P 9M 11P 12P", "7m 8P 11P 12P 16M"],
    "13sus": ["1P 4P 6M 7m 9M", "1P 7m 9M 11P 13M", "5P 7m 9M 11P 13M", "7m 9M 11P 13M 15P"],
    "7b13sus": ["1P 5P 7m 11P 13m", "5P 7m 8P 11P 13m", "7m 11P 13m 14m 15P"]
  };
  w3 = {
    2: ["1P 5P 6M 8P 9M", "1P 5P 8P 9M 12P", "5P 8P 9M 12P 13M", "5P 8P 9M 12P 15P"],
    5: ["1P 5P 8P 12P", "1P 5P 8P 9M 12P", "5P 8P 12P 15P", "5P 8P 12P 15P 16M"],
    6: ["1P 5P 6M 9M 10M", "1P 5P 9M 10M 13M", "3M 5P 9M 10M 13M", "5P 8P 9M 10M 13M", "3M 6M 9M 12P 15P"],
    7: [
      "1P 5P 7m 8P 10M",
      "1P 7m 8P 10M 12P",
      "3M 7m 8P 10M 12P",
      "3M 7m 8P 10M 14m",
      "3M 7m 10M 12P 15P",
      "7m 10M 12P 14m 15P",
      "7m 10M 12P 15P 17M",
      "7m 10M 14m 17M 19P"
    ],
    9: [
      "1P 6M 7m 9M 10M",
      "3M 7m 9M 10M 12P",
      "1P 7m 9M 10M 13M",
      "3M 7m 9M 10M 13M",
      "3M 7m 9M 12P 15P",
      "7m 10M 12P 13M 16M",
      "7m 10M 13M 16M 17M",
      "7m 10M 13M 16M 19P"
    ],
    11: [
      "1P 4P 6M 7m 9M",
      "1P 5P 7m 9M 11P",
      "4P 6M 7m 9M 11P",
      "5P 8P 9M 11P 14m",
      "7m 9M 11P 13M 15P",
      "7m 11P 12P 14m 18P"
    ],
    13: [
      "3M 7m 9M 10M 13M",
      "3M 7m 9M 13M 15P",
      "3M 7m 10M 13M 16M",
      "7m 10M 12P 13M 16M",
      "7m 10M 13M 16M 17M",
      "7m 10M 13M 16M 19P"
    ],
    69: ["1P 5P 6M 9M 10M", "1P 5P 9M 10M 13M", "3M 5P 9M 10M 13M", "5P 8P 9M 10M 13M", "3M 6M 9M 12P 15P"],
    add9: [
      "1P 5P 8P 9M 10M",
      "1P 5P 9M 10M 12P",
      "3M 8P 9M 10M 12P",
      "3M 8P 9M 12P 15P",
      "5P 8P 9M 10M 15P",
      "5P 8P 9M 12P 17M"
    ],
    "+": [
      "1P 6m 8P 9M 10M",
      "1P 6m 8P 10M 13m",
      "3M 8P 9M 10M 13m",
      "3M 8P 10M 13m 15P",
      "6m 10M 13m 15P 16M",
      "6m 10M 13m 15P 17M"
    ],
    o: [
      "1P 6M 8P 10m 12d",
      "1P 6M 10m 12d 13M",
      "3m 8P 10m 12d 13M",
      "3m 8P 12d 13M 15P",
      "5d 10m 12d 13M 15P",
      "5d 10m 13M 15P 17m",
      "6M 12d 13M 15P 17m",
      "6M 12d 15P 17m 19d"
    ],
    h: [
      "1P 5d 7m 10m 11P",
      "3m 5d 7m 8P 11P",
      "5d 7m 8P 10m 11P",
      "1P 7m 10m 12d",
      "3m 7m 8P 12d 14m",
      "5d 8P 10m 11P 14m",
      "7m 10m 11P 12d 14m",
      "7m 10m 12d 14m 15P",
      "5d 8P 10m 14m 17m"
    ],
    sus: [
      "1P 4P 5P 8P 9M",
      "1P 4P 5P 8P 11P",
      "1P 5P 8P 9M 11P",
      "5P 8P 9M 11P 12P",
      "5P 8P 11P 12P 13M",
      "5P 8P 11P 13M 15P"
    ],
    "^": [
      "1P 3M 5P 6M 9M",
      "1P 5P 8P 10M 12P",
      "3M 5P 9M 10M 12P",
      "1P 5P 8P 10M 13M",
      "3M 8P 10M 13M 15P",
      "5P 9M 10M 12P 15P"
    ],
    "-": [
      "1P 3m 5P 8P 10m",
      "1P 3m 5P 9M 11P",
      "3m 5P 8P 9M 11P",
      "5P 8P 9M 10m 11P",
      "1P 5P 9M 10m 12P",
      "3m 5P 8P 10m 12P",
      "5P 8P 10m 12P 15P"
    ],
    "^7": [
      "1P 6M 7M 9M 10M",
      "3M 7M 9M 10M 12P",
      "1P 7M 9M 10M 13M",
      "3M 7M 9M 10M 13M",
      "3M 7M 9M 12P 13M",
      "3M 7M 9M 13M 14M",
      "3M 7M 10M 13M 16M",
      "7M 10M 13M 14M 16M",
      "7M 10M 13M 16M 17M",
      "7M 10M 13M 16M 19P"
    ],
    "-7": [
      "1P 3m 5P 7m 9M",
      "1P 3m 5P 7m 10m",
      "1P 5P 7m 10m 11P",
      "3m 7m 8P 10m 11P",
      "1P 5P 7m 10m 12P",
      "3m 7m 9M 10m 12P",
      "3m 7m 8P 10m 14m",
      "5P 7m 9M 10m 14m",
      "7m 10m 11P 14m 15P",
      "7m 10m 12P 15P 16M",
      "5P 8P 11P 14m 17m",
      "7m 10m 12P 15P 17m"
    ],
    "7sus": [
      "1P 4P 6M 7m 9M",
      "1P 5P 7m 9M 11P",
      "4P 6M 7m 9M 11P",
      "5P 8P 9M 11P 14m",
      "7m 9M 11P 13M 15P",
      "7m 11P 12P 14m 18P"
    ],
    h7: [
      "1P 5d 7m 10m 11P",
      "3m 5d 7m 8P 11P",
      "5d 7m 8P 10m 11P",
      "1P 7m 10m 12d",
      "3m 7m 8P 10m 12d",
      "3m 7m 8P 12d 14m",
      "5d 8P 10m 11P 14m",
      "7m 10m 11P 12d 14m",
      "7m 10m 12d 14m 15P",
      "5d 8P 10m 14m 17m"
    ],
    o7: [
      "1P 6M 8P 10m 12d",
      "1P 6M 10m 12d 13M",
      "3m 8P 10m 12d 13M",
      "3m 8P 12d 13M 15P",
      "5d 10m 12d 13M 15P",
      "5d 10m 13M 15P 17m",
      "6M 12d 13M 15P 17m",
      "6M 12d 15P 17m 19d"
    ],
    "^9": [
      "1P 6M 7M 9M 10M",
      "1P 7M 9M 10M 13M",
      "3M 7M 9M 10M 13M",
      "3M 7M 9M 12P 13M",
      "3M 7M 8P 9M 13M",
      "3M 7M 9M 13M 14M",
      "3M 7M 10M 13M 16M",
      "7M 10M 13M 14M 16M",
      "7M 10M 13M 16M 17M",
      "7M 10M 13M 16M 19P"
    ],
    "^13": [
      "1P 6M 7M 9M 10M",
      "1P 7M 9M 10M 13M",
      "3M 7M 9M 12P 13M",
      "3M 7M 9M 10M 13M",
      "3M 7M 8P 9M 13M",
      "3M 7M 9M 13M 14M",
      "3M 7M 10M 13M 16M",
      "7M 10M 13M 14M 16M",
      "7M 10M 13M 16M 17M",
      "7M 10M 13M 16M 19P"
    ],
    "^7#11": [
      "1P 3M 5d 7M 9M",
      "1P 7M 9M 10M 12d",
      "3M 7M 9M 10M 12d",
      "3M 7M 9M 12d 13M",
      "3M 7M 10M 12d 14M",
      "7M 10M 12d 13M 14M",
      "7M 10M 12d 13M 16M",
      "7M 10M 12d 14M 17M"
    ],
    "^9#11": [
      "1P 3M 5d 7M 9M",
      "1P 7M 9M 10M 12d",
      "3M 7M 9M 10M 12d",
      "3M 7M 9M 12d 13M",
      "3M 7M 9M 12d 14M",
      "7M 10M 12d 14M 16M",
      "7M 10M 12d 13M 16M"
    ],
    "^7#5": ["1P 6m 7M 10M 13m", "3M 7M 9M 10M 13m", "3M 7M 10M 13m 14M", "7M 10M 13m 14M 16M", "7M 10M 13m 14M 17M"],
    "-6": [
      "1P 3m 5P 6M 9M",
      "3m 5P 6M 8P 9M",
      "1P 5P 6M 10m 11P",
      "3m 5P 6M 8P 11P",
      "1P 5P 9M 10m 13M",
      "3m 5P 8P 9M 13M",
      "5P 8P 10m 11P 13M",
      "5P 8P 10m 13M 16M"
    ],
    "-69": [
      "1P 3m 5P 6M 9M",
      "3m 5P 6M 8P 9M",
      "3m 6M 9M 10m 12P",
      "1P 5P 9M 10m 13M",
      "3m 5P 8P 9M 13M",
      "5P 8P 9M 10m 13M",
      "5P 8P 10m 13M 16M"
    ],
    "-^7": [
      "1P 3m 5P 7M 9M",
      "1P 5P 7M 10m 11P",
      "3m 7M 9M 10m 11P",
      "3m 7M 9M 10m 12P",
      "3m 7M 9M 12P 14M",
      "7M 10m 11P 12P 14M",
      "7M 10m 12P 14M 16M"
    ],
    "-^9": [
      "1P 3m 5P 7M 9M",
      "1P 5P 7M 10m 11P",
      "3m 7M 9M 10m 11P",
      "3m 7M 9M 10m 12P",
      "3m 7M 9M 12P 14M",
      "7M 10m 11P 12P 14M",
      "7M 10m 12P 14M 16M"
    ],
    "-9": [
      "1P 3m 5P 7m 9M",
      "1P 3m 7m 9M 11P",
      "3m 7m 9M 10m 11P",
      "3m 7m 9M 10m 12P",
      "3m 7m 9M 10m 14m",
      "3m 7m 9M 12P 15P",
      "7m 10m 11P 14m 16M",
      "7m 10m 12P 16M 18P"
    ],
    "-add9": ["1P 2M 3m 5P 8P", "1P 3m 5P 9M", "3m 5P 8P 9M 12P", "5P 8P 9M 10m 12P"],
    "-11": [
      "3m 5P 7m 9M 11P",
      "7m 9M 10m 11P",
      "1P 4P 7m 10m 12P",
      "3m 7m 9M 11P 12P",
      "7m 9M 10m 11P 12P",
      "3m 7m 9M 11P 14m",
      "4P 10m 12P 14m",
      "5P 8P 11P 14m",
      "5P 8P 11P 14m 16M",
      "7m 10m 12P 16M 18P",
      "7m 10m 11P 16M 21m"
    ],
    "-7b5": [
      "1P 5d 7m 10m 11P",
      "3m 5d 7m 8P 11P",
      "5d 7m 8P 10m 11P",
      "1P 7m 10m 12d",
      "3m 7m 8P 10m 12d",
      "3m 7m 8P 12d 14m",
      "5d 8P 10m 11P 14m",
      "7m 10m 11P 12d 14m",
      "7m 10m 12d 14m 15P",
      "5d 8P 10m 14m 17m"
    ],
    h9: [
      "3m 5d 7m 9M 11P",
      "1P 7m 9M 10m 12d",
      "3m 7m 9M 12d 14m",
      "5d 8P 9M 10m 14m",
      "7m 10m 11P 12d 14m",
      "7m 10m 12d 14m 16M"
    ],
    "-b6": ["1P 3m 5P 6m 8P", "3m 5P 8P 11P 13m", "5P 8P 10m 11P 13m"],
    "-#5": ["1P 6m 8P 10m 13m", "3m 6m 8P 11P 13m", "6m 8P 10m 13m 15P"],
    "7b9": ["1P 3M 7m 9m 10M", "3M 7m 8P 9m 10M", "3M 7m 8P 9m 14m", "7m 9m 10M 14m 15P"],
    "7#9": ["1P 3M 7m 10m", "3M 7m 10m 10M 12P", "3M 7m 10m 12P 14m", "7m 10M 12P 14m 17m"],
    "7#11": ["1P 3M 7m 9M 12d", "3M 7m 9M 12d 13M", "7m 10M 12d 13M 16M"],
    "7b5": ["1P 3M 7m 9M 12d", "3M 7m 9M 12d 13M", "7m 10M 12d 13M 16M"],
    "7#5": ["1P 3M 7m 10M 13m", "3M 7m 8P 10M 13m", "3M 7m 8P 13m 14m", "7m 10M 13m 14m 15P", "7m 10M 13m 14m 17M"],
    "9#11": ["1P 7m 9M 10M 12d", "3M 7m 8P 9M 12d", "7m 10M 12d 15P 16M"],
    "9b5": ["1P 7m 9M 10M 12d", "3M 7m 8P 9M 12d", "7m 10M 12d 15P 16M"],
    "9#5": ["1P 7m 9M 10M 13m", "3M 7m 9M 10M 13m", "3M 7m 9M 13m 14m", "7m 10M 13m 14m 16M", "7m 10M 13m 16M 17M"],
    "7b13": ["1P 3M 7m 10M 13m", "3M 7m 8P 10M 13m", "3M 7m 8P 13m 14m", "7m 10M 13m 14m 15P", "7m 10M 13m 14m 17M"],
    "7#9#5": ["3M 7m 10m 10M 13m", "3M 7m 10m 13m 14m", "7m 10M 13m 14m 17m"],
    "7#9b5": ["3M 7m 10m 10M 12d", "3M 7m 10m 12d 14m", "7m 10M 12d 14m 17m"],
    "7#9#11": ["3M 7m 10m 10M 12d", "3M 7m 10m 12d 14m", "7m 10M 12d 14m 17m"],
    "7b9#11": ["3M 7m 9m 10M 12d", "3M 7m 9m 12d 14m", "7m 8P 10M 12d 16m", "7m 10M 12d 14m 16m"],
    "7b9b5": ["3M 7m 9m 10M 12d", "3M 7m 9m 12d 14m", "7m 8P 10M 12d 16m", "7m 10M 12d 14m 16m"],
    "7b9#5": ["1P 7m 9m 10M 13m", "3M 7m 9m 10M 13m", "3M 7m 10M 13m 16m", "7m 10M 13m 14m 16m", "7m 10M 13m 16m 17M"],
    "7b9#9": ["1P 3M 7m 9m 10m", "3M 7m 10m 13m 16m", "7m 10M 13m 16m 17m"],
    "7b9b13": ["1P 7m 9m 10M 13m", "3M 7m 9m 10M 13m", "3M 7m 10M 13m 16m", "7m 10M 13m 14m 16m", "7m 10M 13m 16m 17M"],
    "7alt": [
      "3M 7m 8P 10m 13m",
      "3M 7m 9m 12d 13m",
      "3M 7m 9m 10m 13m",
      "3M 7m 10m 13m 14m",
      "3M 7m 9m 12d 14m",
      "3M 7m 10m 13m 15P",
      "3M 7m 10m 13m 16m",
      "7m 10M 12d 14m 16m",
      "7m 10M 12d 13m 16m",
      "7m 10M 13m 15P 17m",
      "7m 10M 13m 16m 17m",
      "7m 10M 13m 16m 19d"
    ],
    "13#11": ["3M 7m 9M 12d 13M", "7m 10M 12d 13M 16M"],
    "13b9": ["3M 7m 9m 10M 13M", "3M 7m 10M 13M 16m", "7m 10M 13M 16m 17M"],
    "13#9": ["3M 7m 10m 10M 13M", "7m 10M 13M 14m 17m"],
    "7b9sus": ["1P 5P 7m 9m 11P", "5P 7m 8P 9m 11P", "7m 8P 11P 14m 16m"],
    "7susadd3": ["1P 4P 5P 7m 10M", "5P 8P 10M 11P 14m", "7m 11P 12P 15P 17M"],
    "9sus": [
      "1P 4P 6M 7m 9M",
      "1P 5P 7m 9M 11P",
      "4P 6M 7m 9M 11P",
      "5P 8P 9M 11P 14m",
      "7m 9M 11P 13M 15P",
      "7m 11P 12P 14m 18P"
    ],
    "13sus": [
      "1P 4P 6M 7m 9M",
      "1P 7m 9M 11P 13M",
      "4P 7m 9M 11P 13M",
      "7m 9M 11P 13M 15P",
      "7m 11P 13M 14m 16M",
      "7m 11P 13M 16M 18P"
    ],
    "7b13sus": ["1P 5P 7m 11P 13m", "5P 7m 8P 11P 13m", "7m 11P 13m 14m 15P"]
  };
  ({ dictionaryVoicing: b1, minTopNoteDiff: g1 } = $default || exports_dist3);
  p1 = {
    m7: ["3m 5P 7m 9M", "7m 9M 10m 12P"],
    7: ["3M 6M 7m 9M", "7m 9M 10M 13M"],
    "^7": ["3M 5P 7M 9M", "7M 9M 10M 12P"],
    69: ["3M 5P 6A 9M"],
    m7b5: ["3m 5d 7m 8P", "7m 8P 10m 12d"],
    "7b9": ["3M 6m 7m 9m", "7m 9m 10M 13m"],
    "7b13": ["3M 6m 7m 9m", "7m 9m 10M 13m"],
    o7: ["1P 3m 5d 6M", "5d 6M 8P 10m"],
    "7#11": ["7m 9M 11A 13A"],
    "7#9": ["3M 7m 9A"],
    mM7: ["3m 5P 7M 9M", "7M 9M 10m 12P"],
    m6: ["3m 5P 6M 9M", "6M 9M 10m 12P"]
  };
  h1 = {
    m7: ["3m 7m", "7m 10m"],
    m9: ["3m 7m", "7m 10m"],
    7: ["3M 7m", "7m 10M"],
    "^7": ["3M 7M", "7M 10M"],
    "^9": ["3M 7M", "7M 10M"],
    69: ["3M 6M"],
    6: ["3M 6M", "6M 10M"],
    m7b5: ["3m 7m", "7m 10m"],
    "7b9": ["3M 7m", "7m 10M"],
    "7b13": ["3M 7m", "7m 10M"],
    o7: ["3m 6M", "6M 10m"],
    "7#11": ["3M 7m", "7m 10M"],
    "7#9": ["3M 7m", "7m 10M"],
    mM7: ["3m 7M", "7M 10m"],
    m6: ["3m 6M", "6M 10m"]
  };
  w1 = {
    "": ["1P 3M 5P", "3M 5P 8P", "5P 8P 10M"],
    M: ["1P 3M 5P", "3M 5P 8P", "5P 8P 10M"],
    m: ["1P 3m 5P", "3m 5P 8P", "5P 8P 10m"],
    o: ["1P 3m 5d", "3m 5d 8P", "5d 8P 10m"],
    aug: ["1P 3m 5A", "3m 5A 8P", "5A 8P 10m"]
  };
  v1 = {
    "": ["1P 3M 5P", "3M 5P 8P", "5P 8P 10M"],
    M: ["1P 3M 5P", "3M 5P 8P", "5P 8P 10M"],
    m: ["1P 3m 5P", "3m 5P 8P", "5P 8P 10m"],
    o: ["1P 3m 5d", "3m 5d 8P", "5d 8P 10m"],
    aug: ["1P 3m 5A", "3m 5A 8P", "5A 8P 10m"],
    m7: ["3m 5P 7m 9M", "7m 9M 10m 12P"],
    7: ["3M 6M 7m 9M", "7m 9M 10M 13M"],
    "^7": ["3M 5P 7M 9M", "7M 9M 10M 12P"],
    69: ["3M 5P 6A 9M"],
    m7b5: ["3m 5d 7m 8P", "7m 8P 10m 12d"],
    "7b9": ["3M 6m 7m 9m", "7m 9m 10M 13m"],
    "7b13": ["3M 6m 7m 9m", "7m 9m 10M 13m"],
    o7: ["1P 3m 5d 6M", "5d 6M 8P 10m"],
    "7#11": ["7m 9M 11A 13A"],
    "7#9": ["3M 7m 9A"],
    mM7: ["3m 5P 7M 9M", "7M 9M 10m 12P"],
    m6: ["3m 5P 6M 9M", "6M 9M 10m 12P"]
  };
  v = {
    lefthand: { dictionary: p1, range: ["F3", "A4"], mode: "below", anchor: "a4" },
    triads: { dictionary: w1, mode: "below", anchor: "a4" },
    guidetones: { dictionary: h1, mode: "above", anchor: "a4" },
    legacy: { dictionary: v1, mode: "below", anchor: "a4" }
  };
  S1 = l("voicings", function(m, M) {
    return M.fmap((P) => (C4 = N1(P, m, C4), z(...C4))).outerJoin();
  });
  G1 = l("rootNotes", function(m, M) {
    return M.fmap((P) => {
      const n = (P.chord || P).match(/^([a-gA-G][b#]?).*$/)[1] + m;
      return P.chord ? { note: n } : n;
    });
  });
  F1 = l("voicing", function(m) {
    return m.fmap((M) => {
      M = typeof M == "string" ? { chord: M } : M;
      let { dictionary: P = W5, chord: t, anchor: e, offset: n, mode: s, n: o, octaves: d, ...i } = M;
      P = typeof P == "string" ? v[P] : { dictionary: P, mode: "below", anchor: "c5" };
      try {
        let c = i1({ ...P, chord: t, anchor: e, offset: n, mode: s, n: o, octaves: d });
        return z(...c).note().set(i);
      } catch {
        return E2(`[voicing]: unknown chord "${t}"`), q2;
      }
    }).outerJoin();
  });
  D3("^", "", [g2, w3]);
  Object.keys(g2).forEach((m) => {
    if (m.includes("-")) {
      let M = m.replace("-", "m");
      D3(m, M, [w3, g2]);
    }
    if (m.includes("^")) {
      let M = m.replace("^", "M");
      D3(m, M, [w3, g2]);
    }
    if (m.includes("+")) {
      let M = m.replace("+", "aug");
      D3(m, M, [w3, g2]);
    }
  });
  q4("ireal", g2);
  q4("ireal-ext", w3);
});

// analyze.ts
import"node-web-audio-api/polyfill.js";
var g3 = globalThis;
var noop = () => {};
g3.document ??= {
  addEventListener: noop,
  removeEventListener: noop,
  dispatchEvent: () => true,
  createElement: () => ({ style: {}, getContext: () => null, appendChild: noop, click: noop }),
  createElementNS: () => ({ style: {}, appendChild: noop }),
  body: { appendChild: noop, removeChild: noop },
  documentElement: { style: {} }
};
g3.CustomEvent ??= class CustomEvent2 {
  constructor(type, opts) {
    this.type = type;
    this.detail = opts?.detail;
  }
};
g3.navigator ??= { userAgent: "bun" };
if (g3.window) {
  g3.window.addEventListener ??= noop;
  g3.window.removeEventListener ??= noop;
  g3.window.dispatchEvent ??= () => true;
}
g3.requestAnimationFrame ??= (fn) => setTimeout(() => fn(Date.now()), 16);
g3.cancelAnimationFrame ??= (id) => clearTimeout(id);
var core = await Promise.resolve().then(() => (init_dist2(), exports_dist));
var mini = await Promise.resolve().then(() => (init_dist3(), exports_dist2));
await Promise.resolve().then(() => init_dist4());
await Promise.resolve().then(() => (init_dist6(), {}));
await core.evalScope(core, mini);
await core.evalScope({
  setcpm: () => core.silence,
  setcps: () => core.silence
});
var NOTE_NAMES = {
  c: 0,
  "c#": 1,
  db: 1,
  d: 2,
  "d#": 3,
  eb: 3,
  e: 4,
  f: 5,
  "f#": 6,
  gb: 6,
  g: 7,
  "g#": 8,
  ab: 8,
  a: 9,
  "a#": 10,
  bb: 10,
  b: 11
};
function toMidi(value) {
  if (value == null)
    return null;
  if (typeof value === "number")
    return Math.round(value);
  const m = String(value).trim().toLowerCase().match(/^([a-g][#b]?)(-?\d+)$/);
  if (!m)
    return null;
  const pc = NOTE_NAMES[m[1]];
  if (pc === undefined)
    return null;
  return (parseInt(m[2], 10) + 1) * 12 + pc;
}
async function analyze(req) {
  const { script, seconds = 8, cps = 0.5 } = req;
  const { pattern } = await core.evaluate(script, F3);
  const haps = pattern.queryArc(0, seconds * cps, { _cps: cps });
  const notes = [];
  const sounds = new Set;
  let onsets = 0;
  for (const hap of haps) {
    if (!hap.hasOnset())
      continue;
    onsets++;
    const v = hap.value ?? {};
    if (v.s)
      sounds.add(String(v.s));
    const midi2 = toMidi(v.note);
    if (midi2 !== null)
      notes.push(midi2);
  }
  return { notes, onsets, sounds: [...sounds] };
}
var decoder = new TextDecoder;
var pending = "";
for await (const chunk of Bun.stdin.stream()) {
  pending += decoder.decode(chunk, { stream: true });
  let nl;
  while ((nl = pending.indexOf(`
`)) >= 0) {
    const line = pending.slice(0, nl).trim();
    pending = pending.slice(nl + 1);
    if (!line)
      continue;
    let res;
    try {
      res = await analyze(JSON.parse(line));
    } catch (e) {
      res = { error: String(e?.message ?? e) };
    }
    process.stdout.write(JSON.stringify(res) + `
`);
  }
}
