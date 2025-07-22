CREATE TABLE IF NOT EXISTS periods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contract_voting_index INT NOT NULL,
  contract_address VARCHAR(36) NOT NULL,
  level_start BIGINT NOT NULL,
  level_end BIGINT NOT NULL,
  date_start DATETIME NOT NULL,
  date_end DATETIME NOT NULL,
  proposal_hashes JSON,
  promotion_hash VARCHAR(255),
  max_upvotes_voting_power BIGINT NOT NULL,
  total_voting_power BIGINT NOT NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),

  INDEX idx_contract_voting (contract_voting_index),
  INDEX idx_contract_address (contract_address),
  INDEX idx_levels (level_start, level_end),
  UNIQUE KEY unique_period (contract_voting_index, contract_address)
);