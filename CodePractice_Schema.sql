-- codepractice.flyway_schema_history definition

CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) DEFAULT NULL,
  `description` varchar(200) NOT NULL,
  `type` varchar(20) NOT NULL,
  `script` varchar(1000) NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- codepractice.users definition

CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `user_role` enum('ADMIN','STUDENT') NOT NULL DEFAULT 'STUDENT',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- codepractice.leaderboard_entries definition

CREATE TABLE `leaderboard_entries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `problems_solved` int NOT NULL DEFAULT '0',
  `total_points` int NOT NULL DEFAULT '0',
  `rank_position` int DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_leaderboard_points` (`total_points`),
  CONSTRAINT `fk_leaderboard_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- codepractice.problems definition

CREATE TABLE `problems` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `difficulty` enum('EASY','MEDIUM','HARD') NOT NULL,
  `topic` varchar(100) DEFAULT NULL,
  `problem_constraints` text,
  `sample_input` longtext,
  `sample_output` longtext,
  `created_by` bigint DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_problems_created_by` (`created_by`),
  KEY `idx_problems_difficulty` (`difficulty`),
  KEY `idx_problems_topic` (`topic`),
  CONSTRAINT `fk_problems_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- codepractice.submissions definition

CREATE TABLE `submissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `problem_id` bigint NOT NULL,
  `programming_language` enum('JAVA','PYTHON','CPP','JAVASCRIPT') NOT NULL,
  `source_code` longtext NOT NULL,
  `submission_status` enum('PENDING','QUEUED','RUNNING','ACCEPTED','WRONG_ANSWER','TIME_LIMIT_EXCEEDED','MEMORY_LIMIT_EXCEEDED','COMPILATION_ERROR','RUNTIME_ERROR','INTERNAL_ERROR') NOT NULL DEFAULT 'PENDING',
  `execution_time_ms` bigint DEFAULT NULL,
  `memory_used_kb` bigint DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_submissions_user` (`user_id`),
  KEY `idx_submissions_problem` (`problem_id`),
  KEY `idx_submissions_user_problem_time` (`user_id`,`problem_id`,`submitted_at`),
  CONSTRAINT `fk_submissions_problem` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_submissions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- codepractice.test_cases definition

CREATE TABLE `test_cases` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `problem_id` bigint NOT NULL,
  `input_data` longtext NOT NULL,
  `expected_output` longtext NOT NULL,
  `is_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `test_case_order` int NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_problem_test_case_order` (`problem_id`,`test_case_order`),
  KEY `idx_test_cases_problem` (`problem_id`),
  CONSTRAINT `fk_test_cases_problem` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- codepractice.submission_results definition

CREATE TABLE `submission_results` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `submission_id` bigint NOT NULL,
  `test_case_id` bigint DEFAULT NULL,
  `result_status` enum('PENDING','PASSED','FAILED','TIME_LIMIT_EXCEEDED','MEMORY_LIMIT_EXCEEDED','COMPILATION_ERROR','RUNTIME_ERROR') NOT NULL DEFAULT 'PENDING',
  `actual_output` longtext,
  `execution_time_ms` bigint DEFAULT NULL,
  `memory_used_kb` bigint DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_submission_test_case` (`submission_id`,`test_case_id`),
  KEY `fk_results_test_case` (`test_case_id`),
  KEY `idx_results_submission` (`submission_id`),
  CONSTRAINT `fk_results_submission` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_results_test_case` FOREIGN KEY (`test_case_id`) REFERENCES `test_cases` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;