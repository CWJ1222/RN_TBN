package com.rntbn.backend.repository;

import com.rntbn.backend.entity.WithdrawalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WithdrawalHistoryRepository extends JpaRepository<WithdrawalHistory, Long> {
} 