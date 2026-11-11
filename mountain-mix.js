/* GB Dry Fruit — Mountain Mix Lab (all catalogue products)
   Loads every product from products.json. Customers choose any combination
   and set a target budget. Equal budget shares are a preference only; the
   shop confirms available weights and final quote on WhatsApp. */
(() => {
  "use strict";

  const WHATSAPP_NUMBER = "923555850225";
  const BUDGET_MIN = 100;
  const BUDGET_MAX = 50000;
  const DEFAULT_BUDGET = 1000;
  const DEFAULT_SELECTED_IDS = [1, 3]; // Keep the original Badam + Pista starter mix.

  const money = (value) => `Rs. ${Math.round(Number(value) || 0).toLocaleString("en-PK")}`;
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  const styles = `
    .mountain-mix-section{width:min(1440px,calc(100% - 64px));margin:34px auto 42px;padding:clamp(20px,3vw,38px);border:1px solid #e8e5d9;border-radius:22px;background:linear-gradient(125deg,#f5f7ed 0%,#fffaf0 58%,#f1f5e9 100%);box-shadow:0 14px 38px rgba(34,48,34,.06)}
    .mountain-mix-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,.95fr);gap:clamp(22px,4vw,54px);align-items:start}
    .mountain-mix-copy .eyebrow{display:inline-flex;align-items:center;gap:8px;color:#16833b;font-size:10px;letter-spacing:.14em;font-weight:800;text-transform:uppercase}
    .mountain-mix-copy h2{margin:13px 0 12px;color:#24392a;font-family:'Playfair Display',Georgia,serif;font-size:clamp(29px,4vw,45px);line-height:1.12;letter-spacing:-.7px}
    .mountain-mix-copy h2 em{color:#16833b;font-style:normal}
    .mountain-mix-copy>p{max-width:530px;color:#6d786d;font-size:13px;line-height:1.8}
    .mountain-mix-perks{display:flex;flex-wrap:wrap;gap:9px;margin-top:20px}
    .mountain-mix-perks span{padding:8px 11px;border:1px solid #e2e8d7;border-radius:30px;background:rgba(255,255,255,.76);color:#476148;font-size:11px;font-weight:700}
    .mountain-mix-card{padding:clamp(16px,2.5vw,25px);border:1px solid #e7e2d2;border-radius:18px;background:#fff;box-shadow:0 16px 35px rgba(55,65,43,.09)}
    .mountain-mix-card-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}
    .mountain-mix-card-head h3{margin:0;color:#24392a;font-size:17px}
    .mountain-mix-card-head>span{padding:6px 9px;border-radius:20px;background:#edf6eb;color:#16833b;font-size:10px;font-weight:800;white-space:nowrap}
    .mountain-mix-selection-bar{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:0 0 12px;color:#687468;font-size:10px}
    .mountain-mix-selection-tools{display:flex;gap:7px;flex-wrap:wrap}
    .mountain-mix-selection-tools button{padding:6px 9px;border:1px solid #dfe8dc;border-radius:20px;background:#f8fbf5;color:#27653a;font-size:10px;font-weight:800;cursor:pointer}
    .mountain-mix-selection-tools button:hover{background:#edf6eb}
    .mountain-mix-ingredients{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;max-height:430px;overflow:auto;padding:2px 4px 2px 1px;scrollbar-width:thin}
    .mountain-mix-ingredient{position:relative;display:flex;align-items:center;gap:9px;min-width:0;min-height:72px;padding:9px;border:1px solid #e8e8df;border-radius:12px;background:#fff;cursor:pointer;transition:border-color .18s,background .18s,box-shadow .18s}
    .mountain-mix-ingredient:hover{border-color:#a9c9a8}
    .mountain-mix-ingredient.is-selected{border-color:#16833b;background:#f4faf1;box-shadow:0 0 0 2px rgba(22,131,59,.08)}
    .mountain-mix-ingredient input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
    .mountain-mix-ingredient img{width:43px;height:43px;object-fit:contain;flex:none;border-radius:9px;background:#f8f5ec}
    .mountain-mix-ingredient-emoji{display:grid;place-items:center;width:43px;height:43px;flex:none;border-radius:9px;background:#f8f5ec;font-size:23px}
    .mountain-mix-ingredient-copy{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1}
    .mountain-mix-ingredient-copy strong{font-size:11px;color:#253a2a;line-height:1.3;overflow-wrap:anywhere}
    .mountain-mix-ingredient-copy small{font-size:9px;line-height:1.35;color:#81897d}
    .mountain-mix-check{margin-left:auto;color:#16833b;font-size:17px;opacity:0;flex:none}
    .mountain-mix-ingredient.is-selected .mountain-mix-check{opacity:1}
    .mountain-mix-budget-row{display:flex;justify-content:space-between;align-items:end;gap:12px;margin:18px 0 12px}
    .mountain-mix-budget-row label{display:block;color:#596659;font-size:11px;font-weight:700}
    .mountain-mix-budget-input{display:flex;align-items:center;gap:7px;margin-top:6px;padding:9px 11px;border:1px solid #dfe5d8;border-radius:9px;background:#fbfcf8}
    .mountain-mix-budget-input span{color:#16833b;font-weight:800}
    .mountain-mix-budget-input input{width:116px;min-width:0;border:0;outline:0;background:transparent;color:#203b26;font-size:19px;font-weight:800}
    .mountain-mix-budget-hint{max-width:145px;text-align:right;color:#8a9186;font-size:10px;line-height:1.45}
    .mountain-mix-split{padding:13px 14px;border-radius:12px;background:#f7f8f3;border:1px solid #edf0e8}
    .mountain-mix-split-head{display:flex;justify-content:space-between;gap:10px;margin-bottom:9px;color:#445445;font-size:11px;font-weight:800}
    .mountain-mix-allocation{display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:8px;margin-top:10px}
    .mountain-mix-allocation div{min-width:0;padding:9px;border:1px solid #e7ecdf;border-radius:10px;background:#fff}
    .mountain-mix-allocation small{display:block;color:#7e887d;font-size:9px;line-height:1.35;overflow-wrap:anywhere}
    .mountain-mix-allocation strong{display:block;margin-top:4px;color:#1c6d35;font-size:14px}
    .mountain-mix-warning{margin:12px 0 0;padding:10px 11px;border-left:3px solid #d6a34a;border-radius:7px;background:#fffaf0;color:#786743;font-size:10px;line-height:1.55}
    .mountain-mix-preview{margin-top:14px;padding-top:13px;border-top:1px solid #edf0e8;color:#526052;font-size:11px;line-height:1.6}
    .mountain-mix-preview strong{color:#24392a}
    .mountain-mix-actions{display:flex;flex-direction:column;gap:9px;margin-top:15px}
    .mountain-mix-submit{width:100%;min-height:47px;border:0;border-radius:9px;background:#16833b;color:#fff;font-size:12px;font-weight:800;cursor:pointer;box-shadow:0 8px 17px rgba(22,131,59,.16);transition:background .18s,transform .18s}
    .mountain-mix-submit:hover:not(:disabled){background:#0d5f2c;transform:translateY(-1px)}
    .mountain-mix-submit:disabled{opacity:.45;cursor:not-allowed}
    .mountain-mix-browse{align-self:center;color:#16833b;font-size:11px;font-weight:800;text-decoration:none}
    .mountain-mix-browse:hover{text-decoration:underline}
    @media(max-width:900px){.mountain-mix-layout{grid-template-columns:1fr}.mountain-mix-copy>p{max-width:720px}}
    @media(max-width:600px){.mountain-mix-section{width:calc(100% - 28px);margin:25px auto 32px;padding:16px;border-radius:16px}.mountain-mix-layout{gap:18px}.mountain-mix-copy h2{font-size:31px}.mountain-mix-copy>p{font-size:12px}.mountain-mix-card{padding:13px}.mountain-mix-ingredients{grid-template-columns:repeat(2,minmax(0,1fr));max-height:390px}.mountain-mix-ingredient{gap:7px;padding:8px}.mountain-mix-ingredient img,.mountain-mix-ingredient-emoji{width:36px;height:36px}.mountain-mix-ingredient-copy strong{font-size:10px}.mountain-mix-ingredient-copy small{font-size:8px}}
    @media(max-width:380px){.mountain-mix-ingredients{grid-template-columns:1fr}.mountain-mix-budget-input input{width:92px}.mountain-mix-budget-hint{max-width:115px}}
  `;

  function init() {
    if (document.getElementById("mountain-mix-lab")) return;
    const trustStrip = document.querySelector(".trust-strip");
    if (!trustStrip) return;

    const style = document.createElement("style");
    style.id = "mountain-mix-lab-styles";
    style.textContent = styles;
    document.head.appendChild(style);

    const section = document.createElement("section");
    section.id = "mountain-mix-lab";
    section.className = "mountain-mix-section";
    section.setAttribute("aria-labelledby", "mountain-mix-title");
    section.innerHTML = `
      <div class="mountain-mix-layout">
        <div class="mountain-mix-copy">
          <span class="eyebrow">✦ ONLY AT GB DRY FRUIT</span>
          <h2 id="mountain-mix-title">Build your own <em>Mountain Mix.</em></h2>
          <p>Choose any favourites from our full catalogue, set your budget and create a mix that feels like yours. We will confirm the exact mix weight and final quote with you on WhatsApp before packing.</p>
          <div class="mountain-mix-perks"><span>✦ Full product catalogue</span><span>₨ Your budget</span><span>♡ Made for you</span></div>
        </div>
        <div class="mountain-mix-card">
          <div class="mountain-mix-card-head"><h3>Create your custom blend</h3><span>YOUR MIX LAB</span></div>
          <div class="mountain-mix-selection-bar">
            <span id="mountain-mix-count">Choose any ingredients</span>
            <div class="mountain-mix-selection-tools">
              <button id="mountain-mix-select-all" type="button">Select all</button>
              <button id="mountain-mix-clear" type="button">Clear</button>
            </div>
          </div>
          <div class="mountain-mix-ingredients" id="mountain-mix-ingredients" aria-label="Choose from all products">
            <p style="grid-column:1/-1;color:#788078;font-size:12px">Loading the full product catalogue…</p>
          </div>
          <div class="mountain-mix-budget-row">
            <label for="mountain-mix-budget">Your mix budget
              <span class="mountain-mix-budget-input"><span>Rs.</span><input id="mountain-mix-budget" type="number" min="${BUDGET_MIN}" max="${BUDGET_MAX}" step="50" value="${DEFAULT_BUDGET}" inputmode="numeric" /></span>
            </label>
            <span class="mountain-mix-budget-hint">Product mix budget<br/>Delivery is separate</span>
          </div>
          <div class="mountain-mix-split">
            <div class="mountain-mix-split-head"><span>Preferred budget allocation</span><span id="mountain-mix-allocation-label">Split evenly</span></div>
            <div class="mountain-mix-allocation" id="mountain-mix-allocation" aria-live="polite">
              <div><small>Badam</small><strong>Rs. 500</strong></div>
              <div><small>Pista</small><strong>Rs. 500</strong></div>
            </div>
          </div>
          <p class="mountain-mix-warning">Budget is divided evenly among your selected ingredients as a preference only. It is not a confirmed gram/weight quote. We will confirm available quantities and the final mix price on WhatsApp.</p>
          <div class="mountain-mix-preview" id="mountain-mix-preview" aria-live="polite"><strong>Your mix:</strong> Badam + Pista · <strong>Budget:</strong> Rs. 1,000</div>
          <div class="mountain-mix-actions">
            <button class="mountain-mix-submit" id="mountain-mix-whatsapp" type="button" disabled>Request my Mountain Mix on WhatsApp ↗</button>
            <a class="mountain-mix-browse" href="#shop">Or browse all ready-made products →</a>
          </div>
        </div>
      </div>`;
    trustStrip.insertAdjacentElement("afterend", section);

    const ingredientsRoot = section.querySelector("#mountain-mix-ingredients");
    const budgetInput = section.querySelector("#mountain-mix-budget");
    const whatsappButton = section.querySelector("#mountain-mix-whatsapp");
    const preview = section.querySelector("#mountain-mix-preview");
    const allocationRoot = section.querySelector("#mountain-mix-allocation");
    const allocationLabel = section.querySelector("#mountain-mix-allocation-label");
    const countLabel = section.querySelector("#mountain-mix-count");
    const selectAllButton = section.querySelector("#mountain-mix-select-all");
    const clearButton = section.querySelector("#mountain-mix-clear");

    let ingredientProducts = [];
    let catalogueError = false;

    function selectedProducts() {
      return [...ingredientsRoot.querySelectorAll("input[data-mix-id]:checked")]
        .map((input) => ingredientProducts.find((product) => Number(product.id) === Number(input.dataset.mixId)))
        .filter(Boolean);
    }

    function getBudget() {
      const raw = Number(budgetInput.value);
      if (!Number.isFinite(raw) || raw < BUDGET_MIN || raw > BUDGET_MAX) return null;
      return Math.round(raw);
    }

    function allocation() {
      const selected = selectedProducts();
      const budget = getBudget();
      if (!budget || selected.length === 0) return { selected, budget, shares: [] };
      const baseShare = Math.floor(budget / selected.length);
      const remainder = budget - baseShare * selected.length;
      const shares = selected.map((product, index) => ({
        product,
        amount: baseShare + (index < remainder ? 1 : 0)
      }));
      return { selected, budget, shares };
    }

    function updateIngredientCards() {
      ingredientsRoot.querySelectorAll(".mountain-mix-ingredient").forEach((card) => {
        const input = card.querySelector("input[data-mix-id]");
        card.classList.toggle("is-selected", Boolean(input && input.checked));
      });
    }

    function updateBuilder() {
      const data = allocation();
      countLabel.textContent = `${data.selected.length} of ${ingredientProducts.length} ingredients selected`;
      allocationLabel.textContent = data.selected.length > 1 ? `Split across ${data.selected.length} items` : data.selected.length === 1 ? "All for one item" : "Select ingredients";

      if (!data.selected.length) {
        allocationRoot.innerHTML = "<div style='grid-column:1/-1'><small>No ingredients selected yet</small><strong>Choose at least one product</strong></div>";
        preview.innerHTML = "<strong>Your mix:</strong> Select one or more ingredients to continue.";
      } else if (!data.budget) {
        allocationRoot.innerHTML = "<div style='grid-column:1/-1'><small>Budget required</small><strong>Enter Rs. 100 to Rs. 50,000</strong></div>";
        preview.innerHTML = `<strong>Your mix:</strong> ${data.selected.map((product) => escapeHtml(product.name)).join(" + ")} · <strong>Enter a budget from ${money(BUDGET_MIN)} to ${money(BUDGET_MAX)}.</strong>`;
      } else {
        allocationRoot.innerHTML = data.shares.map((share) => `
          <div><small>${escapeHtml(share.product.name)}</small><strong>${money(share.amount)}</strong></div>
        `).join("");
        preview.innerHTML = `<strong>Your mix (${data.selected.length} ingredients):</strong> ${data.selected.map((product) => escapeHtml(product.name)).join(" + ")} · <strong>Budget:</strong> ${money(data.budget)}`;
      }
      whatsappButton.disabled = catalogueError || !data.selected.length || !data.budget;
    }

    function renderIngredientCards() {
      const initiallySelected = new Set(DEFAULT_SELECTED_IDS);
      if (!ingredientProducts.some((product) => initiallySelected.has(Number(product.id)))) {
        ingredientProducts.slice(0, 2).forEach((product) => initiallySelected.add(Number(product.id)));
      }

      ingredientsRoot.innerHTML = ingredientProducts.map((product) => {
        const selected = initiallySelected.has(Number(product.id));
        const image = product.image
          ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" />`
          : `<span class="mountain-mix-ingredient-emoji" aria-hidden="true">${escapeHtml(product.emoji || "🥜")}</span>`;
        const detail = [product.category, product.weight || "Pack size to confirm", product.price == null ? "Price on request" : money(product.price)].filter(Boolean).join(" · ");
        return `<label class="mountain-mix-ingredient${selected ? " is-selected" : ""}">
          <input type="checkbox" data-mix-id="${Number(product.id)}" ${selected ? "checked" : ""} />
          ${image}
          <span class="mountain-mix-ingredient-copy"><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(detail)}</small></span>
          <span class="mountain-mix-check" aria-hidden="true">✓</span>
        </label>`;
      }).join("");
      updateBuilder();
    }

    function requestMix() {
      const data = allocation();
      if (!data.selected.length || !data.budget) return;
      const shareLines = data.shares.map((share) => {
        const listedPrice = share.product.price == null ? "Price on request" : money(share.product.price);
        const pack = share.product.weight || "Pack size to confirm";
        return `• ${share.product.name}: preferred budget share ${money(share.amount)} | listed price: ${listedPrice} | pack: ${pack}`;
      }).join("\n");
      const message = [
        "Assalam-o-Alaikum GB Dry Fruit! I would like to request a custom Mountain Mix.",
        "",
        `Target mix budget (delivery separate): ${money(data.budget)}`,
        `Selected ingredients (${data.selected.length}):`,
        shareLines,
        "",
        "The budget shares are my preference only. Please suggest the exact available grams/weights and confirm the final mix price before packing.",
        "Thank you!"
      ].join("\n");
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      const win = window.open(url, "_blank", "noopener,noreferrer");
      if (!win) window.location.href = url;
    }

    fetch("./products.json", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`Catalogue request failed (${response.status})`);
        return response.json();
      })
      .then((catalogue) => {
        if (!Array.isArray(catalogue)) throw new Error("Product catalogue has an unexpected format");
        ingredientProducts = catalogue
          .filter((product) => product && Number.isFinite(Number(product.id)) && product.name)
          .sort((a, b) => Number(a.featured ?? a.id) - Number(b.featured ?? b.id));
        if (!ingredientProducts.length) throw new Error("No products were found in products.json");
        renderIngredientCards();
      })
      .catch((error) => {
        console.error("Mountain Mix Lab could not load catalogue:", error);
        catalogueError = true;
        ingredientsRoot.innerHTML = "<p style='grid-column:1/-1;color:#9b4c35;font-size:12px'>We could not load the product catalogue right now. Please refresh the page or browse the shop.</p>";
        updateBuilder();
      });

    ingredientsRoot.addEventListener("change", (event) => {
      if (event.target && event.target.matches("input[data-mix-id]")) {
        updateIngredientCards();
        updateBuilder();
      }
    });

    selectAllButton.addEventListener("click", () => {
      ingredientsRoot.querySelectorAll("input[data-mix-id]").forEach((input) => { input.checked = true; });
      updateIngredientCards();
      updateBuilder();
    });

    clearButton.addEventListener("click", () => {
      ingredientsRoot.querySelectorAll("input[data-mix-id]").forEach((input) => { input.checked = false; });
      updateIngredientCards();
      updateBuilder();
    });

    budgetInput.addEventListener("input", updateBuilder);
    whatsappButton.addEventListener("click", requestMix);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
