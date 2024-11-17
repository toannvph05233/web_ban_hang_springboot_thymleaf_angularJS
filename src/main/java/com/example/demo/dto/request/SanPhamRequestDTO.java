package com.example.demo.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SanPhamRequestDTO {
    private Integer idSanPham;
    private String ma;
    private String ten;
    private Date createDate;
    private Date updateDate;
}