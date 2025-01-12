var app = angular.module("donhang-app", [])
app.controller("donhang-ctrl", function ($scope, $http) {
    $scope.donHang = {}
    $scope.donHangAdd = {
        phuongThucThanhToan: "0"
    }
    $scope.chiTietDonHang = []
    $scope.sanPham = [];
    const limit = 10;
    $scope.er = {}
    $scope.dateNow = new Date().getTime();
    $scope.khachHang = []
    $scope.erAdd = {}

    $scope.showPolicy = false;
    $scope.agreePolicy = false;


    $scope.closeModal = function (id) {
        $(id).modal('hide')
        $scope.donHang = {}
    }
    $("#chuaXacNhanDetail").on('hide.bs.modal', function () {
        $scope.donHangChuaXacNhan = {}
        console.log("11")
        $scope.chiTietDonHang.length = 0
    });
    $("#donHangDetail").on('hide.bs.modal', function () {
        $scope.donHang = {}
        $scope.chiTietDonHang.length = 0
    });

    $scope.getTotalPrice = function () {
        let total = 0;
        $scope.chiTietDonHang.forEach(c => total += (c.donGiaSauGiam * c.soLuong))
        return total
    }
    ///////////////////////
    $scope.getSanPham = function () {
        $http.get("/admin/san-pham/1/get-all-ctsp").then(r => {
            $scope.sanPham = r.data
        }).catch(e => console.log(e))
    }
    $scope.getSanPham()
    $scope.addChiTietDonHang = function (item) {
        $scope.chiTietDonHang.push({
            sanPham: item.sanPham,
            anh: item.sanPhamDTO.anh.length == 0 ? "default.png" : item.sanPhamDTO.anh[0],
            size: item.size,
            soLuong: 1,
            donGia: item.sanPhamDTO.giaBan,
            donGiaSauGiam: item.sanPhamDTO.giaNiemYet,
            idChiTietSanPham: item.id
        })
        $scope.er.soLuongSP = ""
    }
    $scope.searchSanPham = function () {
        $http.get("/admin/san-pham/1/get-all-ctsp?keyWord=" + $scope.inputProduct).then(r => {
            $scope.sanPham = r.data
        }).catch(e => console.log(e))
    }
    $scope.checkSanPhamInDonHang = function (idCTSP) {
        let result = false;
        $scope.chiTietDonHang.forEach(d => {
            if (d.idChiTietSanPham == idCTSP) {
                result = true;
            }
        })
        return result;
    }

    ///////////////////////////////////////
    //Get Khách Hàng
    $scope.keyWordKhachHang = ""
    $scope.getAllKhachHang = function () {
        $http.get("/admin/khach-hang/get-all-khach-hang?limit=1000&&keyWord=" + $scope.keyWordKhachHang).then(r => {
            $scope.khachHang = r.data.content;
        }).catch(e => console.log(e))
    }
    $scope.getAllKhachHang()
    $scope.addKhachHangToDonHang = function () {
        let value = document.getElementById("khachHangSL").value
        if (value != 'null') {

            $http.get("/admin/khach-hang/detail/" + value).then(r => {
                $scope.donHangAdd.tenNguoiNhan = r.data.hoVaTen
                $scope.donHangAdd.email = r.data.email
                $scope.donHangAdd.soDienThoai = r.data.soDienThoai
                $scope.getDiaChiKhachHang(value)
            })

            $scope.donHangAdd.nguoiSoHuu = {
                username: value

            }
            document.getElementById("btnAddKh").style.display = "none";
        } else {
            $scope.donHangAdd = {
                phuongThucThanhToan: $scope.donHangAdd.phuongThucThanhToan,
                tenNguoiNhan: "Khách lẻ",
                soDienThoai: "0000000000"
            }
            document.getElementById("btnAddKh").style.display = "block";
        }
    }
    $scope.getDiaChiKhachHang = function (username) {
        $http.get("/dia-chi/get-mac-dinh/" + username).then(r => {
            if (r.data.thanhPhoCode == undefined) return
            $scope.donHangAdd.thanhPhoCode = r.data.thanhPhoCode + ""

            //Lấy quận huyện
            $scope.giaoHangNhanh.getDistricts(r.data.thanhPhoCode)//hàm lấy quận huyện truyền vào thành phố
            $scope.donHangAdd.quanHuyenCode = r.data.quanHuyenCode + "" // set selected quận huyện

            $scope.giaoHangNhanh.getWards(r.data.quanHuyenCode)//hàm lấy xã truyền vào quận huyện
            $scope.donHangAdd.xaPhuongCode = r.data.xaPhuongCode + "" //set selected xã

            $scope.donHangAdd.diaChiChiTiet = r.data.diaChiChiTiet

            $scope.giaoHangNhanh.getFeeShippedAdd()
        })
    }
    $scope.addKhachHang = function () {
        var data = {
            username: $scope.donHangAdd.soDienThoai,
            password: $scope.donHangAdd.soDienThoai,
            hoVaTen: $scope.donHangAdd.tenNguoiNhan,
            soDienThoai: $scope.donHangAdd.soDienThoai,
            email: $scope.donHangAdd.email
        }
        $http.post("/admin/khach-hang", data).then(r => {
            var khachHangSL = document.getElementById("khachHangSL")
            var option = document.createElement("option");
            option.text = data.hoVaTen + ' - ' + data.soDienThoai;
            option.value = data.username
            khachHangSL.add(option, khachHangSL[khachHangSL.length - 1]);
            khachHangSL.value = option.value;
            document.getElementById("btnAddKh").style.display = "none";
            alertify.success("Lưu khách hàng thành công")
        }).catch(e => {
            alertify.error("Lưu khách hàng thất bại")
            if (e.data.soDienThoai != undefined) $scope.erAdd.soDienThoai = e.data.soDienThoai
            $scope.erAdd.tenNguoiNhan = e.data.hoVaTen
            $scope.erAdd.email = e.data.email
        })

        console.log(data)
    }

    ///////Hàm dùng chung
    //hủy đơn 
    $scope.id = []
    $scope.trangThaiDonHang = 2
    $scope.huyDH = function () {
        console.log($scope.trangThaiDonHang)
        if ($scope.trangThaiDonHang == 1) {
            $scope.daXacNhan.huyDH();
        } else if ($scope.trangThaiDonHang == 2) {
            $scope.chuaXacNhan.huyDH();
        } else if ($scope.trangThaiDonHang == 3) {
            $scope.dangGiao.huyDH();
        } else if ($scope.trangThaiDonHang == 5) {
            $scope.chuaThanhToan.huyDH();
        }
        $scope.getSanPham()
        $scope.inputProduct = ""

    }

    /////////////////////Check Box
    $scope.setCheckAll = function (id, name) {
        console.log($scope.trangThaiDonHang)
        let setCheckbox = document.getElementById(id)

        let checkBox = document.getElementsByName(name)
        if (setCheckbox.checked == true) {
            checkBox.forEach(c => {
                c.checked = true
            })
        } else {
            checkBox.forEach(c => {
                c.checked = false
            })
        }
        if ($scope.trangThaiDonHang == 1) {
            $scope.daXacNhan.checkButton();
        } else if ($scope.trangThaiDonHang == 2) {
            $scope.chuaXacNhan.checkButton()
        } else if ($scope.trangThaiDonHang == 3) {
            $scope.dangGiao.checkButton();
        }
        // else if ($scope.trangThaiDonHang == 5) {
        //     $scope.chuaThanhToan.checkButton();
        // }
    }
    $scope.checkAllChecked = function (name, idCheckBoxSetAll) {
        let checkBox = document.getElementsByName(name)
        let check = true;
        checkBox.forEach(c => {
            if (c.checked == false) {
                check = false
            }
        })
        document.getElementById(idCheckBoxSetAll).checked = check
        if ($scope.trangThaiDonHang == 1) {
            $scope.daXacNhan.checkButton();
        } else if ($scope.trangThaiDonHang == 2) {
            $scope.chuaXacNhan.checkButton()
        } else if ($scope.trangThaiDonHang == 3) {
            $scope.dangGiao.checkButton();
        }
        // else if ($scope.trangThaiDonHang == 5) {
        //     $scope.chuaThanhToan.checkButton();
        // }
    }

    ////////////////////////////////////////
    $scope.clearFormAdd = function () {
        $scope.donHangAdd = {
            phuongThucThanhToan: "0",
            tenNguoiNhan: "Khách lẻ",
            soDienThoai: "0000000000"
        }
        $scope.chiTietDonHang.length = 0
        $('#mySelect2').val('null').trigger('change');
        document.getElementById("khachHangSL").value = "null"
        document.getElementById("btnAddKh").style.display = "block";
    }
    $scope.themDonHang = function () {
        alertify.confirm("Tạo đơn hàng?", function () {
            let indexCity = $scope.giaoHangNhanh.citys.findIndex(c => c.ProvinceID == $scope.donHangAdd.thanhPhoCode)
            let indexDistrict = $scope.giaoHangNhanh.districts.findIndex(d => d.DistrictID == $scope.donHangAdd.quanHuyenCode)
            let indexWard = $scope.giaoHangNhanh.wards.findIndex(w => w.WardCode == $scope.donHangAdd.xaPhuongCode)

            $scope.donHangAdd.thanhPhoName = $scope.giaoHangNhanh.citys[indexCity] == undefined ? "" : $scope.giaoHangNhanh.citys[indexCity].ProvinceName;
            $scope.donHangAdd.quanHuyenName = $scope.giaoHangNhanh.districts[indexDistrict] == undefined ? "" : $scope.giaoHangNhanh.districts[indexDistrict].DistrictName;
            $scope.donHangAdd.xaPhuongName = $scope.giaoHangNhanh.wards[indexWard] == undefined ? "" : $scope.giaoHangNhanh.wards[indexWard].WardName
            console.log($scope.donHangAdd, $scope.chiTietDonHang)

            let chiTietDonHang = [];
            $scope.chiTietDonHang.forEach(c => {
                chiTietDonHang.push({
                    id: c.id,
                    donHangID: $scope.chuaXacNhan.detail.ma,
                    sanPhamCT: c.idChiTietSanPham,
                    soLuong: c.soLuong,
                    donGia: c.donGia,
                    donGiaSauGiam: c.donGiaSauGiam
                })
            })
            let formData = new FormData();
            formData.append("donHang", new Blob([JSON.stringify($scope.donHangAdd)], {
                type: 'application/json'
            }))
            formData.append("chiTietDonHang", new Blob([JSON.stringify(chiTietDonHang)], {
                type: 'application/json'
            }))
            $http.post("/admin/don-hang", formData, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).then(r => {
                alertify.success("Thêm thành công")
                $scope.chuaThanhToan.init()
                $scope.chuaXacNhan.init()
                $scope.chuaThanhToan.getList($scope.chuaThanhToan.page)
                $scope.chuaXacNhan.getList($scope.chuaXacNhan.page)
                $scope.donHangAdd = {
                    phuongThucThanhToan: "0",
                    tenNguoiNhan: "Khách lẻ",
                    soDienThoai: "0000000000"
                }
                $scope.chiTietDonHang.length = 0
                $('#mySelect2').val('null').trigger('change');
                document.getElementById("khachHangSL").value = "null"
                document.getElementById("btnAddKh").style.display = "block";
                $('#add').modal('hide')
                $scope.getSanPham()
                $scope.inputProduct = ""
            }).catch(e => {
                $scope.erAdd = e.data
                console.log(e)
                alertify.error("Thêm thất bại")
            })
        }, function () { })
    }
    /////////////////////////////////////////
    $scope.updateTrangThaiDonHang = function (ma, trangThai) {
        let success = true;
        $http.get("/admin/don-hang/update-trang-thai/" + ma + "?trangThai=" + trangThai).then(r => {
            success = true;
        }).catch(e => {
            console.log(e)
            success = false
        })
        return success
    }
    ////////////////////////////////////////////
    $scope.giaoHangNhanh = {
        tokenShop: "954c787d-2876-11ee-96dc-de6f804954c9",
        headers: { headers: { token: "954c787d-2876-11ee-96dc-de6f804954c9" } },
        headersShop: { headers: { token: "954c787d-2876-11ee-96dc-de6f804954c9", ShopId: 4379549 } },
        districts: [],
        wards: [],
        getCitys() {
            $http.get("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", this.headers).then(res => {
                this.citys = res.data.data
            }).catch(err => console.log(err))
        },
        getDistricts(idCity) {
            $http.get("https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=" + idCity, this.headers).then(res => {
                this.districts = res.data.data;
            }).catch(err => console.log(err))
        },
        getWards(idDistrict) {
            $http.get("https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=" + idDistrict, this.headers).then(res => {
                this.wards = res.data.data;
            }).catch(err => console.log(err))
        },
        cityChange(idCity) {
            $http.get("https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=" + idCity, this.headers).then(res => {
                this.districts = res.data.data;
                this.wards.length = 0
            }).catch(err => console.log(err))
            // $scope.chuaXacNhan.detail.quanHuyenCode = this.districts[0].DistrictID +""
        },
        districtChange(idDistrict) {
            $http.get("https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=" + idDistrict, this.headers).then(res => {
                this.wards = res.data.data;
            }).catch(err => console.log(err))
        },
        getFeeShipped() {
            let data = {
                "service_type_id": 2,
                "to_district_id": parseInt($scope.chuaXacNhan.detail.quanHuyenCode),
                "to_ward_code": $scope.chuaXacNhan.detail.xaPhuongCode,
                "height": 10,
                "length": 10,
                "weight": 200,
                "width": 10
            }
            $http.post("https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee", data, this.headersShop).then(res => {
                $scope.chuaXacNhan.detail.phiGiaoHang = res.data.data.total;
            }).catch(err => console.log(err));
        },
        getFeeShippedAdd() {
            let data = {
                "service_type_id": 2,
                "to_district_id": parseInt($scope.donHangAdd.quanHuyenCode),
                "to_ward_code": $scope.donHangAdd.xaPhuongCode,
                "height": 10,
                "length": 10,
                "weight": 200,
                "width": 10
            }
            $http.post("https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee", data, this.headersShop).then(res => {
                $scope.donHangAdd.phiGiaoHang = res.data.data.total;
            }).catch(err => console.log(err));
        }
    }
    $scope.giaoHangNhanh.getCitys()
    //////////////////////////////////////////// các trang trạng thái admin
    $scope.chuaXacNhan = {
        list: [],
        detail: {},
        totalElement: 0,
        totalPage: 0,
        page: 0,
        id: [],
        pages: [],
        sdtSearch: "",
        init() {
            $scope.trangThaiDonHang = 2
            $http.get("/admin/don-hang/get-by-trangthai?trangThai=2").then(r => {
                this.totalElement = r.data.totalElements;
                this.totalPage = r.data.totalPages;
                this.setPageNumbers()
            })

        },
        getList(pageNumber) {
            $scope.trangThaiDonHang = 2
            this.page = pageNumber;
            $http.get("/admin/don-hang/get-by-trangthai?trangThai=2&pageNumber=" + pageNumber + "&sdt=" + this.sdtSearch).then(r => {
                this.list = r.data.content;
                this.totalPage = r.data.totalPages;
                this.setPageNumbers()
            })
        },
        xacNhanDH(ma) {
            alertify.confirm("Xác nhận đơn hàng?", function () {

                $http.get("/admin/don-hang/update-trang-thai/" + ma + "?trangThai=1").then(r => {
                    if ($scope.chuaXacNhan.page == $scope.chuaXacNhan.totalPage - 1) {
                        if ($scope.chuaXacNhan.list.length == 1 && $scope.chuaXacNhan.page > 0) {
                            $scope.chuaXacNhan.page--;
                        }
                    }
                    $scope.chuaXacNhan.getList($scope.chuaXacNhan.page)
                    $scope.chuaXacNhan.init()
                    document.getElementById('checkAllChuaXacNhan').checked = false
                    $scope.daXacNhan.totalElement++
                    alertify.success("Xác nhận thành công")
                }).catch(e => {
                    alertify.error("Xác nhận thất bại")
                    console.log(e)
                })

            }, function () {
                alertify.error("Xác nhận thất bại")
            })
        },
        xacNhanDHAll() {
            alertify.confirm("Xác nhận đơn hàng?", function () {
                let checkBox = document.getElementsByName('checkChuaXacNhan')
                checkBox.forEach(c => {
                    if (c.checked == true) {
                        $scope.chuaXacNhan.id.push(c.value)
                        $scope.daXacNhan.totalElement++
                    }
                })

                $http.put("/admin/don-hang/update-trang-thai?trangThai=1", $scope.chuaXacNhan.id).then(r => {
                    if ($scope.chuaXacNhan.page == $scope.chuaXacNhan.totalPage - 1) {
                        if ($scope.chuaXacNhan.list.length == 1 && $scope.chuaXacNhan.page > 0) {
                            $scope.chuaXacNhan.page--;
                        }
                    }
                    $scope.chuaXacNhan.getList($scope.chuaXacNhan.page)
                    $scope.chuaXacNhan.init()
                    $scope.chuaXacNhan.id = []
                    document.getElementById('checkAllChuaXacNhan').checked = false
                    alertify.success("Xác nhận thành công")
                }).catch(e => {
                    console.log(e)
                    alertify.error("Xác nhận thất bại")
                })
            }, function () {
                alertify.error("Xác nhận thất bại")
            })
        },
        setIdDonHang(id) {
            this.id = []
            this.id.push(id)
        },
        setAllIdDonHang() {
            this.id = []
            let checkBox = document.getElementsByName('checkChuaXacNhan')
            checkBox.forEach(c => {
                if (c.checked == true) {
                    this.id.push(c.value)
                }
            })
        },
        huyDH() {

            if ($scope.lyDo == null || $scope.length == 0 || $scope.lyDo == undefined) {
                $scope.messLyDo = "Không để trống lý do hủy"
                alertify.error("Hủy đơn hàng thất bại")
                return
            } else if ($scope.lyDo.length == 200) {
                $scope.messLyDo = "Lý do hủy chỉ tối đa 200 ký tự"
                alertify.error("Hủy đơn hàng thất bại")
                return;
            }

            $http.put("/admin/don-hang/huy-don-hang?lyDo=" + $scope.lyDo, this.id).then(r => {
                if (this.page == this.totalPage - 1) {
                    if (this.list.length == 1 && this.page > 0) {
                        this.page--;
                    }
                }
                this.getList(this.page)
                this.init()
                $scope.lyDo = null;
                $scope.messLyDo = "";
                this.id = []
                $('#closeHuy').click()
                document.getElementById('checkAllChuaXacNhan').checked = false
                alertify.success("Hủy đơn hàng thành công")
            }).catch(e => {
                alertify.error("Hủy đơn hàng thất bại")
                console.log(e)
            })
        },
        getDetail(ma) {
            $http.get("/admin/don-hang/" + ma).then(r => {
                this.detail = r.data;
                this.detail.thanhPhoCode = this.detail.thanhPhoCode + ""

                //Lấy quận huyện
                $scope.giaoHangNhanh.getDistricts(this.detail.thanhPhoCode)//hàm lấy quận huyện truyền vào thành phố
                this.detail.quanHuyenCode = this.detail.quanHuyenCode + "" // set selected quận huyện

                $scope.giaoHangNhanh.getWards(this.detail.quanHuyenCode)//hàm lấy xã truyền vào quận huyện
                this.detail.xaPhuongCode = this.detail.xaPhuongCode + "" //set selected xã

                $('#chuaXacNhanDetail').modal('show')
            }).catch(e => console.log(e))

            $http.get("/admin/chi-tiet-don-hang/" + ma).then(r => {
                $scope.chiTietDonHang = r.data;
            }).catch(e => console.log(e))
        },
        capNhat() {
            if ($scope.chuaXacNhan.detail.lyDoThayDoi == null || $scope.chuaXacNhan.detail.lyDoThayDoi == 0 || $scope.chuaXacNhan.detail.lyDoThayDoi == undefined) {
                $scope.messLyDoThayDoi = "Không để trống lý do thay đổi thông tin đơn hàng"
                alertify.error("Cập nhật đơn hàng thất bại")
                return
            } else if ($scope.chuaXacNhan.detail.lyDoThayDoi.length >= 200) {
                $scope.messLyDoThayDoi = "Lý do thay đổi thông tin đơn hàng tối đa 200 ký tự"
                alertify.error("Cập nhật đơn hàng thất bại")
                return;
            }
            alertify.confirm("Cập nhật đơn hàng?", function () {
                // if($scope.chuaXacNhan.detail.phiGiaoHang<0){
                //     alertify.error("Phí giao hàng phải >= 0")
                //     return
                // }
                let indexCity = $scope.giaoHangNhanh.citys.findIndex(c => c.ProvinceID == $scope.chuaXacNhan.detail.thanhPhoCode)
                let indexDistrict = $scope.giaoHangNhanh.districts.findIndex(d => d.DistrictID == $scope.chuaXacNhan.detail.quanHuyenCode)
                let indexWard = $scope.giaoHangNhanh.wards.findIndex(w => w.WardCode == $scope.chuaXacNhan.detail.xaPhuongCode)

                $scope.chuaXacNhan.detail.thanhPhoName = $scope.giaoHangNhanh.citys[indexCity] == undefined ? "" : $scope.giaoHangNhanh.citys[indexCity].ProvinceName;
                $scope.chuaXacNhan.detail.quanHuyenName = $scope.giaoHangNhanh.districts[indexDistrict] == undefined ? "" : $scope.giaoHangNhanh.districts[indexDistrict].DistrictName;
                $scope.chuaXacNhan.detail.xaPhuongName = $scope.giaoHangNhanh.wards[indexWard] == undefined ? "" : $scope.giaoHangNhanh.wards[indexWard].WardName
                let data = {
                    ma: $scope.chuaXacNhan.detail.ma,
                    nguoiSoHuu: { username: $scope.chuaXacNhan.detail.nguoiSoHuu },
                    voucherCode: $scope.chuaXacNhan.detail.voucherCode,
                    tenNguoiNhan: $scope.chuaXacNhan.detail.tenNguoiNhan,
                    soDienThoai: $scope.chuaXacNhan.detail.soDienThoai,
                    email: $scope.chuaXacNhan.detail.email,
                    thanhPhoName: $scope.chuaXacNhan.detail.thanhPhoName,
                    thanhPhoCode: $scope.chuaXacNhan.detail.thanhPhoCode,
                    quanHuyenName: $scope.chuaXacNhan.detail.quanHuyenName,
                    quanHuyenCode: $scope.chuaXacNhan.detail.quanHuyenCode,
                    xaPhuongName: $scope.chuaXacNhan.detail.xaPhuongName,
                    xaPhuongCode: $scope.chuaXacNhan.detail.xaPhuongCode,
                    diaChiChiTiet: $scope.chuaXacNhan.detail.diaChiChiTiet,
                    ngayDatHang: $scope.chuaXacNhan.detail.ngayDatHang,
                    trangThai: $scope.chuaXacNhan.detail.trangThai,
                    ghiChu: $scope.chuaXacNhan.detail.ghiChu,
                    lyDoThayDoi: $scope.chuaXacNhan.detail.lyDoThayDoi,
                    tienGiam: $scope.chuaXacNhan.detail.tienGiam,
                    phiGiaoHang: $scope.chuaXacNhan.detail.phiGiaoHang,
                    trangThaiDetail: $scope.chuaXacNhan.detail.trangThai,
                    phuongThucThanhToan: $scope.chuaXacNhan.detail.phuongThucThanhToan == 'true' ? 0 : 1
                }
                let chiTietDonHang = [];
                $scope.chiTietDonHang.forEach(c => {
                    chiTietDonHang.push({
                        id: c.id,
                        donHangID: $scope.chuaXacNhan.detail.ma,
                        sanPhamCT: c.idChiTietSanPham,
                        soLuong: c.soLuong,
                        donGia: c.donGia,
                        donGiaSauGiam: c.donGiaSauGiam
                    })
                })
                let formData = new FormData();
                formData.append("donHang", new Blob([JSON.stringify(data)], {
                    type: 'application/json'
                }))
                formData.append("chiTietDonHang", new Blob([JSON.stringify(chiTietDonHang)], {
                    type: 'application/json'
                }))
                formData.append("lyDoThayDoi", $scope.chuaXacNhan.detail.lyDoThayDoi);
                $http.put("/admin/don-hang", formData, {
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
                }).then(r => {
                    let index = $scope.chuaXacNhan.list.findIndex(d => d.ma == $scope.chuaXacNhan.detail.ma)
                    $scope.chuaXacNhan.list[index] = $scope.chuaXacNhan.detail
                    alertify.success("Cập nhật thành công")
                    $scope.chuaThanhToan.init()
                    $scope.chuaXacNhan.init()
                    $scope.chuaXacNhan.getList($scope.chuaXacNhan.page)
                    $scope.chuaThanhToan.getList($scope.chuaThanhToan.page)
                    $scope.getSanPham()
                    $scope.inputProduct = ""
                })
                // .catch(e => {
                //     $scope.er = e.data
                //     console.log(e)
                //     alertify.error("Cập nhật thất bại")
                // })
            },
                function () {
                    alertify.error("Cập nhật thất bại")
                })

        },
        setPageNumbers() {
            let numbers = [];
            let i = this.page
            let lengthLast = this.totalPage <= 3 ? this.totalPage : this.page + 3
            let lengthFirst = this.totalPage >= 2 ? this.page - 2 : 0

            if (lengthLast > this.totalPage) {
                lengthLast = this.totalPage
                i = lengthLast - 2
            }
            if (lengthFirst < 0) lengthFirst = 0

            for (lengthFirst; i > lengthFirst; lengthFirst++) {
                numbers.push(lengthFirst)
            }
            for (i; i < lengthLast; i++) {
                numbers.push(i)
            }
            this.pages = numbers;
        },
        updateSoLuong(idCTSP, soLuong) {
            let index = $scope.chiTietDonHang.findIndex(c => c.idChiTietSanPham == idCTSP)
            let chiTietDonHang = $scope.chiTietDonHang[index]
            $http.get("/admin/san-pham/1/kiem-tra-so-luong/" + idCTSP + "?soLuong=" + soLuong + "&idCTDH=" + (chiTietDonHang.id == undefined ? "" : chiTietDonHang.id)).then(r => {
                $scope.chiTietDonHang[index].soLuong = soLuong
                $scope.getTotalPrice()
            }).catch(e => {
                if (chiTietDonHang.id == undefined) {
                    chiTietDonHang.soLuong = 1
                } else {
                    $http.get("/admin/chi-tiet-don-hang/detail/" + chiTietDonHang.id).then(r => {
                        $scope.chiTietDonHang[index].soLuong = r.data.soLuong
                    }).catch(e => console.log(e))
                }
                alertify.error("số lượng đã vượt quá số lượng sản phẩm!")
            })


        },
        subtractSoLuong(idCTSP) {
            let index = $scope.chiTietDonHang.findIndex(c => c.idChiTietSanPham == idCTSP)
            let chiTietDonHang = $scope.chiTietDonHang[index]
            let soLuong = chiTietDonHang.soLuong - 1


            $http.get("/admin/san-pham/1/kiem-tra-so-luong/" + chiTietDonHang.idChiTietSanPham + "?soLuong=" + soLuong + "&idCTDH=" + (chiTietDonHang.id == undefined ? "" : chiTietDonHang.id)).then(r => {
                $scope.chiTietDonHang[index].soLuong = soLuong
            }).catch(e => {
                alertify.error("số lượng sản phẩm đã đạt giá trị tối thiểu")
            })


        },
        addSoLuong(idCTSP) {
            let index = $scope.chiTietDonHang.findIndex(c => c.idChiTietSanPham == idCTSP)
            let chiTietDonHang = $scope.chiTietDonHang[index]
            let soLuong = parseInt(chiTietDonHang.soLuong) + 1

            $http.get("/admin/san-pham/1/kiem-tra-so-luong/" + chiTietDonHang.idChiTietSanPham + "?soLuong=" + soLuong + "&idCTDH=" + (chiTietDonHang.id == undefined ? "" : chiTietDonHang.id)).then(r => {
                $scope.chiTietDonHang[index].soLuong = soLuong
            }).catch(e => {
                alertify.error("số lượng sản phẩm đã đạt giá trị tối đa")
            })

        },
        removeSanPham(idCTDH) {
            let index = $scope.chiTietDonHang.findIndex(c => c.id == idCTDH)
            $scope.chiTietDonHang.splice(index, 1)
        },
        checkButton() {
            let checkboxs = document.getElementsByName('checkChuaXacNhan')
            let check = true;
            checkboxs.forEach(c => {
                if (c.checked == true) {
                    check = false;
                }
            })
            document.getElementById("huyAll1").disabled = check;
            document.getElementById("xacNhanAll1").disabled = check;
        }
    }
    $scope.chuaXacNhan.init()
    $scope.chuaXacNhan.getList(0)

    $scope.chuaThanhToan = {
        list: [],
        detail: {},
        totalElement: 0,
        totalPage: 0,
        page: 0,
        id: [],
        pages: [],
        sdtSearch: "",
        init() {
            $scope.trangThaiDonHang = 5
            $http.get("/admin/don-hang/get-by-trangthai?trangThai=5").then(r => {
                this.totalElement = r.data.totalElements;
                this.totalPage = r.data.totalPages;
                this.setPageNumbers()
            })
        },
        getList(pageNumber) {
            $scope.trangThaiDonHang = 5
            this.page = pageNumber;
            $http.get("/admin/don-hang/get-by-trangthai?trangThai=5&pageNumber=" + pageNumber + "&sdt=" + this.sdtSearch).then(r => {
                this.list = r.data.content;
                this.totalPage = r.data.totalPages;
                this.setPageNumbers()
            })
        },
        xacNhanDH(ma) {
            alertify.confirm("Xác nhận thanh toán đơn hàng?", function () {

                $http.get("/admin/don-hang/update-trang-thai/" + ma + "?trangThai=1").then(r => {
                    if ($scope.chuaThanhToan.page == $scope.chuaThanhToan.totalPage - 1) {
                        if ($scope.chuaThanhToan.list.length == 1 && $scope.chuaThanhToan.page > 0) {
                            $scope.chuaThanhToan.page--;
                        }
                    }
                    $scope.chuaThanhToan.getList($scope.chuaThanhToan.page)
                    $scope.chuaThanhToan.init()
                    document.getElementById('checkAllChuaTT').checked = false
                    $scope.daXacNhan.totalElement++
                    alertify.success("Xác nhận thanh toán thành công")
                }).catch(e => {
                    console.log(e)
                    alertify.error("Xác nhận thanh toán thất bại")
                })
            }, function () {
                alertify.error("Xóa thất bại")
            })
        },
        xacNhanDHAll() {
            alertify.confirm("Xác nhận thanh toán đơn hàng?", function () {
                let checkBox = document.getElementsByName('checkChuaTT')
                checkBox.forEach(c => {
                    if (c.checked == true) {
                        $scope.chuaThanhToan.id.push(c.value)
                        $scope.daXacNhan.totalElement++
                    }
                })

                $http.put("/admin/don-hang/update-trang-thai?trangThai=1", $scope.chuaThanhToan.id).then(r => {
                    if ($scope.chuaThanhToan.page == $scope.chuaThanhToan.totalPage - 1) {
                        if ($scope.chuaThanhToan.list.length == 1 && $scope.chuaThanhToan.page > 0) {
                            $scope.chuaThanhToan.page--;
                        }
                    }
                    $scope.chuaThanhToan.getList($scope.chuaThanhToan.page)
                    $scope.chuaThanhToan.init()
                    $scope.chuaThanhToan.id = []
                    document.getElementById('checkAllChuaTT').checked = false
                    alertify.success("Xác nhận thanh toán thành công")
                }).catch(e => {
                    console.log(e)
                    alertify.error("Xác nhận thanh toán thất bại")
                })
            }, function () {
                alertify.error("Xóa thất bại")
            })
        },
        setIdDonHang(id) {
            this.id = []
            this.id.push(id)
        },
        setAllIdDonHang() {
            this.id = []
            let checkBox = document.getElementsByName('checkChuaTT')
            checkBox.forEach(c => {
                if (c.checked == true) {
                    this.id.push(c.value)
                }
            })
        },
        huyDH() {

            if ($scope.lyDo == null || $scope.length == 0 || $scope.lyDo == undefined) {
                $scope.messLyDo = "Không để trống lý do hủy"
                alertify.error("Xác nhận thanh toán thất bại")
                return
            } else if ($scope.lyDo.length == 200) {
                $scope.messLyDo = "Lý do hủy chỉ tối đa 200 ký tự"
                alertify.error("Xác nhận thanh toán thất bại")
                return;
            }

            $http.put("/admin/don-hang/huy-don-hang?lyDo=" + $scope.lyDo, this.id).then(r => {
                if (this.page == this.totalPage - 1) {
                    if (this.list.length == 1 && this.page > 0) {
                        this.page--;
                    }
                }
                this.getList(this.page)
                this.init()
                $scope.lyDo = null;
                $scope.messLyDo = "";
                this.id = []
                $('#closeHuy').click()
                document.getElementById('checkAllChuaTT').checked = false
                alertify.success("Xác nhận thanh toán thành công")
            }).catch(e => {
                console.log(e)
                alertify.error("Xác nhận thanh toán thất bại")
            })
        },
        getDetail(ma) {
            $http.get("/admin/don-hang/" + ma).then(r => {
                this.detail = r.data;
                $scope.chuaXacNhan.detail = r.data
                this.detail.thanhPhoCode = this.detail.thanhPhoCode + ""

                //Lấy quận huyện
                $scope.giaoHangNhanh.getDistricts(this.detail.thanhPhoCode)//hàm lấy quận huyện truyền vào thành phố
                this.detail.quanHuyenCode = this.detail.quanHuyenCode + "" // set selected quận huyện

                $scope.giaoHangNhanh.getWards(this.detail.quanHuyenCode)//hàm lấy xã truyền vào quận huyện
                this.detail.xaPhuongCode = this.detail.xaPhuongCode + "" //set selected xã

                $('#chuaXacNhanDetail').modal('show')
            }).catch(e => console.log(e))

            $http.get("/admin/chi-tiet-don-hang/" + ma).then(r => {
                $scope.chiTietDonHang = r.data;
            }).catch(e => console.log(e))
        },
        setPageNumbers() {

            let numbers = [];
            let i = this.page
            let lengthLast = this.totalPage <= 3 ? this.totalPage : this.page + 3
            let lengthFirst = this.totalPage >= 2 ? this.page - 2 : 0

            if (lengthLast > this.totalPage) {
                lengthLast = this.totalPage
                i = lengthLast - 2
            }
            if (lengthFirst < 0) lengthFirst = 0

            for (lengthFirst; i > lengthFirst; lengthFirst++) {
                numbers.push(lengthFirst)
            }
            for (i; i < lengthLast; i++) {
                numbers.push(i)
            }
            this.pages = numbers;

        },
        checkButton() {
            let checkboxs = document.getElementsByName('checkChuaTT')
            let check = true;
            checkboxs.forEach(c => {
                if (c.checked == true) {
                    check = false;
                }
            })
            document.getElementById("huyAll5").disabled = check;
            document.getElementById("xacNhanAll5").disabled = check;
        }
    }
    $scope.chuaThanhToan.init()

    $scope.daXacNhan = {
        list: [],
        detail: {},
        totalElement: 0,
        totalPage: 0,
        page: 0,
        pages: [],
        id: [],
        sdtSearch: "",
        init() {
            $scope.trangThaiDonHang = 1
            $http.get("/admin/don-hang/get-by-trangthai?trangThai=1").then(r => {
                this.totalElement = r.data.totalElements;
                this.totalPage = r.data.totalPages;
                this.setPageNumbers()
            })
        },
        getList(pageNumber) {
            $scope.trangThaiDonHang = 1
            $scope.daXacNhan.page = pageNumber;
            $http.get("/admin/don-hang/get-by-trangthai?trangThai=1&pageNumber=" + pageNumber + "&sdt=" + this.sdtSearch).then(r => {
                this.list = r.data.content;
                this.totalPage = r.data.totalPages;
                this.setPageNumbers()
            })
        },
        getDetail(ma) {
            $http.get("/admin/don-hang/" + ma).then(r => {
                $scope.donHang = r.data;
                $('#donHangDetail').modal('show')
            }).catch(e => console.log(e))

            $http.get("/admin/chi-tiet-don-hang/" + ma).then(r => {
                $scope.chiTietDonHang = r.data;
            }).catch(e => console.log(e))
        },
        setPageNumbers() {

            let numbers = [];
            let i = this.page
            let lengthLast = this.totalPage <= 3 ? this.totalPage : this.page + 3
            let lengthFirst = this.totalPage >= 2 ? this.page - 2 : 0

            if (lengthLast > this.totalPage) {
                lengthLast = this.totalPage
                i = lengthLast - 2
            }
            if (lengthFirst < 0) lengthFirst = 0

            for (lengthFirst; i > lengthFirst; lengthFirst++) {
                numbers.push(lengthFirst)
            }
            for (i; i < lengthLast; i++) {
                numbers.push(i)
            }
            this.pages = numbers;
        },
        chuyenGiao(ma) {
            alertify.confirm("Chuyển giao đơn hàng?", function () {

                $http.get("/admin/don-hang/update-trang-thai/" + ma + "?trangThai=3").then(r => {
                    if ($scope.daXacNhan.page == $scope.daXacNhan.totalPage - 1) {
                        if ($scope.daXacNhan.list.length == 1 && $scope.daXacNhan.page > 0) {
                            $scope.daXacNhan.page--;
                        }
                    }
                    $scope.daXacNhan.getList($scope.daXacNhan.page)
                    $scope.daXacNhan.init()
                    // document.getElementById('checkAllChuaXacNhan').checked = false
                    $scope.dangGiao.totalElement++
                    alertify.success("Chuyển giao thành công")
                }).catch(e => {
                    console.log(e)
                    alertify.error("Chuyển giao thất bại")
                })
            }, function () {
                alertify.error("Chuyển giao thất bại")
            })
        },
        setIdDonHang(id) {
            this.id = []
            this.id.push(id)
        },
        setAllIdDonHang() {
            this.id = []
            let checkBox = document.getElementsByName('checkDaXacNhan')
            checkBox.forEach(c => {
                if (c.checked == true) {
                    this.id.push(c.value)
                }
            })
        },
        huy(ma) {
            alertify.confirm("Hủy đơn hàng?", function () {

                $http.get("/admin/don-hang/update-trang-thai/" + ma + "?trangThai=2").then(r => {
                    if ($scope.daXacNhan.page == $scope.daXacNhan.totalPage - 1) {
                        if ($scope.daXacNhan.list.length == 1 && $scope.daXacNhan.page > 0) {
                            $scope.daXacNhan.page--;
                        }
                    }
                    $scope.daXacNhan.getList($scope.daXacNhan.page)
                    $scope.daXacNhan.init()
                    // document.getElementById('checkAllChuaXacNhan').checked = false
                    $scope.dangGiao.totalElement++
                    alertify.success("Hủy thành công")
                }).catch(e => {
                    console.log(e)
                    alertify.error("Hủy thất bại")
                })
            }, function () {
                alertify.error("Hủy thất bại")
            })
        },
        huyDH() {
            if ($scope.lyDo == null || $scope.length == 0 || $scope.lyDo == undefined) {
                $scope.messLyDo = "Không để trống lý do hủy"
                return
            } else if ($scope.lyDo.length == 200) {
                $scope.messLyDo = "Lý do hủy chỉ tối đa 200 ký tự"
                return;
            }

            $http.put("/admin/don-hang/huy-don-hang?lyDo=" + $scope.lyDo, this.id).then(r => {
                if (this.page == this.totalPage - 1) {
                    if (this.list.length == 1 && this.page > 0) {
                        this.page--;
                    }
                }
                this.getList(this.page)
                this.init()
                $scope.lyDo = null;
                $scope.messLyDo = "";
                this.id = []
                $('#closeHuy').click()
                document.getElementById('checkAlldaXacNhan').checked = false
                alertify.success("Hủy đơn hàng thành công")
            }).catch(e => {
                console.log(e)
                alertify.error("Hủy đơn hàng thất bại")
            })
        },
        chuyenGiaoDHAll() {

            alertify.confirm("Chuyển giao đơn hàng?", function () {
                let checkBox = document.getElementsByName('checkDaXacNhan')
                checkBox.forEach(c => {
                    if (c.checked == true) {
                        $scope.daXacNhan.id.push(c.value)
                        $scope.dangGiao.totalElement++
                    }
                })

                $http.put("/admin/don-hang/update-trang-thai?trangThai=3", $scope.daXacNhan.id).then(r => {
                    if ($scope.daXacNhan.page == $scope.daXacNhan.totalPage - 1) {
                        if ($scope.daXacNhan.list.length == 1 && $scope.daXacNhan.page > 0) {
                            $scope.daXacNhan.page--;
                        }
                    }
                    $scope.daXacNhan.getList($scope.daXacNhan.page)
                    $scope.daXacNhan.init()
                    $scope.daXacNhan.id = []
                    document.getElementById('checkAlldaXacNhan').checked = false

                    alertify.success("Chuyển giao thành công")
                }).catch(e => {
                    console.log(e)
                    alertify.error("Chuyển giao thất bại")
                })
            }, function () {
                alertify.error("Chuyển giao thất bại")
            })
        },
        checkButton() {
            let checkboxs = document.getElementsByName('checkDaXacNhan')
            let check = true;
            checkboxs.forEach(c => {
                if (c.checked == true) {
                    check = false;
                }
            })
            document.getElementById("huyAll2").disabled = check;
            document.getElementById("xacNhanAll2").disabled = check;
        }
    }
    $scope.daXacNhan.init()

    $scope.dangGiao = {
        list: [],
        detail: {},
        totalElement: 0,
        totalPage: 0,
        page: 0,
        pages: [],
        id: [],
        sdtSearch: "",
        init() {
            $scope.trangThaiDonHang = 3
            $http.get("/admin/don-hang/get-by-trangthai?trangThai=3").then(r => {
                this.totalElement = r.data.totalElements;
                this.totalPage = r.data.totalPages;
                this.setPageNumbers()
            })
        },
        getList(pageNumber) {
            $scope.trangThaiDonHang = 3
            this.page = pageNumber;
            $http.get("/admin/don-hang/get-by-trangthai?trangThai=3&pageNumber=" + pageNumber + "&sdt=" + this.sdtSearch).then(r => {
                this.list = r.data.content;
                this.totalPage = r.data.totalPages;
                this.setPageNumbers()
            })
        },
        setPageNumbers() {

            let numbers = [];
            let i = this.page
            let lengthLast = this.totalPage <= 3 ? this.totalPage : this.page + 3
            let lengthFirst = this.totalPage >= 2 ? this.page - 2 : 0

            if (lengthLast > this.totalPage) {
                lengthLast = this.totalPage
                i = lengthLast - 2
            }
            if (lengthFirst < 0) lengthFirst = 0

            for (lengthFirst; i > lengthFirst; lengthFirst++) {
                numbers.push(lengthFirst)
            }
            for (i; i < lengthLast; i++) {
                numbers.push(i)
            }
            this.pages = numbers;
        },
        hoanThanh(ma) {
            alertify.confirm("Xác nhận đơn hàng hoàn thành?", function () {

                $http.get("/admin/don-hang/update-trang-thai/" + ma + "?trangThai=4").then(r => {
                    if ($scope.dangGiao.page == $scope.dangGiao.totalPage - 1) {
                        if ($scope.dangGiao.list.length == 1 && $scope.dangGiao.page > 0) {
                            $scope.dangGiao.page--;
                        }
                    }
                    $scope.dangGiao.getList($scope.dangGiao.page)
                    $scope.dangGiao.init()
                    // document.getElementById('checkAllChuaXacNhan').checked = false
                    alertify.success("Xác nhân đơn hàng hoàn thành thành công")
                }).catch(e => {
                    console.log(e)
                    alertify.error("Xác nhận đơn hàng hoàn thành thất bại")
                })
            }, function () {
                alertify.error("Xác nhận đơn hàng hoàn thành thất bại")
            })
        },
        setIdDonHang(id) {
            this.id = []
            this.id.push(id)
        },
        setAllIdDonHang() {
            let checkBox = document.getElementsByName('checkDangGiao')
            this.id = []
            checkBox.forEach(c => {
                if (c.checked == true) {
                    this.id.push(c.value)
                }
            })
        },
        huyDH() {
            if ($scope.lyDo == null || $scope.length == 0 || $scope.lyDo == undefined) {
                $scope.messLyDo = "Không để trống lý do hủy"
                alertify.error("Hủy đơn hàng thất bại")
                return
            } else if ($scope.lyDo.length == 200) {
                $scope.messLyDo = "Lý do hủy chỉ tối đa 200 ký tự"
                alertify.error("Hủy đơn hàng thất bại")
                return;
            }

            $http.put("/admin/don-hang/huy-don-hang?lyDo=" + $scope.lyDo, this.id).then(r => {
                if (this.page == this.totalPage - 1) {
                    if (this.list.length == 1 && this.page > 0) {
                        this.page--;
                    }
                }
                this.getList(this.page)
                this.init()
                $scope.lyDo = null;
                $scope.messLyDo = "";
                this.id = []
                $('#closeHuy').click()
                document.getElementById('checkAllDangGiao').checked = false
                alertify.success("Hủy đơn hàng thành công")
            }).catch(e => {
                console.log(e)
                alertify.error("Hủy đơn hàng thất bại")
            })
        },
        hoanThanhDHAll() {

            alertify.confirm("Xác nhận đơn hàng hoàn thành?", function () {
                let checkBox = document.getElementsByName('checkDangGiao')
                checkBox.forEach(c => {
                    if (c.checked == true) {
                        $scope.dangGiao.id.push(c.value)
                    }
                })

                $http.put("/admin/don-hang/update-trang-thai?trangThai=4", $scope.dangGiao.id).then(r => {
                    if ($scope.dangGiao.page == $scope.dangGiao.totalPage - 1) {
                        if ($scope.dangGiao.list.length == 1 && $scope.dangGiao.page > 0) {
                            $scope.dangGiao.page--;
                        }
                    }
                    $scope.dangGiao.getList($scope.dangGiao.page)
                    $scope.dangGiao.init()
                    $scope.dangGiao.id = []
                    document.getElementById('checkAllDangGiao').checked = false
                    alertify.success("Xác nhận đơn hàng hoàn thành thành công")
                }).catch(e => {
                    console.log(e)
                    alertify.error("Xác nhận đơn hàng hoàn thành thất bại")
                })
            }, function () {
                alertify.error("Xác nhận đơn hàng hoàn thành thất bại")
            })
        },
        checkButton() {
            let checkboxs = document.getElementsByName('checkDangGiao')
            let check = true;
            checkboxs.forEach(c => {
                if (c.checked == true) {
                    check = false;
                }
            })
            document.getElementById("huyAll3").disabled = check;
            document.getElementById("xacNhanAll3").disabled = check;
        }
    }
    $scope.dangGiao.init(0)

    $scope.hoanThanh = {
        list: [],
        detail: {},
        totalElement: 0,
        totalPage: 0,
        page: 0,
        pages: [],
        sdtSearch: "",
        init() {
            $http.get("/admin/don-hang/get-by-trangthai?trangThai=4&pageNumber=" + this.page + "&sdt=" + this.sdtSearch).then(r => {
                this.list = r.data.content;
                this.totalElement = r.data.totalElements;
                this.totalPage = r.data.totalPages;
                this.setPageNumbers()
            })
        },
        getList(pageNumber) {
            $scope.trangThaiDonHang = 0
            this.page = pageNumber;
            $http.get("/admin/don-hang/get-by-trangthai?trangThai=4&pageNumber=" + pageNumber + "&sdt=" + this.sdtSearch).then(r => {
                this.list = r.data.content;
                this.totalPage = r.data.totalPages;
                this.setPageNumbers()
            })
        },
        getDetail(ma) {
            $http.get("/admin/don-hang/" + ma).then(r => {
                $scope.donHang = r.data;
                $('#donHangDetail').modal('show')
            }).catch(e => console.log(e))

            $http.get("/admin/chi-tiet-don-hang/" + ma).then(r => {
                $scope.chiTietDonHang = r.data;
            }).catch(e => console.log(e))
        },
        setPageNumbers() {
            let numbers = [];
            let i = this.page
            let lengthLast = this.totalPage <= 3 ? this.totalPage : this.page + 3
            let lengthFirst = this.totalPage >= 2 ? this.page - 2 : 0

            if (lengthLast > this.totalPage) {
                lengthLast = this.totalPage
                i = lengthLast - 2
            }
            if (lengthFirst < 0) lengthFirst = 0

            for (lengthFirst; i > lengthFirst; lengthFirst++) {
                numbers.push(lengthFirst)
            }
            for (i; i < lengthLast; i++) {
                numbers.push(i)
            }
            this.pages = numbers;

        }
    }
    $scope.hoanThanh.init()
    
    $scope.huy = {
        list: [],
        detail: {},
        totalElement: 0,
        totalPage: 0,
        page: 0,
        pages: [],
        sdtSearch: "",
        init() {
            $http.get("/admin/don-hang/get-by-trangthai?trangThai=0&pageNumber=" + this.page + "&sdt=" + this.sdtSearch).then(r => {
                this.list = r.data.content;
                this.totalElement = r.data.totalElements;
                this.totalPage = r.data.totalPages;
                this.setPageNumbers()
            })
        },
        getList(pageNumber) {
            $scope.trangThaiDonHang = 0
            this.page = pageNumber;
            $http.get("/admin/don-hang/get-by-trangthai?trangThai=0&pageNumber=" + pageNumber + "&sdt=" + this.sdtSearch).then(r => {
                this.list = r.data.content;
                this.totalPage = r.data.totalPages;
                this.setPageNumbers()
            })
        },
        getDetail(ma) {
            $http.get("/admin/don-hang/" + ma).then(r => {
                $scope.donHang = r.data;
                $('#donHangDetail').modal('show')
            }).catch(e => console.log(e))

            $http.get("/admin/chi-tiet-don-hang/" + ma).then(r => {
                $scope.chiTietDonHang = r.data;
            }).catch(e => console.log(e))
        },
        setPageNumbers() {
            let numbers = [];
            let i = this.page
            let lengthLast = this.totalPage <= 3 ? this.totalPage : this.page + 3
            let lengthFirst = this.totalPage >= 2 ? this.page - 2 : 0

            if (lengthLast > this.totalPage) {
                lengthLast = this.totalPage
                i = lengthLast - 2
            }
            if (lengthFirst < 0) lengthFirst = 0

            for (lengthFirst; i > lengthFirst; lengthFirst++) {
                numbers.push(lengthFirst)
            }
            for (i; i < lengthLast; i++) {
                numbers.push(i)
            }
            this.pages = numbers;
        }
    }
    $scope.huy.init()
    // $scope.trangThaiDonHang = 5

    //don hang user
    $scope.donHangChuaXacNhanKh = []
    $scope.donHangUser = function (trangThai) {
        $http.get("/don-hang/get-by-trangThai-khachHang?trangThai=" + trangThai).then(resp => {
            $scope.donHangChuaXacNhanKh = resp.data;
            console.log(resp.data)
        }).catch(err => {
            console.log(err);
        })
    }
    //
    $scope.donHangTraUser = [];
    $scope.DonHangTraUsers = function (trangThai) {

        $http.get("/don-hang/get-by-trangthai-khachhang-tra?trangThai=" + trangThai).then(resp => {

            $scope.donHangTraUser = resp.data;
            console.log("123", resp.data)
        }).catch(err => {
            console.log(err);
        })
    };
    $scope.loadDanhSachTraHang = function () {
        let promises = [];
        let trangThais = [1, 2, 3];

        trangThais.forEach(trangThai => {
            promises.push(
                $http.get("/don-hang/get-by-trangthai-khachhang-tra?trangThai=" + trangThai).then(resp => {
                    return resp.data;
                }).catch(err => {
                    console.log(err);
                    return [];
                })
            );
        });

        Promise.all(promises).then(results => {
            // Hợp nhất kết quả từ các trạng thái khác nhau
            $scope.donHangChuaXacNhanKh = results.flat();
            console.log($scope.donHangChuaXacNhanKh);
            // Đảm bảo giao diện được cập nhật
            $scope.$applyAsync();
        });
    };

    $scope.loadDanhSachDoiHang = function () {
        let promises = [];
        let trangThais = [1, 2, 3, 4, 0];

        trangThais.forEach(trangThai => {
            promises.push(
                $http.get("/don-hang/get-by-trangthai-khachhang-doi?trangThai=" + trangThai).then(resp => {
                    return resp.data;
                }).catch(err => {
                    console.log(err);
                    return [];
                })
            );
        });

        Promise.all(promises).then(results => {
            // Hợp nhất kết quả từ các trạng thái khác nhau
            $scope.donHangChuaXacNhanKh = results.flat();
            console.log($scope.donHangChuaXacNhanKh);
            // Đảm bảo giao diện được cập nhật
            $scope.$applyAsync();
        });
    };

    $scope.donHangUser(5)

    $scope.findByMaDonHangUser = function (ma) {
        $http.get("/don-hang/" + ma).then(function (res) {
            const donHang = res.data;
            $scope.maDonHang = donHang.ma
            $scope.nguoiNhan = donHang.tenNguoiNhan
            $scope.soDT = donHang.soDienThoai
            $scope.email = donHang.email
            $scope.ghiChu = donHang.ghiChu
            $scope.diaChiCT = donHang.diaChiChiTiet
            $scope.tienGiam = donHang.tienGiam
            $scope.phiGiaoHang = donHang.phiGiaoHang
            $scope.lyDoHuy = donHang.lyDoHuy
            $scope.lyDoTraHang = donHang.lyDoTraHang
            $scope.chiTietDon = donHang.chiTietDonHang
        })
    }



    $scope.huyDonUser = function (ma) {
        lyDoHuy = $scope.lyDoHuy
        $http.put("/don-hang/huy-don-hang-user?ma=" + ma, lyDoHuy).then(function (res) {
            // location.reload()
            let index = $scope.donHangChuaXacNhanKh.findIndex(d => d.ma == ma)
            $scope.donHangChuaXacNhanKh.splice(index, 1);
            alertify.success("Hủy đơn hàng thành công")
        })
    }

    // $scope.traDonUser = function (ma) {
    //     lydoTraHang = $scope.lyDoTraHang
    //     $http.put("/don-hang/tra-don-hang-user?ma=" + ma, lyDoTraHang).then(function (res) {
    //         // location.reload()
    //         let index = $scope.donHangChuaXacNhanKh.findIndex(d => d.ma == ma)
    //         $scope.donHangChuaXacNhanKh.splice(index, 1);
    //         alertify.success("Yêu cầu trả đơn hàng thành công")
    //     })
    // }

    // Khai báo biến lyDoTraHang trong scope
    $scope.lyDoTraHang = "";
    $scope.phuongThucNhanTien = "";
    $scope.ghiChu = "";

    $http.get("https://api.vietqr.io/v2/banks").then(function (response) {
        $scope.nganHang = response.data.data;
    }, function (error) {
        console.error("Lỗi khi lấy dữ liệu ngân hàng:", error);
    });

    // Biến lưu trữ ngân hàng được chọn
    $scope.selectedNganHang = null;
    $scope.selectedNganHangName = null;

    $scope.isWithinSevenDays = function (ngayHoanThanh) {
        result = false;
        var ngayHienTai = new Date();
        var ngayHoanThanhDate = new Date(ngayHoanThanh);

        // Tính toán sự khác biệt giữa ngày hiện tại và ngày hoàn thành
        // var timeDifference = ngayHienTai - ngayHoanThanhDate;
        // var dayDifference = timeDifference / (1000 * 60 * 60 * 24);
        // console.log("ngày1", timeDifference)
        // console.log("ngày2", dayDifference)
        // // Kiểm tra nếu sự khác biệt là trong vòng 7 ngày
        // if(dayDifference<=7){
        //     result = true
        // }
        //Tính toán theo phút
        var timeDifference = ngayHienTai - ngayHoanThanhDate;
        var minuteDifference = timeDifference / (1000 * 60); // Chuyển đổi sự khác biệt sang phút
        // console.log("Sự khác biệt thời gian (ms)", timeDifference);
        // console.log("Sự khác biệt thời gian (phút)", minuteDifference);

        // Kiểm tra nếu sự khác biệt là trong vòng 2 phút
        if (minuteDifference <= 100000) {
            result = true;
        } else {
            result = false;
        }

        return result;
    };
    $scope.isWithinSevenDays()

    // Định nghĩa hàm traDonUser
    $scope.traDonUser = function (ma, phuongThucNhanTien, selectedNganHang, soTaiKhoan, tenNguoiNhan) {
        const lydoTraHang = $scope.lyDoTraHang; // Sử dụng let hoặc const để khai báo biến cục bộ
        const phuongThucNhanTien1 = $scope.phuongThucNhanTien;
        console.log("abcd", phuongThucNhanTien1)

        if (!lydoTraHang) {
            alertify.error("Bạn cần nhập lý do trả hàng");
            return;
        }
        if (!$scope.agreePolicy) {
            alertify.error("Bạn cần đồng ý chính sách của cửa hàng");
            return;
        }

        if (phuongThucNhanTien === 'false') {
            if (!soTaiKhoan) {
                alertify.error("Bạn cần nhập số tài khoản");
                return;
            }

            if (!tenNguoiNhan) {
                alertify.error("Bạn cần nhập tên người nhận");
                return;
            }

            if (!selectedNganHang || !selectedNganHang.name) {
                alertify.error("Bạn cần chọn ngân hàng");
                return;
            }
            console.log('Số tài khoản:', soTaiKhoan);
            console.log('Tên người nhận:', tenNguoiNhan);
            console.log('Tên người 2:', $scope.selectedNganHang.name);

            $scope.ghiChu = "Ngân hàng: " + $scope.selectedNganHang.name + "\nSố Tài Khoản: " + soTaiKhoan + "\nTên người nhận: " + tenNguoiNhan;
            // Sử dụng encodeURIComponent để mã hóa ghiChu
            const encodedGhiChu = encodeURIComponent($scope.ghiChu);
            $http.put("/don-hang/tra-don-hang-user?ma=" + ma + "&phuongThucNhanTien=" + phuongThucNhanTien1 + "&ghiChu=" + encodedGhiChu, lydoTraHang)
                .then(function (res) {
                    // Tìm và xóa đơn hàng khỏi danh sách
                    let index = $scope.donHangChuaXacNhanKh.findIndex(d => d.ma == ma);
                    if (index !== -1) {
                        $scope.donHangChuaXacNhanKh.splice(index, 1);
                    }
                    alertify.success("Yêu cầu trả đơn hàng thành công");
                    $('#traHangToanBoModal').modal('hide');
                })
                .catch(function (error) {
                    // Xử lý lỗi khi gửi yêu cầu HTTP
                    console.error("Có lỗi xảy ra khi gửi yêu cầu trả đơn hàng:", error);
                    alertify.error("Có lỗi xảy ra khi gửi yêu cầu trả đơn hàng");
                });
        } else {


            // Gửi yêu cầu HTTP PUT
            $http.put("/don-hang/tra-don-hang-user?ma=" + ma + "&phuongThucNhanTien=" + phuongThucNhanTien1 + "&ghiChu=" + '', lydoTraHang)
                .then(function (res) {
                    // Tìm và xóa đơn hàng khỏi danh sách
                    let index = $scope.donHangChuaXacNhanKh.findIndex(d => d.ma == ma);
                    if (index !== -1) {
                        $scope.donHangChuaXacNhanKh.splice(index, 1);
                    }
                    alertify.success("Yêu cầu trả đơn hàng thành công");
                    $('#traHangModal').modal('hide');
                })
                .catch(function (error) {
                    // Xử lý lỗi khi gửi yêu cầu HTTP
                    console.error("Có lỗi xảy ra khi gửi yêu cầu trả đơn hàng:", error);
                    alertify.error("Có lỗi xảy ra khi gửi yêu cầu trả đơn hàng");
                });
        }

    };

    $scope.resetModal = function () {
        $scope.lyDoTraHang = '';
        $scope.phuongThucNhanTien = '';
        $scope.selectedNganHang = '';
        $scope.soTaiKhoan = '';
        $scope.tenNguoiNhan = '';
    };

    // hàm trả 1 phần
    $scope.selectedDonHang = null;
    $scope.selectedProducts = [];
    $scope.phuongThucNhanTien = null;
    $scope.selectedNganHang = null;
    $scope.soTaiKhoan = null;
    $scope.tenNguoiNhan = null;
    $scope.lyDoTraHang = null;
    $scope.nganHang = []; // Giả sử bạn có dữ liệu ngân hàng ở đây



    $scope.totalRefund = 0;

    // Hàm để tìm và thiết lập đơn hàng theo mã đơn hàng
    $scope.findByMaDonHangUserPartial = function (donHang) {
        $scope.selectedDonHang = donHang
        $scope.selectedProducts = [];
    };
    $scope.changeQuantity = function (product, change) {
        if (!product.selectedQuantity) {
            product.selectedQuantity = 1;
        }

        var newQuantity = product.selectedQuantity + change;

        if (newQuantity < 1) {
            newQuantity = 1;
        } else if (newQuantity > product.soLuong) {
            newQuantity = product.soLuong;
            alertify.error("Số lượng không được vượt quá số lượng hiện có");
        }

        product.selectedQuantity = newQuantity;
        product.totalPrice = product.selectedQuantity * product.donGiaSauGiam; // Cập nhật tổng tiền

        // Cập nhật danh sách sản phẩm đã chọn
        var index = $scope.selectedProducts.findIndex(p => p.id === product.id);
        if (index > -1) {
            $scope.selectedProducts[index] = product;
        } else {
            $scope.selectedProducts.push(product);
        }

        // Cập nhật tổng tiền hoàn
        $scope.calculateTotalRefund();
    };

    $scope.calculateTotalRefund = function () {
        $scope.totalRefund = $scope.selectedProducts.reduce(function (sum, product) {
            return sum + (product.totalPrice || 0);
        }, 0);
    };


    // Cập nhật danh sách sản phẩm đã chọn

    // Tăng số lượng hoàn
    $scope.incrementQuantity = function (product) {
        if (product.soLuongHoan < product.soLuong) {
            product.soLuongHoan++;
        }
    };

    // Giảm số lượng hoàn
    $scope.decrementQuantity = function (product) {
        if (product.soLuongHoan > 1) {
            product.soLuongHoan--;
        }
    };
    //hàm trả hàng 1 phần
    $scope.traMotPhan = function () {
        const maDonHang = $scope.selectedDonHang.ma;
        const lydoTraHang = $scope.lyDoTraHang;
        const phuongThucNhanTien = $scope.phuongThucNhanTien;
    
        if (!lydoTraHang) {
            alertify.error("Bạn cần nhập lý do trả hàng");
            return;
        }
        if (!phuongThucNhanTien) {
            alertify.error("Bạn cần chọn phương thức hoàn tiền");
            return;
        }
        
        if (phuongThucNhanTien === 'false') {
            const selectedNganHang = $scope.selectedNganHang;
            const soTaiKhoan = $scope.soTaiKhoan;
            const tenNguoiNhan = $scope.tenNguoiNhan;
            
            if (!selectedNganHang || !selectedNganHang.name) {
                alertify.error("Bạn cần chọn ngân hàng");
                return;
            }
            if (!soTaiKhoan) {
                alertify.error("Bạn cần nhập số tài khoản");
                return;
            }
            if (!tenNguoiNhan) {
                alertify.error("Bạn cần nhập tên người nhận");
                return;
            }
            $scope.ghiChu = "Ngân hàng: " + selectedNganHang.name + "\nSố Tài Khoản: " + soTaiKhoan + "\nTên người nhận: " + tenNguoiNhan;
        }
        
        const selectedProducts = $scope.selectedProducts;
        if (selectedProducts.length === 0) {
            alertify.error("Bạn cần chọn ít nhất một sản phẩm để trả hàng");
            return;
        }
        
        const formData = new FormData();
        formData.append('donHang', new Blob([JSON.stringify({
            ma: maDonHang,
            voucher: $scope.selectedDonHang.voucher || "",
            diaChiChiTiet: $scope.selectedDonHang.diaChiChiTiet || "",
            email: $scope.selectedDonHang.email || "",
            quanHuyenCode: $scope.selectedDonHang.quanHuyenCode || "",
            quanHuyenName: $scope.selectedDonHang.quanHuyenName || "",
            soDienThoai: $scope.selectedDonHang.soDienThoai || "",
            tenNguoiNhan: $scope.selectedDonHang.tenNguoiNhan || "",
            thanhPhoCode: $scope.selectedDonHang.thanhPhoCode || "",
            thanhPhoName: $scope.selectedDonHang.thanhPhoName || "",
            xaPhuongCode: $scope.selectedDonHang.xaPhuongCode || "",
            xaPhuongName: $scope.selectedDonHang.xaPhuongName || "",
            loai: $scope.selectedDonHang.loai
        })], { type: "application/json" }));
    
        formData.append('lyDoTraHang', lydoTraHang);
        formData.append('phuongThucNhanTien', phuongThucNhanTien);
        formData.append('ghiChu', $scope.ghiChu || '');
    
        let chiTietDonHang = [];
        selectedProducts.forEach(c => {
            chiTietDonHang.push({
                id: c.id,
                donHangID: maDonHang,
                sanPhamCT: c.idChiTietSanPham,
                soLuong: c.selectedQuantity,
                donGia: c.donGia,
                donGiaSauGiam: c.donGiaSauGiam
            });
        });
    
        formData.append('chiTietDonHang', new Blob([JSON.stringify(chiTietDonHang)], { type: "application/json" }));
    
        $http.put("/don-hang/tra-mot-phan", formData, {
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined }
        })
            .then(function (res) {
                let index = $scope.donHangChuaXacNhanKh.findIndex(d => d.ma == maDonHang);
                if (index !== -1) {
                    $scope.donHangChuaXacNhanKh.splice(index, 1);
                }
                alertify.success("Yêu cầu trả đơn hàng thành công");
                $('#traHangMotPhanModal').modal('hide');
            })
            .catch(function (error) {
                console.error("Có lỗi xảy ra khi gửi yêu cầu trả đơn hàng:", error);
                alertify.error("Có lỗi xảy ra khi gửi yêu cầu trả đơn hàng");
            });
    };
    

    // $scope.traMotPhan = function () {
    //     const maDonHang = $scope.selectedDonHang.ma;
    //     const lydoTraHang = $scope.lyDoTraHang;
    //     const phuongThucNhanTien = $scope.phuongThucNhanTien;
    //     if (!lydoTraHang) {
    //         alertify.error("Bạn cần nhập lý do trả hàng");
    //         return;
    //     }
    //     if (!phuongThucNhanTien) {
    //         alertify.error("Bạn cần chọn phương thức hoàn tiền");
    //         return;
    //     }
    //     console.log("lydotrahang", lydoTraHang)
    //     if (phuongThucNhanTien === 'false') {
    //         const selectedNganHang = $scope.selectedNganHang;
    //         const soTaiKhoan = $scope.soTaiKhoan;
    //         const tenNguoiNhan = $scope.tenNguoiNhan;
    //         if (!selectedNganHang || !selectedNganHang.name) {
    //             alertify.error("Bạn cần chọn ngân hàng");
    //             return;
    //         }
    //         if (!soTaiKhoan) {
    //             alertify.error("Bạn cần nhập số tài khoản");
    //             return;
    //         }
    //         if (!tenNguoiNhan) {
    //             alertify.error("Bạn cần nhập tên người nhận");
    //             return;
    //         }
    //         $scope.ghiChu = "Ngân hàng: " + $scope.selectedNganHang.name + "\nSố Tài Khoản: " + soTaiKhoan + "\nTên người nhận: " + tenNguoiNhan;
    //     }
    //     console.log($scope.selectedProducts)
    //     // Lấy danh sách sản phẩm đã chọn
    //     const selectedProducts = $scope.selectedProducts;
    //     if (selectedProducts.length === 0) {
    //         alertify.error("Bạn cần chọn ít nhất một sản phẩm để trả hàng");
    //         return;
    //     }
    //     console.log("ma", maDonHang)

    //     // Tạo đối tượng FormData
    //     const formData = new FormData();
    //     formData.append('donHang', new Blob([JSON.stringify({
    //         ma: maDonHang,
    //         voucher: $scope.selectedDonHang.voucher || "",
    //         diaChiChiTiet: $scope.selectedDonHang.diaChiChiTiet || "",
    //         email: $scope.selectedDonHang.email || "",
    //         quanHuyenCode: $scope.selectedDonHang.quanHuyenCode || "",
    //         quanHuyenName: $scope.selectedDonHang.quanHuyenName || "",
    //         soDienThoai: $scope.selectedDonHang.soDienThoai || "",
    //         tenNguoiNhan: $scope.selectedDonHang.tenNguoiNhan || "",
    //         thanhPhoCode: $scope.selectedDonHang.thanhPhoCode || "",
    //         thanhPhoName: $scope.selectedDonHang.thanhPhoName || "",
    //         xaPhuongCode: $scope.selectedDonHang.xaPhuongCode || "",
    //         xaPhuongName: $scope.selectedDonHang.xaPhuongName || "",
    //         loai: $scope.selectedDonHang.loai
    //     })], { type: "application/json" }));
    //     console.log("loai", $scope.selectedDonHang)
    //     console.log(JSON.stringify({
    //         ma: maDonHang,
    //         voucher: $scope.selectedDonHang.voucher
    //     }));
    //     formData.append('lyDoTraHang', lydoTraHang);
    //     formData.append('phuongThucNhanTien', phuongThucNhanTien);
    //     formData.append('ghiChu', $scope.ghiChu || '');

    //     let chiTietDonHang = [];
    //     selectedProducts.forEach(c => {
    //         chiTietDonHang.push({
    //             id: c.id,
    //             donHangID: maDonHang,
    //             sanPhamCT: c.idChiTietSanPham,
    //             soLuong: c.soLuong,
    //             donGia: c.donGia,
    //             donGiaSauGiam: c.donGiaSauGiam
    //         })
    //     })
    //     // Tạo danh sách JSON cho các chi tiết đơn hàng
    //     formData.append('chiTietDonHang', new Blob([JSON.stringify(chiTietDonHang)], { type: "application/json" }));
    //     console.log(JSON.stringify(selectedProducts));
    //     $http.put("/don-hang/tra-mot-phan", formData, {
    //         transformRequest: angular.identity,
    //         headers: { 'Content-Type': undefined }
    //     })
    //         .then(function (res) {
    //             let index = $scope.donHangChuaXacNhanKh.findIndex(d => d.ma == maDonHang);
    //             if (index !== -1) {
    //                 $scope.donHangChuaXacNhanKh.splice(index, 1);
    //             }
    //             alertify.success("Yêu cầu trả đơn hàng thành công");
    //             $('#traHangMotPhanModal').modal('hide');
    //         })
    //         .catch(function (error) {
    //             console.error("Có lỗi xảy ra khi gửi yêu cầu trả đơn hàng:", error);
    //             alertify.error("Có lỗi xảy ra khi gửi yêu cầu trả đơn hàng");
    //         });

    // };

    // end
    $scope.productDetails =[]
    $scope.getProductDetails = function(maSP) {
        $http.get("/chi-tiet-san-pham/" + maSP + "/get-all-luong").then(r => {
            $scope.productDetails[maSP] = r.data;
            console.log( 'sss', $scope.productDetails[maSP])
        }).catch(e => console.log(e));
    };
    $scope.updateSelectedProducts = function(product) {
        if (product.selected) {
            // Tìm sản phẩm dựa trên mã sản phẩm và kích thước
            var existingProduct = $scope.selectedProducts.find(p => p.maSanPham === product.maSanPham && p.selectedSize === product.selectedSize);


            // Thêm sản phẩm vào danh sách nếu chưa có
            product.selectedQuantity = 1;
            product.totalPrice = product.selectedQuantity * product.donGiaSauGiam;
            $scope.selectedProducts.push(product);

            console.log("Danh sách sản phẩm đã chọn:", $scope.selectedProducts);
            $scope.calculateTotalRefund(); // Tính tổng tiền khi sản phẩm được thêm vào
        } else {
            // Loại bỏ sản phẩm dựa trên mã sản phẩm và kích thước
            var index = $scope.selectedProducts.findIndex(p => p.maSanPham === product.maSanPham && p.selectedSize === product.selectedSize);
            if (index > -1) {
                $scope.selectedProducts.splice(index, 1);
                $scope.calculateTotalRefund(); // Cập nhật tổng tiền khi sản phẩm bị loại bỏ
            }
        }
    };

    $scope.ChiTietSizeDoi = []

    $scope.selectedSizes = {};
    // hàm đổi 1 phần
    $scope.getSizes = function(size, idChiTietSanPham) {
        // Tìm sản phẩm dựa trên idChiTietSanPham
        var product = $scope.selectedProducts.find(p => p.idChiTietSanPham === idChiTietSanPham);

        if (product) {
            // Cập nhật kích thước đã chọn cho sản phẩm
            product.selectedSize = size;
            console.log("Kích thước đã chọn cho sản phẩm", idChiTietSanPham, ":", product.selectedSize);
        } else {
            // Nếu sản phẩm chưa có trong danh sách, bạn có thể thêm sản phẩm mới vào danh sách
            $scope.selectedProducts.push({
                idChiTietSanPham: idChiTietSanPham,
                selectedSize: size,
                selectedQuantity: 1, // Hoặc giá trị mặc định khác
                donGia: productDetails[idChiTietSanPham].donGia, // Giá sản phẩm
                donGiaSauGiam: productDetails[idChiTietSanPham].donGiaSauGiam, // Giá sau giảm
                totalPrice: 1 * productDetails[idChiTietSanPham].donGiaSauGiam // Tổng giá
            });
            console.log("Danh sách sản phẩm đã chọn:", $scope.selectedProducts);
        }
    };
    $scope.selectedDonHang = null;
    $scope.selectedProducts = [];
    $scope.lyDoDoiHang = null;
    //đổi hàng
    $scope.doiMotPhan = function () {
        const maDonHang = $scope.selectedDonHang.ma;
        const lyDoDoiHang = $scope.lyDoDoiHang;


        if (!lyDoDoiHang) {
            // Tiếp tục xử lý nếu lý do đổi hàng không tồn tại
            console.log("Lý do đổi hàng không được cung cấp.");
        }
        if (!lyDoDoiHang) {
            alertify.error("Bạn cần nhập lý do đổi hàng");
            return;
        }

        if ($scope.selectedProducts.length === 0) {
            alertify.error("Bạn cần chọn ít nhất một sản phẩm để đổi hàng");
            return;
        }
        console.log($scope.selectedSizes)
        // Tạo đối tượng FormData
        const formData = new FormData();
        formData.append('donHang', new Blob([JSON.stringify({
            ma: maDonHang,
            voucher: $scope.selectedDonHang.voucher || "",
            diaChiChiTiet: $scope.selectedDonHang.diaChiChiTiet || "",
            email: $scope.selectedDonHang.email || "",
            quanHuyenCode: $scope.selectedDonHang.quanHuyenCode || "",
            quanHuyenName: $scope.selectedDonHang.quanHuyenName || "",
            soDienThoai: $scope.selectedDonHang.soDienThoai || "",
            tenNguoiNhan: $scope.selectedDonHang.tenNguoiNhan || "",
            thanhPhoCode: $scope.selectedDonHang.thanhPhoCode || "",
            thanhPhoName: $scope.selectedDonHang.thanhPhoName || "",
            xaPhuongCode: $scope.selectedDonHang.xaPhuongCode || "",
            xaPhuongName: $scope.selectedDonHang.xaPhuongName || "",
            loai: $scope.selectedDonHang.loai
        })], { type: "application/json" }));
        formData.append('lyDoDoiHang', lyDoDoiHang);

        let chiTietSanPhamCanDoi = [];

        console.log("ChiTietSanPham:", $scope.ChiTietSanPham);
        console.log("Selected Products:", $scope.selectedProducts);

        $scope.selectedProducts.forEach(p => {
            // Tìm sản phẩm tương ứng trong $scope.ChiTietSanPham
            console.log("Size selected:", p.selectedSize);

            // Kiểm tra nếu sản phẩm có kích thước đã chọn
            if (p.selectedSize) {
                chiTietSanPhamCanDoi.push({
                    id: p.id,
                    donHangID: maDonHang,
                    sanPhamCT: p.selectedSize.id, // Lấy id của kích thước
                    soLuong: p.selectedQuantity,
                    donGia: p.donGia,
                    donGiaSauGiam: p.donGiaSauGiam,
                    sanPhamDoi: p.idChiTietSanPham
                });
            }
        });


        if (chiTietSanPhamCanDoi.length === 0) {
            alertify.error("Bạn cần chọn kích thước cho ít nhất một sản phẩm để đổi hàng");
            return;
        }
        // Tạo danh sách JSON cho các chi tiết đơn hàng
        formData.append('chiTietDonHang', new Blob([JSON.stringify(chiTietSanPhamCanDoi)], { type: "application/json" }));

        // Gửi yêu cầu PUT
        $http.put("/don-hang/doi-mot-phan", formData, {
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined }
        })
            .then(function (res) {
                let index = $scope.donHangChuaXacNhanKh.findIndex(d => d.ma == maDonHang);
                if (index !== -1) {
                    $scope.donHangChuaXacNhanKh.splice(index, 1);
                }
                alertify.success("Yêu cầu đổi hàng thành công");
                $('#doiHangModal').modal('hide');
            })
            .catch(function (error) {
                console.error("Có lỗi xảy ra khi gửi yêu cầu đổi hàng:", error);
                alertify.error("Có lỗi xảy ra khi gửi yêu cầu đổi hàng");
            });
    };

    // Kiểm tra và đảm bảo không khởi động $digest/$apply nếu đang diễn ra
    $('#traHangModal').on('hidden.bs.modal', function () {
        if (!$scope.$$phase) {
            $scope.$apply(function () {
                $scope.resetModal();
            });
        } else {
            $scope.resetModal();
        }
    });

    $scope.setChiTietDH = function (maCTDH) {
        console.log(maCTDH);
        $scope.danhGia.chiTietDonHang = maCTDH
    }
    $scope.danhGia = {}
    $scope.erDanhGia = {}
    $scope.addDanhGia = function () {
        alertify.confirm("Đánh giá sản phẩm?", function () {
            $http.post("/nhan-xet", $scope.danhGia).then(r => {
                $('#danhGia').modal('hide')
                $scope.donHangChuaXacNhanKh.forEach(d => {
                    d.chiTietDonHang.forEach(c => {
                        if (c.id == r.data.idCTDH) {
                            c.nhanXet = r.data
                        }
                    })
                })
                alertify.success("Đánh giá sản phẩm thành công")
                $scope.donHangUser(4)
                $scope.danhGia = {}
            }).catch(e => {
                alertify.error("Đánh giá sản phẩm thất bại")
                $scope.erDanhGia = e.data
            })
        }, function () {
            alertify.error("Đánh giá sản phẩm thất bại")
        })
    }
    $scope.danhGiaUpdate = {}
    $scope.erDanhGiaUpdate = {}
    $scope.viewUpdateDanhGia = function (id) {
        $http.get("/nhan-xet/detail/" + id).then(r => {
            $scope.danhGiaUpdate = r.data
            console.log($scope.danhGiaUpdate)
            document.getElementById("formDanhGiapdateUpdate").className = "ng-valid ng-dirty ng-valid-parse"
            document.getElementById("star-" + $scope.danhGiaUpdate.rating + "update").className = "star star-3 ng-untouched ng-valid ng-not-empty ng-dirty ng-valid-parse"
        })
    }
    $scope.updateDanhGia = function () {
        alertify.confirm("Bạn chỉ được một lần cập nhật đánh giá sản phẩm. Bạn có chắc muốn chỉnh sửa?", function () {
            let data = {
                id: $scope.danhGiaUpdate.id,
                chiTietDonHang: $scope.danhGiaUpdate.idCTDH,
                rating: $scope.danhGiaUpdate.rating,
                tieuDe: $scope.danhGiaUpdate.tieuDe,
                noiDung: $scope.danhGiaUpdate.noiDung
            }
            $http.put("/nhan-xet", data).then(r => {
                $('#danhGiaUpdate').modal('hide')
                alertify.success("Cập nhật đánh giá sản phẩm thành công")
                $scope.danhGia = {}
            }).catch(e => {
                $scope.erDanhGiaUpdate = e.data
                alertify.error("Cập nhật đánh giá sản phẩm thất bại")
            })
        }, function () {
            alertify.error("Cập nhật đánh giá sản phẩm thất bại")
        })

    }
    $scope.thanhToan = function (ma) {
        $http.get("/thanh-toan/" + ma).then(r => {
            location.href = r.data.vnPayUrl
        })
    }


    //    show giỏ hàng
    $scope.cart = []
    $scope.getTotal = function () {
        var totalPrice = 0;
        for (let i = 0; i < $scope.cart.length; i++) {
            totalPrice += $scope.cart[i].soLuong * $scope.cart[i].donGiaSauGiam
        }
        return totalPrice;
    }
    $http.get("/cart/find-all").then(r => {
        console.log(r.data)
        $scope.cart = r.data;
        console.log("soLuong:")
    }).catch(e => console.log(e))

    $scope.login = function () {
        var expires = (new Date(Date.now() + 60 * 1000)).toUTCString();
        document.cookie = "url=" + window.location.href + "; expires=" + expires;
        location.href = "/dang-nhap";
    }
})
$('#khachHangSL').select2({
    dropdownParent: $('#add')
});