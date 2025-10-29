window.videos = [];
let sumberData = [];
let indexSekarang = 0;

function setThumbnailErrorHandler(img, originalSrc) {
  img.onerror = function () {
    console.warn("⚠️ Thumbnail gagal dimuat:", originalSrc);
    this.src = "error.png";
  };
}

function acakArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function loadAllData(callback) {
  let allVideos = [];

  for (let i = 0; i < sumberData.length; i++) {
    const url = sumberData[i];
    console.log(`📥 Memuat data ke-${i + 1}:`, url);

    const ok = await loadScriptSafe(url);
    if (ok && window.videos && Array.isArray(window.videos)) {
      console.log(`✅ Berhasil dari ${url}, total item:`, window.videos.length);
      
      allVideos.push(...window.videos);
      
      delete window.videos;
      window.videos = [];
    } else {
      console.warn(`⚠️ Tidak ada data valid di ${url}`);
    }
  }
  
  window.videos = allVideos;
  sessionStorage.setItem("videoData", JSON.stringify(allVideos));

  console.log(`🎬 Total video dari semua sumber: ${allVideos.length}`);

  if (callback) callback();
}

function loadScriptSafe(url) {
  return new Promise(resolve => {
    const script = document.createElement("script");
    script.src = url;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

function mulaiSemua(callback) {
  const dariSession = sessionStorage.getItem("videoData");
  const sumberSession = sessionStorage.getItem("sumberData");

  if (dariSession && sumberSession) {
    try {
      window.videos = JSON.parse(dariSession);
      sumberData = JSON.parse(sumberSession);
      console.log("♻️ Menggunakan data dari session.");
      callback();
      return;
    } catch (e) {
      console.warn("🧨 Data session korup, reload ulang.");
    }
  }

  const sumberScript = document.createElement("script");
  sumberScript.src = "https://cdn.statically.io/gh/YdfGf/oNRKpq9/main/JyN6gUU/pemuatan.js
";
  sumberScript.onload = () => {
    sumberData = window.sumberData || [];
    console.log("📜 Daftar sumber data:", sumberData);

    sessionStorage.setItem("sumberData", JSON.stringify(sumberData));
    loadAllData(callback);
  };
  sumberScript.onerror = () => {
    console.error("🚫 Gagal memuat daftar sumber data");
  };
  document.head.appendChild(sumberScript);
}

function formatTanggalRilis(item) {
  let aired = item["aired-start"] || "Unknown";
  if (aired && aired.includes("-")) {
    const [y, m, d] = aired.split("-");
    aired = `${d}/${m}/${y}`;
  }
  return `🗓️ ${aired}`;
}

function tampilkanHasil(data) {
  const results = document.getElementById("searchResults");
  results.innerHTML = "";

  data.forEach(item => {
    const li = document.createElement("li");

    const link = document.createElement("a");
    link.href = `https://kq2t6g.codeberg.page/k2b5ud9/xe1g9ii/konten.html
?id=${item.idAsli}`;

    const img = document.createElement("img");
    img.className = "thumb";
    img.src = "cover.png";
    img.setAttribute("data-src", item.thumbnail || "");
    img.alt = item.title;
    
    setThumbnailErrorHandler(img, item.thumbnail);

    const temp = new Image();
    temp.src = item.thumbnail;
    temp.onload = () => (img.src = item.thumbnail);
    temp.onerror = () => (img.src = "error.png");

    const wrapper = document.createElement("div");
    wrapper.className = "thumb-wrapper";
    wrapper.appendChild(img);

    const title = document.createElement("h3");
    title.className = "judul";
    title.textContent = item.title;
    
    const info = document.createElement("p");
    info.className = "mini-info";
    info.textContent = formatTanggalRilis(item);
    
    if (item.sumberCocok === "hastag") {
      const tagInfo = document.createElement("span");
      tagInfo.textContent = "📌 Ditemukan lewat hashtag";
      tagInfo.style.display = "block";
      tagInfo.style.fontSize = "0.8em";
      tagInfo.style.color = "#ffb3b3";
      info.appendChild(tagInfo);
    }

    link.appendChild(wrapper);
    link.appendChild(title);
    link.appendChild(info);
    li.appendChild(link);
    results.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchInput");
  const form = document.getElementById("searchForm");
  const button = form.querySelector("button");

  let bisaKlik = true;

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!bisaKlik) return;

    const query = input.value.toLowerCase().trim();

    if (query.length < 2) {
      input.value = "";
      input.placeholder = "Minimal 2 huruf...";
      input.classList.add("error");
      setTimeout(() => {
        input.placeholder = "Pencarian...";
        input.classList.remove("error");
      }, 2000);
      return;
    }

    const hasil = [];
    const cocokAwal = new RegExp(`^${query}`, "i");
    
    window.videos.forEach((item, idx) => {
      const title = (item.title || "").toLowerCase();
      
      const tags = Array.isArray(item.hashtags)
        ? item.hashtags.map(tag => tag.toLowerCase())
        : Array.isArray(item.hastag)
        ? item.hastag.map(tag => tag.toLowerCase())
        : [];

      const cocokJudul = cocokAwal.test(title) || title.includes(query);
      const cocokHashtag = tags.some(
        tag => tag.includes(query) || query.includes(tag)
      );

      if (cocokJudul || cocokHashtag) {
        hasil.push({
          ...item,
          idAsli: idx,
          sumberCocok: cocokHashtag ? "hastag" : "judul"
        });
      }
    });

    if (hasil.length > 1) acakArray(hasil);

    sessionStorage.setItem("searchKeyword", query);
    sessionStorage.setItem("searchResults", JSON.stringify(hasil));
    tampilkanHasil(hasil);
    
    bisaKlik = false;
    button.classList.add("hidden");
    input.classList.add("expand");

    setTimeout(() => {
      bisaKlik = true;
    }, 1000);
  });

  input.addEventListener("input", () => {
    button.classList.remove("hidden");
    input.classList.remove("expand");
  });
  
  mulaiSemua(() => {
    const hasil = sessionStorage.getItem("searchResults");
    const keyword = sessionStorage.getItem("searchKeyword");
    if (hasil && keyword) {
      input.value = keyword;
      try {
        const hasilParsed = JSON.parse(hasil);
        if (hasilParsed.length > 1) acakArray(hasilParsed);
        tampilkanHasil(hasilParsed);
      } catch (e) {
        console.error("Gagal parsing hasil session:", e);
      }
    }
  });
});
