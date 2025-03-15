SELECT 
        user_id,
        email,
        name,
        password_hash,
        created_at
FROM User 
WHERE email = p_email;
