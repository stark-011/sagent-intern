package com.library.lmsbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notify")
public class Notify {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;

    // Using LocalDateTime for Timestamp
    private LocalDateTime sentAt;

    // Relationships (Storing IDs is simpler for JSON APIs)
    private Long userId;        // Who receives the message
    private Long bookIssueId;   // Which transaction is this about?

    private String status;      // e.g., "UNREAD", "READ"
}