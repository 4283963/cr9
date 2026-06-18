package com.pigeon.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RaceResultDTO {
    private Long id;
    private Long raceId;
    private Long pigeonId;
    private String ringNumber;
    private String pigeonName;
    private LocalDateTime arrivalTime;
    private Double flightHours;
    private Double speedKmh;
    private Integer rank;
}
