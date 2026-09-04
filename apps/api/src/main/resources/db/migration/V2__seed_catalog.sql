INSERT INTO nail_services (id, slug, name, description, duration_minutes, price_cents, active, created_at, updated_at) VALUES
('b6712d0d-2104-4ab0-a851-878667a0ee01', 'manicure-signature', 'Manicure Signature', 'Preparação cuidada, verniz gel e acabamento de alta precisão.', 60, 3200, TRUE, NOW(), NOW()),
('b6712d0d-2104-4ab0-a851-878667a0ee02', 'gel-natural', 'Gel Natural', 'Estrutura leve e resistente, desenhada à medida da tua unha.', 90, 4400, TRUE, NOW(), NOW()),
('b6712d0d-2104-4ab0-a851-878667a0ee03', 'nail-art-editorial', 'Nail Art Editorial', 'Composição personalizada com detalhe artístico à tua escolha.', 105, 5200, TRUE, NOW(), NOW()),
('b6712d0d-2104-4ab0-a851-878667a0ee04', 'ritual-maos', 'Ritual de Mãos', 'Tratamento restaurador, massagem e manicure sem cor.', 45, 2800, TRUE, NOW(), NOW());

INSERT INTO professionals (id, name, specialty, active, version, created_at, updated_at) VALUES
('a7712d0d-2104-4ab0-a851-878667a0aa01', 'Inês Martins', 'Minimal & gel natural', TRUE, 0, NOW(), NOW()),
('a7712d0d-2104-4ab0-a851-878667a0aa02', 'Marta Lobo', 'Nail art & chrome', TRUE, 0, NOW(), NOW()),
('a7712d0d-2104-4ab0-a851-878667a0aa03', 'Leonor Reis', 'Care & soft gel', TRUE, 0, NOW(), NOW());

INSERT INTO professional_services (professional_id, service_id)
SELECT professional.id, service.id
FROM professionals professional
CROSS JOIN nail_services service;
