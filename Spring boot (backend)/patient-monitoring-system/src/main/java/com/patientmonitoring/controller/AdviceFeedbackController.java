package com.patientmonitoring.controller;

import com.patientmonitoring.entity.AdviceFeedback;
import com.patientmonitoring.service.AdviceFeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/advice-feedback")
@CrossOrigin(origins = "http://localhost:3000")
public class AdviceFeedbackController {

    private final AdviceFeedbackService adviceFeedbackService;

    public AdviceFeedbackController(AdviceFeedbackService adviceFeedbackService) {
        this.adviceFeedbackService = adviceFeedbackService;
    }

    @PostMapping
    public ResponseEntity<AdviceFeedback> createAdviceFeedback(
            @Valid @RequestBody AdviceFeedback adviceFeedback,
            @RequestParam("doctorId") String doctorId,
            @RequestParam("patientId") String patientId,
            @RequestParam(value = "relatedLogId", required = false) String relatedLogId) {

        AdviceFeedback savedFeedback = adviceFeedbackService.createAdviceFeedback(
                adviceFeedback, doctorId, patientId, relatedLogId);
        return new ResponseEntity<>(savedFeedback, HttpStatus.CREATED);
    }

    @GetMapping("/{feedbackId}")
    public ResponseEntity<AdviceFeedback> getFeedbackById(@PathVariable String feedbackId) {
        return ResponseEntity.ok(adviceFeedbackService.getFeedbackById(feedbackId));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AdviceFeedback>> getFeedbackByPatientId(@PathVariable String patientId) {
        return ResponseEntity.ok(adviceFeedbackService.getFeedbackByPatientId(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AdviceFeedback>> getFeedbackByDoctorId(@PathVariable String doctorId) {
        return ResponseEntity.ok(adviceFeedbackService.getFeedbackByDoctorId(doctorId));
    }

    @GetMapping("/patient/{patientId}/unread")
    public ResponseEntity<List<AdviceFeedback>> getUnreadFeedbackByPatientId(@PathVariable String patientId) {
        return ResponseEntity.ok(adviceFeedbackService.getUnreadFeedbackByPatientId(patientId));
    }

    @PatchMapping("/{feedbackId}/read")
    public ResponseEntity<AdviceFeedback> markFeedbackAsRead(@PathVariable String feedbackId) {
        return ResponseEntity.ok(adviceFeedbackService.markAsRead(feedbackId));
    }

    @PatchMapping("/patient/{patientId}/read-all")
    public ResponseEntity<Map<String, Object>> markAllFeedbackAsRead(@PathVariable String patientId) {
        int count = adviceFeedbackService.markAllAsReadForPatient(patientId);
        Map<String, Object> response = new HashMap<>();
        response.put("patientId", patientId);
        response.put("messagesMarkedAsRead", count);
        return ResponseEntity.ok(response);
    }
}