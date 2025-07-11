CREATE TABLE IF NOT EXISTS `${projectId}.${dataset}.votes` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tzkt_id INT UNIQUE NOT NULL,
  proposal_hash VARCHAR(100) NOT NULL,
  baker VARCHAR(100) NOT NULL,
  alias VARCHAR(255),
  voting_power BIGINT NOT NULL,
  vote ENUM('yea', 'nay', 'pass') NOT NULL,
  transaction_hash VARCHAR(100) NOT NULL,
  level INT NOT NULL,
  time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_proposal_hash (proposal_hash),
  INDEX idx_baker (baker),
  INDEX idx_vote (vote),
  INDEX idx_transaction_hash (transaction_hash),
  INDEX idx_level (level)
);