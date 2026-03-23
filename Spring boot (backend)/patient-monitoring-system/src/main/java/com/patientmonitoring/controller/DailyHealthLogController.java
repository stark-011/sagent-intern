package com.patientmonitoring.controller;

import com.patientmonitoring.entity.DailyHealthLog;
import com.patientmonitoring.service.DailyHealthLogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/health-logs")
@CrossOrigin(origins = "http://localhost:3000")
public class DailyHealthLogController {

    private final DailyHealthLogService dailyHealthLogService;

    public DailyHealthLogController(DailyHealthLogService dailyHealthLogService) {
        this.dailyHealthLogService = dailyHealthLogService;
    }

    @PostMapping
    public ResponseEntity<DailyHealthLog> addHealthLog(
            @RequestBody DailyHealthLog healthLog,
            @RequestParam("patientId") String patientId) {

        DailyHealthLog savedLog = dailyHealthLogService.addHealthLog(healthLog, patientId);
        return new ResponseEntity<>(savedLog, HttpStatus.CREATED);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<DailyHealthLog>> getHealthLogsByPatientId(@PathVariable String patientId) {
        return ResponseEntity.ok(dailyHealthLogService.getHealthLogsByPatientId(patientId));
    }

    @GetMapping("/{logId}")
    public ResponseEntity<DailyHealthLog> getHealthLogById(@PathVariable String logId) {
        return ResponseEntity.ok(dailyHealthLogService.getHealthLogById(logId));
    }
}