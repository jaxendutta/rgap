UPDATE User
    SET password_hash = ''
    WHERE user_id = 3;
    
    SELECT user_id FROM User WHERE user_id = 3;