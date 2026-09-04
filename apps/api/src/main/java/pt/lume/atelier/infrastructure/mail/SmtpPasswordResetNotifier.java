package pt.lume.atelier.infrastructure.mail;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import pt.lume.atelier.application.port.PasswordResetNotifier;
import pt.lume.atelier.config.AppProperties;

@Component
public class SmtpPasswordResetNotifier implements PasswordResetNotifier {

    private static final Logger LOGGER = LoggerFactory.getLogger(SmtpPasswordResetNotifier.class);
    private final JavaMailSender mailSender;
    private final AppProperties properties;

    public SmtpPasswordResetNotifier(JavaMailSender mailSender, AppProperties properties) {
        this.mailSender = mailSender;
        this.properties = properties;
    }

    @Override
    @Async
    public void sendPasswordReset(String email, String firstName, String rawToken) {
        String encodedToken = URLEncoder.encode(rawToken, StandardCharsets.UTF_8);
        String resetUrl = properties.mail().resetBaseUrl() + "?token=" + encodedToken;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(properties.mail().from());
        message.setTo(email);
        message.setSubject("Recupera o acesso à tua conta Lume");
        message.setText(
                "Olá "
                        + firstName
                        + ",\n\nUsa esta ligação nos próximos 20 minutos:\n"
                        + resetUrl
                        + "\n\nSe não fizeste este pedido, ignora esta mensagem.");
        try {
            mailSender.send(message);
        } catch (MailException exception) {
            LOGGER.error("Password reset delivery failed");
        }
    }
}
