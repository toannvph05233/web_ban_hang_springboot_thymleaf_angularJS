package com.example.demo.repo;

import com.example.demo.entity.nhanvien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NhanVienRepo extends JpaRepository<nhanvien, Integer> {
}
