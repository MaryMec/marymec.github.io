(function () {
  var inputs = Array.prototype.slice.call(document.querySelectorAll(".choice input"));
  var live = document.getElementById("line");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var timer = 0;
  function speak(text) {
    window.clearInterval(timer);
    if (!live) return;
    if (reduce.matches) { live.textContent = text; return; }
    live.textContent = "";
    var i = 0;
    timer = window.setInterval(function () {
      i += 1;
      live.textContent = text.slice(0, i);
      if (i >= text.length) window.clearInterval(timer);
    }, 22);
  }
  function current() {
    return inputs.filter(function (input) { return input.checked; })[0] || inputs[0];
  }
  inputs.forEach(function (input) {
    input.addEventListener("change", function () {
      if (input.checked) speak(input.getAttribute("data-line") || "");
    });
  });
  document.querySelector(".choices").addEventListener("keydown", function (event) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    var index = inputs.indexOf(current());
    var next = event.key === "ArrowRight" ? (index + 1) % inputs.length : (index - 1 + inputs.length) % inputs.length;
    inputs[next].checked = true;
    inputs[next].focus();
    speak(inputs[next].getAttribute("data-line") || "");
  });
  speak((current().getAttribute("data-line")) || "");
})();
