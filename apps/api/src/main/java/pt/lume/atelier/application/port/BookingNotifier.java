package pt.lume.atelier.application.port;

import pt.lume.atelier.domain.model.Appointment;

public interface BookingNotifier {
    void sendConfirmation(Appointment appointment);
}
