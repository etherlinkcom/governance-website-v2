CREATE TABLE IF NOT EXISTS votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  proposal_hash VARCHAR(255) NOT NULL,
  baker VARCHAR(36) NOT NULL,
  alias VARCHAR(255),
  voting_power BIGINT NOT NULL,
  vote ENUM('yea', 'nay', 'pass') NOT NULL,
  transaction_hash VARCHAR(51) NOT NULL,
  level BIGINT NOT NULL,
  time DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),

  INDEX idx_proposal_hash (proposal_hash),
  INDEX idx_baker (baker),
  INDEX idx_vote (vote),
  INDEX idx_transaction_hash (transaction_hash),
  INDEX idx_level (level),
  UNIQUE KEY unique_vote (transaction_hash)
);