package pt.lume.atelier;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@ConfigurationPropertiesScan
@EnableAsync
public class LumeApiApplication {

    public static void main(String[] arguments) {
        SpringApplication.run(LumeApiApplication.class, arguments);
    }
}
