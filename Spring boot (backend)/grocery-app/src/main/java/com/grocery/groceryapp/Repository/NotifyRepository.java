package com.grocery.groceryapp.Repository;

import com.grocery.groceryapp.Entity.Notify;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotifyRepository extends JpaRepository<Notify, Long> {
}