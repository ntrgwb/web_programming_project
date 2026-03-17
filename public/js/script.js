// console.log("Hello, world!"); 
document.addEventListener("DOMContentLoaded", function() {
  const vidIntro = document.getElementById('vid-intro');
  const vidLoop = document.getElementById('vid-loop');

  // Lắng nghe sự kiện 'ended' (kết thúc) của Video 1
  vidIntro.addEventListener('ended', function() {
    
    vidLoop.style.opacity = "1"; // 1. Hiện Video 2 lên
    vidLoop.play();              // 2. Cho Video 2 bắt đầu chạy
    vidIntro.style.opacity = "0"; // 3. Giấu Video 1 đi 
    
  });
});