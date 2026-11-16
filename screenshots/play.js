window.__c = {
  clickExact(label) {
    const buttons = [...document.querySelectorAll("button")];
    const btn = buttons.find((b) => b.textContent.trim() === label);
    if (!btn) {
      throw new Error("missing [" + label + "] :: " + buttons.map((b) => b.textContent.trim()).join(" | "));
    }
    btn.click();
  },
  clickIncludes(label) {
    const buttons = [...document.querySelectorAll("button")];
    const btn = buttons.find((b) => b.textContent.includes(label));
    if (!btn) {
      throw new Error("missing ~[" + label + "] :: " + buttons.map((b) => b.textContent.trim()).join(" | "));
    }
    btn.click();
  },
  must(text) {
    if (!document.body.innerText.includes(text)) {
      throw new Error("missing text [" + text + "] :: " + document.body.innerText.slice(0, 500));
    }
  },
  digits(value) {
    for (const ch of value) this.clickExact(ch);
  },
};
"ready";
