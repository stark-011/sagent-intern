package com.library.lmsbackend.controller;

import com.library.lmsbackend.model.Notify;
import com.library.lmsbackend.service.NotifyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotifyRestController {

    @Autowired
    private NotifyService notifyService;

    // Send a notification (POST)
    @PostMapping
    public Notify sendNotification(@RequestBody Notify notify) {
        return notifyService.createNotification(notify);
    }

    // Get all notifications for the whole system (Admin)
    @GetMapping
    public List<Notify> getAllNotifications() {
        return notifyService.getAllNotifications();
    }

    // Get notifications for a specific user (e.g., /api/notifications/user/1)
    @GetMapping("/user/{userId}")
    public List<Notify> getUserNotifications(@PathVariable Long userId) {
        return notifyService.getNotificationsForUser(userId);
    }

    // Mark a notification as READ (PATCH)
    @PatchMapping("/{id}/read")
    public ResponseEntity<Notify> markAsRead(@PathVariable Long id) {
        Notify updated = notifyService.markAsRead(id);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }
}