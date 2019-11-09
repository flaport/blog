document.querySelectorAll(".date").forEach(function (element) {
  var localDate = new Date(element.innerHTML);
  element.innerHTML = localDate.toDateString();
});
