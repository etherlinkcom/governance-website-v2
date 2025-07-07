CREATE TABLE IF NOT EXISTS `${projectId}.${dataset}.upvotes` (
  id INT64 NOT NULL,
  proposal_id INT64 NOT NULL,
  baker STRING NOT NULL,
  voting_power INT64 NOT NULL,
  time TIMESTAMP NOT NULL,
  PRIMARY KEY(id)
);
CREATE INDEX IF NOT EXISTS idx_upvoter_proposal_id ON `${projectId}.${dataset}.upvotes` (proposal_id);
CREATE INDEX IF NOT EXISTS idx_upvoter_baker ON `${projectId}.${dataset}.upvotes` (baker);