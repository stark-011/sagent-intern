package com.library.lmsbackend.controller;

import com.library.lmsbackend.model.User;
import com.library.lmsbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserRestController {

    @Autowired
    private UserService userService;

    // 1. GET ALL
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // 2. GET BY ID (Updated)
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) { // Changed return type to <?>
        User user = userService.getUserById(id);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        // Return String message instead of empty 404
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("The user is not found");
    }

    // 3. POST (Create)
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.saveUser(user);
    }

    // 4. PUT (Full Update - Updated)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        User updatedUser = userService.updateUser(id, userDetails);
        if (updatedUser != null) {
            return ResponseEntity.ok(updatedUser);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("The user is not found");
    }

    // 5. PATCH (Partial Update - Updated)
    @PatchMapping("/{id}")
    public ResponseEntity<?> patchUser(@PathVariable Long id, @RequestBody User partialUser) {
        User updatedUser = userService.patchUser(id, partialUser);
        if (updatedUser != null) {
            return ResponseEntity.ok(updatedUser);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("The user is not found");
    }

    // 6. DELETE (Updated to check existence first)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        // Check if user exists before trying to delete
        User existingUser = userService.getUserById(id);

        if (existingUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("The user is not found");
        }

        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}