(function () {
  var stack = ["lock"];
  var views = Array.prototype.slice.call(document.querySelectorAll("[data-view]"));
  var status = document.querySelector(".status");
  var lock = document.getElementById("lock");
  var swipe = null;
  var drawn = false;

  function part(parts, type) {
    var i;
    for (i = 0; i < parts.length; i += 1) {
      if (parts[i].type === type) return parts[i].value;
    }
    return "";
  }

  function paintClock() {
    var now = new Date();
    var timeParts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Muscat",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).formatToParts(now);
    var hm = part(timeParts, "hour") + ":" + part(timeParts, "minute");
    var dayPeriod = part(timeParts, "dayPeriod");
    Array.prototype.forEach.call(document.querySelectorAll("[data-clock-hm]"), function (el) {
      el.textContent = hm;
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-clock-meridiem]"), function (el) {
      el.textContent = dayPeriod;
    });
    var dateEl = document.getElementById("lock-date");
    if (dateEl) {
      dateEl.textContent = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Muscat",
        weekday: "long",
        day: "numeric",
        month: "long"
      }).format(now);
    }
  }

  function current() {
    return stack[stack.length - 1];
  }

  function show(name) {
    views.forEach(function (view) {
      var on = view.getAttribute("data-view") === name;
      view.hidden = !on;
      if (on) view.scrollTop = 0;
    });
    if (status) status.classList.toggle("status-dark", name !== "lock" && name !== "home");
    if (!drawn) {
      drawn = true;
      return;
    }
    var active = document.getElementById(name);
    if (active && active.focus) active.focus({ preventScroll: true });
  }

  function go(name) {
    if (name === "lock") stack = ["lock"];
    else if (name === "home") stack = ["home"];
    else {
      var index = stack.indexOf(name);
      if (index !== -1) stack = stack.slice(0, index + 1);
      else if (current() === "lock") stack = ["home", name];
      else stack = stack.concat([name]);
    }
    show(current());
  }

  function open(name) {
    if (current() === "lock") stack = ["home", name];
    else stack = stack.concat([name]);
    show(current());
  }

  function pop() {
    if (current() === "lock" || current() === "home") return;
    stack.pop();
    if (!stack.length) stack = ["home"];
    show(current());
  }

  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var opener = target.closest("[data-open]");
    if (opener) {
      open(opener.getAttribute("data-open"));
      return;
    }
    var destination = target.closest("[data-go]");
    if (destination) go(destination.getAttribute("data-go"));
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") pop();
  });

  lock.addEventListener("pointerdown", function (event) {
    if (current() !== "lock") return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    var target = event.target;
    swipe = {
      id: event.pointerId,
      y: event.clientY,
      note: Boolean(target && target.closest && target.closest(".notice"))
    };
  });

  window.addEventListener("pointerup", function (event) {
    if (!swipe || swipe.id !== event.pointerId) return;
    var fromNote = swipe.note;
    var delta = swipe.y - event.clientY;
    swipe = null;
    if (fromNote) return;
    if (current() !== "lock") return;
    if (delta > 60) go("home");
  });

  window.addEventListener("pointercancel", function (event) {
    if (swipe && swipe.id === event.pointerId) swipe = null;
  });

  paintClock();
  window.setInterval(paintClock, 10000);
  show("lock");
})();
