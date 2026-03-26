package com.parkingfinder.backend.repository;

import com.parkingfinder.backend.entity.PricingRule;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PricingRuleRepository extends JpaRepository<PricingRule, String> {

    Optional<PricingRule> findTopBySpotSpotIdOrderByCreatedAtDesc(String spotId);

    List<PricingRule> findBySpotSpotIdOrderByCreatedAtDesc(String spotId);

    List<PricingRule> findAllByOrderByCreatedAtDesc();

    void deleteBySpotSpotId(String spotId);
}
