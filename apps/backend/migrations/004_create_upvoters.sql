CREATE TABLE IF NOT EXISTS `${projectId}.${dataset}.upvoters` (
  id INT64 NOT NULL,
  proposal_id INT64 NOT NULL,
  baker STRING NOT NULL,
  voting_power INT64 NOT NULL,
  time TIMESTAMP NOT NULL,
  PRIMARY KEY(id)
);
CREATE INDEX IF NOT EXISTS idx_upvoter_proposal_id ON `your_project.your_dataset.upvoters` (proposal_id);
CREATE INDEX IF NOT EXISTS idx_upvoter_baker ON `your_project.your_dataset.upvoters` (baker);