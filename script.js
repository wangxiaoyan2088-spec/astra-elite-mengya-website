const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const revealItems = document.querySelectorAll(".reveal");
const tabs = document.querySelectorAll("[data-work]");
const workTitle = document.querySelector("[data-work-title]");
const workCopy = document.querySelector("[data-work-copy]");
const workVisual = document.querySelector("[data-work-visual]");
const workImage = document.querySelector("[data-work-image]");

const workContent = {
  moon: {
    title: "Moon City Awakens",
    copy: "月球城市重新启动。孩子跟随 Leta 与 Milo 找到沉睡基地的第一束光，设计城市启动任务。",
    image: "assets/mooncity.png",
    alt: "Moon City Awakens 月球城市重新启动"
  },
  drone: {
    title: "Drone Delivery Mission",
    copy: "无人机配送任务。孩子规划一条安全路线，让无人机把工具送到 Moon City 的新实验区。",
    image: "assets/drone%20task.png",
    alt: "Drone Delivery Mission 无人机配送任务"
  },
  robot: {
    title: "AI Emotion Buddy",
    copy: "AI情绪伙伴。孩子设计一个会倾听、会发光、能帮助人类表达感受的 AI companion。",
    image: "assets/ai%20emotion%20buddy.png",
    alt: "AI Emotion Buddy AI情绪伙伴"
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
    if (workImage) {
      workImage.src = content.image;
      workImage.alt = content.alt;
    }
  });
});

window.addEventListener("scroll", syncHeader, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 940) closeMobileNav();
});

syncHeader();
