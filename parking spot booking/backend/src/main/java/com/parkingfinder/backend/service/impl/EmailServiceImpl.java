package com.parkingfinder.backend.service.impl;

import com.parkingfinder.backend.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    @Async
    public void sendOtpEmail(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("sabariwithcoc@gmail.com", "Parking Spot Finder");
            helper.setTo(toEmail);
            helper.setSubject("Password Reset OTP – Parking Spot Finder");
            helper.setText(buildOtpHtml(otp), true);

            mailSender.send(message);
            log.info("OTP email sent successfully to {}", toEmail);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    private String buildOtpHtml(String otp) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 0; }
                .container { max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 16px;
                             box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; }
                .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 24px; text-align: center; }
                .header h1 { color: #fff; margin: 0; font-size: 22px; letter-spacing: 0.5px; }
                .body { padding: 32px 24px; text-align: center; }
                .body p { color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
                .otp-box { display: inline-block; background: #f0f0ff; border: 2px dashed #4f46e5;
                           border-radius: 12px; padding: 16px 40px; font-size: 32px; font-weight: 700;
                           letter-spacing: 10px; color: #4f46e5; }
                .footer { padding: 20px 24px; text-align: center; font-size: 12px; color: #aaa; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔒 Password Reset</h1>
                </div>
                <div class="body">
                  <p>We received a request to reset your password. Use the OTP below to proceed.</p>
                  <div class="otp-box">%s</div>
                  <p style="margin-top:24px; font-size:13px; color:#888;">
                    This code is valid for <strong>5 minutes</strong>. Do not share it with anyone.
                  </p>
                </div>
                <div class="footer">
                  If you did not request this, please ignore this email.<br>
                  &copy; Parking Spot Finder
                </div>
              </div>
            </body>
            </html>
            """.formatted(otp);
    }
}
