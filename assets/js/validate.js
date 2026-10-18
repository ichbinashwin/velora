// Shared input validation for the Products page forms (cart order and
// tailoring enquiry). Values are allowlist-checked and normalised before they
// can reach a WhatsApp message; see SECURITY.md for the OWASP mapping.
// This is client-side protection against accidental or casual bad input. It
// cannot stop someone messaging the WhatsApp number directly.
window.VeloraValidate = (ui, limits) => {
  // Control characters and invisible format characters (zero-width spaces etc.).
  // ZWNJ/ZWJ (U+200C/U+200D) are kept because Gujarati and Hindi need them.
  const INVISIBLE = /[\p{Cc}\p{Cf}\p{Co}\p{Cn}\u2028\u2029]/gu;
  const KEEP_JOINERS = /[\u200C\u200D]/;
  // Bidi embedding/override/isolate controls only appear in deliberately crafted
  // text (e.g. disguising "exe.txt"), so input containing them is rejected.
  const BIDI_CONTROLS = /[\u202A-\u202E\u2066-\u2069]/u;
  // Letters (any script) with combining marks, plus . ' ’ - and spaces.
  const NAME_PATTERN = /^[\p{L}\p{M}](?:[\p{L}\p{M} .'’-]*[\p{L}\p{M}.])?$/u;
  // Letters, digits, spaces and , . / - for "City / PIN code".
  const CITY_PATTERN = /^[\p{L}\p{M}\p{N}](?:[\p{L}\p{M}\p{N} ,./-]*[\p{L}\p{M}\p{N}.])?$/u;
  // Free-text notes: letters, digits, spaces and simple punctuation only. No
  // WhatsApp formatting symbols (* _ ~ `), angle brackets, @, # or quotes.
  const NOTES_PATTERN = /^[\p{L}\p{M}\p{N} ,.\-/()'’:?!]*$/u;
  // Anything that looks like a link or a web address.
  const LINK_PATTERN = /(?:https?|ftp|file|javascript|data|mailto|tel|whatsapp)\s*:|www\.|[\p{L}\p{N}-]+\.(?:com|net|org|in|io|co|me|ly|xyz|info|biz|app|link|site|online|shop|store|top|click|ru|cn|tk)\b/iu;
  // A dot followed by 2+ letters looks like a domain or file extension;
  // initials such as "A.K. Sharma" are still allowed.
  const DOT_WORD = /\.\p{L}{2,}/u;
  // 7+ digits in a row: phone numbers, UPI/bank references; a PIN code has 6.
  const LONG_NUMBER = /\d{7,}/;
  const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

  function normalizeText(value) {
    return String(value ?? "")
      .normalize("NFKC")
      .replace(/\s+/g, " ")
      .replace(INVISIBLE, (ch) => (KEEP_JOINERS.test(ch) ? ch : ""))
      .trim();
  }

  function checkName(raw) {
    const value = normalizeText(raw);
    if (!value) return { value, error: ui.err_name_required };
    const valid = !BIDI_CONTROLS.test(raw) && value.length >= 2 && value.length <= limits.name_max
      && NAME_PATTERN.test(value) && !LINK_PATTERN.test(value) && !DOT_WORD.test(value);
    return { value, error: valid ? "" : ui.err_name_invalid };
  }

  function checkCity(raw) {
    const value = normalizeText(raw);
    if (!value) return { value, error: ui.err_city_required };
    const valid = !BIDI_CONTROLS.test(raw) && value.length >= 2 && value.length <= limits.city_max
      && CITY_PATTERN.test(value) && !LINK_PATTERN.test(value) && !LONG_NUMBER.test(value);
    return { value, error: valid ? "" : ui.err_city_invalid };
  }

  // Optional free text: empty is fine.
  function checkNotes(raw) {
    const value = normalizeText(raw);
    if (!value) return { value, error: "" };
    const valid = !BIDI_CONTROLS.test(raw) && value.length <= limits.notes_max
      && NOTES_PATTERN.test(value) && !LINK_PATTERN.test(value) && !DOT_WORD.test(value)
      && !LONG_NUMBER.test(value);
    return { value, error: valid ? "" : ui.err_notes_invalid };
  }

  // Optional ISO date (from <input type="date">) between today and the limit.
  function checkDate(raw, today = new Date()) {
    const value = String(raw ?? "").trim();
    if (!value) return { value, date: null, error: "" };
    const match = ISO_DATE.exec(value);
    const date = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + limits.date_max_days);
    const valid = date && date.getMonth() === Number(match[2]) - 1 && date >= start && date <= end;
    return { value, date: valid ? date : null, error: valid ? "" : ui.err_date };
  }

  // Whole number within [min, max]; anything else falls back to min.
  function clampInt(value, min, max) {
    const number = Number.parseInt(value, 10);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : min;
  }

  // Strict integer check for fields where clamping would hide a mistake.
  function isIntInRange(value, min, max) {
    const text = String(value ?? "").trim();
    return /^\d+$/.test(text) && Number(text) >= min && Number(text) <= max;
  }

  function showFieldError(input, error) {
    const slot = document.getElementById(input.getAttribute("aria-describedby"));
    input.setAttribute("aria-invalid", error ? "true" : "false");
    if (slot) {
      slot.textContent = error;
      slot.hidden = !error;
    }
  }

  function isoDate(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  return { normalizeText, checkName, checkCity, checkNotes, checkDate, clampInt, isIntInRange, showFieldError, isoDate };
};
