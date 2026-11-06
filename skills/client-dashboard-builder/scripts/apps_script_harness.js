#!/usr/bin/env node
// Run Apps Script server code (Code.gs) in Node with fake Apps Script services, so it can be tested against
// live APIs before anyone pastes it. Web calls go through curl and only GET is used, so it stays read-only.
//
// Usage:
//   node apps_script_harness.js <Code.gs> [more.gs ...] --env <path/.env> \
//        [--map GHL_TOKEN=GHL_API_KEY,CALENDLY_TOKEN=CALENDLY_TOKEN] [--props props.json] \
//        --run "JSON.stringify(emailData_('2026-11')).length"
//
//   --map    Script Property = .env key (default maps GHL_TOKEN, CALENDLY_TOKEN, SLACK_TOKEN from the usual names)
//   --props  JSON file of extra Script Properties to start with (for example saved em_yyyy-MM-dd days); it is
//            written back after the run so a later run can continue.
//   --run    JavaScript evaluated after the code is loaded; the result is printed. Every function in the .gs
//            files is a global, so call them directly (emailCheckDay_('2026-11-02'), emailSync({triggerUid:1}) ...).
// SpreadsheetApp is not available here; loaders that need it will throw and the code's own warnings show it.
const fs = require('fs'), cp = require('child_process');
const args = process.argv.slice(2), files = [], opt = {};
for (let i = 0; i < args.length; i++) { if (args[i].startsWith('--')) opt[args[i].slice(2)] = args[++i]; else files.push(args[i]); }
if (!files.length || !opt.env || !opt.run) { console.error('usage: node apps_script_harness.js Code.gs --env .env --run "<js>"'); process.exit(1); }

const env = {};
fs.readFileSync(opt.env, 'utf8').split(/\r?\n/).forEach(l => { const i = l.indexOf('='); if (i > 0 && l[0] !== '#') env[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^"|"$/g, ''); });
const map = opt.map || 'GHL_TOKEN=GHL_API_KEY,CALENDLY_TOKEN=CALENDLY_TOKEN,SLACK_TOKEN=SLACK_BOT_TOKEN';
const props = opt.props && fs.existsSync(opt.props) ? JSON.parse(fs.readFileSync(opt.props, 'utf8')) : {};
map.split(',').forEach(p => { const [k, v] = p.split('='); if (env[v] && props[k] == null) props[k] = env[v]; });

let calls = 0;
const ALLOW = /^https:\/\/(services\.leadconnectorhq\.com|api\.calendly\.com|slack\.com)\//;
function curl(req) {
  calls++;
  if (!ALLOW.test(req.url)) throw new Error('blocked (not an allowed API): ' + req.url);
  if (req.method && String(req.method).toLowerCase() !== 'get') throw new Error('blocked: only GET is allowed in tests');
  const a = ['-s', '-w', '\n%{http_code}', '-A', 'curl/8.0.1'];
  Object.entries(req.headers || {}).forEach(([k, v]) => a.push('-H', k + ': ' + v));
  a.push(req.url);
  const out = cp.execFileSync('curl', a, {maxBuffer: 512 * 1024 * 1024}).toString('utf8'), i = out.lastIndexOf('\n');
  const body = out.slice(0, i), code = +out.slice(i + 1);
  return {getResponseCode: () => code, getContentText: () => body};
}
function parts(d, tz) {
  const p = {};
  new Intl.DateTimeFormat('en-US', {timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'})
    .formatToParts(d).forEach(x => p[x.type] = x.value);
  return p;
}
global.Utilities = {
  formatDate(d, tz, f) { const p = parts(d, tz); return f.replace('yyyy', p.year).replace('MM', p.month).replace('dd', p.day).replace('HH', p.hour).replace('mm', p.minute).replace('ss', p.second).replace(/\bd\b/, String(+p.day)); },
  parseDate(s, tz) { const [a, b] = s.split(' '), g = new Date(a + 'T' + (b || '00:00:00') + 'Z'), p = parts(g, tz);
    return new Date(g.getTime() - (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - g.getTime())); },
  sleep(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); },
  getUuid: () => require('crypto').randomUUID(),
  computeDigest: (alg, text) => [...require('crypto').createHash('sha256').update(text, 'utf8').digest()].map(b => b > 127 ? b - 256 : b),
  computeHmacSha256Signature: (v, k) => [...require('crypto').createHmac('sha256', k).update(v).digest()].map(b => b > 127 ? b - 256 : b),
  base64EncodeWebSafe: b => Buffer.from(b.map(x => x & 255)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_'),
  DigestAlgorithm: {SHA_256: 'sha256'}, Charset: {UTF_8: 'utf8'}
};
global.UrlFetchApp = {fetch: (url, o) => curl(Object.assign({url}, o || {})), fetchAll: reqs => reqs.map(curl)};
global.PropertiesService = {getScriptProperties: () => ({
  getProperty: k => props[k] == null ? null : props[k], setProperty: (k, v) => { props[k] = String(v); },
  deleteProperty: k => { delete props[k]; }, getProperties: () => Object.assign({}, props)})};
const cache = {};
global.CacheService = {getScriptCache: () => ({get: k => cache[k] || null, put: (k, v) => { cache[k] = v; }, remove: k => { delete cache[k]; },
  getAll: ks => { const o = {}; ks.forEach(k => { if (cache[k]) o[k] = cache[k]; }); return o; }, putAll: o => Object.assign(cache, o)})};
global.LockService = {getScriptLock: () => ({tryLock: () => true, releaseLock() {}})};
global.Logger = {log: (...a) => console.log(...a)};

(0, eval)(files.map(f => fs.readFileSync(f, 'utf8')).join('\n'));
const t0 = Date.now(), result = (0, eval)(opt.run);
console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 1));
console.error(`(${calls} web calls, ${((Date.now() - t0) / 1000).toFixed(1)} s)`);
if (opt.props) { const keep = Object.assign({}, props); map.split(',').forEach(p => delete keep[p.split('=')[0]]); fs.writeFileSync(opt.props, JSON.stringify(keep)); }
