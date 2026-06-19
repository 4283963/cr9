package com.pigeon.dto;

import lombok.Data;

import java.util.List;

@Data
public class KinshipResultDTO {
    private Boolean hasRisk;
    private Integer maxDepth;
    private List<CommonAncestorDTO> commonAncestors;
    private String riskLevel;
    private String message;
}
