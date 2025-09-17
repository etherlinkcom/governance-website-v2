CREATE TABLE IF NOT EXISTS proposals (
  -- TODO remove upvotes from here
  id INT AUTO_INCREMENT PRIMARY KEY,
  contract_period_index INT NOT NULL,
  level BIGINT NOT NULL,
  time DATETIME NOT NULL,
  proposal_hash VARCHAR(255) NOT NULL,
  transaction_hash VARCHAR(51) NOT NULL,
  contract_address VARCHAR(36) NOT NULL,
  proposer VARCHAR(36) NOT NULL,
  alias VARCHAR(255),
  upvotes BIGINT DEFAULT 0,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),

  INDEX idx_period (contract_period_index),
  INDEX idx_proposal_hash (proposal_hash),
  INDEX idx_contract_address (contract_address),
  INDEX idx_proposer (proposer),
  INDEX idx_transaction_hash (transaction_hash),
  UNIQUE KEY unique_proposal (transaction_hash)
);