(function () {
  const dataSource = "pemuatan.js";
  let sumberData = [];
  let semuaVideo = [];
  
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
    const li = document.createElement("div");
    li.className = "video-item";

    const link = document.createElement("a");
    link.href = `konten.html?id=${idAsli}`; 

    const wrapper = document.createElement("div");
    wrapper.className = "thumb-wrapper";

    const img = document.createElement("img");
    img.className = "thumb";
    img.src = item.thumbnail || "error.png";
    wrapper.appendChild(img);

    const title = document.createElement("h3");
    title.className = "judul";
    title.textContent = item.title || "Tanpa Judul";

    const info = document.createElement("p");
    info.className = "info-mini";
    info.textContent = item["aired-start"] || "Tanggal tidak diketahui";

    link.append(wrapper, title, info);
    li.appendChild(link);
    return li;
  }
  
  function tampilkanRandom() {
    const container = document.getElementById("randomList");
    if (!container) return;
    container.innerHTML = "";

    const acakIndex = semuaVideo.map((_, idx) => idx).sort(() => Math.random() - 0.5).slice(0, 9);
    acakIndex.forEach(idAsli => {
      const item = semuaVideo[idAsli];
      container.appendChild(buatItemVideo(item, idAsli));
    });
  }
  
  function tampilkanBaruDirilis() {
    const container = document.getElementById("newReleaseList");
    if (!container) return;
    container.innerHTML = "";
    
    const indexTerbaru = [...semuaVideo.keys()].reverse().slice(0, 9);
    indexTerbaru.forEach(idAsli => {
      const item = semuaVideo[idAsli];
      container.appendChild(buatItemVideo(item, idAsli));
    });
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
  
  function init() {
    ambilDariSession();
    if (semuaVideo.length > 0) {
      tampilkanRandom();
      tampilkanBaruDirilis();
      aktifkanRefresh();
    } else {
      mulaiLoadData(() => {
        tampilkanRandom();
        tampilkanBaruDirilis();
        aktifkanRefresh();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
