package com.patientmonitoring.dto.auth;

public class AuthUserResponse {

    private String id;
    private String fullName;
    private String contactDetails;
    private String role;

    public AuthUserResponse() {
    }

    public AuthUserResponse(String id, String fullName, String contactDetails, String role) {
        this.id = id;
        this.fullName = fullName;
        this.contactDetails = contactDetails;
        this.role = role;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getContactDetails() {
        return contactDetails;
    }

    public void setContactDetails(String contactDetails) {
        this.contactDetails = contactDetails;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
