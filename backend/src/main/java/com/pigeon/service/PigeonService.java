package com.pigeon.service;

import com.pigeon.dto.PigeonDTO;
import com.pigeon.entity.Pigeon;
import com.pigeon.repository.PigeonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PigeonService {

    @Autowired
    private PigeonRepository pigeonRepository;

    public List<PigeonDTO> getAllPigeons() {
        return pigeonRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PigeonDTO getPigeonById(Long id) {
        Pigeon pigeon = pigeonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("鸽子不存在: " + id));
        return convertToDTO(pigeon);
    }

    public PigeonDTO getPigeonByRingNumber(String ringNumber) {
        Pigeon pigeon = pigeonRepository.findByRingNumber(ringNumber)
                .orElseThrow(() -> new RuntimeException("足环号不存在: " + ringNumber));
        return convertToDTO(pigeon);
    }

    @Transactional
    public PigeonDTO createPigeon(PigeonDTO dto) {
        if (pigeonRepository.existsByRingNumber(dto.getRingNumber())) {
            throw new RuntimeException("足环号已存在: " + dto.getRingNumber());
        }
        Pigeon pigeon = convertToEntity(dto);
        pigeon = pigeonRepository.save(pigeon);
        return convertToDTO(pigeon);
    }

    @Transactional
    public PigeonDTO updatePigeon(Long id, PigeonDTO dto) {
        Pigeon pigeon = pigeonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("鸽子不存在: " + id));

        if (!pigeon.getRingNumber().equals(dto.getRingNumber())
                && pigeonRepository.existsByRingNumber(dto.getRingNumber())) {
            throw new RuntimeException("足环号已存在: " + dto.getRingNumber());
        }

        pigeon.setRingNumber(dto.getRingNumber());
        pigeon.setName(dto.getName());
        pigeon.setGender(dto.getGender());
        pigeon.setColor(dto.getColor());
        pigeon.setHatchDate(dto.getHatchDate());
        pigeon.setStrain(dto.getStrain());
        pigeon.setNotes(dto.getNotes());
        pigeon.setActive(dto.getActive() != null ? dto.getActive() : true);

        if (dto.getFatherId() != null) {
            Pigeon father = pigeonRepository.findById(dto.getFatherId()).orElse(null);
            pigeon.setFather(father);
        }
        if (dto.getMotherId() != null) {
            Pigeon mother = pigeonRepository.findById(dto.getMotherId()).orElse(null);
            pigeon.setMother(mother);
        }

        pigeon = pigeonRepository.save(pigeon);
        return convertToDTO(pigeon);
    }

    @Transactional
    public void deletePigeon(Long id) {
        Pigeon pigeon = pigeonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("鸽子不存在: " + id));
        pigeon.setActive(false);
        pigeonRepository.save(pigeon);
    }

    public List<PigeonDTO> getChildren(Long id) {
        return pigeonRepository.findByParentId(id, id).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private PigeonDTO convertToDTO(Pigeon pigeon) {
        PigeonDTO dto = new PigeonDTO();
        dto.setId(pigeon.getId());
        dto.setRingNumber(pigeon.getRingNumber());
        dto.setName(pigeon.getName());
        dto.setGender(pigeon.getGender());
        dto.setColor(pigeon.getColor());
        dto.setHatchDate(pigeon.getHatchDate());
        dto.setStrain(pigeon.getStrain());
        dto.setNotes(pigeon.getNotes());
        dto.setActive(pigeon.getActive());

        if (pigeon.getFather() != null) {
            dto.setFatherId(pigeon.getFather().getId());
            dto.setFatherRingNumber(pigeon.getFather().getRingNumber());
        }
        if (pigeon.getMother() != null) {
            dto.setMotherId(pigeon.getMother().getId());
            dto.setMotherRingNumber(pigeon.getMother().getRingNumber());
        }
        return dto;
    }

    private Pigeon convertToEntity(PigeonDTO dto) {
        Pigeon pigeon = new Pigeon();
        pigeon.setRingNumber(dto.getRingNumber());
        pigeon.setName(dto.getName());
        pigeon.setGender(dto.getGender());
        pigeon.setColor(dto.getColor());
        pigeon.setHatchDate(dto.getHatchDate());
        pigeon.setStrain(dto.getStrain());
        pigeon.setNotes(dto.getNotes());
        pigeon.setActive(dto.getActive() != null ? dto.getActive() : true);

        if (dto.getFatherId() != null) {
            Pigeon father = pigeonRepository.findById(dto.getFatherId()).orElse(null);
            pigeon.setFather(father);
        }
        if (dto.getMotherId() != null) {
            Pigeon mother = pigeonRepository.findById(dto.getMotherId()).orElse(null);
            pigeon.setMother(mother);
        }
        return pigeon;
    }
}
