package com.grocery.groceryapp.Repository;

import com.grocery.groceryapp.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Custom query example: Find user by contact number
    // User findByContact(String contact);
}