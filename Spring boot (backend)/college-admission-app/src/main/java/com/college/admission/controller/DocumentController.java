package com.college.admission.controller;

import com.college.admission.model.Document;
import com.college.admission.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin("*")
public class DocumentController {

    @Autowired
    private DocumentService service;

    // CREATE (Upload)
    @PostMapping
    public Document uploadDocument(@RequestBody Document doc) {
        return service.uploadDocument(doc);
    }

    // READ (All documents for an App - logically better, but here is generic All)
    @GetMapping
    public List<Document> getAllDocuments() {
        return service.getAllDocuments();
    }

    // READ (One)
    @GetMapping("/{id}")
    public Document getDocumentById(@PathVariable Long id) {
        return service.getDocumentById(id);
    }

    // UPDATE (Re-upload)
    @PutMapping("/{id}")
    public Document updateDocument(@PathVariable Long id, @RequestBody Document docDetails) {
        Document doc = service.getDocumentById(id);
        if (doc != null) {
            doc.setFileUrl(docDetails.getFileUrl());
            doc.setDocType(docDetails.getDocType());
            return service.uploadDocument(doc);
        }
        return null;
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteDocument(@PathVariable Long id) {
        service.deleteDocument(id);
        return "Document deleted successfully";
    }
}