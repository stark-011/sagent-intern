package com.library.lmsbackend.service;

import com.library.lmsbackend.model.Notify;
import com.library.lmsbackend.repository.NotifyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotifyService {

    @Autowired
    private NotifyRepository repository;

    // 1. CREATE (Send Notification)
    public Notify createNotification(Notify notify) {
        // Auto-set the timestamp to "now" if not provided
        if (notify.getSentAt() == null) {
            notify.setSentAt(LocalDateTime.now());
        }
        // Default status
        if (notify.getStatus() == null) {
            notify.setStatus("UNREAD");
        }
        return repository.save(notify);
    }

    // 2. READ (Get All for a specific user)
    public List<Notify> getNotificationsForUser(Long userId) {
        return repository.findByUserId(userId);
    }

    // 3. READ (Get All - Admin use)
    public List<Notify> getAllNotifications() {
        return repository.findAll();
    }

    // 4. UPDATE (Mark as Read)
    public Notify markAsRead(Long id) {
        return repository.findById(id).map(notification -> {
            notification.setStatus("READ");
            return repository.save(notification);
        }).orElse(null);
    }
}