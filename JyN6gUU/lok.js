(function () {
  const isWebView = /wv|WebView|(iPhone|Android).+(Version\/[\d.]+.+Safari)/i
    .test(navigator.userAgent);

  if (!isWebView) {
    document.documentElement.innerHTML = ""; 
    document.documentElement.style.background = "#000";

    ["contextmenu","selectstart","mousedown","keydown","click","touchstart"]
      .forEach(evt => {
        document.addEventListener(evt, e => e.preventDefault(), true);
      });

    setTimeout = setInterval = function () {};

    return; 
  }

  document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;

    const skipPages = ["search", "konten"];
    const isSkip = skipPages.some(p => path.includes(p));

    if (isSkip) return; 

    try {
      const kodeAkses = new URLSearchParams(window.location.search).get("ufg");

      const versiValid = "meong";
      const warningBox = document.getElementById("peringatan-kode");
      const dialogIklan = document.getElementById("dialog-iklan");
      const mainContent = document.getElementById("mainContent");
      const loading = document.getElementById("loadingMessage");
      const tombolSearch = document.getElementById("searchLink");

      const tampilkanPesan = (judul, isi) => {
        if (warningBox) {
          warningBox.classList.remove("hidden");

          const t = warningBox.querySelector("strong");
          const d = warningBox.querySelector("p");

          if (t) t.textContent = judul;
          if (d) d.textContent = isi;
          return;
        }

        document.body.innerHTML = `
          <div style="
            position:fixed; inset:0; background:#000; color:#fff;
            display:flex; flex-direction:column; justify-content:center;
            align-items:center; font-family:system-ui,sans-serif; z-index:999999;">
            <h2 style="margin:0; font-size:18px;">${judul}</h2>
            <p style="font-size:14px; text-align:center; max-width:280px;">${isi}</p>
          </div>
        `;
      };

      if (!kodeAkses) {
        tampilkanPesan(
          "",
          ""
        );
      } else if (kodeAkses !== versiValid) {
        tampilkanPesan(
          "",
          ""
        );
      } else {
        if (dialogIklan) dialogIklan.classList.remove("hidden");
        if (mainContent) mainContent.classList.remove("hidden");
      }

      if (kodeAkses !== versiValid) {
        [mainContent, loading].forEach(el => el && (el.style.display = "none"));

        if (tombolSearch) {
          tombolSearch.style.pointerEvents = "none";
          tombolSearch.style.opacity = "0.3";
          tombolSearch.style.cursor = "not-allowed";
        }

        document.querySelectorAll("a, button, input, video").forEach(el => {
          el.style.pointerEvents = "none";
          el.style.userSelect = "none";
          el.style.opacity = "0.4";
        });
      }

    } catch (err) {
      console.error("❌ Error lock.js:", err);
    }
  });
})();
