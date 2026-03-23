package com.library.lmsbackend.repository;

import com.library.lmsbackend.model.Notify;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotifyRepository extends JpaRepository<Notify, Long> {

    // Custom query: Find all notifications for a specific user
    List<Notify> findByUserId(Long userId);

    // Custom query: Find unread notifications for a user
    List<Notify> findByUserIdAndStatus(Long userId, String status);
}