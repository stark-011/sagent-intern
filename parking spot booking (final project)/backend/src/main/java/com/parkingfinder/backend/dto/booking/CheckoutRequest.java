package com.parkingfinder.backend.dto.booking;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CheckoutRequest {
    private LocalDateTime actualCheckoutTime;
}
