package com.pigeon.dto;

import lombok.Data;

import java.util.List;

@Data
public class CommonAncestorDTO {
    private Long ancestorId;
    private String ancestorRingNumber;
    private String ancestorName;
    private List<Integer> fatherSideDepths;
    private List<Integer> motherSideDepths;
    private String relationship;
}
