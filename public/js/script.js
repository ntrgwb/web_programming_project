document.addEventListener("DOMContentLoaded", function() {
  const vidIntro = document.getElementById("vid-intro");
  const vidLoop = document.getElementById("vid-loop");

  if (vidIntro && vidLoop) {
    vidIntro.addEventListener("ended", function() {
      vidLoop.style.opacity = "1";
      vidLoop.play();
      vidIntro.style.opacity = "0";
    });
  }
});
