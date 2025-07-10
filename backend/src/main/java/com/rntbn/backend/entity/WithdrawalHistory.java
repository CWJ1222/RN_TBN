package com.rntbn.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "withdrawal_history")
public class WithdrawalHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    private String name;
    private String nickname;
    private String pictureUrl;
    private String provider;
    private String providerId;

    @Column(name = "withdrawn_at", nullable = false)
    private LocalDateTime withdrawnAt;

    public WithdrawalHistory() {}

    public WithdrawalHistory(String email, String name, String nickname, String pictureUrl, String provider, String providerId, LocalDateTime withdrawnAt) {
        this.email = email;
        this.name = name;
        this.nickname = nickname;
        this.pictureUrl = pictureUrl;
        this.provider = provider;
        this.providerId = providerId;
        this.withdrawnAt = withdrawnAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }
    public String getPictureUrl() { return pictureUrl; }
    public void setPictureUrl(String pictureUrl) { this.pictureUrl = pictureUrl; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }
    public LocalDateTime getWithdrawnAt() { return withdrawnAt; }
    public void setWithdrawnAt(LocalDateTime withdrawnAt) { this.withdrawnAt = withdrawnAt; }
} 