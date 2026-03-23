package com.college.admission.model;

import jakarta.persistence.*;

@Entity
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long documentId;

    @ManyToOne
    @JoinColumn(name = "app_id")
    private Application application;

    private String fileUrl; // Path to file
    private String docType; // 'Marksheet', 'Photo'

    // Getters and Setters
    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }
    public Application getApplication() { return application; }
    public void setApplication(Application application) { this.application = application; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public String getDocType() { return docType; }
    public void setDocType(String docType) { this.docType = docType; }
}