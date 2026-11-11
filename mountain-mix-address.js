/* GB Dry Fruit — Mountain Mix delivery-address step
   Adds a required customer details form before the Mountain Mix WhatsApp request.
   Keeps the existing Mountain Mix ingredient/budget builder intact. */
(() => {
  "use strict";

  const WHATSAPP_NUMBER = "923555850225";
  const BUTTON_SELECTOR = "#mountain-mix-whatsapp";
  const MODAL_ID = "mountain-mix-address-modal";
  const money = (amount) => `Rs. ${Math.round(Number(amount) || 0).toLocaleString("en-PK")}`;

  const styles = `
    #${MODAL_ID}{position:fixed;inset:0;z-index:10050;display:none;align-items:center;justify-content:center;padding:16px;font-family:inherit}
    #${MODAL_ID}.is-open{display:flex}
    #${MODAL_ID} .mma-backdrop{position:absolute;inset:0;background:rgba(18,29,20,.66);backdrop-filter:blur(3px)}
    #${MODAL_ID} .mma-dialog{position:relative;z-index:1;width:min(100%,520px);max-height:min(92vh,820px);overflow:auto;padding:22px;border-radius:18px;background:#fff;box-shadow:0 24px 80px rgba(0,0,0,.24)}
    #${MODAL_ID} .mma-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:8px}
    #${MODAL_ID} .mma-kicker{color:#16833b;font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
    #${MODAL_ID} h2{margin:5px 0 0;color:#24392a;font-family:'Playfair Display',Georgia,serif;font-size:26px}
    #${MODAL_ID} .mma-close{width:36px;height:36px;border:0;border-radius:50%;background:#f1f4ee;color:#263b2b;font-size:24px;line-height:1;cursor:pointer}
    #${MODAL_ID} .mma-help{margin:8px 0 16px;color:#687568;font-size:12px;line-height:1.6}
    #${MODAL_ID} .mma-summary{margin:0 0 16px;padding:11px 13px;border:1px solid #e5ecdf;border-radius:11px;background:#f7faf4;color:#435342;font-size:12px;line-height:1.6}
    #${MODAL_ID} .mma-summary strong{color:#1d6633}
    #${MODAL_ID} .mma-form{display:grid;grid-template-columns:1fr 1fr;gap:10px 12px}
    #${MODAL_ID} .mma-field{display:flex;flex-direction:column;gap:5px;min-width:0}
    #${MODAL_ID} .mma-field.full{grid-column:1/-1}
    #${MODAL_ID} label{color:#3f4f40;font-size:11px;font-weight:700}
    #${MODAL_ID} label span{color:#c34d3b}
    #${MODAL_ID} input,#${MODAL_ID} textarea{width:100%;box-sizing:border-box;border:1px solid #dce4d8;border-radius:9px;padding:11px 12px;background:#fcfdfb;color:#203426;font:13px inherit;outline:none}
    #${MODAL_ID} input:focus,#${MODAL_ID} textarea:focus{border-color:#16833b;box-shadow:0 0 0 3px rgba(22,131,59,.1)}
    #${MODAL_ID} textarea{resize:vertical;min-height:76px}
    #${MODAL_ID} .mma-delivery{grid-column:1/-1;padding:11px 12px;border-radius:10px;background:#fff9ec;border:1px solid #f0e2c3;color:#715b31;font-size:11px;line-height:1.6}
    #${MODAL_ID} .mma-actions{grid-column:1/-1;display:flex;gap:9px;margin-top:3px}
    #${MODAL_ID} .mma-actions button{flex:1;min-height:44px;border:0;border-radius:9px;padding:10px 12px;font-size:12px;font-weight:800;cursor:pointer}
    #${MODAL_ID} .mma-cancel{background:#eef2eb;color:#435343}
    #${MODAL_ID} .mma-submit{background:#16833b;color:#fff}
    #${MODAL_ID} .mma-submit:hover{background:#0d642e}
    @media(max-width:480px){#${MODAL_ID}{padding:10px}#${MODAL_ID} .mma-dialog{padding:17px;border-radius:15px}#${MODAL_ID} .mma-form{grid-template-columns:1fr}#${MODAL_ID} .mma-field.full,#${MODAL_ID} .mma-delivery,#${MODAL_ID} .mma-actions{grid-column:1}#${MODAL_ID} h2{font-size:23px}}
  `;

  function clean(value) {
    return String(value || "").trim();
  }

  function getSelectedIngredients() {
    return [...document.querySelectorAll("#mountain-mix-ingredients input[data-mix-id]:checked")]
      .map((input) => {
        const card = input.closest("label");
        const name = card?.querySelector(".mountain-mix-ingredient-copy strong")?.textContent;
        return clean(name);
      })
      .filter(Boolean);
  }

  function currentBudget() {
    const value = Number(document.getElementById("mountain-mix-budget")?.value);
    return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
  }

  function deliveryFee(city) {
    const normalized = clean(city).toLowerCase().replace(/\s+city$/, "");
    return normalized === "gilgit" ? 150 : 300;
  }

  function ensureModal() {
    if (document.getElementById(MODAL_ID)) return document.getElementById(MODAL_ID);

    const style = document.createElement("style");
    style.id = "mountain-mix-address-styles";
    style.textContent = styles;
    document.head.appendChild(style);

    const modal = document.createElement("div");
    modal.id = MODAL_ID;
    modal.innerHTML = `
      <div class="mma-backdrop" data-mma-close></div>
      <section class="mma-dialog" role="dialog" aria-modal="true" aria-labelledby="mma-title" aria-describedby="mma-help">
        <div class="mma-head">
          <div><div class="mma-kicker">One last step</div><h2 id="mma-title">Delivery details</h2></div>
          <button class="mma-close" type="button" aria-label="Close" data-mma-close>×</button>
        </div>
        <p class="mma-help" id="mma-help">Please enter your details. We will send your Mountain Mix selection and delivery address to GB Dry Fruit on WhatsApp.</p>
        <div class="mma-summary" id="mma-summary" aria-live="polite"></div>
        <form class="mma-form" id="mma-form">
          <div class="mma-field"><label for="mma-name">Full name <span>*</span></label><input id="mma-name" name="name" autocomplete="name" maxlength="80" required placeholder="Your full name"></div>
          <div class="mma-field"><label for="mma-phone">Mobile / WhatsApp <span>*</span></label><input id="mma-phone" name="phone" type="tel" autocomplete="tel" minlength="10" maxlength="20" required placeholder="03XXXXXXXXX"></div>
          <div class="mma-field full"><label for="mma-city">City / Town <span>*</span></label><input id="mma-city" name="city" autocomplete="address-level2" maxlength="80" required placeholder="e.g. Gilgit, Hunza, Islamabad"></div>
          <div class="mma-field full"><label for="mma-address">Complete delivery address <span>*</span></label><textarea id="mma-address" name="address" autocomplete="street-address" maxlength="500" required placeholder="House number, street, area, village or delivery location"></textarea></div>
          <div class="mma-field full"><label for="mma-landmark">Nearest landmark (optional)</label><input id="mma-landmark" name="landmark" maxlength="120" placeholder="School, shop, masjid, etc."></div>
          <div class="mma-field full"><label for="mma-note">Order / delivery note (optional)</label><textarea id="mma-note" name="note" maxlength="300" placeholder="Any special instructions"></textarea></div>
          <div class="mma-delivery" id="mma-delivery">Delivery charge: enter your city to see the delivery fee. Gilgit city: Rs. 150 · Other cities: Rs. 300. The final mix weight and price will be confirmed on WhatsApp.</div>
          <div class="mma-actions"><button class="mma-cancel" type="button" data-mma-close>Back to mix</button><button class="mma-submit" type="submit">Send request on WhatsApp ↗</button></div>
        </form>
      </section>`;
    document.body.appendChild(modal);

    const cityInput = modal.querySelector("#mma-city");
    cityInput.addEventListener("input", () => {
      const city = clean(cityInput.value);
      modal.querySelector("#mma-delivery").textContent = city
        ? `Delivery charge for ${city}: ${money(deliveryFee(city))}. The final mix weight and price will be confirmed on WhatsApp.`
        : "Enter your city to see the delivery fee. Gilgit city: Rs. 150 · Other cities: Rs. 300.";
    });

    modal.addEventListener("click", (event) => {
      if (event.target.closest("[data-mma-close]")) closeModal(modal);
    });
    modal.querySelector("#mma-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.reportValidity()) return;

      const name = clean(modal.querySelector("#mma-name").value);
      const phone = clean(modal.querySelector("#mma-phone").value);
      const city = clean(modal.querySelector("#mma-city").value);
      const address = clean(modal.querySelector("#mma-address").value);
      const landmark = clean(modal.querySelector("#mma-landmark").value) || "Not provided";
      const note = clean(modal.querySelector("#mma-note").value) || "Not provided";
      const ingredients = getSelectedIngredients();
      const budget = currentBudget();

      if (!ingredients.length || !budget) {
        window.alert("Please select at least one ingredient and enter a valid budget in Mountain Mix Lab.");
        closeModal(modal);
        return;
      }

      const fee = deliveryFee(city);
      const message = [
        "Assalam-o-Alaikum GB Dry Fruit! I would like to request/order a custom Mountain Mix.",
        "",
        `Selected ingredients: ${ingredients.join(", ")}`,
        `Target mix budget (delivery separate): ${money(budget)}`,
        `Delivery charge estimate (${city}): ${money(fee)}`,
        "Please confirm the exact available quantities/weights and final mix price before packing.",
        "",
        `Customer name: ${name}`,
        `Customer mobile: ${phone}`,
        `City / Town: ${city}`,
        `Full delivery address: ${address}`,
        `Nearest landmark: ${landmark}`,
        `Order / delivery note: ${note}`
      ].join("\n");

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      const newWindow = window.open(url, "_blank");
      if (newWindow) newWindow.opener = null;
      closeModal(modal);
      if (!newWindow) window.location.href = url;
    });

    return modal;
  }


  function closeModal(modal) {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function openModal() {
    const ingredients = getSelectedIngredients();
    const budget = currentBudget();
    if (!ingredients.length || !budget) {
      window.alert("Please select at least one ingredient and enter a valid budget first.");
      return;
    }
    const modal = ensureModal();
    modal.querySelector("#mma-summary").innerHTML = `<strong>Your mix:</strong> ${ingredients.map((name) => name.replace(/[&<>"']/g, "")).join(", ")}<br><strong>Target budget:</strong> ${money(budget)} (delivery separate)`;
    modal.querySelector("#mma-delivery").textContent = "Delivery charge: enter your city to see the delivery fee. Gilgit city: Rs. 150 · Other cities: Rs. 300.";
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    modal.querySelector("#mma-name").focus();
  }

  // Capture the Mountain Mix request button before its original WhatsApp handler.
  document.addEventListener("click", (event) => {
    const button = event.target.closest(BUTTON_SELECTOR);
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openModal();
  }, true);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const modal = document.getElementById(MODAL_ID);
      if (modal?.classList.contains("is-open")) closeModal(modal);
    }
  });
})();
