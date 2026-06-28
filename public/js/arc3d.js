const wrap = document.querySelector(".premium-arc-wrap");
const stage = document.querySelector(".premium-arc-stage");

if (wrap && stage) {
  wrap.addEventListener("mousemove", (e) => {
    const rect = wrap.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    stage.style.setProperty("--move", `${x * 26}deg`);
  });

  wrap.addEventListener("mouseleave", () => {
    stage.style.setProperty("--move", "0deg");
  });
}