(function () {
  const current = window.location.href;
  const last = sessionStorage.getItem("lastPage");
  if (last !== current) {
    sessionStorage.setItem("lastPage", document.referrer || last || "");
  }
})();

function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    const lastPage = sessionStorage.getItem("lastPage");
    if (lastPage && lastPage !== window.location.href) {
      window.location.href = lastPage;
    } else {
      tampilkanToast("Tidak ada halaman sebelumnya 🌀");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));
  let data = JSON.parse(sessionStorage.getItem("videoData") || "[]");
  if ((!data || !data[id]) && localStorage.getItem("videoBackup")) {
    data = JSON.parse(localStorage.getItem("videoBackup"));
  }

  if (!data || !data[id]) {
    const judul = document.getElementById("judulKonten");
    if (judul) judul.textContent = "Konten tidak ditemukan. Mohon coba lagi.";
    return;
  }

  localStorage.setItem("videoBackup", JSON.stringify(data));

  const item = data[id];
  const video = document.getElementById("videoPlayer");
  const source = document.getElementById("videoSource");
  let historyData = JSON.parse(localStorage.getItem("watchHistory") || "{}");
  let saved = historyData[id] || {};
  let epAktif = saved.episode || sessionStorage.getItem(`epAktif-${id}`) || "eps1";
  
  if (item[epAktif]) {
    source.src = item[epAktif];
  } else {
    for (let i = 1; i <= 100; i++) {
      const epsKey = `eps${i}`;
      if (item[epsKey]) {
        source.src = item[epsKey];
        epAktif = epsKey;
        break;
      }
    }
  }

  video.load();
  
  video.addEventListener("loadedmetadata", () => {
    if (saved.time && saved.episode === epAktif) {
      video.currentTime = saved.time;
    }
  });
  
  setInterval(() => {
    if (!isNaN(video.duration) && video.duration > 0) {
      historyData[id] = {
        title: item.title,
        episode: epAktif,
        time: video.currentTime,
        duration: video.duration,
        lastWatched: Date.now(),
      };
      localStorage.setItem("watchHistory", JSON.stringify(historyData));
    }
  }, 1000);
  
  let retryCount = 0;
  video.addEventListener("error", () => {
    if (retryCount < 3) {
      retryCount++;
      tampilkanToast(`Terjadi error, mencoba ulang... (${retryCount})`);
      setTimeout(() => {
        video.load();
        video.play().catch(() => {});
      }, 2000);
    } else {
      tampilkanToast("Gagal memutar video setelah 3 percobaan 😢");
    }
  });
  
  window.addEventListener("beforeunload", () => {
    if (!isNaN(video.duration) && video.duration > 0) {
      historyData[id] = {
        title: item.title,
        episode: epAktif,
        time: video.currentTime,
        duration: video.duration,
        lastWatched: Date.now(),
      };
      localStorage.setItem("watchHistory", JSON.stringify(historyData));
    }
  });
  
  const infoTable = document.getElementById("infoTable");
  if (infoTable) {
    infoTable.innerHTML = `
      <tr><td><strong>Judul</strong></td><td>${item.title}</td></tr>
      <tr><td><strong>Diposting oleh</strong></td><td>${item.direktur}</td></tr>
      <tr><td><strong>Diposting pada</strong></td><td>${item["aired-start"]}</td></tr>
    `;
  }

  tampilkanPantun();
  
  let controlsVisible = true;
  let lastTap = 0;
  let skipIndicator = null;

  function hideControls() {
    video.removeAttribute("controls");
    video.style.cursor = "none";
    controlsVisible = false;
  }

  function showControls() {
    video.setAttribute("controls", "controls");
    video.style.cursor = "default";
    controlsVisible = true;
  }

  function showSkipIndicator(text) {
    if (!skipIndicator) {
      skipIndicator = document.createElement("div");
      skipIndicator.style.position = "absolute";
      skipIndicator.style.top = "50%";
      skipIndicator.style.left = "50%";
      skipIndicator.style.transform = "translate(-50%, -50%)";
      skipIndicator.style.color = "#fff";
      skipIndicator.style.fontSize = "2rem";
      skipIndicator.style.fontWeight = "bold";
      skipIndicator.style.textShadow = "0 0 10px rgba(0,0,0,0.8)";
      skipIndicator.style.opacity = "0";
      skipIndicator.style.transition = "opacity 0.3s ease";
      skipIndicator.style.zIndex = "9999";
      video.parentElement.style.position = "relative";
      video.parentElement.appendChild(skipIndicator);
    }

    skipIndicator.textContent = text;
    skipIndicator.style.opacity = "1";
    setTimeout(() => (skipIndicator.style.opacity = "0"), 500);
  }

  video.addEventListener("pointerdown", (e) => {
    const now = Date.now();
    const delta = now - lastTap;
    lastTap = now;

    const rect = video.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (delta < 300) {
      e.preventDefault();
      if (x < rect.width / 2) {
        video.currentTime = Math.max(video.currentTime - 10, 0);
        showSkipIndicator("<<<10s");
      } else {
        video.currentTime = Math.min(video.currentTime + 10, video.duration);
        showSkipIndicator("10s>>>");
      }
      return;
    }

    if (controlsVisible) hideControls();
    else showControls();
  });

  video.addEventListener("play", showControls);
  
  const qualityBtn = document.createElement("button");
  qualityBtn.textContent = "Quality ⚙️";
  qualityBtn.style.position = "absolute";
  qualityBtn.style.bottom = "10px";
  qualityBtn.style.right = "10px";
  qualityBtn.style.background = "rgba(0,0,0,0.6)";
  qualityBtn.style.color = "#fff";
  qualityBtn.style.border = "none";
  qualityBtn.style.borderRadius = "8px";
  qualityBtn.style.padding = "6px 12px";
  qualityBtn.style.fontSize = "13px";
  qualityBtn.style.cursor = "pointer";
  qualityBtn.style.zIndex = "10000";
  qualityBtn.style.transition = "opacity 0.3s ease";

  const menuQuality = document.createElement("div");
  menuQuality.style.position = "absolute";
  menuQuality.style.bottom = "45px";
  menuQuality.style.right = "10px";
  menuQuality.style.background = "rgba(0,0,0,0.85)";
  menuQuality.style.color = "#fff";
  menuQuality.style.borderRadius = "8px";
  menuQuality.style.padding = "6px 10px";
  menuQuality.style.display = "none";
  menuQuality.style.flexDirection = "column";
  menuQuality.style.gap = "6px";
  menuQuality.style.boxShadow = "0 0 10px rgba(0,0,0,0.4)";
  menuQuality.style.zIndex = "10000";
  
  const listQuality = [];
  if (item.eps1) listQuality.push({ key: "eps1", label: "480p" });
  if (item.eps2) listQuality.push({ key: "eps2", label: "720p" });

  listQuality.forEach((q) => {
    const btn = document.createElement("button");
    btn.textContent = q.label;
    btn.style.background = q.key === epAktif ? "#ff4d4d" : "#333";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.borderRadius = "6px";
    btn.style.padding = "4px 10px";
    btn.style.cursor = "pointer";
    btn.onclick = () => {
      if (epAktif === q.key) {
        tampilkanToast(`Sudah di ${q.label}`);
        menuQuality.style.display = "none";
        return;
      }
      const currentTime = video.currentTime;
      if (item[q.key]) {
        source.src = item[q.key];
        epAktif = q.key;
        video.load();
        video.currentTime = currentTime;
        video.play().catch(() => {});
        tampilkanToast(`Ganti kualitas ke ${q.label} ✅`);
        menuQuality.style.display = "none";
        sessionStorage.setItem(`epAktif-${id}`, epAktif);
      } else {
        tampilkanToast(`Quality ${q.label} tidak tersedia ❌`);
      }
    };
    menuQuality.appendChild(btn);
  });

  qualityBtn.onclick = () => {
    menuQuality.style.display = menuQuality.style.display === "none" ? "flex" : "none";
  };

  const container = video.parentElement;
  container.style.position = "relative";
  container.appendChild(qualityBtn);
  container.appendChild(menuQuality);
});

function tampilkanPantun() {
  const box = document.getElementById("sloganBox");
  if (!box) return;
  if (window.randomPantun?.length) {
    const pantun = window.randomPantun[Math.floor(Math.random() * window.randomPantun.length)];
    box.innerHTML = Array.isArray(pantun)
      ? pantun.map((b) => `<span>${b}</span>`).join("<br>")
      : pantun;
  } else {
    box.textContent = "Streaming nyaman tanpa gangguan, hanya di HiyaNime 🍿";
  }
}

function tampilkanToast(pesan) {
  if (window.toastAktif) return;
  window.toastAktif = true;

  let toast = document.getElementById("toastMsg");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toastMsg";
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%) translateY(10px)";
    toast.style.background = "linear-gradient(135deg, #ff4d4d, #ff1a1a)";
    toast.style.color = "#fff";
    toast.style.padding = "12px 24px";
    toast.style.borderRadius = "10px";
    toast.style.fontWeight = "bold";
    toast.style.fontSize = "14px";
    toast.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.3)";
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.4s ease, transform 0.4s ease";
    toast.style.zIndex = "99999";
    toast.style.pointerEvents = "none";
    document.body.appendChild(toast);
  }

  toast.textContent = pesan;
  setTimeout(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  }, 10);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(10px)";
    window.toastAktif = false;
  }, 3000);
}