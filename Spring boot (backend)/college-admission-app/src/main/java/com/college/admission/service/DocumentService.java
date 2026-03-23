package com.college.admission.service;

import com.college.admission.model.Document;
import com.college.admission.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository repo;

    // CREATE & UPDATE
    public Document uploadDocument(Document doc) {
        return repo.save(doc);
    }

    // READ (Get All)
    public List<Document> getAllDocuments() {
        return repo.findAll();
    }

    // READ (Get One)
    public Document getDocumentById(Long id) {
        return repo.findById(id).orElse(null);
    }

    // DELETE
    public void deleteDocument(Long id) {
        repo.deleteById(id);
    }
}