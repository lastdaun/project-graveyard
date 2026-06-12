package com.projectgraveyard.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String avatar;
    private String bio;
    private String location;
    private String university;
    private List<String> skills;
}
