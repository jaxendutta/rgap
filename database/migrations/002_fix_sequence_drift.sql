-- database/migrations/002_fix_sequence_drift.sql
--
-- Keeps the institutes/recipients/programs/grants SERIAL sequences in sync
-- with the actual max id in each table. Originally written for sequences
-- that had drifted behind existing data (e.g. recipients' sequence was at 1
-- while the highest real recipient_id was 144,299, left over from however
-- the dataset was first bulk-loaded); also runs every month against a
-- freshly truncated (empty) table as part of the reload pipeline.
--
-- Must use the 3-argument setval(seq, value, is_called) form, not the
-- 2-argument one: setval(seq, value) is shorthand for is_called = true,
-- which marks `value` itself as already consumed -- correct when there's
-- real data (next insert should get max+1), but wrong on an empty table,
-- where it permanently burns id 1 before the first real row is ever
-- inserted (is_called = true on 1 means the NEXT nextval() returns 2).
-- is_called must be false exactly when the table is empty, so nextval()
-- returns the seed value itself instead of skipping past it.
--
-- Safe to run repeatedly: setval to the current max is a no-op once caught up.
SELECT setval('institutes_institute_id_seq',
    COALESCE((SELECT MAX(institute_id) FROM institutes), 1),
    (SELECT MAX(institute_id) FROM institutes) IS NOT NULL);
SELECT setval('recipients_recipient_id_seq',
    COALESCE((SELECT MAX(recipient_id) FROM recipients), 1),
    (SELECT MAX(recipient_id) FROM recipients) IS NOT NULL);
SELECT setval('programs_prog_id_seq',
    COALESCE((SELECT MAX(prog_id) FROM programs), 1),
    (SELECT MAX(prog_id) FROM programs) IS NOT NULL);
SELECT setval('grants_grant_id_seq',
    COALESCE((SELECT MAX(grant_id) FROM grants), 1),
    (SELECT MAX(grant_id) FROM grants) IS NOT NULL);
