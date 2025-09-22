ALTER TABLE votes DROP INDEX unique_vote;

ALTER TABLE votes ADD UNIQUE KEY unique_vote (transaction_hash, baker, proposal_hash);
ALTER TABLE upvotes DROP INDEX unique_upvote;

ALTER TABLE upvotes ADD UNIQUE KEY unique_upvote (transaction_hash, baker, proposal_hash);