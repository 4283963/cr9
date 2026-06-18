package com.pigeon.service;

import com.pigeon.dto.RaceDTO;
import com.pigeon.dto.RaceResultDTO;
import com.pigeon.dto.ScanArrivalDTO;
import com.pigeon.entity.Pigeon;
import com.pigeon.entity.Race;
import com.pigeon.entity.RaceResult;
import com.pigeon.repository.PigeonRepository;
import com.pigeon.repository.RaceRepository;
import com.pigeon.repository.RaceResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RaceService {

    @Autowired
    private RaceRepository raceRepository;

    @Autowired
    private RaceResultRepository raceResultRepository;

    @Autowired
    private PigeonRepository pigeonRepository;

    public List<RaceDTO> getAllRaces() {
        return raceRepository.findAllByOrderByReleaseTimeDesc().stream()
                .map(this::convertRaceToDTO)
                .collect(Collectors.toList());
    }

    public RaceDTO getRaceById(Long id) {
        Race race = raceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("比赛不存在: " + id));
        return convertRaceToDTO(race);
    }

    @Transactional
    public RaceDTO createRace(RaceDTO dto) {
        Race race = new Race();
        race.setRaceName(dto.getRaceName());
        race.setLocation(dto.getLocation());
        race.setDistanceKm(dto.getDistanceKm());
        race.setReleaseTime(dto.getReleaseTime());
        race.setDescription(dto.getDescription());
        race.setStatus(dto.getStatus() != null ? dto.getStatus() : "未开始");
        race = raceRepository.save(race);
        return convertRaceToDTO(race);
    }

    @Transactional
    public RaceDTO updateRace(Long id, RaceDTO dto) {
        Race race = raceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("比赛不存在: " + id));
        race.setRaceName(dto.getRaceName() != null ? dto.getRaceName() : race.getRaceName());
        race.setLocation(dto.getLocation() != null ? dto.getLocation() : race.getLocation());
        race.setDistanceKm(dto.getDistanceKm() != null ? dto.getDistanceKm() : race.getDistanceKm());
        race.setReleaseTime(dto.getReleaseTime() != null ? dto.getReleaseTime() : race.getReleaseTime());
        race.setDescription(dto.getDescription());
        race.setStatus(dto.getStatus() != null ? dto.getStatus() : race.getStatus());
        race = raceRepository.save(race);
        return convertRaceToDTO(race);
    }

    @Transactional
    public void deleteRace(Long id) {
        raceRepository.deleteById(id);
    }

    @Transactional
    public RaceResultDTO scanArrival(ScanArrivalDTO dto) {
        Race race = raceRepository.findById(dto.getRaceId())
                .orElseThrow(() -> new RuntimeException("比赛不存在: " + dto.getRaceId()));

        Pigeon pigeon = pigeonRepository.findByRingNumber(dto.getRingNumber())
                .orElseThrow(() -> new RuntimeException("足环号不存在: " + dto.getRingNumber()));

        if (raceResultRepository.existsByRaceIdAndPigeonId(dto.getRaceId(), pigeon.getId())) {
            throw new RuntimeException("该鸽子已登记归巢");
        }

        LocalDateTime arrivalTime = LocalDateTime.now();
        Duration duration = Duration.between(race.getReleaseTime(), arrivalTime);
        double flightHours = duration.toMinutes() / 60.0;
        double speedKmh = flightHours > 0 ? race.getDistanceKm() / flightHours : 0;

        RaceResult result = new RaceResult();
        result.setRace(race);
        result.setPigeon(pigeon);
        result.setArrivalTime(arrivalTime);
        result.setFlightHours(Math.round(flightHours * 100.0) / 100.0);
        result.setSpeedKmh(Math.round(speedKmh * 100.0) / 100.0);

        result = raceResultRepository.save(result);
        updateRanks(dto.getRaceId());

        if ("未开始".equals(race.getStatus()) || "进行中".equals(race.getStatus())) {
            race.setStatus("进行中");
            raceRepository.save(race);
        }

        return convertResultToDTO(result);
    }

    @Transactional
    public RaceResultDTO simulateArrival(Long raceId, String ringNumber, LocalDateTime arrivalTime) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("比赛不存在: " + raceId));

        Pigeon pigeon = pigeonRepository.findByRingNumber(ringNumber)
                .orElseThrow(() -> new RuntimeException("足环号不存在: " + ringNumber));

        if (raceResultRepository.existsByRaceIdAndPigeonId(raceId, pigeon.getId())) {
            throw new RuntimeException("该鸽子已登记归巢");
        }

        if (arrivalTime.isBefore(race.getReleaseTime())) {
            throw new RuntimeException("归巢时间不能早于放飞时间");
        }

        Duration duration = Duration.between(race.getReleaseTime(), arrivalTime);
        double flightHours = duration.toMinutes() / 60.0;
        double speedKmh = flightHours > 0 ? race.getDistanceKm() / flightHours : 0;

        RaceResult result = new RaceResult();
        result.setRace(race);
        result.setPigeon(pigeon);
        result.setArrivalTime(arrivalTime);
        result.setFlightHours(Math.round(flightHours * 100.0) / 100.0);
        result.setSpeedKmh(Math.round(speedKmh * 100.0) / 100.0);

        result = raceResultRepository.save(result);
        updateRanks(raceId);

        return convertResultToDTO(result);
    }

    public List<RaceResultDTO> getRaceResults(Long raceId) {
        List<RaceResult> results = raceResultRepository.findByRaceIdOrderBySpeedKmhDesc(raceId);
        return results.stream()
                .map(this::convertResultToDTO)
                .collect(Collectors.toList());
    }

    private void updateRanks(Long raceId) {
        List<RaceResult> results = raceResultRepository.findByRaceIdOrderBySpeedKmhDesc(raceId);
        int rank = 1;
        for (RaceResult result : results) {
            result.setRank(rank++);
            raceResultRepository.save(result);
        }
    }

    @Transactional
    public RaceDTO endRace(Long id) {
        Race race = raceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("比赛不存在: " + id));
        race.setStatus("已结束");
        updateRanks(id);
        race = raceRepository.save(race);
        return convertRaceToDTO(race);
    }

    private RaceDTO convertRaceToDTO(Race race) {
        RaceDTO dto = new RaceDTO();
        dto.setId(race.getId());
        dto.setRaceName(race.getRaceName());
        dto.setLocation(race.getLocation());
        dto.setDistanceKm(race.getDistanceKm());
        dto.setReleaseTime(race.getReleaseTime());
        dto.setDescription(race.getDescription());
        dto.setStatus(race.getStatus());
        return dto;
    }

    private RaceResultDTO convertResultToDTO(RaceResult result) {
        RaceResultDTO dto = new RaceResultDTO();
        dto.setId(result.getId());
        dto.setRaceId(result.getRace().getId());
        dto.setPigeonId(result.getPigeon().getId());
        dto.setRingNumber(result.getPigeon().getRingNumber());
        dto.setPigeonName(result.getPigeon().getName());
        dto.setArrivalTime(result.getArrivalTime());
        dto.setFlightHours(result.getFlightHours());
        dto.setSpeedKmh(result.getSpeedKmh());
        dto.setRank(result.getRank());
        return dto;
    }
}
