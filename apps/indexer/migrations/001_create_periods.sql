CREATE TABLE IF NOT EXISTS `${projectId}.${dataset}.periods` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contract_voting_index INT NOT NULL,
  governance_type ENUM('fast', 'slow', 'sequencer') NOT NULL,
  contract_address VARCHAR(100) NOT NULL,
  level_start INT NOT NULL,
  level_end INT NOT NULL,
  date_start TIMESTAMP NOT NULL,
  date_end TIMESTAMP NOT NULL,
  proposal_hashes JSON,
  promotion_hash VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_contract_voting (contract_voting_index),
  INDEX idx_governance_type (governance_type),
  INDEX idx_contract_address (contract_address),
  INDEX idx_levels (level_start, level_end)
);