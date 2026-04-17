var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// _shared/helpers.ts
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(json, "json");
function ok(data) {
  return json({ success: true, data });
}
__name(ok, "ok");
function err(message, status = 500) {
  return json({ success: false, error: message }, status);
}
__name(err, "err");
function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9_-]/g, "");
}
__name(sanitizeFilename, "sanitizeFilename");
function base64UrlDecodeToBuffer(str) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = (4 - padded.length % 4) % 4;
  const binary = atob(padded + "=".repeat(pad));
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
  return buf.buffer;
}
__name(base64UrlDecodeToBuffer, "base64UrlDecodeToBuffer");
function jsonDecode(b64url) {
  return JSON.parse(new TextDecoder().decode(base64UrlDecodeToBuffer(b64url)));
}
__name(jsonDecode, "jsonDecode");
async function importSigningKey(key, alg) {
  if (alg === "RS256" || alg === "RS384" || alg === "RS512") {
    const hash = alg === "RS256" ? "SHA-256" : alg === "RS384" ? "SHA-384" : "SHA-512";
    return crypto.subtle.importKey("jwk", key, { name: "RSASSA-PKCS1-v1_5", hash }, false, ["verify"]);
  }
  if (alg === "ES256") {
    return crypto.subtle.importKey("jwk", key, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
  }
  if (alg === "ES384") {
    return crypto.subtle.importKey("jwk", key, { name: "ECDSA", namedCurve: "P-384" }, false, ["verify"]);
  }
  throw new Error(`Unsupported JWT algorithm: ${alg}`);
}
__name(importSigningKey, "importSigningKey");
async function verifyJwt(token, authority, clientId) {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  let header;
  let claims;
  try {
    header = jsonDecode(parts[0]);
    claims = jsonDecode(parts[1]);
  } catch {
    return false;
  }
  const now = Math.floor(Date.now() / 1e3);
  if (claims.exp !== void 0 && claims.exp < now) return false;
  if (claims.iss) {
    const tokenIss = claims.iss.replace(/\/$/, "");
    const expectedIss = authority.replace(/\/$/, "");
    if (tokenIss !== expectedIss) return false;
  }
  if (claims.aud !== void 0) {
    const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (!aud.includes(clientId)) return false;
  }
  const base = authority.replace(/\/$/, "");
  const discoveryRes = await fetch(`${base}/.well-known/openid-configuration`);
  if (!discoveryRes.ok) return false;
  const oidcConfig = await discoveryRes.json();
  const jwksRes = await fetch(oidcConfig.jwks_uri);
  if (!jwksRes.ok) return false;
  const jwks = await jwksRes.json();
  const signingKey = header.kid ? jwks.keys.find((k) => k.kid === header.kid) : jwks.keys.find((k) => !k.use || k.use === "sig");
  if (!signingKey) return false;
  const alg = header.alg;
  let cryptoKey;
  try {
    cryptoKey = await importSigningKey(signingKey, alg);
  } catch {
    return false;
  }
  const signatureInput = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const signature = base64UrlDecodeToBuffer(parts[2]);
  try {
    if (alg.startsWith("RS")) {
      return await crypto.subtle.verify("RSASSA-PKCS1-v1_5", cryptoKey, signature, signatureInput);
    }
    if (alg.startsWith("ES")) {
      const hash = alg === "ES256" ? "SHA-256" : "SHA-384";
      return await crypto.subtle.verify({ name: "ECDSA", hash }, cryptoKey, signature, signatureInput);
    }
  } catch {
    return false;
  }
  return false;
}
__name(verifyJwt, "verifyJwt");
async function authGuard(request, env) {
  let settings;
  try {
    const raw = await env.RESUME_KV.get("settings");
    if (!raw) return null;
    settings = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!settings.auth?.enabled) return null;
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return err("Missing or invalid authorization header", 401);
  }
  const token = authHeader.slice(7);
  if (!token) return err("Empty token", 401);
  try {
    const valid = await verifyJwt(token, settings.auth.authority, settings.auth.clientId);
    if (!valid) return err("Invalid or expired token", 401);
  } catch {
    return err("Token validation failed", 401);
  }
  return null;
}
__name(authGuard, "authGuard");
var DEFAULT_RESUME = {
  personal: {
    name: "",
    title: { en: "", de: "" },
    email: "",
    phone: "",
    location: { en: "", de: "" }
  },
  summary: { en: "", de: "" },
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  languages: [],
  projects: [],
  products: [],
  references: []
};
var DEFAULT_SETTINGS = {
  auth: {
    enabled: false,
    provider: "generic-oidc",
    clientId: "",
    authority: "",
    redirectUri: "https://your-site.pages.dev",
    scopes: ["openid", "profile", "email"]
  }
};
var DEFAULT_THEME = {
  name: "Default",
  colors: {
    primary: "#2563eb",
    secondary: "#6b7280",
    accent: "#059669",
    text: "#1f2937",
    background: "#ffffff",
    heading: "#111827"
  },
  fonts: { heading: "Inter", body: "Inter", size: "medium" },
  layout: {
    style: "single-column",
    headerStyle: "full-width",
    sectionOrder: [
      "personal",
      "summary",
      "experience",
      "education",
      "skills",
      "certifications",
      "languages",
      "projects",
      "products",
      "references"
    ],
    showPhoto: true,
    pageMargins: { top: 40, right: 40, bottom: 40, left: 40 }
  }
};
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
__name(arrayBufferToBase64, "arrayBufferToBase64");

// api/themes/[name].ts
var onRequestGet = /* @__PURE__ */ __name(async ({ env, params }) => {
  const raw_name = Array.isArray(params.name) ? params.name[0] : params.name;
  const name = sanitizeFilename(raw_name);
  try {
    let raw = await env.RESUME_KV.get(`theme:${name}`);
    if (!raw && name === "default") {
      await env.RESUME_KV.put("theme:default", JSON.stringify(DEFAULT_THEME));
      raw = JSON.stringify(DEFAULT_THEME);
    }
    if (!raw) return err("Theme not found", 404);
    return ok(JSON.parse(raw));
  } catch {
    return err("Failed to load theme");
  }
}, "onRequestGet");
var onRequestPut = /* @__PURE__ */ __name(async ({ request, env, params }) => {
  const denied = await authGuard(request, env);
  if (denied) return denied;
  const raw_name = Array.isArray(params.name) ? params.name[0] : params.name;
  const name = sanitizeFilename(raw_name);
  try {
    const theme = await request.json();
    await env.RESUME_KV.put(`theme:${name}`, JSON.stringify(theme));
    return ok(theme);
  } catch {
    return err("Failed to update theme");
  }
}, "onRequestPut");
var onRequestDelete = /* @__PURE__ */ __name(async ({ request, env, params }) => {
  const denied = await authGuard(request, env);
  if (denied) return denied;
  const raw_name = Array.isArray(params.name) ? params.name[0] : params.name;
  const name = sanitizeFilename(raw_name);
  if (name === "default") return err("Cannot delete the default theme", 400);
  try {
    await env.RESUME_KV.delete(`theme:${name}`);
    return ok(null);
  } catch {
    return err("Failed to delete theme");
  }
}, "onRequestDelete");

// api/upload/[type].ts
var ALLOWED_MIME = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
var ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
var MAX_SIZE = 5 * 1024 * 1024;
var onRequestPost = /* @__PURE__ */ __name(async ({ request, env }) => {
  const denied = await authGuard(request, env);
  if (denied) return denied;
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) return err("No file uploaded", 400);
    if (!ALLOWED_MIME.includes(file.type)) return err("Invalid file type", 400);
    const mimeToExt = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
      "image/svg+xml": ".svg"
    };
    const ext = mimeToExt[file.type] ?? ".jpg";
    if (!ALLOWED_EXT.includes(ext)) return err("Invalid file type", 400);
    const buffer = await file.arrayBuffer();
    if (buffer.byteLength > MAX_SIZE) return err("File too large (max 5 MB)", 400);
    const base64 = arrayBufferToBase64(buffer);
    const dataUrl = `data:${file.type};base64,${base64}`;
    const filename = `${crypto.randomUUID()}${ext}`;
    await env.RESUME_KV.put(`upload:${filename}`, dataUrl);
    const path = `/api/uploads/${filename}`;
    return new Response(JSON.stringify({ success: true, data: { path, filename } }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    return err("Upload failed");
  }
}, "onRequestPost");

// api/uploads/[filename].ts
var onRequestGet2 = /* @__PURE__ */ __name(async ({ env, params }) => {
  const raw = Array.isArray(params.filename) ? params.filename[0] : params.filename;
  const filename = raw.replace(/[^a-zA-Z0-9._-]/g, "");
  if (!filename) return err("Invalid filename", 400);
  try {
    const dataUrl = await env.RESUME_KV.get(`upload:${filename}`);
    if (!dataUrl) return err("Not found", 404);
    const match2 = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match2) return err("Corrupt upload data", 500);
    const [, mime, b64] = match2;
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Response(bytes, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return err("Failed to serve file");
  }
}, "onRequestGet");

// api/health.ts
var onRequestGet3 = /* @__PURE__ */ __name(async () => {
  return ok({ status: "ok", runtime: "cloudflare-pages" });
}, "onRequestGet");

// api/resume.ts
var onRequestGet4 = /* @__PURE__ */ __name(async ({ env }) => {
  try {
    const raw = await env.RESUME_KV.get("resume");
    const data = raw ? JSON.parse(raw) : DEFAULT_RESUME;
    return ok(data);
  } catch {
    return err("Failed to load resume data");
  }
}, "onRequestGet");
var onRequestPut2 = /* @__PURE__ */ __name(async ({ request, env }) => {
  const denied = await authGuard(request, env);
  if (denied) return denied;
  try {
    const data = await request.json();
    await env.RESUME_KV.put("resume", JSON.stringify(data));
    return ok(data);
  } catch {
    return err("Failed to save resume data");
  }
}, "onRequestPut");

// api/settings.ts
var onRequestGet5 = /* @__PURE__ */ __name(async ({ request, env }) => {
  try {
    const raw = await env.RESUME_KV.get("settings");
    const data = raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
    return ok(data);
  } catch {
    return ok(DEFAULT_SETTINGS);
  }
}, "onRequestGet");
var onRequestPut3 = /* @__PURE__ */ __name(async ({ request, env }) => {
  const denied = await authGuard(request, env);
  if (denied) return denied;
  try {
    const data = await request.json();
    await env.RESUME_KV.put("settings", JSON.stringify(data));
    return ok(data);
  } catch {
    return err("Failed to save settings");
  }
}, "onRequestPut");

// api/themes/index.ts
var onRequestGet6 = /* @__PURE__ */ __name(async ({ env }) => {
  try {
    const defaultKey = "theme:default";
    const defaultRaw = await env.RESUME_KV.get(defaultKey);
    if (!defaultRaw) {
      await env.RESUME_KV.put(defaultKey, JSON.stringify(DEFAULT_THEME));
    }
    const listed = await env.RESUME_KV.list({ prefix: "theme:" });
    const themes = await Promise.all(
      listed.keys.map(async ({ name: key }) => {
        const filename = key.replace("theme:", "");
        const raw = await env.RESUME_KV.get(key);
        if (!raw) return null;
        const theme = JSON.parse(raw);
        return { name: theme.name, filename };
      })
    );
    return ok(themes.filter(Boolean));
  } catch {
    return err("Failed to list themes");
  }
}, "onRequestGet");
var onRequestPost2 = /* @__PURE__ */ __name(async ({ request, env }) => {
  const denied = await authGuard(request, env);
  if (denied) return denied;
  try {
    const theme = await request.json();
    const filename = sanitizeFilename(theme.name.toLowerCase().replace(/\s+/g, "-"));
    if (!filename) return err("Invalid theme name", 400);
    await env.RESUME_KV.put(`theme:${filename}`, JSON.stringify(theme));
    return new Response(JSON.stringify({ success: true, data: theme }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    return err("Failed to create theme");
  }
}, "onRequestPost");

// ../.wrangler/tmp/pages-VCPnNd/functionsRoutes-0.38801420868452174.mjs
var routes = [
  {
    routePath: "/api/themes/:name",
    mountPath: "/api/themes",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete]
  },
  {
    routePath: "/api/themes/:name",
    mountPath: "/api/themes",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/themes/:name",
    mountPath: "/api/themes",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut]
  },
  {
    routePath: "/api/upload/:type",
    mountPath: "/api/upload",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/uploads/:filename",
    mountPath: "/api/uploads",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/health",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/resume",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/api/resume",
    mountPath: "/api",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut2]
  },
  {
    routePath: "/api/settings",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet5]
  },
  {
    routePath: "/api/settings",
    mountPath: "/api",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut3]
  },
  {
    routePath: "/api/themes",
    mountPath: "/api/themes",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet6]
  },
  {
    routePath: "/api/themes",
    mountPath: "/api/themes",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  }
];

// ../node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
