package com.library.lmsbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "book_issue")
public class BookIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookIssueId;

    private Long userId; // The member borrowing the book
    private Long bookId; // The book being borrowed

    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;

    private Double fineAmount;
    private String status; // e.g., "ISSUED", "RETURNED", "OVERDUE"
}