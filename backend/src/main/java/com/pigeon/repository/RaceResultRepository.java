package com.pigeon.repository;

import com.pigeon.entity.RaceResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RaceResultRepository extends JpaRepository<RaceResult, Long> {
    List<RaceResult> findByRaceIdOrderBySpeedKmhDesc(Long raceId);

    @Query("SELECT r FROM RaceResult r WHERE r.race.id = :raceId AND r.pigeon.id = :pigeonId")
    Optional<RaceResult> findByRaceIdAndPigeonId(Long raceId, Long pigeonId);

    Optional<RaceResult> findByRaceIdAndPigeonRingNumber(Long raceId, String ringNumber);

    boolean existsByRaceIdAndPigeonId(Long raceId, Long pigeonId);

    @Query("SELECT COUNT(r) FROM RaceResult r WHERE r.race.id = :raceId")
    long countByRaceId(Long raceId);
}
