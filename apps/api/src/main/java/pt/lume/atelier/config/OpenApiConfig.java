package pt.lume.atelier.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI lumeOpenApi() {
        return new OpenAPI()
                .info(
                        new Info()
                                .title("Lume Atelier API")
                                .version("v1")
                                .description(
                                        "API de marcações, conta e administração do Lume Atelier."))
                .components(
                        new Components()
                                .addSecuritySchemes(
                                        "sessionCookie",
                                        new SecurityScheme()
                                                .type(SecurityScheme.Type.APIKEY)
                                                .in(SecurityScheme.In.COOKIE)
                                                .name("LUME_SESSION")));
    }
}
