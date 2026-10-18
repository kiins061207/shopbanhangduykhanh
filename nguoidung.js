/* ================= TRANG NGƯỜI DÙNG ================= */
/* Cần nạp taikhoan.js trước file này. */

var tk = nguoiDangNhap();
var SO_THANG_BAO_HANH = 12;
var TT = { cho: "Chờ xác nhận", giao: "Đang giao", xong: "Hoàn thành", huy: "Đã hủy" };
var LOP = { cho: "cho", giao: "giao", xong: "con", huy: "het" };   /* màu nhãn */
var tenMuc = {
    tongquan: "Tổng quan", donhang: "Đơn hàng của tôi", baohanh: "Bảo hành",
    diachi: "Sổ địa chỉ", thongtin: "Thông tin cá nhân", matkhau: "Đổi mật khẩu"
};
var locTT = "tatca";

if (!tk) {
    window.location = "dangnhap.html";     /* chưa đăng nhập */
} else {
    khoiTao();
}

/* ----- Hàm dùng chung ----- */
function dg(so) { return Number(so).toLocaleString("vi-VN"); }

function thoat(chuoi) {                    /* chống chèn HTML */
    var d = document.createElement("div");
    d.textContent = chuoi;
    return d.innerHTML;
}

function docDon() {
    try { return JSON.parse(sessionStorage.getItem("donhangs")) || []; } catch (e) { return []; }
}
function luuDon(ds) {
    try { sessionStorage.setItem("donhangs", JSON.stringify(ds)); } catch (e) {}
}
function donCuaToi() {                     /* đơn của mình, mới nhất lên đầu */
    var kq = [], ds = docDon();
    for (var i = 0; i < ds.length; i++) if (ds[i].email === tk.email) kq.push(ds[i]);
    return kq.reverse();
}
function hetBaoHanh(ngayDat) {
    var d = new Date(ngayDat);
    d.setMonth(d.getMonth() + SO_THANG_BAO_HANH);
    return d;
}
function tb(id, noidung, kieu) {
    var o = document.getElementById(id);
    o.textContent = noidung;
    o.className = "thongbao hien " + kieu;
}

/* ----- Vẽ một thẻ đơn hàng ----- */
function theDon(dh, coNutHuy) {
    var tt = dh.trangthai || "cho";
    var kq = '<div class="nd-don"><div class="nd-don-dau"><b>Mã đơn: ' + thoat(dh.ma) + '</b>';
    kq += '<span>' + new Date(dh.ngay).toLocaleDateString("vi-VN") +
          ' <span class="nd-tag ' + LOP[tt] + '">' + TT[tt] + '</span></span></div><table>';
    for (var j = 0; j < dh.items.length; j++) {
        var it = dh.items[j];
        kq += '<tr><td>' + thoat(it.tensp) + ' &times; ' + it.soluong + '</td><td>' + dg(it.gia * it.soluong) + 'đ</td></tr>';
    }
    kq += '</table>';
    if (dh.diachi) kq += '<div class="nd-don-tong nd-trai">Giao đến: ' + thoat(dh.diachi) + '</div>';
    kq += '<div class="nd-don-tong">Tổng cộng: <b>' + dg(dh.tong) + 'đ</b>';
    if (coNutHuy && tt === "cho") {
        kq += ' <button type="button" class="nd-nut-phu" onclick="huyDon(\'' + dh.ma + '\')">Hủy đơn</button>';
    }
    return kq + '</div></div>';
}

/* ----- Thẻ bên trái ----- */
function veThe() {
    document.getElementById("nd-avatar").textContent = tk.hoten.charAt(0);
    document.getElementById("nd-ten").textContent = tk.hoten;
}

/* ----- Tổng quan ----- */
function veTongQuan() {
    var ds = donCuaToi(), chitieu = 0, conBH = 0, bayGio = new Date();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].trangthai === "huy") continue;
        chitieu += ds[i].tong;
        if (hetBaoHanh(ds[i].ngay) > bayGio) conBH += ds[i].items.length;
    }
    document.getElementById("tk-sodon").textContent = ds.length;
    document.getElementById("tk-chitieu").textContent = dg(chitieu) + "đ";
    document.getElementById("tk-baohanh").textContent = conBH;

    var kq = "";
    for (var k = 0; k < ds.length && k < 3; k++) kq += theDon(ds[k], false);
    if (kq === "") kq = '<p class="nd-trong">Bạn chưa có đơn hàng nào. <a href="index.html">Mua sắm ngay</a></p>';
    document.getElementById("tq-donmoi").innerHTML = kq;
}

/* ----- Đơn hàng (có lọc theo trạng thái) ----- */
function veDonHang() {
    var ds = donCuaToi(), kq = "";
    for (var i = 0; i < ds.length; i++) {
        if (locTT === "tatca" || (ds[i].trangthai || "cho") === locTT) kq += theDon(ds[i], true);
    }
    if (kq === "") kq = '<p class="nd-trong">Không có đơn hàng nào.</p>';
    document.getElementById("ds-donhang").innerHTML = kq;
}

function huyDon(ma) {
    if (!confirm("Bạn chắc chắn muốn hủy đơn " + ma + "?")) return;
    var ds = docDon();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].ma === ma && ds[i].email === tk.email && (ds[i].trangthai || "cho") === "cho") {
            ds[i].trangthai = "huy";
        }
    }
    luuDon(ds);
    veTatCa();
}

/* ----- Bảo hành ----- */
function veBaoHanh() {
    var ds = donCuaToi(), kq = "", bayGio = new Date();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].trangthai === "huy") continue;
        var het = hetBaoHanh(ds[i].ngay), con = het > bayGio;
        for (var j = 0; j < ds[i].items.length; j++) {
            var it = ds[i].items[j];
            kq += '<div class="nd-don"><div class="nd-don-dau"><b>' + thoat(it.tensp) + '</b>';
            kq += '<span class="nd-tag ' + (con ? 'con' : 'het') + '">' + (con ? 'Còn bảo hành' : 'Hết hạn') + '</span></div>';
            kq += '<div class="nd-don-tong nd-trai">Mã đơn: ' + thoat(ds[i].ma) + ' &middot; Hết hạn: <b>' + het.toLocaleDateString("vi-VN") + '</b>';
            if (con) kq += ' <button type="button" class="nd-nut-phu" onclick="yeuCauBH(\'' + ds[i].ma + '\',\'' + it.masp + '\')">Yêu cầu bảo hành</button>';
            kq += '</div></div>';
        }
    }
    if (kq === "") kq = '<p class="nd-trong">Chưa có sản phẩm nào để hiển thị bảo hành.</p>';
    document.getElementById("ds-baohanh").innerHTML = kq;

    var yc = "";
    for (var k = tk.yeucauBH.length - 1; k >= 0; k--) {
        var y = tk.yeucauBH[k];
        yc += '<div class="nd-dc"><b>' + thoat(y.tensp) + '</b> (' + thoat(y.ma) + ') &middot; ' +
              new Date(y.ngay).toLocaleDateString("vi-VN") + '<br>' + thoat(y.noidung) +
              '<br><span class="nd-tag cho">Đang tiếp nhận</span></div>';
    }
    if (yc === "") yc = '<p class="nd-trong">Bạn chưa gửi yêu cầu nào.</p>';
    document.getElementById("ds-yeucau").innerHTML = yc;
}

function yeuCauBH(ma, masp) {
    var nd = prompt("Mô tả lỗi của sản phẩm:");
    if (!nd || nd.trim() === "") return;
    var ten = masp, ds = donCuaToi();
    for (var i = 0; i < ds.length; i++) {
        if (ds[i].ma !== ma) continue;
        for (var j = 0; j < ds[i].items.length; j++) {
            if (ds[i].items[j].masp === masp) ten = ds[i].items[j].tensp;
        }
    }
    tk.yeucauBH.push({ ma: ma, tensp: ten, noidung: nd.trim(), ngay: new Date().toISOString() });
    luuTaiKhoan();
    veBaoHanh();
}

/* ----- Sổ địa chỉ ----- */
function veDiaChi() {
    var kq = "";
    for (var i = 0; i < tk.diachis.length; i++) {
        var d = tk.diachis[i];
        kq += '<div class="nd-dc"><b>' + thoat(d.ten) + '</b> &middot; ' + thoat(d.sdt);
        if (d.macdinh) kq += ' <span class="nd-tag con">Mặc định</span>';
        kq += '<br>' + thoat(d.dc) + '<div class="nd-dc-nut">';
        if (!d.macdinh) kq += '<button type="button" class="nd-nut-phu" onclick="datMacDinh(' + i + ')">Đặt mặc định</button> ';
        kq += '<button type="button" class="nd-nut-phu" onclick="xoaDiaChi(' + i + ')">Xóa</button></div></div>';
    }
    if (kq === "") kq = '<p class="nd-trong">Bạn chưa lưu địa chỉ nào.</p>';
    document.getElementById("ds-diachi").innerHTML = kq;
}

function themDiaChi() {
    var ten = document.getElementById("dc-ten").value.trim();
    var sdt = document.getElementById("dc-sdt").value.replace(/\s/g, "");
    var dc = document.getElementById("dc-dc").value.trim();
    if (ten.length < 2) { tb("tb-diachi", "Vui lòng nhập tên người nhận.", "loi"); return false; }
    if (!/^0\d{9}$/.test(sdt)) { tb("tb-diachi", "Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0.", "loi"); return false; }
    if (dc.length < 8) { tb("tb-diachi", "Vui lòng nhập địa chỉ đầy đủ.", "loi"); return false; }
    tk.diachis.push({ ten: ten, sdt: sdt, dc: dc, macdinh: tk.diachis.length === 0 });
    luuTaiKhoan();
    document.getElementById("dc-ten").value = "";
    document.getElementById("dc-sdt").value = "";
    document.getElementById("dc-dc").value = "";
    tb("tb-diachi", "Đã thêm địa chỉ.", "ok");
    veDiaChi();
    return false;
}

function datMacDinh(vt) {
    for (var i = 0; i < tk.diachis.length; i++) tk.diachis[i].macdinh = (i === vt);
    luuTaiKhoan();
    veDiaChi();
}

function xoaDiaChi(vt) {
    if (!confirm("Xóa địa chỉ này?")) return;
    var laMacDinh = tk.diachis[vt].macdinh;
    tk.diachis.splice(vt, 1);
    if (laMacDinh && tk.diachis.length > 0) tk.diachis[0].macdinh = true;
    luuTaiKhoan();
    veDiaChi();
}

/* ----- Thông tin cá nhân & mật khẩu ----- */
function luuThongTin() {
    var hoten = document.getElementById("nd-f-hoten").value.trim();
    var sdt = document.getElementById("nd-f-sdt").value.replace(/\s/g, "");
    if (hoten.length < 2) { tb("tb-thongtin", "Vui lòng nhập họ và tên.", "loi"); return false; }
    if (!/^0\d{9}$/.test(sdt)) { tb("tb-thongtin", "Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0.", "loi"); return false; }
    tk.hoten = hoten;
    tk.sdt = sdt;
    luuTaiKhoan();
    veThe();
    capNhatMenu();
    tb("tb-thongtin", "Đã lưu thông tin.", "ok");
    return false;
}

function doiMatKhau() {
    var cu = document.getElementById("nd-mk-cu").value;
    var moi = document.getElementById("nd-mk-moi").value;
    var lai = document.getElementById("nd-mk-lai").value;
    if (cu !== tk.matkhau) { tb("tb-matkhau", "Mật khẩu hiện tại không đúng.", "loi"); return false; }
    if (moi.length < 6) { tb("tb-matkhau", "Mật khẩu mới phải có ít nhất 6 ký tự.", "loi"); return false; }
    if (moi !== lai) { tb("tb-matkhau", "Nhập lại mật khẩu chưa khớp.", "loi"); return false; }
    tk.matkhau = moi;
    luuTaiKhoan();
    document.getElementById("nd-mk-cu").value = "";
    document.getElementById("nd-mk-moi").value = "";
    document.getElementById("nd-mk-lai").value = "";
    tb("tb-matkhau", "Đổi mật khẩu thành công.", "ok");
    return false;
}

/* ----- Chuyển mục ----- */
function hienMuc(muc) {
    if (!tenMuc[muc]) muc = "tongquan";
    var phan = document.querySelectorAll(".nd-muc");
    for (var i = 0; i < phan.length; i++) phan[i].classList.toggle("hien", phan[i].id === "muc-" + muc);
    var links = document.querySelectorAll(".nd-menu a[data-muc]");
    for (var j = 0; j < links.length; j++) links[j].classList.toggle("active", links[j].dataset.muc === muc);
    document.getElementById("nd-muc-hientai").textContent = tenMuc[muc];
}

function veTatCa() {
    veThe(); veTongQuan(); veDonHang(); veBaoHanh(); veDiaChi();
}

function khoiTao() {
    if (!Array.isArray(tk.diachis)) tk.diachis = [];
    if (!Array.isArray(tk.yeucauBH)) tk.yeucauBH = [];

    veTatCa();
    document.getElementById("nd-f-hoten").value = tk.hoten;
    document.getElementById("nd-f-email").value = tk.email;
    document.getElementById("nd-f-sdt").value = tk.sdt;

    var links = document.querySelectorAll("a[data-muc]");
    for (var i = 0; i < links.length; i++) {
        links[i].addEventListener("click", function (e) {
            e.preventDefault();
            history.replaceState(null, "", "#" + this.dataset.muc);
            hienMuc(this.dataset.muc);
        });
    }

    var tabs = document.querySelectorAll("#nd-tabs button");
    for (var t = 0; t < tabs.length; t++) {
        tabs[t].addEventListener("click", function () {
            locTT = this.dataset.tt;
            for (var u = 0; u < tabs.length; u++) tabs[u].classList.toggle("active", tabs[u] === this);
            veDonHang();
        });
    }

    document.getElementById("nd-dangxuat").addEventListener("click", function (e) {
        e.preventDefault();
        dangXuat();
        window.location = "index.html";
    });

    hienMuc(window.location.hash.replace("#", ""));
}
