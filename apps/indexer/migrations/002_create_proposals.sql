CREATE TABLE IF NOT EXISTS `${projectId}.${dataset}.proposals` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contract_period_index INT NOT NULL,
  level INT NOT NULL,
  time TIMESTAMP NOT NULL,
  proposal_hash VARCHAR(100) NOT NULL,
  transaction_hash VARCHAR(100) NOT NULL,
  contract_address VARCHAR(100) NOT NULL,
  proposer VARCHAR(100) NOT NULL,
  alias VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_period (contract_period_index),
  INDEX idx_proposal_hash (proposal_hash),
  INDEX idx_contract_address (contract_address),
  INDEX idx_proposer (proposer),
  INDEX idx_transaction_hash (transaction_hash)
);