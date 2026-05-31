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

const btnAddCart = document.querySelectorAll(".btn-add-to-cart");

if (btnAddCart.length > 0) {
    btnAddCart.forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            
            // Tìm form chứa nút bấm này
            const form = button.closest("form");
            const action = form.getAttribute("action");
            const quantity = form.querySelector('input[name="quantity"]').value;

            // Gửi dữ liệu ngầm lên Server
            fetch(action, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest" // Báo cho Server biết đây là gọi ngầm
                },
                body: JSON.stringify({ quantity: quantity })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Thông báo đơn giản cho người dùng biết đã thêm thành công
                    alert("Đã thêm sản phẩm vào giỏ hàng!"); 
                }
            })
            .catch(err => console.log(err));
        });
    });
}