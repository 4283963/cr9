package com.pigeon.controller;

import com.pigeon.dto.BreedingRecordDTO;
import com.pigeon.service.BreedingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/breeding")
public class BreedingController {

    @Autowired
    private BreedingService breedingService;

    @GetMapping
    public ResponseEntity<List<BreedingRecordDTO>> getAllRecords() {
        return ResponseEntity.ok(breedingService.getAllRecords());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BreedingRecordDTO> getRecordById(@PathVariable Long id) {
        return ResponseEntity.ok(breedingService.getRecordById(id));
    }

    @GetMapping("/pigeon/{pigeonId}")
    public ResponseEntity<List<BreedingRecordDTO>> getRecordsByPigeon(@PathVariable Long pigeonId) {
        return ResponseEntity.ok(breedingService.getRecordsByPigeon(pigeonId));
    }

    @PostMapping
    public ResponseEntity<BreedingRecordDTO> createRecord(@RequestBody BreedingRecordDTO dto) {
        return ResponseEntity.ok(breedingService.createRecord(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BreedingRecordDTO> updateRecord(@PathVariable Long id, @RequestBody BreedingRecordDTO dto) {
        return ResponseEntity.ok(breedingService.updateRecord(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecord(@PathVariable Long id) {
        breedingService.deleteRecord(id);
        return ResponseEntity.noContent().build();
    }
}
