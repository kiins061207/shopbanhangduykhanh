/* ================= SẢN PHẨM, TÌM KIẾM, PHÂN TRANG, GIỎ HÀNG ================= */
/* Cần nạp icons.js, taikhoan.js và dulieu.js trước file này. */

var SP_MOI_TRANG = 9;                 /* mỗi trang 9 sản phẩm (3 hàng x 3 cột) */
var ANH_TRONG = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="#eee"/>' +
    '<text x="50%" y="50%" fill="#999" font-family="Arial" font-size="16" text-anchor="middle">Chưa có ảnh</text></svg>');

/* Chỉ tài khoản admin mới được thêm / sửa / xóa sản phẩm */
function coQuyen() {
    return laAdmin();
}

/* Tạo HTML cho một sản phẩm */
function motsp(sp, quanLy) {
    var text = "";
    var nhanGiam = "";
    var giaGoc = "";
    if (sp.giagoc > sp.gia) {
        var phanTram = Math.round((1 - sp.gia / sp.giagoc) * 100);
        nhanGiam = '<span class="nhan-giam">-' + phanTram + '%</span>';
        giaGoc = '<span class="gia-goc">' + dinhDangGia(sp.giagoc) + 'đ</span>';
    }

    text += '<div class="khung-anh">' + nhanGiam;
    if (quanLy) {
        text += '<div class="sp-quanly">';
        text += '<button type="button" title="Sửa sản phẩm" aria-label="Sửa sản phẩm" onclick="suaSanPham(\'' + sp.masp + '\')">' + ic("pencil") + '</button>';
        text += '<button type="button" title="Xóa sản phẩm" aria-label="Xóa sản phẩm" onclick="xoaSanPham(\'' + sp.masp + '\')">' + ic("trash") + '</button>';
        text += '</div>';
    }
    text += '<img src="' + duongAnh(sp.hinh) + '" alt="' + escHTML(sp.tensp) + '"' + THUOC_TINH_ANH_LOI + '>';
    text += '</div>';
    text += '<h3>' + escHTML(sp.tensp) + '</h3>';
    text += '<p class="ctsp">' + escHTML(sp.ctsp) + '</p>';
    text += '<div class="khung-gia">';
    text += giaGoc;
    text += '<span class="gia-ban">' + dinhDangGia(sp.gia) + 'đ</span>';
    text += '</div>';
    text += '<div class="hang-mua">';
    text += '<input name="soluong" type="number" value="1" min="1" max="99" aria-label="Số lượng">';
    text += '<button type="button" onclick="chonhang(this, \'' + sp.masp + '\')">' + ic("cart") + ' Thêm vào giỏ</button>';
    text += '</div>';

    return text;
}

/* Tạo HTML cho một danh sách sản phẩm */
function xuatsp(danhsach, quanLy) {
    var text = "";
    for (var i = 0; i < danhsach.length; i++) {
        text += '<div class="sanpham">' + motsp(danhsach[i], quanLy) + '</div>';
    }
    if (text === "") {
        text = '<p class="khong-co-sp">Chưa có sản phẩm trong danh mục này.</p>';
    }
    return text;
}

/* ===== TÌM KIẾM + LỌC DANH MỤC + PHÂN TRANG ===== */
var tenDanhMuc = {
    tatca: "Tất cả sản phẩm",
    laptop: "Laptop",
    pc: "PC",
    manhinh: "Màn hình",
    phukien: "Phụ kiện"
};
var loaiHienTai = "tatca";
var tuKhoa = "";
var trangHienTai = 1;

/* Bỏ dấu + chữ thường: "Màn hình" -> "man hinh" (gõ không dấu vẫn tìm được) */
function boDau(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
}

/* Sản phẩm khớp khi chứa TẤT CẢ các từ trong từ khóa (tên, cấu hình, danh mục) */
function khopTuKhoa(sp, kw) {
    var cacTu = boDau(kw).split(/\s+/);
    var hay = boDau(sp.tensp + " " + sp.ctsp + " " + (tenDanhMuc[sp.loai] || ""));
    for (var i = 0; i < cacTu.length; i++) {
        if (cacTu[i] !== "" && hay.indexOf(cacTu[i]) === -1) return false;
    }
    return true;
}

/* Gợi ý: các sản phẩm đang giảm giá sâu nhất */
function sanphamGoiY(n) {
    var ds = sanphams.slice();
    ds.sort(function (a, b) {
        return (1 - b.gia / b.giagoc) - (1 - a.gia / a.giagoc);
    });
    return ds.slice(0, n);
}

function capNhatDatalist() {
    var o = document.getElementById("ds-goiy-ten");
    if (!o) return;
    var t = "";
    for (var i = 0; i < sanphams.length; i++) {
        t += '<option value="' + escHTML(sanphams[i].tensp) + '"></option>';
    }
    o.innerHTML = t;
}

function veSoTrang(tongTrang) {
    var o = document.getElementById("phantrang");
    if (tongTrang <= 1) {
        o.innerHTML = "";
        return;
    }
    var t = "";
    for (var i = 1; i <= tongTrang; i++) {
        t += '<button type="button" class="' + (i === trangHienTai ? "hien-tai" : "") + '"' +
             (i === trangHienTai ? ' aria-current="page"' : "") +
             ' aria-label="Trang ' + i + '" onclick="chuyenTrang(' + i + ')">' + i + '</button>';
    }
    o.innerHTML = t;
}

function chuyenTrang(so) {
    trangHienTai = so;
    hienThi();
    document.getElementById("tieude-sp").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* Vẽ lại khu sản phẩm theo từ khóa / danh mục / trang hiện tại */
function hienThi() {
    var quanLy = coQuyen();
    var dangTim = tuKhoa.trim() !== "";
    var ds = [];
    for (var i = 0; i < sanphams.length; i++) {
        var sp = sanphams[i];
        if (dangTim ? khopTuKhoa(sp, tuKhoa) : (loaiHienTai === "tatca" || sp.loai === loaiHienTai)) {
            ds.push(sp);
        }
    }

    var oTim = document.getElementById("ketqua-tim");
    var oSP = document.getElementById("showsanpham");
    var oTieuDe = document.getElementById("tieude-sp");
    capNhatDatalist();

    /* Tô đậm danh mục đang chọn (khi đang tìm thì không tô) */
    var links = document.querySelectorAll(".aside_text a");
    for (var k = 0; k < links.length; k++) {
        links[k].classList.toggle("active", !dangTim && links[k].dataset.loai === loaiHienTai);
    }

    /* Không có kết quả -> báo khách + gợi ý sản phẩm khác */
    if (dangTim && ds.length === 0) {
        oTieuDe.textContent = "Không tìm thấy sản phẩm";
        oTim.innerHTML =
            '<div class="tim-khong-co">' + ic("alert") +
            '<div><b>Không tìm thấy sản phẩm nào cho “' + escHTML(tuKhoa.trim()) + '”.</b><br>' +
            'Cửa hàng hiện chưa có sản phẩm này. Bạn thử từ khóa khác hoặc xem các sản phẩm gợi ý bên dưới nhé.</div></div>' +
            '<h3 class="goiy-tieude">Có thể bạn quan tâm</h3>';
        oSP.innerHTML = xuatsp(sanphamGoiY(3), quanLy);
        document.getElementById("phantrang").innerHTML = "";
        return;
    }

    oTim.innerHTML = dangTim
        ? '<p class="tim-thongke">Tìm thấy <b>' + ds.length + '</b> sản phẩm cho “' + escHTML(tuKhoa.trim()) + '”.</p>'
        : "";
    oTieuDe.textContent = dangTim ? "Kết quả tìm kiếm" : (tenDanhMuc[loaiHienTai] || "Sản phẩm");

    var tongTrang = Math.max(1, Math.ceil(ds.length / SP_MOI_TRANG));
    if (trangHienTai > tongTrang) trangHienTai = tongTrang;
    if (trangHienTai < 1) trangHienTai = 1;
    var batDau = (trangHienTai - 1) * SP_MOI_TRANG;
    oSP.innerHTML = xuatsp(ds.slice(batDau, batDau + SP_MOI_TRANG), quanLy);
    veSoTrang(tongTrang);
}

function timKiem(giaTri) {
    tuKhoa = giaTri;
    trangHienTai = 1;
    hienThi();
}

/* Danh mục: bấm vào thì xóa từ khóa và về trang 1 */
var linksDanhMuc = document.querySelectorAll(".aside_text a");
for (var iDM = 0; iDM < linksDanhMuc.length; iDM++) {
    linksDanhMuc[iDM].addEventListener("click", function (e) {
        e.preventDefault();
        loaiHienTai = this.dataset.loai;
        tuKhoa = "";
        document.getElementById("o-timkiem").value = "";
        trangHienTai = 1;
        hienThi();
    });
}

/* Ô tìm kiếm: gõ đến đâu lọc đến đó */
var oTimKiem = document.getElementById("o-timkiem");
oTimKiem.addEventListener("input", function () { timKiem(this.value); });
document.getElementById("form-timkiem").addEventListener("submit", function (e) {
    e.preventDefault();
    timKiem(oTimKiem.value);
});

/* ===== THÊM / SỬA / XÓA SẢN PHẨM (chỉ khi đã đăng nhập) ===== */
var dangSua = null;      /* mã sản phẩm đang sửa (null = đang thêm mới) */
var anhMoi = "";         /* ảnh vừa chọn, dạng data URL */

function moForm(masp) {
    if (!coQuyen()) return;
    dangSua = masp || null;
    anhMoi = "";
    var sp = masp ? timSP(masp) : null;
    document.getElementById("modal-tieude-chu").textContent = sp ? "Sửa sản phẩm" : "Thêm sản phẩm";
    document.getElementById("f-ten").value = sp ? sp.tensp : "";
    document.getElementById("f-loai").value = sp ? sp.loai : "laptop";
    document.getElementById("f-gia").value = sp ? sp.gia : "";
    document.getElementById("f-giagoc").value = sp ? sp.giagoc : "";
    document.getElementById("f-ctsp").value = sp ? sp.ctsp : "";
    document.getElementById("f-anh").value = "";
    var oXem = document.getElementById("f-anh-xem");
    oXem.onerror = function () { this.onerror = null; this.src = ANH_LOI; };
    oXem.src = sp ? duongAnh(sp.hinh) : ANH_TRONG;
    document.getElementById("f-loi").className = "thongbao loi";
    document.getElementById("modal-sp").classList.add("hien");
    document.getElementById("f-ten").focus();
}

function dongForm() {
    document.getElementById("modal-sp").classList.remove("hien");
}

function suaSanPham(masp) { moForm(masp); }

function xoaSanPham(masp) {
    var sp = timSP(masp);
    if (!sp || !coQuyen()) return;
    if (!confirm("Xóa sản phẩm “" + sp.tensp + "”?")) return;
    sanphams.splice(sanphams.indexOf(sp), 1);
    luuSanPhamLocal();
    hienThi();
}

function baoLoiForm(noidung) {
    var o = document.getElementById("f-loi");
    o.textContent = noidung;
    o.className = "thongbao hien loi";
    return false;
}

function luuSanPham() {
    var ten = document.getElementById("f-ten").value.trim();
    var loai = document.getElementById("f-loai").value;
    var gia = Math.round(Number(document.getElementById("f-gia").value));
    var giagocText = document.getElementById("f-giagoc").value;
    var giagoc = giagocText === "" ? gia : Math.round(Number(giagocText));
    var ctsp = document.getElementById("f-ctsp").value.trim();

    if (ten.length < 3) return baoLoiForm("Tên sản phẩm phải có ít nhất 3 ký tự.");
    if (!(gia > 0)) return baoLoiForm("Giá bán phải lớn hơn 0.");
    if (!(giagoc >= gia)) return baoLoiForm("Giá gốc không được nhỏ hơn giá bán.");
    /* Hình ảnh không bắt buộc: không có hình thì trang sản phẩm hiện ảnh lỗi */

    if (dangSua) {
        var sp = timSP(dangSua);
        sp.tensp = ten; sp.loai = loai; sp.gia = gia; sp.giagoc = giagoc; sp.ctsp = ctsp;
        if (anhMoi) sp.hinh = anhMoi;
    } else {
        sanphams.push(new SanPham(taoMaSP(), ten, gia, giagoc, ctsp, anhMoi, loai));
        /* Chuyển tới trang cuối để thấy ngay sản phẩm vừa thêm */
        loaiHienTai = "tatca";
        tuKhoa = "";
        document.getElementById("o-timkiem").value = "";
        trangHienTai = Math.ceil(sanphams.length / SP_MOI_TRANG);
    }
    luuSanPhamLocal();
    dongForm();
    hienThi();
    return false;
}

document.getElementById("f-anh").addEventListener("change", function () {
    var file = this.files[0];
    if (!file) return;
    if (file.type.indexOf("image/") !== 0) {
        baoLoiForm("Vui lòng chọn file ảnh.");
        this.value = "";
        return;
    }
    docAnh(file, function (data) {
        anhMoi = data;
        document.getElementById("f-anh-xem").src = data;
        document.getElementById("f-loi").className = "thongbao loi";
    }, function () {
        baoLoiForm("Không đọc được hình ảnh. Vui lòng chọn ảnh khác.");
    });
});

document.getElementById("btn-them-sp").addEventListener("click", function () { moForm(null); });
document.getElementById("modal-dong").addEventListener("click", dongForm);
document.getElementById("f-huy").addEventListener("click", dongForm);
document.getElementById("modal-sp").addEventListener("mousedown", function (e) {
    if (e.target === this) dongForm();     /* bấm nền tối bên ngoài thì đóng */
});
document.getElementById("btn-khoiphuc").addEventListener("click", function () {
    if (!confirm("Khôi phục danh sách 15 sản phẩm ban đầu? Mọi thay đổi của bạn sẽ mất.")) return;
    try { sessionStorage.removeItem(KHOA_LUU_SP); sessionStorage.removeItem(KHOA_MA_TIEP); } catch (err) {}
    window.location.reload();
});

if (coQuyen()) {
    document.getElementById("thanh-quanly").style.display = "block";
}

hienThi();

/* ===== GIỎ HÀNG ===== */
var giohangs = [];
var canDangNhap = false;     /* true khi khách chưa đăng nhập mà bấm "Thanh toán" */

/* Tạo HTML cho một dòng trong giỏ */
function motsp_giohang(item) {
    var t = "";
    t += '<td width="14%"><img src="' + duongAnh(item.hinh) + '" alt=""' + THUOC_TINH_ANH_LOI + '></td>';
    t += '<td width="27%"><p>' + escHTML(item.tensp) + '</p><small class="ma-sp">' + escHTML(item.masp) + '</small></td>';
    t += '<td width="17%"><p>' + dinhDangGia(item.gia) + 'đ</p></td>';
    t += '<td width="17%"><div class="so-luong">' +
         '<button type="button" aria-label="Giảm số lượng" onclick="doiSoLuong(\'' + item.masp + '\', -1)">' + ic("minus") + '</button>' +
         '<span>' + item.soluong + '</span>' +
         '<button type="button" aria-label="Tăng số lượng" onclick="doiSoLuong(\'' + item.masp + '\', 1)">' + ic("plus") + '</button>' +
         '</div></td>';
    t += '<td width="17%"><p class="thanh-tien">' + dinhDangGia(item.gia * item.soluong) + 'đ</p></td>';
    t += '<td width="8%"><button type="button" class="nut-xoa" title="Xóa khỏi giỏ" aria-label="Xóa khỏi giỏ" onclick="xoagiohang(\'' + item.masp + '\')">' + ic("trash") + '</button></td>';
    return t;
}

/* Tạo HTML cho toàn bộ giỏ */
function xuatgiohang() {
    if (giohangs.length === 0) {
        return '<tr><td class="gio-trong" colspan="6">' + ic("cart") + '<br>Giỏ hàng đang trống</td></tr>';
    }

    var text = "";
    var tong = 0;
    for (var i = 0; i < giohangs.length; i++) {
        text += '<tr>' + motsp_giohang(giohangs[i]) + '</tr>';
        tong += giohangs[i].gia * giohangs[i].soluong;
    }
    text += '<tr class="gio-tong">';
    text += '<td colspan="3">Tổng cộng</td>';
    text += '<td colspan="3"><span class="tong-tien">' + dinhDangGia(tong) + 'đ</span></td>';
    text += '</tr>';
    text += '<tr><td colspan="6"><button type="button" class="nut-thanhtoan" onclick="function_thanhtoan()">' + ic("card") + ' Thanh toán</button></td></tr>';

    /* Chưa đăng nhập mà bấm Thanh toán: thông báo + liên kết Đăng nhập ngay bên dưới */
    if (canDangNhap) {
        text += '<tr><td colspan="6"><div class="gio-canhbao" role="alert">' +
                '<p>' + ic("alert") + ' Bạn cần đăng nhập để đặt hàng.</p>' +
                '<a class="gio-dn-link" href="dangnhap.html?tiep=thanhtoan.html">' + ic("login") + ' Đăng nhập ngay</a>' +
                '<span>Chưa có tài khoản? <a href="dangky.html?tiep=thanhtoan.html">Đăng ký</a></span>' +
                '</div></td></tr>';
    }
    return text;
}

/* Số lượng hiện trên biểu tượng giỏ */
function capNhatDem() {
    var o = document.getElementById("gio-dem");
    if (!o) return;
    var n = 0;
    for (var i = 0; i < giohangs.length; i++) n += giohangs[i].soluong;
    o.textContent = n > 99 ? "99+" : n;
    o.style.display = n > 0 ? "block" : "none";
}

/* Vẽ lại nội dung giỏ */
function showspgiohang() {
    document.getElementById("danhsachsanpham").innerHTML = xuatgiohang();
    capNhatDem();
    if (canDangNhap) {
        var gh = document.getElementById("showgiohang");
        gh.scrollTop = gh.scrollHeight;
    }
}

/* Lưu giỏ vào sessionStorage */
function luugiohang() {
    try {
        sessionStorage.setItem("giohang", JSON.stringify(giohangs));
    } catch (err) {
        console.error("Không lưu được giỏ hàng:", err);
    }
}

/* Mở / đóng giỏ hàng */
function hienThiGioHang() {
    var gh = document.getElementById("showgiohang");
    gh.classList.toggle("hien");
    if (!gh.classList.contains("hien")) canDangNhap = false;
    showspgiohang();
}

function dongGioHang() {
    document.getElementById("showgiohang").classList.remove("hien");
    canDangNhap = false;
}

/* Tìm vị trí sản phẩm trong giỏ theo mã (-1 nếu chưa có) */
function kiemtragiohang(masp) {
    for (var i = 0; i < giohangs.length; i++) {
        if (giohangs[i].masp === masp) {
            return i;
        }
    }
    return -1;
}

/* Thêm sản phẩm vào giỏ (không cần đăng nhập) */
function chonhang(nut, masp) {
    var sp = timSP(masp);
    if (!sp) return;

    var o = nut.parentElement.querySelector('input[name="soluong"]');
    var soluong = Math.floor(Number(o.value));
    if (isNaN(soluong) || soluong < 1) soluong = 1;

    var vt = kiemtragiohang(masp);
    if (vt === -1) {
        giohangs.push({
            masp: sp.masp,
            tensp: sp.tensp,
            hinh: sp.hinh,
            gia: sp.gia,
            soluong: Math.min(99, soluong)
        });
    } else {
        giohangs[vt].soluong = Math.min(99, giohangs[vt].soluong + soluong);
    }

    o.value = 1;
    showspgiohang();
    luugiohang();
}

/* Sửa số lượng trong giỏ bằng nút - / + */
function doiSoLuong(masp, delta) {
    var vt = kiemtragiohang(masp);
    if (vt === -1) return;
    var moi = giohangs[vt].soluong + delta;
    if (moi < 1 || moi > 99) return;
    giohangs[vt].soluong = moi;
    showspgiohang();
    luugiohang();
}

/* Xóa sản phẩm khỏi giỏ */
function xoagiohang(masp) {
    var vt = kiemtragiohang(masp);
    if (vt !== -1) {
        giohangs.splice(vt, 1);
    }
    showspgiohang();
    luugiohang();
}

/* Thanh toán: bắt buộc đăng nhập mới được đặt hàng */
function function_thanhtoan() {
    if (!nguoiDangNhap()) {
        canDangNhap = true;
        showspgiohang();
        return;
    }
    window.location = "thanhtoan.html";
}

/* ===== KHÔI PHỤC GIỎ KHI TẢI LẠI TRANG ===== */
try {
    var luu = sessionStorage.getItem("giohang");
    if (luu) {
        giohangs = JSON.parse(luu);
    }
} catch (err) {
    giohangs = [];
}
showspgiohang();

/* ===== PHÍM TẮT & ĐÓNG GIỎ ===== */
document.addEventListener("keydown", function (e) {
    /* Esc: đóng cửa sổ thêm/sửa trước, rồi đến giỏ hàng */
    if (e.key === "Escape") {
        dongForm();
        dongGioHang();
        return;
    }

    /* Bỏ qua nếu đang gõ trong ô nhập (ô số lượng, ô tìm kiếm...) */
    var tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    /* Phím C: bật/tắt giỏ hàng */
    if (e.key.toLowerCase() === "c" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        hienThiGioHang();
    }
});

/* Nút ✕ */
document.getElementById("dong-gio-hang").addEventListener("click", dongGioHang);

/* Bấm ra ngoài thì đóng giỏ (dùng mousedown để nút "Xóa" không bị coi là "ngoài giỏ"
   sau khi giỏ vẽ lại). */
document.addEventListener("mousedown", function (e) {
    var gh = document.getElementById("showgiohang");
    var nut = document.getElementById("top-right");
    if (!gh.contains(e.target) && !nut.contains(e.target)) {
        dongGioHang();
    }
});
