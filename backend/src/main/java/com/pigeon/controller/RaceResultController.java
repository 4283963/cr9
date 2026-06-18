package com.pigeon.controller;

import com.pigeon.dto.RaceResultDTO;
import com.pigeon.dto.ScanArrivalDTO;
import com.pigeon.service.RaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/race-results")
public class RaceResultController {

    @Autowired
    private RaceService raceService;

    @GetMapping("/race/{raceId}")
    public ResponseEntity<List<RaceResultDTO>> getRaceResults(@PathVariable Long raceId) {
        return ResponseEntity.ok(raceService.getRaceResults(raceId));
    }

    @PostMapping("/scan")
    public ResponseEntity<RaceResultDTO> scanArrival(@RequestBody ScanArrivalDTO dto) {
        return ResponseEntity.ok(raceService.scanArrival(dto));
    }

    @PostMapping("/simulate")
    public ResponseEntity<RaceResultDTO> simulateArrival(@RequestBody Map<String, Object> payload) {
        Long raceId = Long.valueOf(payload.get("raceId").toString());
        String ringNumber = payload.get("ringNumber").toString();
        LocalDateTime arrivalTime = LocalDateTime.parse(payload.get("arrivalTime").toString());
        return ResponseEntity.ok(raceService.simulateArrival(raceId, ringNumber, arrivalTime));
    }
}
