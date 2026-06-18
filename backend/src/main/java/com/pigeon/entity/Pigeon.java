package com.pigeon.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "pigeons")
public class Pigeon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String ringNumber;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String gender;

    private String color;

    private LocalDate hatchDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "father_id")
    private Pigeon father;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mother_id")
    private Pigeon mother;

    private String strain;

    private String notes;

    @Column(nullable = false)
    private Boolean active = true;

    private LocalDate createdAt = LocalDate.now();
}
