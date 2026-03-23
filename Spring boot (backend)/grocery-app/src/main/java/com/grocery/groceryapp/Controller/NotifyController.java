package com.grocery.groceryapp.Controller;

import com.grocery.groceryapp.Entity.Notify;
import com.grocery.groceryapp.Service.NotifyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotifyController {

    @Autowired
    private NotifyService notifyService;

    public static class NotifyRequest {
        public Long userId;
        public Long orderId; // Can be null
        public String message;
    }

    @PostMapping
    public ResponseEntity<Notify> sendNotification(@RequestBody NotifyRequest request) {
        Notify notify = notifyService.createNotification(
                request.userId,
                request.orderId,
                request.message
        );
        return ResponseEntity.ok(notify);
    }

    @GetMapping
    public List<Notify> getAllNotifications() {
        return notifyService.getAllNotifications();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notify> getNotificationById(@PathVariable Long id) {
        return notifyService.getNotificationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Notify> updateNotification(@PathVariable Long id, @RequestBody Notify notify) {
        Notify updated = notifyService.updateNotification(id, notify);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Notify> patchNotification(@PathVariable Long id, @RequestBody Map<String, Object> fields) {
        Notify patched = notifyService.patchNotification(id, fields);
        return patched != null ? ResponseEntity.ok(patched) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        return notifyService.deleteNotification(id) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }
}