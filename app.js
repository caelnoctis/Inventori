(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const fmt = (n) => String(n).replace(".", ",");
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
  };

  /* ================= DATA ================= */
  const EPPS = [
    ["Achievement", "ach", "Ingin berprestasi, menyelesaikan tugas sulit"],
    ["Deference", "def", "Mengikuti arahan dan menghormati otoritas"],
    ["Order", "ord", "Rapi, terencana, dan sistematis"],
    ["Exhibition", "exh", "Ingin menjadi pusat perhatian"],
    ["Autonomy", "aut", "Bebas menentukan sikap dan tindakan sendiri"],
    ["Affiliation", "aff", "Setia pada teman dan senang bersama orang lain"],
    ["Intraception", "int", "Menganalisis motif dan perasaan diri serta orang lain"],
    ["Succorance", "suc", "Ingin dibantu dan diperhatikan"],
    ["Dominance", "dom", "Ingin memimpin dan memengaruhi orang lain"],
    ["Abasement", "aba", "Mudah merasa bersalah dan menerima kesalahan"],
    ["Nurturance", "nur", "Senang menolong dan merawat orang lain"],
    ["Change", "chg", "Menyukai hal baru dan variasi"],
    ["Endurance", "end", "Tekun dan bertahan sampai tugas tuntas"],
    ["Heterosexuality", "het", "Tertarik menjalin hubungan dengan lawan jenis"],
    ["Aggression", "agg", "Menyerang pendapat, mengkritik secara terbuka"],
  ];

  const PAPI = [
    { group: "Arah kerja", color: "#c8f169", items: [
      ["N", "Need to finish a task", "kebutuhan menyelesaikan tugas", "Need"],
      ["G", "Role of hard intense worker", "peran pekerja keras", "Role"],
      ["A", "Need to achieve", "kebutuhan berprestasi", "Need"]] },
    { group: "Kepemimpinan", color: "#8fb2ff", items: [
      ["L", "Leadership role", "peran pemimpin", "Role"],
      ["P", "Need to control others", "kebutuhan mengatur orang lain", "Need"],
      ["I", "Ease in decision making", "kemudahan mengambil keputusan", "Role"]] },
    { group: "Aktivitas", color: "#f2c443", items: [
      ["T", "Pace", "tempo kerja", "Role"],
      ["V", "Vigorous type", "semangat dan aktivitas fisik", "Role"]] },
    { group: "Pergaulan", color: "#ffb3a7", items: [
      ["X", "Need to be noticed", "kebutuhan diperhatikan", "Need"],
      ["S", "Social extension", "keluasan pergaulan", "Role"],
      ["B", "Need to belong to groups", "kebutuhan diterima kelompok", "Need"],
      ["O", "Need for closeness and affection", "kebutuhan kedekatan", "Need"]] },
    { group: "Gaya kerja", color: "#9be3c4", items: [
      ["R", "Theoretical type", "berpikir teoretis", "Role"],
      ["D", "Interest in working with details", "minat pada detail", "Role"],
      ["C", "Organized type", "keteraturan", "Role"]] },
    { group: "Sifat", color: "#d4b8ff", items: [
      ["Z", "Need for change", "kebutuhan akan perubahan", "Need"],
      ["E", "Emotional restraint", "pengendalian emosi", "Role"],
      ["K", "Need to be forceful", "kebutuhan agresif atau tegas", "Need"]] },
    { group: "Ketaatan", color: "#9fe0ee", items: [
      ["F", "Need to support authority", "kebutuhan mendukung atasan", "Need"],
      ["W", "Need for rules and supervision", "kebutuhan aturan dan arahan", "Need"]] },
  ];
  const PAPI_FLAT = [];
  PAPI.forEach((g) => g.items.forEach((it) => PAPI_FLAT.push({ code: it[0], color: g.color, group: g.group })));
  const PAPI_LEADER = { N: 5, G: 6, A: 6, L: 7, P: 6, I: 7, T: 5, V: 3, X: 4, S: 5, B: 3, O: 3, R: 4, D: 3, C: 5, Z: 4, E: 5, K: 4, F: 2, W: 3 };
  const PAPI_EXEC = { N: 6, G: 6, A: 4, L: 2, P: 2, I: 3, T: 4, V: 4, X: 3, S: 4, B: 5, O: 5, R: 3, D: 6, C: 6, Z: 2, E: 5, K: 2, F: 7, W: 7 };

  const RMIB = ["Out", "Me", "Comp", "Sci", "Pers", "Aesth", "Lit", "Mus", "S.S", "Cler", "Prac", "Med"];
  const RMIB_NAMES = ["Outdoor", "Mechanical", "Computational", "Scientific", "Personal Contact", "Aesthetic", "Literary", "Musical", "Social Service", "Clerical", "Practical", "Medical"];
  const RMIB_EX = [20, 85, 70, 35, 48, 62, 40, 95, 30, 58, 80, 79];

  const RIASEC = ["R", "I", "A", "S", "E", "C"];
  const RIASEC_NAMES = { R: "Realistic", I: "Investigative", A: "Artistic", S: "Social", E: "Enterprising", C: "Conventional" };
  const HEX_EX = { R: 18, I: 35, A: 22, S: 30, E: 15, C: 20 };

  /* ================= SVG: PAPI WHEEL ================= */
  function annulus(cx, cy, r1, r2, a0, a1) {
    const rad = (a) => (a * Math.PI) / 180;
    const p = (r, a) => [cx + r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))];
    const [x1, y1] = p(r2, a0), [x2, y2] = p(r2, a1), [x3, y3] = p(r1, a1), [x4, y4] = p(r1, a0);
    const lg = a1 - a0 > 180 ? 1 : 0;
    return `M${x1} ${y1} A${r2} ${r2} 0 ${lg} 1 ${x2} ${y2} L${x3} ${y3} A${r1} ${r1} 0 ${lg} 0 ${x4} ${y4} Z`;
  }
  function drawWheel(svg, scores, compact) {
    if (!svg) return;
    svg.innerHTML = "";
    const cx = 180, cy = 180, r0 = 20, R = 146;
    const rs = (s) => r0 + (Math.max(0, Math.min(9, s)) / 9) * (R - r0);
    // category bands
    el("circle", { cx, cy, r: rs(9), fill: "#eefbd6", stroke: "#1c1c1c", "stroke-width": 1.5 }, svg);
    el("circle", { cx, cy, r: rs(5.5), fill: "#ffffff" }, svg);
    el("circle", { cx, cy, r: rs(3.5), fill: "#ffe8e2" }, svg);
    for (let s = 1; s <= 8; s++) el("circle", { cx, cy, r: rs(s), fill: "none", stroke: "#b8c0bb", "stroke-width": .7, "stroke-dasharray": s === 3 || s === 5 ? "0" : "2 3" }, svg);
    const n = PAPI_FLAT.length, step = 360 / n;
    // group ring + sector lines + labels
    PAPI_FLAT.forEach((it, i) => {
      const a0 = -90 + i * step - step / 2, a1 = a0 + step;
      el("path", { d: annulus(cx, cy, R + 1, R + 10, a0, a1), fill: it.color, stroke: "#1c1c1c", "stroke-width": 1 }, svg);
      const rad = (a0 * Math.PI) / 180;
      const isGroupStart = i === 0 || PAPI_FLAT[i - 1].group !== it.group;
      el("line", { x1: cx + r0 * Math.cos(rad), y1: cy + r0 * Math.sin(rad), x2: cx + (R + 10) * Math.cos(rad), y2: cy + (R + 10) * Math.sin(rad), stroke: "#1c1c1c", "stroke-width": isGroupStart ? 1.4 : .5, opacity: isGroupStart ? 1 : .45 }, svg);
      const am = ((a0 + step / 2) * Math.PI) / 180;
      const t = el("text", { x: cx + (R + 22) * Math.cos(am), y: cy + (R + 22) * Math.sin(am) + 4, "text-anchor": "middle", "font-size": 12, fill: "#141414" }, svg);
      t.textContent = it.code;
    });
    // profile polygon
    const pts = PAPI_FLAT.map((it, i) => {
      const am = ((-90 + i * step) * Math.PI) / 180;
      const r = rs(scores[it.code] || 0);
      return [cx + r * Math.cos(am), cy + r * Math.sin(am)];
    });
    el("polygon", { points: pts.map((p) => p.join(",")).join(" "), fill: "rgba(31,34,201,.18)", stroke: "#1f22c9", "stroke-width": 2, "stroke-linejoin": "round" }, svg);
    pts.forEach((p) => el("rect", { x: p[0] - 3.5, y: p[1] - 3.5, width: 7, height: 7, fill: "#1f22c9", stroke: "#fff", "stroke-width": 1 }, svg));
    el("circle", { cx, cy, r: r0, fill: "#fff", stroke: "#1c1c1c", "stroke-width": 1.5 }, svg);
    const c = el("text", { x: cx, y: cy + 4, "text-anchor": "middle", "font-size": 10, fill: "#1f22c9" }, svg);
    c.textContent = "PAPI";
    if (!compact) {
      [3, 5, 9].forEach((s) => {
        const tt = el("text", { x: cx + 3, y: cy - rs(s) + 10, "font-size": 8, fill: "#5b605c" }, svg);
        tt.textContent = s;
      });
    }
  }

  /* ================= SVG: RIASEC HEXAGON ================= */
  function drawHex(svg, scores, top3) {
    if (!svg) return;
    svg.innerHTML = "";
    const cx = 110, cy = 106, R = 74;
    const ang = (i) => ((-90 + i * 60) * Math.PI) / 180;
    const pt = (i, r) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))];
    [0.25, 0.5, 0.75, 1].forEach((f) => {
      el("polygon", { points: RIASEC.map((_, i) => pt(i, R * f).join(",")).join(" "), fill: f === 1 ? "#ffffff" : "none", stroke: f === 1 ? "#1c1c1c" : "#b8c0bb", "stroke-width": f === 1 ? 1.5 : .7 }, svg);
    });
    RIASEC.forEach((_, i) => { const p = pt(i, R); el("line", { x1: cx, y1: cy, x2: p[0], y2: p[1], stroke: "#b8c0bb", "stroke-width": .7 }, svg); });
    const poly = RIASEC.map((k, i) => pt(i, (R * Math.max(0, Math.min(50, scores[k] || 0))) / 50));
    el("polygon", { points: poly.map((p) => p.join(",")).join(" "), fill: "rgba(200,241,105,.7)", stroke: "#1f22c9", "stroke-width": 2, "stroke-linejoin": "round" }, svg);
    poly.forEach((p) => el("rect", { x: p[0] - 3, y: p[1] - 3, width: 6, height: 6, fill: "#1f22c9" }, svg));
    RIASEC.forEach((k, i) => {
      const p = pt(i, R + 17);
      const rank = top3 ? top3.indexOf(k) : -1;
      if (rank >= 0) el("rect", { x: p[0] - 11, y: p[1] - 12, width: 22, height: 18, fill: "#c8f169", stroke: "#1c1c1c", "stroke-width": 1.2 }, svg);
      const t = el("text", { x: p[0], y: p[1] + 2, "text-anchor": "middle", "font-size": 14, "font-weight": 600, fill: "#141414" }, svg);
      t.textContent = k;
      const s = el("text", { x: p[0], y: p[1] + (i === 0 ? -14 : 16), "text-anchor": "middle", "font-size": 9, fill: "#3b3f3c" }, svg);
      if (i === 3) s.setAttribute("y", p[1] + 17);
      s.textContent = scores[k] != null && scores[k] !== "" ? scores[k] : "";
    });
  }

  /* ================= HERO ================= */
  drawWheel($("#heroWheel"), PAPI_LEADER, true);
  drawHex($("#heroHex"), HEX_EX, ["I", "S", "A"]);
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const heroProg = $("#heroProg"), loadPct = $("#loadPct");
  if (heroProg) {
    requestAnimationFrame(() => setTimeout(() => { heroProg.style.width = "100%"; }, 150));
    if (reduce) { loadPct.textContent = "100%"; }
    else {
      let p = 0;
      const t = setInterval(() => { p = Math.min(100, p + 4); loadPct.textContent = p + "%"; if (p >= 100) clearInterval(t); }, 64);
    }
  }

  /* ================= SECTION WINDOW CONTROLS ================= */
  $$(".chapter .ctrl").forEach((b) => {
    b.addEventListener("click", () => {
      const sec = b.closest(".chapter");
      const act = b.dataset.act;
      if (act === "min") sec.classList.toggle("is-min");
      else if (act === "close") sec.classList.add("is-min");
      else { sec.classList.remove("is-min"); sec.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }
      const min = sec.classList.contains("is-min");
      $$('.ctrl[data-act="min"]', sec).forEach((x) => x.setAttribute("aria-expanded", String(!min)));
    });
  });
  // anchor into a minimized chapter restores it
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.getElementById(a.getAttribute("href").slice(1));
    if (target && target.classList.contains("is-min")) target.classList.remove("is-min");
  });

  /* ================= RMIB ================= */
  const rmibIn = $("#rmibInputs");
  if (rmibIn) {
    RMIB.forEach((c, i) => {
      const f = document.createElement("div");
      f.className = "field";
      f.innerHTML = `<label for="rm${i}">${c}</label><input id="rm${i}" type="number" inputmode="numeric" min="9" max="108" value="${RMIB_EX[i]}" aria-label="Skor total ${RMIB_NAMES[i]}">`;
      rmibIn.appendChild(f);
    });
    const calc = () => {
      const vals = RMIB.map((_, i) => { const v = $("#rm" + i).value; return v === "" ? null : Number(v); });
      const out = $("#rmibResult");
      if (vals.some((v) => v === null || isNaN(v))) { out.innerHTML = "Lengkapi 12 skor kategori untuk menghitung peringkat."; return; }
      const sum = vals.reduce((a, b) => a + b, 0);
      const outOfRange = vals.map((v, i) => (v < 9 || v > 108 ? RMIB[i] : null)).filter(Boolean);
      const idx = vals.map((v, i) => i).sort((a, b) => vals[a] - vals[b]);
      const rank = new Array(12);
      for (let i = 0; i < 12;) {
        let j = i; while (j + 1 < 12 && vals[idx[j + 1]] === vals[idx[i]]) j++;
        const avg = (i + 1 + j + 1) / 2;
        for (let k = i; k <= j; k++) rank[idx[k]] = avg;
        i = j + 1;
      }
      const order = vals.map((v, i) => i).sort((a, b) => rank[a] - rank[b] || a - b);
      const rows = order.map((i) => `<tr class="${rank[i] <= 3 ? "is-top" : rank[i] >= 10 ? "is-low" : ""}"><td class="rk num">${fmt(rank[i])}</td><td><span class="code">${RMIB[i]}</span> ${RMIB_NAMES[i]}</td><td class="num">${vals[i]}</td></tr>`).join("");
      const tops = order.filter((i) => rank[i] <= 3).map((i) => RMIB_NAMES[i]).join(", ");
      const lows = order.filter((i) => rank[i] >= 10).map((i) => RMIB_NAMES[i]).join(", ");
      out.innerHTML = `
        <div class="result-row" style="margin-bottom:10px">
          <span>Jumlah: <b>${sum}</b></span>
          ${sum === 702 ? '<span class="ok">✓ 702 — penyalinan benar</span>' : `<span class="err">✗ Harus 702 (selisih ${sum - 702 > 0 ? "+" : ""}${sum - 702}) — periksa penyalinan</span>`}
          ${outOfRange.length ? `<span class="err">Di luar rentang 9–108: ${outOfRange.join(", ")}</span>` : ""}
        </div>
        <div class="tbl-wrap"><table class="tbl compact rank-table"><thead><tr><th>Peringkat</th><th>Kategori</th><th>Skor</th></tr></thead><tbody>${rows}</tbody></table></div>
        <p style="margin:10px 0 0">Minat menonjol (peringkat 1–3): <b>${tops || "-"}</b>. Cenderung ditolak (10–12): <b>${lows || "-"}</b>.</p>`;
    };
    rmibIn.addEventListener("input", calc);
    $("#rmibExample").addEventListener("click", () => { RMIB_EX.forEach((v, i) => ($("#rm" + i).value = v)); calc(); });
    $("#rmibReset").addEventListener("click", () => { RMIB.forEach((_, i) => ($("#rm" + i).value = "")); calc(); });
    calc();
  }

  /* ================= EPPS ================= */
  const eppsBody = $("#eppsNeedsBody");
  if (eppsBody) {
    eppsBody.innerHTML = EPPS.map((n, i) => `<tr><td class="num">${i + 1}</td><th scope="row">${n[0]}</th><td><span class="code">${n[1]}</span></td><td>${n[2]}</td></tr>`).join("");
    const sel = $("#eppsSel");
    sel.innerHTML = EPPS.map((n, i) => `<option value="${i}">${i + 1}. ${n[0]} (${n[1]})</option>`).join("");
    const mx = $("#eppsMatrix");
    const cells = [];
    mx.appendChild(Object.assign(document.createElement("div"), { className: "mh" }));
    const colHeads = EPPS.map((n) => { const d = document.createElement("div"); d.className = "mh"; d.textContent = n[1]; d.style.writingMode = "vertical-rl"; d.style.transform = "rotate(180deg)"; mx.appendChild(d); return d; });
    const rowHeads = [];
    EPPS.forEach((n, r) => {
      const h = document.createElement("div"); h.className = "mh row"; h.textContent = n[1]; mx.appendChild(h); rowHeads.push(h);
      cells[r] = [];
      EPPS.forEach((_, c) => {
        const d = document.createElement("div");
        d.className = "mc" + (r === c ? " diag" : "");
        mx.appendChild(d); cells[r][c] = d;
      });
    });
    const update = () => {
      const k = Number(sel.value);
      cells.forEach((row, r) => row.forEach((d, c) => {
        d.classList.toggle("inrow", r === k && c !== k);
        d.classList.toggle("incol", c === k && r !== k);
        d.textContent = r === k && c !== k ? "A" : c === k && r !== k ? "B" : "";
      }));
      rowHeads.forEach((h, i) => h.classList.toggle("sel", i === k));
      colHeads.forEach((h, i) => h.classList.toggle("sel", i === k));
      $("#eppsCap").textContent = `${EPPS[k][0].toUpperCase()}: 14 SEL BARIS (A) + 14 SEL KOLOM (B) = MAKS 28`;
    };
    sel.addEventListener("change", update);
    update();
  }

  /* ================= PAPI ================= */
  const papiBody = $("#papiTableBody");
  if (papiBody) {
    papiBody.innerHTML = PAPI.map((g) =>
      `<tr class="group"><td colspan="3">${g.group.toUpperCase()}</td></tr>` +
      g.items.map((it) => `<tr><td><span class="code">${it[0]}</span></td><td>${it[1]} <span style="color:var(--ink-3)">(${it[2]})</span></td><td><span class="tag ${it[3] === "Need" ? "need" : "role"}">${it[3]}</span></td></tr>`).join("")
    ).join("");
    const box = $("#papiInputs");
    PAPI.forEach((g) => {
      const fs = document.createElement("fieldset");
      fs.className = "papi-group";
      fs.innerHTML = `<legend>${g.group.toUpperCase()}</legend><div class="row">${g.items.map((it) =>
        `<div class="field"><label for="pp${it[0]}">${it[0]}</label><input id="pp${it[0]}" type="number" min="0" max="9" inputmode="numeric" value="${PAPI_LEADER[it[0]]}" aria-label="${it[1]}"></div>`).join("")}</div>`;
      box.appendChild(fs);
    });
    const cat = (v) => (v <= 3 ? "rendah" : v <= 5 ? "sedang" : "tinggi");
    const calc = () => {
      const sc = {};
      PAPI_FLAT.forEach((it) => { const v = $("#pp" + it.code).value; sc[it.code] = v === "" ? 0 : Math.max(0, Math.min(9, Number(v) || 0)); });
      drawWheel($("#papiWheel"), sc, false);
      const sum = Object.values(sc).reduce((a, b) => a + b, 0);
      const hi = PAPI_FLAT.filter((it) => sc[it.code] >= 6).map((it) => it.code);
      let pattern = "";
      if (sc.L >= 6 && sc.P >= 6 && sc.I >= 6) pattern = "Pola L, P, I tinggi: mau memimpin, ingin mengarahkan orang lain, dan cepat memutuskan.";
      else if (sc.L <= 3 && sc.W >= 6 && sc.F >= 6) pattern = "Pola L rendah dengan W dan F tinggi: lebih nyaman sebagai pelaksana dengan arahan jelas.";
      $("#papiResult").innerHTML = `
        <div class="result-row"><span>Total: <b>${sum}</b></span>${sum === 90 ? '<span class="ok">✓ 90 — lengkap</span>' : `<span class="err">✗ Harus 90 (selisih ${sum - 90 > 0 ? "+" : ""}${sum - 90})</span>`}</div>
        <p style="margin:8px 0 0">Aspek tinggi (6–9): <b>${hi.join(", ") || "-"}</b></p>
        ${pattern ? `<p style="margin:6px 0 0" class="pill top">${pattern}</p>` : ""}
        <p style="margin:6px 0 0;font-size:13px;color:var(--ink-3)">Kategori: ${PAPI_FLAT.map((it) => `${it.code} ${cat(sc[it.code])}`).join(" · ")}</p>`;
    };
    box.addEventListener("input", calc);
    const fill = (obj) => { PAPI_FLAT.forEach((it) => ($("#pp" + it.code).value = obj[it.code])); calc(); };
    $("#papiExample").addEventListener("click", () => fill(PAPI_LEADER));
    $("#papiExample2").addEventListener("click", () => fill(PAPI_EXEC));
    calc();
  }

  /* ================= DISC ================= */
  const discBody = $("#discBody");
  if (discBody) {
    const DIM = ["D", "I", "S", "C", "*"];
    const EX = { M: [7, 5, 6, 4, 2], L: [3, 6, 5, 7, 3] };
    const row = (key, label) => `<tr><th scope="row">${label}</th>${DIM.map((d, i) => `<td><input class="inp" id="ds${key}${i}" type="number" min="0" max="24" inputmode="numeric" value="${EX[key][i]}" aria-label="${label} ${d}"></td>`).join("")}<td class="num" id="ds${key}T"></td></tr>`;
    discBody.innerHTML = row("M", "Most (M)") + row("L", "Least (L)") + `<tr><th scope="row">Change (M−L)</th>${DIM.map((d, i) => `<td class="num" id="dsC${i}">${i === 4 ? "—" : ""}</td>`).join("")}<td></td></tr>`;
    const bars = $("#discBars");
    bars.innerHTML = DIM.slice(0, 4).map((d, i) => `<div class="bar-row"><b>${d}</b><div class="bar-track center"><div class="bar-fill" id="dsB${i}"></div></div><span class="val" id="dsV${i}"></span></div>`).join("");
    const calc = () => {
      const get = (k) => DIM.map((_, i) => Number($(`#ds${k}${i}`).value) || 0);
      const M = get("M"), L = get("L");
      const tM = M.reduce((a, b) => a + b, 0), tL = L.reduce((a, b) => a + b, 0);
      $("#dsMT").textContent = tM; $("#dsLT").textContent = tL;
      const ch = M.slice(0, 4).map((m, i) => m - L[i]);
      ch.forEach((c, i) => {
        $("#dsC" + i).innerHTML = `<b>${c > 0 ? "+" : ""}${c}</b>`;
        const w = Math.min(50, (Math.abs(c) / 12) * 50);
        const b = $("#dsB" + i);
        b.classList.toggle("neg", c < 0);
        b.style.left = c >= 0 ? "50%" : 50 - w + "%";
        b.style.width = w + "%";
        $("#dsV" + i).textContent = (c > 0 ? "+" : "") + c;
      });
      const order = [0, 1, 2, 3].sort((a, b) => ch[b] - ch[a]);
      const ok = tM === 24 && tL === 24;
      $("#discResult").innerHTML = `
        <div class="result-row">
          <span>M: <b>${tM}</b> ${tM === 24 ? '<span class="ok">✓</span>' : '<span class="err">✗ harus 24</span>'}</span>
          <span>L: <b>${tL}</b> ${tL === 24 ? '<span class="ok">✓</span>' : '<span class="err">✗ harus 24</span>'}</span>
        </div>
        ${ok ? `<p style="margin:8px 0 0">Grafik III: gaya utama <span class="pill top">${DIM[order[0]]}</span> gaya pendukung <span class="pill">${DIM[order[1]]}</span></p>` : '<p style="margin:8px 0 0">Perbaiki total M dan L terlebih dahulu.</p>'}`;
    };
    discBody.addEventListener("input", calc);
    $("#discExample").addEventListener("click", () => { ["M", "L"].forEach((k) => EX[k].forEach((v, i) => ($(`#ds${k}${i}`).value = v))); calc(); });
    calc();
  }

  /* ================= RIASEC ================= */
  const hexIn = $("#hexInputs");
  if (hexIn) {
    RIASEC.forEach((k) => {
      const f = document.createElement("div");
      f.className = "field";
      f.innerHTML = `<label for="hx${k}">${k}</label><input id="hx${k}" type="number" min="2" max="50" inputmode="numeric" value="${HEX_EX[k]}" aria-label="Skor total ${RIASEC_NAMES[k]}">`;
      hexIn.appendChild(f);
    });
    const calc = () => {
      const sc = {};
      RIASEC.forEach((k) => { const v = $("#hx" + k).value; sc[k] = v === "" ? 0 : Number(v) || 0; });
      const order = RIASEC.slice().sort((a, b) => sc[b] - sc[a] || RIASEC.indexOf(a) - RIASEC.indexOf(b));
      const code = order.slice(0, 3);
      drawHex($("#hexSvg"), sc, code);
      const d = Math.abs(RIASEC.indexOf(code[0]) - RIASEC.indexOf(code[1]));
      const dist = Math.min(d, 6 - d);
      const kons = dist === 1 ? "tinggi (bersebelahan)" : dist === 2 ? "sedang (terpisah satu tipe)" : "rendah (berseberangan)";
      const vals = RIASEC.map((k) => sc[k]);
      const diff = Math.max(...vals) - Math.min(...vals);
      const ties = sc[order[2]] === sc[order[3]];
      $("#hexResult").innerHTML = `
        <div class="result-row" style="align-items:center"><span class="big-code" style="font-size:40px">${code.join("")}</span>
        <span style="flex:1;min-width:180px">Konsistensi ${code[0]}–${code[1]}: <b>${kons}</b><br>Diferensiasi: ${Math.max(...vals)} − ${Math.min(...vals)} = <b>${diff}</b></span></div>
        ${ties ? '<p style="margin:8px 0 0" class="err">Ada skor kembar pada urutan ketiga. Periksa kembali sebelum menetapkan kode.</p>' : ""}`;
    };
    hexIn.addEventListener("input", calc);
    calc();
  }

  /* ================= MBTI ================= */
  const pick = $("#mbtiPickers");
  if (pick) {
    const DIMS = [["E", "I", "ENERGI"], ["S", "N", "INFORMASI"], ["T", "F", "KEPUTUSAN"], ["J", "P", "ORIENTASI"]];
    const NAMES = { S: "Sensing", N: "Intuition", T: "Thinking", F: "Feeling" };
    const state = ["I", "N", "T", "J"];
    DIMS.forEach((d, i) => {
      const g = document.createElement("div");
      g.className = "seg"; g.setAttribute("role", "group"); g.setAttribute("aria-label", d[2]);
      g.innerHTML = `<button type="button" class="bevel-btn" data-i="${i}" data-v="${d[0]}">${d[0]}</button><button type="button" class="bevel-btn" data-i="${i}" data-v="${d[1]}">${d[1]}</button><small>${d[2]}</small>`;
      pick.appendChild(g);
    });
    const render = () => {
      $$("button", pick).forEach((b) => b.setAttribute("aria-pressed", String(state[b.dataset.i] === b.dataset.v)));
      const [ei, sn, tf, jp] = state;
      const ext = jp === "J" ? tf : sn;      // function used in the outer world
      const intr = jp === "J" ? sn : tf;     // the other function, introverted
      const dom = ei === "E" ? ext + "e" : intr + "i";
      const aux = ei === "E" ? intr + "i" : ext + "e";
      $("#mbtiType").textContent = state.join("");
      $("#mbtiDom").textContent = dom;
      $("#mbtiAux").textContent = aux;
      $("#mbtiDomTxt").textContent = `${NAMES[dom[0]]}, ${dom[1] === "e" ? "diekstraversikan" : "diintroversikan"}`;
      $("#mbtiAuxTxt").textContent = `${NAMES[aux[0]]}, ${aux[1] === "e" ? "diekstraversikan" : "diintroversikan"}`;
      $("#mbtiNote").innerHTML = `${jp} → fungsi ${jp === "J" ? "penilaian" : "persepsi"} <b>${ext}</b> dipakai di dunia luar (${ext}e). Tipe ${ei} → dominan adalah fungsi yang ${ei === "E" ? "diekstraversikan" : "diintroversikan"}.`;
    };
    pick.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; state[b.dataset.i] = b.dataset.v; render(); });
    render();
  }

  /* ================= EIS ================= */
  const eisGrid = $("#eisGrid");
  if (eisGrid) {
    const KEY = ["A", "B", "B", "A", "B", "B", "B", "A", "B", "B", "A", "A"];
    const ans = new Array(12).fill(null);
    KEY.forEach((k, i) => {
      const d = document.createElement("div");
      d.className = "eis-item";
      d.innerHTML = `<span class="no">NO. ${i + 1}</span><div class="ab" role="group" aria-label="Jawaban nomor ${i + 1}"><button type="button" class="bevel-btn" data-i="${i}" data-v="A" aria-pressed="false">A</button><button type="button" class="bevel-btn" data-i="${i}" data-v="B" aria-pressed="false">B</button></div><span class="eis-key">KUNCI ${k}</span>`;
      eisGrid.appendChild(d);
    });
    const render = () => {
      let score = 0, empty = 0;
      $$(".eis-item", eisGrid).forEach((d, i) => {
        $$("button", d).forEach((b) => b.setAttribute("aria-pressed", String(ans[i] === b.dataset.v)));
        const m = ans[i] === KEY[i];
        d.classList.toggle("match", m);
        if (m) score++;
        if (ans[i] === null) empty++;
      });
      const pos = score > 6 ? "di atas titik tengah (6): arah diri cenderung cukup jelas" : score === 6 ? "tepat di titik tengah (6)" : "di bawah titik tengah (6)";
      $("#eisResult").innerHTML = `<div class="result-row"><span>Skor identitas ego: <b style="font-size:20px">${score}</b> / 12</span>${empty ? `<span class="err">${empty} nomor belum diisi (semua wajib diisi)</span>` : `<span>${pos}</span>`}</div>`;
    };
    eisGrid.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; ans[b.dataset.i] = b.dataset.v; render(); });
    $("#eisExample").addEventListener("click", () => {
      const miss = [2, 5, 8, 11];
      KEY.forEach((k, i) => (ans[i] = miss.includes(i) ? (k === "A" ? "B" : "A") : k));
      render();
    });
    $("#eisReset").addEventListener("click", () => { ans.fill(null); render(); });
    render();
  }

  /* ================= CHECKLIST ================= */
  const cl = $("#checklist");
  if (cl) {
    const boxes = $$("input", cl);
    const upd = () => {
      const n = boxes.filter((b) => b.checked).length;
      $("#checkPct").textContent = `${n}/${boxes.length}`;
      $("#checkProg").style.width = (n / boxes.length) * 100 + "%";
    };
    boxes.forEach((b) => {
      if (store.get("inv-" + b.dataset.k) === "1") b.checked = true;
      b.addEventListener("change", () => { store.set("inv-" + b.dataset.k, b.checked ? "1" : "0"); upd(); });
    });
    upd();
  }

  /* ================= SUMMARY FILTER ================= */
  const sf = $("#sumFilter");
  if (sf) sf.addEventListener("change", () => {
    $$("#sumTable tbody tr").forEach((tr) => { tr.hidden = sf.value !== "all" && tr.dataset.f !== sf.value; });
  });

  /* ================= QUIZ ================= */
  const QUIZ = [
    ["Inventori tergolong tes …", ["Performa tipikal", "Performa maksimal", "Kecepatan", "Bakat khusus"], 0, "Inventori mengukur kecenderungan (performa tipikal), bukan kemampuan maksimal (Urbina, 2004)."],
    ["Format yang jumlah skor totalnya selalu tetap adalah …", ["Normatif", "Ipsatif", "Likert", "Benar-salah"], 1, "Format ipsatif memakai pilihan paksa atau peringkat, sehingga total skor selalu tetap."],
    ["Jumlah seluruh skor kategori RMIB yang benar adalah …", ["78", "210", "702", "90"], 2, "9 daftar × 78 = 702. Bila tidak 702, ada kesalahan penyalinan."],
    ["Pada RMIB, kategori dengan skor total terkecil mendapat …", ["Peringkat 12", "Peringkat 1 (paling diminati)", "Rata-rata peringkat", "Tidak diberi peringkat"], 1, "Skor terkecil = peringkat 1 = paling diminati."],
    ["Skor mentah satu kebutuhan EPPS dihitung dengan …", ["A di kolom k + B di baris k", "A di baris k + B di kolom k", "Jumlah sel diagonal", "Jumlah semua jawaban A"], 1, "r (A di baris k) + c (B di kolom k), sel diagonal diabaikan. Rentang 0–28."],
    ["Skor konsistensi EPPS dianggap konsisten bila …", ["≥ 11", "≥ 8", "Tepat 15", "≤ 5"], 0, "Edwards (1959) menetapkan skor 11 atau lebih sebagai konsisten."],
    ["Jumlah skor seluruh aspek PAPI-I wajib …", ["126", "20", "180", "90"], 3, "90 pasangan → total skor 90; tiap aspek 0–9."],
    ["Grafik DISC yang memakai skor Change (M − L) adalah …", ["Grafik I (Mask)", "Grafik II (Core)", "Grafik III (Mirror)", "Semua grafik"], 2, "Grafik I memakai M, grafik II memakai L, grafik III memakai Change."],
    ["Skor SDS: R 18, I 35, A 22, S 30, E 15, C 20. Kode Hollandnya …", ["IAS", "ISA", "SIA", "RIC"], 1, "Tiga skor tertinggi berurutan: I (35), S (30), A (22)."],
    ["Fungsi dominan tipe INTJ adalah …", ["Te", "Ne", "Ni", "Ti"], 2, "J membuat T diekstraversikan (Te). Tipe I → dominan fungsi yang diintroversikan: Ni."],
    ["Koefisien reliabilitas untuk aitem dikotomis seperti ASRI adalah …", ["Alfa Cronbach", "KR-20", "Tes ulang saja", "Korelasi aitem-total"], 1, "KR-20 untuk aitem dikotomis; alfa Cronbach untuk aitem berjenjang (ESLI, YA-SSI)."],
    ["Dua belas aitem pertama YA-SSI …", ["Diberi bobot ganda", "Dibalik skornya", "Tidak diberi skor", "Hanya untuk faktor keluarga"], 2, "Aitem 1–12 berfungsi sebagai informasi pengantar tentang jaringan sosial responden."],
  ];
  const quiz = $("#quiz");
  if (quiz) {
    quiz.innerHTML = QUIZ.map((q, i) => `
      <div class="q-card"><fieldset>
        <legend><span class="qn">${String(i + 1).padStart(2, "0")}</span>${q[0]}</legend>
        <div class="q-opts">${q[1].map((o, j) => `<label><input type="radio" name="q${i}" value="${j}"><span>${o}</span></label>`).join("")}</div>
        <p class="q-explain">${q[3]}</p>
      </fieldset></div>`).join("");
    $("#quizCheck").addEventListener("click", () => {
      let s = 0;
      QUIZ.forEach((q, i) => {
        $$(`input[name="q${i}"]`, quiz).forEach((inp) => {
          const lab = inp.closest("label");
          lab.classList.remove("right", "wrong");
          if (Number(inp.value) === q[2]) lab.classList.add("right");
          else if (inp.checked) lab.classList.add("wrong");
          if (inp.checked && Number(inp.value) === q[2]) s++;
        });
      });
      quiz.classList.add("checked");
      $("#quizScore").textContent = `Skor: ${s} / ${QUIZ.length}`;
    });
    $("#quizReset").addEventListener("click", () => {
      quiz.reset(); quiz.classList.remove("checked");
      $$("label", quiz).forEach((l) => l.classList.remove("right", "wrong"));
      $("#quizScore").textContent = "";
    });
  }

  /* ================= TASKBAR / START MENU ================= */
  const sections = $$("section.chapter");
  const sm = $("#startMenu"), sb = $("#startBtn"), list = $("#smList");
  const ICON = { beranda: "i-psi", lapangan: "i-chart", ringkasan: "i-doc", pustaka: "i-book", kuis: "i-quiz" };
  list.innerHTML = sections.map((s, i) => {
    const t = s.dataset.title;
    const parts = t.split(" · ");
    const label = parts.length > 1 ? parts.slice(1).join(" · ") : t;
    const num = parts.length > 1 ? parts[0] : "";
    return (i === sections.length - 2 ? '<li class="sep" aria-hidden="true"></li>' : "") +
      `<li><a href="#${s.id}"><svg class="ico"><use href="#${ICON[s.id] || "i-folder"}"/></svg>${label}<small>${num}</small></a></li>`;
  }).join("");
  const openMenu = (open) => {
    sm.hidden = !open;
    sb.setAttribute("aria-expanded", String(open));
    if (open) { const f = $("a", sm); if (f) f.focus(); }
  };
  sb.addEventListener("click", (e) => { e.stopPropagation(); openMenu(sm.hidden); });
  list.addEventListener("click", (e) => { if (e.target.closest("a")) openMenu(false); });
  document.addEventListener("click", (e) => { if (!sm.hidden && !sm.contains(e.target) && e.target !== sb) openMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !sm.hidden) { openMenu(false); sb.focus(); } });

  const title = $("#taskTitle"), cur = $("#taskCurrent");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { title.textContent = en.target.dataset.title; cur.setAttribute("href", "#" + en.target.id); }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => io.observe(s));
  }
  const prog = $("#scrollProg");
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const clock = $("#clock");
  const tick = () => { const d = new Date(); clock.textContent = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
  tick(); setInterval(tick, 15000);
})();
