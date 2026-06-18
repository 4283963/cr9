package com.pigeon.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PigeonDTO {
    private Long id;
    private String ringNumber;
    private String name;
    private String gender;
    private String color;
    private LocalDate hatchDate;
    private Long fatherId;
    private Long motherId;
    private String fatherRingNumber;
    private String motherRingNumber;
    private String strain;
    private String notes;
    private Boolean active;
}
