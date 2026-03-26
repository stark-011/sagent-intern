package com.parkingfinder.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ParkingSpotFinderBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ParkingSpotFinderBackendApplication.class, args);
    }
}
