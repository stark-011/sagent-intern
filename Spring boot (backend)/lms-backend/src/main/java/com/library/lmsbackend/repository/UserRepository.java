package com.library.lmsbackend.repository;

import com.library.lmsbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // We can add custom finder methods here if needed
    // boolean existsByEmail(String email);
}