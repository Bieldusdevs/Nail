package pt.lume.atelier.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class TotpVerifierTest {

    @Test
    void verifiesRfc6238CompatibleCodeWithinCurrentWindow() {
        Clock clock = Clock.fixed(Instant.ofEpochSecond(59), ZoneOffset.UTC);
        TotpVerifier verifier = new TotpVerifier(clock);

        assertThat(verifier.verify("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", "287082")).isTrue();
        assertThat(verifier.verify("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", "287083")).isFalse();
    }

    @Test
    void rejectsMalformedCodes() {
        TotpVerifier verifier = new TotpVerifier(Clock.systemUTC());
        assertThat(verifier.verify("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", "12345")).isFalse();
        assertThat(verifier.verify("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", null)).isFalse();
    }
}
