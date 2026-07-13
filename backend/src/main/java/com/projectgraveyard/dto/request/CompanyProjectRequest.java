package com.projectgraveyard.dto.request;

import com.projectgraveyard.enums.ProjectCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CompanyProjectRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private ProjectCategory category;

    private List<String> techStack;

    private String imageUrl;

    private String demoUrl;

    private Long price;

    private String priceRange;

    @NotBlank(message = "Company name is required")
    private String companyName;

    private String companyWebsite;

    @NotBlank(message = "Company contact email is required")
    private String companyContactEmail;

    private String companyContactPhone;

    private String companyLogo;
}
