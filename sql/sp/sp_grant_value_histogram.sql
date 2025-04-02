DELIMITER $$

CREATE PROCEDURE sp_grant_value_histogram(
    IN p_bins INT
)
BEGIN
    DECLARE v_avg DECIMAL(15,2);
    DECLARE v_std DECIMAL(15,2);
    DECLARE v_max DECIMAL(15,2);
    DECLARE v_bin_size DECIMAL(15,2);
    DECLARE v_upper_threshold DECIMAL(15,2);
    DECLARE v_lower_threshold DECIMAL(15,2);

    -- Calculate overall average and standard deviation for grant values
    SELECT AVG(agreement_value), STDDEV_POP(agreement_value)
      INTO v_avg, v_std
    FROM ResearchGrant;

    -- Get maximum grant value to define bin size
    SELECT MAX(agreement_value)
      INTO v_max
    FROM ResearchGrant;

    -- Calculate bin size (if p_bins=0, default to 10)
    IF p_bins <= 0 THEN
      SET p_bins = 10;
    END IF;
    SET v_bin_size = v_max / p_bins;
    
    -- Define thresholds for outliers: more than 2 std deviations away from the mean
    SET v_upper_threshold = v_avg + 2 * v_std;
    SET v_lower_threshold = v_avg - 2 * v_std;
    
    -- Return histogram: each bin is defined by a range and a count,
    -- and is flagged as outlier if its range falls entirely above v_upper_threshold or below v_lower_threshold.
    SELECT 
      CONCAT(FORMAT(bin * v_bin_size, 2), " - ", FORMAT((bin + 1) * v_bin_size, 2)) AS bin_range,
      COUNT(*) AS bin_count,
      CASE
        WHEN ((bin + 1) * v_bin_size) <= v_lower_threshold OR (bin * v_bin_size) >= v_upper_threshold THEN 1
        ELSE 0
      END AS is_outlier_bin
    FROM (
      SELECT FLOOR(agreement_value / v_bin_size) AS bin
      FROM ResearchGrant
    ) AS t
    GROUP BY bin
    ORDER BY bin;
END $$
DELIMITER ;
