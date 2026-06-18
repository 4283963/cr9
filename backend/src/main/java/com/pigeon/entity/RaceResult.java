package com.pigeon.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "race_results")
public class RaceResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "race_id", nullable = false)
    private Race race;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pigeon_id", nullable = false)
    private Pigeon pigeon;

    @Column(nullable = false)
    private LocalDateTime arrivalTime;

    @Column(nullable = false)
    private Double flightHours;

    @Column(nullable = false)
    private Double speedKmh;

    private Integer rank;

    private LocalDateTime createdAt = LocalDateTime.now();
}
