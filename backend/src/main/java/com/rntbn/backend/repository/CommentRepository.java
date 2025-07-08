package com.rntbn.backend.repository;

import com.rntbn.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByRegionCodeOrderByCreatedAtDesc(String regionCode);

    List<Comment> findByUserIdOrderByCreatedAtDesc(Long userId);
}