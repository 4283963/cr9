package com.pigeon.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RaceDTO {
    private Long id;
    private String raceName;
    private String location;
    private Double distanceKm;
    private LocalDateTime releaseTime;
    private String description;
    private String status;
}
