package pt.lume.atelier;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.importer.ClassFileImporter;
import org.junit.jupiter.api.Test;

class ArchitectureTest {

    @Test
    void domainDoesNotDependOnPresentationOrApplication() {
        var importedClasses = new ClassFileImporter().importPackages("pt.lume.atelier");
        noClasses()
                .that()
                .resideInAPackage("..domain..")
                .should()
                .dependOnClassesThat()
                .resideInAnyPackage("..presentation..", "..application..", "..infrastructure..")
                .check(importedClasses);
    }
}
