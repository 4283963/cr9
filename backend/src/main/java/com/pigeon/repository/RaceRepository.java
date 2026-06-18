package com.pigeon.repository;

import com.pigeon.entity.Race;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RaceRepository extends JpaRepository<Race, Long> {
    List<Race> findByStatus(String status);

    List<Race> findAllByOrderByReleaseTimeDesc();
}
