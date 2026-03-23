package com.college.admission.controller;

import com.college.admission.model.User;
import com.college.admission.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
public class UserController {

    @Autowired
    private UserService service;

    // CREATE (Register)
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return service.registerUser(user);
    }

    // READ (Login - usually a POST for security, but part of Read logic)
    @PostMapping("/login")
    public User login(@RequestBody User user) {
        return service.login(user.getEmail(), user.getPassword());
    }

    // READ (Get All Users - for Officer)
    @GetMapping
    public List<User> getAllUsers() {
        return service.getAllUsers();
    }

    // READ (Get One User)
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return service.getUserById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        User user = service.getUserById(id);
        if (user != null) {
            user.setName(userDetails.getName());
            user.setAge(userDetails.getAge());
            user.setEmail(userDetails.getEmail());
            // Password update should be handled carefully in real apps
            return service.registerUser(user); // Save updates
        }
        return null;
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        service.deleteUser(id);
        return "User deleted successfully";
    }
}