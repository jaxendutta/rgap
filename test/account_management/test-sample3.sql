UPDATE User
    SET email = "", name = ""
    WHERE user_id = 5;
    
    -- Return the updated user row so that we can get the API to update the context
    SELECT user_id, email, name, created_at FROM User WHERE user_id = 5;