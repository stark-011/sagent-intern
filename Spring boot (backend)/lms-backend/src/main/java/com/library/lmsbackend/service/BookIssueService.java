package com.library.lmsbackend.service;

import com.library.lmsbackend.model.BookIssue;
import com.library.lmsbackend.repository.BookIssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BookIssueService {

    @Autowired
    private BookIssueRepository repository;

    public BookIssue saveIssue(BookIssue issue) {
        return repository.save(issue);
    }

    public List<BookIssue> getAllIssues() {
        return repository.findAll();
    }

    public BookIssue getIssueById(Long id) {
        return repository.findById(id).orElse(null);
    }

    // PATCH: Useful for updating status to "RETURNED" or adding a fine
    public BookIssue patchIssue(Long id, BookIssue partialIssue) {
        return repository.findById(id).map(issue -> {
            if (partialIssue.getReturnDate() != null) issue.setReturnDate(partialIssue.getReturnDate());
            if (partialIssue.getStatus() != null) issue.setStatus(partialIssue.getStatus());
            if (partialIssue.getFineAmount() != null) issue.setFineAmount(partialIssue.getFineAmount());
            return repository.save(issue);
        }).orElse(null);
    }
}