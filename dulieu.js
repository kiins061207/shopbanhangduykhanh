/* ================= DỮ LIỆU SẢN PHẨM DÙNG CHUNG (trang chủ + trang Admin) =================
   Cần nạp file này trước script.js và admin.js.
   - Danh sách lưu trong sessionStorage (khóa KHOA_LUU_SP).
   - Mã sản phẩm có dạng #001, #002, ... Bộ đếm KHOA_MA_TIEP không lùi khi xóa,
     nên mã của sản phẩm đã xóa sẽ không bị cấp lại cho sản phẩm khác. */

var sanphams = [];
var KHOA_LUU_SP = "sanphams_kd";          /* khóa sessionStorage lưu danh sách sản phẩm */
var KHOA_MA_TIEP = "sanphams_kd_tiep";    /* khóa lưu số mã kế tiếp */

/* Hàm khởi tạo sản phẩm */
function SanPham(masp, tensp, gia, giagoc, ctsp, hinh, loai) {
    this.masp = masp;
    this.tensp = tensp;
    this.gia = gia;
    this.giagoc = giagoc;
    this.ctsp = ctsp;
    this.hinh = hinh;
    this.loai = loai;   /* laptop | pc | manhinh | phukien */
}

/* Định dạng giá: 25490000 -> 25.490.000 */
function dinhDangGia(so) {
    return Number(so).toLocaleString("vi-VN");
}

/* Ảnh lỗi: hiện khi sản phẩm không có ảnh hoặc ảnh không tải được */
var ANH_LOI = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="#eee"/>' +
    '<g fill="none" stroke="#bbb" stroke-width="4"><rect x="115" y="50" width="70" height="55" rx="6"/><path d="M122 98l20-22 15 16 10-9 18 15"/></g>' +
    '<text x="50%" y="142" fill="#999" font-family="Arial" font-size="16" text-anchor="middle">Ảnh lỗi</text></svg>');

/* Gắn vào thẻ <img>: nếu ảnh không tải được thì tự đổi sang ảnh lỗi */
var THUOC_TINH_ANH_LOI = ' onerror="this.onerror=null;this.src=ANH_LOI;"';

/* Ảnh dạng đường dẫn thì mã hóa dấu cách, ảnh dạng data: thì giữ nguyên.
   Không có ảnh (rỗng) thì dùng ảnh lỗi. */
function duongAnh(h) {
    if (!h) return ANH_LOI;
    return String(h).indexOf("data:") === 0 ? h : encodeURI(h);
}

/* Số 7 -> "#007" */
function dinhMa(n) {
    var s = String(n);
    while (s.length < 3) s = "0" + s;
    return "#" + s;
}

/* ===== DỮ LIỆU 15 SẢN PHẨM MẶC ĐỊNH (mã #001 -> #015) ===== */
var macDinh = [];
macDinh.push(new SanPham("#001", "Laptop Acer Nitro V15", 25490000, 30990000, "Ryzen 5 / RTX 4050 / 16GB / 512GB", "img/Laptop Acer Nitro V15.jpg", "laptop"));
macDinh.push(new SanPham("#002", "Laptop Asus TUF A15", 27990000, 31990000, "Ryzen 7 / RTX 4060 / 16GB / 512GB", "img/Laptop Asus TUF A15.webp", "laptop"));
macDinh.push(new SanPham("#003", "Laptop MSI Katana 15", 34890000, 35990000, "i7-13620H / RTX 4050 / 16GB / 1TB", "img/Laptop MSI Katana 15.webp", "laptop"));
macDinh.push(new SanPham("#004", "Laptop Lenovo LOQ 15", 42690000, 45990000, "i7-13650HX / RTX 4050 / 16GB / 512GB", "img/Laptop Lenovo LOQ 15.webp", "laptop"));
macDinh.push(new SanPham("#005", "Laptop Acer Nitro Lite", 29290000, 31990000, "i7-13620H / RTX 4050 / 16GB / 512GB", "img/Laptop Acer Nitro Lite.webp", "laptop"));
macDinh.push(new SanPham("#006", "Laptop Dell G15 5530", 31490000, 34990000, "i5-13450HX / RTX 4050 / 16GB / 512GB", "img/Laptop Dell G15 5530.webp", "laptop"));
macDinh.push(new SanPham("#007", "Laptop HP Victus 16", 25990000, 28990000, "i5-13500H / RTX 4050 / 16GB / 512GB", "img/Laptop HP Victus 16.webp", "laptop"));
macDinh.push(new SanPham("#008", "PC Gaming RTX 4060", 22990000, 25990000, "i5-12400F / RTX 4060 / 16GB / 512GB", "img/PC GVN Gaming RTX 4060.jpg", "pc"));
macDinh.push(new SanPham("#009", "PC Office X300", 8990000, 9990000, "Ryzen 5 5600G / 16GB / 256GB", "img/PC GVN Office X300.jpg", "pc"));
macDinh.push(new SanPham("#010", "PC AI Workstation", 45990000, 51990000, "i9-14900K / RTX 4070 Ti / 32GB / 1TB", "img/PC GVN AI Workstation.webp", "pc"));
macDinh.push(new SanPham("#011", "Màn hình ASUS TUF 24 inch", 3990000, 4590000, "IPS / 180Hz / 1ms / Full HD", "img/Màn hình ASUS TUF 24 inch.webp", "manhinh"));
macDinh.push(new SanPham("#012", "Màn hình AOC 27 inch", 3290000, 3890000, "IPS / 180Hz / 1ms / Full HD", "img/Màn hình AOC 27 inch.webp", "manhinh"));
macDinh.push(new SanPham("#013", "Bàn phím cơ AKKO 3087", 1290000, 1590000, "TKL / Switch Akko CS / PBT", "img/Bàn phím cơ AKKO 3087.jpg", "phukien"));
macDinh.push(new SanPham("#014", "Chuột Logitech G102", 490000, 590000, "8000 DPI / 6 nút / LED RGB", "img/Chuột Logitech G102.webp", "phukien"));
macDinh.push(new SanPham("#015", "Tai nghe HyperX Cloud III", 2390000, 2790000, "Driver 53mm / Micro chống ồn", "img/Tai nghe HyperX Cloud III.webp", "phukien"));

/* Đọc danh sách đã lưu. Dữ liệu cũ có mã dạng sp01 thì đổi sang #001 (một lần). */
sanphams = macDinh.slice();
try {
    var daLuu = JSON.parse(sessionStorage.getItem(KHOA_LUU_SP));
    if (Array.isArray(daLuu)) {
        var capNhatMa = false;
        for (var iMa = 0; iMa < daLuu.length; iMa++) {
            var mc = /^sp(\d+)$/.exec(daLuu[iMa].masp);
            if (mc) {
                daLuu[iMa].masp = dinhMa(Number(mc[1]));
                capNhatMa = true;
            }
        }
        sanphams = daLuu;
        if (capNhatMa) {
            try { sessionStorage.setItem(KHOA_LUU_SP, JSON.stringify(sanphams)); } catch (e1) {}
        }
    }
} catch (err) {}

/* Lưu danh sách vào trình duyệt. Trả về true nếu lưu được. */
function luuSanPhamLocal() {
    try {
        sessionStorage.setItem(KHOA_LUU_SP, JSON.stringify(sanphams));
        return true;
    } catch (err) {
        alert("Không lưu được vào bộ nhớ trình duyệt (có thể do ảnh quá nặng). Hãy chọn ảnh nhỏ hơn.");
        return false;
    }
}

function timSP(masp) {
    for (var i = 0; i < sanphams.length; i++) {
        if (sanphams[i].masp === masp) return sanphams[i];
    }
    return null;
}

/* Cấp mã mới: lấy số lớn nhất đang dùng hoặc bộ đếm đã lưu (cái nào lớn hơn) rồi cộng 1. */
function taoMaSP() {
    var max = 0;
    for (var i = 0; i < sanphams.length; i++) {
        var m = /^#(\d+)$/.exec(sanphams[i].masp);
        if (m && Number(m[1]) > max) max = Number(m[1]);
    }
    var dem = 0;
    try { dem = parseInt(sessionStorage.getItem(KHOA_MA_TIEP), 10) - 1; } catch (e) {}
    if (isNaN(dem)) dem = 0;
    var so = Math.max(max, dem) + 1;
    try { sessionStorage.setItem(KHOA_MA_TIEP, String(so + 1)); } catch (e2) {}
    return dinhMa(so);
}

/* Thu nhỏ ảnh về tối đa 500px để lưu được vào sessionStorage.
   xong(dataURL) khi thành công, loi() khi không đọc được ảnh. */
function docAnh(file, xong, loi) {
    var fr = new FileReader();
    fr.onerror = function () { if (loi) loi(); };
    fr.onload = function () {
        var img = new Image();
        img.onerror = function () { if (loi) loi(); };
        img.onload = function () {
            var t = Math.min(1, 500 / Math.max(img.width, img.height));
            var c = document.createElement("canvas");
            c.width = Math.round(img.width * t);
            c.height = Math.round(img.height * t);
            var ctx = c.getContext("2d");
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, c.width, c.height);
            ctx.drawImage(img, 0, 0, c.width, c.height);
            xong(c.toDataURL("image/jpeg", 0.8));
        };
        img.src = fr.result;
    };
    fr.readAsDataURL(file);
}
