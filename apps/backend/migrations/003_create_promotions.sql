CREATE TABLE IF NOT EXISTS `${projectId}.${dataset}.promotions` (
  id INT64 NOT NULL,
  proposal_id INT64 NOT NULL,
  period_id INT64 NOT NULL,
  governance_type STRING NOT NULL,
  PRIMARY KEY(id)
);
CREATE INDEX IF NOT EXISTS idx_promotion_proposal_id ON `your_project.your_dataset.promotions` (proposal_id);
CREATE INDEX IF NOT EXISTS idx_promotion_period_id ON `your_project.your_dataset.promotions` (period_id);
CREATE INDEX IF NOT EXISTS idx_promotion_governance_type ON `your_project.your_dataset.promotions` (governance_type);