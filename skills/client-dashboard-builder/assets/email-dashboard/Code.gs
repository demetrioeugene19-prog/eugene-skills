// Example Client email dashboard (Apps Script web app, its own project and password).
// Setup: Script Properties GHL_TOKEN (read-only GHL key), CALENDLY_TOKEN, DASH_PASSWORD. Run testEmail once, then
// setupTrigger once. The login, Calendly and Sales Data sheet parts are the same as the sales dashboard's Code.gs.

var TZ = 'America/New_York';
var ORG = 'https://api.calendly.com/organizations/<CALENDLY_ORG_ID>';
var CLOSERS = ['Team Member D', 'Team Member B', 'Team Member A', 'Team Member E', 'Team Member C'];
var CLOSER_BY_HOST = {'Team Member D': 'Team Member D', 'Team Member B': 'Team Member B', 'Team Member A': 'Team Member A', 'Team Member E': 'Team Member E', 'Team Member C': 'Team Member C'};
var ALIASES = {member_d: 'Team Member D', member_d_full: 'Team Member D', member_b: 'Team Member B', member_a: 'Team Member A', member_e: 'Team Member E', member_c: 'Team Member C'};
var SETTERS = ['Setter A', 'Setter B'];
var QUALIFYING_EVENT = 'qualifying call';
var SALES_SHEET = '<SALES_SHEET_ID>';
var CACHE_MINUTES = 20;

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Email Dashboard')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ---------- password ----------
// The page asks for one shared password (its own, not the sales dashboard's). Put it in Script Properties as
// DASH_PASSWORD: on the first login it is replaced by a scrambled copy (DASH_PASSWORD_HASH). To change it, add
// DASH_PASSWORD again; everyone logged in is then logged out. A login lasts 7 days on that device.
// Functions ending in _ can't be called from the page.

var SESSION_DAYS = 7;

function secret_() {
  var props = PropertiesService.getScriptProperties(), s = props.getProperty('SESSION_SECRET');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); props.setProperty('SESSION_SECRET', s); }
  return s;
}

function sha256_(text) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8)
    .map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join('');
}

function passwordHash_() {
  var props = PropertiesService.getScriptProperties(), plain = props.getProperty('DASH_PASSWORD');
  if (plain) {
    props.setProperty('DASH_PASSWORD_HASH', sha256_(secret_() + plain.trim()));
    props.deleteProperty('DASH_PASSWORD');
  }
  var h = props.getProperty('DASH_PASSWORD_HASH');
  if (!h) throw new Error('No dashboard password set yet');
  return h;
}

function signature_(expires) {
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(String(expires), secret_() + passwordHash_()));
}

function login(password) {
  var cache = CacheService.getScriptCache(), fails = +(cache.get('login_fails') || 0);
  if (fails >= 20) throw new Error('Too many wrong tries. Please wait 15 minutes.');
  if (sha256_(secret_() + String(password || '').trim()) !== passwordHash_()) {
    cache.put('login_fails', String(fails + 1), 15 * 60);
    Utilities.sleep(1500);
    throw new Error('Wrong password');
  }
  var expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  return expires + '.' + signature_(expires);
}

function tokenOk_(token) {
  var p = String(token || '').split('.');
  return p.length === 2 && +p[0] > Date.now() && p[1] === signature_(p[0]);
}

// ---------- daily request counter ----------
// Google allows about 20,000 outside requests (UrlFetch) a day per Google account, shared with the sales
// dashboard if it runs on the same account. This project keeps to DAILY_FETCH_LIMIT of them.
var DAILY_FETCH_LIMIT = 8000, fetchCount_ = 0;
function fetchDayKey_() { return 'fetches_' + Utilities.formatDate(new Date(), 'America/Los_Angeles', 'yyyy-MM-dd'); }
function fetchesToday_() { return Number(PropertiesService.getScriptProperties().getProperty(fetchDayKey_()) || 0); }
function saveFetchCount_() {
  if (!fetchCount_) return;
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(3000)) return;
  try {
    var props = PropertiesService.getScriptProperties(), key = fetchDayKey_();
    props.setProperty(key, String(Number(props.getProperty(key) || 0) + fetchCount_));
    fetchCount_ = 0;
    // keep only the last few days
    Object.keys(props.getProperties()).forEach(function (k) { if (k.indexOf('fetches_') === 0 && k < 'fetches_' + Utilities.formatDate(new Date(Date.now() - 4 * 864e5), 'America/Los_Angeles', 'yyyy-MM-dd')) props.deleteProperty(k); });
  } finally { lock.releaseLock(); }
}

function fetchesToday_() { return Number(PropertiesService.getScriptProperties().getProperty(fetchDayKey_()) || 0); }
function saveFetchCount_() {
  if (!fetchCount_) return;
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(3000)) return;
  try {
    var props = PropertiesService.getScriptProperties(), key = fetchDayKey_();
    props.setProperty(key, String(Number(props.getProperty(key) || 0) + fetchCount_));
    fetchCount_ = 0;
    // keep only the last few days
    Object.keys(props.getProperties()).forEach(function (k) { if (k.indexOf('fetches_') === 0 && k < 'fetches_' + Utilities.formatDate(new Date(Date.now() - 4 * 864e5), 'America/Los_Angeles', 'yyyy-MM-dd')) props.deleteProperty(k); });
  } finally { lock.releaseLock(); }
}

function saveFetchCount_() {
  if (!fetchCount_) return;
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(3000)) return;
  try {
    var props = PropertiesService.getScriptProperties(), key = fetchDayKey_();
    props.setProperty(key, String(Number(props.getProperty(key) || 0) + fetchCount_));
    fetchCount_ = 0;
    // keep only the last few days
    Object.keys(props.getProperties()).forEach(function (k) { if (k.indexOf('fetches_') === 0 && k < 'fetches_' + Utilities.formatDate(new Date(Date.now() - 4 * 864e5), 'America/Los_Angeles', 'yyyy-MM-dd')) props.deleteProperty(k); });
  } finally { lock.releaseLock(); }
}

// ---------- Calendly ----------

function calendlyToken_() {
  var t = PropertiesService.getScriptProperties().getProperty('CALENDLY_TOKEN');
  if (!t) throw new Error('CALENDLY_TOKEN is missing from Script Properties');
  return t.trim();
}

function monthBounds_(month) {
  var y = +month.slice(0, 4), m = +month.slice(5, 7);
  var next = m === 12 ? (y + 1) + '-01' : y + '-' + ('0' + (m + 1)).slice(-2);
  var start = Utilities.parseDate(month + '-01 00:00:00', TZ, 'yyyy-MM-dd HH:mm:ss');
  var end = Utilities.parseDate(next + '-01 00:00:00', TZ, 'yyyy-MM-dd HH:mm:ss');
  return {start: start.toISOString(), end: end.toISOString()};
}

function inviteeKey_(uri) { return 'inv_' + uri.split('/').pop(); }

function cachedInvitees_(events) {
  var cache = CacheService.getScriptCache(), out = {};
  for (var i = 0; i < events.length; i += 100) {
    var chunk = events.slice(i, i + 100);
    var hit = cache.getAll(chunk.map(function (e) { return inviteeKey_(e.uri); }));
    chunk.forEach(function (e) {
      var v = hit[inviteeKey_(e.uri)];
      if (v) out[e.uri] = JSON.parse(v);
    });
  }
  return out;
}

function cachedInvitees_(events) {
  var cache = CacheService.getScriptCache(), out = {};
  for (var i = 0; i < events.length; i += 100) {
    var chunk = events.slice(i, i + 100);
    var hit = cache.getAll(chunk.map(function (e) { return inviteeKey_(e.uri); }));
    chunk.forEach(function (e) {
      var v = hit[inviteeKey_(e.uri)];
      if (v) out[e.uri] = JSON.parse(v);
    });
  }
  return out;
}

function storeInvitees_(events, invitees) {
  var cache = CacheService.getScriptCache(), oldCut = Date.now() - 2 * 24 * 60 * 60 * 1000, old = {}, recent = {};
  events.forEach(function (e) {
    (new Date(e.end_time).getTime() < oldCut ? old : recent)[inviteeKey_(e.uri)] = JSON.stringify(invitees[e.uri]);
  });
  if (Object.keys(old).length) cache.putAll(old, 6 * 60 * 60);
  if (Object.keys(recent).length) cache.putAll(recent, 30 * 60);
}

// Invitees (no-show, reschedule, email for opportunities, booking date and utm_source for the email page).
// Google allows 20,000 web calls a day, so each event's invitees are kept for a while: 6 hours once the
// call is 2+ days old, 30 minutes before that.
function calendlyInvitees_(events, headers) {
  var invitees = cachedInvitees_(events);
  var missing = events.filter(function (e) { return !invitees[e.uri]; });
  for (var i = 0; i < missing.length; i += 40) {
    var chunk = missing.slice(i, i + 40), fresh = {};
    fetchCount_ += chunk.length;
    var replies = UrlFetchApp.fetchAll(chunk.map(function (e) {
      return {url: e.uri + '/invitees?count=100', headers: headers, muteHttpExceptions: true};
    }));
    chunk.forEach(function (e, k) {
      if (replies[k].getResponseCode() !== 200) throw new Error('Calendly invitees: HTTP ' + replies[k].getResponseCode());
      var inv = (JSON.parse(replies[k].getContentText()).collection || []).map(function (p) {
        return {id: p.uri, canceled: p.status === 'canceled', noShow: !!p.no_show, rescheduled: !!p.rescheduled,
                email: (p.email || '').trim().toLowerCase(), name: normName_(p.name),
                created: p.created_at, src: ((p.tracking || {}).utm_source || '').toLowerCase()};
      });
      invitees[e.uri] = inv;
      fresh[e.uri] = inv;
    });
    storeInvitees_(chunk, fresh);
  }
  return invitees;
}

// ---------- Sales Data sheet (revenue from email) ----------

function normName_(v) { return String(v || '').toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim(); }
function closerName_(v) { return ALIASES[(String(v || '').trim().split(/\s+/)[0] || '').toLowerCase()] || null; }
function money_(v) { var n = parseFloat(String(v || '').replace(/[^\d.\-]/g, '')); return isNaN(n) ? 0 : n; }

// "10/1/26" or "10/2/2026" -> "2026-10-01"
function saleDate_(v) {
  var t = String(v || '').trim(), iso = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[1] + '-' + iso[2] + '-' + iso[3];
  var m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (!m) return '';
  var y = m[3].length === 2 ? '20' + m[3] : m[3];
  return y + '-' + ('0' + m[1]).slice(-2) + '-' + ('0' + m[2]).slice(-2);
}

// Tab titles like "October 2026", "September 26", "May 26" -> "2026-10"
var MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
function tabMonth_(title) {
  var m = String(title).trim().toLowerCase().match(/^([a-z]+)\s+(\d{2}|\d{4})$/);
  if (!m) return null;
  var i = -1;
  MONTHS.forEach(function (name, k) { if (name === m[1] || name.slice(0, 3) === m[1]) i = k; });
  if (i < 0) return null;
  return (m[2].length === 2 ? '20' + m[2] : m[2]) + '-' + ('0' + (i + 1)).slice(-2);
}

// Each month tab has a header row (in the first 5 rows) naming the columns. Columns are found by name,
// so older tabs laid out differently still load. Needed: closer, date of sale, sale.
var COLS = {closer: ['closer'], setter: ['dm setter', 'setter'], date: ['date of sale', 'date'], client: ['client name', 'client', 'name'],
            offer: ['offer', 'program'], sale: ['sale', 'sale amount', 'booked sale'], cash: ['cash collected', 'cash']};
function findCols_(values) {
  for (var r = 0; r < Math.min(5, values.length); r++) {
    var head = values[r].map(function (x) { return String(x).trim().toLowerCase().replace(/\s+/g, ' '); }), col = {};
    Object.keys(COLS).forEach(function (k) {
      for (var i = 0; i < COLS[k].length && col[k] === undefined; i++) { var at = head.indexOf(COLS[k][i]); if (at >= 0) col[k] = at; }
    });
    if (col.closer !== undefined && col.date !== undefined && col.sale !== undefined) { col.row = r; return col; }
  }
  return null;
}

function loadSales_(month) {
  var book = SpreadsheetApp.openById(SALES_SHEET), sheet = null, tabs = {};
  book.getSheets().forEach(function (sh) {
    var m = tabMonth_(sh.getName());
    if (m) { tabs[m] = true; if (m === month) sheet = sh; }
  });
  var out = {months: Object.keys(tabs).sort().reverse(), hasTab: !!sheet, rows: []};
  if (!sheet || sheet.getLastRow() < 2) return out;
  var values = sheet.getRange(1, 1, sheet.getLastRow(), Math.min(sheet.getLastColumn(), 26)).getDisplayValues();
  var col = findCols_(values);
  if (!col) {
    var err = new Error('Sales Data tab "' + sheet.getName() + '" has no closer / date of sale / sale header. First row: ' + values[0].join(' | '));
    err.months = out.months; err.tab = sheet.getName();
    throw err;
  }
  var cell = function (r, k) { return col[k] === undefined ? '' : r[col[k]]; };
  values.slice(col.row + 1).forEach(function (r, i) {
    var closer = closerName_(cell(r, 'closer')), date = saleDate_(cell(r, 'date')), sale = money_(cell(r, 'sale'));
    if (!closer || date.slice(0, 7) !== month || sale <= 0) return;
    var setter = String(cell(r, 'setter')).trim();
    setter = setter.charAt(0).toUpperCase() + setter.slice(1).toLowerCase();
    out.rows.push({id: 'r' + (col.row + i + 2), date: date, closer: closer, setter: SETTERS.indexOf(setter) >= 0 ? setter : '',
                   offer: String(cell(r, 'offer')).trim(), revenue: sale, cash: money_(cell(r, 'cash')), client: normName_(cell(r, 'client'))});
  });
  return out;
}

function etDate_(iso) { return Utilities.formatDate(new Date(iso), TZ, 'yyyy-MM-dd'); }
function etMonth_(iso) { return Utilities.formatDate(new Date(iso), TZ, 'yyyy-MM'); }

// ---------- email numbers ----------
// How the client's marketing emails perform, from sent to opened to clicked to a booked call.
//
// Where the numbers come from
// - Sent: GHL, every email a workflow sent (exact). Needs GHL_TOKEN in Script Properties (a read-only key with
//   View Conversations + View Conversation Messages).
// - Opened / clicked: GHL only gives these one email at a time, so emailSync (every 10 minutes) checks a sample of
//   each email (up to EMAIL_SAMPLE per subject per day) once it is EMAIL_SETTLE_DAYS old, when most opens have
//   happened, and keeps the result per day in Script Properties (em_yyyy-MM-dd). Rates are worked out from that
//   sample, so the newest few days count as sent only.
// - Calls booked from email: Calendly bookings with utm_source=email or made on the Email booking page. The email
//   behind each booking is the last marketing email the person clicked (or opened) before booking.
// - Revenue from email: sales in the Sales Data sheet whose client booked from email.

var GHL_LOCATION = '<GHL_LOCATION_ID>';
var EMAIL_SAMPLE = 30;          // emails checked per subject per day for older months
var EMAIL_SAMPLE_NOW = 400;     // this month: every email (clicks are rare, so a small sample undercounts them)
var EMAIL_SETTLE_DAYS = 3;      // opens and clicks are checked once an email is this many days old
var EMAIL_DAILY_CHECKS = 5000;  // most open/click checks per day, so the sales dashboard keeps its share
var EMAIL_VERSION = 1;          // bump when the email numbers change shape

// Marketing sequences: list each sequence and the subject lines it sends (compared in lower case).
// Fill these from the client's own email account; a marketing subject not listed shows under "Other emails".
var EMAIL_SEQUENCES = [
  {name: 'Long Term Nurture', note: 'Leads who did not book a call', subjects: ['<subject line 1>', '<subject line 2>']},
  {name: 'Assessment: completed', note: 'Results and follow-ups', subjects: ['<subject line>']},
  {name: 'Assessment: not finished', note: 'Started but did not finish', subjects: ['<subject line>']},
  {name: 'Form abandonment', note: 'Left the form before the end', subjects: ['<subject line>']},
  {name: 'Before the call', note: 'Booked, before the call', subjects: ['<subject line>']},
  {name: 'Call recovery', note: 'Canceled or missed the call', subjects: ['<subject line>']},
  {name: 'Lead magnet sequence', note: 'Delivers the free resource', subjects: ['<subject line>']}
];
var EMAIL_OTHER = 'Other emails';

// Program emails and staff notices are not email marketing, so they are left out.
var EMAIL_SKIP = /^(welcome|appointment rebooked|check-in due|renewal|next steps$|zz )/;
var EMAIL_CLIENT = ['<program email subject>'];

var EMAIL_SEQ_BY_SUBJECT = (function () {
  var out = {};
  EMAIL_SEQUENCES.forEach(function (q) { q.subjects.forEach(function (s) { out[s.toLowerCase()] = q.name; }); });
  EMAIL_CLIENT.forEach(function (s) { out[s.toLowerCase()] = null; });
  return out;
})();

// One name per email: personal touches ("You still with me Tania?") and chapter titles are folded together.
function emailSubject_(s) {
  s = String(s || '').replace(/\s+/g, ' ').trim();
  if (/^you still with me\b/i.test(s)) return 'You still with me?';
  if (/^you started something\b/i.test(s)) return 'You started something, want to finish it?';
  var ch = s.match(/^(chapter \d of 5)\b/i);
  if (ch) return 'Chapter ' + ch[1].slice(8);
  return s.slice(0, 90);
}

// Sequence name, EMAIL_OTHER, or null for emails that are not marketing.
function emailSequence_(subject) {
  var k = String(subject || '').toLowerCase();
  if (!k || EMAIL_SKIP.test(k)) return null;
  return EMAIL_SEQ_BY_SUBJECT.hasOwnProperty(k) ? EMAIL_SEQ_BY_SUBJECT[k] : EMAIL_OTHER;
}

// ---------- GHL ----------

function ghlToken_() {
  var t = PropertiesService.getScriptProperties().getProperty('GHL_TOKEN');
  if (!t) throw new Error('GHL_TOKEN is missing from Script Properties');
  return t.trim();
}

function ghlRequest_(path, params) {
  var q = Object.keys(params || {}).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('&');
  return {url: 'https://services.leadconnectorhq.com' + path + (q ? '?' + q : ''), muteHttpExceptions: true,
          headers: {Authorization: 'Bearer ' + ghlToken_(), Version: '2021-04-15', Accept: 'application/json'}};
}

function ghlGet_(path, params) {
  var req = ghlRequest_(path, params), res;
  for (var i = 0; i < 3; i++) {
    fetchCount_++;
    res = UrlFetchApp.fetch(req.url, req);
    if (res.getResponseCode() !== 429) break;
    Utilities.sleep(5000);  // GHL allows 100 requests per 10 seconds
  }
  if (res.getResponseCode() !== 200) throw new Error('GHL ' + path + ': HTTP ' + res.getResponseCode());
  return JSON.parse(res.getContentText());
}

// Emails sent by workflows between two times (ISO), as {id, subject, at}. GHL sometimes ends the list early
// when it is busy, so the count is checked against GHL's own total and read again once if it comes up short.
function ghlEmails_(startIso, endIso) {
  for (var attempt = 0; attempt < 2; attempt++) {
    var out = [], cursor = null, seen = 0, total = null;
    do {
      var params = {locationId: GHL_LOCATION, channel: 'Email', limit: 500, startDate: startIso, endDate: endIso};
      if (cursor) params.cursor = cursor;
      var page = ghlGet_('/conversations/messages/export', params), msgs = page.messages || [];
      if (total === null) total = Number(page.total) || 0;
      seen += msgs.length;
      msgs.forEach(function (m) { if (m.source === 'workflow') out.push({id: m.id, subject: m.subject, at: m.dateAdded}); });
      cursor = msgs.length ? page.nextCursor : null;
    } while (cursor);
    if (seen >= total) return out;
    console.error('GHL email list came back short: ' + seen + ' of ' + total + (attempt ? ', using it anyway' : ', reading again'));
  }
  return out;
}

// ---------- days ----------

function dayStart_(day) { return Utilities.parseDate(day + ' 00:00:00', TZ, 'yyyy-MM-dd HH:mm:ss').toISOString(); }
function addDays_(day, n) {
  var noon = Utilities.parseDate(day + ' 12:00:00', TZ, 'yyyy-MM-dd HH:mm:ss');
  return Utilities.formatDate(new Date(noon.getTime() + n * 864e5), TZ, 'yyyy-MM-dd');
}
function shiftMonth_(month, n) {
  var d = new Date(+month.slice(0, 4), +month.slice(5, 7) - 1 + n, 15);
  return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2);
}
function monthDays_(month) { return new Date(+month.slice(0, 4), +month.slice(5, 7), 0).getDate(); }
function todayEt_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'); }
function settledThrough_() { return addDays_(todayEt_(), -EMAIL_SETTLE_DAYS); }

// ---------- emailSync: opens and clicks, one day at a time ----------

// Every 10 minutes (setupTrigger). Works through the days that are old enough and not checked yet: this
// month first, then last month (newest first), until about 4 minutes or the daily check budget is used.
function emailSync(e) {
  if (!e || !e.triggerUid) return;
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('GHL_TOKEN')) return;
  var cache = CacheService.getScriptCache();
  if (cache.get('emailSync_running')) return;
  cache.put('emailSync_running', '1', 6 * 60);
  try {
    var started = Date.now(), budgetKey = 'emchecks_' + Utilities.formatDate(new Date(), 'America/Los_Angeles', 'yyyy-MM-dd');
    var used = Number(props.getProperty(budgetKey) || 0), last = settledThrough_();
    var month = last.slice(0, 7), days = [], thisMonth = Utilities.formatDate(new Date(), TZ, 'yyyy-MM');
    for (var d = 1; d <= monthDays_(month); d++) { var day = month + '-' + ('0' + d).slice(-2); if (day <= last) days.push(day); }
    var prev = shiftMonth_(month, -1);
    for (d = monthDays_(prev); d >= 1; d--) days.push(prev + '-' + ('0' + d).slice(-2));
    for (var i = 0; i < days.length; i++) {
      var have = props.getProperty('em_' + days[i]);
      // this month's days checked from a sample before every email was checked are done again
      if (have && (days[i].slice(0, 7) !== thisMonth || JSON.parse(have).full)) continue;
      if (Date.now() - started > 4 * 60 * 1000 || used >= EMAIL_DAILY_CHECKS || fetchesToday_() + fetchCount_ > DAILY_FETCH_LIMIT * 0.8) break;
      var r = emailCheckDay_(days[i], days[i].slice(0, 7) === thisMonth);
      props.setProperty('em_' + days[i], JSON.stringify(r.data));
      used += r.checks;
      props.setProperty(budgetKey, String(used));
    }
    emailTidy_(props, prev);
    // keep this month's page ready, so it opens without waiting
    var now = Utilities.formatDate(new Date(), TZ, 'yyyy-MM');
    if (Date.now() - started < 4 * 60 * 1000 && !cache.get('email' + EMAIL_VERSION + '_' + now)) emailData_(now);
  } finally {
    saveFetchCount_();
    cache.remove('emailSync_running');
  }
}

// Sent count per subject for one day, plus opened/clicked for a sample of each: {s: {subject: [sent, checked, opened, clicked]}}
function emailCheckDay_(day, full) {
  var by = {}, checks = [], data = {};
  ghlEmails_(dayStart_(day), dayStart_(addDays_(day, 1))).forEach(function (m) {
    var s = emailSubject_(m.subject);
    if (emailSequence_(s) !== null) (by[s] = by[s] || []).push(m.id);
  });
  Object.keys(by).forEach(function (s) {
    var ids = by[s].slice();
    for (var i = ids.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = ids[i]; ids[i] = ids[j]; ids[j] = t; }
    ids.slice(0, full ? EMAIL_SAMPLE_NOW : EMAIL_SAMPLE).forEach(function (id) { checks.push({s: s, id: id}); });
    data[s] = [by[s].length, 0, 0, 0];
  });
  for (var i = 0; i < checks.length; i += 45) {
    if (i) Utilities.sleep(5000);  // stay under GHL's 100 requests per 10 seconds
    var chunk = checks.slice(i, i + 45);
    fetchCount_ += chunk.length;
    var replies = UrlFetchApp.fetchAll(chunk.map(function (c) { return ghlRequest_('/conversations/messages/email/' + c.id); }));
    chunk.forEach(function (c, k) {
      var code = replies[k].getResponseCode();
      if (code === 401 || code === 403) throw new Error('GHL email status: HTTP ' + code + ' (check GHL_TOKEN and its scopes)');
      if (code !== 200) return;  // not counted as checked
      var m = JSON.parse(replies[k].getContentText()), st = String((m.emailMessage || m).status || '').toLowerCase(), v = data[c.s];
      v[1]++;
      if (st === 'opened' || st === 'clicked') v[2]++;
      if (st === 'clicked') v[3]++;
    });
  }
  return {data: full ? {s: data, full: 1} : {s: data}, checks: checks.length};
}

// Script Properties hold about 500 KB, so days older than last month are folded into one total per month
// (emm_yyyy-MM). Old daily check counters are removed too.
function emailTidy_(props, keepFrom) {
  var all = props.getProperties(), months = {};
  Object.keys(all).forEach(function (k) {
    if (k.indexOf('emchecks_') === 0 && k < 'emchecks_' + addDays_(todayEt_(), -4)) props.deleteProperty(k);
    if (k.indexOf('em_') !== 0 || k.slice(3, 10) >= keepFrom) return;
    (months[k.slice(3, 10)] = months[k.slice(3, 10)] || []).push(k);
  });
  Object.keys(months).forEach(function (m) {
    var total = all['emm_' + m] ? JSON.parse(all['emm_' + m]).s : {};
    months[m].forEach(function (k) {
      var s = JSON.parse(all[k]).s;
      Object.keys(s).forEach(function (name) {
        var t = total[name] = total[name] || [0, 0, 0, 0];
        for (var i = 0; i < 4; i++) t[i] += s[name][i];
      });
    });
    var names = Object.keys(total).sort(function (a, b) { return total[b][0] - total[a][0]; }), json;
    while ((json = JSON.stringify({s: total})).length > 8500 && names.length) delete total[names.pop()];
    props.setProperty('emm_' + m, json);
    months[m].forEach(function (k) { props.deleteProperty(k); });
  });
}

// ---------- page data ----------

// Called by the email page. Kept for 20 minutes (1 hour for past months).
function getEmailDashboard(month, token) {
  if (!tokenOk_(token)) throw new Error('LOGIN_REQUIRED');
  return emailData_(month);
}

function emailData_(month) {
  var thisMonth = Utilities.formatDate(new Date(), TZ, 'yyyy-MM');
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month || '')) month = thisMonth;
  var cache = CacheService.getScriptCache(), key = 'email' + EMAIL_VERSION + '_' + month, hit = cache.get(key);
  if (hit) return JSON.parse(hit);
  var prevMonth = shiftMonth_(month, -1), cutDay = month === thisMonth ? +todayEt_().slice(8) : 31;
  var warnings = [], cur, prev, bookings = null, sales = null, prevSales = null;
  try {
    cur = emailDays_(month, 31);
    prev = emailDays_(prevMonth, cutDay);
  } catch (err) {
    console.error('GHL emails: ' + err.message);
    throw new Error('GHL did not load this time. Please try Refresh in a minute.');
  }
  try { bookings = emailBookings_(month, prevMonth); } catch (err) {
    console.error('Calendly email bookings: ' + err.message);
    warnings.push('Calendly did not load this time, so calls booked from email show ",".');
  }
  try { sales = loadSales_(month).rows; prevSales = loadSales_(prevMonth).rows; } catch (err) {
    console.error('Sales Data sheet (email page): ' + err.message);
    warnings.push('The Sales Data sheet did not load this time, so revenue from email shows ",".');
  }
  var inCur = function (b) { return b.day.slice(0, 7) === month; };
  var inPrev = function (b) { return b.day.slice(0, 7) === prevMonth && +b.day.slice(8) <= cutDay; };
  var curBook = bookings && bookings.filter(inCur), prevBook = bookings && bookings.filter(inPrev);
  if (curBook) curBook.forEach(function (b) { b.via = emailBehind_(b); });
  var data = emailSummary_(month, cur, curBook);
  var p = emailSummary_(prevMonth, prev, prevBook);
  data.prev = {month: prevMonth, days: cutDay, sent: p.sent, opened: p.opened, clicked: p.clicked, openRate: p.openRate,
               ctr: p.ctr, booked: p.booked, ratesFrom: p.ratesFrom, missingDays: p.missingDays};
  if (bookings && sales) {
    // a sale counts as revenue from email when the client booked from email this month or last month
    var names = {};
    bookings.forEach(function (b) { if (b.name) names[b.name] = true; });
    var money = function (rows, maxDay) {
      var r = {revenue: 0, cash: 0, sales: 0};
      rows.forEach(function (s) {
        if (!names[s.client] || +s.date.slice(8) > maxDay) return;
        r.revenue += s.revenue; r.cash += s.cash; r.sales++;
      });
      return r;
    };
    data.money = money(sales, 31);
    data.prev.money = money(prevSales, cutDay);
    data.money.total = sales.reduce(function (t, s) { return t + s.revenue; }, 0);
  }
  saveFetchCount_();
  data.warnings = warnings;
  data.updated = new Date().toISOString();
  cache.put(key, JSON.stringify(data), warnings.length ? 60 : month < thisMonth ? 3600 : CACHE_MINUTES * 60);
  return data;
}

// The days of a month up to maxDay, each with {day, data, live}. Checked days come from emailSync; the newest
// days (not old enough to check) are read from GHL as sent only. Months folded by emailTidy_ come back as one row.
function emailDays_(month, maxDay) {
  var props = PropertiesService.getScriptProperties().getProperties(), today = todayEt_(), last = settledThrough_(), days = [];
  for (var d = 1; d <= Math.min(maxDay, monthDays_(month)); d++) {
    var day = month + '-' + ('0' + d).slice(-2);
    if (day > today) break;
    days.push({day: day, data: props['em_' + day] ? JSON.parse(props['em_' + day]) : null});
  }
  if (props['emm_' + month] && !days.some(function (x) { return x.data; })) return [{day: month + '-01', data: JSON.parse(props['emm_' + month]), whole: true}];
  var recent = days.filter(function (x) { return !x.data && x.day > last; });
  if (recent.length) {
    var counts = {};
    ghlEmails_(dayStart_(recent[0].day), new Date().toISOString()).forEach(function (m) {
      var day = etDate_(m.at), s = emailSubject_(m.subject), c = counts[day] = counts[day] || {};
      c[s] = c[s] || [0, 0, 0, 0];
      c[s][0]++;
    });
    recent.forEach(function (x) { x.data = {s: counts[x.day] || {}}; x.live = true; });
  }
  return days;
}

// Totals, per day, per sequence and per email. Opened and clicked are estimates from the checked sample:
// sent x (opened in sample / checked in sample), added up per subject and day.
function emailSummary_(month, days, bookings) {
  var subj = {}, daily = [], t = {sent: 0, base: 0, opened: 0, clicked: 0}, ratesFrom = null, ratesTo = null, missing = 0, live = 0;
  days.forEach(function (d) {
    var row = {day: +d.day.slice(8), sent: 0, opened: 0, clicked: 0, checked: !!(d.data && !d.live)};
    if (!d.data) missing++;
    if (d.live) live++;
    var s = (d.data && d.data.s) || {};
    Object.keys(s).forEach(function (name) {
      var seq = emailSequence_(name);
      if (seq === null) return;
      var v = s[name], x = subj[name] = subj[name] || {subject: name, seq: seq, sent: 0, base: 0, opened: 0, clicked: 0, booked: 0};
      x.sent += v[0]; row.sent += v[0];
      if (!v[1]) return;
      var o = v[0] * v[2] / v[1], c = v[0] * v[3] / v[1];
      x.base += v[0]; x.opened += o; x.clicked += c;
      row.opened += o; row.clicked += c; t.base += v[0];
    });
    if (row.checked) { ratesFrom = ratesFrom || d.day; ratesTo = d.day; }
    t.sent += row.sent; t.opened += row.opened; t.clicked += row.clicked;
    if (!d.whole) daily.push(row);
  });
  var booked = null, bySeq = {};
  if (bookings) {
    booked = bookings.length;
    bookings.forEach(function (b) {
      var via = b.via && b.via.subject, seq = via ? emailSequence_(via) || EMAIL_OTHER : null;
      if (via && subj[via]) subj[via].booked++;
      if (seq) bySeq[seq] = (bySeq[seq] || 0) + 1;
    });
  }
  var rate = function (x) { return {openRate: x.base ? x.opened / x.base : null, ctr: x.base ? x.clicked / x.base : null}; };
  var round = function (x) {
    var r = rate(x);
    return {subject: x.subject, seq: x.seq, sent: x.sent, opened: Math.round(x.opened), clicked: Math.round(x.clicked),
            openRate: r.openRate, ctr: r.ctr, booked: x.booked, checked: x.base};
  };
  var order = EMAIL_SEQUENCES.map(function (q) { return q.name; }).concat([EMAIL_OTHER]);
  var sequences = order.map(function (name) {
    var q = EMAIL_SEQUENCES.filter(function (x) { return x.name === name; })[0];
    var emails = Object.keys(subj).map(function (k) { return subj[k]; }).filter(function (x) { return x.seq === name; });
    var sum = {sent: 0, base: 0, opened: 0, clicked: 0};
    emails.forEach(function (x) { sum.sent += x.sent; sum.base += x.base; sum.opened += x.opened; sum.clicked += x.clicked; });
    var r = rate(sum);
    return {name: name, note: q ? q.note : 'Marketing emails not in a known sequence yet', sent: sum.sent, opened: Math.round(sum.opened),
            clicked: Math.round(sum.clicked), openRate: r.openRate, ctr: r.ctr, booked: bookings ? bySeq[name] || 0 : null,
            emails: emails.sort(function (a, b) { return b.sent - a.sent; }).slice(0, 40).map(round)};
  }).filter(function (q) { return q.sent || q.booked; });
  // best emails: enough checked to trust the rate, ranked by calls booked, then click rate
  var top = Object.keys(subj).map(function (k) { return subj[k]; }).filter(function (x) { return x.base >= 20 || x.booked; })
    .map(round).sort(function (a, b) { return (b.booked - a.booked) || ((b.ctr || 0) - (a.ctr || 0)); }).slice(0, 8);
  var r = rate(t);
  return {
    month: month, sent: t.sent, opened: Math.round(t.opened), clicked: Math.round(t.clicked), openRate: r.openRate, ctr: r.ctr,
    booked: booked, ratesFrom: ratesFrom, ratesTo: ratesTo, liveDays: live, missingDays: missing,
    daily: daily, sequences: sequences, top: top,
    bookings: bookings ? bookings.slice().sort(function (a, b) { return a.created < b.created ? 1 : -1; }).map(function (b) {
      var via = b.via && b.via.subject;
      return {day: b.day, who: emailInitials_(b.name), closer: b.closer, subject: via || '', seq: via ? emailSequence_(via) || EMAIL_OTHER : '',
              canceled: b.canceled, page: /email/i.test(b.event)};
    }) : null
  };
}

function emailInitials_(name) {
  var w = String(name || '').split(' ').filter(String);
  return w.length ? w.map(function (x) { return x.charAt(0).toUpperCase() + '.'; }).slice(0, 2).join(' ') : ',';
}

// Qualifying Call bookings made from email in `month` or `prevMonth` (by booking date). The old half of a
// reschedule is left out, so each booking counts once.
function emailBookings_(month, prevMonth) {
  var headers = {Authorization: 'Bearer ' + calendlyToken_()}, events = [];
  var from = monthBounds_(prevMonth).start, to = new Date(new Date(monthBounds_(month).end).getTime() + 45 * 864e5).toISOString();
  var url = 'https://api.calendly.com/scheduled_events?organization=' + encodeURIComponent(ORG) +
            '&min_start_time=' + encodeURIComponent(from) + '&max_start_time=' + encodeURIComponent(to) + '&count=100';
  while (url) {
    fetchCount_++;
    var page = JSON.parse(UrlFetchApp.fetch(url, {headers: headers}).getContentText());
    events = events.concat(page.collection || []);
    url = page.pagination && page.pagination.next_page;
  }
  events = events.filter(function (e) { return (e.name || '').toLowerCase().indexOf(QUALIFYING_EVENT) >= 0; });
  var invitees = calendlyInvitees_(events, headers), out = [];
  events.forEach(function (e) {
    var host = ((e.event_memberships || [])[0] || {}).user_name || '';
    invitees[e.uri].forEach(function (p) {
      if (!p.created || p.rescheduled) return;
      if (p.src !== 'email' && !/email/i.test(e.name || '')) return;
      var day = etDate_(p.created);
      if (day.slice(0, 7) !== month && day.slice(0, 7) !== prevMonth) return;
      out.push({id: p.id, created: p.created, day: day, email: p.email, name: p.name, event: e.name || '',
                closer: CLOSER_BY_HOST[host] || host || ',', canceled: e.status === 'canceled' || p.canceled});
    });
  });
  return out;
}

// The marketing email behind a booking: the newest one clicked before booking, else the newest opened, else the
// newest sent (looking at the last 4). Kept for 6 hours.
function emailBehind_(b) {
  var cache = CacheService.getScriptCache(), key = 'ebk_' + String(b.id).split('/').pop(), hit = cache.get(key);
  if (hit) return JSON.parse(hit);
  var found = {subject: ''};
  try {
    var conv = (ghlGet_('/conversations/search', {locationId: GHL_LOCATION, query: b.email, limit: 5}).conversations || [])
      .filter(function (c) { return String(c.email || '').toLowerCase() === b.email; })[0];
    if (conv) {
      var res = ghlGet_('/conversations/' + conv.id + '/messages', {limit: 40, type: 'TYPE_EMAIL'}).messages;
      var msgs = (res && res.messages) || res || [];
      var sent = msgs.filter(function (m) {
        var subject = emailSubject_(((m.meta || {}).email || {}).subject);
        return m.direction === 'outbound' && m.dateAdded < b.created && emailSequence_(subject) !== null &&
               (((m.meta || {}).email || {}).messageIds || []).length;
      }).sort(function (x, y) { return x.dateAdded < y.dateAdded ? 1 : -1; }).slice(0, 4);
      if (sent.length) {
        fetchCount_ += sent.length;
        var replies = UrlFetchApp.fetchAll(sent.map(function (m) { return ghlRequest_('/conversations/messages/email/' + ((m.meta || {}).email || {}).messageIds[0]); }));
        var status = replies.map(function (r) {
          return r.getResponseCode() === 200 ? String((function (j) { return (j.emailMessage || j).status; })(JSON.parse(r.getContentText())) || '').toLowerCase() : '';
        });
        var pick = status.indexOf('clicked');
        if (pick < 0) pick = status.indexOf('opened');
        if (pick < 0) pick = 0;
        found = {subject: emailSubject_(sent[pick].meta.email.subject), status: status[pick] || 'sent'};
      }
    }
  } catch (err) { console.error('Email behind booking: ' + err.message); }
  cache.put(key, JSON.stringify(found), 6 * 60 * 60);
  return found;
}

// Run once from the editor after adding GHL_TOKEN: checks yesterday-minus-3 and logs this month's numbers.
function testEmail() {
  var day = settledThrough_(), r = emailCheckDay_(day);
  Logger.log(day + ': ' + r.checks + ' checks');
  Object.keys(r.data.s).sort(function (a, b) { return r.data.s[b][0] - r.data.s[a][0]; }).slice(0, 15).forEach(function (s) {
    var v = r.data.s[s];
    Logger.log(v[0] + ' sent, ' + v[2] + '/' + v[1] + ' opened, ' + v[3] + ' clicked | ' + emailSequence_(s) + ' | ' + s);
  });
  PropertiesService.getScriptProperties().setProperty('em_' + day, JSON.stringify(r.data));
  CacheService.getScriptCache().remove('email' + EMAIL_VERSION + '_' + Utilities.formatDate(new Date(), TZ, 'yyyy-MM'));
  var d = emailData_(Utilities.formatDate(new Date(), TZ, 'yyyy-MM'));
  Logger.log('month: sent ' + d.sent + ', opened ~' + d.opened + ', clicked ~' + d.clicked + ', booked ' + d.booked +
             ', rates from ' + d.ratesFrom + ' to ' + d.ratesTo + ', warnings ' + JSON.stringify(d.warnings));
  d.sequences.forEach(function (q) { Logger.log(q.name + ': ' + q.sent + ' sent, open ' + q.openRate + ', ctr ' + q.ctr + ', booked ' + q.booked); });
  (d.bookings || []).forEach(function (b) { Logger.log('booking ' + b.day + ' ' + b.who + ' ' + b.closer + ' <- ' + b.subject); });
  saveFetchCount_();
}

// Run once from the editor: checks email opens every 10 minutes and keeps this month's page ready.
function setupTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'emailSync') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('emailSync').timeBased().everyMinutes(10).create();
}
