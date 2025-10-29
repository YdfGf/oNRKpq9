(function () {
  const dataSource = "pemuatan.js";
  let sumberData = [];
  let semuaVideo = [];
  let filteredVideos = [];
  let currentLetter = "";
  const batchSize = 12;
  let currentIndex = 0;
  
  function simpanKeSession() {
    try {
      sessionStorage.setItem("videoData", JSON.stringify(semuaVideo));
      sessionStorage.setItem("sumberData", JSON.stringify(sumberData));
      window.videos = semuaVideo.slice();
    } catch (e) {
      console.error("⚠️ Gagal simpan session:", e);
    }
  }

  function ambilDariSession() {
    try {
      semuaVideo = JSON.parse(sessionStorage.getItem("videoData") || "[]");
      sumberData = JSON.parse(sessionStorage.getItem("sumberData") || "[]");
      window.videos = semuaVideo.slice();
    } catch {
      semuaVideo = [];
      sumberData = [];
      window.videos = [];
    }
  }
  
  function keyUntukItem(item) {
    return item?.id ?? item?.url ?? item?.title ?? JSON.stringify(item);
  }

  function mergeTanpaDuplikat(arr) {
    if (!Array.isArray(arr)) return;
    const map = new Map(semuaVideo.map(i => [keyUntukItem(i), i]));
    arr.forEach(it => {
      const k = keyUntukItem(it);
      if (!map.has(k)) {
        map.set(k, it);
        semuaVideo.push(it);
      }
    });
  }
  
  function loadNextData(callback, index = 0) {
    if (index >= sumberData.length) {
      simpanKeSession();
      if (callback) callback();
      return;
    }

    const src = sumberData[index];
    const script = document.createElement("script");
    script.src = src + "?v=" + Date.now();

    script.onload = () => {
      const dataBaru = Array.isArray(window.videos) ? window.videos.slice() : [];
      mergeTanpaDuplikat(dataBaru);
      try { delete window.videos; } catch {}
      loadNextData(callback, index + 1);
    };
    script.onerror = () => loadNextData(callback, index + 1);
    document.head.appendChild(script);
  }

  function mulaiLoadData(callback) {
    const sumberScript = document.createElement("script");
    sumberScript.src = dataSource + "?v=" + Date.now();

    sumberScript.onload = () => {
      sumberData = Array.isArray(window.sumberData) ? window.sumberData.slice() : [];
      semuaVideo = Array.isArray(window.videos) ? window.videos.slice() : [];
      try { delete window.sumberData; } catch {}
      try { delete window.videos; } catch {}
      loadNextData(callback);
    };

    sumberScript.onerror = () => {
      console.error("❌ Gagal memuat:", dataSource);
      if (callback) callback();
    };

    document.head.appendChild(sumberScript);
  }
  
  function buatItemVideo(item, idAsli) {
    const card = document.createElement("div");
    card.className = "genre-card";

    const link = document.createElement("a");
    link.href = `konten.html?id=${idAsli}`;
    link.addEventListener("click", () => {
      sessionStorage.setItem("selectedVideo", JSON.stringify(item));
    });

    const img = document.createElement("img");
    img.alt = item.title;
    img.src = "cover.png";

    const realImage = new Image();
    realImage.src = item.thumbnail || "error.png";
    realImage.onload = () => img.classList.add("loaded");
    realImage.onerror = () => { img.src = "error.png"; img.classList.add("loaded"); };
    img.src = realImage.src;

    const title = document.createElement("h3");
    title.textContent = item.title;

    const info = document.createElement("p");
    info.textContent = `🗓️ ${item["aired-start"] || "Unknown"}`;

    link.append(img, title, info);
    card.appendChild(link);
    return card;
  }
  
  const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  function renderAlphabetButtons() {
    const container = document.getElementById("genre-buttons");
    container.innerHTML = "";
    alphabet.forEach(letter => {
      const btn = document.createElement("button");
      btn.textContent = letter;
      btn.addEventListener("click", () => selectLetter(letter, btn));
      container.appendChild(btn);
    });
  }

  function selectLetter(letter, btn) {
    if (letter === currentLetter) return;
    currentLetter = letter;
    document.querySelectorAll("#genre-buttons button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    filteredVideos = semuaVideo.filter(v => v.title?.trim().toUpperCase().startsWith(letter));
    currentIndex = 0;
    document.getElementById("genre-list").innerHTML = "";
    observer.disconnect();
    renderNextBatch();

    sessionStorage.setItem("lastLetter", letter);
  }

  function renderNextBatch() {
    const container = document.getElementById("genre-list");
    const nextItems = filteredVideos.slice(currentIndex, currentIndex + batchSize);

    nextItems.forEach((item, idx) => {
      const idAsli = semuaVideo.indexOf(item);
      container.appendChild(buatItemVideo(item, idAsli));
    });

    currentIndex += batchSize;
    if (currentIndex < filteredVideos.length) {
      observer.observe(container.lastElementChild);
    }
  }

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      observer.unobserve(entries[0].target);
      renderNextBatch();
    }
  });
  
  function tampilkanRandom() {
    const container = document.getElementById("randomList");
    if (!container) return;
    container.innerHTML = "";
    const acakIndex = semuaVideo.map((_, idx) => idx).sort(() => Math.random() - 0.5).slice(0, 9);
    acakIndex.forEach(idAsli => container.appendChild(buatItemVideo(semuaVideo[idAsli], idAsli)));
  }

  function tampilkanBaruDirilis() {
    const container = document.getElementById("newReleaseList");
    if (!container) return;
    container.innerHTML = "";
    const indexTerbaru = [...semuaVideo.keys()].reverse().slice(0, 9);
    indexTerbaru.forEach(idAsli => container.appendChild(buatItemVideo(semuaVideo[idAsli], idAsli)));
  }

  function aktifkanRefresh() {
    const btn = document.getElementById("refreshRandom");
    if (!btn) return;
    btn.addEventListener("click", () => {
      btn.disabled = true;
      tampilkanRandom();
      setTimeout(() => (btn.disabled = false), 2000);
    });
  }
  
  function restoreLastLetter() {
    let letter = sessionStorage.getItem("lastLetter");
    if (!letter || !alphabet.includes(letter)) letter = alphabet[0];
    const btn = [...document.querySelectorAll("#genre-buttons button")].find(b => b.textContent === letter);
    if (btn) selectLetter(letter, btn);
  }

  function init() {
    ambilDariSession();
    if (!semuaVideo.length) {
      mulaiLoadData(() => {
        renderAlphabetButtons();
        restoreLastLetter();
        tampilkanRandom();
        tampilkanBaruDirilis();
        aktifkanRefresh();
      });
    } else {
      renderAlphabetButtons();
      restoreLastLetter();
      tampilkanRandom();
      tampilkanBaruDirilis();
      aktifkanRefresh();
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();