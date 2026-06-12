-- 校园失物招领与互助平台 数据库初始化脚本
-- ============================================
CREATE DATABASE IF NOT EXISTS lostfound DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lostfound;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(30) NOT NULL COMMENT '用户名',
  `password` varchar(100) NOT NULL COMMENT '密码(bcrypt)',
  `nickname` varchar(30) DEFAULT NULL COMMENT '昵称',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `avatar` varchar(200) DEFAULT NULL COMMENT '头像URL',
  `role` tinyint NOT NULL DEFAULT 0 COMMENT '0普通用户 1管理员',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE `lost_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(100) NOT NULL,
  `category` varchar(20) NOT NULL,
  `description` text,
  `image_url` varchar(200) DEFAULT NULL,
  `lost_place` varchar(100) DEFAULT NULL,
  `lost_time` datetime DEFAULT NULL,
  `contact_info` varchar(100) DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT 0 COMMENT '0未找到 1已找到',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='失物表';

CREATE TABLE `found_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(100) NOT NULL,
  `category` varchar(20) NOT NULL,
  `description` text,
  `image_url` varchar(200) DEFAULT NULL,
  `found_place` varchar(100) DEFAULT NULL,
  `found_time` datetime DEFAULT NULL,
  `contact_info` varchar(100) DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT 0 COMMENT '0待认领 1已认领',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='招领表';

CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `from_user_id` int NOT NULL,
  `to_user_id` int NOT NULL,
  `item_id` int DEFAULT NULL,
  `item_type` varchar(10) DEFAULT NULL,
  `message` varchar(200) NOT NULL,
  `is_read` tinyint NOT NULL DEFAULT 0 COMMENT '0未读 1已读',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_to_user` (`to_user_id`),
  KEY `idx_is_read` (`to_user_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知表';

INSERT INTO `users` (`username`, `password`, `nickname`, `role`) VALUES
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '系统管理员', 1);
