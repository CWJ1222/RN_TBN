package com.rntbn.backend.dto;

public class LoginResponse {

    private String token;
    private String email;
    private String nickname;
    private String message;

    // Default constructor
    public LoginResponse() {
    }

    // Constructor with parameters
    public LoginResponse(String token, String email, String nickname, String message) {
        this.token = token;
        this.email = email;
        this.nickname = nickname;
        this.message = message;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}