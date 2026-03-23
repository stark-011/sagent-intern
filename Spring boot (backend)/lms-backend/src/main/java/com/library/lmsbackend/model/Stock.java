package com.library.lmsbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "stock")
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookId;

    private String title;
    private String author;
    private String subject;
    private Integer totalQuantity;
    private Integer availableQuantity;
    private String status; // e.g., "AVAILABLE", "OUT_OF_STOCK"

    // Storing the ID of the librarian who added it
    private Long userId;
}