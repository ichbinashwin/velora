// Privacy side tab: a toggle fixed to the middle of the right edge on every
// page that opens/closes the cookie preferences. Homepages toggle their
// existing consent panel; other pages get the same panel built here, which
// saves the same consent record and switches Google Analytics on or off.
(() => {
  const CONSENT_KEY = "velora_cookie_consent_v1";
  const TEXT = {
    en: { tab: "Privacy", title: "Privacy and cookie preferences", close: "Close",
      desc: "Necessary local storage remembers your choices. Optional items load images and animations on the homepage, and Google Analytics measures visits. We do not use advertising cookies.",
      necessary: ["Necessary", "Consent record, cart and display settings. Always on."],
      preferences: ["Preferences and media", "Loads third-party fashion images from Unsplash and GSAP animation libraries from jsDelivr."],
      analytics: ["Analytics", "Measures visits and page use with Google Analytics 4 (pseudonymous statistics). Never used for advertising."],
      reject: "Reject optional", save: "Save choices", accept: "Accept optional" },
    gu: { tab: "ગોપનીયતા", title: "ગોપનીયતા અને કૂકી પસંદગીઓ", close: "બંધ કરો",
      desc: "જરૂરી લોકલ સ્ટોરેજ તમારી પસંદગીઓ યાદ રાખે છે. વૈકલ્પિક વસ્તુઓ હોમપેજ પર ચિત્રો અને એનિમેશન લોડ કરે છે, અને Google Analytics મુલાકાતો માપે છે. અમે જાહેરાત કૂકીઝનો ઉપયોગ કરતા નથી.",
      necessary: ["જરૂરી", "મંજૂરીનો રેકોર્ડ, કાર્ટ અને ડિસ્પ્લે સેટિંગ્સ. હંમેશા ચાલુ."],
      preferences: ["પસંદગીઓ અને મીડિયા", "Unsplashના તૃતીય-પક્ષ ફેશન ચિત્રો અને jsDelivrની GSAP એનિમેશન લાઇબ્રેરીઓ લોડ કરે છે."],
      analytics: ["એનાલિટિક્સ", "Google Analytics 4 વડે મુલાકાતો અને પેજના ઉપયોગનું માપન (નામ વગરના આંકડા). જાહેરાત માટે ક્યારેય ઉપયોગ થતો નથી."],
      reject: "વૈકલ્પિક નકારો", save: "પસંદગીઓ સાચવો", accept: "વૈકલ્પિક સ્વીકારો" },
    hi: { tab: "गोपनीयता", title: "गोपनीयता और कुकी प्राथमिकताएं", close: "बंद करें",
      desc: "आवश्यक लोकल स्टोरेज आपकी पसंद याद रखता है। वैकल्पिक आइटम होमपेज पर इमेज और एनीमेशन लोड करते हैं, और Google Analytics विज़िट मापता है। हम विज्ञापन कुकीज़ का उपयोग नहीं करते।",
      necessary: ["आवश्यक", "सहमति रिकॉर्ड, कार्ट और डिस्प्ले सेटिंग। हमेशा चालू।"],
      preferences: ["प्राथमिकताएं और मीडिया", "Unsplash की थर्ड-पार्टी फैशन इमेज और jsDelivr की GSAP एनीमेशन लाइब्रेरी लोड करता है।"],
      analytics: ["एनालिटिक्स", "Google Analytics 4 से विज़िट और पेज उपयोग का माप (नाम रहित आंकड़े)। विज्ञापन के लिए कभी उपयोग नहीं होता।"],
      reject: "वैकल्पिक अस्वीकार करें", save: "पसंद सहेजें", accept: "वैकल्पिक स्वीकार करें" },
    de: { tab: "Datenschutz", title: "Datenschutz- und Cookie-Einstellungen", close: "Schließen",
      desc: "Notwendiger lokaler Speicher merkt sich Ihre Auswahl. Optionale Elemente laden Bilder und Animationen auf der Startseite, und Google Analytics misst Besuche. Wir verwenden keine Werbe-Cookies.",
      necessary: ["Erforderlich", "Einwilligungsnachweis, Warenkorb und Anzeigeeinstellungen. Immer aktiv."],
      preferences: ["Präferenzen und Medien", "Lädt externe Modebilder von Unsplash und GSAP-Animationsbibliotheken von jsDelivr."],
      analytics: ["Statistik", "Misst Besuche und Seitennutzung mit Google Analytics 4 (pseudonyme Statistiken). Nie für Werbung verwendet."],
      reject: "Optionale Elemente ablehnen", save: "Auswahl speichern", accept: "Optionale Elemente akzeptieren" }
  };
  const lang = (document.documentElement.lang || "en").slice(0, 2);
  const t = TEXT[lang] || TEXT.en;

  const el = (tag, attrs = {}, children = []) => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === "text") node.textContent = value;
      else if (key === "class") node.className = value;
      else node.setAttribute(key, value);
    });
    children.forEach((child) => node.append(child));
    return node;
  };

  function readConsent() {
    try {
      return JSON.parse(localStorage.getItem(CONSENT_KEY)) || null;
    } catch (error) {
      return null;
    }
  }

  // Use the homepage panel when present; otherwise build the same panel.
  let panel = document.querySelector("[data-cookie-consent]");
  const isHomePanel = Boolean(panel);
  let preferencesBox;
  let analyticsBox;

  if (!isHomePanel) {
    const option = (name, [label, text], options = {}) => {
      const input = el("input", { type: "checkbox", ...(options.locked ? { checked: "", disabled: "" } : { [`data-tab-${name}`]: "" }) });
      return [el("label", { class: `cookie-option${options.locked ? " cookie-option-locked" : ""}` }, [input, el("span", {}, [el("strong", { text: label }), ` ${text}`])]), input];
    };
    const [necessaryRow] = option("necessary", t.necessary, { locked: true });
    const [preferencesRow, preferencesInput] = option("preferences", t.preferences);
    const [analyticsRow, analyticsInput] = option("analytics", t.analytics);
    preferencesBox = preferencesInput;
    analyticsBox = analyticsInput;
    const action = (label, cls, handler) => {
      const button = el("button", { type: "button", class: `btn ${cls}`, text: label });
      button.addEventListener("click", handler);
      return button;
    };
    panel = el("div", { class: "cookie-consent", id: "consent-dialog", "data-consent-dialog": "", hidden: "" }, [
      el("div", { class: "cookie-panel", role: "dialog", "aria-modal": "true", "aria-labelledby": "consent-dialog-title" }, [
        el("div", { class: "cookie-copy" }, [
          el("h2", { id: "consent-dialog-title", text: t.title }),
          el("p", { text: t.desc })
        ]),
        el("div", { class: "cookie-options", role: "group", "aria-label": t.title }, [necessaryRow, preferencesRow, analyticsRow]),
        el("div", { class: "cookie-actions" }, [
          action(t.reject, "btn-outline-dark", () => save(false, false)),
          action(t.save, "btn-outline-dark", () => save(preferencesBox.checked, analyticsBox.checked)),
          action(t.accept, "btn-main", () => save(true, true))
        ])
      ])
    ]);
    panel.addEventListener("click", (event) => { if (event.target === panel) setOpen(false); });
    document.body.append(panel);
  } else if (!panel.id) {
    panel.id = "cookie-consent-panel";
  }

  function save(preferences, analytics) {
    const consent = {
      necessary: true,
      preferences,
      analytics,
      regionNotice: "EU GDPR / US privacy / India DPDP aligned notice",
      savedAt: new Date().toISOString(),
      version: 2
    };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    } catch (error) {
      // Storage unavailable: the choice applies for this visit only.
    }
    window.veloraAnalytics?.update(analytics);
    setOpen(false);
  }

  const tab = el("button", { type: "button", class: "consent-tab", "data-consent-tab": "", "aria-controls": panel.id, "aria-expanded": "false", "aria-label": t.title, title: t.title });
  tab.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Zm0 2.2 6 2.25V11c0 3.9-2.5 7.6-6 8.9-3.5-1.3-6-5-6-8.9V6.45l6-2.25Zm-1 9.4-2.3-2.3-1.4 1.4 3.7 3.7 5.7-5.7-1.4-1.4-4.3 4.3Z"/></svg>';
  tab.append(el("span", { class: "consent-tab-label", text: t.tab }));
  document.body.append(tab);

  function isOpen() {
    return !panel.hidden;
  }

  function setOpen(open) {
    if (open) {
      if (isHomePanel) {
        // The homepage's own opener also restores the saved checkbox states.
        document.querySelector("[data-cookie-open]")?.click();
      } else {
        const consent = readConsent();
        preferencesBox.checked = Boolean(consent && consent.preferences);
        analyticsBox.checked = Boolean(consent && consent.analytics);
        panel.hidden = false;
        panel.querySelector("button")?.focus();
      }
    } else {
      panel.hidden = true;
      tab.focus({ preventScroll: true });
    }
    sync();
  }

  function sync() {
    tab.setAttribute("aria-expanded", String(isOpen()));
    tab.classList.toggle("is-open", isOpen());
  }

  tab.addEventListener("click", () => setOpen(!isOpen()));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen() && !isHomePanel) setOpen(false);
  });
  // Keep the tab state right when the homepage panel is opened/closed elsewhere.
  new MutationObserver(sync).observe(panel, { attributes: true, attributeFilter: ["hidden"] });
  sync();
})();
