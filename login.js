function saveLanguage() {
  const lang = document.getElementById("language").value;
  localStorage.setItem("farmerLanguage", lang);
  window.location.href = "index.html";
}