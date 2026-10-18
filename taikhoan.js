/* ================= TÀI KHOẢN KHÁCH HÀNG (đăng ký / đăng nhập) ================= */

/* Mảng chứa tất cả tài khoản đã đăng ký. Mỗi phần tử là một đối tượng TaiKhoan. */
var taikhoans = [];

/* Hàm khởi tạo tài khoản */
function TaiKhoan(hoten, email, sdt, matkhau) {
    this.hoten = hoten;
    this.email = email;
    this.sdt = sdt;
    this.matkhau = matkhau;
}

/* ----- Lưu / đọc mảng tài khoản (sessionStorage để chuyển trang vẫn còn) ----- */
function docTaiKhoan() {
    try {
        var luu = sessionStorage.getItem("taikhoans");
        if (luu) {
            taikhoans = JSON.parse(luu);
        }
    } catch (err) {
        taikhoans = [];
    }
    if (!Array.isArray(taikhoans)) {
        taikhoans = [];
    }
}

function luuTaiKhoan() {
    try {
        sessionStorage.setItem("taikhoans", JSON.stringify(taikhoans));
    } catch (err) {
        console.error("Không lưu được tài khoản:", err);
    }
}

/* Tìm tài khoản theo email, trả về vị trí trong mảng (-1 nếu chưa có) */
function timTaiKhoan(email) {
    email = String(email).trim().toLowerCase();
    for (var i = 0; i < taikhoans.length; i++) {
        if (taikhoans[i].email === email) {
            return i;
        }
    }
    return -1;
}

/* ----- Đăng ký: trả về "" nếu thành công, ngược lại trả về nội dung lỗi ----- */
function dangKy(hoten, email, sdt, matkhau, nhaplai) {
    hoten = String(hoten).trim();
    email = String(email).trim().toLowerCase();
    sdt = String(sdt).replace(/\s/g, "");

    if (hoten.length < 2) return "Vui lòng nhập họ và tên.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email chưa đúng định dạng.";
    if (!/^0\d{9}$/.test(sdt)) return "Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0.";
    if (matkhau.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";
    if (matkhau !== nhaplai) return "Nhập lại mật khẩu chưa khớp.";
    if (timTaiKhoan(email) !== -1) return "Email này đã được đăng ký.";

    taikhoans.push(new TaiKhoan(hoten, email, sdt, matkhau));
    luuTaiKhoan();
    return "";
}

/* ----- Đăng nhập: trả về "" nếu thành công, ngược lại trả về nội dung lỗi ----- */
function dangNhap(email, matkhau) {
    email = String(email).trim().toLowerCase();
    if (email === "" || matkhau === "") return "Vui lòng nhập email và mật khẩu.";

    /* Tài khoản quản trị cố định: tên đăng nhập admin, mật khẩu 155200 */
    if (email === "admin" && matkhau === "155200") {
        try {
            sessionStorage.setItem("quantri", "1");
            sessionStorage.removeItem("nguoidung");
        } catch (err) {
            console.error("Không lưu được trạng thái đăng nhập:", err);
        }
        return "";
    }

    var vt = timTaiKhoan(email);
    if (vt === -1 || taikhoans[vt].matkhau !== matkhau) {
        return "Email hoặc mật khẩu không đúng.";
    }

    try {
        sessionStorage.setItem("nguoidung", taikhoans[vt].email);
    } catch (err) {
        console.error("Không lưu được trạng thái đăng nhập:", err);
    }
    return "";
}

/* Tài khoản đang đăng nhập (null nếu chưa đăng nhập) */
function nguoiDangNhap() {
    try {
        var email = sessionStorage.getItem("nguoidung");
        if (email) {
            var vt = timTaiKhoan(email);
            if (vt !== -1) return taikhoans[vt];
        }
    } catch (err) {}
    return null;
}

/* Phiên hiện tại có phải quản trị viên (admin) không */
function laAdmin() {
    try {
        return sessionStorage.getItem("quantri") === "1";
    } catch (err) {
        return false;
    }
}

function dangXuat() {
    try {
        sessionStorage.removeItem("quantri");
        sessionStorage.removeItem("nguoidung");
    } catch (err) {}
}

/* ----- Hiện thông báo trong thẻ có id="thongbao" (kieu: "loi" hoặc "ok") ----- */
function hienThongBao(noidung, kieu) {
    var tb = document.getElementById("thongbao");
    if (!tb) return;
    tb.textContent = noidung;
    tb.className = "thongbao hien " + kieu;
}

/* Chống chèn HTML khi in dữ liệu người dùng ra trang */
function escHTML(chuoi) {
    return String(chuoi).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* ----- Khu vực tài khoản ở góc phải menu (cạnh giỏ hàng) -----
   Chưa đăng nhập: nút "Đăng nhập" + "Đăng ký".
   Đã đăng nhập  : "Xin chào, tên" - bấm vào mới xổ ra Tài khoản / Đăng xuất. */
var daGanSuKienTK = false;

function capNhatMenu() {
    var khuPhai = document.getElementById("top-right");
    if (!khuPhai) return;

    var cu = document.getElementById("tk-khu");
    if (cu) khuPhai.removeChild(cu);

    var khu = document.createElement("div");
    khu.id = "tk-khu";
    var tk = nguoiDangNhap();

    if (laAdmin()) {
        /* Admin: menu xổ xuống có trang quản trị + đăng xuất */
        khu.innerHTML =
            '<div class="tk-user">' +
                '<button type="button" id="tk-user-nut" class="tk-nut" aria-haspopup="true" aria-expanded="false">' +
                    ic("shield") + '<span class="tk-ten">Xin chào, Admin</span>' + ic("chevron") +
                '</button>' +
                '<div id="tk-dropdown" class="tk-dropdown">' +
                    '<a href="admin.html">' + ic("layout") + ' Trang quản trị</a>' +
                    '<a href="index.html">' + ic("package") + ' Xem cửa hàng</a>' +
                    '<a href="#" id="tk-dangxuat" class="tk-ra">' + ic("logout") + ' Đăng xuất</a>' +
                '</div>' +
            '</div>';

        var nutAd = khu.querySelector("#tk-user-nut");
        var ddAd = khu.querySelector("#tk-dropdown");
        nutAd.addEventListener("click", function (e) {
            e.stopPropagation();
            var mo = ddAd.classList.toggle("hien");
            nutAd.setAttribute("aria-expanded", mo ? "true" : "false");
        });
        khu.querySelector("#tk-dangxuat").addEventListener("click", function (e) {
            e.preventDefault();
            dangXuat();
            window.location = "index.html";
        });
    } else if (tk) {
        khu.innerHTML =
            '<div class="tk-user">' +
                '<button type="button" id="tk-user-nut" class="tk-nut" aria-haspopup="true" aria-expanded="false">' +
                    ic("user") + '<span class="tk-ten">Xin chào, ' + escHTML(tk.hoten) + '</span>' + ic("chevron") +
                '</button>' +
                '<div id="tk-dropdown" class="tk-dropdown">' +
                    '<a href="nguoidung.html">' + ic("layout") + ' Tài khoản của tôi</a>' +
                    '<a href="nguoidung.html#donhang">' + ic("package") + ' Đơn hàng của tôi</a>' +
                    '<a href="#" id="tk-dangxuat" class="tk-ra">' + ic("logout") + ' Đăng xuất</a>' +
                '</div>' +
            '</div>';

        var nut = khu.querySelector("#tk-user-nut");
        var dd = khu.querySelector("#tk-dropdown");
        nut.addEventListener("click", function (e) {
            e.stopPropagation();
            var mo = dd.classList.toggle("hien");
            nut.setAttribute("aria-expanded", mo ? "true" : "false");
        });
        khu.querySelector("#tk-dangxuat").addEventListener("click", function (e) {
            e.preventDefault();
            dangXuat();
            window.location = "index.html";
        });
    } else {
        khu.innerHTML =
            '<a href="dangnhap.html" class="tk-nut">' + ic("login") + ' Đăng nhập</a>' +
            '<a href="dangky.html" class="tk-nut tk-nut-chinh">' + ic("userplus") + ' Đăng ký</a>';
    }

    khuPhai.insertBefore(khu, khuPhai.firstChild);

    /* Bấm ra ngoài hoặc nhấn Esc thì đóng danh sách (chỉ gắn 1 lần) */
    if (!daGanSuKienTK) {
        daGanSuKienTK = true;
        document.addEventListener("click", function () {
            var d = document.getElementById("tk-dropdown");
            if (d) d.classList.remove("hien");
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                var d = document.getElementById("tk-dropdown");
                if (d) d.classList.remove("hien");
            }
        });
    }
}

/* ----- Chạy khi tải trang ----- */
docTaiKhoan();
capNhatMenu();
