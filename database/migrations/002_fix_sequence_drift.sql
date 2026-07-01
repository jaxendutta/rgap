-- database/migrations/002_fix_sequence_drift.sql
--
-- The institutes, recipients, and grants SERIAL sequences are far behind the
-- actual max id in each table (e.g. recipients' sequence was at 1 while the
-- highest real recipient_id was 144,299) -- almost certainly left over from
-- however the original dataset was bulk-loaded into Postgres with explicit
-- id values, which doesn't advance the sequence. Left alone, the very first
-- unattended insert into any of these tables fails with a unique-violation
-- as soon as the sequence produces an id that already exists.
--
-- Safe to run repeatedly: setval to the current max is a no-op once caught up.
SELECT setval('institutes_institute_id_seq', (SELECT COALESCE(MAX(institute_id), 1) FROM institutes));
SELECT setval('recipients_recipient_id_seq', (SELECT COALESCE(MAX(recipient_id), 1) FROM recipients));
SELECT setval('programs_prog_id_seq', (SELECT COALESCE(MAX(prog_id), 1) FROM programs));
SELECT setval('grants_grant_id_seq', (SELECT COALESCE(MAX(grant_id), 1) FROM grants));
