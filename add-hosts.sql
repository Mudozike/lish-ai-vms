INSERT INTO "Host" (id, name, email, department, role, "requiresEscort", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid()::text, 'John Wachira', 'john@lishai.co.ke', 'Executive', 'Director', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Jane Akinyi', 'jane@lishai.co.ke', 'Partnerships', 'Manager', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Peter Maina', 'peter@lishai.co.ke', 'Training', 'Coordinator', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Sarah Chepkemoi', 'sarah@lishai.co.ke', 'Operations', 'Manager', true, NOW(), NOW());
