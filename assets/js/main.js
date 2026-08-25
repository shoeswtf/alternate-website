(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initReveal() {
    var targets = document.querySelectorAll("[data-reveal], .measure-card");
    if (!targets.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.1 });
    targets.forEach(function (el) { io.observe(el); });
  }

  function initBones() {
    var svg = document.querySelector(".foot-svg");
    var cards = document.querySelectorAll(".bone-card[data-bone]");
    var caption = document.getElementById("bone-caption");
    if (!svg || !cards.length) return;

    function lightBone(id, name) {
      svg.querySelectorAll(".bone.is-lit").forEach(function (el) {
        el.classList.remove("is-lit");
      });
      if (id) {
        var target = svg.getElementById ? svg.getElementById("bone-" + id) : document.getElementById("bone-" + id);
        if (!target) target = document.getElementById("bone-" + id);
        if (target) target.classList.add("is-lit");
      }
      if (caption && name) {
        caption.style.opacity = "0";
        window.setTimeout(function () {
          caption.textContent = name;
          caption.style.opacity = "1";
        }, 180);
      }
    }

    if (reduceMotion || !("IntersectionObserver" in window)) {
      cards.forEach(function (card) {
        card.addEventListener("mouseenter", function () {
          lightBone(card.dataset.bone, card.dataset.name);
        });
      });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          lightBone(entry.target.dataset.bone, entry.target.dataset.name);
        }
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    cards.forEach(function (card) { io.observe(card); });
  }

  function initSteps() {
    var stepsList = document.querySelector(".steps");
    if (!stepsList) return;
    var steps = stepsList.querySelectorAll(".step");

    function updateRail() {
      var rect = stepsList.getBoundingClientRect();
      var focus = window.innerHeight * 0.55;
      var progress = (focus - rect.top) / rect.height;
      progress = Math.max(0, Math.min(1, progress));
      stepsList.style.setProperty("--progress", progress.toFixed(4));
      steps.forEach(function (step) {
        var stepRect = step.getBoundingClientRect();
        var reached = stepRect.top + Math.min(stepRect.height * 0.35, 90) <= focus;
        step.classList.toggle("is-done", reached);
      });
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        updateRail();
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateRail();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    initBones();
    initSteps();
  });
})();
