package com.pigeon.service;

import com.pigeon.dto.BreedingRecordDTO;
import com.pigeon.entity.BreedingRecord;
import com.pigeon.entity.Pigeon;
import com.pigeon.repository.BreedingRecordRepository;
import com.pigeon.repository.PigeonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BreedingService {

    @Autowired
    private BreedingRecordRepository breedingRecordRepository;

    @Autowired
    private PigeonRepository pigeonRepository;

    public List<BreedingRecordDTO> getAllRecords() {
        return breedingRecordRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BreedingRecordDTO getRecordById(Long id) {
        BreedingRecord record = breedingRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("繁育记录不存在: " + id));
        return convertToDTO(record);
    }

    public List<BreedingRecordDTO> getRecordsByPigeon(Long pigeonId) {
        return breedingRecordRepository.findByPigeonId(pigeonId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public BreedingRecordDTO createRecord(BreedingRecordDTO dto) {
        Pigeon father = pigeonRepository.findById(dto.getFatherId())
                .orElseThrow(() -> new RuntimeException("父鸽不存在: " + dto.getFatherId()));
        Pigeon mother = pigeonRepository.findById(dto.getMotherId())
                .orElseThrow(() -> new RuntimeException("母鸽不存在: " + dto.getMotherId()));

        if (!"雄".equals(father.getGender()) && !"公".equals(father.getGender())) {
            throw new RuntimeException("父鸽性别错误");
        }
        if (!"雌".equals(mother.getGender()) && !"母".equals(mother.getGender())) {
            throw new RuntimeException("母鸽性别错误");
        }

        BreedingRecord record = new BreedingRecord();
        record.setFather(father);
        record.setMother(mother);
        record.setPairingDate(dto.getPairingDate());
        record.setLayDate(dto.getLayDate());
        record.setHatchDate(dto.getHatchDate());
        record.setEggsLaid(dto.getEggsLaid());
        record.setChicksHatched(dto.getChicksHatched());
        record.setNotes(dto.getNotes());
        record.setStatus(dto.getStatus() != null ? dto.getStatus() : "配对中");

        record = breedingRecordRepository.save(record);
        return convertToDTO(record);
    }

    @Transactional
    public BreedingRecordDTO updateRecord(Long id, BreedingRecordDTO dto) {
        BreedingRecord record = breedingRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("繁育记录不存在: " + id));

        if (dto.getFatherId() != null) {
            Pigeon father = pigeonRepository.findById(dto.getFatherId())
                    .orElseThrow(() -> new RuntimeException("父鸽不存在: " + dto.getFatherId()));
            record.setFather(father);
        }
        if (dto.getMotherId() != null) {
            Pigeon mother = pigeonRepository.findById(dto.getMotherId())
                    .orElseThrow(() -> new RuntimeException("母鸽不存在: " + dto.getMotherId()));
            record.setMother(mother);
        }

        record.setPairingDate(dto.getPairingDate() != null ? dto.getPairingDate() : record.getPairingDate());
        record.setLayDate(dto.getLayDate());
        record.setHatchDate(dto.getHatchDate());
        record.setEggsLaid(dto.getEggsLaid());
        record.setChicksHatched(dto.getChicksHatched());
        record.setNotes(dto.getNotes());
        record.setStatus(dto.getStatus() != null ? dto.getStatus() : record.getStatus());

        record = breedingRecordRepository.save(record);
        return convertToDTO(record);
    }

    @Transactional
    public void deleteRecord(Long id) {
        breedingRecordRepository.deleteById(id);
    }

    private BreedingRecordDTO convertToDTO(BreedingRecord record) {
        BreedingRecordDTO dto = new BreedingRecordDTO();
        dto.setId(record.getId());
        dto.setFatherId(record.getFather().getId());
        dto.setMotherId(record.getMother().getId());
        dto.setFatherRingNumber(record.getFather().getRingNumber());
        dto.setMotherRingNumber(record.getMother().getRingNumber());
        dto.setPairingDate(record.getPairingDate());
        dto.setLayDate(record.getLayDate());
        dto.setHatchDate(record.getHatchDate());
        dto.setEggsLaid(record.getEggsLaid());
        dto.setChicksHatched(record.getChicksHatched());
        dto.setNotes(record.getNotes());
        dto.setStatus(record.getStatus());
        return dto;
    }
}
