package pt.lume.atelier.config;

import java.net.URI;
import java.time.ZoneId;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        URI publicUrl,
        Cors cors,
        Security security,
        Booking booking,
        Mail mail,
        BootstrapAdmin bootstrapAdmin) {

    public record Cors(List<String> allowedOrigins) {}

    public record Security(String mfaEncryptionKey, Login login) {
        public record Login(
                int maximumSessions, int standardSessionSeconds, int rememberedSessionSeconds) {}
    }

    public record Booking(ZoneId zoneId, int maximumDaysAhead, int cancellationHours) {}

    public record Mail(String from, URI resetBaseUrl) {}

    public record BootstrapAdmin(
            boolean enabled, String email, String password, String totpSecret, String phone) {}
}
