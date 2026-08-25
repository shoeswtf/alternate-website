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

  function initAnatomy() {
    var stage = document.querySelector(".anatomy__stage");
    if (!stage) return;

    var svgs = Array.prototype.slice.call(stage.querySelectorAll(".foot-svg"));
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".anatomy__tab"));
    var legendItems = Array.prototype.slice.call(stage.querySelectorAll(".girth-legend li"));
    var caption = document.getElementById("bone-caption");
    var cards = Array.prototype.slice.call(
      document.querySelectorAll(".bone-card[data-bone], .bone-card[data-bones], .bone-card[data-girth]")
    );
    if (!svgs.length || !cards.length) return;

    var state = { view: "top", bones: [], girth: null };

    function setStateFromCard(card) {
      var bones = [];
      if (card.dataset.bones) {
        bones = card.dataset.bones.split(/\s+/).filter(Boolean);
      } else if (card.dataset.bone) {
        bones = [card.dataset.bone];
      }
      state.bones = bones;
      state.girth = card.dataset.girth || null;
      if (card.dataset.name) {
        setCaption(card.dataset.name);
      }
      apply();
    }

    function setCaption(text) {
      if (!caption) return;
      caption.style.opacity = "0";
      window.setTimeout(function () {
        caption.textContent = text;
        caption.style.opacity = "1";
      }, 180);
    }

    function apply() {
      svgs.forEach(function (svg) {
        var isActive = svg.dataset.view === state.view;
        svg.classList.toggle("is-active", isActive);
        svg.querySelectorAll("[data-bone]").forEach(function (group) {
          group.classList.toggle("is-lit", isActive && state.bones.indexOf(group.dataset.bone) !== -1);
        });
        svg.querySelectorAll(".girth").forEach(function (loop) {
          loop.classList.toggle("is-active", isActive && loop.dataset.girth === state.girth);
        });
      });
      tabs.forEach(function (tab) {
        var on = tab.dataset.view === state.view;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-pressed", on ? "true" : "false");
      });
      legendItems.forEach(function (item) {
        item.classList.toggle("is-active", item.dataset.girth === state.girth);
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        state.view = tab.dataset.view;
        apply();
      });
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      cards.forEach(function (card) {
        card.addEventListener("mouseenter", function () { setStateFromCard(card); });
      });
      apply();
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setStateFromCard(entry.target);
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    cards.forEach(function (card) { io.observe(card); });
    apply();
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
    initAnatomy();
    initSteps();
  });
})();
