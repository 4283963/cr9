package com.pigeon.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class BreedingRecordDTO {
    private Long id;
    private Long fatherId;
    private Long motherId;
    private String fatherRingNumber;
    private String motherRingNumber;
    private LocalDate pairingDate;
    private LocalDate layDate;
    private LocalDate hatchDate;
    private Integer eggsLaid;
    private Integer chicksHatched;
    private String notes;
    private String status;
}
