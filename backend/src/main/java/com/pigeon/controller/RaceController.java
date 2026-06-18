package com.pigeon.controller;

import com.pigeon.dto.RaceDTO;
import com.pigeon.service.RaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/races")
public class RaceController {

    @Autowired
    private RaceService raceService;

    @GetMapping
    public ResponseEntity<List<RaceDTO>> getAllRaces() {
        return ResponseEntity.ok(raceService.getAllRaces());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RaceDTO> getRaceById(@PathVariable Long id) {
        return ResponseEntity.ok(raceService.getRaceById(id));
    }

    @PostMapping
    public ResponseEntity<RaceDTO> createRace(@RequestBody RaceDTO dto) {
        return ResponseEntity.ok(raceService.createRace(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RaceDTO> updateRace(@PathVariable Long id, @RequestBody RaceDTO dto) {
        return ResponseEntity.ok(raceService.updateRace(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRace(@PathVariable Long id) {
        raceService.deleteRace(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<RaceDTO> endRace(@PathVariable Long id) {
        return ResponseEntity.ok(raceService.endRace(id));
    }
}
