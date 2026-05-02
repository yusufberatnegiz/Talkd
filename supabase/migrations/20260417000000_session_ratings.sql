-- Superseded by the core schema migration.
--
-- This migration originally created a partial session_ratings table that
-- referenced profiles before profiles existed in migrations. Keep this file
-- intentionally harmless so clean database resets can continue to the
-- complete Talkd schema migration.
create extension if not exists pgcrypto;
