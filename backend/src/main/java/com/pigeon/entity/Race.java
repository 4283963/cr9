package com.pigeon.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "races")
public class Race {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String raceName;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private Double distanceKm;

    @Column(nullable = false)
    private LocalDateTime releaseTime;

    private String description;

    @Column(nullable = false)
    private String status;

    private LocalDateTime createdAt = LocalDateTime.now();
}
