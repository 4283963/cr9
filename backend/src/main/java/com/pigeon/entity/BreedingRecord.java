package com.pigeon.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "breeding_records")
public class BreedingRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "father_id", nullable = false)
    private Pigeon father;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mother_id", nullable = false)
    private Pigeon mother;

    @Column(nullable = false)
    private LocalDate pairingDate;

    private LocalDate layDate;

    private LocalDate hatchDate;

    private Integer eggsLaid;

    private Integer chicksHatched;

    private String notes;

    @Column(nullable = false)
    private String status;

    private LocalDate createdAt = LocalDate.now();
}
