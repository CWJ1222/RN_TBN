package com.rntbn.backend.service;

import com.rntbn.backend.entity.User;
import com.rntbn.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

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
            // 기존 사용자 정보 업데이트
            existingUser.setName(name);
            existingUser.setPictureUrl(picture);
            existingUser.setProviderId(providerId);
            // 기존 사용자에 nickname이 없으면 nickname도 업데이트
            if (existingUser.getNickname() == null || existingUser.getNickname().isEmpty()) {
                existingUser.setNickname(nickname);
            }
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
}