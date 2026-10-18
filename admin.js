/* ================= TRANG QUẢN TRỊ SẢN PHẨM (chỉ admin) =================
   Cần nạp icons.js, taikhoan.js, dulieu.js trước file này. */

var tenLoai = { laptop: "Laptop", pc: "PC", manhinh: "Màn hình", phukien: "Phụ kiện" };
var dangSuaMa = null;     /* mã sản phẩm đang sửa (null = đang thêm mới) */
var hinhMoi = "";         /* ảnh vừa chọn (data URL đã thu nhỏ) */

/* Chặn người không phải admin */
if (!laAdmin()) {
    window.location = "dangnhap.html";
} else {
    document.getElementById("vung-admin").style.display = "block";
    khoiTaoAdmin();
}

/* ----- Danh sách ----- */
function veDanhSach() {
    var loc = document.getElementById("loc-loai").value;
    var kq = "";
    for (var i = 0; i < sanphams.length; i++) {
        var sp = sanphams[i];
        if (loc !== "tatca" && sp.loai !== loc) continue;
        kq += '<tr>';
        kq += '<td><b>' + escHTML(sp.masp) + '</b></td>';
        kq += '<td><img src="' + duongAnh(sp.hinh) + '" alt=""' + THUOC_TINH_ANH_LOI + '></td>';
        kq += '<td>' + escHTML(sp.tensp) + '</td>';
        kq += '<td>' + escHTML(tenLoai[sp.loai] || sp.loai) + '</td>';
        kq += '<td>' + dinhDangGia(sp.gia) + 'đ</td>';
        kq += '<td class="cot-mota">' + escHTML(sp.ctsp) + '</td>';
        kq += '<td class="hd">';
        kq += '<button type="button" onclick="batDauSua(\'' + sp.masp + '\')">' + ic("pencil") + ' Sửa</button>';
        kq += '<button type="button" class="nut-xoa" onclick="xoaSP(\'' + sp.masp + '\')">' + ic("trash") + ' Xóa</button>';
        kq += '</td></tr>';
    }
    if (kq === "") kq = '<tr><td colspan="7" class="ad-chan">Chưa có sản phẩm nào.</td></tr>';
    document.getElementById("ds-admin").innerHTML = kq;
    document.getElementById("tong-sp").textContent = sanphams.length;
}

/* ----- Form ----- */
function hienMaDuKien() {
    var o = document.getElementById("ma-hien-thi");
    if (dangSuaMa) { o.textContent = dangSuaMa; return; }
    /* Xem trước mã kế tiếp mà không làm tăng bộ đếm */
    var max = 0;
    for (var i = 0; i < sanphams.length; i++) {
        var m = /^#(\d+)$/.exec(sanphams[i].masp);
        if (m && Number(m[1]) > max) max = Number(m[1]);
    }
    var dem = 0;
    try { dem = parseInt(sessionStorage.getItem(KHOA_MA_TIEP), 10) - 1; } catch (e) {}
    if (isNaN(dem)) dem = 0;
    o.textContent = dinhMa(Math.max(max, dem) + 1) + " (tự cấp khi lưu)";
}

function xemTruoc(src) {
    var o = document.getElementById("xem-hinh");
    if (!src) { o.style.display = "none"; return; }
    o.onerror = function () { this.onerror = null; this.src = ANH_LOI; };
    o.src = src;
    o.style.display = "block";
}

function datLaiForm() {
    dangSuaMa = null;
    hinhMoi = "";
    document.getElementById("form-sp").reset();
    document.getElementById("tieude-form").textContent = "Thêm sản phẩm mới";
    document.getElementById("nut-luu").textContent = "Thêm sản phẩm";
    document.getElementById("nut-huy").style.display = "none";
    document.getElementById("goi-y-hinh").textContent = "Không bắt buộc. Nếu không chọn ảnh, trang sản phẩm sẽ hiện ảnh lỗi.";
    xemTruoc("");
    hienMaDuKien();
}

function batDauSua(masp) {
    var sp = timSP(masp);
    if (!sp) return;
    dangSuaMa = masp;
    hinhMoi = "";
    document.getElementById("ten").value = sp.tensp;
    document.getElementById("loai").value = sp.loai;
    document.getElementById("gia").value = sp.gia;
    document.getElementById("giagoc").value = sp.giagoc > sp.gia ? sp.giagoc : "";
    document.getElementById("mota").value = sp.ctsp;
    document.getElementById("hinh").value = "";
    document.getElementById("tieude-form").textContent = "Sửa sản phẩm";
    document.getElementById("nut-luu").textContent = "Lưu thay đổi";
    document.getElementById("nut-huy").style.display = "inline-block";
    document.getElementById("goi-y-hinh").textContent = "Để trống nếu muốn giữ ảnh hiện tại (sản phẩm chưa có ảnh sẽ hiện ảnh lỗi).";
    xemTruoc(duongAnh(sp.hinh));
    hienMaDuKien();
    document.getElementById("thongbao").className = "thongbao";
    document.getElementById("form-sp").scrollIntoView({ behavior: "smooth" });
}

function xoaSP(masp) {
    var sp = timSP(masp);
    if (!sp) return;
    if (!confirm("Xóa sản phẩm " + sp.masp + " - " + sp.tensp + "?")) return;
    sanphams.splice(sanphams.indexOf(sp), 1);
    luuSanPhamLocal();
    if (dangSuaMa === masp) datLaiForm();
    veDanhSach();
    hienThongBao("Đã xóa sản phẩm " + masp + ".", "ok");
}

function khoiTaoAdmin() {
    /* Chọn ảnh: thu nhỏ rồi xem trước */
    document.getElementById("hinh").addEventListener("change", function () {
        var f = this.files[0];
        hinhMoi = "";
        if (!f) {
            var cu = dangSuaMa ? timSP(dangSuaMa) : null;
            xemTruoc(cu ? duongAnh(cu.hinh) : "");
            return;
        }
        if (f.type.indexOf("image/") !== 0) {
            hienThongBao("Tệp đã chọn không phải là hình ảnh.", "loi");
            this.value = "";
            return;
        }
        docAnh(f, function (data) {
            hinhMoi = data;
            xemTruoc(data);
            document.getElementById("thongbao").className = "thongbao";
        }, function () {
            hienThongBao("Không đọc được hình ảnh. Vui lòng chọn ảnh khác.", "loi");
        });
    });

    document.getElementById("nut-huy").addEventListener("click", function () {
        datLaiForm();
        document.getElementById("thongbao").className = "thongbao";
    });
    document.getElementById("loc-loai").addEventListener("change", veDanhSach);

    document.getElementById("form-sp").addEventListener("submit", function (e) {
        e.preventDefault();

        var ten = document.getElementById("ten").value.trim();
        var loai = document.getElementById("loai").value;
        var gia = Math.round(Number(document.getElementById("gia").value));
        var giagocText = document.getElementById("giagoc").value;
        var giagoc = giagocText === "" ? gia : Math.round(Number(giagocText));
        var mota = document.getElementById("mota").value.trim();
        var daChonFile = document.getElementById("hinh").files.length > 0;

        if (ten.length < 3) return hienThongBao("Tên sản phẩm phải có ít nhất 3 ký tự.", "loi");
        if (loai === "") return hienThongBao("Vui lòng chọn loại sản phẩm.", "loi");
        if (!(gia > 0)) return hienThongBao("Giá bán phải lớn hơn 0.", "loi");
        if (!(giagoc >= gia)) return hienThongBao("Giá gốc không được nhỏ hơn giá bán.", "loi");

        /* Hình ảnh không bắt buộc: không có hình thì trang sản phẩm hiện ảnh lỗi */
        if (daChonFile && !hinhMoi)
            return hienThongBao("Hình ảnh đang được xử lý, vui lòng thử lại sau giây lát.", "loi");

        if (dangSuaMa) {
            var sp = timSP(dangSuaMa);
            if (!sp) return hienThongBao("Không tìm thấy sản phẩm cần sửa.", "loi");
            var cu = { tensp: sp.tensp, loai: sp.loai, gia: sp.gia, giagoc: sp.giagoc, ctsp: sp.ctsp, hinh: sp.hinh };
            sp.tensp = ten; sp.loai = loai; sp.gia = gia; sp.giagoc = giagoc; sp.ctsp = mota;
            if (hinhMoi) sp.hinh = hinhMoi;
            if (!luuSanPhamLocal()) {
                for (var k in cu) sp[k] = cu[k];
                return;
            }
            var ma = dangSuaMa;
            datLaiForm();
            veDanhSach();
            return hienThongBao("Đã cập nhật sản phẩm " + ma + ".", "ok");
        }

        /* Thêm mới: cấp mã kế tiếp (#016, #017, ...) */
        var moi = new SanPham(taoMaSP(), ten, gia, giagoc, mota, hinhMoi, loai);
        sanphams.push(moi);
        if (!luuSanPhamLocal()) {
            sanphams.pop();
            return;
        }
        datLaiForm();
        veDanhSach();
        hienThongBao("Đã thêm sản phẩm " + moi.masp + " - " + moi.tensp + ".", "ok");
    });

    veDanhSach();
    hienMaDuKien();
}
