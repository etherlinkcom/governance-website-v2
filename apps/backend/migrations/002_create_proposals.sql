CREATE TABLE IF NOT EXISTS `${projectId}.${dataset}.proposals` (
  id INT64 NOT NULL,
  key STRING NOT NULL,
  proposer STRING NOT NULL,
  period_id INT64 NOT NULL,
  governance_type STRING NOT NULL,
  status STRING NOT NULL,
  PRIMARY KEY(id)
);
CREATE INDEX IF NOT EXISTS idx_proposal_key ON `${projectId}.${dataset}.proposals` (key);
CREATE INDEX IF NOT EXISTS idx_proposal_proposer ON `${projectId}.${dataset}.proposals` (proposer);
CREATE INDEX IF NOT EXISTS idx_proposal_period_id ON `${projectId}.${dataset}.proposals` (period_id);
CREATE INDEX IF NOT EXISTS idx_proposal_governance_type ON `${projectId}.${dataset}.proposals` (governance_type);