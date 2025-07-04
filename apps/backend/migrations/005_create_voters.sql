CREATE TABLE IF NOT EXISTS `${projectId}.${dataset}.voters` (
  id INT64 NOT NULL,
  promotion_id INT64 NOT NULL,
  baker STRING NOT NULL,
  voting_power INT64 NOT NULL,
  vote STRING NOT NULL,
  time TIMESTAMP NOT NULL,
  PRIMARY KEY(id)
);
CREATE INDEX IF NOT EXISTS idx_voter_promotion_id ON `your_project.your_dataset.voters` (promotion_id);
CREATE INDEX IF NOT EXISTS idx_voter_baker ON `your_project.your_dataset.voters` (baker);