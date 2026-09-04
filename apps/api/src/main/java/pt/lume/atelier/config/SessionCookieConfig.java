package pt.lume.atelier.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;

@Configuration
public class SessionCookieConfig {

    @Bean
    CookieSerializer cookieSerializer(
            @Value("${server.servlet.session.cookie.secure:true}") boolean secureCookies,
            AppProperties properties) {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setCookieName("LUME_SESSION");
        serializer.setCookiePath("/");
        serializer.setUseHttpOnlyCookie(true);
        serializer.setUseSecureCookie(secureCookies);
        serializer.setSameSite("Lax");
        serializer.setCookieMaxAge(properties.security().login().rememberedSessionSeconds());
        return serializer;
    }
}
