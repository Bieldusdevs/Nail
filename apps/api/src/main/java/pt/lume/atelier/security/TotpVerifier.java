package pt.lume.atelier.security;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Clock;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.apache.commons.codec.binary.Base32;
import org.springframework.stereotype.Component;

@Component
public class TotpVerifier {

    private static final long TIME_STEP_SECONDS = 30;
    private final Clock clock;
    private final Base32 base32 = new Base32();

    public TotpVerifier(Clock clock) {
        this.clock = clock;
    }

    public boolean verify(String base32Secret, String submittedCode) {
        if (submittedCode == null || !submittedCode.matches("\\d{6}")) {
            return false;
        }
        long currentWindow = clock.instant().getEpochSecond() / TIME_STEP_SECONDS;
        for (long offset = -1; offset <= 1; offset++) {
            String expectedCode = generateCode(base32Secret, currentWindow + offset);
            if (MessageDigest.isEqual(
                    expectedCode.getBytes(StandardCharsets.US_ASCII),
                    submittedCode.getBytes(StandardCharsets.US_ASCII))) {
                return true;
            }
        }
        return false;
    }

    private String generateCode(String base32Secret, long timeWindow) {
        try {
            byte[] secret = base32.decode(base32Secret);
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(secret, "HmacSHA1"));
            byte[] hash = mac.doFinal(ByteBuffer.allocate(Long.BYTES).putLong(timeWindow).array());
            int offset = hash[hash.length - 1] & 0x0f;
            int binary =
                    ((hash[offset] & 0x7f) << 24)
                            | ((hash[offset + 1] & 0xff) << 16)
                            | ((hash[offset + 2] & 0xff) << 8)
                            | (hash[offset + 3] & 0xff);
            return String.format("%06d", binary % 1_000_000);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("TOTP verification failed", exception);
        }
    }
}
