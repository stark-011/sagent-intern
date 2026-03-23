package com.patientmonitoring.controller;

import com.patientmonitoring.entity.PastRecord;
import com.patientmonitoring.service.PastRecordService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/past-records")
@CrossOrigin(origins = "http://localhost:3000")
public class PastRecordController {

    private final PastRecordService pastRecordService;

    public PastRecordController(PastRecordService pastRecordService) {
        this.pastRecordService = pastRecordService;
    }

    @PostMapping
    public ResponseEntity<PastRecord> createPastRecord(
            @Valid @RequestBody PastRecord pastRecord,
            @RequestParam("patientId") String patientId) {

        PastRecord savedRecord = pastRecordService.createPastRecord(pastRecord, patientId);
        return new ResponseEntity<>(savedRecord, HttpStatus.CREATED);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<PastRecord>> getPastRecordsByPatientId(@PathVariable String patientId) {
        return ResponseEntity.ok(pastRecordService.getPastRecordsByPatientId(patientId));
    }

    @GetMapping("/{recordId}")
    public ResponseEntity<PastRecord> getPastRecordById(@PathVariable String recordId) {
        return ResponseEntity.ok(pastRecordService.getPastRecordById(recordId));
    }

    @PutMapping("/{recordId}")
    public ResponseEntity<PastRecord> updatePastRecord(
            @PathVariable String recordId,
            @RequestBody PastRecord updatedPastRecord) {
        return ResponseEntity.ok(pastRecordService.updatePastRecord(recordId, updatedPastRecord));
    }

    @DeleteMapping("/{recordId}")
    public ResponseEntity<Map<String, Object>> deletePastRecord(@PathVariable String recordId) {
        pastRecordService.deletePastRecord(recordId);
        Map<String, Object> response = new HashMap<>();
        response.put("deleted", true);
        response.put("message", "Record deleted successfully");
        return ResponseEntity.ok(response);
    }
}