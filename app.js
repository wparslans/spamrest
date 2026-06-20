/* SpamRest AppSumo setup page */
(function () {
  'use strict';

  // ---- Derive the site's base URL (works on GitHub Pages project or custom domain) ----
  // Strip a trailing index.html and any trailing slash, so endpoints append cleanly.
  var base = location.origin + location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
  var webhookUrl = base + '/appsumo/webhook';
  var oauthUrl = base + '/appsumo/oauth';

  function setVal(id, v) { var el = document.getElementById(id); if (el) el.value = v; }
  setVal('webhook-url', webhookUrl);
  setVal('oauth-url', oauthUrl);
  setVal('redirect-uri', oauthUrl);

  var note = document.getElementById('webhook-note');
  if (note) note.innerHTML = 'GitHub Pages answers GET only — see the webhook caveat below before validating this in the Partner Portal.';

  // ---- Copy buttons (inputs) ----
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.copy-btn');
    if (!b) return;

    if (b.hasAttribute('data-copy')) {
      var input = document.querySelector(b.getAttribute('data-copy'));
      if (input) copyText(input.value, b);
    } else if (b.hasAttribute('data-copy-code')) {
      var pre = b.closest('.code-block').querySelector('pre');
      if (pre) copyText(pre.innerText, b);
    } else if (b.hasAttribute('data-reveal')) {
      var f = document.querySelector(b.getAttribute('data-reveal'));
      if (f) { var show = f.type === 'password'; f.type = show ? 'text' : 'password'; b.textContent = show ? 'Hide' : 'Show'; }
    }
  });

  function copyText(text, btn) {
    navigator.clipboard.writeText(text).then(function () {
      var orig = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(function () { btn.textContent = orig; btn.classList.remove('copied'); }, 1500);
    });
  }

  // ---- Live endpoint health checks ----
  function check(id, url, validate) {
    var pill = document.querySelector('#' + id + ' [data-status]');
    if (!pill) return;
    fetch(url, { method: 'GET' })
      .then(function (r) { return r.text().then(function (t) { return { ok: r.ok, status: r.status, text: t }; }); })
      .then(function (res) {
        var good = res.ok && (!validate || validate(res.text));
        pill.textContent = good ? ('200 OK · live') : (res.status + ' · check');
        pill.classList.add(good ? 'active' : 'fail');
      })
      .catch(function () { pill.textContent = 'unreachable'; pill.classList.add('fail'); });
  }
  check('ep-oauth', oauthUrl + '/', null);
  check('ep-webhook', webhookUrl, function (t) { return t.indexOf('success') !== -1; });
})();
