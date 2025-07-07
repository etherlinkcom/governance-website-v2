CREATE TABLE IF NOT EXISTS `${projectId}.${dataset}.votes` (
  id INT64 NOT NULL,
  promotion_id INT64 NOT NULL,
  baker STRING NOT NULL,
  voting_power INT64 NOT NULL,
  vote STRING NOT NULL,
  time TIMESTAMP NOT NULL,
  PRIMARY KEY(id)
);
CREATE INDEX IF NOT EXISTS idx_voter_promotion_id ON `${projectId}.${dataset}` (promotion_id);
CREATE INDEX IF NOT EXISTS idx_voter_baker ON `${projectId}.${dataset}` (baker);