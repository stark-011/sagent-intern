package com.college.admission.service;

import com.college.admission.model.User;
import com.college.admission.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository repo;

    // CREATE & UPDATE
    public User registerUser(User user) {
        return repo.save(user);
    }

    // READ (Login)
    public User login(String email, String password) {
        User user = repo.findByEmail(email);
        if (user != null && user.getPassword().equals(password)) {
            return user;
        }
        return null;
    }

    // READ (Get All)
    public List<User> getAllUsers() {
        return repo.findAll();
    }

    // READ (Get One)
    public User getUserById(Long id) {
        return repo.findById(id).orElse(null);
    }

    // DELETE
    public void deleteUser(Long id) {
        repo.deleteById(id);
    }
}