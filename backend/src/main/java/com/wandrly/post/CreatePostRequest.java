package com.wandrly.post;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreatePostRequest {

    @NotNull(message = "Post type is required")
    @Pattern(regexp = "itinerary|restaurant|experience", message = "Type must be itinerary, restaurant, or experience")
    private String type;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must be under 255 characters")
    private String title;

    @Size(max = 50000, message = "Body too long")
    private String body;

    private String coverImageUrl;

    @Size(max = 255, message = "Destination name too long")
    private String destination;

    @Pattern(regexp = "public|followers", message = "Visibility must be public or followers")
    private String visibility = "public";

    @Pattern(regexp = "published|draft", message = "Status must be published or draft")
    private String status = "published";

    private List<String> tags;
}
