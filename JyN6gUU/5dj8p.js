// history.js
(function () {
  const container = document.getElementById("history-list");
  const dataSource = "https://cdn.jsdelivr.net/gh/YdfGf/oNRKpq9@4a7cf85dc83e7e5b35832ce083f41d1f0ba6ba96/JyN6gUU/pemuatan.js";
  let sumberData = [];
  let indexSekarang = 0;
  let semuaVideo = []; // master data gabungan

  function simpanKeSession() {
    sessionStorage.setItem("videoData", JSON.stringify(semuaVideo));
    sessionStorage.setItem("sumberData", JSON.stringify(sumberData));
    window.videos = semuaVideo.slice();
  }

  function ambilDariSession() {
    const videoData = sessionStorage.getItem("videoData");
    const sumberDataData = sessionStorage.getItem("sumberData");

    if (videoData) {
      semuaVideo = JSON.parse(videoData);
      window.videos = semuaVideo.slice();
    }
    if (sumberDataData) sumberData = JSON.parse(sumberDataData);
  }

  function showLoading() {
    container.innerHTML = `
      <div class="center-message">
        <p></p>
      </div>
    `;
  }

  function hideLoading() {
    container.innerHTML = "";
  }

  function keyUntukItem(item) {
    return item?.id ?? item?.url ?? item?.title ?? JSON.stringify(item);
  }

  function mergeVideos(arr) {
    if (!Array.isArray(arr)) return;
    for (const item of arr) {
      const key = keyUntukItem(item);
      if (!semuaVideo.some(v => keyUntukItem(v) === key)) {
        semuaVideo.push(item);
      }
    }
  }

  function loadNextData(callback) {
    if (indexSekarang >= sumberData.length) {
      simpanKeSession();
      if (callback) callback();
      return;
    }

    const script = document.createElement("script");
    script.src = sumberData[indexSekarang];
    script.onload = () => {
      if (Array.isArray(window.videos)) {
        mergeVideos(window.videos);
        try { delete window.videos; } catch { window.videos = undefined; }
      }
      indexSekarang++;
      setTimeout(() => loadNextData(callback), 200);
    };
    script.onerror = () => {
      indexSekarang++;
      setTimeout(() => loadNextData(callback), 200);
    };
    document.head.appendChild(script);
  }

  function mulaiLoadData(callback) {
    const sumberScript = document.createElement("script");
    sumberScript.src = dataSource;
    sumberScript.onload = () => {
      sumberData = Array.isArray(window.sumberData) ? window.sumberData.slice() : [];
      if (Array.isArray(window.videos)) {
        mergeVideos(window.videos);
        try { delete window.videos; } catch { window.videos = undefined; }
      }
      indexSekarang = 0;
      if (sumberData.length === 0) {
        simpanKeSession();
        if (callback) callback();
        return;
      }
      loadNextData(callback);
    };
    sumberScript.onerror = () => {
      if (callback) callback();
    };
    document.head.appendChild(sumberScript);
  }

  function setThumbnailErrorHandler(img, originalSrc) {
    img.onerror = function () {
      this.src = "error.png";
    };
  }

  function renderHistory() {
    hideLoading();
    const pending = JSON.parse(localStorage.getItem("pendingHistory")) || [];
    const data = semuaVideo.length ? semuaVideo : JSON.parse(sessionStorage.getItem("videoData") || "[]");

    container.innerHTML = "";
    if (!pending.length) {
      container.innerHTML = `
        <div class="center-message">
          <p>Belum ada riwayat tontonan</p>
        </div>
      `;
      return;
    }

    pending.forEach(item => {
      const index = parseInt(item.id, 10);
      const video = data[index];
      if (!video) return;

      const link = `https://kq2t6g.codeberg.page/k2b5ud9/xe1g9ii/konten.html
?id=${index}`;
      const anchor = document.createElement("a");
      anchor.href = link;
      anchor.className = "history-item";

      const img = document.createElement("img");
      img.src = video.thumbnail || "cover.png";
      setThumbnailErrorHandler(img, video.thumbnail);

      const infoDiv = document.createElement("div");
      infoDiv.className = "history-info";

      const title = document.createElement("h3");
      title.textContent = video.title;

      const date = document.createElement("p");
      date.textContent = video["aired-start"] || "-";

      infoDiv.appendChild(title);
      infoDiv.appendChild(date);

      const btn = document.createElement("button");
      btn.className = "remove-btn";
      btn.textContent = "Hapus";
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        removeFromHistory(index);
      };

      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      wrapper.appendChild(anchor);
      wrapper.appendChild(btn);

      anchor.appendChild(img);
      anchor.appendChild(infoDiv);

      container.appendChild(wrapper);
    });
  }

  function removeFromHistory(videoId) {
    let pending = JSON.parse(localStorage.getItem("pendingHistory")) || [];
    pending = pending.filter(v => v.id !== String(videoId));
    localStorage.setItem("pendingHistory", JSON.stringify(pending));
    renderHistory();
  }
  window.removeFromHistory = removeFromHistory;

  document.addEventListener("DOMContentLoaded", () => {
    ambilDariSession();
    showLoading();
    if (!window.videos || !window.videos.length) {
      mulaiLoadData(renderHistory);
    } else {
      semuaVideo = window.videos.slice();
      renderHistory();
    }
  });
})();
