(function() {
  function getVideoIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  function sendToHistory(videoId) {
    if (!videoId) return;

    try {
      let pendingHistory = JSON.parse(localStorage.getItem("pendingHistory")) || [];
      
      pendingHistory = pendingHistory.filter(v => v.id !== videoId);
      
      pendingHistory.unshift({ id: videoId });

      localStorage.setItem("pendingHistory", JSON.stringify(pendingHistory));
      console.log("🎯 Sinyal history terkirim:", videoId);
      
      document.dispatchEvent(new CustomEvent("historyUpdated", { detail: videoId }));
    } catch (err) {
      console.error("❌ Gagal kirim history:", err);
    }
  }

  function init() {
    const videoId = getVideoIdFromURL();
    console.log("📌 Konten dibuka, ID:", videoId);
    if (videoId) sendToHistory(videoId);
  }

  document.addEventListener("DOMContentLoaded", init);
})();