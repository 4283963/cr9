package com.pigeon.controller;

import com.pigeon.dto.PigeonDTO;
import com.pigeon.service.PigeonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pigeons")
public class PigeonController {

    @Autowired
    private PigeonService pigeonService;

    @GetMapping
    public ResponseEntity<List<PigeonDTO>> getAllPigeons() {
        return ResponseEntity.ok(pigeonService.getAllPigeons());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PigeonDTO> getPigeonById(@PathVariable Long id) {
        return ResponseEntity.ok(pigeonService.getPigeonById(id));
    }

    @GetMapping("/ring/{ringNumber}")
    public ResponseEntity<PigeonDTO> getPigeonByRingNumber(@PathVariable String ringNumber) {
        return ResponseEntity.ok(pigeonService.getPigeonByRingNumber(ringNumber));
    }

    @PostMapping
    public ResponseEntity<PigeonDTO> createPigeon(@RequestBody PigeonDTO dto) {
        return ResponseEntity.ok(pigeonService.createPigeon(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PigeonDTO> updatePigeon(@PathVariable Long id, @RequestBody PigeonDTO dto) {
        return ResponseEntity.ok(pigeonService.updatePigeon(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePigeon(@PathVariable Long id) {
        pigeonService.deletePigeon(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/children")
    public ResponseEntity<List<PigeonDTO>> getChildren(@PathVariable Long id) {
        return ResponseEntity.ok(pigeonService.getChildren(id));
    }
}
