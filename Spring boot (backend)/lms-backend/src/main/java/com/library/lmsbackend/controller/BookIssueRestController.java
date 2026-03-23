package com.library.lmsbackend.controller;

import com.library.lmsbackend.model.BookIssue;
import com.library.lmsbackend.service.BookIssueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class BookIssueRestController {

    @Autowired
    private BookIssueService issueService;

    // Issue a book
    @PostMapping
    public BookIssue createIssue(@RequestBody BookIssue issue) {
        return issueService.saveIssue(issue);
    }

    // Get all transactions
    @GetMapping
    public List<BookIssue> getAllIssues() {
        return issueService.getAllIssues();
    }

    // Return a book (Update status/date)
    @PatchMapping("/{id}")
    public ResponseEntity<BookIssue> updateIssue(@PathVariable Long id, @RequestBody BookIssue issue) {
        BookIssue updated = issueService.patchIssue(id, issue);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }
}