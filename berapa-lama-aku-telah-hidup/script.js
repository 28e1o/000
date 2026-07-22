const MONTHS = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
];

const HARI = [
  'Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'
];

const GENERATIONS = [
  { name: 'Gen Beta',      start: 2025, end: Infinity },
  { name: 'Gen Alpha',     start: 2013, end: 2024 },
  { name: 'Gen Z',         start: 1997, end: 2012 },
  { name: 'Millennials',   start: 1981, end: 1996 },
  { name: 'Gen X',         start: 1965, end: 1980 },
  { name: 'Baby Boomers',  start: 1946, end: 1964 },
  { name: 'Silent Gen',    start: 1928, end: 1945 },
  { name: 'Greatest Gen',  start: 1901, end: 1927 },
  { name: 'Lost Gen',      start: 1883, end: 1900 },
];

function pad(n) { return String(n).padStart(2, '0'); }
function fmt(num) { return Number(num).toLocaleString('id-ID'); }

function cariGenerasi(tahun) {
  for (const g of GENERATIONS) {
    if (tahun >= g.start && tahun <= g.end) return g.name;
  }
  return '-';
}

function adjYear(delta) {
  const el = document.getElementById('birthdate');
  if (!el.value) {
    const d = new Date(); d.setFullYear(d.getFullYear() + delta);
    el.value = d.toISOString().split('T')[0];
    return;
  }
  const d = new Date(el.value);
  d.setFullYear(d.getFullYear() + delta);
  el.value = d.toISOString().split('T')[0];
}

function isVisible(id) {
  const el = document.getElementById(id);
  if (!el) return false;
  const lazy = el.closest('.lazy-section');
  return !lazy || lazy.classList.contains('visible');
}

function toggleTime() {
  document.getElementById('timeInputs').classList.toggle('show');
}

function kembali() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  document.getElementById('resultSection').style.display = 'none';
  document.getElementById('inputSection').style.display = '';
  document.getElementById('skeleton').classList.remove('sk-hidden');
}

function salinRingkasan() {
  const el = document.getElementById('msSummaryText');
  const teks = el.textContent;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(teks);
  } else {
    const ta = document.createElement('textarea');
    ta.value = teks;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  const btn = document.querySelector('.btn-ms-copy');
  btn.textContent = 'Tersalin!';
  btn.classList.add('copied');
  setTimeout(() => {
    btn.textContent = 'Salin';
    btn.classList.remove('copied');
  }, 2000);
}

let rafId = null;

function mulai() {
  const val = document.getElementById('birthdate').value;
  if (!val) return;

  let lahir;
  if (document.getElementById('timeCheck').checked) {
    const h = parseInt(document.getElementById('birthHour').value) || 0;
    const m = parseInt(document.getElementById('birthMin').value) || 0;
    lahir = new Date(val + `T${pad(h)}:${pad(m)}:00`);
  } else {
    lahir = new Date(val + 'T00:00:00');
  }
  if (isNaN(lahir)) return;

  document.getElementById('skeleton').classList.add('sk-hidden');
  document.getElementById('inputSection').style.display = 'none';
  const res = document.getElementById('resultSection');
  res.style.display = 'block';
  res.className = 'result show';

  if (rafId) cancelAnimationFrame(rafId);

  const generasi = cariGenerasi(lahir.getFullYear());

  const realtimeDefs = [
    { id: 'tahun',  label: 'Tahun' },
    { id: 'bulan',  label: 'Bulan' },
    { id: 'hari',   label: 'Hari' },
    { id: 'jam',    label: 'Jam' },
    { id: 'menit',  label: 'Menit' },
    { id: 'detik',  label: 'Detik' },
  ];

  document.getElementById('realtimeGrid').innerHTML = realtimeDefs.map(d =>
    `<div class="time-card"><div class="num" id="${d.id}">0</div><div class="lbl">${d.label}</div></div>`
  ).join('');

  const statDefs = [
    { id: 'totalMinggu', label: 'Minggu' },
    { id: 'totalHari',   label: 'Hari' },
    { id: 'totalJam',    label: 'Jam' },
    { id: 'totalMenit',  label: 'Menit' },
    { id: 'totalDetik',  label: 'Detik' },
  ];

  document.getElementById('statGrid').innerHTML = statDefs.map(d =>
    `<div class="stat-item"><div class="num" id="${d.id}">0</div><div class="lbl">${d.label}</div></div>`
  ).join('');

  const hariLahir = HARI[lahir.getDay()];
  const tglLahir = lahir.getDate();
  const tahun100 = lahir.getFullYear() + 100;

  const bioDefs = [
    { id: 'hariLahir',  label: 'Hari Lahir' },
    { id: 'generasi',   label: 'Generasi' },
    { id: 'usiaTepat',  label: 'Usia Tepat' },
    { id: 'tahun100',   label: '100 Tahun di' },
    { id: 'ultahBerikutnya', label: 'Ulang Tahun Ke' },
    { id: 'totalMs',    label: 'Total Milidetik' },
    { id: 'totalDt',    label: 'Total Detik' },
  ];

  document.getElementById('bioGrid').innerHTML = bioDefs.map(d =>
    `<div class="bio-item"><span class="lbl">${d.label}</span><span class="val" id="${d.id}">-</span></div>`
  ).join('');

  document.getElementById('countdownGrid').innerHTML = [
    { id: 'cdHari',  label: 'Hari' },
    { id: 'cdJam',   label: 'Jam' },
    { id: 'cdMenit', label: 'Menit' },
    { id: 'cdDetik', label: 'Detik' },
  ].map(d =>
    `<div class="countdown-card"><div class="num" id="${d.id}">0</div><div class="lbl">${d.label}</div></div>`
  ).join('');

  const milestoneDefs = [
    { id: 'ms1000hari', val: '1.000',  unit: 'Hari',  seconds: 1000 * 86400 },
    { id: 'ms10000jam', val: '10.000', unit: 'Jam',   seconds: 10000 * 3600 },
    { id: 'ms100000jam',val: '100.000',unit: 'Jam',   seconds: 100000 * 3600 },
    { id: 'ms1miliar',  val: '1 Miliar', unit: 'Detik', seconds: 1e9 },
    { id: 'ms10000hari',val: '10.000', unit: 'Hari',  seconds: 10000 * 86400 },
  ];
  document.getElementById('msGrid').innerHTML = milestoneDefs.map(m =>
    `<div class="ms-card"><div class="ms-val">${m.val}</div><div class="ms-lbl">${m.unit}</div><div class="ms-st" id="${m.id}">-</div></div>`
  ).join('');

  const tglStr = `${pad(tglLahir)} ${MONTHS[lahir.getMonth()]} ${lahir.getFullYear()}`;
  const jamStr = (document.getElementById('timeCheck').checked && (lahir.getHours() !== 0 || lahir.getMinutes() !== 0))
    ? ` pukul ${pad(lahir.getHours())}:${pad(lahir.getMinutes())} WIB`
    : '';
  document.getElementById('birthInfo').innerHTML =
    `Lahir: <span>${tglStr}${jamStr}</span>`;

  function update() {
    const now = new Date();
    const diff = now - lahir;
    const totalDetik = diff / 1000;

    const tahun = Math.floor(totalDetik / (365.25 * 86400));
    const sisaTahun = totalDetik % (365.25 * 86400);
    const hariTotal = Math.floor(sisaTahun / 86400);
    const sisaHari = sisaTahun % 86400;
    const jam = Math.floor(sisaHari / 3600);
    const sisaJam = sisaHari % 3600;
    const menit = Math.floor(sisaJam / 60);
    const detik = Math.floor(sisaJam % 60);

    const bulan = Math.floor(hariTotal / 30.4375);

    document.getElementById('tahun').textContent  = tahun;
    document.getElementById('bulan').textContent  = bulan;
    document.getElementById('hari').textContent   = hariTotal;
    document.getElementById('jam').textContent    = pad(jam);
    document.getElementById('menit').textContent  = pad(menit);
    document.getElementById('detik').textContent  = pad(detik);

    const totalHari   = totalDetik / 86400;
    const totalJam    = totalDetik / 3600;
    const totalMenit  = totalDetik / 60;

    if (isVisible('totalMinggu')) {
      document.getElementById('totalMinggu').textContent = fmt(Math.floor(totalHari / 7));
      document.getElementById('totalHari').textContent   = fmt(Math.floor(totalHari));
      document.getElementById('totalJam').textContent    = fmt(Math.floor(totalJam));
      document.getElementById('totalMenit').textContent  = fmt(Math.floor(totalMenit));
      document.getElementById('totalDetik').textContent  = fmt(Math.floor(totalDetik));
    }

    if (isVisible('hariLahir')) {
      document.getElementById('hariLahir').textContent      = hariLahir;
      document.getElementById('generasi').textContent       = generasi;
      document.getElementById('usiaTepat').textContent      = `${tahun} tahun ${bulan} bulan ${hariTotal} hari`;
      document.getElementById('tahun100').textContent       = tahun100;
      document.getElementById('totalMs').textContent        = fmt(Math.floor(diff));
      document.getElementById('totalDt').textContent        = fmt(Math.floor(totalDetik));
    }

    const ultahTahunIni = new Date(now.getFullYear(), lahir.getMonth(), lahir.getDate(),
      lahir.getHours(), lahir.getMinutes(), lahir.getSeconds());
    let ultahNext = ultahTahunIni;
    let ultahKe = now.getFullYear() - lahir.getFullYear();
    if (now < ultahTahunIni) {
      ultahKe--;
    } else {
      ultahNext = new Date(now.getFullYear() + 1, lahir.getMonth(), lahir.getDate(),
        lahir.getHours(), lahir.getMinutes(), lahir.getSeconds());
    }

    if (ultahKe < 0) ultahKe = 0;
    if (isVisible('hariLahir')) {
      document.getElementById('ultahBerikutnya').textContent = `Ke-${ultahKe + 1}`;
    }

    if (isVisible('cdHari')) {
      const sisaUltah = ultahNext - now;
      if (sisaUltah > 0) {
        document.getElementById('countdownWrap').className = 'countdown-wrap show';
        const cdTotalDetik = Math.floor(sisaUltah / 1000);
        const cdHari  = Math.floor(cdTotalDetik / 86400);
        const cdJam   = Math.floor((cdTotalDetik % 86400) / 3600);
        const cdMenit = Math.floor((cdTotalDetik % 3600) / 60);
        const cdDetik = cdTotalDetik % 60;
        document.getElementById('cdHari').textContent  = cdHari;
        document.getElementById('cdJam').textContent   = pad(cdJam);
        document.getElementById('cdMenit').textContent = pad(cdMenit);
        document.getElementById('cdDetik').textContent = pad(cdDetik);
      }
    }

    if (isVisible('progressPct')) {
      const startYear = new Date(now.getFullYear(), 0, 0);
      const yearEnd   = new Date(now.getFullYear() + 1, 0, 0);
      const yearProgress = ((now - startYear) / (yearEnd - startYear)) * 100;
      document.getElementById('progressPct').textContent = yearProgress.toFixed(4) + '%';
      document.getElementById('progressFill').style.width = yearProgress.toFixed(4) + '%';
    }

    if (isVisible('donutFill')) {
      const lifeExpectancy = 80;
      const usiaFraksi = tahun + (hariTotal / 365.25);
      const pct = Math.min((usiaFraksi / lifeExpectancy) * 100, 100);
      const circ = 2 * Math.PI * 52;
      const offset = circ - (circ * pct / 100);
      document.getElementById('donutFill').style.strokeDashoffset = offset;
      document.getElementById('donutPct').textContent = pct.toFixed(1) + '%';
    }

    if (isVisible('tlRoot')) {
      const age = tahun + (hariTotal / 365.25);
      const maxAge = 100;
      const milestones = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      const labelsContainer = document.getElementById('tlLabels');
      if (!labelsContainer.hasChildNodes()) {
        milestones.forEach(m => {
          const span = document.createElement('span');
          span.textContent = m;
          labelsContainer.appendChild(span);
        });
      }
      const pct = Math.min(age / maxAge * 100, 100);
      document.getElementById('tlFill').style.width = pct + '%';
      document.getElementById('tlPtr').style.left = pct + '%';
      document.getElementById('tlAge').textContent = Math.floor(age);
    }

    if (isVisible('msSummaryText')) {
      const teks = `Telah hidup selama ${tahun} tahun, ${bulan} bulan, ${hariTotal} hari, ${jam} jam, ${menit} menit. Setara dengan ${fmt(Math.floor(totalHari / 7))} minggu, ${fmt(Math.floor(totalHari))} hari, ${fmt(Math.floor(totalJam))} jam, atau ${fmt(Math.floor(totalMenit))} menit.`;
      document.getElementById('msSummaryText').textContent = teks;
    }

    if (isVisible('ms1000hari')) {
      milestoneDefs.forEach(m => {
        const el = document.getElementById(m.id);
        if (totalDetik >= m.seconds) {
          const tgl = new Date(lahir.getTime() + m.seconds * 1000);
          const tglStr = `${pad(tgl.getDate())} ${MONTHS[tgl.getMonth()]} ${tgl.getFullYear()}`;
          el.className = 'ms-st done';
          el.textContent = 'Tercapai ' + tglStr;
        } else {
          const sisa = m.seconds - totalDetik;
          const h = Math.floor(sisa / 86400);
          const j = Math.floor((sisa % 86400) / 3600);
          const mn = Math.floor((sisa % 3600) / 60);
          const d = Math.floor(sisa % 60);
          el.className = 'ms-st wait';
          el.textContent = `${h}h ${j}j ${mn}m ${d}d`;
        }
      });
    }
  }

  const lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        lazyObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '50px' });
  document.querySelectorAll('.lazy-section').forEach(el => lazyObserver.observe(el));

  update();
  function frame() { update(); rafId = requestAnimationFrame(frame); }
  rafId = requestAnimationFrame(frame);
}