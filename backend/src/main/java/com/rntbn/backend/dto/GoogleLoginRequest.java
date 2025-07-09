package com.rntbn.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class GoogleLoginRequest {

    @NotBlank(message = "Google ID token is required")
    private String idToken;

    // Default constructor
    public GoogleLoginRequest() {
    }

    // Constructor with parameter
    public GoogleLoginRequest(String idToken) {
        this.idToken = idToken;
    }

    // Getter and Setter
    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}