package com.rntbn.backend.service;

import com.rntbn.backend.entity.User;
import com.rntbn.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;
import com.rntbn.backend.entity.WithdrawalHistory;
import com.rntbn.backend.repository.WithdrawalHistoryRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WithdrawalHistoryRepository withdrawalHistoryRepository;

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User findByProviderAndProviderId(String provider, String providerId) {
        return userRepository.findByProviderAndProviderId(provider, providerId)
                .orElse(null);
    }

    public User findByEmailAndProvider(String email, String provider) {
        return userRepository.findByEmailAndProvider(email, provider)
                .orElse(null);
    }

    public User createOrUpdateSocialUser(String email, String name, String picture, String provider,
            String providerId) {
        // 기존 사용자 찾기 (provider + providerId 또는 email + provider)
        User existingUser = findByProviderAndProviderId(provider, providerId);
        if (existingUser == null) {
            existingUser = findByEmailAndProvider(email, provider);
        }

        // 닉네임 결정 로직
        String nickname;
        if (name != null && !name.isEmpty()) {
            nickname = name;
        } else if (email != null && email.contains("@")) {
            nickname = email.substring(0, email.indexOf("@"));
        } else {
            nickname = "user" + System.currentTimeMillis();
        }

        if (existingUser != null) {
            // soft delete 상태면 복구 + 닉네임 무조건 새로 설정
            if (existingUser.isDeleted()) {
                existingUser.setDeleted(false);
                existingUser.setDeletedAt(null);
                existingUser.setNickname(nickname);
            }
            existingUser.setName(name);
            existingUser.setPictureUrl(picture);
            existingUser.setProviderId(providerId);
            return userRepository.save(existingUser);
        } else {
            // 새 사용자 생성
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setNickname(nickname);
            newUser.setPictureUrl(picture);
            newUser.setProvider(provider);
            newUser.setProviderId(providerId);
            return userRepository.save(newUser);
        }
    }

    public User updateNickname(String email, String newNickname) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setNickname(newNickname);
            return userRepository.save(user);
        } else {
            throw new RuntimeException("사용자를 찾을 수 없습니다: " + email);
        }
    }

    // (중요) 탈퇴 후 재가입(restoreUser) 시 닉네임을 항상 새로 설정
    @Transactional
    public void restoreUser(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setDeleted(false);
        user.setDeletedAt(null);
        // 닉네임을 재설정 (이름 또는 이메일 앞부분)
        String nickname;
        if (user.getName() != null && !user.getName().isEmpty()) {
            nickname = user.getName();
        } else if (user.getEmail() != null && user.getEmail().contains("@")) {
            nickname = user.getEmail().substring(0, user.getEmail().indexOf("@"));
        } else {
            nickname = "user" + System.currentTimeMillis();
        }
        user.setNickname(nickname);
        userRepository.save(user);
        // 활동 이력은 그대로 숨김
    }

    @Transactional
    public void softDeleteUser(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setDeleted(true);
        user.setDeletedAt(java.time.LocalDateTime.now());
        userRepository.save(user);
        // 탈퇴 이력 기록 (복구)
        WithdrawalHistory history = new WithdrawalHistory(
            user.getEmail(),
            user.getName(),
            user.getNickname(),
            user.getPictureUrl(),
            user.getProvider(),
            user.getProviderId(),
            user.getDeletedAt()
        );
        withdrawalHistoryRepository.save(history);
        // 추가적으로 댓글/게시글 숨김 처리 등 필요 로직
    }
}