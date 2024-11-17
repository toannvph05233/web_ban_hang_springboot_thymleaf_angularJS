package com.example.demo.rest;

import com.example.demo.Service.SanPhamService;
import com.example.demo.dto.request.MauSacRequestDTO;
import com.example.demo.dto.request.SanPhamRequestDTO;
import com.example.demo.entity.MauSac;
import com.example.demo.entity.SanPham;
import com.example.demo.entity.SanPhamChiTiet;
import com.example.demo.repo.SanPhamChiTietRepo;
import com.example.demo.repo.SanPhamRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class SanPhamRestController {
    @Autowired
    private SanPhamService sanPhamService;

    @Autowired
    private SanPhamRepo sanPhamRepo;

    @Autowired
    private SanPhamChiTietRepo sanPhamChiTietRepo;

    @GetMapping("/admin/san-pham/find-all")
    public ResponseEntity<?> findAll(@RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "5") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("idSanPham").descending());
        Page<SanPham> sp = sanPhamService.findAll(pageable); // Phân trang
        return ResponseEntity.ok(sp); // Trả về trang hiện tại cùng dữ liệu
    }
    @GetMapping("/admin/san-pham/find-all-not-in/{idGG}")
    public ResponseEntity<?> findAllNotInDotGiamGia(@RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "5") int size, @PathVariable Integer idGG) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SanPham> sp = sanPhamRepo.findAllNotInDotGiamGia(idGG,pageable);
        return ResponseEntity.ok(sp); // Trả về trang hiện tại cùng dữ liệu
    }

    @GetMapping("/admin/san-pham/get-all")
    public ResponseEntity<?> getAll() {
        List<SanPham> sp = sanPhamService.getAll();
        return ResponseEntity.ok(sp);
    }

    @GetMapping("/admin/san-pham/dot-giam-gia/{idGG}/chi-tiet/{idSP}")
    public ResponseEntity<List<SanPhamChiTiet>> getChiTietSanPham(@PathVariable Integer idGG, @PathVariable Integer idSP) {
        List<SanPhamChiTiet> chiTietList = sanPhamChiTietRepo.findByDotGiamGiaAndSanPham(idGG, idSP);
        return ResponseEntity.ok(chiTietList);
    }

    @DeleteMapping("/admin/delete/chi-tiet/{idChiTiet}/dot-giam-gia/{idGG}")
    public ResponseEntity<?> deleteChiTietSanPham(@PathVariable Integer idChiTiet, @PathVariable Integer idGG) {
        sanPhamChiTietRepo.deleteByDotGiamGiaAndSanPhamChiTiet(idGG, idChiTiet);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @PostMapping("/admin/san-pham/add")
    public ResponseEntity<?> createSanPham(@RequestBody SanPhamRequestDTO sanPhamRequestDTO) {
        sanPhamService.createSanPham(sanPhamRequestDTO);
        return ResponseEntity.ok(sanPhamRequestDTO);
    }

    @GetMapping("/admin/san-pham/chiTiet/{ma}")
    public ResponseEntity<?> getSanPham(@PathVariable("ma") String ma) {
        SanPham ms = sanPhamService.getSanPham(ma);
        return ResponseEntity.ok(ms);
    }

    @GetMapping("/admin/san-pham/get/{idSanPham}")
    public ResponseEntity<?> getByIDSanPham(@PathVariable("idSanPham") Integer idSanPham) {
        SanPham ms = sanPhamService.getByIdSanPham(idSanPham);
        return ResponseEntity.ok(ms);
    }


    @PostMapping("/admin/san-pham/update/{ma}")
    public ResponseEntity<?> updateSanPham(@RequestBody SanPhamRequestDTO sanPhamRequestDTO) {
        sanPhamService.updateSanPham(sanPhamRequestDTO);
        return ResponseEntity.ok(sanPhamRequestDTO);
    }

    @PostMapping("/admin/san-pham/updateTT/{idSanPham}")
    public ResponseEntity<?> updateTrangThai(@PathVariable("idSanPham") Integer idSanPham) {
        sanPhamService.updateTrangThai(idSanPham);
        return ResponseEntity.ok("");
    }
}
