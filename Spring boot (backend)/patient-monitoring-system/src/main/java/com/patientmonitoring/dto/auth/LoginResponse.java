package com.patientmonitoring.dto.auth;

public class LoginResponse {

    private String token;
    private AuthUserResponse user;

    public LoginResponse() {
    }

    public LoginResponse(String token, AuthUserResponse user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public AuthUserResponse getUser() {
        return user;
    }

    public void setUser(AuthUserResponse user) {
        this.user = user;
    }
}
