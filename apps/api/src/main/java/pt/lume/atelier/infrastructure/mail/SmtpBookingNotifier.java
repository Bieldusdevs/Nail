package pt.lume.atelier.infrastructure.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import pt.lume.atelier.application.port.BookingNotifier;
import pt.lume.atelier.config.AppProperties;
import pt.lume.atelier.domain.model.Appointment;

@Component
public class SmtpBookingNotifier implements BookingNotifier {

    private static final Logger LOGGER = LoggerFactory.getLogger(SmtpBookingNotifier.class);
    private final JavaMailSender mailSender;
    private final AppProperties properties;

    public SmtpBookingNotifier(JavaMailSender mailSender, AppProperties properties) {
        this.mailSender = mailSender;
        this.properties = properties;
    }

    @Override
    @Async
    public void sendConfirmation(Appointment appointment) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(properties.mail().from());
        message.setTo(appointment.getCustomerEmail());
        message.setSubject("A tua marcação no Lume está confirmada");
        String reference = "LM-" + appointment.getId().toString().substring(0, 6).toUpperCase();
        message.setText(
                "Olá "
                        + appointment.getCustomerFirstName()
                        + ",\n\n"
                        + "A tua marcação "
                        + reference
                        + " está confirmada para "
                        + appointment.getStartsAt()
                        + ".\n\nLume Atelier");
        try {
            mailSender.send(message);
        } catch (MailException exception) {
            LOGGER.error(
                    "Booking confirmation delivery failed for appointmentId={}",
                    appointment.getId());
        }
    }
}
