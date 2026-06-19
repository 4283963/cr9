package com.pigeon.service;

import com.pigeon.dto.CommonAncestorDTO;
import com.pigeon.dto.KinshipResultDTO;
import com.pigeon.entity.Pigeon;
import com.pigeon.repository.PigeonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class KinshipService {

    private static final int DEFAULT_MAX_DEPTH = 3;

    @Autowired
    private PigeonRepository pigeonRepository;

    @Transactional(readOnly = true)
    public KinshipResultDTO checkKinship(Long fatherId, Long motherId, Integer maxDepth) {
        if (fatherId == null || motherId == null) {
            throw new RuntimeException("公鸽和母鸽 ID 不能为空");
        }
        if (fatherId.equals(motherId)) {
            throw new RuntimeException("公鸽和母鸽不能是同一只鸽子");
        }

        int depth = (maxDepth != null && maxDepth > 0) ? maxDepth : DEFAULT_MAX_DEPTH;

        Pigeon father = pigeonRepository.findById(fatherId)
                .orElseThrow(() -> new RuntimeException("公鸽不存在: " + fatherId));
        Pigeon mother = pigeonRepository.findById(motherId)
                .orElseThrow(() -> new RuntimeException("母鸽不存在: " + motherId));

        Map<Long, List<Integer>> fatherAncestors = collectAncestorsWithDepths(father, depth);
        Map<Long, List<Integer>> motherAncestors = collectAncestorsWithDepths(mother, depth);

        Set<Long> commonIds = new HashSet<>(fatherAncestors.keySet());
        commonIds.retainAll(motherAncestors.keySet());

        KinshipResultDTO result = new KinshipResultDTO();
        result.setMaxDepth(depth);

        if (commonIds.isEmpty()) {
            result.setHasRisk(false);
            result.setRiskLevel("安全");
            result.setMessage("两只鸽子在 " + depth + " 代以内没有共同祖先，可以安全配对。");
            result.setCommonAncestors(Collections.emptyList());
            return result;
        }

        List<CommonAncestorDTO> ancestors = new ArrayList<>();
        int closestDepth = Integer.MAX_VALUE;
        for (Long ancestorId : commonIds) {
            List<Integer> fDepths = fatherAncestors.get(ancestorId);
            List<Integer> mDepths = motherAncestors.get(ancestorId);
            int minFD = fDepths.stream().mapToInt(Integer::intValue).min().orElse(depth);
            int minMD = mDepths.stream().mapToInt(Integer::intValue).min().orElse(depth);
            int minSum = minFD + minMD;
            if (minSum < closestDepth) closestDepth = minSum;

            Pigeon anc = pigeonRepository.findById(ancestorId).orElse(null);
            CommonAncestorDTO dto = new CommonAncestorDTO();
            dto.setAncestorId(ancestorId);
            dto.setAncestorRingNumber(anc != null ? anc.getRingNumber() : "未知");
            dto.setAncestorName(anc != null ? anc.getName() : "未知");
            dto.setFatherSideDepths(fDepths);
            dto.setMotherSideDepths(mDepths);
            dto.setRelationship(describeRelationship(minFD, minMD));
            ancestors.add(dto);
        }

        ancestors.sort((a, b) -> {
            int sa = a.getFatherSideDepths().stream().mapToInt(Integer::intValue).min().orElse(depth)
                    + a.getMotherSideDepths().stream().mapToInt(Integer::intValue).min().orElse(depth);
            int sb = b.getFatherSideDepths().stream().mapToInt(Integer::intValue).min().orElse(depth)
                    + b.getMotherSideDepths().stream().mapToInt(Integer::intValue).min().orElse(depth);
            return Integer.compare(sa, sb);
        });

        String riskLevel;
        String message;
        if (closestDepth <= 2) {
            riskLevel = "极高风险";
            message = "强烈不建议配对：两只鸽子亲缘关系极近（直系兄弟姐妹或亲子级），会导致严重的近交衰退！";
        } else if (closestDepth == 3) {
            riskLevel = "高风险";
            message = "不建议配对：两只鸽子有共同的祖辈（同父同母或同祖父级），近交风险较高。";
        } else if (closestDepth == 4) {
            riskLevel = "中风险";
            message = "谨慎配对：两只鸽子在三代内有共同祖先（如表兄妹级），请评估血统优劣后再决定。";
        } else {
            riskLevel = "低风险";
            message = "注意配对：两只鸽子在三代内存在较远的共同祖先，风险相对可控。";
        }

        result.setHasRisk(true);
        result.setRiskLevel(riskLevel);
        result.setMessage(message);
        result.setCommonAncestors(ancestors);
        return result;
    }

    private Map<Long, List<Integer>> collectAncestorsWithDepths(Pigeon start, int maxDepth) {
        Map<Long, List<Integer>> result = new HashMap<>();
        Set<Long> visited = new HashSet<>();
        Queue<AncestorNode> queue = new LinkedList<>();
        if (start.getFather() != null) {
            queue.add(new AncestorNode(start.getFather(), 1));
        }
        if (start.getMother() != null) {
            queue.add(new AncestorNode(start.getMother(), 1));
        }
        visited.add(start.getId());

        while (!queue.isEmpty()) {
            AncestorNode node = queue.poll();
            Pigeon pigeon = node.pigeon;
            int depth = node.depth;
            if (depth > maxDepth) continue;
            if (pigeon == null) continue;

            Long pid = pigeon.getId();
            if (visited.contains(pid)) {
                result.computeIfAbsent(pid, k -> new ArrayList<>()).add(depth);
                continue;
            }
            visited.add(pid);
            result.computeIfAbsent(pid, k -> new ArrayList<>()).add(depth);

            if (depth < maxDepth) {
                if (pigeon.getFather() != null) {
                    queue.add(new AncestorNode(pigeon.getFather(), depth + 1));
                }
                if (pigeon.getMother() != null) {
                    queue.add(new AncestorNode(pigeon.getMother(), depth + 1));
                }
            }
        }
        return result;
    }

    private String describeRelationship(int fatherDepth, int motherDepth) {
        int minD = Math.min(fatherDepth, motherDepth);
        int maxD = Math.max(fatherDepth, motherDepth);
        if (fatherDepth == 1 && motherDepth == 1) return "同父同母 / 亲兄弟姊妹";
        if ((fatherDepth == 1 && motherDepth == 2) || (fatherDepth == 2 && motherDepth == 1)) return "叔侄 / 姑侄 / 舅甥级";
        if (fatherDepth == 2 && motherDepth == 2) return "堂表兄弟姊妹（共同祖辈）";
        if ((fatherDepth == 2 && motherDepth == 3) || (fatherDepth == 3 && motherDepth == 2)) return "从表兄弟姊妹（同曾祖辈，跨代）";
        if (fatherDepth == 3 && motherDepth == 3) return "从表兄弟姊妹（共同曾祖辈）";
        return "第 " + minD + "-" + maxD + " 代旁系";
    }

    private static class AncestorNode {
        final Pigeon pigeon;
        final int depth;

        AncestorNode(Pigeon pigeon, int depth) {
            this.pigeon = pigeon;
            this.depth = depth;
        }
    }
}
