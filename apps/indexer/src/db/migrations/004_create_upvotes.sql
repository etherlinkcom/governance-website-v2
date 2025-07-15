CREATE TABLE IF NOT EXISTS upvotes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  level INT NOT NULL,
  time DATETIME NOT NULL,
  transaction_hash VARCHAR(100) NOT NULL,
  proposal_hash VARCHAR(100) NOT NULL,
  baker VARCHAR(100) NOT NULL,
  alias VARCHAR(255),
  voting_power BIGINT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),

  INDEX idx_proposal_hash (proposal_hash),
  INDEX idx_baker (baker),
  INDEX idx_transaction_hash (transaction_hash),
  INDEX idx_level (level),
  UNIQUE KEY unique_upvote (transaction_hash)
);