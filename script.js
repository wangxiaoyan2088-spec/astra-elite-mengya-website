const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const revealItems = document.querySelectorAll(".reveal");
const tabs = document.querySelectorAll("[data-work]");
const workTitle = document.querySelector("[data-work-title]");
const workCopy = document.querySelector("[data-work-copy]");
const workVisual = document.querySelector("[data-work-visual]");

const workContent = {
  moon: {
    title: "Moon Garden City",
    copy: "孩子设计一座能种植物、收集太阳能、保护宇航员情绪的月球花园城市。",
    color: "linear-gradient(180deg, rgba(220, 239, 255, 0.78), rgba(255, 255, 255, 0.9))"
  },
  drone: {
    title: "Kind Drone Mission",
    copy: "孩子画出一台能给未来教室运送工具、观察天气并避开同伴的友好无人机。",
    color: "linear-gradient(180deg, rgba(255, 228, 154, 0.5), rgba(255, 255, 255, 0.92))"
  },
  robot: {
    title: "AI Emotion Buddy",
    copy: "孩子创造一个会倾听、会发光、会提醒人类保持想象力的 AI 小伙伴。",
    color: "linear-gradient(180deg, rgba(233, 228, 255, 0.72), rgba(255, 255, 255, 0.94))"
  }
};

function syncHeader() {
  header.classList.toggle("scrolled", window.scrollY > 18);
}

function closeMobileNav() {
  mobileNav.classList.remove("open");
  menuButton.setAttribute("aria-label", "打开导航");
}

menuButton.addEventListener("click", () => {
  const isOpen = mobileNav.classList.toggle("open");
  menuButton.setAttribute("aria-label", isOpen ? "关闭导航" : "打开导航");
});

mobileNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMobileNav);
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => observer.observe(item));

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const key = tab.dataset.work;
    const content = workContent[key];

    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");

    workTitle.textContent = content.title;
    workCopy.textContent = content.copy;
    workVisual.style.background = `${content.color}, repeating-linear-gradient(90deg, transparent 0 38px, rgba(64, 123, 185, 0.06) 39px 40px)`;
  });
});

window.addEventListener("scroll", syncHeader, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 940) closeMobileNav();
});

syncHeader();
