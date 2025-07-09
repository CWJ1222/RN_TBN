package com.rntbn.backend.dto;

public class UpdateNicknameRequest {
    private String nickname;

    // Default constructor
    public UpdateNicknameRequest() {
    }

    // Constructor with parameter
    public UpdateNicknameRequest(String nickname) {
        this.nickname = nickname;
    }

    // Getter and Setter
    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }
}