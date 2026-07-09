INSERT INTO user (username, password, salt)
VALUES 
('testing', 'testing', 'test_salt_value'),
('other', 'pbkdf2:sha256:50000$kJPKsz6N$d2d4784f1b030a9761f5ccaeeaca413f27f2ecb76d6168407af962ddce849f79', 'other_salt_value');

-- INSERT INTO post (title, body, author_id, created)
-- VALUES 
-- ('test title', 'test'|| x'0a' || 'body', 1, '2018-01-01 00:00:00');