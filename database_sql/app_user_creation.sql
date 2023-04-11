-- Insert sample data
INSERT INTO user (email, password) VALUES ("system", NULL); -- future use
INSERT INTO user (email, password, is_admin) VALUES ("trunews", "pbkdf2:sha256:260000$fstVNUjfKcKNVoH4$35cf1b3d453e80440b63cd09560d570d87606cbcf0ce3d38504c520d289add1e", 1);