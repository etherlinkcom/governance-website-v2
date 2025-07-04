CREATE TABLE IF NOT EXISTS `${projectId}.${dataset}.migrations` (
  id INT64 NOT NULL,
  name STRING NOT NULL,
  applied_at TIMESTAMP NOT NULL
);