package com.college.admission.repository;
import com.college.admission.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByApplication_AppId(Long appId);
}