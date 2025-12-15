(function ($) {
  "use strict";

  // Spinner
  var spinner = function () {
    setTimeout(function () {
      if ($("#spinner").length > 0) {
        $("#spinner").removeClass("show");
      }
    }, 1);
  };
  spinner();

  // Initiate the wowjs
  new WOW().init();

  // Sticky Navbar
  $(window).scroll(function () {
    if ($(this).scrollTop() > 0) {
      $(".navbar").addClass("position-fixed bg-dark shadow-sm");
    } else {
      $(".navbar").removeClass("position-fixed bg-dark shadow-sm");
    }
  });

  // Back to top button
  $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
      $(".back-to-top").fadeIn(100);
    } else {
      $(".back-to-top").fadeOut(100);
    }
  });

  $(".back-to-top").click(function () {
    $("html, body").animate({ scrollTop: 0 }, 300);
    return false;
  });

  // Testimonials carousel
  $(".testimonial-carousel").owlCarousel({
    autoplay: true,
    smartSpeed: 1000,
    loop: true,
    nav: false,
    dots: true,
    items: 1,
    dotsData: true,
  });
})(jQuery);

$(".portfolio-carousel").owlCarousel({
  autoplay: true,
  smartSpeed: 900,
  margin: 25,
  dots: true,
  loop: true,
  center: true,
  responsive: {
    0: { items: 1 },
    576: { items: 1 },
    768: { items: 2 },
    992: { items: 3 },
  },
});

//Navbar and Footer
async function loadPartials() {
  const navbar = await fetch("/partials/navbar.html").then((r) => r.text());
  const footer = await fetch("/partials/footer.html").then((r) => r.text());

  const navEl = document.getElementById("site-navbar");
  const footerEl = document.getElementById("site-footer");

  if (navEl) navEl.innerHTML = navbar;
  if (footerEl) footerEl.innerHTML = footer;

  setActiveNav();
  initCapabilityScrollSpy();
}
document.addEventListener("DOMContentLoaded", loadPartials);

//Active navbar
function setActiveNav() {
  const path = location.pathname.toLowerCase();
  let currentPage = path.split("/").pop();

  // ✅ root domain / 处理：brif.cloud/ -> index.html
  if (!currentPage) currentPage = "index.html";

  // 1️⃣ 清掉所有 active（避免残留）
  document.querySelectorAll(".navbar .active").forEach((el) => {
    el.classList.remove("active");
  });

  // 2️⃣ 精确匹配当前页（普通 nav-link / dropdown-item）
  document.querySelectorAll(".navbar a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    const hrefFile = href.toLowerCase().split("/").pop();

    if (hrefFile === currentPage) {
      link.classList.add("active");

      // 如果是 dropdown-item，让父级 toggle 也 active
      const parentDropdown = link.closest(".dropdown");
      if (parentDropdown) {
        const toggle = parentDropdown.querySelector(
          ".nav-link.dropdown-toggle"
        );
        if (toggle) toggle.classList.add("active");
      }
    }
  });

  // 3️⃣ Services：只要是「Services 子页」就高亮父级
  const isServicesChild =
    currentPage.startsWith("service-") || // service-xxx.html
    path.includes("/services/"); // /services/xxx/xxx.html

  if (isServicesChild) {
    const servicesToggle = document.querySelector(
      '.navbar .nav-item.dropdown[data-parent="services"] > .nav-link'
    );
    if (servicesToggle) servicesToggle.classList.add("active");
  }
}

// our capabilities section 2
function initCapabilityScrollSpy() {
  const links = Array.from(
    document.querySelectorAll(".pillar-link[href^='#cap-']")
  );
  const sections = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (!links.length || !sections.length) return; // 不是这个页面就不跑

  // 点击左侧：平滑滚动
  links.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;

      // 预留 navbar 高度（你 navbar 固定的话更需要）
      const offset = 110;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  // 滚动：自动高亮
  const setActive = (id) => {
    links.forEach((a) =>
      a.classList.toggle("active", a.getAttribute("href") === `#${id}`)
    );
  };

  const observer = new IntersectionObserver(
    (entries) => {
      // 找到当前最“可见”的那个
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) setActive(visible.target.id);
    },
    {
      root: null,
      // 让它更像“读到标题就切换”
      rootMargin: "-25% 0px -60% 0px",
      threshold: [0.1, 0.2, 0.4, 0.6],
    }
  );

  sections.forEach((sec) => observer.observe(sec));
}
