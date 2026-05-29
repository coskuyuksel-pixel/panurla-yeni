/* PAN URLA - kucuk etkilesim katmani */
(function () {
  "use strict";

  // 1) Header scroll arka plani
  const header = document.querySelector(".site-header");
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // 2) Mobil menu
  const toggle = document.querySelector(".nav-toggle");
  const list   = document.querySelector(".nav-list");
  if (toggle && list) {
    toggle.addEventListener("click", () => {
      const open = list.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    list.querySelectorAll("a").forEach(a =>
      a.addEventListener("click", () => list.classList.remove("is-open"))
    );
  }

  // 3) Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  // 4) Musaitlik formu - secimleri HotelRunner BV3 arama URL'ine tasi
  const form = document.getElementById("availability-form");
  if (form) {
    const checkin  = document.getElementById("checkin");
    const checkout = document.getElementById("checkout");
    const guests   = document.getElementById("guests");

    const today = new Date().toISOString().split("T")[0];
    if (checkin)  checkin.min  = today;
    if (checkout) checkout.min = today;
    if (checkin && checkout) {
      checkin.addEventListener("change", () => {
        checkout.min = checkin.value || today;
        if (checkout.value && checkout.value <= checkin.value) {
          const next = new Date(checkin.value);
          next.setDate(next.getDate() + 1);
          checkout.value = next.toISOString().split("T")[0];
        }
      });
    }

    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const base = "https://pan-urla-wooden-house.hotelrunner.com/bv3/search";
      const opt  = guests && guests.options[guests.selectedIndex];
      const adult = opt ? (opt.dataset.adult || "2") : "2";
      const child = opt ? (opt.dataset.child || "0") : "0";
      const total = String(Number(adult) + Number(child));

      const p = new URLSearchParams();
      p.set("locale", "tr");
      if (checkin  && checkin.value)  p.set("checkin_date",  checkin.value);
      if (checkout && checkout.value) p.set("checkout_date", checkout.value);
      p.set("guest_rooms[0][adult_count]", adult);
      p.set("guest_rooms[0][child_count]", child);
      p.set("guest_rooms[0][guest_count]", total);
      p.set("rooms[count]", "1");
      p.set("search_made", "true");

      window.open(`${base}?${p.toString()}`, "_blank", "noopener");
    });
  }

  // 5) Yil
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // 6) KITAP MODU v2 - video katmanli
  const openBtn  = document.getElementById("open-book");
  const modal    = document.getElementById("book-modal");
  if (!openBtn || !modal) return;

  const closeBtn  = document.getElementById("book-close");
  const frame     = document.getElementById("book-frame");
  const vOpen     = document.getElementById("vid-open");
  const vIdle     = document.getElementById("vid-idle");
  const vFlip     = document.getElementById("vid-flip");
  const slot      = document.getElementById("photo-slot");
  const photoImg  = document.getElementById("photo-img");
  const coverText = document.getElementById("cover-text");
  const prevBtn   = document.getElementById("book-prev");
  const nextBtn   = document.getElementById("book-next");
  const counter   = document.getElementById("book-counter");
  let lastFocused = null;

  const photoUrls = Array.from(document.querySelectorAll(".gallery a"))
    .map(a => a.getAttribute("href"))
    .filter(Boolean);

  let idx = 0;
  let phase = "cover";
  let busy = false;

  function setActive(v) {
    [vOpen, vIdle, vFlip].forEach(x => x && x.classList.toggle("is-active", x === v));
  }

  function showPhoto(i) {
    if (!photoUrls.length) return;
    photoImg.src = photoUrls[(i + photoUrls.length) % photoUrls.length];
    photoImg.alt = "Pan Urla galeri gorseli " + ((i % photoUrls.length) + 1);
    slot.classList.remove("is-visible");
    void slot.offsetWidth;
    slot.classList.add("is-visible");
    counter.textContent = `${(i % photoUrls.length) + 1} / ${photoUrls.length}`;
  }

  function startOpen() {
    phase = "opening"; busy = true;
    coverText.classList.add("is-hidden");
    setActive(vOpen);
    vOpen.currentTime = 0;
    vOpen.play().catch(()=>{});
    requestAnimationFrame(() => frame.classList.add("is-zoomed"));
    vOpen.onended = () => {
      phase = "idle"; busy = false;
      setActive(vIdle);
      vIdle.currentTime = 0;
      vIdle.play().catch(()=>{});
      showPhoto(idx);
    };
  }

  function flipNext(dir = 1) {
    if (busy) return;
    if (phase === "cover") { startOpen(); return; }
    if (phase !== "idle") return;
    busy = true;
    slot.classList.remove("is-visible");
    setActive(vFlip);
    vFlip.currentTime = 0;
    vFlip.play().catch(()=>{});

    const swap = () => {
      idx = (idx + dir + photoUrls.length) % photoUrls.length;
      setActive(vIdle);
      vIdle.currentTime = 0;
      vIdle.play().catch(()=>{});
      showPhoto(idx);
      phase = "idle"; busy = false;
      vFlip.onended = null;
    };
    vFlip.onended = swap;
    setTimeout(() => { if (busy) swap(); }, 700);
  }

  frame.addEventListener("click", () => flipNext(1));
  nextBtn.addEventListener("click", (e) => { e.stopPropagation(); flipNext(1); });
  prevBtn.addEventListener("click", (e) => { e.stopPropagation(); flipNext(-1); });

  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("is-open")) return;
    if (e.key === "ArrowRight" || e.key === " ") flipNext(1);
    else if (e.key === "ArrowLeft") flipNext(-1);
    else if (e.key === "Escape") closeBook();
    else if (e.key === "Tab") {
      const f = [closeBtn, prevBtn, nextBtn].filter(Boolean);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  function openBook() {
    lastFocused = document.activeElement;
    idx = 0; phase = "cover"; busy = false;
    setActive(null);
    setActive(vOpen);
    vOpen.pause(); vOpen.currentTime = 0;
    coverText.classList.remove("is-hidden");
    slot.classList.remove("is-visible");
    counter.textContent = `- / ${photoUrls.length || 0}`;
    frame.classList.remove("is-zoomed", "is-closing");
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (closeBtn) closeBtn.focus();
  }
  function closeBook() {
    frame.classList.add("is-closing");
    frame.classList.remove("is-zoomed");
    setTimeout(() => {
      [vOpen, vIdle, vFlip].forEach(v => { if (v) { v.pause(); v.currentTime = 0; } });
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      frame.classList.remove("is-closing");
      document.body.style.overflow = "";
      slot.classList.remove("is-visible");
      coverText.classList.remove("is-hidden");
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }, 450);
  }

  openBtn.addEventListener("click", openBook);
  closeBtn.addEventListener("click", closeBook);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeBook(); });

  // 7) PARCACIK EFEKTI (kozalak + yaprak + duman)
  const canvas = document.getElementById("book-particles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let particles = [];
  let raf = null;

  const SMOKE = "·";
  const KINDS = [
    { ch: "\u{1F332}", min: 14, max: 26, drift: 0.2, fall: 0.25, rot: 0.6, alpha: 0.55 },
    { ch: "\u{1F342}", min: 16, max: 30, drift: 0.6, fall: 0.5,  rot: 2.0, alpha: 0.85 },
    { ch: "\u{1F343}", min: 14, max: 26, drift: 0.7, fall: 0.45, rot: 1.8, alpha: 0.85 },
    { ch: "\u{1F330}", min: 14, max: 22, drift: 0.15,fall: 0.8,  rot: 1.2, alpha: 0.95 },
    { ch: SMOKE,       min: 22, max: 60, drift: 0.3, fall: 0.1,  rot: 0,   alpha: 0.18 }
  ];

  function resize() {
    const r = canvas.getBoundingClientRect();
    canvas.width  = r.width  * devicePixelRatio;
    canvas.height = r.height * devicePixelRatio;
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  }

  function spawn(n = 28) {
    particles = [];
    const w = canvas.clientWidth, h = canvas.clientHeight;
    for (let i = 0; i < n; i++) {
      const k = KINDS[Math.floor(Math.random() * KINDS.length)];
      particles.push({
        kind: k,
        x: Math.random() * w,
        y: Math.random() * h,
        size: k.min + Math.random() * (k.max - k.min),
        vx: (Math.random() - 0.5) * k.drift,
        vy: 0.1 + Math.random() * k.fall,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * k.rot * 0.02,
        a:  k.alpha * (0.6 + Math.random() * 0.5)
      });
    }
  }

  function draw() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.clearRect(0,0,w,h);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      if (p.y - p.size > h) { p.y = -p.size; p.x = Math.random() * w; }
      if (p.x < -p.size)    p.x = w + p.size;
      if (p.x > w + p.size) p.x = -p.size;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.a;
      ctx.font = `${p.size}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = p.kind.ch === SMOKE ? "rgba(220,200,170,1)" : "#000";
      ctx.fillText(p.kind.ch, 0, 0);
      ctx.restore();
    }
    raf = requestAnimationFrame(draw);
  }

  function startParticles() {
    resize();
    spawn(34);
    canvas.classList.add("is-on");
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(draw);
  }
  function stopParticles() {
    canvas.classList.remove("is-on");
    cancelAnimationFrame(raf);
    particles = [];
    ctx && ctx.clearRect(0,0,canvas.width,canvas.height);
  }

  const _open  = openBook;
  const _close = closeBook;
  openBtn.removeEventListener("click", _open);
  closeBtn.removeEventListener("click", _close);
  openBtn.addEventListener("click",  () => { _open();  setTimeout(startParticles, 400); });
  closeBtn.addEventListener("click", () => { _close(); stopParticles(); });

  window.addEventListener("resize", () => { if (canvas.classList.contains("is-on")) resize(); });
})();
