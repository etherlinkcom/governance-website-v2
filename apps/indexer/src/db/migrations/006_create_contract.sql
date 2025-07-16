CREATE TABLE IF NOT EXISTS contracts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contract_address VARCHAR(100) NOT NULL UNIQUE,
  governance_type ENUM('slow', 'fast', 'sequencer') NOT NULL,
  started_at_level INT NOT NULL,
  period_length INT NOT NULL,
  adoption_period_sec INT NOT NULL,
  upvoting_limit INT NOT NULL,
  scale INT NOT NULL,
  proposal_quorum INT NOT NULL,
  promotion_quorum INT NOT NULL,
  promotion_supermajority INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),

  INDEX idx_contract_address (contract_address),
  INDEX idx_governance_type (governance_type),
  INDEX idx_started_at_level (started_at_level)
);