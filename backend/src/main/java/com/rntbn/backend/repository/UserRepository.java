package com.rntbn.backend.repository;

import com.rntbn.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByProviderAndProviderId(String provider, String providerId);

    Optional<User> findByEmailAndProvider(String email, String provider);

    boolean existsByEmail(String email);
}