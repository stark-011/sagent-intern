package com.library.lmsbackend.service;

import com.library.lmsbackend.model.User;
import com.library.lmsbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository repository;

    // 1. CREATE
    public User saveUser(User user) {
        return repository.save(user);
    }

    // 2. READ (All)
    public List<User> getAllUsers() {
        return repository.findAll();
    }

    // 3. READ (One)
    public User getUserById(Long id) {
        return repository.findById(id).orElse(null);
    }

    // 4. DELETE
    public void deleteUser(Long id) {
        repository.deleteById(id);
    }

    // 5. UPDATE (PUT - Replaces entire object)
    public User updateUser(Long id, User userDetails) {
        return repository.findById(id).map(user -> {
            user.setName(userDetails.getName());
            user.setEmail(userDetails.getEmail());
            user.setPassword(userDetails.getPassword());
            user.setRole(userDetails.getRole());
            user.setContact(userDetails.getContact());
            return repository.save(user);
        }).orElse(null);
    }

    // 6. UPDATE (PATCH - Updates only provided fields)
    public User patchUser(Long id, User partialUpdate) {
        return repository.findById(id).map(user -> {
            if (partialUpdate.getName() != null) user.setName(partialUpdate.getName());
            if (partialUpdate.getEmail() != null) user.setEmail(partialUpdate.getEmail());
            if (partialUpdate.getPassword() != null) user.setPassword(partialUpdate.getPassword());
            if (partialUpdate.getRole() != null) user.setRole(partialUpdate.getRole());
            if (partialUpdate.getContact() != null) user.setContact(partialUpdate.getContact());
            return repository.save(user);
        }).orElse(null);
    }
}