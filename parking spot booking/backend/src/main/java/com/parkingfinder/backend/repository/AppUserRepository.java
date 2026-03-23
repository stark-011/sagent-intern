package com.parkingfinder.backend.repository;

import com.parkingfinder.backend.entity.AppUser;
import com.parkingfinder.backend.enums.AccountStatus;
import com.parkingfinder.backend.enums.UserRole;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AppUserRepository extends JpaRepository<AppUser, String> {

    Optional<AppUser> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    long countByRole(UserRole role);

    long countByRoleAndAccountStatus(UserRole role, AccountStatus accountStatus);

    @Query("select u.role, count(u) from AppUser u group by u.role")
    List<Object[]> countUsersGroupedByRole();
}
