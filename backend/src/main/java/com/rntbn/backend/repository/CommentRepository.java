package com.rntbn.backend.repository;

import com.rntbn.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByRegionCodeOrderByCreatedAtDesc(String regionCode);

    List<Comment> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Transactional
    @Modifying
    @Query("UPDATE Comment c SET c.isVisibleToUser = false WHERE c.user.id = :userId")
    void hideAllByUserId(Long userId);

    @Transactional
    @Modifying
    @Query("UPDATE Comment c SET c.isVisibleToUser = false WHERE c.user.id = :userId AND c.createdAt BETWEEN :start AND :end")
    void hideAllByUserIdAndCreatedAtBetween(Long userId, java.time.LocalDateTime start, java.time.LocalDateTime end);
}