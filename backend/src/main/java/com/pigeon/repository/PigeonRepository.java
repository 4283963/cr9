package com.pigeon.repository;

import com.pigeon.entity.Pigeon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PigeonRepository extends JpaRepository<Pigeon, Long> {
    Optional<Pigeon> findByRingNumber(String ringNumber);

    List<Pigeon> findByGenderAndActive(String gender, Boolean active);

    List<Pigeon> findByActive(Boolean active);

    @Query("SELECT p FROM Pigeon p WHERE p.father.id = :fatherId OR p.mother.id = :motherId")
    List<Pigeon> findByParentId(Long fatherId, Long motherId);

    boolean existsByRingNumber(String ringNumber);
}
