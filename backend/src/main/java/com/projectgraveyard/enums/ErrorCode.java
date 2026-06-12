package com.projectgraveyard.enums;

public enum ErrorCode {
    // Auth Errors
    INVALID_EMAIL_OR_PASSWORD("401", "Invalid email or password"),
    EMAIL_ALREADY_EXISTS("409", "Email already exists"),
    INVALID_EMAIL_FORMAT("400", "Invalid email format"),
    PASSWORD_TOO_SHORT("400", "Password must be at least 8 characters"),
    FULL_NAME_REQUIRED("400", "Full name is required"),

    // Project Errors  
    PROJECT_NOT_FOUND("404", "Project not found"),
    NOT_PROJECT_OWNER("403", "Only project owner can perform this action"),
    ALREADY_MEMBER("409", "Already a member of this project"),
    TEAM_FULL("400", "Team has reached maximum members"),
    
    // General
    RESOURCE_NOT_FOUND("404", "Resource not found"),
    UNAUTHORIZED("401", "Unauthorized"),
    ACCESS_DENIED("403", "Access denied"),
    INTERNAL_SERVER_ERROR("500", "Internal server error");

    private final String code;
    private final String message;

    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
