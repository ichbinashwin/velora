// Google Analytics 4 (G-GRW2C9SQ0D), loaded only after the visitor allows
// "Analytics" in the cookie preferences. Uses Google Consent Mode v2: storage
// is denied by default, advertising signals stay off, and withdrawing consent
// deletes the _ga cookies. Without consent nothing is requested from Google.
(() => {
  const MEASUREMENT_ID = "G-GRW2C9SQ0D";
  const CONSENT_KEY = "velora_cookie_consent_v1";

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied"
  });

  let loaded = false;

  function hasConsent() {
    try {
      const consent = JSON.parse(localStorage.getItem(CONSENT_KEY));
      return Boolean(consent && consent.analytics === true);
    } catch (error) {
      return false;
    }
  }

  // Google's official opt-out switch: when true, gtag sends nothing at all.
  const setDisabled = (disabled) => { window[`ga-disable-${MEASUREMENT_ID}`] = disabled; };

  function load() {
    setDisabled(false);
    window.gtag("consent", "update", { analytics_storage: "granted" });
    if (loaded) return;
    loaded = true;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);
    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
  }

  function revoke() {
    setDisabled(true);
    window.gtag("consent", "update", { analytics_storage: "denied" });
    const host = location.hostname;
    const domains = ["", host, `.${host}`, `.${host.replace(/^www\./, "")}`];
    document.cookie.split(";").map((c) => c.split("=")[0].trim())
      .filter((name) => name === "_ga" || name.startsWith("_ga_"))
      .forEach((name) => domains.forEach((domain) => {
        document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
      }));
  }

  window.veloraAnalytics = {
    update(allowed) { if (allowed) load(); else revoke(); },
    // Conversion events carry no personal data (no names, cities or messages).
    event(name, params) { if (loaded && hasConsent()) window.gtag("event", name, params || {}); }
  };

  if (hasConsent()) load();
})();
