package com.library.lmsbackend.repository;

import com.library.lmsbackend.model.BookIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookIssueRepository extends JpaRepository<BookIssue, Long> {
}