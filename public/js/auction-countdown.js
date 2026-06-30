function updateCountdown() {
  document.querySelectorAll(".auction-countdown").forEach((box) => {
    const endTime = new Date(box.dataset.end).getTime();
    const distance = endTime - Date.now();

    if (distance <= 0) {
      box.innerHTML = `<div class="count-ended">Phiên đấu giá đã kết thúc</div>`;
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    box.querySelector('[data-unit="days"]').textContent = String(days).padStart(2, "0");
    box.querySelector('[data-unit="hours"]').textContent = String(hours).padStart(2, "0");
    box.querySelector('[data-unit="minutes"]').textContent = String(minutes).padStart(2, "0");
    box.querySelector('[data-unit="seconds"]').textContent = String(seconds).padStart(2, "0");
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);