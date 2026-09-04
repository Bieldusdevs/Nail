package pt.lume.atelier.security;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;
import pt.lume.atelier.config.AppProperties;

@Component
public class MfaSecretCipher {

    private static final int IV_LENGTH = 12;
    private static final int TAG_LENGTH = 128;
    private final SecureRandom secureRandom = new SecureRandom();
    private final byte[] encryptionKey;

    public MfaSecretCipher(AppProperties properties) {
        String configuredKey = properties.security().mfaEncryptionKey();
        this.encryptionKey =
                configuredKey == null || configuredKey.isBlank()
                        ? new byte[0]
                        : Base64.getDecoder().decode(configuredKey);
    }

    public String encrypt(String plaintext) {
        requireConfiguredKey();
        try {
            byte[] iv = new byte[IV_LENGTH];
            secureRandom.nextBytes(iv);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(
                    Cipher.ENCRYPT_MODE,
                    new SecretKeySpec(encryptionKey, "AES"),
                    new GCMParameterSpec(TAG_LENGTH, iv));
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder()
                    .encodeToString(
                            ByteBuffer.allocate(iv.length + ciphertext.length)
                                    .put(iv)
                                    .put(ciphertext)
                                    .array());
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("MFA secret encryption failed", exception);
        }
    }

    public String decrypt(String encodedCiphertext) {
        requireConfiguredKey();
        try {
            byte[] payload = Base64.getDecoder().decode(encodedCiphertext);
            ByteBuffer buffer = ByteBuffer.wrap(payload);
            byte[] iv = new byte[IV_LENGTH];
            buffer.get(iv);
            byte[] ciphertext = new byte[buffer.remaining()];
            buffer.get(ciphertext);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(
                    Cipher.DECRYPT_MODE,
                    new SecretKeySpec(encryptionKey, "AES"),
                    new GCMParameterSpec(TAG_LENGTH, iv));
            return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | RuntimeException exception) {
            throw new IllegalStateException("MFA secret decryption failed", exception);
        }
    }

    private void requireConfiguredKey() {
        if (encryptionKey.length != 32) {
            throw new IllegalStateException("MFA_ENCRYPTION_KEY must decode to 32 bytes");
        }
    }
}
