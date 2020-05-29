document.querySelectorAll("a[href*=\"://\"]").forEach(function (element) {
  element.target = "_blank";
});
