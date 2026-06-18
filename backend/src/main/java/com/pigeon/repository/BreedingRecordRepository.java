package com.pigeon.repository;

import com.pigeon.entity.BreedingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BreedingRecordRepository extends JpaRepository<BreedingRecord, Long> {
    @Query("SELECT b FROM BreedingRecord b WHERE b.father.id = :pigeonId OR b.mother.id = :pigeonId")
    List<BreedingRecord> findByPigeonId(Long pigeonId);

    List<BreedingRecord> findByStatus(String status);
}
