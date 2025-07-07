CREATE TABLE IF NOT EXISTS `${projectId}.${dataset}.promotions` (
  id INT64 NOT NULL,
  proposal_id INT64 NOT NULL,
  period_id INT64 NOT NULL,
  governance_type STRING NOT NULL,
  PRIMARY KEY(id)
);
CREATE INDEX IF NOT EXISTS idx_promotion_proposal_id ON `${projectId}.${dataset}.promotions` (proposal_id);
CREATE INDEX IF NOT EXISTS idx_promotion_period_id ON `${projectId}.${dataset}.promotions` (period_id);
CREATE INDEX IF NOT EXISTS idx_promotion_governance_type ON `${projectId}.${dataset}.promotions` (governance_type);