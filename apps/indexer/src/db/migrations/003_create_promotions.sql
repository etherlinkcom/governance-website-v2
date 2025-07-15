CREATE TABLE IF NOT EXISTS promotions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  proposal_hash VARCHAR(100) NOT NULL,
  contract_period_index INT NOT NULL,
  contract_address VARCHAR(100) NOT NULL,
  yea_voting_power BIGINT DEFAULT 0,
  nay_voting_power BIGINT DEFAULT 0,
  pass_voting_power BIGINT DEFAULT 0,
  total_voting_power BIGINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),

  INDEX idx_proposal_hash (proposal_hash),
  INDEX idx_period (contract_period_index),
  INDEX idx_contract_address (contract_address),
  UNIQUE KEY unique_promotion (proposal_hash, contract_period_index)
);