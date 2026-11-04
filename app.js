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
  const fmt2 = (n) => (Math.round(n * 100) / 100).toFixed(2).replace(".", ",");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
  };
  const safe = (name, fn) => { try { fn(); } catch (e) { console.error("[" + name + "]", e); } };
  // Toggle-button helper: group of buttons with data-v, one pressed
  const press = (btns, v) => btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === v)));

  /* ================= DATA ================= */
  const EPPS = [
    ["Achievement", "ach", "Ingin berprestasi, menyelesaikan tugas sulit", "Berprestasi, menghadapi tantangan, menyelesaikan tugas yang sulit dan berat."],
    ["Deference", "def", "Mengikuti arahan dan menghormati otoritas", "Berbuat sesuai yang dipikirkan atau diharapkan orang lain, mengikuti perintah, mudah dipengaruhi (patuh, menghindari perbedaan)."],
    ["Order", "ord", "Rapi, terencana, dan sistematis", "Teratur dalam berbagai hal, ada perencanaan dan pengorganisasian kerja (rapi, tertib, teliti)."],
    ["Exhibition", "exh", "Ingin menjadi pusat perhatian", "Menjadi pusat perhatian, menonjolkan prestasi, atau menyatakan keberhasilannya."],
    ["Autonomy", "aut", "Bebas menentukan sikap dan tindakan sendiri", "Tidak bergantung, mandiri dalam membuat keputusan, menghindari campur tangan orang lain."],
    ["Affiliation", "aff", "Setia pada teman dan senang bersama orang lain", "Setia pada teman, berpartisipasi dalam kelompok, bekerja sama, berbuat sesuatu bersama orang lain."],
    ["Intraception", "int", "Menganalisis motif dan perasaan diri serta orang lain", "Menganalisis motif dan perasaan orang lain, menempatkan diri pada posisi orang lain, mempertimbangkan sebelum berbicara."],
    ["Succorance", "suc", "Ingin dibantu dan diperhatikan", "Menerima bantuan atau afeksi dari orang lain supaya orang lain bersimpati dan mengerti dirinya."],
    ["Dominance", "dom", "Ingin memimpin dan memengaruhi orang lain", "Memimpin, dihormati, membuat keputusan kelompok, mempertahankan pendapat, menyerang orang lain."],
    ["Abasement", "aba", "Mudah merasa bersalah dan menerima kesalahan", "Mengalami rasa bersalah, lebih mengalah daripada berdebat, merasa kurang mampu, takut, dan rendah diri."],
    ["Nurturance", "nur", "Senang menolong dan merawat orang lain", "Menolong orang lain yang mengalami kesulitan, mudah memaafkan, dermawan, ramah."],
    ["Change", "chg", "Menyukai hal baru dan variasi", "Melakukan hal baru atau berbeda, tidak suka rutinitas, senang bergaul, ingin mengikuti perubahan keadaan dan budaya."],
    ["Endurance", "end", "Tekun dan bertahan sampai tugas tuntas", "Tekun dalam tugas, fokus saat bekerja, tidak ingin diganggu."],
    ["Heterosexuality", "het", "Tertarik menjalin hubungan dengan lawan jenis", "Bergaul bebas dengan lawan jenis, tertarik kegiatan kelompok lawan jenis, suka membicarakan hal yang berbau seks."],
    ["Aggression", "agg", "Menyerang pendapat, mengkritik secara terbuka", "Menyerang orang lain secara fisik atau verbal, mudah marah, mempermainkan orang lain."],
  ];
  const EPPS_PAIRS = [[1, 151], [7, 157], [13, 163], [19, 169], [25, 175], [26, 101], [32, 107], [38, 113], [44, 119], [50, 125], [51, 201], [57, 207], [63, 213], [69, 219], [75, 225]];

  const PAPI = [
    { group: "Arah kerja (Work Direction)", color: "#c8f169", items: [
      ["N", "Need to finish a task", "kebutuhan menyelesaikan tugas secara mandiri", "Need"],
      ["G", "Role of hard intense worker", "peran pekerja keras", "Role"],
      ["A", "Need to achieve", "kebutuhan berprestasi", "Need"]] },
    { group: "Kepemimpinan (Leadership)", color: "#8fb2ff", items: [
      ["L", "Leadership role", "peran sebagai pemimpin", "Role"],
      ["P", "Need to control others", "kebutuhan mengatur orang lain", "Need"],
      ["I", "Ease in decision making", "peran membuat keputusan", "Role"]] },
    { group: "Aktivitas (Activity)", color: "#f2c443", items: [
      ["T", "Pace", "tempo kerja / peran sibuk", "Role"],
      ["V", "Vigorous type", "peran penuh semangat", "Role"]] },
    { group: "Pergaulan (Social Nature)", color: "#ffb3a7", items: [
      ["X", "Need to be noticed", "kebutuhan untuk diperhatikan", "Need"],
      ["S", "Social extension", "peran hubungan sosial", "Role"],
      ["B", "Need to belong to groups", "kebutuhan diterima dalam kelompok", "Need"],
      ["O", "Need for closeness and affection", "kebutuhan mendekati dan menyayangi", "Need"]] },
    { group: "Gaya kerja (Work Style)", color: "#9be3c4", items: [
      ["R", "Theoretical type", "tipe teoretis", "Role"],
      ["D", "Interest in working with details", "suka pekerjaan yang terperinci", "Role"],
      ["C", "Organized type", "tipe pengatur", "Role"]] },
    { group: "Sifat (Temperament)", color: "#d4b8ff", items: [
      ["Z", "Need for change", "kebutuhan untuk berubah", "Need"],
      ["E", "Emotional restraint", "peran pengendalian emosi", "Role"],
      ["K", "Need to be forceful", "kebutuhan agresif atau tegas", "Need"]] },
    { group: "Ketaatan (Followership)", color: "#9fe0ee", items: [
      ["F", "Need to support authority", "kebutuhan membantu atasan", "Need"],
      ["W", "Need for rules and supervision", "kebutuhan mengikuti aturan dan pengawasan", "Need"]] },
  ];
  const PAPI_FLAT = [];
  PAPI.forEach((g) => g.items.forEach((it) => PAPI_FLAT.push({ code: it[0], color: g.color, group: g.group, kind: it[3], name: it[1] })));
  const PAPI_ROLES = ["G", "L", "I", "T", "V", "S", "R", "D", "C", "E"];
  const PAPI_NEEDS = ["N", "A", "P", "X", "B", "O", "Z", "K", "F", "W"];
  // Both examples: roles = 45, needs = 45
  const PAPI_LEADER = { G: 5, L: 7, I: 7, T: 5, V: 3, S: 5, R: 4, D: 2, C: 3, E: 4, N: 5, A: 6, P: 7, X: 4, B: 3, O: 3, Z: 5, K: 5, F: 4, W: 3 };
  const PAPI_EXEC = { G: 6, L: 2, I: 3, T: 4, V: 4, S: 5, R: 3, D: 7, C: 7, E: 4, N: 7, A: 4, P: 2, X: 3, B: 5, O: 5, Z: 2, K: 3, F: 7, W: 7 };
  // Lecturer's interpretation ranges: [label, min, max, text]
  const PAPI_INTERP = {
    N: [["< 3", 0, 2, "menunda atau menghindari pekerjaan"], ["3–4", 3, 4, "berhati-hati atau ragu dalam bekerja"], ["4–6", 4, 6, "cukup bertanggung jawab pada pekerjaan"], ["6–9", 6, 9, "tekun, tanggung jawab tinggi"]],
    G: [["3–4", 3, 4, "bekerja untuk kesenangan saja, bukan hasil optimal"], ["4–7", 4, 7, "kemauan bekerja keras tinggi"]],
    A: [["0–5", 0, 5, "tujuan tidak pasti, puas dengan pekerjaan, tidak ada usaha lebih"], ["6–9", 6, 9, "tujuan jelas, kebutuhan sukses dan ambisi tinggi"]],
    L: [["5–9", 5, 9, "memproyeksikan diri sebagai pemimpin, memakai orang lain untuk mencapai tujuan"], ["0–4", 0, 4, "cenderung tidak aktif memakai orang lain dalam bekerja"]],
    P: [["5–9", 5, 9, "butuh menerima tanggung jawab atas orang lain"], ["0–4", 0, 4, "keinginan bertanggung jawab atas pekerjaan dan tindakan orang lain menurun"]],
    I: [["0–2", 0, 2, "ragu, menolak mengambil keputusan"], ["3–4", 3, 4, "berhati-hati membuat keputusan"], ["5–7", 5, 7, "berhati-hati tetapi lancar membuat keputusan"], ["8–9", 8, 9, "tidak ragu mengambil keputusan"]],
    T: [["< 4", 0, 3, "melakukan segala sesuatu menurut kemauan sendiri"], ["4–6", 4, 6, "tergolong aktif secara internal dan mental"]],
    V: [["< 5", 0, 4, "cenderung pasif"], ["5–7", 5, 7, "aktif secara fisik, cenderung sportif"]],
    O: [["< 3", 0, 2, "tidak suka hubungan perorangan"], ["3–4", 3, 4, "sadar akan hubungan perorangan, tetapi tidak terlalu tergantung"], ["5–9", 5, 9, "sangat tergantung, butuh penerimaan diri"]],
    X: [["< 2", 0, 1, "cenderung pemalu"], ["2–3", 2, 3, "rendah hati, tulus"], ["4–5", 4, 5, "memiliki pola perilaku yang unik"], ["6–9", 6, 9, "membutuhkan perhatian nyata"]],
    B: [["0–3", 0, 3, "selektif"], ["4–5", 4, 5, "butuh diterima tetapi tidak mudah dipengaruhi kelompok"], ["6–9", 6, 9, "butuh disukai dan diakui, mudah dipengaruhi"]],
    S: [["< 6", 0, 5, "perhatian rendah pada hubungan sosial, kurang percaya kepada orang lain"], ["6–9", 6, 9, "kepercayaan tinggi dalam hubungan sosial, suka interaksi sosial"]],
    C: [["0–2", 0, 2, "fleksibel, tidak teratur"], ["3–5", 3, 5, "teratur tetapi tidak tergolong fleksibel"], ["6–9", 6, 9, "keteraturan tinggi, cenderung kaku"]],
    R: [["0–4", 0, 4, "kurang perhatian, bersifat praktis"], ["5–9", 5, 9, "nilai-nilai penalaran tergolong tinggi"]],
    D: [["0–3", 0, 3, "menyadari perlunya kecermatan, tetapi tidak berminat bekerja detail"], ["4–9", 4, 9, "minat tinggi untuk bekerja secara detail"]],
    Z: [["2", 2, 2, "tidak suka berubah"], ["3–4", 3, 4, "tidak suka perubahan jika dipaksakan"], ["5–6", 5, 6, "mudah menyesuaikan diri"], ["6–7", 6, 7, "membuat perubahan yang selektif, berpikir jauh ke depan"], ["8–9", 8, 9, "mudah gelisah dan frustrasi karena segala sesuatu tidak berjalan fantastis"]],
    E: [["< 2", 0, 1, "terbuka, cepat bereaksi, tidak normatif"], ["2–3", 2, 3, "terbuka"], ["4–6", 4, 6, "pendekatan emosional seimbang, mampu mengendalikan"], ["> 6", 7, 9, "sangat normatif, kebutuhan pengendalian diri berlebihan"]],
    K: [["0–2", 0, 2, "menghindari masalah, menolak mengenali situasi sebagai masalah"], ["3–4", 3, 4, "suka lingkungan tenang, menghindari konflik"], ["5", 5, 5, "keras kepala"], ["6–7", 6, 7, "agresi berhubungan dengan kerja, dorongan semangat bersaing"], ["8–9", 8, 9, "agresif, cenderung defensif"]],
    F: [["6–9", 6, 9, "setia dan membantu, kemungkinan bantuannya bersifat politis"], ["4–5", 4, 5, "setia terhadap perusahaan"], ["2–3", 2, 3, "mengurus kepentingan sendiri"], ["< 2", 0, 1, "cenderung egois, kemungkinan bisa memberontak"]],
    W: [["< 4", 0, 3, "berorientasi pada tujuan, mandiri"], ["4–5", 4, 5, "butuh pengarahan dan harapan yang dirumuskan untuknya"], ["6–9", 6, 9, "orientasi pada tugas meningkat, butuh instruksi yang jelas"]],
  };
  const papiMatch = (code, v) => (PAPI_INTERP[code] || []).filter((r) => v >= r[1] && v <= r[2]).map((r) => r[3]);

  const RMIB = ["Out", "Me", "Comp", "Sci", "Pers", "Aesth", "Lit", "Mus", "S.S", "Cler", "Prac", "Med"];
  const RMIB_NAMES = ["Outdoor", "Mechanical", "Computational", "Scientific", "Personal Contact", "Aesthetic", "Literary", "Musical", "Social Service", "Clerical", "Practical", "Medical"];
  const RMIB_EX = [20, 85, 70, 35, 48, 62, 40, 95, 30, 58, 80, 79];
  const LISTS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
  // Lecturer's example sheet, entered in job order: RMIB_SHEET_EX[job][list]
  const RMIB_SHEET_EX = [
    [1, 1, 5, 6, 10, 3, 2, 1, 6], [4, 10, 7, 11, 5, 6, 3, 9, 11], [11, 3, 9, 5, 7, 7, 4, 10, 9], [5, 5, 1, 1, 3, 1, 7, 11, 5],
    [12, 2, 2, 2, 1, 8, 8, 4, 7], [2, 6, 6, 4, 11, 2, 6, 7, 8], [6, 4, 12, 7, 12, 9, 9, 8, 12], [10, 7, 10, 8, 2, 10, 5, 12, 4],
    [8, 12, 3, 9, 4, 11, 10, 2, 10], [7, 11, 4, 3, 6, 12, 1, 3, 1], [9, 8, 8, 10, 8, 5, 11, 5, 2], [3, 9, 11, 12, 9, 4, 12, 6, 3],
  ];

  const RIASEC = ["R", "I", "A", "S", "E", "C"];
  const RIASEC_NAMES = { R: "Realistic", I: "Investigative", A: "Artistic", S: "Social", E: "Enterprising", C: "Conventional" };
  const HEX_EX = { R: 18, I: 35, A: 22, S: 30, E: 15, C: 20 };
  const RIASEC_DETAIL = {
    R: ["The “Do-ers”", "Suka bekerja terutama dengan tangan: membuat, memperbaiki, merakit atau membangun sesuatu, menggunakan dan mengoperasikan peralatan, alat, atau mesin. Sering suka bekerja di luar ruangan.", "Menggunakan dan mengoperasikan alat, peralatan, dan mesin; merancang, membangun, memperbaiki, memelihara; bekerja secara manual; mengukur; bekerja secara detail; mengemudi; bergerak; merawat hewan; bekerja dengan tanaman.", "Pilot, petani, hortikultura, pembangun, insinyur, personel angkatan bersenjata, mekanik, tukang pelapis, listrik, teknolog komputer, penjaga taman, olahragawan.", "Bahasa Inggris, Matematika, Sains, Workshop, Teknologi, Komputer, Studi Bisnis, Pertanian, Hortikultura, Pendidikan Jasmani."],
    I: ["The “Thinkers”", "Suka menemukan dan meneliti ide, mengamati, menyelidiki, bereksperimen, mengajukan pertanyaan, dan menyelesaikan masalah.", "Berpikir analitis dan logis, menghitung, berkomunikasi dengan menulis dan berbicara, merancang, merumuskan, mendiagnosis, bereksperimen, menyelidiki.", "Ilmu pengetahuan, penelitian, pekerjaan medis dan kesehatan, ahli kimia, ilmuwan kelautan, teknisi kehutanan, teknisi laboratorium medis atau pertanian, ahli zoologi.", "Bahasa Inggris, Matematika, Sains, Komputer, Teknologi."],
    A: ["The “Creators”", "Suka menggunakan kata-kata, seni, musik, atau drama untuk berkomunikasi, tampil, atau mengekspresikan diri; membuat dan merancang sesuatu.", "Mengekspresikan diri secara artistik atau fisik, berbicara, menulis, menyanyi, tampil, merancang, menyajikan, merencanakan, menyusun, bermain, menari.", "Artis, ilustrator, fotografer, penulis lagu, komposer, penyanyi, pemain instrumen, penari, aktor, reporter, penulis, editor, pengiklan, penata rambut, perancang busana.", "Bahasa Inggris, Ilmu Sosial, Musik, Drama, Seni, Desain Grafis, Komputer, Studi Bisnis, Bahasa."],
    S: ["The “Helpers”", "Suka mengajar, melatih, dan memberi informasi; membantu, mengobati, menyembuhkan, melayani, dan menyapa; peduli pada kesejahteraan diri dan orang lain.", "Berkomunikasi lisan atau tertulis, peduli dan mendukung, melatih, bertemu, menyapa, membantu, mengajar, memberi informasi, mewawancarai.", "Guru, perawat, asisten perawat, penasihat, petugas polisi, pekerja sosial, tenaga penjualan, petugas layanan pelanggan, pelayan, sekretaris.", "Bahasa Inggris, Ilmu Sosial, Matematika, Sains, Kesehatan, Pendidikan Jasmani, Seni, Komputer, Studi Bisnis, Bahasa."],
    E: ["The “Persuaders”", "Suka bertemu orang, memimpin, berbicara dan memengaruhi orang lain, mendorong orang lain, bekerja dalam bisnis.", "Menjual, mempromosikan dan membujuk, mengembangkan ide, berbicara di depan umum, mengelola, mengatur, memimpin, menghitung, merencanakan.", "Tenaga penjual, pengacara, politisi, akuntan, pemilik bisnis, eksekutif atau manajer, agen perjalanan, promotor musik atau olahraga.", "Bahasa Inggris, Matematika, Studi Bisnis, Akuntansi, Ekonomi, Ilmu Sosial, Drama, Komputasi, Manajemen Informasi Teks, Bahasa."],
    C: ["The “Organizers”", "Suka bekerja di dalam ruangan pada tugas yang melibatkan pengorganisasian dan akurasi, mengikuti prosedur, bekerja dengan data atau angka, merencanakan pekerjaan dan acara.", "Komputasi dan mengetik, merekam dan menyimpan catatan, memperhatikan detail, bertemu dan menyapa, menghitung, menangani uang, mengatur, bekerja secara mandiri.", "Sekretaris, resepsionis, pekerja kantor, pustakawan, petugas bank, operator komputer, petugas toko dan pengiriman.", "Bahasa Inggris, Matematika, Studi Bisnis, Akuntansi, Ekonomi, Komputer, Manajemen Informasi Teks."],
  };

  const MBTI_TYPES = {
    ISTJ: ["Bertanggung jawab", ["Serius, tenang, stabil, dan damai.", "Senang pada fakta; logis, objektif, praktis, dan realistis.", "Task oriented, tekun, teratur, menepati janji, dapat diandalkan, bertanggung jawab."]],
    ISFJ: ["Setia", ["Penuh pertimbangan, hati-hati, teliti, dan akurat.", "Serius, tenang, stabil, namun sensitif.", "Ramah, perhatian pada perasaan dan kebutuhan orang lain, setia, kooperatif, pendengar yang baik."]],
    INFJ: ["Reflektif", ["Perhatian, empati, sensitif, dan berkomitmen pada hubungan.", "Orisinal dan berkeinginan kuat melakukan apa saja yang diperlukan, termasuk memberi yang terbaik dalam pekerjaan."]],
    INTJ: ["Independen", ["Visioner, punya perencanaan praktis, biasanya punya ide orisinal dan dorongan kuat untuk mencapainya.", "Mandiri dan percaya diri.", "Punya kemampuan analisis yang bagus."]],
    ISTP: ["Pragmatis", ["Tenang, pendiam, cenderung kaku, dingin, hati-hati, penuh pertimbangan.", "Logis, rasional, kritis, objektif.", "Mampu menghadapi perubahan mendadak dengan cepat dan tenang."]],
    ISFP: ["Artistik", ["Berpikiran simpel, fleksibel, sensitif, ramah, rendah hati pada kemampuannya.", "Menghindari konflik, tidak memaksakan pendapat.", "Biasanya tidak mau memimpin, tetapi menjadi pengikut dan pelaksana yang setia."]],
    INFP: ["Idealis", ["Sangat perhatian dan peka terhadap perasaan orang lain.", "Penuh antusiasme dan kesetiaan, biasanya hanya untuk orang dekat.", "Peduli pada banyak hal."]],
    INTP: ["Konseptual", ["Sangat menghargai intelektualitas dan pengetahuan.", "Diam dan menahan diri; lebih suka bekerja sendiri.", "Cenderung kritis, skeptis, dan pesimis."]],
    ESTP: ["Spontan", ["Spontan, aktif, enerjik, cekatan, fun.", "Komunikator, asertif, to the point, ceplas-ceplos, berkarisma, interpersonal skill baik.", "Baik dalam memecahkan masalah langsung di tempat."]],
    ESFP: ["Murah hati", ["Outgoing, easygoing, mudah berteman, optimis, ceria, antusias, menghibur, suka menjadi perhatian.", "Interpersonal skill baik, murah hati, mudah bersimpati."]],
    ENFP: ["Optimis", ["Ramah, hangat, enerjik, optimis, antusias, semangat tinggi.", "Imajinatif, penuh ide, kreatif, inovatif.", "Mampu beradaptasi dengan beragam situasi dan perubahan."]],
    ENTP: ["Inovatif–kreatif", ["Gesit, kreatif, inovatif, cerdik, logis.", "Banyak bicara dan pandai berdebat.", "Fleksibel; punya banyak cara memecahkan masalah dan tantangan."]],
    ESTJ: ["Konservatif–disiplin", ["Praktis, realistis, berpegang pada fakta, dengan dorongan alami untuk bisnis dan hal mekanis.", "Sangat sistematis, prosedural, dan terencana.", "Konservatif dan cenderung kaku."]],
    ESFJ: ["Harmonis", ["Hangat, banyak bicara, populer; butuh keseimbangan dan pandai menciptakan harmoni.", "Selalu melakukan sesuatu yang manis bagi orang lain."]],
    ENFJ: ["Meyakinkan", ["Kreatif, imajinatif, peka, sensitif, loyal.", "Umumnya peduli pada apa kata orang atau apa yang orang lain inginkan.", "Pandai bergaul, meyakinkan, ramah, simpatik; responsif pada kritik dan pujian."]],
    ENTJ: ["Pemimpin alami", ["Tegas, asertif, to the point, jujur terus terang, objektif, kritis, punya standar tinggi.", "Dominan, kuat kemauannya, perfeksionis, kompetitif.", "Tangguh, disiplin, sangat menghargai komitmen."]],
  };
  const MBTI_ORDER = ["ISTJ", "ISFJ", "INFJ", "INTJ", "ISTP", "ISFP", "INFP", "INTP", "ESTP", "ESFP", "ENFP", "ENTP", "ESTJ", "ESFJ", "ENFJ", "ENTJ"];

  const DISC_PATTERNS = [
    ["D", "Establisher"], ["DI", "Concluder"], ["DS", "Attainer"], ["DC", "Challenger"], ["DIS", "Director"], ["DIC", "Chancellor"], ["DSI", "Attainer"], ["DSC", "Attainer"], ["DCI", "Challenger"], ["DCS", "Challenger"],
    ["I", "Communicator"], ["ID", "Persuader"], ["IS", "Advisor"], ["IC", "Assessor"], ["IDS", "Reformer"], ["IDC", "Leader"], ["ISD", "Motivator"], ["ISC", "Governor"], ["ICD", "Assessor"], ["ICS", "Governor"],
    ["S", "Technician"], ["SD", "Attainer"], ["SI", "Advisor"], ["SC", "Peacemaker"], ["SDI", "Attainer"], ["SDC", "Inquirer"], ["SID", "Advisor"], ["SIC", "Advocate"], ["SCD", "Peacemaker"], ["SCI", "Advocate"],
    ["C", "Logical Thinker"], ["CD", "Designer"], ["CI", "Assessor"], ["CS", "Precisionist"], ["CDI", "Designer"], ["CDS", "Contemplator"], ["CID", "Assessor"], ["CIS", "Mediator"], ["CSD", "Precisionist"], ["CSI", "Practitioner"],
  ];
  const DISC_MAP = Object.fromEntries(DISC_PATTERNS);

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
    el("circle", { cx, cy, r: rs(9), fill: "#eefbd6", stroke: "#1c1c1c", "stroke-width": 1.5 }, svg);
    el("circle", { cx, cy, r: rs(5.5), fill: "#ffffff" }, svg);
    el("circle", { cx, cy, r: rs(3.5), fill: "#ffe8e2" }, svg);
    for (let s = 1; s <= 8; s++) el("circle", { cx, cy, r: rs(s), fill: "none", stroke: "#b8c0bb", "stroke-width": .7, "stroke-dasharray": s === 3 || s === 5 ? "0" : "2 3" }, svg);
    const n = PAPI_FLAT.length, step = 360 / n;
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

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ================= HERO ================= */
  safe("hero", () => {
    drawWheel($("#heroWheel"), PAPI_LEADER, true);
    drawHex($("#heroHex"), HEX_EX, ["I", "S", "A"]);
    const heroProg = $("#heroProg"), loadPct = $("#loadPct");
    if (!heroProg) return;
    requestAnimationFrame(() => setTimeout(() => { heroProg.style.width = "100%"; }, 150));
    if (reduce) { loadPct.textContent = "100%"; return; }
    let p = 0;
    const t = setInterval(() => { p = Math.min(100, p + 4); loadPct.textContent = p + "%"; if (p >= 100) clearInterval(t); }, 64);
  });

  /* ================= SECTION WINDOW CONTROLS ================= */
  safe("ctrls", () => {
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
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href").slice(1);
      const target = id && document.getElementById(id);
      if (target && target.classList.contains("is-min")) target.classList.remove("is-min");
    });
  });

  /* ================= LIKERT WIDGET ================= */
  safe("likert", () => {
    const box = $("#likert");
    if (!box) return;
    const OPTS = ["Sangat tidak setuju", "Tidak setuju", "Netral", "Setuju", "Sangat setuju"];
    let dir = "fav", pick = 4;
    box.innerHTML = OPTS.map((o, i) => `<button type="button" class="bevel-btn" data-v="${i}"><b></b>${o}</button>`).join("");
    const dirBtns = $$("[data-dir]");
    const render = () => {
      dirBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.dir === dir)));
      $$("button", box).forEach((b, i) => {
        const score = dir === "fav" ? i + 1 : 5 - i;
        b.querySelector("b").textContent = score;
        b.setAttribute("aria-pressed", String(i === pick));
      });
      const score = dir === "fav" ? pick + 1 : 5 - pick;
      $("#likertOut").innerHTML = `Aitem <b>${dir === "fav" ? "favorable" : "unfavorable"}</b>, jawaban <b>${OPTS[pick]}</b> → skor <b style="font-size:18px">${score}</b>`;
    };
    dirBtns.forEach((b) => b.addEventListener("click", () => { dir = b.dataset.dir; render(); }));
    box.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; pick = Number(b.dataset.v); render(); });
    render();
  });

  /* ================= RMIB (totals calculator) ================= */
  safe("rmib", () => {
    const rmibIn = $("#rmibInputs");
    if (!rmibIn) return;
    RMIB.forEach((c, i) => {
      const f = document.createElement("div");
      f.className = "field";
      f.innerHTML = `<label for="rm${i}">${c}</label><input id="rm${i}" type="number" inputmode="numeric" min="9" max="108" value="${RMIB_EX[i]}" aria-label="Skor total ${RMIB_NAMES[i]}">`;
      rmibIn.appendChild(f);
    });
    const calc = () => {
      const vals = RMIB.map((_, i) => { const v = $("#rm" + i).value.trim(); return v === "" ? null : Number(v); });
      const out = $("#rmibResult");
      if (vals.some((v) => v === null || !isFinite(v))) { out.innerHTML = "Lengkapi 12 skor kategori untuk menghitung peringkat."; return; }
      const sum = vals.reduce((a, b) => a + b, 0);
      const outOfRange = vals.map((v, i) => (v < 9 || v > 108 ? RMIB[i] : null)).filter(Boolean);
      const idx = vals.map((v, i) => i).sort((a, b) => vals[a] - vals[b]);
      const rank = new Array(12);
      let ties = false;
      for (let i = 0; i < 12;) {
        let j = i; while (j + 1 < 12 && vals[idx[j + 1]] === vals[idx[i]]) j++;
        if (j > i) ties = true;
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
        <p style="margin:10px 0 0">Minat menonjol (peringkat 1–3): <b>${tops || "-"}</b>. Cenderung ditolak (10–12): <b>${lows || "-"}</b>.</p>
        ${ties ? '<p class="mode-note">Ada skor kembar: di sini memakai rata-rata peringkat. Menurut materi dosen, pilih kategori yang paling banyak angka kecilnya (pakai lembar skoring penuh di atas).</p>' : ""}`;
    };
    rmibIn.addEventListener("input", calc);
    $("#rmibExample").addEventListener("click", () => { RMIB_EX.forEach((v, i) => ($("#rm" + i).value = v)); calc(); });
    $("#rmibReset").addEventListener("click", () => { RMIB.forEach((_, i) => ($("#rm" + i).value = "")); calc(); });
    calc();
  });

  /* ================= RMIB full scoring sheet ================= */
  safe("rmibSheet", () => {
    const table = $("#rsheet");
    if (!table) return;
    // data[list][job] — rank given to job number `job` in list `list`; job j of list L belongs to category (j + L) % 12
    const data = LISTS.map(() => new Array(12).fill(null));
    let mode = "job";
    const catOf = (L, j) => (j + L) % 12;
    const jobOf = (L, c) => (c - L + 12) % 12;
    const modeBtns = $$("[data-rmode]");
    const loadExample = () => { for (let j = 0; j < 12; j++) for (let L = 0; L < 9; L++) data[L][j] = RMIB_SHEET_EX[j][L]; };

    const build = () => {
      modeBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.rmode === mode)));
      $("#rsheetNote").innerHTML = mode === "job"
        ? "Baris = nomor pekerjaan di lembar tes (1–12), kolom = kelompok A–I. Isi persis seperti jawaban testee; kategori dipetakan otomatis (seperti Excel biro psikologi)."
        : "Baris = kategori minat, kolom = kelompok. Kotak ★ adalah tempat ranking pekerjaan pertama tiap kelompok; isi turun dari ★ dan kembali ke atas setelah Med.";
      let html = `<thead><tr><th scope="col">${mode === "job" ? "Pekerjaan" : "Kategori"}</th>${LISTS.map((l) => `<th scope="col">${l}</th>`).join("")}${mode === "cat" ? '<th scope="col">Total</th><th scope="col">Rank</th>' : ""}</tr></thead><tbody>`;
      for (let r = 0; r < 12; r++) {
        html += `<tr><th scope="row">${mode === "job" ? "No. " + (r + 1) : RMIB[r].toLowerCase()}</th>`;
        for (let L = 0; L < 9; L++) {
          const j = mode === "job" ? r : jobOf(L, r);
          const v = data[L][j];
          const star = mode === "cat" && j === 0 && L > 0;
          const label = mode === "job" ? `Kelompok ${LISTS[L]} pekerjaan ${j + 1} (kategori ${RMIB_NAMES[catOf(L, j)]})` : `${RMIB_NAMES[r]}, kelompok ${LISTS[L]}`;
          html += `<td class="${star ? "star" : ""}" data-l="${L}" data-j="${j}"><input type="number" min="1" max="12" inputmode="numeric" value="${v == null ? "" : v}" aria-label="${label}"></td>`;
        }
        if (mode === "cat") html += `<td class="tot" data-tot="${r}"></td><td class="rk" data-rk="${r}"></td>`;
        html += "</tr>";
      }
      html += `</tbody><tfoot><tr><td>Cek</td>${LISTS.map((_, L) => `<td data-chk="${L}"></td>`).join("")}${mode === "cat" ? '<td data-grand></td><td data-verdict></td>' : ""}</tr></tfoot>`;
      table.innerHTML = html;
      calc();
    };

    const calc = () => {
      // per-column validation
      let allOk = true;
      LISTS.forEach((_, L) => {
        const col = data[L];
        const filled = col.filter((v) => v != null);
        const counts = {};
        filled.forEach((v) => (counts[v] = (counts[v] || 0) + 1));
        const dup = new Set(Object.keys(counts).filter((k) => counts[k] > 1).map(Number));
        const bad = new Set(filled.filter((v) => v < 1 || v > 12 || !Number.isInteger(v)));
        $$(`td[data-l="${L}"]`, table).forEach((td) => {
          const v = data[L][Number(td.dataset.j)];
          td.classList.toggle("bad", v != null && (dup.has(v) || bad.has(v)));
        });
        const sum = filled.reduce((a, b) => a + b, 0);
        const ok = filled.length === 12 && dup.size === 0 && bad.size === 0 && sum === 78;
        if (!ok) allOk = false;
        const chk = $(`[data-chk="${L}"]`, table);
        chk.className = ok ? "ok" : filled.length ? "err" : "";
        chk.textContent = ok ? "OK" : !filled.length ? "—" : dup.size ? "DOBEL" : bad.size ? "1–12" : filled.length < 12 ? `${filled.length}/12` : "≠78";
      });
      // category totals
      const totals = RMIB.map((_, c) => LISTS.reduce((s, __, L) => s + (data[L][jobOf(L, c)] || 0), 0));
      const vecs = RMIB.map((_, c) => LISTS.map((__, L) => data[L][jobOf(L, c)] || 99).sort((a, b) => a - b));
      const lexCmp = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; };
      const order = RMIB.map((_, c) => c).sort((a, b) => totals[a] - totals[b] || lexCmp(vecs[a], vecs[b]) || a - b);
      const rank = new Array(12);
      const tieInfo = [];
      order.forEach((c, i) => {
        if (i > 0) {
          const p = order[i - 1];
          if (totals[p] === totals[c]) {
            const cmp = lexCmp(vecs[p], vecs[c]);
            tieInfo.push(`${RMIB_NAMES[p]} dan ${RMIB_NAMES[c]} sama-sama ${totals[c]}${cmp === 0 ? " (pola angka identik, peringkat sama)" : ` → ${RMIB_NAMES[p]} lebih banyak angka kecil, jadi lebih tinggi`}`);
            if (cmp === 0) { rank[c] = rank[p]; return; }
          }
        }
        rank[c] = i + 1;
      });
      const grand = totals.reduce((a, b) => a + b, 0);
      if (mode === "cat") {
        RMIB.forEach((_, c) => { $(`[data-tot="${c}"]`, table).textContent = totals[c] || ""; $(`[data-rk="${c}"]`, table).textContent = allOk ? rank[c] : ""; });
        const g = $("[data-grand]", table), v = $("[data-verdict]", table);
        g.textContent = grand || "";
        v.textContent = allOk ? (grand === 702 ? "BENAR" : "SALAH") : "";
        v.className = allOk ? (grand === 702 ? "ok" : "err") : "";
      }
      const out = $("#rsheetResult");
      if (!allOk) {
        out.innerHTML = `<span class="err">Lembar belum valid.</span> Setiap kolom harus berisi angka 1–12 masing-masing tepat sekali (jumlah 78). Sel merah berarti angka dobel atau di luar 1–12.`;
        return;
      }
      const rows = order.map((c) => `<tr class="${rank[c] <= 3 ? "is-top" : rank[c] >= 10 ? "is-low" : ""}"><td class="rk num">${rank[c]}</td><td><span class="code">${RMIB[c]}</span> ${RMIB_NAMES[c]}</td><td class="num">${totals[c]}</td></tr>`).join("");
      out.innerHTML = `
        <div class="result-row" style="margin-bottom:10px"><span>Total: <b>${grand}</b></span>${grand === 702 ? '<span class="ok">✓ 702 — BENAR</span>' : '<span class="err">✗ harus 702</span>'}</div>
        <div class="tbl-wrap"><table class="tbl compact rank-table"><thead><tr><th>Ranking</th><th>Kategori</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table></div>
        ${tieInfo.length ? `<p class="mode-note">Skor kembar (aturan dosen): ${tieInfo.map(esc).join("; ")}.</p>` : ""}`;
    };

    table.addEventListener("input", (e) => {
      const td = e.target.closest("td[data-l]");
      if (!td) return;
      const raw = e.target.value.trim();
      const v = raw === "" ? null : Number(raw);
      data[Number(td.dataset.l)][Number(td.dataset.j)] = v == null || !isFinite(v) ? null : v;
      calc();
    });
    modeBtns.forEach((b) => b.addEventListener("click", () => { mode = b.dataset.rmode; build(); }));
    $("#rsheetExample").addEventListener("click", () => { loadExample(); build(); });
    $("#rsheetClear").addEventListener("click", () => { data.forEach((col) => col.fill(null)); build(); });
    loadExample();
    build();
  });

  /* ================= EPPS ================= */
  safe("epps", () => {
    const eppsBody = $("#eppsNeedsBody");
    if (!eppsBody) return;
    eppsBody.innerHTML = EPPS.map((n, i) => `<tr><td class="num">${i + 1}</td><th scope="row">${n[0]}</th><td><span class="code">${n[1]}</span></td><td>${n[2]}</td><td>${n[3]}</td></tr>`).join("");
    const sel = $("#eppsSel"), nums = $("#eppsNums");
    sel.innerHTML = EPPS.map((n, i) => `<option value="${i}">${i + 1}. ${n[0]} (${n[1]})</option>`).join("");
    const mx = $("#eppsMatrix");
    const item = (r, c) => Math.floor(r / 5) * 75 + c * 5 + (r % 5) + 1;
    const isBlue = (r, c) => (r < 5 && (c === r + 5 || c === r + 10)) || (r >= 10 && c === r - 10);
    const cells = [];
    mx.appendChild(Object.assign(document.createElement("div"), { className: "mh" }));
    const colHeads = EPPS.map((n) => { const d = document.createElement("div"); d.className = "mh"; d.textContent = n[1]; d.style.writingMode = "vertical-rl"; d.style.transform = "rotate(180deg)"; mx.appendChild(d); return d; });
    const rowHeads = [];
    EPPS.forEach((n, r) => {
      const h = document.createElement("div"); h.className = "mh row"; h.textContent = n[1]; mx.appendChild(h); rowHeads.push(h);
      cells[r] = [];
      EPPS.forEach((_, c) => {
        const d = document.createElement("div");
        d.className = "mc" + (r === c ? " diag" : "") + (isBlue(r, c) ? " blue" : "");
        d.title = `No. ${item(r, c)}`;
        mx.appendChild(d); cells[r][c] = d;
      });
    });
    const update = () => {
      const k = Number(sel.value), showNum = nums.checked;
      cells.forEach((row, r) => row.forEach((d, c) => {
        d.classList.toggle("inrow", r === k && c !== k);
        d.classList.toggle("incol", c === k && r !== k);
        d.textContent = showNum ? item(r, c) : r === k && c !== k ? "A" : c === k && r !== k ? "B" : "";
      }));
      rowHeads.forEach((h, i) => h.classList.toggle("sel", i === k));
      colHeads.forEach((h, i) => h.classList.toggle("sel", i === k));
      $("#eppsCap").textContent = `${EPPS[k][0].toUpperCase()}: 14 SEL BARIS (A) + 14 SEL KOLOM (B) = MAKS 28 · SEL MERAH NO. ${item(k, k)} TIDAK DIHITUNG`;
    };
    sel.addEventListener("change", update);
    nums.addEventListener("change", update);
    update();

    // consistency calculator
    const box = $("#eppsCons");
    const state = new Array(15).fill(null);
    box.innerHTML = EPPS_PAIRS.map((p, i) => `<div class="item"><span class="no"><span>${p[0]} vs ${p[1]}</span></span><div class="opts" role="group" aria-label="Pasangan ${p[0]} dan ${p[1]}"><button type="button" class="bevel-btn" data-i="${i}" data-v="1" aria-pressed="false">Sama</button><button type="button" class="bevel-btn" data-i="${i}" data-v="0" aria-pressed="false">Beda</button></div></div>`).join("");
    const render = () => {
      $$(".item", box).forEach((d, i) => { press($$("button", d), state[i] == null ? "" : String(state[i])); d.classList.toggle("scored", state[i] === 1); });
      const n = state.filter((v) => v === 1).length, empty = state.filter((v) => v == null).length;
      $("#eppsConsOut").innerHTML = `<div class="result-row"><span>CONS = <b style="font-size:20px">${n}</b> / 15</span>${empty ? `<span>${empty} pasangan belum ditandai</span>` : ""}</div>
        <p style="margin:6px 0 0">Aturan dosen (≥ 10): ${n >= 10 ? '<span class="ok">dapat diinterpretasi</span>' : '<span class="err">meragukan, tidak perlu diinterpretasi</span>'} · Edwards (≥ 11): ${n >= 11 ? '<span class="ok">konsisten</span>' : '<span class="err">tafsirkan hati-hati / ulang tes</span>'}</p>`;
    };
    box.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; state[b.dataset.i] = Number(b.dataset.v); render(); });
    $("#eppsConsAll").addEventListener("click", () => { state.fill(1); render(); });
    $("#eppsConsReset").addEventListener("click", () => { state.fill(null); render(); });
    render();
  });

  /* ================= PAPI ================= */
  safe("papi", () => {
    const papiBody = $("#papiTableBody");
    if (!papiBody) return;
    papiBody.innerHTML = PAPI.map((g) =>
      `<tr class="group"><td colspan="3">${g.group.toUpperCase()}</td></tr>` +
      g.items.map((it) => `<tr><td><span class="code">${it[0]}</span></td><td>${it[1]} <span style="color:var(--ink-3)">(${it[2]})</span></td><td><span class="tag ${it[3] === "Need" ? "need" : "role"}">${it[3]}</span></td></tr>`).join("")
    ).join("");
    const ib = $("#papiInterpBody");
    if (ib) ib.innerHTML = PAPI_FLAT.map((it) => `<tr><th scope="row"><span class="code">${it.code}</span> ${it.name}</th><td>${PAPI_INTERP[it.code].map((r) => `<b>${r[0]}:</b> ${r[3]}`).join("<br>")}</td></tr>`).join("");
    const box = $("#papiInputs");
    PAPI.forEach((g) => {
      const fs = document.createElement("fieldset");
      fs.className = "papi-group";
      fs.innerHTML = `<legend>${g.group.toUpperCase()}</legend><div class="row">${g.items.map((it) =>
        `<div class="field"><label for="pp${it[0]}">${it[0]} <span style="color:var(--ink-3)">${it[3] === "Need" ? "N" : "R"}</span></label><input id="pp${it[0]}" type="number" min="0" max="9" inputmode="numeric" value="${PAPI_LEADER[it[0]]}" aria-label="${it[1]}"></div>`).join("")}</div>`;
      box.appendChild(fs);
    });
    const cat = (v) => (v <= 3 ? "rendah" : v <= 5 ? "sedang" : "tinggi");
    const calc = () => {
      const sc = {};
      PAPI_FLAT.forEach((it) => { const v = $("#pp" + it.code).value.trim(); sc[it.code] = v === "" ? 0 : Math.max(0, Math.min(9, Math.round(Number(v)) || 0)); });
      drawWheel($("#papiWheel"), sc, false);
      const sum = Object.values(sc).reduce((a, b) => a + b, 0);
      const roles = PAPI_ROLES.reduce((a, k) => a + sc[k], 0), needs = PAPI_NEEDS.reduce((a, k) => a + sc[k], 0);
      const hi = PAPI_FLAT.filter((it) => sc[it.code] >= 6).map((it) => it.code);
      let pattern = "";
      if (sc.L >= 6 && sc.P >= 6 && sc.I >= 6) pattern = "Pola L, P, I tinggi: mau memimpin, ingin mengarahkan orang lain, dan cepat memutuskan.";
      else if (sc.L <= 3 && sc.W >= 6 && sc.F >= 6) pattern = "Pola L rendah dengan W dan F tinggi: lebih nyaman sebagai pelaksana dengan arahan jelas.";
      const ok = (v, t) => (v === t ? `<span class="ok">✓ ${v}</span>` : `<span class="err">✗ ${v} (harus ${t})</span>`);
      const interp = PAPI_FLAT.map((it) => { const m = papiMatch(it.code, sc[it.code]); return `<li><b>${it.code} = ${sc[it.code]}</b>: ${m.length ? m.join(" / ") : '<span style="color:var(--ink-3)">tidak ada keterangan untuk skor ini di slide</span>'}</li>`; }).join("");
      $("#papiResult").innerHTML = `
        <div class="result-row"><span>Roles: ${ok(roles, 45)}</span><span>Needs: ${ok(needs, 45)}</span><span>Total: ${ok(sum, 90)}</span></div>
        <p style="margin:8px 0 0">Aspek tinggi (6–9): <b>${hi.join(", ") || "-"}</b></p>
        ${pattern ? `<p style="margin:6px 0 0" class="pill top">${pattern}</p>` : ""}
        <p style="margin:6px 0 0;font-size:13px;color:var(--ink-3)">Kategori umum: ${PAPI_FLAT.map((it) => `${it.code} ${cat(sc[it.code])}`).join(" · ")}</p>
        <details style="margin-top:8px"><summary style="cursor:pointer;font-weight:600">Keterangan per aspek (materi dosen)</summary><ul class="bullets" style="margin-top:8px;font-size:13.5px">${interp}</ul></details>`;
    };
    box.addEventListener("input", calc);
    const fill = (obj) => { PAPI_FLAT.forEach((it) => ($("#pp" + it.code).value = obj[it.code])); calc(); };
    $("#papiExample").addEventListener("click", () => fill(PAPI_LEADER));
    $("#papiExample2").addEventListener("click", () => fill(PAPI_EXEC));
    calc();
  });

  /* ================= DISC ================= */
  safe("disc", () => {
    const discBody = $("#discBody");
    if (!discBody) return;
    const DIM = ["D", "I", "S", "C", "*"];
    const EX = { M: [7, 5, 6, 4, 2], L: [3, 6, 5, 7, 3] };
    const row = (key, label) => `<tr><th scope="row">${label}</th>${DIM.map((d, i) => `<td><input class="inp" id="ds${key}${i}" type="number" min="0" max="24" inputmode="numeric" value="${EX[key][i]}" aria-label="${label} ${d}"></td>`).join("")}<td class="num" id="ds${key}T"></td></tr>`;
    discBody.innerHTML = row("M", "Most (M)") + row("L", "Least (L)") + `<tr><th scope="row">Change (M−L)</th>${DIM.map((d, i) => `<td class="num" id="dsC${i}">${i === 4 ? "—" : ""}</td>`).join("")}<td></td></tr>`;
    const bars = $("#discBars");
    bars.innerHTML = DIM.slice(0, 4).map((d, i) => `<div class="bar-row"><b>${d}</b><div class="bar-track center"><div class="bar-fill" id="dsB${i}"></div></div><span class="val" id="dsV${i}"></span></div>`).join("");
    const list = $("#discPatterns"), find = $("#discFind");
    let hitCode = "";
    const renderPatterns = () => {
      const q = (find.value || "").trim().toLowerCase();
      list.innerHTML = DISC_PATTERNS.filter(([c, n]) => !q || c.toLowerCase().includes(q) || n.toLowerCase().includes(q))
        .map(([c, n]) => `<li class="${c === hitCode ? "hit" : ""}"><b>${c}</b><span>${n}</span></li>`).join("") || "<li>Tidak ditemukan</li>";
    };
    find.addEventListener("input", renderPatterns);
    const calc = () => {
      const get = (k) => DIM.map((_, i) => { const v = Number($(`#ds${k}${i}`).value); return isFinite(v) && v > 0 ? Math.round(v) : 0; });
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
      const order = [0, 1, 2, 3].sort((a, b) => ch[b] - ch[a] || a - b);
      const ok = tM === 24 && tL === 24;
      // pattern: dimensions above midline (Change > 0), highest first, max 3
      let pos = order.filter((i) => ch[i] > 0).slice(0, 3).map((i) => DIM[i]);
      if (!pos.length) pos = [DIM[order[0]]];
      let code = pos.join("");
      while (code.length > 1 && !DISC_MAP[code]) code = code.slice(0, -1);
      hitCode = ok ? code : "";
      renderPatterns();
      $("#discResult").innerHTML = `
        <div class="result-row">
          <span>M: <b>${tM}</b> ${tM === 24 ? '<span class="ok">✓</span>' : '<span class="err">✗ harus 24</span>'}</span>
          <span>L: <b>${tL}</b> ${tL === 24 ? '<span class="ok">✓</span>' : '<span class="err">✗ harus 24</span>'}</span>
        </div>
        ${ok ? `<p style="margin:8px 0 0">Grafik III: gaya utama <span class="pill top">${DIM[order[0]]}</span> gaya pendukung <span class="pill">${DIM[order[1]]}</span></p>
        <p style="margin:6px 0 0">Perkiraan pola: <b>${code}</b> — ${DISC_MAP[code] || "-"}</p>` : '<p style="margin:8px 0 0">Perbaiki total M dan L terlebih dahulu.</p>'}`;
    };
    discBody.addEventListener("input", calc);
    $("#discExample").addEventListener("click", () => { ["M", "L"].forEach((k) => EX[k].forEach((v, i) => ($(`#ds${k}${i}`).value = v))); calc(); });
    calc();
  });

  /* ================= RIASEC ================= */
  safe("riasec", () => {
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
        RIASEC.forEach((k) => { const v = $("#hx" + k).value.trim(); sc[k] = v === "" ? 0 : Number(v) || 0; });
        const order = RIASEC.slice().sort((a, b) => sc[b] - sc[a] || RIASEC.indexOf(a) - RIASEC.indexOf(b));
        const code = order.slice(0, 3);
        drawHex($("#hexSvg"), sc, code);
        const d = Math.abs(RIASEC.indexOf(code[0]) - RIASEC.indexOf(code[1]));
        const dist = Math.min(d, 6 - d);
        const kons = dist === 1 ? "tinggi (bersebelahan)" : dist === 2 ? "sedang (terpisah satu tipe)" : "rendah (berseberangan)";
        const vals = RIASEC.map((k) => sc[k]);
        const diff = Math.max(...vals) - Math.min(...vals);
        const ties = sc[order[2]] === sc[order[3]] || sc[order[0]] === sc[order[1]] || sc[order[1]] === sc[order[2]];
        $("#hexResult").innerHTML = `
          <div class="result-row" style="align-items:center"><span class="big-code" style="font-size:40px">${code.join("")}</span>
          <span style="flex:1;min-width:180px">Konsistensi ${code[0]}–${code[1]}: <b>${kons}</b><br>Diferensiasi: ${Math.max(...vals)} − ${Math.min(...vals)} = <b>${diff}</b></span></div>
          ${ties ? '<p style="margin:8px 0 0" class="err">Ada skor kembar di tiga besar. Periksa kembali sebelum menetapkan kode.</p>' : ""}`;
      };
      hexIn.addEventListener("input", calc);
      calc();
    }
    // tabs with lecturer's type details
    const tabs = $("#riasecTabs"), panels = $("#riasecPanels");
    if (!tabs) return;
    tabs.innerHTML = RIASEC.map((k, i) => `<button type="button" role="tab" id="rt-${k}" aria-controls="rp-${k}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${k} · ${RIASEC_NAMES[k]}</button>`).join("");
    panels.innerHTML = RIASEC.map((k, i) => {
      const d = RIASEC_DETAIL[k];
      return `<div class="tab-panel" role="tabpanel" id="rp-${k}" aria-labelledby="rt-${k}" ${i === 0 ? "" : "hidden"}>
        <p style="margin:0 0 10px"><span class="big-code" style="font-size:30px;padding:0 10px">${k}</span> <b style="font-family:var(--f-display);font-size:18px;margin-left:8px">${RIASEC_NAMES[k]}</b> <span style="color:var(--ink-3)">${d[0]}</span></p>
        <div class="kv"><div><b>DESKRIPSI BIDANG MINAT</b>${d[1]}</div><div><b>KETERAMPILAN KUNCI</b>${d[2]}</div><div><b>CONTOH PEKERJAAN</b>${d[3]}</div><div><b>MATA PELAJARAN PENDUKUNG</b>${d[4]}</div></div></div>`;
    }).join("");
    const btns = $$("button", tabs);
    const select = (i, focus) => {
      btns.forEach((b, j) => { b.setAttribute("aria-selected", String(i === j)); b.tabIndex = i === j ? 0 : -1; });
      $$(".tab-panel", panels).forEach((p, j) => (p.hidden = i !== j));
      if (focus) btns[i].focus();
    };
    tabs.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) select(btns.indexOf(b)); });
    tabs.addEventListener("keydown", (e) => {
      const i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      if (e.key === "ArrowRight") { e.preventDefault(); select((i + 1) % btns.length, true); }
      if (e.key === "ArrowLeft") { e.preventDefault(); select((i - 1 + btns.length) % btns.length, true); }
    });
  });

  /* ================= MBTI ================= */
  safe("mbti", () => {
    const pick = $("#mbtiPickers");
    if (!pick) return;
    const DIMS = [["E", "I", "ENERGI"], ["S", "N", "INFORMASI"], ["T", "F", "KEPUTUSAN"], ["J", "P", "ORIENTASI"]];
    const NAMES = { S: "Sensing", N: "Intuition", T: "Thinking", F: "Feeling" };
    const state = ["I", "N", "T", "J"];
    DIMS.forEach((d, i) => {
      const g = document.createElement("div");
      g.className = "seg"; g.setAttribute("role", "group"); g.setAttribute("aria-label", d[2]);
      g.innerHTML = `<button type="button" class="bevel-btn" data-i="${i}" data-v="${d[0]}">${d[0]}</button><button type="button" class="bevel-btn" data-i="${i}" data-v="${d[1]}">${d[1]}</button><small>${d[2]}</small>`;
      pick.appendChild(g);
    });
    const grid = $("#typeGrid");
    if (grid) grid.innerHTML = MBTI_ORDER.map((t) => `<button type="button" data-t="${t}" aria-pressed="false"><b>${t}</b><span>${MBTI_TYPES[t][0]}</span></button>`).join("");
    const render = () => {
      $$("button", pick).forEach((b) => b.setAttribute("aria-pressed", String(state[b.dataset.i] === b.dataset.v)));
      const [ei, sn, tf, jp] = state;
      const ext = jp === "J" ? tf : sn;
      const intr = jp === "J" ? sn : tf;
      const dom = ei === "E" ? ext + "e" : intr + "i";
      const aux = ei === "E" ? intr + "i" : ext + "e";
      const type = state.join("");
      $("#mbtiType").textContent = type;
      $("#mbtiDom").textContent = dom;
      $("#mbtiAux").textContent = aux;
      $("#mbtiDomTxt").textContent = `${NAMES[dom[0]]}, ${dom[1] === "e" ? "diekstraversikan" : "diintroversikan"}`;
      $("#mbtiAuxTxt").textContent = `${NAMES[aux[0]]}, ${aux[1] === "e" ? "diekstraversikan" : "diintroversikan"}`;
      $("#mbtiNote").innerHTML = `${jp} → fungsi ${jp === "J" ? "penilaian" : "persepsi"} <b>${ext}</b> dipakai di dunia luar (${ext}e). Tipe ${ei} → dominan adalah fungsi yang ${ei === "E" ? "diekstraversikan" : "diintroversikan"}.`;
      if (grid) {
        $$("button", grid).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.t === type)));
        const d = MBTI_TYPES[type];
        $("#typeDetail").innerHTML = `<h4>${type} — ${d[0]} <span style="font-family:var(--f-pixel);font-size:11px;font-weight:400;color:var(--blue)">DOMINAN ${dom} · PENDUKUNG ${aux}</span></h4><ul class="bullets">${d[1].map((x) => `<li>${x}</li>`).join("")}</ul>`;
      }
    };
    pick.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; state[b.dataset.i] = b.dataset.v; render(); });
    if (grid) grid.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; b.dataset.t.split("").forEach((ch, i) => (state[i] = ch)); render(); });
    render();
  });

  /* ================= PSI ================= */
  safe("psi", () => {
    const grid = $("#psiGrid");
    if (!grid) return;
    const SUB = [
      ["Concern about what others think", "soc"], ["Perfectionism/self-criticism", "aut"], ["Dependency", "soc"],
      ["Need for control", "aut"], ["Pleasing others", "soc"], ["Defensive separation", "aut"],
    ];
    const tag = (n) => SUB[(n - 1) % 6][1] === "soc" ? "So" : "Au";
    let html = "";
    for (let n = 1; n <= 60; n++) html += `<div class="field"><label for="psi${n}">${n}<span style="color:var(--ink-3)"> ${tag(n)}</span></label><input id="psi${n}" type="number" min="1" max="6" inputmode="numeric" aria-label="Aitem ${n}"></div>`;
    grid.innerHTML = html;
    const calc = () => {
      const v = []; let filled = 0, bad = 0;
      for (let n = 1; n <= 60; n++) {
        const inp = $("#psi" + n);
        const raw = inp.value.trim();
        const x = raw === "" ? null : Number(raw);
        const invalid = x != null && (!Number.isInteger(x) || x < 1 || x > 6);
        inp.style.background = invalid ? "#ffd9d2" : "";
        if (invalid) bad++;
        if (x != null && !invalid) filled++;
        v[n] = invalid ? null : x;
      }
      const sums = SUB.map((_, s) => { let t = 0; for (let n = s + 1; n <= 60; n += 6) t += v[n] || 0; return t; });
      const soc = sums[0] + sums[2] + sums[4], aut = sums[1] + sums[3] + sums[5];
      const complete = filled === 60;
      const zS = (soc - 127.65) / 18.36, zA = (aut - 117.27) / 17.29;
      const pos = (z) => (z > 1 ? "di atas rerata sampel norma (> +1 SD)" : z < -1 ? "di bawah rerata sampel norma (< −1 SD)" : "sekitar rerata sampel norma (±1 SD)");
      $("#psiOut").innerHTML = `
        <div class="score-cards">${SUB.map((s, i) => `<div class="score-card"><span>${s[1] === "soc" ? "SOCIOTROPY" : "AUTONOMY"}</span><b>${sums[i]}</b><small>${s[0]} (10–60)</small></div>`).join("")}</div>
        <div class="score-cards">
          <div class="score-card ${complete && zS > 1 ? "hi" : ""}"><span>TOTAL SOCIOTROPY (30–180)</span><b>${soc}</b><small>${complete ? `z = ${fmt2(zS)}, ${pos(zS)}` : "lengkapi 60 aitem"}</small></div>
          <div class="score-card ${complete && zA > 1 ? "hi" : ""}"><span>TOTAL AUTONOMY (30–180)</span><b>${aut}</b><small>${complete ? `z = ${fmt2(zA)}, ${pos(zA)}` : "lengkapi 60 aitem"}</small></div>
        </div>
        <p class="mode-note">${filled}/60 terisi${bad ? ` · <span class="err">${bad} nilai di luar 1–6</span>` : ""}. Norma: pasien psikiatrik depresi (sociotropy 127,65 ± 18,36; autonomy 117,27 ± 17,29). Perbandingan ini hanya untuk latihan, bukan diagnosis.</p>`;
    };
    grid.addEventListener("input", calc);
    $("#psiExample").addEventListener("click", () => {
      let seed = 7;
      for (let n = 1; n <= 60; n++) { seed = (seed * 9301 + 49297) % 233280; $("#psi" + n).value = 1 + Math.floor((seed / 233280) * 6); }
      calc();
    });
    $("#psiClear").addEventListener("click", () => { for (let n = 1; n <= 60; n++) $("#psi" + n).value = ""; calc(); });
    calc();
  });

  /* ================= EIS ================= */
  safe("eis", () => {
    const eisGrid = $("#eisGrid");
    if (!eisGrid) return;
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
        press($$("button", d), ans[i] || "");
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
  });

  /* ================= ASRI ================= */
  safe("asri", () => {
    const grid = $("#asriGrid");
    if (!grid) return;
    const TRUE_KEYED = new Set([1, 3, 4, 9, 13, 15, 16, 18, 19, 20, 22, 24]);
    const ans = new Array(26).fill(null);
    let html = "";
    for (let n = 1; n <= 25; n++) html += `<div class="item"><span class="no"><span>No. ${n}</span><i>${TRUE_KEYED.has(n) ? "kunci B" : "kunci S"}</i></span><div class="opts" role="group" aria-label="Aitem ${n}"><button type="button" class="bevel-btn" data-n="${n}" data-v="B" aria-pressed="false">B</button><button type="button" class="bevel-btn" data-n="${n}" data-v="S" aria-pressed="false">S</button></div></div>`;
    grid.innerHTML = html;
    const render = () => {
      let score = 0, empty = 0;
      $$(".item", grid).forEach((d, i) => {
        const n = i + 1;
        press($$("button", d), ans[n] || "");
        const hit = ans[n] && ((TRUE_KEYED.has(n) && ans[n] === "B") || (!TRUE_KEYED.has(n) && ans[n] === "S"));
        d.classList.toggle("scored", !!hit);
        if (hit) score++;
        if (!ans[n]) empty++;
      });
      $("#asriOut").innerHTML = `<div class="result-row"><span>Skor asertivitas: <b style="font-size:20px">${score}</b> / 25</span>${empty ? `<span>${empty} nomor belum dijawab</span>` : ""}</div>
        <p class="mode-note">Pembanding: rerata sampel mahasiswa Corcoran ±9,5–10,7. Skor makin tinggi = asertivitas makin tinggi.</p>`;
    };
    grid.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; ans[Number(b.dataset.n)] = b.dataset.v; render(); });
    $("#asriReset").addEventListener("click", () => { ans.fill(null); render(); });
    render();
  });

  /* ================= ESLI ================= */
  safe("esli", () => {
    const t = $("#esliTable");
    if (!t) return;
    let html = `<thead><tr><th scope="col">Aitem</th><th scope="col">Set 1: benar dalam hidup saya</th><th scope="col">Set 2: yang saya rasakan</th></tr></thead><tbody>`;
    for (let n = 1; n <= 15; n++) html += `<tr><th scope="row">No. ${n} <span style="color:var(--ink-3)">${n <= 8 ? "(1–8)" : "(9–15)"}</span></th><td><input type="number" min="0" max="3" inputmode="numeric" data-n="${n}" data-s="1" aria-label="Aitem ${n} set 1"></td><td><input type="number" min="0" max="3" inputmode="numeric" data-n="${n}" data-s="2" aria-label="Aitem ${n} set 2"></td></tr>`;
    t.innerHTML = html + "</tbody>";
    const SUBS = [
      ["Social loneliness", 1, 1, 8, 7.0, 11.9], ["Emotional loneliness", 2, 1, 8, 8.4, 14.0],
      ["Social isolation", 1, 9, 15, 7.3, 11.0], ["Emotional isolation", 2, 9, 15, 5.3, 12.0],
    ];
    const calc = () => {
      let filled = 0, bad = 0;
      const val = {};
      $$("input", t).forEach((inp) => {
        const raw = inp.value.trim();
        const x = raw === "" ? null : Number(raw);
        const invalid = x != null && (!Number.isInteger(x) || x < 0 || x > 3);
        inp.closest("td").classList.toggle("bad", invalid);
        if (invalid) bad++; else if (x != null) filled++;
        val[inp.dataset.n + "-" + inp.dataset.s] = invalid ? null : x;
      });
      const res = SUBS.map(([name, s, a, b, m, clin]) => {
        let sum = 0; for (let n = a; n <= b; n++) sum += val[n + "-" + s] || 0;
        return { name, sum, max: (b - a + 1) * 3, m, clin };
      });
      $("#esliOut").innerHTML = `<div class="score-cards">${res.map((r) => `<div class="score-card ${filled === 30 && r.sum >= r.clin ? "hi" : ""}"><span>${r.name.toUpperCase()}</span><b>${r.sum}</b><small>rentang 0–${r.max} · rerata nonklinis ${fmt(r.m.toFixed(1))} · klinis ${fmt(r.clin.toFixed(1))}</small></div>`).join("")}</div>
        <p class="mode-note">${filled}/30 respons terisi${bad ? ` · <span class="err">${bad} nilai di luar 0–3</span>` : ""}. Skala: Usually true 3, Often 2, Sometimes 1, Rarely 0. Kartu merah = setara atau di atas rerata kelompok klinis.</p>`;
    };
    t.addEventListener("input", calc);
    $("#esliClear").addEventListener("click", () => { $$("input", t).forEach((i) => (i.value = "")); calc(); });
    calc();
  });

  /* ================= YA-SSI ================= */
  safe("yassi", () => {
    const g = $("#yassiGrid");
    if (!g) return;
    const SOURCES = ["Orang tua", "Saudara kandung", "Kerabat lain", "Teman SMA", "Teman kuliah", "Rekan kerja", "Kelompok keagamaan", "Kesehatan spiritual", "Dosen/konselor/administrator", "Profesional/penyedia layanan", "Kelompok khusus", "Bacaan, TV, musik", "Lainnya"];
    const SECTIONS = ["I. Dicintai/diperhatikan", "II. Dihargai/dihormati", "III. Rasa percaya/aman (give & take)", "IV. Teman bicara/berpikir", "V. Senang bisa membantu"];
    const ans = {};
    g.innerHTML = SECTIONS.map((s, si) => `<h4 style="margin:${si ? 14 : 0}px 0 6px">${s} <span class="src sum">${13 + si * 13}–${25 + si * 13}</span></h4><div class="item-grid">${SOURCES.map((src, k) => {
      const n = 13 + si * 13 + k;
      return `<div class="item"><span class="no"><span>No. ${n}</span></span><div style="font-size:11.5px;line-height:1.25;margin-bottom:4px;min-height:2.5em">${src}</div><div class="opts" role="group" aria-label="Aitem ${n} ${src}"><button type="button" class="bevel-btn" data-n="${n}" data-v="1" aria-pressed="false" title="No">1</button><button type="button" class="bevel-btn" data-n="${n}" data-v="2" aria-pressed="false" title="Yes">2</button><button type="button" class="bevel-btn" data-n="${n}" data-v="3" aria-pressed="false" title="Yes a lot">3</button></div></div>`;
    }).join("")}</div>`).join("");
    const render = () => {
      $$(".item", g).forEach((d) => { const b0 = d.querySelector("button"); press($$("button", d), ans[b0.dataset.n] ? String(ans[b0.dataset.n]) : ""); });
      const nums = Object.keys(ans).map(Number);
      const total = nums.reduce((s, n) => s + ans[n], 0);
      const secs = SECTIONS.map((_, si) => { let t = 0; for (let n = 13 + si * 13; n < 26 + si * 13; n++) t += ans[n] || 0; return t; });
      const done = nums.length;
      $("#yassiOut").innerHTML = `<div class="score-cards">${secs.map((v, i) => `<div class="score-card"><span>BAGIAN ${["I", "II", "III", "IV", "V"][i]}</span><b>${v}</b><small>13–39</small></div>`).join("")}
        <div class="score-card" style="background:var(--lime)"><span>SKOR TOTAL</span><b>${total}</b><small>${done}/65 terisi · rentang 65–195</small></div></div>
        <p class="mode-note">1 = No, 2 = Yes, 3 = Yes a lot. Aitem 1–12 tidak diskor. Rerata norma mahasiswa (Corcoran): 135,49–145,4.</p>`;
    };
    g.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; ans[b.dataset.n] = Number(b.dataset.v); render(); });
    $("#yassiClear").addEventListener("click", () => { Object.keys(ans).forEach((k) => delete ans[k]); render(); });
    render();
  });

  /* ================= CHECKLIST ================= */
  safe("checklist", () => {
    const cl = $("#checklist");
    if (!cl) return;
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
  });

  /* ================= WORKSHEET ================= */
  safe("worksheet", () => {
    const form = $("#wsForm");
    if (!form) return;
    const QS = [
      "Jelaskan mengenai alat tes yang telah dipelajari!",
      "Bagaimana hasil yang diperoleh dari alat tes tersebut?",
      "Uraikan gambaran kegiatan praktikum (yang dilakukan di lab) dengan materi yang sudah Anda dapatkan di kelas!",
      "Bagaimana perasaan Anda mengenai praktikum yang sudah dilakukan?",
      "Hal-hal apa saja yang telah Anda ketahui mengenai materi tersebut?",
    ];
    form.innerHTML = QS.map((q, i) => `<div class="ws-q"><label for="wsq${i}">${i + 1}. ${q}</label><textarea id="wsq${i}" data-i="${i}"></textarea></div>`).join("");
    const meet = $("#wsMeet"), tool = $("#wsTool"), status = $("#wsStatus");
    const key = () => "inv-ws-" + meet.value;
    const load = () => {
      let d = {};
      try { d = JSON.parse(store.get(key()) || "{}") || {}; } catch (e) { d = {}; }
      tool.value = d.tool || "";
      QS.forEach((_, i) => ($("#wsq" + i).value = (d.a && d.a[i]) || ""));
      status.textContent = d.t ? "Tersimpan " + new Date(d.t).toLocaleString("id-ID") : "";
    };
    let timer;
    const save = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const d = { tool: tool.value, a: QS.map((_, i) => $("#wsq" + i).value), t: Date.now() };
        store.set(key(), JSON.stringify(d));
        status.textContent = "Tersimpan otomatis";
      }, 400);
    };
    form.addEventListener("input", save);
    tool.addEventListener("input", save);
    meet.addEventListener("change", () => { clearTimeout(timer); load(); });
    $("#wsCopy").addEventListener("click", async () => {
      const text = `LEMBAR KERJA TES INVENTORI — PERTEMUAN ${meet.value}\nMateri praktikum: ${tool.value}\n\n` + QS.map((q, i) => `${i + 1}. ${q}\n${$("#wsq" + i).value}\n`).join("\n");
      try { await navigator.clipboard.writeText(text); status.textContent = "Disalin ke clipboard"; }
      catch (e) {
        const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); status.textContent = "Disalin ke clipboard"; } catch (e2) { status.textContent = "Gagal menyalin, salin manual"; }
        ta.remove();
      }
    });
    $("#wsClear").addEventListener("click", () => {
      if (!window.confirm("Hapus draf pertemuan " + meet.value + "?")) return;
      clearTimeout(timer); store.del(key()); load(); status.textContent = "Draf dihapus";
    });
    load();
  });

  /* ================= SUMMARY FILTER ================= */
  safe("summary", () => {
    const sf = $("#sumFilter");
    if (sf) sf.addEventListener("change", () => {
      $$("#sumTable tbody tr").forEach((tr) => { tr.hidden = sf.value !== "all" && tr.dataset.f !== sf.value; });
    });
  });

  /* ================= QUIZ ================= */
  safe("quiz", () => {
    const QUIZ = [
      ["Inventori tergolong tes …", ["Performa tipikal", "Performa maksimal", "Kecepatan", "Bakat khusus"], 0, "Inventori mengukur kecenderungan (performa tipikal), bukan kemampuan maksimal (Urbina, 2004)."],
      ["Inventori pertama untuk menilai kepribadian individu adalah …", ["MMPI (1943)", "Woodworth Personal Data Sheet (1917)", "EPPS (1953)", "Rorschach (1921)"], 1, "Woodworth Personal Data Sheet (1917), dipakai pertama kali untuk kepentingan Perang Dunia I."],
      ["Berpura-pura memberi kesan buruk dalam self report disebut …", ["Faking good", "Social desirability", "Faking bad", "Acquiescence"], 2, "Faking good = kesan baik; faking bad = kesan buruk."],
      ["Format yang jumlah skor totalnya selalu tetap adalah …", ["Normatif", "Ipsatif", "Likert", "Benar-salah"], 1, "Format ipsatif memakai pilihan paksa atau peringkat, sehingga total skor selalu tetap."],
      ["Pada aitem unfavorable, jawaban 'sangat tidak setuju' diberi nilai …", ["1", "3", "5", "0"], 2, "Aitem unfavorable diberi nilai 5 untuk 'sangat tidak setuju'."],
      ["Jumlah seluruh skor kategori RMIB yang benar adalah …", ["78", "210", "702", "90"], 2, "9 daftar × 78 = 702. Bila tidak 702, ada kesalahan penyalinan."],
      ["Menurut dosen, bila dua kategori RMIB memiliki total sama, ranking ditentukan dari …", ["Rata-rata peringkat", "Kategori yang paling banyak angka terkecilnya", "Urutan abjad", "Pilihan bebas responden"], 1, "Materi dosen: ranking dipilih dari kolom yang paling banyak angka terkecilnya."],
      ["Ranking kelompok B RMIB dimasukkan ke form skoring mulai dari …", ["Baris Out", "Kotak bertanda bintang (baris Me)", "Baris Med", "Kolom Total"], 1, "Kelompok A sesuai aslinya; B mulai dari tanda bintang (baris Me), dan seterusnya bergeser satu."],
      ["Skor mentah satu kebutuhan EPPS dihitung dengan …", ["A di kolom k + B di baris k", "A di baris k + B di kolom k", "Jumlah sel diagonal", "Jumlah semua jawaban A"], 1, "r (A di baris k) + c (B di kolom k), sel bergaris merah (diagonal) diabaikan. Rentang 0–28."],
      ["Menurut materi dosen, konsistensi EPPS di bawah berapa dianggap meragukan?", ["5", "8", "10", "15"], 2, "Konsistensi di bawah 10 meragukan dan tidak perlu diinterpretasi (Edwards memakai ≥ 11)."],
      ["Pada lembar PAPI-I, total skor roles (G, L, I, T, V, S, R, D, C, E) harus …", ["45", "90", "20", "28"], 0, "Roles = 45 dan needs = 45, sehingga total 90."],
      ["Waktu pengerjaan DISC asli (24 item) menurut materi dosen adalah …", ["7 menit", "20 menit", "45 menit", "60 menit"], 0, "DISC asli 24 item dengan waktu 7 menit."],
      ["Grafik DISC yang memakai skor Change (M − L) adalah …", ["Grafik I (Mask)", "Grafik II (Core)", "Grafik III (Mirror)", "Semua grafik"], 2, "Grafik I memakai M, grafik II memakai L, grafik III memakai Change."],
      ["Skor SDS: R 18, I 35, A 22, S 30, E 15, C 20. Kode Hollandnya …", ["IAS", "ISA", "SIA", "RIC"], 1, "Tiga skor tertinggi berurutan: I (35), S (30), A (22)."],
      ["Julukan tipe Enterprising pada heksagon Holland adalah …", ["The Thinkers", "The Helpers", "The Persuaders", "The Organizers"], 2, "R Do-ers, I Thinkers, A Creators, S Helpers, E Persuaders, C Organizers."],
      ["Fungsi dominan tipe INTJ adalah …", ["Te", "Ne", "Ni", "Ti"], 2, "J membuat T diekstraversikan (Te). Tipe I → dominan fungsi yang diintroversikan: Ni."],
      ["Faktor HEXACO yang tidak ada di Big Five adalah …", ["Emotionality", "Honesty-Humility", "Openness", "Agreeableness"], 1, "HEXACO menambahkan Honesty-Humility; Neuroticism menjadi Emotionality."],
      ["Koefisien reliabilitas untuk aitem dikotomis seperti ASRI adalah …", ["Alfa Cronbach", "KR-20", "Tes ulang saja", "Korelasi aitem-total"], 1, "KR-20 untuk aitem dikotomis; alfa Cronbach untuk aitem berjenjang (ESLI, YA-SSI)."],
      ["Tahap Erikson yang menjadi dasar EIS adalah …", ["Intimacy vs Isolation", "Industry vs Inferiority", "Identity vs Confusion", "Trust vs Mistrust"], 2, "Tahap kelima (remaja): ego identity vs identity diffusion."],
      ["Dua belas aitem pertama YA-SSI …", ["Diberi bobot ganda", "Dibalik skornya", "Tidak diberi skor", "Hanya untuk faktor keluarga"], 2, "Aitem 1–12 berfungsi sebagai informasi pengantar tentang jaringan sosial responden."],
    ];
    const quiz = $("#quiz");
    if (!quiz) return;
    quiz.innerHTML = QUIZ.map((q, i) => `
      <div class="q-card"><fieldset>
        <legend><span class="qn">${String(i + 1).padStart(2, "0")}</span>${q[0]}</legend>
        <div class="q-opts">${q[1].map((o, j) => `<label><input type="radio" name="q${i}" value="${j}"><span>${o}</span></label>`).join("")}</div>
        <p class="q-explain">${q[3]}</p>
      </fieldset></div>`).join("");
    const lede = $("#kuis .lede");
    if (lede) lede.textContent = `${QUIZ.length} soal singkat dari materi di atas. Pilih jawaban, lalu tekan Periksa.`;
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
  });

  /* ================= TASKBAR / START MENU ================= */
  safe("taskbar", () => {
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
      if (open) { const f = $("a", sm); if (f) f.focus({ preventScroll: true }); }
    };
    sb.addEventListener("click", (e) => { e.stopPropagation(); openMenu(sm.hidden); });
    list.addEventListener("click", (e) => { if (e.target.closest("a")) openMenu(false); });
    document.addEventListener("click", (e) => { if (!sm.hidden && !sm.contains(e.target) && !sb.contains(e.target)) openMenu(false); });
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
      prog.style.width = (h > 0 ? Math.min(100, (scrollY / h) * 100) : 0) + "%";
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const clock = $("#clock");
    const tick = () => { const d = new Date(); clock.textContent = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
    tick(); setInterval(tick, 15000);
  });
})();
